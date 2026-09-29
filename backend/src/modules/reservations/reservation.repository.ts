import { Op, Transaction } from "sequelize";

import { sequelize } from "../../database/database.js";
import { CommonArea } from "../common-areas/common-area.model.js";
import { UnitPeople } from "../unit-people/unit-people.model.js";
import { Unit } from "../units/unit.model.js";
import { User } from "../users/user.model.js";
import { Reservation } from "./reservation.model.js";

export class ReservationRepository {
  transaction<T>(action: (transaction: Transaction) => Promise<T>) {
    return sequelize.transaction(action);
  }

  findAreaForUpdate(id: string, transaction: Transaction) {
    return CommonArea.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  findUser(id: string, transaction: Transaction) {
    return User.findByPk(id, {
      attributes: ["id", "personId"],
      transaction,
    });
  }

  findUnit(id: string, transaction: Transaction) {
    return Unit.findByPk(id, { transaction });
  }

  findResidentLink(
    unitId: string,
    personId: string,
    now: Date,
    transaction: Transaction,
  ) {
    return UnitPeople.findOne({
      where: {
        unitId,
        personId,
        relationshipType: "RESIDENT",
        [Op.and]: [
          {
            [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: now } }],
          },
          {
            [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }],
          },
        ],
      },
      transaction,
    });
  }

  findOverlap(
    commonAreaId: string,
    startAt: Date,
    endAt: Date,
    transaction: Transaction,
  ) {
    return Reservation.findOne({
      where: {
        commonAreaId,
        status: {
          [Op.in]: ["PENDING", "CONFIRMED"],
        },
        startAt: {
          [Op.lt]: endAt,
        },
        endAt: {
          [Op.gt]: startAt,
        },
      },
      transaction,
    });
  }

  create(
    data: {
      buildingId: string;
      commonAreaId: string;
      unitId: string;
      requestedByUserId: string;
      startAt: Date;
      endAt: Date;
      notes: string | null;
    },
    transaction: Transaction,
  ) {
    return Reservation.create(
      {
        ...data,
        status: "PENDING",
      },
      { transaction },
    );
  }

  list(buildingId: string) {
    return Reservation.findAll({
      where: { buildingId },
      order: [["startAt", "ASC"]],
    });
  }
}
