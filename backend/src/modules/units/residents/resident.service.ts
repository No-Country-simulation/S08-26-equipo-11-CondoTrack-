import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../../database/database.js";
import AppError from "../../../utils/AppError.js";
import { AuditLog } from "../../audit/audit.model.js";
import { Unit } from "../unit.model.js";
import { ResidentRepository } from "./resident.repository.js";

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
              relationshipType: "RESIDENT",
            },
            ipAddress: null,
          },
          { transaction },
        );

        return newLink;
      });

      return {
        unitId: link.unitId,
        userId: user.id,
        personId: link.personId,
        relationshipType: link.relationshipType,
        startDate: link.startDate,
        endDate: link.endDate,
      };
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

    return links.map((link) => {
      const person = link.get("person") as
        | {
            id: string;
            firstName: string;
            lastName: string;
            get(key: "user"): { id: string; email: string } | null;
          }
        | undefined;

      const user = person?.get("user") ?? null;

      return {
        unitId: link.unitId,
        personId: link.personId,
        userId: user?.id ?? null,
        email: user?.email ?? null,
        firstName: person?.firstName ?? null,
        lastName: person?.lastName ?? null,
        relationshipType: link.relationshipType,
        startDate: link.startDate,
        endDate: link.endDate,
      };
    });
  }
}
