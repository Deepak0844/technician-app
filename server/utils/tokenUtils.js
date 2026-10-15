// Node
import crypto from "crypto";

// Third-party
import jwt from "jsonwebtoken";

// Config
import Env from "#config/env.js";

// Constants
import { AUTH_COOKIE_NAME, CookieConfig } from "#constants/generalConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

// Models
import RefreshToken from "#models/RefreshToken.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Sign a JWT for a given user id
 */
function signToken(userId) {
  return jwt.sign({ id: userId }, Env.JWT_SECRET, {
    expiresIn: Env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify a JWT and return the decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, Env.JWT_SECRET);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create and persist a new opaque refresh token. Pass an existing `familyId`
 * when rotating so the session lineage is preserved.
 */
async function createRefreshToken(userId, familyId = crypto.randomUUID()) {
  const token = crypto.randomBytes(48).toString("base64url");
  await RefreshToken.create({
    tokenHash: hashToken(token),
    userId,
    familyId,
    expiresAt: new Date(Date.now() + Env.REFRESH_TOKEN_EXPIRES_DAYS * DAY_MS),
  });
  return token;
}

/**
 * Set the auth cookie (for web clients) AND return tokens in body (for mobile clients).
 * Mobile apps (React Native) have no browser cookie jar, so they read tokens from the
 * response body and store them in expo-secure-store.
 */
async function sendTokenResponse(user, statusCode, res, message) {
  const token = signToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: CookieConfig.HTTP_ONLY,
    sameSite: CookieConfig.SAME_SITE,
    secure: Env.NODE_ENV === "production",
    maxAge: CookieConfig.MAX_AGE_MS,
  };

  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

  return ResponseUtils.success(
    res,
    {
      token,
      refreshToken,
      _id: user._id,
      phone: user.phone,
      name: user.name,
      isFirstLogin: !user.name,
    },
    statusCode,
    message,
  );
}

const TokenUtils = {
  signToken,
  verifyToken,
  hashToken,
  createRefreshToken,
  sendTokenResponse,
};

export default TokenUtils;
