import { db } from "@workspace/db";
import {
  ordersTable,
  orderItemsTable,
  orderAddressesTable,
  paymentsTable,
  paymentConfirmationsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { generateId } from "../lib/utils";

// ---------------------------------------------------------------------------
// Shared serializer — dipakai oleh public orders dan admin orders
// ---------------------------------------------------------------------------

export async function serializeOrder(orderCode: string) {
  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, orderCode))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!order) return null;

  const [items, addresses, payments] = await Promise.all([
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id)),
    db.select().from(orderAddressesTable).where(eq(orderAddressesTable.orderId, order.id)),
    db.select().from(paymentsTable).where(eq(paymentsTable.orderId, order.id)).orderBy(paymentsTable.createdAt),
  ]);

  const address = addresses[0];
  const payment = payments[0];

  return {
    id: order.id,
    orderCode: order.orderCode,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    status: order.status,
    subtotalAmount: order.subtotalAmount,
    discountAmount: order.discountAmount,
    shippingAmount: order.shippingAmount,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      itemType: i.itemType,
      nameSnapshot: i.nameSnapshot,
      skuSnapshot: i.skuSnapshot,
      unitPrice: i.unitPrice,
      compareAtPrice: i.compareAtPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    address: address
      ? {
          firstName: address.firstName,
          lastName: address.lastName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country,
        }
      : null,
    payment: payment
      ? {
          method: payment.method,
          displayName: "QRIS",
          status: payment.status,
          amount: payment.amount,
          instruction: payment.instructionJson,
        }
      : null,
    createdAt: order.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Public order endpoints
// ---------------------------------------------------------------------------

export async function getOrderByCode(orderCode: string) {
  const order = await serializeOrder(orderCode);
  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);
  return order;
}

export interface ConfirmPaymentInput {
  payerName: string;
  reference?: string;
  note?: string;
}

export async function confirmPayment(orderCode: string, input: ConfirmPaymentInput) {
  if (!input.payerName?.trim()) throw new AppError("VALIDATION_ERROR", "payerName wajib diisi");

  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, orderCode))
    .limit(1)
    .then((r) => r[0]);

  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);

  const payment = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.orderId, order.id))
    .limit(1)
    .then((r) => r[0]);

  if (!payment) throw new AppError("PAYMENT_NOT_FOUND", "Data pembayaran tidak ditemukan", 404);

  await db.insert(paymentConfirmationsTable).values({
    id: generateId(),
    orderId: order.id,
    paymentId: payment.id,
    payerName: input.payerName,
    reference: input.reference ?? null,
    note: input.note ?? null,
  });

  await db
    .update(paymentsTable)
    .set({ status: "reviewing", updatedAt: new Date() })
    .where(eq(paymentsTable.id, payment.id));

  await db
    .update(ordersTable)
    .set({ status: "payment_review", updatedAt: new Date() })
    .where(eq(ordersTable.id, order.id));

  return { success: true, paymentStatus: "reviewing" };
}
