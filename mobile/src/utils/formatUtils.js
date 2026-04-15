/**
 * Formats a number as Indian Rupee (INR) currency string
 * e.g., 1000 -> ₹1,000
 */
export const formatCurrency = (val) => {
  const num = Number(val || 0);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₹${formatted}`;
};

/**
 * Returns a local date string in YYYY-MM-DD format
 */
export const getLocalDateString = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string as "DD MMM YYYY" (Indian locale)
 * e.g., "2024-01-15" -> "15 Jan 2024"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
