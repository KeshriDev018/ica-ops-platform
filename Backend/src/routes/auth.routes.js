import express from "express";
import { login, refreshAccessToken,logout,setPassword,resendSetPasswordLink } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/set-password", setPassword);
router.post("/resend-set-password", resendSetPasswordLink);


export default router;
