// Services
import AuthService from "#services/authService.js";

// Constants
import { SuccessMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Middleware
import asyncHandler from "#middlewares/asyncHandler.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";
import TokenUtils from "#utils/tokenUtils.js";

/**
 * @desc    Send OTP via OTPless
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const sessionId = await AuthService.sendOtp(phone);
  return ResponseUtils.success(res, { sessionId }, HttpStatus.OK, "OTP sent successfully");
});

/**
 * @desc    Verify OTP via OTPless and Login
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, sessionId, name } = req.body;
  const user = await AuthService.verifyOtp(phone, otp, sessionId, name);
  return TokenUtils.sendTokenResponse(user, HttpStatus.OK, res, SuccessMessages.LOGIN_SUCCESS);
});

/**
 * @desc    Logout
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = (_req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  return ResponseUtils.success(res, {}, HttpStatus.OK, SuccessMessages.LOGOUT_SUCCESS);
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);
  return ResponseUtils.success(res, user, HttpStatus.OK, SuccessMessages.PROFILE_LOADED);
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
  return ResponseUtils.success(res, user, HttpStatus.OK, SuccessMessages.PROFILE_UPDATED);
});
