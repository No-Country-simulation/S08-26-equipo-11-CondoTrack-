import { Request, RequestHandler } from "express";

import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { validateQrDto, validateSearchAccessQuery } from "./access.dto.js";
import { validateCreateVisitDto } from "./create-visit.dto.js";
import { AccessService } from "./access.service.js";

export class AccessController {
  constructor(private readonly service: AccessService) {}

  private unitId(req: Request) {
    const param = req.params.unitId;
    const unitId = Array.isArray(param) ? param[0] : param;

    if (
      !unitId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        unitId,
      )
    ) {
      throw new AppError(
        "El identificador de la unidad debe ser un UUID válido",
        400,
      );
    }

    return unitId;
  }

  createVisit: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.createVisit(
      this.unitId(req),
      validateCreateVisitDto(req.body),
      req.authenticatedUser!,
    );

    res.status(201).json({ success: true, data });
  });

  validateQr: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.validateQr(
      validateQrDto(req.body).qrToken,
      req.authenticatedUser!,
    );

    res.json({ success: true, data });
  });

  search: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.search(
      validateSearchAccessQuery(req.query).query,
      req.authenticatedUser!,
    );

    res.json({ success: true, data });
  });

  exit: RequestHandler = catchAsync(async (req, res) => {
    const param = req.params.id;
    const id = Array.isArray(param) ? param[0] : param;

    if (!id) {
      throw new AppError(
        "El identificador de la autorizacion es obligatorio",
        400,
      );
    }

    const data = await this.service.registerExit(
      id,
      req.authenticatedUser!,
    );

    res.json({ success: true, data });
  });
}