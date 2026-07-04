import { db } from "@workspace/db";
import {
  productsTable,
  shippingMethodsTable,
  discountsTable,
  ordersTable,
  orderItemsTable,
  orderAddressesTable,
  paymentsTable,
} from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { generateId, generateOrderCode } from "../lib/utils";
import { requireActiveStore } from "./store.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckoutInput {
  items: Array<{ productId: string; quantity: number }>;
  customer: { email: string; phone: string };
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  shippingMethodId: string;
  paymentMethod?: string;
  discountCode?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function createOrder(input: CheckoutInput) {
  const { items, customer, shippingAddress, shippingMethodId, paymentMethod, discountCode } = input;

  // --- Validation ---
  if (!items?.length || !customer?.email || !customer?.phone || !shippingAddress || !shippingMethodId) {
    throw new AppError("VALIDATION_ERROR", "Field wajib tidak lengkap");
  }

  const store = await requireActiveStore();

  // --- Validate products & stock ---
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
    if (!product) throw new AppError("PRODUCT_NOT_FOUND", `Produk tidak ditemukan: ${item.productId}`);
    if (product.stockQuantity < item.quantity)
      throw new AppError("INSUFFICIENT_STOCK", `Stok tidak cukup untuk: ${product.name}`);
  }

  // --- Validate shipping method ---
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

  if (!shippingMethod) throw new AppError("INVALID_SHIPPING_METHOD", "Metode pengiriman tidak valid");

  // --- Compute line items & subtotal ---
  let subtotal = 0;
  const lineItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    return {
      productId: product.id,
      nameSnapshot: product.name,
      skuSnapshot: product.sku,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity: item.quantity,
      lineTotal,
    };
  });

  // --- Apply discount ---
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
      discountAmount =
        discount.type === "percentage"
          ? Math.round((subtotal * discount.value) / 100)
          : Math.min(discount.value, subtotal);
    }
  }

  const shippingAmountValue = shippingMethod.price;
  const totalAmount = subtotal - discountAmount + shippingAmountValue;
  const orderCode = generateOrderCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // --- Persist order ---
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

  // --- Persist items ---
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

  // --- Persist address ---
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

  // --- Persist payment ---
  const instruction = {
    title: "Bayar via QRIS",
    description: `Scan QR code di bawah dan bayar Rp ${totalAmount.toLocaleString("id-ID")} sebelum ${expiresAt.toLocaleString("id-ID")}`,
    qrPayload: `00020101021226570011ID.CO.BCA.WWW01189360050300000898480215${orderCode}0303UMI51440014ID.CO.QRIS.WWW0215ID20232132394500303UMI5204481453033605802ID5906RukoLite6015Jakarta Selatan61051234062290525${orderCode}0703A0163049CE1`,
    expiresAt: expiresAt.toISOString(),
  };

  await db.insert(paymentsTable).values({
    id: generateId(),
    orderId,
    method: "manual_fake_qris",
    status: "pending",
    amount: totalAmount,
    instructionJson: instruction,
  });

  return {
    orderCode,
    payment: {
      method: "manual_fake_qris",
      displayName: "QRIS",
      status: "pending",
      amount: totalAmount,
      instruction,
    },
  };
}
