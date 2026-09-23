import { Router } from "express";

import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "../roles/role.types.js";
import unitRoutes from "../units/unit.routes.js";
import { BuildingController } from "./building.controller.js";
import { BuildingRepository } from "./building.repository.js";
import { BuildingService } from "./building.service.js";

const router = Router();

const buildingRepository = new BuildingRepository();
const buildingService = new BuildingService(buildingRepository);
const buildingController = new BuildingController(buildingService);

router.post(
  "/",
  authenticate,
  authorizeRoles(SUPER_ADMIN_ROLE),
  buildingController.create,
);

router.get(
  "/",
  authenticate,
  authorizeRoles(SUPER_ADMIN_ROLE, ADMIN_ROLE),
  buildingController.list,
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(SUPER_ADMIN_ROLE, ADMIN_ROLE),
  buildingController.getById,
);

router.use("/:buildingId/units", unitRoutes);

export default router;
