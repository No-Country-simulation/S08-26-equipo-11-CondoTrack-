import { Transaction } from "sequelize";

import { Role } from "../../roles/role.model.js";
import { UserBuildingRole } from "../../users-buildings-roles/user-building-role.model.js";
import { User } from "../../users/user.model.js";
import { UserStatus } from "../../users/user.types.js";

export interface CreateUserRepositoryData {
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
  lastLoginAt: Date | null;
}

export interface CreateUserBuildingRoleRepositoryData {
  userId: string;
  roleId: string;
  buildingId: string;
}

export interface LocalAuthRole {
  roleId: string;
  buildingId: string;
  roleName: string;
}

export class LocalAuthRepository {
  findUserByEmail(
    email: string,
    options: { includePasswordHash?: boolean } = {},
  ): Promise<User | null> {
    const attributes = options.includePasswordHash
      ? ["id", "firstName", "lastName", "email", "passwordHash"]
      : ["id"]; //condicional para incluir la contrseña

    return User.findOne({
      where: { email },
      attributes,
    });
  }

  createUser(
    data: CreateUserRepositoryData,
    transaction: Transaction,
  ): Promise<User> {
    return User.create(data, { transaction });
  }

  findRoleByName(name: string, transaction: Transaction): Promise<Role | null> {
    return Role.findOne({ where: { name }, transaction });
  }

  createUserBuildingRole(
    data: CreateUserBuildingRoleRepositoryData,
    transaction: Transaction,
  ): Promise<UserBuildingRole> {
    return UserBuildingRole.create(data, { transaction });
  }

  async findUserRoles(userId: string): Promise<LocalAuthRole[]> {
    const rows = await UserBuildingRole.findAll({
      where: { userId },
      attributes: ["roleId", "buildingId"],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    return rows.map((row) => {
      const role = row.get("role") as Role;
      return {
        roleId: row.roleId,
        buildingId: row.buildingId,
        roleName: role.name,
      };
    });
  }
}
