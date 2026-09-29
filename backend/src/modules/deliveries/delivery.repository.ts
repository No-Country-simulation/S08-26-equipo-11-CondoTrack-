import { Op, Transaction } from "sequelize";

import { sequelize } from "../../database/database.js";
import { Building } from "../buildings/building.model.js";
import { UnitPeople } from "../unit-people/unit-people.model.js";
import { Unit } from "../units/unit.model.js";
import { CreateDeliveryDto, ListDeliveriesDto } from "./delivery.dto.js";
import { Delivery } from "./delivery.model.js";

export class DeliveryRepository {
  findBuilding(id: string) {
    return Building.findByPk(id);
  }

  findUnit(id: string) {
    return Unit.findByPk(id);
  }

  findActiveRecipient(unitId: string, personId: string, now: Date) {
    return UnitPeople.findOne({
      where: {
        unitId,
        personId,
        [Op.and]: [
          {
            [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: now } }],
          },
          {
            [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }],
          },
        ],
      },
    });
  }

  create(unit: Unit, dto: CreateDeliveryDto, userId: string) {
    return Delivery.create({
      buildingId: unit.buildingId,
      unitId: unit.id,
      recipientPersonId: dto.recipientPersonId,
      receivedByUserId: userId,
      pickedUpByUserId: null,
      carrier: dto.carrier,
      trackingNumber: dto.trackingNumber ?? null,
      status: "RECEIVED",
      receivedAt: new Date(),
      notifiedAt: null,
      pickedUpAt: null,
    });
  }

  transaction<T>(action: (transaction: Transaction) => Promise<T>) {
    return sequelize.transaction(action);
  }

  findByIdForUpdate(id: string, transaction: Transaction) {
    return Delivery.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  list(buildingId: string, filters: ListDeliveriesDto) {
    return Delivery.findAll({
      where: {
        buildingId,
        ...(filters.status ? { status: filters.status } : {}),
      },
      order: [["receivedAt", "DESC"]],
    });
  }
}
