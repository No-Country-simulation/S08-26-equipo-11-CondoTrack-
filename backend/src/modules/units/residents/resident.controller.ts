import { RequestHandler } from "express";

import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { validateLinkResidentDto } from "./link-resident.dto.js";

export interface ResidentServiceContract {
  link(unitId: string, email: string): Promise<unknown>;
  list(unitId: string): Promise<unknown[]>;
}

export class ResidentController {
  constructor(private readonly residentService: ResidentServiceContract) {}

  link: RequestHandler = catchAsync(async (req, res) => {
    const unit = res.locals.unit;

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    const { email } = validateLinkResidentDto(req.body);
    const resident = await this.residentService.link(unit.id, email);

    res.status(201).json({
      success: true,
      data: resident,
    });
  });

  list: RequestHandler = catchAsync(async (_req, res) => {
    const unit = res.locals.unit;

    if (!unit) {
      throw new AppError("Unidad no encontrada", 404);
    }

    const residents = await this.residentService.list(unit.id);

    res.status(200).json({
      success: true,
      data: residents,
    });
  });
}
