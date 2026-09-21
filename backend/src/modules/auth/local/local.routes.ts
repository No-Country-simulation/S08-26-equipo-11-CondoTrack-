import { Router } from "express";

import { AuthController } from "./auth.controller.js";
import { LocalAuthRepository } from "./auth.repository.js";
import { LocalAuthService } from "./auth.service.js";

const router = Router();

const authRepository = new LocalAuthRepository();
const authService = new LocalAuthService(authRepository);
const authController = new AuthController(authService);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

router.post("/login", (req, res, next) => authController.login(req, res, next));


export default router;