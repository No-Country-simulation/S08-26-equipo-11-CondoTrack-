import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeUnitAdmin } from "../../../middlewares/authorize-unit-admin.middleware.js";
import { ResidentController } from "./resident.controller.js";
import { ResidentRepository } from "./resident.repository.js";
import { ResidentService } from "./resident.service.js";

const router = Router({ mergeParams: true });

const residentRepository = new ResidentRepository();
const residentService = new ResidentService(residentRepository);
const residentController = new ResidentController(residentService);

router.post("/", authenticate, authorizeUnitAdmin, residentController.link);
router.get("/", authenticate, authorizeUnitAdmin, residentController.list);

export default router;
