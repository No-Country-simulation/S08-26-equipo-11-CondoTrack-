import { Router } from "express";

import localRoutes from "./local/local.routes.js";
import googleRoutes from "./google/google.routes.js";

const router = Router();

router.use(localRoutes);
router.use(googleRoutes);

export default router;