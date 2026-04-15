// Third-party
import jwt from "jsonwebtoken";

// Config
import Env from "#config/env.js";

// Constants
import {
  AUTH_COOKIE_NAME,
  CookieConfig,
} from "#constants/generalConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

/**
 * Sign a JWT for a given user id
 */
function signToken(userId) {
  return jwt.sign({ id: userId }, Env.JWT_SECRET, { expiresIn: Env.JWT_EXPIRES_IN });
}

/**
 * Verify a JWT and return the decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, Env.JWT_SECRET);
}

/**
 * Set the auth cookie (for web clients) AND return token in body (for mobile clients).
 * Mobile apps (React Native) have no browser cookie jar, so they read token from response body
 * and store it in expo-secure-store.
 */
function sendTokenResponse(user, statusCode, res, message) {
  const token = signToken(user._id);

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
  sendTokenResponse,
};

export default TokenUtils;
