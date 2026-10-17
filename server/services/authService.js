// Node
import crypto from "crypto";

// Config
import Env from "#config/env.js";

// Constants
import {
  ErrorMessages,
  REFRESH_REUSE_GRACE_MS,
  TwoFactor,
} from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import { AppError } from "#utils/errorUtils.js";
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Create and persist a refresh token. Pass an existing `familyId` when
 * rotating so the session lineage is preserved.
 */
async function issueRefreshToken(userId, familyId = crypto.randomUUID()) {
  const token = TokenUtils.generateRefreshToken();
  await RefreshToken.create({
    tokenHash: TokenUtils.hashToken(token),
    userId,
    familyId,
    expiresAt: new Date(Date.now() + Env.REFRESH_TOKEN_EXPIRES_DAYS * DAY_MS),
  });
  return token;
}

/**
 * Revoke every refresh token of one login session.
 */
async function revokeFamily(familyId) {
  await RefreshToken.deleteMany({ familyId });
}

/**
 * Exchange a refresh token for a new access token + rotated refresh token.
 * Replaying a used token revokes the whole session family, unless it was
 * used moments ago — then it is a client retry after a lost response and
 * gets a fresh pair in the same family.
 */
async function refreshSession(rawToken) {
  const invalidRefreshError = () =>
    new AppError(ErrorMessages.REFRESH_TOKEN_INVALID, HttpStatus.UNAUTHORIZED);

  const tokenHash = TokenUtils.hashToken(rawToken);
  const now = new Date();

  // Atomically claim the token so two concurrent refreshes can't both succeed
  let claimed = await RefreshToken.findOneAndUpdate(
    { tokenHash, usedAt: null, expiresAt: { $gt: now } },
    { $set: { usedAt: now } },
  );

  if (!claimed) {
    const existing = await RefreshToken.findOne({ tokenHash });
    const isRecentRetry =
      existing?.usedAt &&
      existing.expiresAt > now &&
      now - existing.usedAt < REFRESH_REUSE_GRACE_MS;

    if (!isRecentRetry) {
      if (existing) await revokeFamily(existing.familyId);
      throw invalidRefreshError();
    }
    claimed = existing;
  }

  const user = await User.findById(claimed.userId);
  if (!user) {
    await revokeFamily(claimed.familyId);
    throw invalidRefreshError();
  }

  const token = TokenUtils.signToken(user._id);
  const refreshToken = await issueRefreshToken(user._id, claimed.familyId);
  return { token, refreshToken };
}

/**
 * Revoke the session (family) a refresh token belongs to. Possession of the
 * token is the proof of ownership, so no user check is needed.
 */
async function revokeSession(rawToken) {
  if (!rawToken) return;
  const existing = await RefreshToken.findOne({
    tokenHash: TokenUtils.hashToken(rawToken),
  });
  if (existing) await revokeFamily(existing.familyId);
}

const AuthService = {
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  saveLogoUrl,
  issueRefreshToken,
  refreshSession,
  revokeSession,
};

export default AuthService;
