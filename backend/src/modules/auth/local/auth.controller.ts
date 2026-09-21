import { RequestHandler } from "express";

import catchAsync from "../../../utils/catchAsync.js";
import { validateLoginDto } from "./login.dto.js";
import { validateRegisterDto } from "./register.dto.js";
import { LocalAuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: LocalAuthService) {}

  register: RequestHandler = catchAsync(async (req, res) => {
    const dto = validateRegisterDto(req.body);
    const result = await this.authService.register(dto);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  login: RequestHandler = catchAsync(async (req, res) => {
    const dto = validateLoginDto(req.body);
    const result = await this.authService.login(dto);

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}