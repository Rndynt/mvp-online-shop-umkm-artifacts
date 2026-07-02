import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, orderAddressesTable, paymentsTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const router: IRouter = Router();

const VALID_STATUSES = [
  "pending_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

async function serializeOrderDetail(orderCode: string) {
  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, orderCode))
    .limit(1)
    .then((r) => r[0]);

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

// GET /api/admin/orders
router.get("/admin/orders", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const orders = status
    ? await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.status, status))
        .orderBy(desc(ordersTable.createdAt))
    : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));

  res.json({
    data: orders.map((o) => ({
      id: o.id,
      orderCode: o.orderCode,
      customerEmail: o.customerEmail,
      status: o.status,
      totalAmount: o.totalAmount,
      currency: o.currency,
      createdAt: o.createdAt.toISOString(),
    })),
  });
});

// GET /api/admin/orders/:orderCode
router.get("/admin/orders/:orderCode", async (req, res) => {
  const data = await serializeOrderDetail(req.params.orderCode);
  if (!data) {
    res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
    return;
  }
  res.json({ data });
});

// PATCH /api/admin/orders/:orderCode/status
router.patch("/admin/orders/:orderCode/status", async (req, res) => {
  const { status } = req.body as { status?: string };

  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid status value" } });
    return;
  }

  const order = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(eq(ordersTable.orderCode, req.params.orderCode))
    .limit(1)
    .then((r) => r[0]);

  if (!order) {
    res.status(404).json({ error: { code: "ORDER_NOT_FOUND", message: "Order not found" } });
    return;
  }

  await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(ordersTable.id, order.id));

  const data = await serializeOrderDetail(req.params.orderCode);
  res.json({ data });
});

export default router;
