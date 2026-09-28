import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware.js";
import { getMe } from "./me.controller.js";

const router = Router();

router.get("/", authenticate, getMe);

export default router;
