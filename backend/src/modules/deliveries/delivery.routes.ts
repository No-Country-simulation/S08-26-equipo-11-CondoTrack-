import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { DeliveryController } from "./delivery.controller.js";
import { DeliveryRepository } from "./delivery.repository.js";
import { DeliveryService } from "./delivery.service.js";

const router = Router();

const controller = new DeliveryController(
  new DeliveryService(new DeliveryRepository()),
);

router.patch("/:id/deliver", authenticate, controller.deliver);

export default router;
