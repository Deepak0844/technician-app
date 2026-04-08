import express from "express";

// Controllers
import * as authController from "#controllers/authController.js";

// Middlewares
import { protect } from "#middlewares/authMiddleware.js";
import { validateBody } from "#middlewares/validateMiddleware.js";

// Schemas
// Schemas
import { sendOtpSchema, verifyOtpSchema } from "#schemas/validationSchemas.js";

const router = express.Router();

router.post("/send-otp", validateBody(sendOtpSchema), authController.sendOtp);
router.post("/verify-otp", validateBody(verifyOtpSchema), authController.verifyOtp);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.put("/me", protect, authController.updateProfile);

export default router;
