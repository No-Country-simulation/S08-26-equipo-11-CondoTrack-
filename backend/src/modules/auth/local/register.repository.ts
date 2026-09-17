import { Transaction } from "sequelize";

import { UserBuildingRole } from "../../users-buildings-roles/user-building-role.model.js";
import { UserStatus } from "../../users/user.types.js";
import { User } from "../../users/user.model.js";
import { Role } from "../../roles/role.model.js";

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

export class RegisterRepository {
  findUserByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: { email },
      attributes: ["id"],
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
}