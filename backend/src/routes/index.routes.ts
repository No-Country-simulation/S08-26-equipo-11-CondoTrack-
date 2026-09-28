import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import buildingRoutes from "../modules/buildings/building.routes.js";
import residentRoutes from "../modules/units/residents/resident.routes.js";
import unitDetailRoutes from "../modules/units/unit-detail.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import reservationRoutes from "../modules/reservations/reservation.routes.js";
import deliveryRoutes from "../modules/deliveries/delivery.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/buildings", buildingRoutes);
router.use("/units", unitDetailRoutes);
router.use("/units/:unitId/residents", residentRoutes);
router.use("/common-areas", reservationRoutes);
router.use("/deliveries", deliveryRoutes);

export default router;
