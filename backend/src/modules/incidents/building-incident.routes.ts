import { Router } from "express";

import {
  authenticate,
  authorizeBuildingParam,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from "../roles/role.types.js";
import { IncidentController } from "./incident.controller.js";
import { IncidentRepository } from "./incident.repository.js";
import { IncidentService } from "./incident.service.js";

const router = Router();

const incidentRepository = new IncidentRepository();
const incidentService = new IncidentService(incidentRepository);
const incidentController = new IncidentController(incidentService);

router.get(
  "/",
  authenticate,
  authorizeBuildingParam("buildingId"),
  authorizeRoles(ADMIN_ROLE, SUPER_ADMIN_ROLE),
  incidentController.list,
);

export default router;
