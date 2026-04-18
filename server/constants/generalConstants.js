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
  SERVICE_DATE_IN_PAST: "Service date cannot be in the past for new jobs.",
  JOB_REOPEN_FORBIDDEN:
    "Only jobs that are completed and paid can be reopened.",
  VALIDATION_FAILED: "Validation failed",
  RATE_LIMIT_EXCEEDED:
    "Too many requests from this IP, please try again after 15 minutes",
  /** @param {number} count */
  CUSTOMER_HAS_JOBS: (count) =>
    `Cannot delete customer with ${count} associated job(s).`,
  /** @param {string} field */
  DUPLICATE_FIELD: (field) => `A record with that ${field} already exists.`,
};

/**
 * Common Success Messages
 */
export const SuccessMessages = {
  OTP_SENT: "OTP sent successfully",
  LOGIN_SUCCESS: "Logged in successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  PROFILE_LOADED: "User profile loaded successfully",
  PROFILE_UPDATED: "User profile updated successfully",
  CUSTOMER_CREATED: "Customer created successfully",
  CUSTOMER_LOADED: "Customer loaded successfully",
  CUSTOMERS_LOADED: "Customers loaded successfully",
  CUSTOMER_UPDATED: "Customer updated successfully",
  CUSTOMER_DELETED: "Customer deleted successfully",
  JOB_CREATED: "Job created successfully",
  JOB_LOADED: "Job loaded successfully",
  JOBS_LOADED: "Jobs loaded successfully",
  JOB_REPEATED: "Job repeated successfully",
  JOB_UPDATED: "Job updated successfully",
  JOB_REOPENED: "Job reopened successfully.",
  JOB_DELETED: "Job deleted successfully",
  DASHBOARD_LOADED: "Dashboard summary loaded successfully",
  SERVER_HEALTHY: "Server is healthy",
};

/**
 * Auth / Cookie Constants
 */
export const AUTH_COOKIE_NAME = "token";

export const CookieConfig = {
  HTTP_ONLY: true,
  SAME_SITE: "strict",
  MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Pagination Defaults
 */
export const DefaultPagination = {
  PAGE: 1,
  PAGE_SIZE: 20,
  RECENT_JOBS_LIMIT: 10,
};

/**
 * Rate Limit Configuration
 */
export const RateLimits = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_PROD: 200,
  MAX_DEV: 5000,
};

/**
 * 2Factor API Constants
 */
export const TwoFactor = {
  BASE_URL: "https://2factor.in/API/V1",
  STATUS_SUCCESS: "Success",
  OTP_MATCHED: "OTP Matched",
};

/**
 * Priority Levels
 */
export const PriorityLevels = {
  NORMAL: "normal",
  URGENT: "urgent",
};

/**
 * Payment Methods
 */
export const PaymentMethods = {
  CASH: "cash",
  UPI: "upi",
  ONLINE: "online",
  CHEQUE: "cheque",
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
