/**
 * Formats a number as Indian Rupee (INR) currency string
 * e.g., 1000 -> ₹1,000
 */
export const formatCurrency = (val, options = {}) => {
  try {
    const num = Number(val || 0);
    const minFractionDigits = options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;
    const maxFractionDigits = options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2;

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
      result += "." + decimalPart.padEnd(minFractionDigits, "0").substring(0, maxFractionDigits);
    } else if (num % 1 !== 0 && maxFractionDigits > 0) {
      // If there are decimals and we allow them, show them up to maxFractionDigits
      const significantDecimals = decimalPart.replace(/0+$/, "");
      if (significantDecimals.length > 0) {
        result += "." + significantDecimals;
      }
    }

    return result;
  } catch (e) {
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
