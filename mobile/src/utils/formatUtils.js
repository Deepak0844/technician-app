/**
 * Formats a number as Indian Rupee (INR) currency string
 * e.g., 1000 -> ₹1,000
 */
export const formatCurrency = (val) => {
  const num = Number(val || 0);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₹${formatted}`;
};
