import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import buildingRoutes from "../modules/buildings/building.routes.js";
import residentRoutes from "../modules/units/residents/resident.routes.js";
import unitDetailRoutes from "../modules/units/unit-detail.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/buildings", buildingRoutes);

router.use("/units", unitDetailRoutes);
router.use("/units/:unitId/residents", residentRoutes);

export default router;
