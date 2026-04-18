/**
 * Base API path — change to your server IP/URL for device testing
 * e.g. "http://192.168.1.10:3000/api/v1"
 */
export const API_BASE_URL = "http://localhost:9000/api/v1";

/**
 * API endpoint paths (no hardcoded strings at call sites)
 */
export const ApiUrls = {
  // Auth
  AUTH_SEND_OTP: "/auth/send-otp",
  AUTH_VERIFY_OTP: "/auth/verify-otp",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_ME: "/auth/me",
  AUTH_UPDATE_ME: "/auth/me",

  // Customers
  CUSTOMERS_SEARCH: "/customers/search",
  CUSTOMERS_UPSERT: "/customers/upsert",
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,

  // Jobs
  JOBS: "/jobs",
  JOB_BY_ID: (id) => `/jobs/${id}`,
  JOB_REOPEN: (id) => `/jobs/${id}/reopen`,
  JOBS_BY_CUSTOMER: (customerId) => `/jobs/customer/${customerId}`,
  JOB_REPEAT: (jobId) => `/jobs/repeat/${jobId}`,

  // Dashboard
  DASHBOARD_SUMMARY: "/dashboard/summary",
};

/**
 * Appliance type options
 */
export const ApplianceTypes = [
  "AC",
  "Refrigerator",
  "Washing Machine",
  "Microwave",
  "Dishwasher",
  "Geyser",
  "TV",
  "Other",
];

/**
 * Appliance options with emoji — shared across filter modal and add/edit job
 */
export const ApplianceOptions = [
  { value: "AC", emoji: "❄️", label: "AC" },
  { value: "Refrigerator", emoji: "🧊", label: "Refrigerator" },
  { value: "Washing Machine", emoji: "👕", label: "Washing Machine" },
  { value: "Microwave", emoji: "♨️", label: "Microwave" },
  { value: "Dishwasher", emoji: "🫙", label: "Dishwasher" },
  { value: "Geyser", emoji: "🔥", label: "Geyser" },
  { value: "TV", emoji: "📺", label: "TV" },
  { value: "Other", emoji: "🔧", label: "Other" },
];

/**
 * Job status options
 */
export const JobStatuses = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
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
 * Pagination defaults
 */
export const DefaultPagination = {
  PAGE: 1,
  PAGE_SIZE: 20,
};
