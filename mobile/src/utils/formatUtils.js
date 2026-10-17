/**
 * Formats a number as Indian Rupee (INR) currency string
 * e.g., 1000 -> ₹1,000
 */
export const formatCurrency = (val, options = {}) => {
  try {
    const num = Number(val || 0);
    const minFractionDigits =
      options.minimumFractionDigits !== undefined
        ? options.minimumFractionDigits
        : 0;
    const maxFractionDigits =
      options.maximumFractionDigits !== undefined
        ? options.maximumFractionDigits
        : 2;

    // Use toFixed to get the right number of decimals initially
    let [integerPart, decimalPart] = num.toFixed(maxFractionDigits).split(".");

    // Indian Numbering System: 12,34,567
    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== "") {
      lastThree = "," + lastThree;
    }
    const formattedInteger =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    let result = `₹${formattedInteger}`;

    // Handle decimals if required
    if (minFractionDigits > 0) {
      result +=
        "." +
        decimalPart
          .padEnd(minFractionDigits, "0")
          .substring(0, maxFractionDigits);
    } else if (num % 1 !== 0 && maxFractionDigits > 0) {
      // If there are decimals and we allow them, show them up to maxFractionDigits
      const significantDecimals = decimalPart.replace(/0+$/, "");
      if (significantDecimals.length > 0) {
        result += "." + significantDecimals;
      }
    }

    return result;
  } catch (_e) {
    // Fallback
    const num = Number(val || 0);
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `₹${formatted}`;
  }
};

/**
 * Returns a local date string in YYYY-MM-DD format
 */
export const getLocalDateString = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string as "DD/MM/YYYY"
 * e.g., "2024-01-15" -> "15/01/2024"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date as a compact "DD/MM" string for small UI cards.
 * e.g., "2024-01-15" -> "15/01"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

/**
 * Defaults for which Bill To details the invoice shows. Jobs fetched with
 * .lean() (and jobs created before this feature) have no invoiceDisplay, so
 * callers must never rely on the server to fill these in.
 */
export const DEFAULT_INVOICE_DISPLAY = {
  showCustomerName: true,
  showCustomerPhone: true,
  showOrganization: false,
  showAddress: true,
};

/**
 * Escapes user-entered text for safe interpolation into invoice HTML.
 */
export const escapeHtml = (val) =>
  String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Returns the Bill To lines the invoice should print, in order:
 * organization, customer name, phone, address.
 *
 * A line is included only when its checkbox is on AND it has a value, so
 * nothing unchecked leaves an empty row or a stray icon. Display-only: the
 * job and customer data are never modified.
 */
export const buildBillToLines = (job) => {
  const display = {
    ...DEFAULT_INVOICE_DISPLAY,
    ...(job?.invoiceDisplay || {}),
  };
  const clean = (v) => (typeof v === "string" ? v.trim() : "");

  const organization = clean(job?.organization?.name);
  const name = clean(job?.customerId?.name ?? job?.customerName);
  const phone = clean(job?.customerId?.phone ?? job?.customerPhone);
  // A different address typed for the invoice wins over the service location
  const address = clean(job?.invoiceAddress) || clean(job?.location?.address);

  const lines = [];
  if (display.showOrganization && organization)
    lines.push({ kind: "organization", text: organization });
  if (display.showCustomerName && name)
    lines.push({ kind: "name", text: name });
  if (display.showCustomerPhone && phone)
    lines.push({ kind: "phone", text: phone });
  if (display.showAddress && address)
    lines.push({ kind: "address", text: address });
  return lines;
};

/** Time of day a back-dated job starts at until the technician picks one. */
export const PAST_JOB_DEFAULT_TIME = "12:00 PM";

/**
 * True when the date falls on an earlier calendar day than today.
 * @param {Date} date
 */
export const isBeforeToday = (date) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date.getTime() < startOfToday.getTime();
};

/**
 * Combine a picked day with a "h:mm AM/PM" time string into one local Date.
 * Without a parsable time the day is returned as is. Returns null when the
 * day is not a valid date.
 *
 * @param {Date | string} date
 * @param {string} timeStr
 * @returns {Date | null}
 */
export const combineDateAndTime = (date, timeStr) => {
  const day = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(day.getTime())) return null;
  const match = String(timeStr || "").match(/(\d+):(\d+)(?::\d+)?\s*(AM|PM)/i);
  if (!match) return day;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3].toUpperCase();
  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes,
    0,
    0,
  );
};

/**
 * The appliances serviced on a job. Jobs saved before multi-appliance support
 * only have `applianceType`, which is read as a single appliance.
 *
 * @param {object} job
 * @returns {Array<{ type: string, isCustom?: boolean }>}
 */
export const getJobAppliances = (job) => {
  // LEGACY: remove the applianceType branch after the data migration
  if (Array.isArray(job?.appliances) && job.appliances.length > 0) {
    return job.appliances;
  }
  return job?.applianceType
    ? [{ type: job.applianceType, isCustom: false }]
    : [];
};

/**
 * Display text for a job's appliances: "AC, Refrigerator", or "AC, TV +2"
 * when `max` names are allowed and there are more.
 *
 * @param {object} job
 * @param {{ max?: number }} [options]
 * @returns {string}
 */
export const getApplianceLabel = (job, { max } = {}) => {
  const names = getJobAppliances(job).map((a) => a.type);
  if (max && names.length > max) {
    return `${names.slice(0, max).join(", ")} +${names.length - max}`;
  }
  return names.join(", ");
};
