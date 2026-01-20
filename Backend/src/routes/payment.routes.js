import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* Admin initiates payment */
router.post(
  "/create-order",
  authMiddleware,
  allowRoles("ADMIN"),
  createPaymentOrder,
);

/* Real payment verification */
router.post("/verify", verifyPayment);

export default router;
