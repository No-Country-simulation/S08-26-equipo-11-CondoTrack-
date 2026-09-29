import { Op, Transaction, WhereOptions } from "sequelize";

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

  findRoleDefinition(name: string) {
    return Role.findOne({ where: { name } });
  }

  findUserIdsPage(
    buildingId: string | null,
    roleId: string | null,
    limit: number,
    offset: number,
  ) {
    const where: WhereOptions<UserBuildingRole> = {};

    if (buildingId) {
      where.buildingId = buildingId;
    }

    if (roleId) {
      where.roleId = roleId;
    }

    return UserBuildingRole.findAndCountAll({
      where,
      attributes: ["userId"],
      distinct: true,
      col: "userId",
      limit,
      offset,
      order: [["userId", "ASC"]],
    });
  }

  findAssignments(
    userIds: string[],
    buildingId: string | null,
    roleId: string | null,
  ) {
    return UserBuildingRole.findAll({
      where: {
        userId: { [Op.in]: userIds },
        ...(buildingId ? { buildingId } : {}),
        ...(roleId ? { roleId } : {}),
      },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });
  }

  findPublicUsersByIds(userIds: string[]) {
    return User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "email", "status"],
      include: [
        {
          model: Person,
          as: "person",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "documentType",
            "documentNumber",
            "phone",
          ],
        },
      ],
      order: [["email", "ASC"]],
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
