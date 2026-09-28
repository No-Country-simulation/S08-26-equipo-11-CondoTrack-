import { Router } from "express";

import {
  authenticate,
  authorizeBuildingParam,
} from "../../middlewares/auth.middleware.js";
import { ADMIN_ROLE } from "../roles/role.types.js";
import { ReservationController } from "./reservation.controller.js";
import { ReservationRepository } from "./reservation.repository.js";
import { ReservationService } from "./reservation.service.js";

const router = Router({ mergeParams: true });

const controller = new ReservationController(
  new ReservationService(new ReservationRepository()),
);

router.get(
  "/",
  authenticate,
  authorizeBuildingParam("buildingId", ADMIN_ROLE),
  controller.list,
);

export default router;
