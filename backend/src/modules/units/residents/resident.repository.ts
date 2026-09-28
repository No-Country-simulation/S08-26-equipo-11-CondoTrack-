import { IncludeOptions, Transaction } from "sequelize";

import { Person } from "../../people/people.model.js";
import { Role } from "../../roles/role.model.js";
import { UnitPeople } from "../../unit-people/unit-people.model.js";
import { User } from "../../users/user.model.js";
import { UserBuildingRole } from "../../users-buildings-roles/user-building-role.model.js";

export const RESIDENT_RELATIONSHIP_TYPE = "RESIDENT";

/// Proyeccion de persona + cuenta usada tanto al listar como al crear un vinculo
const PERSON_WITH_USER_INCLUDE: IncludeOptions = {
  model: Person,
  as: "person",
  attributes: ["id", "firstName", "lastName", "email"],
  include: [
    {
      model: User,
      as: "user",
      attributes: ["id", "email"],
    },
  ],
};

export class ResidentRepository {
  findUserByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  findActiveLink(unitId: string, personId: string) {
    return UnitPeople.findOne({
      where: {
        unitId,
        personId,
        relationshipType: RESIDENT_RELATIONSHIP_TYPE,
        endDate: null,
      },
    });
  }

  findResidentRole() {
    return Role.findOne({ where: { name: "RESIDENT" } });
  }

  findUserRole(
    userId: string,
    buildingId: string,
    roleId: string,
    transaction: Transaction,
  ) {
    return UserBuildingRole.findOne({
      where: { userId, buildingId, roleId },
      transaction,
    });
  }

  async createLink(unitId: string, personId: string, transaction: Transaction) {
    const link = await UnitPeople.create(
      {
        unitId,
        personId,
        relationshipType: RESIDENT_RELATIONSHIP_TYPE,
        startDate: new Date(),
        endDate: null,
      },
      { transaction },
    );

    return link.reload({ include: PERSON_WITH_USER_INCLUDE, transaction });
  }

  createUserRole(
    userId: string,
    buildingId: string,
    roleId: string,
    transaction: Transaction,
  ) {
    return UserBuildingRole.create(
      { userId, buildingId, roleId },
      { transaction },
    );
  }

  async listActive(unitId: string) {
    const links = await UnitPeople.findAll({
      where: {
        unitId,
        relationshipType: RESIDENT_RELATIONSHIP_TYPE,
        endDate: null,
      },
      include: [PERSON_WITH_USER_INCLUDE],
      order: [["startDate", "ASC"]],
    });

    return links;
  }
}
