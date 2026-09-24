import { Transaction } from "sequelize";

import { Person } from "../../people/people.model.js";
import { Role } from "../../roles/role.model.js";
import { UnitPeople } from "../../unit-people/unit-people.model.js";
import { User } from "../../users/user.model.js";
import { UserBuildingRole } from "../../users-buildings-roles/user-building-role.model.js";

export class ResidentRepository {
  findUserByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  findActiveLink(unitId: string, personId: string) {
    return UnitPeople.findOne({
      where: {
        unitId,
        personId,
        relationshipType: "RESIDENT",
        endDate: null,
      },
    });
  }

  findResidentRole() {
    return Role.findOne({ where: { name: "RESIDENT" } });
  }

  findUserRole(userId: string, buildingId: string, roleId: string) {
    return UserBuildingRole.findOne({
      where: { userId, buildingId, roleId },
    });
  }

  createLink(unitId: string, personId: string, transaction: Transaction) {
    return UnitPeople.create(
      {
        unitId,
        personId,
        relationshipType: "RESIDENT",
        startDate: new Date(),
        endDate: null,
      },
      { transaction },
    );
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
        relationshipType: "RESIDENT",
        endDate: null,
      },
      include: [
        {
          model: Person,
          as: "person",
          attributes: ["id", "firstName", "lastName"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email"],
            },
          ],
        },
      ],
      order: [["startDate", "ASC"]],
    });

    return links;
  }
}
