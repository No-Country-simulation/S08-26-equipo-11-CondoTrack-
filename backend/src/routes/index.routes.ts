import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import buildingRoutes from "../modules/buildings/building.routes.js";

const router = Router();

router.use("/auth", authRoutes); 
router.use("/buildings", buildingRoutes);

export default router;