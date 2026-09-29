import { createHash, randomUUID } from "node:crypto";

import QRCode from "qrcode";

import { sequelize } from "../../database/database.js";
import {
  AuthenticatedUser,
  isSuperAdmin,
  resolveBuildingScope,
} from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import { Unit } from "../units/unit.model.js";
import { ACCESS_EVENT_TYPE, ACCESS_METHOD } from "./access-event.model.js";
import { AccessRepository } from "./access.repository.js";
import { CreateVisitDto } from "./create-visit.dto.js";

const UUID_FORMAT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VISITOR_DOCUMENT_TYPE = "DNI";

const FORBIDDEN_MESSAGE =
  "No tiene permisos para autorizar visitas en esta unidad";

// El pase vale desde la fecha/hora estimada
const VISIT_DEFAULT_WINDOW_MINUTES = 60;

// Estados de la autorizacion: el ingreso la deja en READ.
const AUTHORIZATION_STATUS_READ = "READ";

const FORBIDDEN_ACCESS_MESSAGE =
  "No tiene permisos para operar sobre los accesos de este edificio";
const AUTHORIZATION_NOT_FOUND_MESSAGE =
  "El QR no corresponde a ninguna autorizacion de visita";
const AUTHORIZATION_EXPIRED_MESSAGE =
  "La autorizacion esta vencida y no admite el ingreso";
const ACCESS_NOT_FOUND_MESSAGE = "Autorizacion no encontrada";
const WITHOUT_ENTRY_MESSAGE =
  "No existe un ingreso registrado para esta autorizacion";
const DUPLICATE_EXIT_MESSAGE =
  "La salida de esta autorizacion ya fue registrada";

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
        // El QR se genera con la libreria qrcode y representa el token original.
        // Viaja en la respuesta; nunca se almacena en BD.
        qrImage: await QRCode.toDataURL(qrToken),
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

  /**
   * Alcance de porteria: SUPER_ADMIN mantiene alcance global y el resto se
   * limita a los edificios de sus roles, usando la misma logica que
   * authorizeBuildingParam para no duplicar reglas de autorizacion.
   */
  private assertBuildingScope(buildingId: string, actor: AuthenticatedUser) {
    if (isSuperAdmin(actor)) {
      return;
    }

    const scope = resolveBuildingScope(actor);

    if (!scope || !scope.includes(buildingId)) {
      throw new AppError(FORBIDDEN_ACCESS_MESSAGE, 403);
    }
  }

  // CT-S4-02: el QR habilita el ingreso. Hashea el token recibido, resuelve la
  // autorizacion y, si sigue vigente y dentro del alcance del usuario, deja
  // el evento ENTRY y pasa la autorizacion a READ.
  async validateQr(qrToken: string, actor: AuthenticatedUser) {
    return sequelize.transaction(async (transaction) => {
      const authorization = await this.repository.findAuthorizationByHash(
        hashQrToken(qrToken),
        transaction,
      );

      if (!authorization) {
        throw new AppError(AUTHORIZATION_NOT_FOUND_MESSAGE, 400);
      }

      this.assertBuildingScope(authorization.buildingId, actor);

      if (
        authorization.validUntil &&
        authorization.validUntil.getTime() <= Date.now()
      ) {
        throw new AppError(AUTHORIZATION_EXPIRED_MESSAGE, 400);
      }

      const event = await this.repository.createEvent(
        {
          buildingId: authorization.buildingId,
          unitId: authorization.unitId,
          visitorId: authorization.visitorId,
          authorizationId: authorization.id,
          registeredByUserId: actor.id,
          eventType: ACCESS_EVENT_TYPE.ENTRY,
          accessMethod: ACCESS_METHOD.QR,
          occurredAt: new Date(),
        },
        transaction,
      );

      await authorization.update(
        { status: AUTHORIZATION_STATUS_READ },
        { transaction },
      );

      return {
        id: authorization.id,
        status: authorization.status,
        validFrom: authorization.validFrom,
        validUntil: authorization.validUntil,
        visitor: {
          id: authorization.visitor.id,
          firstName: authorization.visitor.firstName,
          lastName: authorization.visitor.lastName,
          documentType: authorization.visitor.documentType,
          documentNumber: authorization.visitor.documentNumber,
        },
        unit: {
          id: authorization.unit.id,
          code: authorization.unit.code,
        },
        event: {
          id: event.id,
          eventType: event.eventType,
          accessMethod: event.accessMethod,
          occurredAt: event.occurredAt,
        },
      };
    });
  }

  // CT-S4-02: busqueda manual por DNI o apellido, acotada al alcance del usuario.
  async search(query: string, actor: AuthenticatedUser) {
    const matches = await this.repository.searchAuthorizations(
      query,
      resolveBuildingScope(actor),
      new Date(),
    );

    // Proyeccion explicita: la autorizacion nunca expone qr_token_hash.
    return matches.map((match) => ({
      id: match.id,
      status: match.status,
      validFrom: match.validFrom,
      validUntil: match.validUntil,
      visitor: {
        id: match.visitor.id,
        firstName: match.visitor.firstName,
        lastName: match.visitor.lastName,
        documentType: match.visitor.documentType,
        documentNumber: match.visitor.documentNumber,
      },
      unit: {
        id: match.unit.id,
        code: match.unit.code,
      },
      building: {
        id: match.building.id,
        name: match.building.name,
      },
    }));
  }

  // CT-S4-02: la salida la anota la porteria, no el visitante, por eso
  // access_method = MANUAL. Exige un ENTRY previo y no admite duplicados.
  async registerExit(authorizationId: string, actor: AuthenticatedUser) {
    if (!UUID_FORMAT.test(authorizationId)) {
      throw new AppError(
        "El identificador de la autorizacion debe ser un UUID valido",
        400,
      );
    }

    return sequelize.transaction(async (transaction) => {
      const authorization = await this.repository.findAuthorizationById(
        authorizationId,
        transaction,
      );

      if (!authorization) {
        throw new AppError(ACCESS_NOT_FOUND_MESSAGE, 404);
      }

      this.assertBuildingScope(authorization.buildingId, actor);

      const entry = await this.repository.findEventByAuthorization(
        authorization.id,
        ACCESS_EVENT_TYPE.ENTRY,
        transaction,
      );

      if (!entry) {
        throw new AppError(WITHOUT_ENTRY_MESSAGE, 400);
      }

      const previousExit = await this.repository.findEventByAuthorization(
        authorization.id,
        ACCESS_EVENT_TYPE.EXIT,
        transaction,
      );

      if (previousExit) {
        throw new AppError(DUPLICATE_EXIT_MESSAGE, 400);
      }

      const event = await this.repository.createEvent(
        {
          buildingId: authorization.buildingId,
          unitId: authorization.unitId,
          visitorId: authorization.visitorId,
          authorizationId: authorization.id,
          registeredByUserId: actor.id,
          eventType: ACCESS_EVENT_TYPE.EXIT,
          accessMethod: ACCESS_METHOD.MANUAL,
          occurredAt: new Date(),
        },
        transaction,
      );

      return {
        id: authorization.id,
        status: authorization.status,
        visitor: {
          id: authorization.visitor.id,
          firstName: authorization.visitor.firstName,
          lastName: authorization.visitor.lastName,
          documentType: authorization.visitor.documentType,
          documentNumber: authorization.visitor.documentNumber,
        },
        unit: {
          id: authorization.unit.id,
          code: authorization.unit.code,
        },
        event: {
          id: event.id,
          eventType: event.eventType,
          accessMethod: event.accessMethod,
          occurredAt: event.occurredAt,
        },
      };
    });
  }
}
