import { ErrorMessages } from "#constants/generalConstants.js";

/**
 * Checks the invoice Bill To rules for a job's final (merged) settings.
 * Returns an error message, or null when the settings are valid.
 *
 * - Showing the organization requires an organization name.
 * - The invoice must show who it is for: the customer name or the
 *   organization name.
 */
export function getBillToError({
  showCustomerName = true,
  showOrganization = false,
  organizationName = "",
} = {}) {
  const hasOrganization = showOrganization && !!organizationName;
  if (showOrganization && !organizationName) {
    return ErrorMessages.ORGANIZATION_NAME_REQUIRED;
  }
  if (!showCustomerName && !hasOrganization) {
    return ErrorMessages.BILL_TO_NAME_REQUIRED;
  }
  return null;
}
