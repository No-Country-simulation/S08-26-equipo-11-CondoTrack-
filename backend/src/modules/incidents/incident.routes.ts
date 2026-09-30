import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { IncidentController } from "./incident.controller.js";
import { IncidentRepository } from "./incident.repository.js";
import { IncidentService } from "./incident.service.js";

const router = Router();

const incidentRepository = new IncidentRepository();
const incidentService = new IncidentService(incidentRepository);
const incidentController = new IncidentController(incidentService);

router.patch("/:id", authenticate, incidentController.update);

export default router;
