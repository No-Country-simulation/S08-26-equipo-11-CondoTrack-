import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeUnitAdmin } from "../../middlewares/authorize-unit-admin.middleware.js";
import { UnitController } from "./unit.controller.js";
import { UnitService } from "./unit.service.js";

const router = Router();

const unitService = new UnitService();
const unitController = new UnitController(unitService);

router.get(
  "/:unitId",
  authenticate,
  authorizeUnitAdmin,
  unitController.getById,
);

export default router;
