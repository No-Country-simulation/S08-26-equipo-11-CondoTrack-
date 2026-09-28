import { RequestHandler } from "express";

import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { validateListUsers, validateManage, validateProfile } from "./user.dto.js";
import { UserService } from "./user.service.js";

export class UserController {
  constructor(private readonly service: UserService) {}

  private id(param: string | string[] | undefined) {
    const id = Array.isArray(param) ? param[0] : param;

    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      throw new AppError("El id debe ser un UUID válido", 400);
    }

    return id;
  }

  list: RequestHandler = catchAsync(async (req, res) => {
    const filters = validateListUsers(req.query);

    const scope = await this.service.resolveListScope(filters);

    const data = await this.service.list(scope, filters);

    res.json({ success: true, data });
  });

  getById: RequestHandler = catchAsync(async (req, res) => {
    const data = await this.service.getById(
      this.id(req.params.id),
      req.authenticatedUser!,
    );

    res.json({ success: true, data });
  });

  updateProfile: RequestHandler = catchAsync(async (req, res) => {
    const id = this.id(req.params.id);

    const data = await this.service.updateProfile(
      id,
      validateProfile(req.body),
      req.authenticatedUser!,
      req.ip ?? null,
    );

    res.json({ success: true, data });
  });

  manageUser: RequestHandler = catchAsync(async (req, res) => {
    const id = this.id(req.params.id);

    const data = await this.service.manageUser(
      id,
      validateManage(req.body),
      req.authenticatedUser!,
      req.ip ?? null,
    );

    res.json({ success: true, data });
  });
}
