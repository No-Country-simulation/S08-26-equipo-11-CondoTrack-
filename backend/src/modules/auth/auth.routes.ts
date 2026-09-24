import { Router } from "express";

import meRoutes from "./me/me.routes.js";
import localRoutes from "./local/local.routes.js";
import googleRoutes from "./google/google.routes.js";

const router = Router();

router.use("/me", meRoutes);
router.use(localRoutes);
router.use(googleRoutes);

export default router;
