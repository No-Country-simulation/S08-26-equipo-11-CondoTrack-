import { Router } from "express";
import passport from "passport";

import { googleCallback } from "./auth.controller.js";
import "./strategies/google.strategy.js";

const router = Router();

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes funcionando" });
});

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