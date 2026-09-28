import { Router } from "express";

import {
  authenticate,
  authorizeBuildingParam,
} from "../../middlewares/auth.middleware.js";
import {
  ADMIN_ROLE,
  MAINTENANCE_ROLE,
  RECEPTION_ROLE,
  RESIDENT_ROLE,
} from "../roles/role.types.js";
import { CommonAreaController } from "./common-area.controller.js";
import { CommonAreaRepository } from "./common-area.repository.js";
import { CommonAreaService } from "./common-area.service.js";

const router = Router({ mergeParams: true });

const controller = new CommonAreaController(
  new CommonAreaService(new CommonAreaRepository()),
);

router.post(
  "/",
  authenticate,
  authorizeBuildingParam("buildingId", ADMIN_ROLE),
  controller.create,
);

router.get(
  "/",
  authenticate,
  authorizeBuildingParam(
    "buildingId",
    ADMIN_ROLE,
    RECEPTION_ROLE,
    MAINTENANCE_ROLE,
    RESIDENT_ROLE,
  ),
  controller.list,
);

export default router;
