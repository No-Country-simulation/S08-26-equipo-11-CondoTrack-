import { Router } from "express";
import passport from "passport";

import { AuthController } from "./local/auth.controller.js";
import { LocalAuthRepository } from "./local/auth.repository.js";
import { LocalAuthService } from "./local/auth.service.js";
import { googleCallback } from "./auth.controller.js";
import "./strategies/google.strategy.js";

const router = Router();

const authRepository = new LocalAuthRepository();
const authService = new LocalAuthService(authRepository);
const authController = new AuthController(authService);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

router.post("/login", (req, res, next) => authController.login(req, res, next));

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleCallback,
);

export default router;