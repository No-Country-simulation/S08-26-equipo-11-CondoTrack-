import { RequestHandler } from "express";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { validateCreateCommonArea } from "./common-area.dto.js";
import { CommonAreaService } from "./common-area.service.js";

const uuid = (param: string | string[] | undefined) => {
  const id = Array.isArray(param) ? param[0] : param;

  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    throw new AppError("El identificador debe ser un UUID válido", 400);
  }

  return id;
};

export class CommonAreaController {
  constructor(private readonly service: CommonAreaService) {}

  create: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.create(
      uuid(req.params.buildingId),
      validateCreateCommonArea(req.body),
    );

    res.status(201).json({
      success: true,
      data,
    });
  });

  list: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.list(uuid(req.params.buildingId));

    res.status(200).json({
      success: true,
      data,
    });
  });
}
