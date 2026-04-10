

// Constants
import { HttpStatus } from "#constants/httpConstants.js";

// Utils
import ResponseUtils from "#utils/responseUtils.js";

/**
 * Validate request body against a Zod schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return ResponseUtils.error(res, "Validation failed", HttpStatus.BAD_REQUEST, errors);
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request query against a Zod schema
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return ResponseUtils.error(res, "Validation failed", HttpStatus.BAD_REQUEST, errors);
    }
    // Delete old keys and assign validated data since req.query has only a getter in Express 5
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, result.data);
    next();
  };
}

export { validateBody, validateQuery };
