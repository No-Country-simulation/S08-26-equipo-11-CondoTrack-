import {
  AuthenticatedUser,
  isSuperAdmin,
} from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import { CreateDeliveryDto, ListDeliveriesDto } from "./delivery.dto.js";
import { DeliveryRepository } from "./delivery.repository.js";

const canHandle = (actor: AuthenticatedUser, buildingId: string) =>
  isSuperAdmin(actor) ||
  actor.roles.some(
    (role) =>
      role.buildingId === buildingId &&
      (role.roleName === "RECEPTION" || role.roleName === "ADMIN"),
  );

export class DeliveryService {
  constructor(private readonly repository: DeliveryRepository) {}

  async create(
    unitId: string,
    dto: CreateDeliveryDto,
    actor: AuthenticatedUser,
  ) {
    const unit = await this.repository.findUnit(unitId);

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    if (!canHandle(actor, unit.buildingId)) {
      throw new AppError("No tiene permisos en este edificio", 403);
    }

    if (!unit.isActive) {
      throw new AppError("La unidad está inactiva", 400);
    }

    const recipientLink = await this.repository.findActiveRecipient(
      unit.id,
      dto.recipientPersonId,
      new Date(),
    );

    if (!recipientLink) {
      throw new AppError("El destinatario no está vinculado a la unidad", 400);
    }

    return this.repository.create(unit, dto, actor.id);
  }

  async deliver(id: string, actor: AuthenticatedUser) {
    return this.repository.transaction(async (transaction) => {
      const delivery = await this.repository.findByIdForUpdate(id, transaction);

      if (!delivery) {
        throw new AppError("Paquete no encontrado", 404);
      }

      if (!canHandle(actor, delivery.buildingId)) {
        throw new AppError("No tiene permisos en este edificio", 403);
      }

      if (delivery.status !== "RECEIVED" && delivery.status !== "NOTIFIED") {
        throw new AppError("El paquete ya no está pendiente de entrega", 409);
      }

      return delivery.update(
        {
          status: "PICKED_UP",
          pickedUpAt: new Date(),
          pickedUpByUserId: actor.id,
        },
        { transaction },
      );
    });
  }

  async list(
    buildingId: string,
    filters: ListDeliveriesDto,
    actor: AuthenticatedUser,
  ) {
    const building = await this.repository.findBuilding(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    if (!canHandle(actor, buildingId)) {
      throw new AppError("No tiene permisos en este edificio", 403);
    }

    return this.repository.list(buildingId, filters);
  }
  async listMine(filters: ListDeliveriesDto, actor: AuthenticatedUser) {
    const isResident = actor.roles.some((role) => role.roleName === "RESIDENT");

    if (!isResident) {
      throw new AppError(
        "Solo los residentes pueden consultar sus deliveries",
        403,
      );
    }

    const unitIds = await this.repository.findActiveUnitIdsForUser(
      actor.id,
      new Date(),
    );

    if (unitIds.length === 0) {
      return [];
    }

    return this.repository.listMine(unitIds, filters);
  }
}
