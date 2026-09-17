import { Router } from "express";

import { AuthController } from "./local/register.controller.js";
import { RegisterRepository } from "./local/register.repository.js";
import { RegisterService } from "./local/register.service.js";

const router = Router();

const registerRepository = new RegisterRepository();
const registerService = new RegisterService(registerRepository);
const authController = new AuthController(registerService);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

export default router;