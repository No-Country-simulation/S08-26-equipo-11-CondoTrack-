import { RequestHandler } from "express";

import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { isUuid } from "../../utils/uuid.js";
import {
  validateCreateDelivery,
  validateListDeliveries,
} from "./delivery.dto.js";
import { DeliveryService } from "./delivery.service.js";

const uuid = (param: string | string[] | undefined) => {
  const id = Array.isArray(param) ? param[0] : param;

  if (!id || !isUuid(id)) {
    throw new AppError("El identificador debe ser un UUID válido", 400);
  }

  return id;
};

export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  create: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.create(
      uuid(req.params.unitId),
      validateCreateDelivery(req.body),
      req.authenticatedUser!,
    );

    res.status(201).json({
      success: true,
      data,
    });
  });

  deliver: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.deliver(
      uuid(req.params.id),
      req.authenticatedUser!,
    );

    res.status(200).json({
      success: true,
      data,
    });
  });

  list: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.list(
      uuid(req.params.buildingId),
      validateListDeliveries(req.query),
      req.authenticatedUser!,
    );

    res.status(200).json({
      success: true,
      data,
    });
  });

  mine: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.listMine(
      validateListDeliveries(req.query),
      req.authenticatedUser!,
    );

    res.status(200).json({
      success: true,
      data,
    });
  });
}
