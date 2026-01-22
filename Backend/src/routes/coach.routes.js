import express from "express";
import {
  createCoach,
  getAllCoaches,
  deleteCoach,
  getMyCoachProfile,
  updateCoachPayoutDetails,
  updateCoachProfile,
  updateCoachPayoutRates,
} from "../controllers/coach.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, allowRoles("ADMIN"), getAllCoaches);
router.post("/create", authMiddleware, allowRoles("ADMIN"), createCoach);
router.delete("/:id", authMiddleware, allowRoles("ADMIN"), deleteCoach);

// Get my coach profile
router.get(
  "/me/profile",
  authMiddleware,
  allowRoles("COACH"),
  getMyCoachProfile,
);

// Update my basic profile
router.patch(
  "/me/profile",
  authMiddleware,
  allowRoles("COACH"),
  updateCoachProfile,
);

// Update my payout details (BANK / UPI)
router.patch(
  "/me/payout-details",
  authMiddleware,
  allowRoles("COACH"),
  updateCoachPayoutDetails,
);

// ADMIN: Update coach payout rates
router.patch(
  "/:coachAccountId/payout-rates",
  authMiddleware,
  allowRoles("ADMIN"),
  updateCoachPayoutRates,
);

export default router;
