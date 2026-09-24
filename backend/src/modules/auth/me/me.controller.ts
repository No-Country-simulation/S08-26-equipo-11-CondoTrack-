import { RequestHandler } from "express";

import { Building } from "../../buildings/building.model.js";
import { User } from "../../users/user.model.js";
import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";

export const getMe: RequestHandler = catchAsync(async (req, res) => {
  const authenticatedUser = req.authenticatedUser;

  if (!authenticatedUser) {
    throw new AppError("No autorizado", 401);
  }

  const user = await User.findByPk(authenticatedUser.id, {
    attributes: ["id", "email", "status"],
  });

  if (!user) {
    throw new AppError("No autorizado", 401);
  }

  const buildingIds = [
    ...new Set(authenticatedUser.roles.map((role) => role.buildingId)),
  ];

  const buildings = await Building.findAll({
    where: { id: buildingIds },
    attributes: ["id", "name"],
  });

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      status: user.status,
      roles: authenticatedUser.roles,
      buildings: buildings.map((building) => ({
        id: building.id,
        name: building.name,
      })),
      units: [],
    },
  });
});
