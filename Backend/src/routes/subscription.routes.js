import express from "express";
import {
  getAllSubscriptions,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, allowRoles("ADMIN"), getAllSubscriptions);

router.patch(
  "/:subscriptionId/pause",
  authMiddleware,
  allowRoles("ADMIN"),
  pauseSubscription
);

router.patch(
  "/:subscriptionId/resume",
  authMiddleware,
  allowRoles("ADMIN"),
  resumeSubscription
);

router.patch(
  "/:subscriptionId/cancel",
  authMiddleware,
  allowRoles("ADMIN"),
  cancelSubscription
);

export default router;
