/**
 * Route (screen) name constants
 */
export const RouteNames = {
  // Auth stack
  OTP_LOGIN: "OtpLogin",
  SETUP_PROFILE: "SetupProfile",

  // Main tabs
  DASHBOARD: "Dashboard",
  CALENDAR: "Calendar",
  ADD_JOB: "AddJob",
  JOB_HISTORY: "JobHistory",
  PROFILE: "Profile",
  CUSTOMERS: "Customers",

  // Detail screens (stack)
  JOB_DETAILS: "JobDetails",
  CUSTOMER_SEARCH: "CustomerSearch",
  CUSTOMER_DETAILS: "CustomerDetails",
  CREATE_CUSTOMER: "CreateCustomer",
  INVOICE_PREVIEW: "InvoicePreview",
  REMINDERS: "Reminders",
  CUSTOMER_JOB_HISTORY: "CustomerJobHistory",

  // Navigator wrappers
  TABS: "Tabs",
};

/**
 * Root stack names (used in AppNavigator)
 */
export const StackNames = {
  AUTH: "Auth",
  MAIN: "Main",
};
