/**
 * Common Error Messages
 */
export const ErrorMessages = {
  SERVER_ERROR: "Server Error",
  NOT_AUTHORIZED: "Not authorized to access this route",
  TOKEN_EXPIRED: "Your session has expired, please log in again",
  INVALID_TOKEN: "Invalid or expired token",
  RESOURCE_NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Please provide required fields",
  TWOFACTOR_SEND_FAILED: "Failed to send OTP",
  TWOFACTOR_OTP_INVALID: "OTP is invalid or expired",
  USER_NOT_FOUND: "User not found",
  CUSTOMER_NOT_FOUND: "Customer not found",
  JOB_NOT_FOUND: "Job not found",
};

/**
 * Common Success Messages
 */
export const SuccessMessages = {
  LOGIN_SUCCESS: "Logged in successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  PROFILE_LOADED: "User profile loaded successfully",
  PROFILE_UPDATED: "User profile updated successfully",
  CUSTOMER_CREATED: "Customer created successfully",
  CUSTOMER_LOADED: "Customer loaded successfully",
  CUSTOMERS_LOADED: "Customers loaded successfully",
  CUSTOMER_UPDATED: "Customer updated successfully",
  JOB_CREATED: "Job created successfully",
  JOB_LOADED: "Job loaded successfully",
  JOBS_LOADED: "Jobs loaded successfully",
  JOB_REPEATED: "Job repeated successfully",
  JOB_UPDATED: "Job updated successfully",
  JOB_DELETED: "Job deleted successfully",
  DASHBOARD_LOADED: "Dashboard summary loaded successfully",
};

/**
 * Auth / Cookie Constants
 */
export const AUTH_COOKIE_NAME = "token";

export const CookieConfig = {
  HTTP_ONLY: true,
  SAME_SITE: "strict",
  SECURE: process.env.NODE_ENV === "production",
  MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Pagination Defaults
 */
export const DefaultPagination = {
  PAGE: 1,
  PAGE_SIZE: 20,
};

/**
 * Appliance Types
 */
export const ApplianceTypes = {
  AC: "AC",
  REFRIGERATOR: "Refrigerator",
  WASHING_MACHINE: "Washing Machine",
  MICROWAVE: "Microwave",
  DISHWASHER: "Dishwasher",
  GEYSER: "Geyser",
  TV: "TV",
  OTHER: "Other",
};

/**
 * Job Status
 */
export const JobStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
