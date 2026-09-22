import { RequestHandler } from "express";

import { verifyToken } from "../modules/auth/jwt.js";
import { Role } from "../modules/roles/role.model.js";
import { SystemRole } from "../modules/roles/role.types.js";
import { User } from "../modules/users/user.model.js";
import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";
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
    const user = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "email"],
    });

    if (!user) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    //todos los roles del usuario
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
      firstName: user.firstName,
      lastName: user.lastName,
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

export const authorizeBuildingRoles = (
  ...allowedRoles: SystemRole[]
): RequestHandler => {
  return catchAsync((req, res, next) => {
    const authUser = req.authenticatedUser;

    if (!authUser) {
      throw new AppError(UNAUTHORIZED_MESSAGE, 401);
    }

    const buildingIdParam = req.params.buildingId;

    const buildingId = Array.isArray(buildingIdParam)
      ? buildingIdParam[0]
      : buildingIdParam;

    if (!buildingId) {
      throw new AppError("El identificador del edificio es obligatorio", 400);
    }

    const isSuperAdmin = authUser.roles.some(
      (role) => role.roleName === "SUPER_ADMIN",
    );

    if (isSuperAdmin) {
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
