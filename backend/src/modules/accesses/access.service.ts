import { createHash, randomUUID } from "node:crypto";

import { sequelize } from "../../database/database.js";
import { AuthenticatedUser } from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import { Unit } from "../units/unit.model.js";
import { AccessRepository } from "./access.repository.js";
import { CreateVisitDto } from "./create-visit.dto.js";

const UUID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VISITOR_DOCUMENT_TYPE = "DNI";

const FORBIDDEN_MESSAGE =
  "No tiene permisos para autorizar visitas en esta unidad";

// El pase vale desde la fecha/hora estimada
const VISIT_DEFAULT_WINDOW_MINUTES = 60;

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

// El token viaja al cliente en claro y en BD solo queda su hash SHA-256
export function hashQrToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class AccessService {
  constructor(private readonly repository: AccessRepository) {}

  async createVisit(
    unitId: string,
    dto: CreateVisitDto,
    actor: AuthenticatedUser,
  ) {
    if (!UUID_FORMAT.test(unitId)) {
      throw new AppError(
        "El identificador de la unidad debe ser un UUID válido",
        400,
      );
    }

    const unit = await this.repository.findUnitById(unitId);

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    if (!(await this.canCreate(unit, actor))) {
      throw new AppError(FORBIDDEN_MESSAGE, 403);
    }

    return sequelize.transaction(async (transaction) => {
      const visitor = await this.repository.findOrCreateVisitor(
        {
          ...splitName(dto.visitorName),
          documentType: VISITOR_DOCUMENT_TYPE,
          documentNumber: dto.visitorDni,
        },
        transaction,
      );

      // building_id se deriva de la unidad; el cliente nunca lo aporta.
      const validFrom = dto.estimatedAt;
      const validUntil = new Date(
        validFrom.getTime() + VISIT_DEFAULT_WINDOW_MINUTES * 60_000,
      );

      const qrToken = randomUUID();

      const authorization = await this.repository.createAuthorization(
        {
          buildingId: unit.buildingId,
          unitId: unit.id,
          visitorId: visitor.id,
          authorizedByUserId: actor.id,
          validFrom,
          validUntil,
          status: "PENDING",
          qrTokenHash: hashQrToken(qrToken),
        },
        transaction,
      );

      return {
        id: authorization.id,
        qrToken,
        // alias de compatibilidad con el contrato de CT-S4-01: contiene el token, no el hash guardado en db.
        qrTokenHash: qrToken,
        status: authorization.status,
        validFrom: authorization.validFrom,
        validUntil: authorization.validUntil,
        buildingId: authorization.buildingId,
        unit: {
          id: unit.id,
          code: unit.code,
        },
        authorizedByUserId: authorization.authorizedByUserId,
        visitor: {
          id: visitor.id,
          firstName: visitor.firstName,
          lastName: visitor.lastName,
          documentType: visitor.documentType,
          documentNumber: visitor.documentNumber,
        },
        createdAt: authorization.createdAt,
      };
    });
  }

  // Unica regla de acceso al endpoint: SUPER_ADMIN global, ADMIN solo de su edificio y RESIDENT con vinculo activo a esa unidad via unit_people
  private async canCreate(unit: Unit, actor: AuthenticatedUser) {
    if (actor.roles.some((role) => role.roleName === "SUPER_ADMIN")) {
      return true;
    }

    if (
      actor.roles.some(
        (role) =>
          role.roleName === "ADMIN" && role.buildingId === unit.buildingId,
      )
    ) {
      return true;
    }

    const user = await this.repository.findUserIdentity(actor.id);

    if (!user?.personId) {
      return false;
    }

    return Boolean(
      await this.repository.findActiveResidentLink(unit.id, user.personId),
    );
  }
}
