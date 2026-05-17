// Constants
import {
  AUTH_COOKIE_NAME,
  ErrorMessages,
  SuccessMessages,
} from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";
import TokenUtils from "#utils/tokenUtils.js";
import logger from "#utils/logger.js";

// Services
import AuthService from "#services/authService.js";

// Models
import TokenBlocklist from "#models/TokenBlocklist.js";

// Middleware
import asyncHandler from "#middlewares/asyncHandler.js";

/**
 * @desc    Send OTP via OTPless
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const sessionId = await AuthService.sendOtp(phone);
  return ResponseUtils.success(
    res,
    { sessionId },
    HttpStatus.OK,
    SuccessMessages.OTP_SENT,
  );
});

/**
 * @desc    Verify OTP via OTPless and Login
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, sessionId, name } = req.body;
  const user = await AuthService.verifyOtp(phone, otp, sessionId, name);
  return TokenUtils.sendTokenResponse(
    user,
    HttpStatus.OK,
    res,
    SuccessMessages.LOGIN_SUCCESS,
  );
});

/**
 * @desc    Logout — revokes the current JWT so it cannot be reused even if
 *          the mobile client still holds it in SecureStore.
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // req.token and req.tokenExp are attached by the protect middleware
  if (req.token && req.tokenExp) {
    await TokenBlocklist.findOneAndUpdate(
      { token: req.token },
      { token: req.token, expiresAt: new Date(req.tokenExp * 1000) },
      { upsert: true },
    ).catch((err) => {
      // Non-fatal — log but don't block the logout response
      logger.error({ err }, "TokenBlocklist upsert failed during logout");
    });
  }

  res.clearCookie(AUTH_COOKIE_NAME, { httpOnly: true, sameSite: "strict" });
  return ResponseUtils.success(
    res,
    {},
    HttpStatus.OK,
    SuccessMessages.LOGOUT_SUCCESS,
  );
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);
  return ResponseUtils.success(
    res,
    user,
    HttpStatus.OK,
    SuccessMessages.PROFILE_LOADED,
  );
});

/**
 * @desc    Update profile (name)
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, companyName, phone, email, address } = req.body;
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (companyName !== undefined) updateFields.companyName = companyName;
  if (phone !== undefined) updateFields.phone = phone;
  if (email !== undefined) updateFields.email = email;
  if (address !== undefined) updateFields.address = address;

  const user = await AuthService.updateProfile(req.user.id, updateFields);
  return ResponseUtils.success(
    res,
    user,
    HttpStatus.OK,
    SuccessMessages.PROFILE_UPDATED,
  );
});
/**
 * @desc    Upload company logo
 * @route   POST /api/v1/auth/me/logo
 * @access  Private
 */
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return ResponseUtils.error(
      res,
      ErrorMessages.LOGO_MISSING,
      HttpStatus.BAD_REQUEST,
    );
  }

  // Convert buffer to base64 Data URI
  const base64Image = req.file.buffer.toString("base64");
  const logoUrl = `data:${req.file.mimetype};base64,${base64Image}`;

  const user = await AuthService.saveLogoUrl(
    req.user.id,
    logoUrl
  );

  return ResponseUtils.success(
    res,
    user,
    HttpStatus.OK,
    SuccessMessages.LOGO_UPLOADED,
  );
});
