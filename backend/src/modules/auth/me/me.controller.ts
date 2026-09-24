import { RequestHandler } from "express";
import { Op } from "sequelize";

import { Building } from "../../buildings/building.model.js";
import { User } from "../../users/user.model.js";
import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { Unit } from "../../units/unit.model.js";
import { UnitPeople } from "../../unit-people/unit-people.model.js";

export const getMe: RequestHandler = catchAsync(async (req, res) => {
  const authenticatedUser = req.authenticatedUser;

  if (!authenticatedUser) {
    throw new AppError("No autorizado", 401);
  }

  const user = await User.findByPk(authenticatedUser.id, {
    attributes: ["id", "email", "status", "personId"],
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

  const now = new Date();

  const unitLinks = user.personId
    ? await UnitPeople.findAll({
        where: {
          personId: user.personId,
          [Op.and]: [
            {
              [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: now } }],
            },
            {
              [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }],
            },
          ],
        },
        attributes: ["unitId", "relationshipType"],
        include: [
          {
            model: Unit,
            as: "unit",
            attributes: ["id", "buildingId", "code", "floor", "unitType"],
          },
        ],
      })
    : [];

  const units = unitLinks.flatMap((link) => {
    const unit = link.get("unit") as Unit | null;

    return unit
      ? [
          {
            id: unit.id,
            buildingId: unit.buildingId,
            code: unit.code,
            floor: unit.floor,
            unitType: unit.unitType,
            relationshipType: link.relationshipType,
          },
        ]
      : [];
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
      units,
    },
  });
});
