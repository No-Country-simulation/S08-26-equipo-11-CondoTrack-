import { UniqueConstraintError } from "sequelize";

import { sequelize } from "../../database/database.js";
import {
  AuthenticatedUser,
  isSuperAdmin,
  resolveBuildingScope,
} from "../../middlewares/auth.middleware.js";
import AppError from "../../utils/AppError.js";
import { Person } from "../people/people.model.js";
import { Role } from "../roles/role.model.js";
import { UserBuildingRole } from "../users-buildings-roles/user-building-role.model.js";
import { ManageUserDto, UpdateProfileDto, UserListQuery } from "./user.dto.js";
import { UserRepository } from "./user.repository.js";

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

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  private resolveListScope(
    buildingId: string | undefined,
    actor: AuthenticatedUser,
  ) {
    if (isSuperAdmin(actor)) {
      return buildingId ?? null;
    }

    if (!buildingId) {
      throw new AppError("El ADMIN debe indicar buildingId", 400);
    }

    const allowed = new Set(resolveBuildingScope(actor) ?? []);

    if (!allowed.has(buildingId)) {
      throw forbidden();
    }

    return buildingId;
  }

  async list(query: UserListQuery, actor: AuthenticatedUser) {
    const buildingId = this.resolveListScope(query.buildingId, actor);

    const roleId = query.role
      ? (await this.repository.findRoleDefinition(query.role))?.id ?? null
      : null;

    if (query.role && !roleId) {
      throw new AppError("El rol indicado no existe", 400);
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.repository.findUserIdsPage(
      buildingId,
      roleId,
      limit,
      offset,
    );

    const userIds = [...new Set(rows.map((row) => row.userId))];

    const [users, assignments] = await Promise.all([
      this.repository.findPublicUsersByIds(userIds),
      this.repository.findAssignments(userIds, buildingId, roleId),
    ]);

    const byId = new Map(users.map((user) => [user.id, user]));

    const rolesByUser = new Map<string, Array<{ buildingId: string; roleName: string }>>();

    for (const assignment of assignments) {
      const role = assignment.get("role") as Role;
      const list = rolesByUser.get(assignment.userId) ?? [];

      list.push({
        buildingId: assignment.buildingId,
        roleName: role.name,
      });

      rolesByUser.set(assignment.userId, list);
    }

    const items = userIds.flatMap((userId) => {
      const user = byId.get(userId);

      if (!user) {
        return [];
      }

      return [
        {
          id: user.id,
          email: user.email,
          status: user.status,
          person: user.person ? profileView(user.person) : null,
          roles: rolesByUser.get(userId) ?? [],
        },
      ];
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
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
