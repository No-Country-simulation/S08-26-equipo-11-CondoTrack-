import { RequestHandler } from "express";

import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { Unit } from "../modules/units/unit.model.js";

export const authorizeUnitAdmin: RequestHandler = catchAsync(
  async (req, res, next) => {
    const authUser = req.authenticatedUser;

    if (!authUser) {
      throw new AppError("No autorizado", 401);
    }

    const unitIdParam = req.params.unitId;
    const unitId = Array.isArray(unitIdParam) ? unitIdParam[0] : unitIdParam;

    if (!unitId) {
      throw new AppError("El identificador de la unidad es obligatorio", 400);
    }

    const unit = await Unit.findByPk(unitId);

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    const canManageUnit = authUser.roles.some(
      (role) =>
        role.roleName === "SUPER_ADMIN" ||
        (role.roleName === "ADMIN" && role.buildingId === unit.buildingId),
    );

    if (!canManageUnit) {
      throw new AppError("No tiene permisos para esta unidad", 403);
    }

    res.locals.unit = unit;
    next();
  },
);
