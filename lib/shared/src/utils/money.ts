/**
 * Format amount (integer IDR) to display string.
 * Example: 150000 → "Rp 150.000"
 * No decimal places for IDR.
 */
export function formatIDR(amount: number): string {
  return (
    "Rp " +
    Math.round(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

/**
 * Calculate discount percentage between price and compareAtPrice.
 * Returns 0 if no compareAtPrice or compareAtPrice <= price.
 */
export function calculateDiscountPercent(
  price: number,
  compareAtPrice: number | null | undefined,
): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
