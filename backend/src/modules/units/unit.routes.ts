import { Router } from "express";

import {
  authenticate,
  authorizeBuildingRoles,
} from "../../middlewares/auth.middleware.js";
import { ADMIN_ROLE } from "../roles/role.types.js";
import { UnitController } from "./unit.controller.js";
import { UnitService } from "./unit.service.js";

const router = Router({
  mergeParams: true,
});

const unitService = new UnitService();
const unitController = new UnitController(unitService);

router.post(
  "/",
  authenticate,
  authorizeBuildingRoles(ADMIN_ROLE),
  unitController.create,
);

router.get(
  "/",
  authenticate,
  authorizeBuildingRoles(ADMIN_ROLE),
  unitController.list,
);

export default router;
