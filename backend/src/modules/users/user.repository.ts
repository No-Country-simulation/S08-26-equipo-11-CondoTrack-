import { Op, QueryTypes, Transaction } from "sequelize";

import { sequelize } from "../../database/database.js";
import { AuditLog } from "../audit/audit.model.js";
import { Building } from "../buildings/building.model.js";
import { Person } from "../people/people.model.js";
import { Role } from "../roles/role.model.js";
import { UserBuildingRole } from "../users-buildings-roles/user-building-role.model.js";
import { ManageUserDto, UpdateProfileDto } from "./user.dto.js";
import { User } from "./user.model.js";
import { UserListScope } from "./user.types.js";

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

  private assignableIdsSubquery(scope: UserListScope) {
    const conditions: string[] = [];

    if (scope.buildingId) {
      conditions.push(
        `EXISTS (SELECT 1 FROM users_buildings_roles ubr_scope
                   WHERE ubr_scope.user_id = u.id
                     AND ubr_scope.building_id = :buildingId${
                       scope.roleId ? "\n AND ubr_scope.role_id = :roleId" : ""
                     })`,
      );
    } else if (scope.roleId) {
      conditions.push(
        `EXISTS (SELECT 1 FROM users_buildings_roles ubr_scope
                   WHERE ubr_scope.user_id = u.id
                     AND ubr_scope.role_id = :roleId)`,
      );
    }

    return conditions.length
      ? `SELECT u.id FROM users u WHERE ${conditions.join(" AND ")}`
      : "SELECT u.id FROM users u";
  }

  async findUserIdsPage(scope: UserListScope, limit: number, offset: number) {
    const query = this.assignableIdsSubquery(scope);

    const replacements = {
      ...(scope.buildingId ? { buildingId: scope.buildingId } : {}),
      ...(scope.roleId ? { roleId: scope.roleId } : {}),
    };

    const ids = await sequelize.query<{ id: string }>(
      `${query} ORDER BY u.created_at DESC, u.id DESC LIMIT :rowLimit OFFSET :rowOffset`,
      {
        replacements: { ...replacements, rowLimit: limit, rowOffset: offset },
        type: QueryTypes.SELECT,
      },
    );

    const counted = await sequelize.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM (${query}) AS scoped`,
      { replacements, type: QueryTypes.SELECT },
    );

    return {
      ids: ids.map((row) => row.id),
      total: Number(counted[0]?.total ?? 0),
    };
  }

  findPublicUsersByIds(userIds: string[]) {
    return User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "personId", "email", "status"],
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
          required: false,
        },
      ],
    });
  }

  findAssignments(userIds: string[], buildingId?: string) {
    return UserBuildingRole.findAll({
      where: {
        userId: { [Op.in]: userIds },
        ...(buildingId ? { buildingId } : {}),
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
