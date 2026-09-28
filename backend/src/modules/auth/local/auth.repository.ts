import { Transaction } from "sequelize";

import { Role } from "../../roles/role.model.js";
import { UserBuildingRole } from "../../users-buildings-roles/user-building-role.model.js";
import { User } from "../../users/user.model.js";
import { UserStatus } from "../../users/user.types.js";
import { Person } from "../../people/people.model.js";

export interface CreateUserRepositoryData {
  personId: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  lastLoginAt: Date | null;
}

export interface CreatePersonRepositoryData {
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
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
      ? ["id", "email", "passwordHash", "status"]
      : ["id"];

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

  createPerson(
    data: CreatePersonRepositoryData,
    transaction: Transaction,
  ): Promise<Person> {
    return Person.create(data, { transaction });
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

  async updateLastLoginAt(userId: string): Promise<void> {
    await User.update({ lastLoginAt: new Date() }, { where: { id: userId } });
  }
}
