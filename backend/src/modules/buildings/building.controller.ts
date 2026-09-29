import { RequestHandler } from "express";

import catchAsync from "../../utils/catchAsync.js";
import { resolveBuildingScope } from "../../middlewares/auth.middleware.js";
import { validateCreateBuildingDto } from "./create-building.dto.js";
import { validateListBuildingsDto } from "./list-buildings.dto.js";
import { BuildingService } from "./building.service.js";

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
    //un ADMIN solo ve los edificios que tiene asignados; SUPER_ADMIN ve todos
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
    // express 5 llora si no lo pongo asi
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const building = await this.buildingService.getById(id);

    res.status(200).json({
      success: true,
      data: building,
    });
  });
}
