// Third-party
import jwt from "jsonwebtoken";

// Config
import Env from "#config/env.js";

// Constants
import { ErrorMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

// Models
import User from "#models/User.js";
import TokenBlocklist from "#models/TokenBlocklist.js";

/**
 * Protect routes — validates JWT from cookie or Authorization header.
 * Also rejects tokens that have been explicitly revoked via logout.
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

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
