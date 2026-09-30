import {
  AuthenticatedUser,
  isSuperAdmin,
} from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import {
  CreateIncidentDto,
  ListIncidentsDto,
  UpdateIncidentDto,
} from "./incident.dto.js";
import { IncidentRepository } from "./incident.repository.js";

const canManageBuilding = (actor: AuthenticatedUser, buildingId: string) =>
  isSuperAdmin(actor) ||
  actor.roles.some(
    (role) => role.buildingId === buildingId && role.roleName === "ADMIN",
  );

const isResidentOfUnit = (actor: AuthenticatedUser, unitId: string) => {
  return actor.roles.some(
    (role) => role.roleName === "RESIDENT" && role.buildingId !== null,
  );
};

export class IncidentService {
  constructor(private readonly repository: IncidentRepository) {}

  async create(
    unitId: string,
    dto: CreateIncidentDto,
    actor: AuthenticatedUser,
  ) {
    const unit = await this.repository.findUnit(unitId);

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    if (!unit.isActive) {
      throw new AppError("La unidad está inactiva", 400);
    }

    const canManage = canManageBuilding(actor, unit.buildingId);

    if (canManage) {
      return this.repository.create(unit, dto, actor.id);
    }

    const residentRole = actor.roles.find(
      (role) =>
        role.roleName === "RESIDENT" && role.buildingId === unit.buildingId,
    );

    if (!residentRole) {
      throw new AppError(
        "No tiene permisos para reportar incidentes en esta unidad",
        403,
      );
    }

    const user = await this.repository.findUser(actor.id);

    if (!user?.personId) {
      throw new AppError("El usuario no tiene una persona asociada", 403);
    }

    const activeUnitPerson = await this.repository.findActiveUnitPerson(
      unit.id,
      user.personId,
      new Date(),
    );

    if (!activeUnitPerson) {
      throw new AppError("No está vinculado a esta unidad", 403);
    }

    return this.repository.create(unit, dto, actor.id);
  }

  async list(
    buildingId: string,
    filters: ListIncidentsDto,
    actor: AuthenticatedUser,
  ) {
    const building = await this.repository.findBuilding(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    if (!canManageBuilding(actor, buildingId)) {
      throw new AppError(
        "No tiene permisos para consultar los incidentes de este edificio",
        403,
      );
    }

    return this.repository.list(buildingId, filters);
  }

  async update(
    incidentId: string,
    dto: UpdateIncidentDto,
    actor: AuthenticatedUser,
  ) {
    const incident = await this.repository.findIncident(incidentId);

    if (!incident) {
      throw new AppError("Incidente no encontrado", 404);
    }

    if (!canManageBuilding(actor, incident.buildingId)) {
      throw new AppError(
        "No tiene permisos para modificar este incidente",
        403,
      );
    }

    if (
      dto.assignedToPersonId !== undefined &&
      dto.assignedToPersonId !== null
    ) {
      const person = await this.repository.findPerson(dto.assignedToPersonId);

      if (!person) {
        throw new AppError("La persona asignada no existe", 404);
      }
    }

    const updateData: {
      status?: UpdateIncidentDto["status"];
      assignedToPersonId?: string | null;
      resolvedAt?: Date | null;
    } = {};

    if (dto.status !== undefined) {
      updateData.status = dto.status;

      if (dto.status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      } else {
        updateData.resolvedAt = null;
      }
    }

    if (dto.assignedToPersonId !== undefined) {
      updateData.assignedToPersonId = dto.assignedToPersonId;
    }

    return this.repository.update(incident, updateData);
  }
}
