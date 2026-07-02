export const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PAID: "paid",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  PAID: "paid",
  FAILED: "failed",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_METHOD = {
  MANUAL_FAKE_QRIS: "manual_fake_qris",
} as const;

export const CURRENCY = {
  IDR: "IDR",
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  manual_fake_qris: "Manual QRIS",
};
