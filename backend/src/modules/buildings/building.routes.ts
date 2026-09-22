import { Router } from "express";

import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { SUPER_ADMIN_ROLE } from "../roles/role.types.js";
import unitRoutes from "../units/unit.routes.js";
import { BuildingController } from "./building.controller.js";
import { BuildingService } from "./building.service.js";

const router = Router();

const buildingService = new BuildingService();
const buildingController = new BuildingController(buildingService);

router.post(
  "/",
  authenticate,
  authorizeRoles(SUPER_ADMIN_ROLE),
  buildingController.create,
);

router.use("/:buildingId/units", unitRoutes);

export default router;
