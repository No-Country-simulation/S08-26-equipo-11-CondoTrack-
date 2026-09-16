import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";

const router = Router();

router.use("/auth", authRouter); // registro de usuarios con formulario

export default router;
