import { AuthenticatedUser } from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import { Building } from "../buildings/building.model.js";
import { CreateReservationDto } from "./reservation.dto.js";
import { ReservationRepository } from "./reservation.repository.js";

export class ReservationService {
  constructor(private readonly repository: ReservationRepository) {}

  async create(
    commonAreaId: string,
    dto: CreateReservationDto,
    actor: AuthenticatedUser,
  ) {
    return this.repository.transaction(async (transaction) => {
      const area = await this.repository.findAreaForUpdate(
        commonAreaId,
        transaction,
      );

      if (!area) {
        throw new AppError("Espacio común no encontrado", 404);
      }

      if (!area.isActive) {
        throw new AppError("El espacio común está inactivo", 400);
      }

      const hasResidentRole = actor.roles.some(
        (role) =>
          role.roleName === "RESIDENT" && role.buildingId === area.buildingId,
      );

      if (!hasResidentRole) {
        throw new AppError(
          "No tiene permisos para reservar en este edificio",
          403,
        );
      }

      const user = await this.repository.findUser(actor.id, transaction);

      const unit = await this.repository.findUnit(dto.unitId, transaction);

      if (!unit || unit.buildingId !== area.buildingId || !unit.isActive) {
        throw new AppError("Unidad no disponible en el edificio", 400);
      }

      if (
        !user?.personId ||
        !(await this.repository.findResidentLink(
          unit.id,
          user.personId,
          new Date(),
          transaction,
        ))
      ) {
        throw new AppError("No es residente de la unidad indicada", 403);
      }

      const startAt = new Date(dto.startAt);
      const endAt = new Date(dto.endAt);

      if (startAt <= new Date()) {
        throw new AppError("startAt debe ser una fecha futura", 400);
      }

      const overlap = await this.repository.findOverlap(
        area.id,
        startAt,
        endAt,
        transaction,
      );

      if (overlap) {
        throw new AppError("Ya existe una reserva para ese horario", 409);
      }

      return this.repository.create(
        {
          buildingId: area.buildingId,
          commonAreaId: area.id,
          unitId: unit.id,
          requestedByUserId: actor.id,
          startAt,
          endAt,
          notes: dto.notes ?? null,
        },
        transaction,
      );
    });
  }

  async list(buildingId: string) {
    const building = await Building.findByPk(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    return this.repository.list(buildingId);
  }
}
