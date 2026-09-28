import { Transaction, UniqueConstraintError } from "sequelize";

import { Person } from "../people/people.model.js";
import { RESIDENT_RELATIONSHIP_TYPE } from "../units/residents/resident.repository.js";
import { Unit } from "../units/unit.model.js";
import { UnitPeople } from "../unit-people/unit-people.model.js";
import { User } from "../users/user.model.js";
import { AccessAuthorization } from "./access-authorization.model.js";

export type CreateAuthorizationData = {
  buildingId: string;
  unitId: string;
  visitorId: string;
  authorizedByUserId: string;
  validFrom: Date;
  validUntil: Date;
  status: string;
  qrTokenHash: string;
};

export class AccessRepository {
  findUnitById(id: string) {
    return Unit.findByPk(id);
  }

  findUserIdentity(userId: string) {
    return User.findByPk(userId, {
      attributes: ["id", "personId"],
    });
  }

  findActiveResidentLink(unitId: string, personId: string) {
    return UnitPeople.findOne({
      where: {
        unitId,
        personId,
        relationshipType: RESIDENT_RELATIONSHIP_TYPE,
        endDate: null,
      },
    });
  }

  findVisitor(documentType: string, documentNumber: string) {
    return Person.findOne({ where: { documentType, documentNumber } });
  }

  createVisitor(
    data: {
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    },
    transaction: Transaction,
  ) {
    return Person.create(
      {
        ...data,
        email: null,
        phone: null,
      },
      { transaction },
    );
  }

  async findOrCreateVisitor(
    data: {
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    },
    transaction: Transaction,
  ) {
    const existing = await this.findVisitor(
      data.documentType,
      data.documentNumber,
    );

    if (existing) {
      return existing;
    }

    try {
      return await this.createVisitor(data, transaction);
    } catch (error) {
      // carrera: otro request creo la persona entre el find y el create
      if (error instanceof UniqueConstraintError) {
        const found = await this.findVisitor(
          data.documentType,
          data.documentNumber,
        );

        if (found) {
          return found;
        }
      }

      throw error;
    }
  }

  createAuthorization(data: CreateAuthorizationData, transaction: Transaction) {
    return AccessAuthorization.create(data, { transaction });
  }
}