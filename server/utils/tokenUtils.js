import jwt from "jsonwebtoken";

// Config
import Env from "#config/env.js";

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
function sendTokenResponse(user, statusCode, res, message = "Success") {
  const token = signToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: Env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      token, // mobile clients store this in expo-secure-store
      _id: user._id,
      phone: user.phone,
      name: user.name,
      isFirstLogin: !user.name, // true when user has never set their name
    },
  });
}

const TokenUtils = {
  signToken,
  verifyToken,
  sendTokenResponse,
};

export default TokenUtils;
