import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../database/database.js";
import {
  AuthenticatedUser,
  isSuperAdmin,
} from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import { Person } from "../people/people.model.js";
import { Role } from "../roles/role.model.js";
import { UserBuildingRole } from "../users-buildings-roles/user-building-role.model.js";
import { ListUsersDto, ManageUserDto, UpdateProfileDto } from "./user.dto.js";
import { UserRepository } from "./user.repository.js";
import { UserListScope } from "./user.types.js";

const forbidden = () =>
  new AppError("No tiene permisos para realizar esta acción", 403);

const rolesOf = (rows: UserBuildingRole[]) =>
  rows.map((row) => ({
    buildingId: row.buildingId,
    roleName: (row.get("role") as Role).name,
  }));

const isPrivileged = (name: string) =>
  name === "ADMIN" || name === "SUPER_ADMIN";

const profileView = (person: Person) => ({
  id: person.id,
  firstName: person.firstName,
  lastName: person.lastName,
  documentType: person.documentType,
  documentNumber: person.documentNumber,
  phone: person.phone,
});

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async list(scope: UserListScope, filters: ListUsersDto) {
    const offset = (filters.page - 1) * filters.limit;

    const { ids: userIds, total } = await this.repository.findUserIdsPage(
      scope,
      filters.limit,
      offset,
    );

    if (!userIds.length) {
      return {
        users: [],
        pagination: this.pagination(filters.page, filters.limit, total),
      };
    }

    const [users, assignments] = await Promise.all([
      this.repository.findPublicUsersByIds(userIds),
      this.repository.findAssignments(userIds, scope.buildingId),
    ]);

    const rolesByUser = new Map<string, ReturnType<typeof rolesOf>>();

    for (const row of assignments) {
      const roles = rolesByUser.get(row.userId) ?? [];
      roles.push(...rolesOf([row]));
      rolesByUser.set(row.userId, roles);
    }

    const byId = new Map(users.map((user) => [user.id, user]));

    return {
      users: userIds.flatMap((id) => {
        const user = byId.get(id);

        if (!user) {
          return [];
        }

        const person = user.get("person") as Person | null;

        return [
          {
            id: user.id,
            personId: user.personId,
            email: user.email,
            status: user.status,
            firstName: person?.firstName ?? null,
            lastName: person?.lastName ?? null,
            documentType: person?.documentType ?? null,
            documentNumber: person?.documentNumber ?? null,
            phone: person?.phone ?? null,
            roles: rolesByUser.get(id) ?? [],
          },
        ];
      }),
      pagination: this.pagination(filters.page, filters.limit, total),
    };
  }

  private pagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  //traduce el nombre de rol solicitado a su id 400 si el rol no existe
  async resolveListScope(filters: ListUsersDto): Promise<UserListScope> {
    if (!filters.role) {
      return filters.buildingId ? { buildingId: filters.buildingId } : {};
    }

    const definition = await this.repository.findRoleDefinition(filters.role);

    if (!definition) {
      throw new AppError("El rol indicado no existe", 400);
    }

    return {
      ...(filters.buildingId ? { buildingId: filters.buildingId } : {}),
      roleId: definition.id,
    };
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const user = await this.repository.findUser(id);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const rows = await this.repository.findRoles(id);
    const roles = rolesOf(rows);

    const adminBuildings = new Set(
      actor.roles
        .filter((role) => role.roleName === "ADMIN")
        .map((role) => role.buildingId),
    );

    if (
      !isSuperAdmin(actor) &&
      actor.id !== id &&
      !roles.some((role) => adminBuildings.has(role.buildingId))
    ) {
      throw forbidden();
    }

    const person = user.personId ? await Person.findByPk(user.personId) : null;

    const buildings = await this.repository.findBuildings([
      ...new Set(roles.map((role) => role.buildingId)),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      person: person ? profileView(person) : null,
      roles,
      buildings: buildings.map((building) => ({
        id: building.id,
        name: building.name,
        address: building.address,
      })),
      audit: {
        loginCount: await this.repository.countLogins(id),
        lastLoginAt: user.lastLoginAt,
      },
    };
  }

  async updateProfile(
    id: string,
    fields: UpdateProfileDto,
    actor: AuthenticatedUser,
    ipAddress: string | null,
  ) {
    try {
      return await sequelize.transaction(async (transaction) => {
        const user = await this.repository.findUser(id, transaction, true);

        if (!user) {
          throw new AppError("Usuario no encontrado", 404);
        }

        if (actor.id !== id && !isSuperAdmin(actor)) {
          throw forbidden();
        }

        if (!user.personId) {
          throw new AppError("El usuario no tiene perfil personal", 404);
        }

        const person = await this.repository.findPerson(
          user.personId,
          transaction,
        );

        if (!person) {
          throw new AppError("Perfil personal no encontrado", 404);
        }

        const before = profileView(person);

        const updated = await this.repository.updatePersonFields(
          person,
          fields,
          transaction,
        );

        const after = profileView(updated);

        await this.repository.writeAudit(
          {
            performedBy: actor.id,
            action: "PROFILE_UPDATED",
            tableName: "people",
            recordId: person.id,
            buildingId: null,
            oldValues: before,
            newValues: after,
            ipAddress,
          },
          transaction,
        );

        return after;
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError("El documento ya está registrado", 400);
      }

      throw error;
    }
  }

  async manageUser(
    id: string,
    fields: ManageUserDto,
    actor: AuthenticatedUser,
    ipAddress: string | null,
  ) {
    const superAdmin = isSuperAdmin(actor);

    const adminBuildings = new Set(
      actor.roles
        .filter((role) => role.roleName === "ADMIN")
        .map((role) => role.buildingId),
    );

    if (!superAdmin && !adminBuildings.size) {
      throw forbidden();
    }

    return sequelize.transaction(async (transaction) => {
      const user = await this.repository.findUser(id, transaction, true);

      if (!user) {
        throw new AppError("Usuario no encontrado", 404);
      }

      const previous = rolesOf(
        await this.repository.findRoles(id, transaction),
      );

      if (!superAdmin) {
        if (
          id === actor.id ||
          previous.some((role) => isPrivileged(role.roleName))
        ) {
          throw forbidden();
        }

        if (
          !previous.length ||
          previous.some((role) => !adminBuildings.has(role.buildingId))
        ) {
          throw forbidden();
        }
      }

      const next = fields.roles ?? previous;

      if (fields.roles) {
        const uniqueRoles = new Set(
          next.map((role) => `${role.buildingId}:${role.roleName}`),
        );

        if (uniqueRoles.size !== next.length) {
          throw new AppError("Hay roles duplicados", 400);
        }

        if (
          !superAdmin &&
          next.some(
            (role) =>
              role.roleName === "SUPER_ADMIN" || role.roleName === "ADMIN",
          )
        ) {
          throw new AppError("No puede asignar un rol de administrador", 400);
        }

        if (
          !superAdmin &&
          [...previous, ...next].some(
            (role) => !adminBuildings.has(role.buildingId),
          )
        ) {
          throw forbidden();
        }

        const buildingIds = [...new Set(next.map((role) => role.buildingId))];

        const buildings = await this.repository.findBuildings(buildingIds);

        if (buildings.length !== buildingIds.length) {
          throw new AppError("El edificio indicado no existe", 400);
        }

        const roleNames = [...new Set(next.map((role) => role.roleName))];

        const definitions = await this.repository.findRoleDefinitions(
          roleNames,
          transaction,
        );

        if (definitions.length !== roleNames.length) {
          throw new AppError("El rol indicado no existe", 400);
        }

        const roleIds = new Map(
          definitions.map((role) => [role.name, role.id]),
        );

        await this.repository.replaceRoles(
          id,
          next.map((role) => ({
            buildingId: role.buildingId,
            roleId: roleIds.get(role.roleName)!,
          })),
          transaction,
        );
      }

      const oldValues = {
        status: user.status,
        roles: previous,
      };

      if (fields.status) {
        await this.repository.updateUserFields(
          user,
          { status: fields.status },
          transaction,
        );
      }

      const newValues = {
        status: user.status,
        roles: next,
      };

      await this.repository.writeAudit(
        {
          performedBy: actor.id,
          action: "USER_MANAGED",
          tableName: "users",
          recordId: id,
          buildingId: null,
          oldValues,
          newValues,
          ipAddress,
        },
        transaction,
      );

      return {
        id: user.id,
        email: user.email,
        status: user.status,
        roles: next,
      };
    });
  }
}
