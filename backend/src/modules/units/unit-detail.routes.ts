import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeUnitAdmin } from "../../middlewares/authorize-unit-admin.middleware.js";
import visitsRoutes from "../accesses/access.routes.js";
import { UnitController } from "./unit.controller.js";
import { UnitService } from "./unit.service.js";
import unitDeliveryRoutes from "../deliveries/unit-delivery.routes.js";

const router = Router();

const unitService = new UnitService();
const unitController = new UnitController(unitService);

router.get(
  "/:unitId",
  authenticate,
  authorizeUnitAdmin,
  unitController.getById,
);

router.patch(
  "/:unitId",
  authenticate,
  authorizeUnitAdmin,
  unitController.update,
);

router.use("/:unitId/visits", visitsRoutes);
router.use("/:unitId/deliveries", unitDeliveryRoutes);

export default router;
