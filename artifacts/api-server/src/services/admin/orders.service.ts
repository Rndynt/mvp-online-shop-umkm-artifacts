import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";
import { AppError } from "../../lib/errors";
import { serializeOrder } from "../orders.service";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const VALID_STATUSES = [
  "pending_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

export async function listOrders(statusFilter?: string) {
  const orders =
    statusFilter && statusFilter !== "all"
      ? await db
          .select()
          .from(ordersTable)
          .where(eq(ordersTable.status, statusFilter))
          .orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

  return orders.map((o) => ({
    id: o.id,
    orderCode: o.orderCode,
    customerEmail: o.customerEmail,
    status: o.status,
    totalAmount: o.totalAmount,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function getOrder(orderCode: string) {
  const order = await serializeOrder(orderCode);
  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);
  return order;
}

export async function updateOrderStatus(orderCode: string, status: string) {
  if (!VALID_STATUSES.includes(status as any)) {
    throw new AppError("VALIDATION_ERROR", "Nilai status tidak valid");
  }

  const order = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, orderCode))
    .limit(1)
    .then((r) => r[0]);

  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);

  await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(ordersTable.id, order.id));

  return serializeOrder(orderCode);
}
