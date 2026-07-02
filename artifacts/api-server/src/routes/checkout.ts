import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  storesTable,
  productsTable,
  shippingMethodsTable,
  discountsTable,
  ordersTable,
  orderItemsTable,
  orderAddressesTable,
  paymentsTable,
} from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";

const router: IRouter = Router();

function generateId(): string {
  return crypto.randomUUID();
}

function generateOrderCode(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RKL-${ts}-${rand}`;
}

function apiError(code: string, message: string, status = 400) {
  return { status, body: { error: { code, message } } };
}

// POST /api/checkout
router.post("/checkout", async (req, res) => {
  const { items, customer, shippingAddress, shippingMethodId, paymentMethod, discountCode } =
    req.body as {
      items?: Array<{ productId: string; quantity: number }>;
      customer?: { email: string; phone: string };
      shippingAddress?: {
        firstName: string;
        lastName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
      };
      shippingMethodId?: string;
      paymentMethod?: string;
      discountCode?: string;
    };

  if (!items?.length || !customer?.email || !customer?.phone || !shippingAddress || !shippingMethodId) {
    const err = apiError("VALIDATION_ERROR", "Missing required fields");
    res.status(err.status).json(err.body);
    return;
  }

  // Get store
  const store = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((r) => r[0]);

  if (!store) {
    const err = apiError("STORE_NOT_FOUND", "Store not found", 404);
    res.status(err.status).json(err.body);
    return;
  }

  // Validate products
  const productIds = items.map((i) => i.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.storeId, store.id),
        inArray(productsTable.id, productIds),
        eq(productsTable.isActive, true),
      ),
    );

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      const err = apiError("PRODUCT_NOT_FOUND", `Product not found: ${item.productId}`);
      res.status(err.status).json(err.body);
      return;
    }
    if (product.stockQuantity < item.quantity) {
      const err = apiError("INSUFFICIENT_STOCK", `Insufficient stock for: ${product.name}`);
      res.status(err.status).json(err.body);
      return;
    }
  }

  // Get shipping method
  const shippingMethod = await db
    .select()
    .from(shippingMethodsTable)
    .where(
      and(
        eq(shippingMethodsTable.id, shippingMethodId),
        eq(shippingMethodsTable.storeId, store.id),
        eq(shippingMethodsTable.isActive, true),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  if (!shippingMethod) {
    const err = apiError("INVALID_SHIPPING_METHOD", "Invalid shipping method");
    res.status(err.status).json(err.body);
    return;
  }

  // Compute subtotal
  let subtotal = 0;
  const lineItems: Array<{
    productId: string;
    nameSnapshot: string;
    skuSnapshot: string | null;
    unitPrice: number;
    compareAtPrice: number | null;
    quantity: number;
    lineTotal: number;
  }> = [];

  for (const item of items) {
    const product = productMap.get(item.productId)!;
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    lineItems.push({
      productId: product.id,
      nameSnapshot: product.name,
      skuSnapshot: product.sku,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: item.quantity,
      lineTotal,
    });
  }

  // Validate discount code
  let discountAmount = 0;
  if (discountCode) {
    const discount = await db
      .select()
      .from(discountsTable)
      .where(
        and(
          eq(discountsTable.storeId, store.id),
          eq(discountsTable.code, discountCode.toUpperCase()),
          eq(discountsTable.isActive, true),
        ),
      )
      .limit(1)
      .then((r) => r[0]);

    if (discount) {
      if (discount.type === "percentage") {
        discountAmount = Math.round((subtotal * discount.value) / 100);
      } else {
        discountAmount = Math.min(discount.value, subtotal);
      }
    }
  }

  const shippingAmountValue = shippingMethod.price;
  const totalAmount = subtotal - discountAmount + shippingAmountValue;
  const orderCode = generateOrderCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create order
  const orderId = generateId();
  await db.insert(ordersTable).values({
    id: orderId,
    storeId: store.id,
    orderCode,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    status: "pending_payment",
    subtotalAmount: subtotal,
    discountAmount,
    shippingAmount: shippingAmountValue,
    totalAmount,
    currency: store.currency,
    paymentMethod: paymentMethod ?? "manual_fake_qris",
    shippingMethodId,
  });

  // Create order items
  for (const item of lineItems) {
    await db.insert(orderItemsTable).values({
      id: generateId(),
      orderId,
      productId: item.productId,
      itemType: "product",
      nameSnapshot: item.nameSnapshot,
      skuSnapshot: item.skuSnapshot,
      unitPrice: item.unitPrice,
      compareAtPrice: item.compareAtPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    });
  }

  // Create address
  await db.insert(orderAddressesTable).values({
    id: generateId(),
    orderId,
    firstName: shippingAddress.firstName,
    lastName: shippingAddress.lastName ?? "",
    addressLine1: shippingAddress.addressLine1,
    addressLine2: shippingAddress.addressLine2,
    city: shippingAddress.city,
    province: shippingAddress.province,
    postalCode: shippingAddress.postalCode,
    country: shippingAddress.country ?? "Indonesia",
  });

  // Create payment record
  const paymentId = generateId();
  const instruction = {
    title: "Bayar via QRIS",
    description: `Scan QR code di bawah dan bayar Rp ${totalAmount.toLocaleString("id-ID")} sebelum ${expiresAt.toLocaleString("id-ID")}`,
    qrPayload: `00020101021226570011ID.CO.BCA.WWW01189360050300000898480215${orderCode}0303UMI51440014ID.CO.QRIS.WWW0215ID20232132394500303UMI5204481453033605802ID5906RukoLite6015Jakarta Selatan61051234062290525${orderCode}0703A0163049CE1`,
    expiresAt: expiresAt.toISOString(),
  };

  await db.insert(paymentsTable).values({
    id: paymentId,
    orderId,
    method: "manual_fake_qris",
    status: "pending",
    amount: totalAmount,
    instructionJson: instruction,
  });

  res.status(201).json({
    data: {
      orderCode,
      payment: {
        method: "manual_fake_qris",
        displayName: "QRIS",
        status: "pending",
        amount: totalAmount,
        instruction,
      },
    },
  });
});

export default router;
