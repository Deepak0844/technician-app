import jwt from "jsonwebtoken";

// Models
import User from "#models/User.js";

// Config
import Env from "#config/env.js";

// Constants
import { ErrorMessages } from "#constants/generalConstants.js";
import { HttpStatus } from "#constants/httpConstants.js";

// Middleware
import asyncHandler from "#middlewares/asyncHandler.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

/**
 * Protect routes — validates JWT from cookie or Authorization header
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  try {
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return ResponseUtils.error(res, ErrorMessages.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, Env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return ResponseUtils.error(res, ErrorMessages.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return ResponseUtils.error(res, ErrorMessages.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
    }
    return ResponseUtils.error(res, ErrorMessages.NOT_AUTHORIZED, HttpStatus.UNAUTHORIZED);
  }
});
