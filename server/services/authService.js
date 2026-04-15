// Config
import Env from "#config/env.js";

// Constants
import { ErrorMessages, TwoFactor } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import { AppError } from "#utils/errorUtils.js";

// Models
import User from "#models/User.js";

/**
 * Send OTP via 2factor.in
 */
async function sendOtp(phone) {
  const url = `${TwoFactor.BASE_URL}/${Env.TWOFACTOR_API_KEY}/SMS/${phone}/AUTOGEN`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.Status !== TwoFactor.STATUS_SUCCESS) {
    throw new AppError(
      data.Details || ErrorMessages.TWOFACTOR_SEND_FAILED,
      HttpStatus.BAD_REQUEST,
    );
  }

  // Return the sessionId (Details field)
  return data.Details;
}

/**
 * Verify OTP via 2factor.in and upsert user
 */
async function verifyOtp(phone, otp, sessionId, name) {
  const url = `${TwoFactor.BASE_URL}/${Env.TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
  const response = await fetch(url);
  const data = await response.json();

  if (
    data.Status !== TwoFactor.STATUS_SUCCESS ||
    data.Details !== TwoFactor.OTP_MATCHED
  ) {
    throw new AppError(
      data.Details || ErrorMessages.TWOFACTOR_OTP_INVALID,
      HttpStatus.UNAUTHORIZED,
    );
  }

  // Upsert user
  const updateFields = {};
  if (name) updateFields.name = name;

  const user = await User.findOneAndUpdate(
    { phone },
    { $set: updateFields, $setOnInsert: { phone } },
    { upsert: true, new: true, runValidators: true },
  );

  return user;
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user)
    throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  return user;
}

async function updateProfile(userId, fields) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: fields },
    { new: true, runValidators: true },
  );
  if (!user)
    throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  return user;
}

const AuthService = {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
};

export default AuthService;
