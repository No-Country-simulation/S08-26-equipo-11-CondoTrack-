import { RequestHandler } from "express";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { validateCreateUnitDto } from "./dto/create-unit.dto.js";
import { validateListUnitsDto } from "./dto/list-units.dto.js";
import { UnitService } from "./unit.service.js";

export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  create: RequestHandler = catchAsync(async (req, res) => {
    const buildingIdParam = req.params.buildingId;

    const buildingId = Array.isArray(buildingIdParam)
      ? buildingIdParam[0]
      : buildingIdParam;

    if (!buildingId) {
      throw new AppError("El identificador del edificio es obligatorio", 400);
    }

    const dto = validateCreateUnitDto(req.body);

    const unit = await this.unitService.create(buildingId, dto);

    res.status(201).json({
      success: true,
      data: unit,
    });
  });

  list: RequestHandler = catchAsync(async (req, res) => {
    const buildingIdParam = req.params.buildingId;

    const buildingId = Array.isArray(buildingIdParam)
      ? buildingIdParam[0]
      : buildingIdParam;

    if (!buildingId) {
      throw new AppError("El identificador del edificio es obligatorio", 400);
    }

    const filters = validateListUnitsDto(req.query);

    const result = await this.unitService.listByBuilding(buildingId, filters);

    res.status(200).json({
      success: true,
      data: result.units,
      pagination: result.pagination,
    });
  });
}
