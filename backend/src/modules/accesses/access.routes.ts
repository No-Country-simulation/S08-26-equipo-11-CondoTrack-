import { Router } from "express";

import { AccessController } from "./access.controller.js";
import { AccessRepository } from "./access.repository.js";
import { AccessService } from "./access.service.js";

const router = Router({ mergeParams: true });

const repository = new AccessRepository();
const service = new AccessService(repository);
const controller = new AccessController(service);

router.post("/", controller.createVisit);

export default router;