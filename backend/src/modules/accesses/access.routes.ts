import { Router } from "express";

import { authenticate, authorizeRoles } from "../../middlewares/auth.middleware.js";
import {
  ADMIN_ROLE,
  RESIDENT_ROLE,
  SUPER_ADMIN_ROLE,
} from "../roles/role.types.js";
import { AccessController } from "./access.controller.js";
import { AccessRepository } from "./access.repository.js";
import { AccessService } from "./access.service.js";

const router = Router({ mergeParams: true });

const repository = new AccessRepository();
const service = new AccessService(repository);
const controller = new AccessController(service);

router.use(
  authenticate,
  authorizeRoles(RESIDENT_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE),
);

router.post("/", controller.createVisit);

export default router;