import { Router } from "express";
import passport from "passport";

import { googleCallback } from "./google.controller.js";
import "./google.strategy.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false, // cuidado
  }),
  googleCallback,
);

export default router;
