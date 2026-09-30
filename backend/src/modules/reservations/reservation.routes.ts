import { Router } from "express";

import {
  authenticate,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { RESIDENT_ROLE } from "../roles/role.types.js";
import { ReservationController } from "./reservation.controller.js";
import { ReservationRepository } from "./reservation.repository.js";
import { ReservationService } from "./reservation.service.js";

const router = Router();

const controller = new ReservationController(
  new ReservationService(new ReservationRepository()),
);

router.post(
  "/:id/reservations",
  authenticate,
  authorizeRoles(RESIDENT_ROLE),
  controller.create,
);

export default router;
