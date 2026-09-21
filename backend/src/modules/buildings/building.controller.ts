import { RequestHandler } from "express";

import catchAsync from "../../utils/catchAsync.js";
import {
  validateCreateBuildingDto,
} from "./create-building.dto.js";
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
}