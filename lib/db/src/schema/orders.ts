import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";
import { shippingMethodsTable } from "./shipping.js";

export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id),
  orderCode: text("order_code").unique().notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  status: text("status").notNull().default("pending_payment"),
  subtotalAmount: integer("subtotal_amount").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  shippingAmount: integer("shipping_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),
  currency: text("currency").notNull().default("IDR"),
  paymentMethod: text("payment_method").notNull(),
  shippingMethodId: text("shipping_method_id").references(() => shippingMethodsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: text("product_id"),
  itemType: text("item_type").notNull().default("product"),
  nameSnapshot: text("name_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot"),
  unitPrice: integer("unit_price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderAddressesTable = pgTable("order_addresses", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  amount: integer("amount").notNull(),
  instructionJson: jsonb("instruction_json"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentConfirmationsTable = pgTable("payment_confirmations", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => ordersTable.id),
  paymentId: text("payment_id")
    .notNull()
    .references(() => paymentsTable.id),
  payerName: text("payer_name").notNull(),
  reference: text("reference"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertOrder = typeof ordersTable.$inferInsert;
export type InsertOrderItem = typeof orderItemsTable.$inferInsert;
export type InsertOrderAddress = typeof orderAddressesTable.$inferInsert;
export type InsertPayment = typeof paymentsTable.$inferInsert;
export type InsertPaymentConfirmation = typeof paymentConfirmationsTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type OrderAddress = typeof orderAddressesTable.$inferSelect;
export type Payment = typeof paymentsTable.$inferSelect;
export type PaymentConfirmation = typeof paymentConfirmationsTable.$inferSelect;
