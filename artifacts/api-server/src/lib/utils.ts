/** Generate UUID v4 */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Generate kode order format RKL-XXXXXXXX-XXXX */
export function generateOrderCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RKL-${ts}-${rand}`;
}
