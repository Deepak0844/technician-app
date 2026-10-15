// Config
import Env from "#config/env.js";

// Constants
import { ErrorMessages, TwoFactor } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import { AppError } from "#utils/errorUtils.js";

// Utils (token)
import TokenUtils from "#utils/tokenUtils.js";

// Models
import User from "#models/User.js";
import RefreshToken from "#models/RefreshToken.js";

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

/**
 * Save a new logo URL to the user document.
 */
async function saveLogoUrl(userId, logoUrl) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { companyLogo: logoUrl } },
    { new: true, runValidators: true },
  );
  if (!user)
    throw new AppError(ErrorMessages.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  return user;
}

/**
 * Exchange a refresh token for a new access token + rotated refresh token.
 * Replaying an already-used token revokes the whole session family.
 */
async function refreshSession(rawToken) {
  const invalid = () =>
    new AppError(ErrorMessages.REFRESH_TOKEN_INVALID, HttpStatus.UNAUTHORIZED);

  const tokenHash = TokenUtils.hashToken(rawToken);

  // Atomically claim the token so two concurrent refreshes can't both succeed
  const claimed = await RefreshToken.findOneAndUpdate(
    { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
  );

  if (!claimed) {
    // Known token that was already used → reuse detected, kill the session
    const existing = await RefreshToken.findOne({ tokenHash });
    if (existing)
      await RefreshToken.deleteMany({ familyId: existing.familyId });
    throw invalid();
  }

  const user = await User.findById(claimed.userId);
  if (!user) {
    await RefreshToken.deleteMany({ familyId: claimed.familyId });
    throw invalid();
  }

  const token = TokenUtils.signToken(user._id);
  const refreshToken = await TokenUtils.createRefreshToken(
    user._id,
    claimed.familyId,
  );
  return { token, refreshToken };
}

/**
 * Revoke the whole session (family) a refresh token belongs to.
 */
async function revokeSession(rawToken) {
  if (!rawToken) return;
  const existing = await RefreshToken.findOne({
    tokenHash: TokenUtils.hashToken(rawToken),
  });
  if (existing) await RefreshToken.deleteMany({ familyId: existing.familyId });
}

const AuthService = {
  refreshSession,
  revokeSession,
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  saveLogoUrl,
};

export default AuthService;
