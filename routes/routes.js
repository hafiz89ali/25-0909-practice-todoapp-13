import { Router } from "express";
import healthController from "../controller/health.js";
import authController from "../controller/auth.js";
import isAuth from "../middleware/isAuth.js";
import privacyController from "../controller/privacy.js";

const router = Router();
router.get("/", healthController.getHealth);
router.post("/", healthController.postHealth);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/public", privacyController.publicPath);
router.get("/private", isAuth, privacyController.privatePath);

export default router;
