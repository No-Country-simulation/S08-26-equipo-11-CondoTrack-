import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import buildingRoutes from "../modules/buildings/building.routes.js";
import residentRoutes from "../modules/units/residents/resident.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/buildings", buildingRoutes);
router.use("/units/:unitId/residents", residentRoutes);

export default router;
