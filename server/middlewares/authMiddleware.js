// Third-party
import jwt from "jsonwebtoken";

// Config
import Env from "#config/env.js";

// Constants
import {
  AUTH_COOKIE_NAME,
  ErrorMessages,
} from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

// Models
import User from "#models/User.js";
import TokenBlocklist from "#models/TokenBlocklist.js";

/**
 * Read the access token from the Authorization header or auth cookie.
 * Header wins over cookie: native clients may hold a stale cookie from
 * login while sending a freshly refreshed bearer token.
 */
function extractToken(req) {
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }
  return req.cookies?.[AUTH_COOKIE_NAME];
}

/**
 * Protect routes — validates JWT from Authorization header or cookie.
 * Also rejects tokens that have been explicitly revoked via logout.
 */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return ResponseUtils.error(
        res,
        ErrorMessages.NOT_AUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const decoded = jwt.verify(token, Env.JWT_SECRET);

    // Check if this token has been revoked (i.e. user logged out)
    const isRevoked = await TokenBlocklist.exists({ token });
    if (isRevoked) {
      return ResponseUtils.error(
        res,
        ErrorMessages.TOKEN_EXPIRED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return ResponseUtils.error(
        res,
        ErrorMessages.NOT_AUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Attach decoded payload for downstream use (e.g. logout)
    req.token = token;
    req.tokenExp = decoded.exp;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return ResponseUtils.error(
        res,
        ErrorMessages.TOKEN_EXPIRED,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return ResponseUtils.error(
      res,
      ErrorMessages.NOT_AUTHORIZED,
      HttpStatus.UNAUTHORIZED,
    );
  }
};

/**
 * Attach req.token / req.tokenExp when a still-valid access token is sent,
 * but never reject. For endpoints (logout) that must work with an expired
 * or missing access token.
 */
export const identifyToken = (req, res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, Env.JWT_SECRET);
      req.token = token;
      req.tokenExp = decoded.exp;
    } catch {
      // Expired or malformed: nothing to blocklist
    }
  }
  next();
};
