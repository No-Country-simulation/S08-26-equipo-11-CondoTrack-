import { Router } from "express";

import {
  authenticate,
  authorizeBuildingQuery,
  authorizeRoles,
} from "../../middlewares/auth.middleware.js";
import { UserController } from "./user.controller.js";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";

const router = Router();

const controller = new UserController(new UserService(new UserRepository()));

router.use(authenticate);

router.get(
  "/",
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  authorizeBuildingQuery(
    "buildingId",
    { requiredMessage: "Debe indicar el edificio a consultar" },
    "ADMIN",
  ),
  controller.list,
);

router.get("/:id", controller.getById);

router.patch("/:id/profile", controller.updateProfile);

router.patch(
  "/:id/manage",
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  controller.manageUser,
);

export default router;
