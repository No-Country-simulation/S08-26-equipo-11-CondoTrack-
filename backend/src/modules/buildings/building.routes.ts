import { Router } from "express";

import { BuildingController } from "./building.controller.js";
import { BuildingService } from "./building.service.js";

const router = Router();

const buildingService = new BuildingService();
const buildingController = new BuildingController(buildingService);

router.post(
  "/",
  buildingController.create,
);

export default router;