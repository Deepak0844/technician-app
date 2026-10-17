import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Constants
import { AuthRoutes } from "#constants/generalConstants.js";

// Controllers
import * as authController from "#controllers/authController.js";

// Middlewares
import { protect, identifyToken } from "#middlewares/authMiddleware.js";
import { validateBody } from "#middlewares/validateMiddleware.js";
import { uploadLogoMiddleware } from "#middlewares/uploadMiddleware.js";

// Schemas
import {
  sendOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  refreshTokenSchema,
  logoutSchema,
} from "#schemas/validationSchemas.js";

const router = express.Router();

// Send OTP: max 5 per 10 minutes per phone number (prevents OTP bombing)
const sendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `phone:${req.body?.phone ?? ipKeyGenerator(req.ip)}`,
  message: "Too many OTP requests for this number. Please wait 10 minutes.",
});

// Verify OTP: max 10 attempts per 10 minutes per phone (prevents brute force)
const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `phone:${req.body?.phone ?? ipKeyGenerator(req.ip)}`,
  message:
    "Too many verification attempts for this number. Please wait 10 minutes.",
});

// Refresh: generous per-IP cap, tokens are high-entropy so brute force is moot
const refreshLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: "Too many refresh attempts. Please wait a few minutes.",
});

router.post(
  AuthRoutes.SEND_OTP,
  sendOtpLimiter,
  validateBody(sendOtpSchema),
  authController.sendOtp,
);
router.post(
  AuthRoutes.VERIFY_OTP,
  verifyOtpLimiter,
  validateBody(verifyOtpSchema),
  authController.verifyOtp,
);
router.post(
  AuthRoutes.REFRESH,
  refreshLimiter,
  validateBody(refreshTokenSchema),
  authController.refresh,
);
router.post(
  AuthRoutes.LOGOUT,
  refreshLimiter,
  identifyToken,
  validateBody(logoutSchema),
  authController.logout,
);
router.get(AuthRoutes.ME, protect, authController.getMe);
router.put(
  AuthRoutes.ME,
  protect,
  validateBody(updateProfileSchema),
  authController.updateProfile,
);
router.post(
  AuthRoutes.ME_LOGO,
  protect,
  uploadLogoMiddleware,
  authController.uploadLogo,
);

export default router;
