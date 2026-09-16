import { RequestHandler } from "express";

import catchAsync from "../../../utils/catchAsync.js";
import { validateRegisterDto } from "./register.dto.js";
import { RegisterService } from "./register.service.js";

export class AuthController {
  constructor(private readonly registerService: RegisterService) {}

  register: RequestHandler = catchAsync(async (req, res) => {
    const dto = validateRegisterDto(req.body);
    const result = await this.registerService.register(dto);

    res.status(201).json({
      success: true,
      data: result,
    });
  });
}