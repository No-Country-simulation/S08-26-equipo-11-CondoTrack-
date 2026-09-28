import { Transaction } from "sequelize";

import { AuditLog } from "../audit/audit.model.js";
import { Building } from "../buildings/building.model.js";
import { Person } from "../people/people.model.js";
import { Role } from "../roles/role.model.js";
import { UserBuildingRole } from "../users-buildings-roles/user-building-role.model.js";
import { ManageUserDto, UpdateProfileDto } from "./user.dto.js";
import { User } from "./user.model.js";

export class UserRepository {
  findUser(id: string, transaction?: Transaction, lock = false) {
    return User.findByPk(id, {
      attributes: [
        "id",
        "personId",
        "email",
        "status",
        "createdAt",
        "lastLoginAt",
      ],
      transaction,
      ...(lock && transaction ? { lock: transaction.LOCK.UPDATE } : {}),
    });
  }

  findPerson(id: string, transaction: Transaction) {
    return Person.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  findRoles(userId: string, transaction?: Transaction) {
    return UserBuildingRole.findAll({
      where: { userId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
      transaction,
    });
  }

  findBuildings(ids: string[]) {
    return Building.findAll({
      where: { id: ids },
      attributes: ["id", "name", "address"],
    });
  }

  findRoleDefinitions(names: string[], transaction: Transaction) {
    return Role.findAll({
      where: { name: names },
      transaction,
    });
  }

  updatePersonFields(
    person: Person,
    fields: UpdateProfileDto,
    transaction: Transaction,
  ) {
    return person.update(fields, { transaction });
  }

  updateUserFields(
    user: User,
    fields: Pick<ManageUserDto, "status">,
    transaction: Transaction,
  ) {
    return user.update(fields, { transaction });
  }

  async replaceRoles(
    userId: string,
    roles: Array<{ buildingId: string; roleId: string }>,
    transaction: Transaction,
  ) {
    await UserBuildingRole.destroy({
      where: { userId },
      transaction,
    });

    if (roles.length) {
      await UserBuildingRole.bulkCreate(
        roles.map((role) => ({ ...role, userId })),
        { transaction },
      );
    }
  }

  countLogins(userId: string) {
    return AuditLog.count({
      where: {
        action: "LOGIN",
        tableName: "users",
        recordId: userId,
      },
    });
  }

  writeAudit(
    data: {
      performedBy: string;
      action: string;
      tableName: string;
      recordId: string;
      buildingId: string | null;
      oldValues: Record<string, unknown>;
      newValues: Record<string, unknown>;
      ipAddress: string | null;
    },
    transaction: Transaction,
  ) {
    return AuditLog.create({ ...data, unitId: null }, { transaction });
  }
}
