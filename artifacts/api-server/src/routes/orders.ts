import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  ordersTable,
  orderItemsTable,
  orderAddressesTable,
  paymentsTable,
  paymentConfirmationsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function generateId(): string {
  return crypto.randomUUID();
}

// GET /api/orders/:orderCode
router.get("/orders/:orderCode", async (req, res) => {
  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, req.params.orderCode))
    .limit(1)
    .then((r) => r[0]);

  if (!order) {
    res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
    return;
  }

  const [items, addresses, payments] = await Promise.all([
    db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id)),
    db.select().from(orderAddressesTable).where(eq(orderAddressesTable.orderId, order.id)),
    db.select().from(paymentsTable).where(eq(paymentsTable.orderId, order.id)).orderBy(paymentsTable.createdAt),
  ]);

  const address = addresses[0];
  const payment = payments[0];

  res.json({
    data: {
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
    },
  });
});

// POST /api/orders/:orderCode/payment-confirmation
router.post("/orders/:orderCode/payment-confirmation", async (req, res) => {
  const { payerName, reference, note } = req.body as {
    payerName?: string;
    reference?: string;
    note?: string;
  };

  if (!payerName) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "payerName is required" } });
    return;
  }

  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, req.params.orderCode))
    .limit(1)
    .then((r) => r[0]);

  if (!order) {
    res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
    return;
  }

  const payment = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.orderId, order.id))
    .limit(1)
    .then((r) => r[0]);

  if (!payment) {
    res.status(404).json({ error: { code: "PAYMENT_NOT_FOUND", message: "Payment not found" } });
    return;
  }

  await db.insert(paymentConfirmationsTable).values({
    id: generateId(),
    orderId: order.id,
    paymentId: payment.id,
    payerName,
    reference: reference ?? null,
    note: note ?? null,
  });

  await db
    .update(paymentsTable)
    .set({ status: "reviewing", updatedAt: new Date() })
    .where(eq(paymentsTable.id, payment.id));

  await db
    .update(ordersTable)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(ordersTable.id, order.id));

  res.json({ data: { success: true, paymentStatus: "reviewing" } });
});

export default router;
