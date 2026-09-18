import { Router } from "express";
import passport from "passport";

import { AuthController } from "./local/register.controller.js";
import { RegisterRepository } from "./local/register.repository.js";
import { RegisterService } from "./local/register.service.js";
import { googleCallback } from "./auth.controller.js";
import "./strategies/google.strategy.js";

const router = Router();

const registerRepository = new RegisterRepository();
const registerService = new RegisterService(registerRepository);
const authController = new AuthController(registerService);

router.post("/register", (req, res, next) =>
  authController.register(req, res, next),
);

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