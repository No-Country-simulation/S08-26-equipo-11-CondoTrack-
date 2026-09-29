import { Router } from "express";

import { authenticate, authorizeRoles } from "../../middlewares/auth.middleware.js";
import {
  ADMIN_ROLE,
  RECEPTION_ROLE,
  RESIDENT_ROLE,
  SUPER_ADMIN_ROLE,
} from "../roles/role.types.js";
import { AccessController } from "./access.controller.js";
import { AccessRepository } from "./access.repository.js";
import { AccessService } from "./access.service.js";

const repository = new AccessRepository();
const service = new AccessService(repository);
const controller = new AccessController(service);

// CT-S4-01: montado en /units/:unitId/visits por unit-detail.routes.ts
const router = Router({ mergeParams: true });

router.use(
  authenticate,
  authorizeRoles(RESIDENT_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE),
);

router.post("/", controller.createVisit);

export default router;

// CT-S4-02: flujo de porteria, montado en /access por index.routes.ts.
// El alcance por edificio lo resuelve el service con la misma logica de
// authorizeBuildingParam, por eso aqui solo se filtra el rol.
export const accessRouter = Router();

accessRouter.use(
  authenticate,
  authorizeRoles(RECEPTION_ROLE, ADMIN_ROLE, SUPER_ADMIN_ROLE),
);

accessRouter.post("/validate", controller.validateQr);
accessRouter.get("/search", controller.search);
accessRouter.patch("/:id/exit", controller.exit);