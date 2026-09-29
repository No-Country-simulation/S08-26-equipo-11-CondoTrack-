import { RequestHandler } from "express";

import { verifyToken } from "../modules/auth/jwt.js";
import { Role } from "../modules/roles/role.model.js";
import { SystemRole } from "../modules/roles/role.types.js";
import { User } from "../modules/users/user.model.js";
import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";
import { Person } from "../modules/people/people.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

export interface AuthenticatedRole {
  roleId: string;
  buildingId: string;
  roleName: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: AuthenticatedRole[];
}

//extension de la Request para adjuntar la identidad autenticada
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedUser;
    }
  }
}

const BEARER_PREFIX = "Bearer ";

const UNAUTHORIZED_MESSAGE = "No autorizado";
const INVALID_TOKEN_MESSAGE = "Token inválido o expirado";
const FORBIDDEN_MESSAGE = "No tiene permisos para realizar esta acción";

export const authenticate: RequestHandler = catchAsync(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    //verificar el token
    const token = authHeader.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError(INVALID_TOKEN_MESSAGE, 401);
    }

    const userId = payload.sub;
    if (!userId) {
      throw new AppError(INVALID_TOKEN_MESSAGE, 401);
    }

    //info del usuario, sin contraseña ni datos sensibles
    //firstName/lastName viven en people (Person), no en users
    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "status"],
      include: [
        {
          model: Person,
          as: "person",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    if (!user) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    const roleRows = await UserBuildingRole.findAll({
      where: { userId: user.id },
      attributes: ["roleId", "buildingId"],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    const roles: AuthenticatedRole[] = roleRows.map((row) => {
      const role = row.get("role") as Role;
      return {
        roleId: row.roleId,
        buildingId: row.buildingId,
        roleName: role.name,
      };
    });

    req.authenticatedUser = {
      id: user.id,
      firstName: user.person?.firstName ?? "",
      lastName: user.person?.lastName ?? "",
      email: user.email,
      roles,
    };

    next();
  },
);

export const authorizeRoles = (
  ...allowedRoles: SystemRole[]
): RequestHandler => {
  return catchAsync((req, res, next) => {
    const authUser = req.authenticatedUser;

    if (!authUser) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    const hasAllowedRole = authUser.roles.some((role) =>
      allowedRoles.includes(role.roleName as SystemRole),
    );

    if (!hasAllowedRole) {
      throw new AppError(FORBIDDEN_MESSAGE, 403);
    }

    next();
  });
};

//para que las rutas permitan incluir usuaros inactivos condicionalmente
export const authorizeRolesForIncludeInactive = (
  ...allowedRoles: SystemRole[]
): RequestHandler => {
  const authorize = authorizeRoles(...allowedRoles);

  return (req, res, next) => {
    if (req.query.includeInactive === "true") {
      authorize(req, res, next);
      return;
    }

    next();
  };
};

export const authorizeBuildingRoles = (
  ...allowedRoles: SystemRole[]
): RequestHandler => authorizeBuildingParam("buildingId", ...allowedRoles);

/**
 * Implementacion unica de la autorizacion por edificio. El nombre del parametro
 * de ruta se recibe porque /buildings/:id y /buildings/:buildingId/units exponen
 * el mismo concepto con nombres distintos.
 */
export const authorizeBuildingParam = (
  paramName: string,
  ...allowedRoles: SystemRole[]
): RequestHandler => {
  return catchAsync((req, res, next) => {
    const authUser = req.authenticatedUser;

    if (!authUser) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    const param = req.params[paramName];

    const buildingId = Array.isArray(param) ? param[0] : param;

    if (!buildingId) {
      throw new AppError("El identificador del edificio es obligatorio", 400);
    }

    if (isSuperAdmin(authUser)) {
      next();
      return;
    }

    const hasBuildingRole = authUser.roles.some(
      (role) =>
        role.buildingId === buildingId &&
        allowedRoles.includes(role.roleName as SystemRole),
    );

    if (!hasBuildingRole) {
      throw new AppError(FORBIDDEN_MESSAGE, 403);
    }

    next();
  });
};

/** SUPER_ADMIN conserva alcance global sobre edificios. */
export const isSuperAdmin = (authUser: AuthenticatedUser): boolean =>
  authUser.roles.some((role) => role.roleName === "SUPER_ADMIN");

/**
 * Alcance de edificios del usuario autenticado, derivado de la misma identidad
 * que usa authorizeBuildingParam para no tener dos estrategias de alcance.
 * null significa "todos los edificios" (SUPER_ADMIN); un array vacio significa
 * "ninguno", que es el caso de un ADMIN sin edificios asignados.
 */
export const resolveBuildingScope = (
  authUser: AuthenticatedUser,
): string[] | null => {
  if (isSuperAdmin(authUser)) {
    return null;
  }

  const buildingIds = authUser.roles
    .map((role) => role.buildingId)
    .filter((buildingId): buildingId is string => Boolean(buildingId));

  return [...new Set(buildingIds)];
};
