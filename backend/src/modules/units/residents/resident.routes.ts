import { Router } from "express";

import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeUnitAdmin } from "../../../middlewares/authorize-unit-admin.middleware.js";
import { ResidentController } from "./resident.controller.js";

export function createResidentRoutes(controller: ResidentController) {
  const router = Router({ mergeParams: true });

  router.post("/", authenticate, authorizeUnitAdmin, controller.link);
  router.get("/", authenticate, authorizeUnitAdmin, controller.list);

  return router;
}
