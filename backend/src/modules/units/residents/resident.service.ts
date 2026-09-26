import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../../database/database.js";
import AppError from "../../../utils/AppError.js";
import { AuditLog } from "../../audit/audit.model.js";
import { UnitPeople } from "../../unit-people/unit-people.model.js";
import { Unit } from "../unit.model.js";
import {
  RESIDENT_RELATIONSHIP_TYPE,
  ResidentRepository,
} from "./resident.repository.js";

export interface ResidentView {
  unitId: string;
  personId: string;
  userId: string | null;
  fullName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  relationshipType: string;
  startDate: Date | null;
  endDate: Date | null;
}

type ResidentLink = UnitPeople & { get: (key: string) => unknown };

/** Mapeo unico para POST y GET: ambos exponen la misma vista de un residente. */
function toResidentView(link: ResidentLink): ResidentView {
  const person = link.get("person") as
    | {
        firstName: string;
        lastName: string;
        email: string | null;
        get: (key: "user") => { id: string; email: string } | null;
      }
    | null
    | undefined;

  const user = person?.get("user") ?? null;
  const firstName = person?.firstName ?? null;
  const lastName = person?.lastName ?? null;
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    unitId: link.unitId,
    personId: link.personId,
    userId: user?.id ?? null,
    fullName: fullName.length > 0 ? fullName : null,
    // el email de contacto es el de la persona; si no tiene, el de su cuenta
    email: person?.email ?? user?.email ?? null,
    firstName,
    lastName,
    relationshipType: link.relationshipType,
    startDate: link.startDate,
    endDate: link.endDate,
  };
}

export class ResidentService {
  constructor(private readonly repository: ResidentRepository) {}

  async link(unitId: string, email: string, performedBy: string) {
    const unit = await Unit.findByPk(unitId);

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const personId = user.personId;

    if (!personId) {
      throw new AppError("El usuario no tiene una persona asociada", 409);
    }

    const existingLink = await this.repository.findActiveLink(unitId, personId);

    if (existingLink) {
      throw new AppError("El usuario ya está vinculado a esta unidad", 409);
    }

    const residentRole = await this.repository.findResidentRole();

    if (!residentRole) {
      throw new AppError("El rol RESIDENT no está configurado", 500);
    }

    try {
      const link = await sequelize.transaction(async (transaction) => {
        const newLink = await this.repository.createLink(
          unitId,
          personId,
          transaction,
        );

        const existingRole = await this.repository.findUserRole(
          user.id,
          unit.buildingId,
          residentRole.id,
          transaction,
        );

        if (!existingRole) {
          await this.repository.createUserRole(
            user.id,
            unit.buildingId,
            residentRole.id,
            transaction,
          );
        }

        await AuditLog.create(
          {
            buildingId: unit.buildingId,
            unitId,
            performedBy,
            action: "RESIDENT_LINKED",
            tableName: "unit_people",
            recordId: newLink.id,
            oldValues: null,
            newValues: {
              userId: user.id,
              personId,
              unitId,
              relationshipType: RESIDENT_RELATIONSHIP_TYPE,
            },
            ipAddress: null,
          },
          { transaction },
        );

        return newLink;
      });

      return toResidentView(link);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const constraint = (error.parent as { constraint?: string } | undefined)
          ?.constraint;

        if (constraint === "unit_people_active_unique") {
          throw new AppError("El usuario ya está vinculado a esta unidad", 409);
        }
      }

      throw error;
    }
  }

  async list(unitId: string) {
    const links = await this.repository.listActive(unitId);

    return links.map((link) => toResidentView(link as ResidentLink));
  }
}
