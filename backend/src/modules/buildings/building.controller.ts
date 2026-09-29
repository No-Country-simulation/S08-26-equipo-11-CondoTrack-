import { RequestHandler } from "express";

import catchAsync from "../../utils/catchAsync.js";
import { resolveBuildingScope } from "../../middlewares/auth.middleware.js";
import { validateCreateBuildingDto } from "./create-building.dto.js";
import { validateListBuildingsDto } from "./list-buildings.dto.js";
import { BuildingService } from "./building.service.js";
import AppError from "../../utils/AppError.js";
import { isUuid } from "../../utils/uuid.js";
import { validateUpdateBuildingDto } from "./update-building.dto.js";

export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  create: RequestHandler = catchAsync(async (req, res) => {
    const dto = validateCreateBuildingDto(req.body);

    const building = await this.buildingService.create(dto);

    res.status(201).json({
      success: true,
      data: building,
    });
  });

  list: RequestHandler = catchAsync(async (req, res) => {
    const filters = validateListBuildingsDto(req.query);
    const buildingIds = resolveBuildingScope(req.authenticatedUser!);
    const buildings = await this.buildingService.list(
      filters.includeInactive,
      buildingIds,
    );

    res.status(200).json({
      success: true,
      data: buildings,
    });
  });

  getById: RequestHandler = catchAsync(async (req, res) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const building = await this.buildingService.getById(id);

    res.status(200).json({
      success: true,
      data: building,
    });
  });

  update: RequestHandler = catchAsync(async (req, res) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !isUuid(id)) {
      throw new AppError(
        "El identificador del edificio debe ser un UUID válido",
        400,
      );
    }

    const building = await this.buildingService.update(
      id,
      validateUpdateBuildingDto(req.body),
    );

    res.status(200).json({
      success: true,
      data: building,
    });
  });
}
