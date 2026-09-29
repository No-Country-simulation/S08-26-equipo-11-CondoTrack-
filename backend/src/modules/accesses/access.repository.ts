import { Op, Transaction, UniqueConstraintError } from "sequelize";

import { Building } from "../buildings/building.model.js";
import { Person } from "../people/people.model.js";
import { RESIDENT_RELATIONSHIP_TYPE } from "../units/residents/resident.repository.js";
import { Unit } from "../units/unit.model.js";
import { UnitPeople } from "../unit-people/unit-people.model.js";
import { User } from "../users/user.model.js";
import { AccessAuthorization } from "./access-authorization.model.js";
import {
  AccessEvent,
  AccessEventType,
  AccessMethod,
} from "./access-event.model.js";

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

export type CreateEventData = {
  buildingId: string;
  unitId: string;
  visitorId: string;
  authorizationId: string;
  registeredByUserId: string;
  eventType: AccessEventType;
  accessMethod: AccessMethod;
  occurredAt: Date;
};

// Proyeccion de la autorizacion con los datos que la porteria necesita para identificar al visitante y la unidad de destino
type VisitorSummary = {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
};

export type AccessAuthorizationDetails = AccessAuthorization & {
  visitor: VisitorSummary;
  unit: Unit;
  building: Building;
};

const VISITOR_ATTRIBUTES = [
  "id",
  "firstName",
  "lastName",
  "documentType",
  "documentNumber",
];

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

  // Recibe el hash SHA-256 del token, nunca el token utilizable.
  findAuthorizationByHash(
    qrTokenHash: string,
    transaction: Transaction,
  ): Promise<AccessAuthorizationDetails | null> {
    return AccessAuthorization.findOne({
      where: { qrTokenHash },
      lock: { level: transaction.LOCK.UPDATE, of: AccessAuthorization },
      transaction,
      include: this.detailsInclude(),
    }) as Promise<AccessAuthorizationDetails | null>;
  }

  findAuthorizationById(
    id: string,
    transaction: Transaction,
  ): Promise<AccessAuthorizationDetails | null> {
    return AccessAuthorization.findByPk(id, {
      lock: { level: transaction.LOCK.UPDATE, of: AccessAuthorization },
      transaction,
      include: this.detailsInclude(),
    }) as Promise<AccessAuthorizationDetails | null>;
  }

  private detailsInclude() {
    return [
      { model: Person, as: "visitor", attributes: VISITOR_ATTRIBUTES },
      { model: Unit, as: "unit", attributes: ["id", "code"] },
      { model: Building, as: "building", attributes: ["id", "name"] },
    ];
  }

  createEvent(data: CreateEventData, transaction: Transaction) {
    return AccessEvent.create(data, { transaction });
  }

  findEventByAuthorization(
    authorizationId: string,
    eventType: AccessEventType,
    transaction: Transaction,
  ) {
    return AccessEvent.findOne({
      where: { authorizationId, eventType },
      transaction,
    });
  }

  /**
   * Busqueda manual de la porteria sobre autorizaciones vigentes, por DNI o
   * apellido del visitante. buildingIds null significa alcance global
   * (SUPER_ADMIN); un array limita a esos edificios.
   */
  searchAuthorizations(
    term: string,
    buildingIds: string[] | null,
    now: Date,
  ): Promise<AccessAuthorizationDetails[]> {
    return AccessAuthorization.findAll({
      where: {
        [Op.or]: [{ validUntil: null }, { validUntil: { [Op.gt]: now } }],
        ...(buildingIds ? { buildingId: { [Op.in]: buildingIds } } : {}),
      },
      include: [
        {
          model: Person,
          as: "visitor",
          attributes: VISITOR_ATTRIBUTES,
          where: {
            [Op.or]: [
              { documentNumber: { [Op.iLike]: `%${term}%` } },
              { lastName: { [Op.iLike]: `%${term}%` } },
            ],
          },
        },
        { model: Unit, as: "unit", attributes: ["id", "code"] },
        { model: Building, as: "building", attributes: ["id", "name"] },
      ],
      order: [["validUntil", "ASC"]],
      limit: 25,
    }) as Promise<AccessAuthorizationDetails[]>;
  }
}
