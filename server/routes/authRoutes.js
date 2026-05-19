import express from "express";
import rateLimit from "express-rate-limit";

// Controllers
import * as authController from "#controllers/authController.js";

// Middlewares
import { protect } from "#middlewares/authMiddleware.js";
import { validateBody } from "#middlewares/validateMiddleware.js";
import { uploadLogoMiddleware } from "#middlewares/uploadMiddleware.js";

// Schemas
import {
  sendOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
} from "#schemas/validationSchemas.js";

const router = express.Router();

// Send OTP: max 5 per 10 minutes per phone number (prevents OTP bombing)
const sendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `phone:${req.body?.phone ?? req.ip}`,
  message: "Too many OTP requests for this number. Please wait 10 minutes.",
});

// Verify OTP: max 10 attempts per 10 minutes per phone (prevents brute force)
const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `phone:${req.body?.phone ?? req.ip}`,
  message:
    "Too many verification attempts for this number. Please wait 10 minutes.",
});

router.post(
  "/send-otp",
  sendOtpLimiter,
  validateBody(sendOtpSchema),
  authController.sendOtp,
);
router.post(
  "/verify-otp",
  verifyOtpLimiter,
  validateBody(verifyOtpSchema),
  authController.verifyOtp,
);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getMe);
router.put(
  "/me",
  protect,
  validateBody(updateProfileSchema),
  authController.updateProfile,
);
router.post(
  "/me/logo",
  protect,
  uploadLogoMiddleware,
  authController.uploadLogo,
);

export default router;
