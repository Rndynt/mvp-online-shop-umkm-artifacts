import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";

export const shippingMethodsTable = pgTable("shipping_methods", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertShippingMethod = typeof shippingMethodsTable.$inferInsert;
export type ShippingMethod = typeof shippingMethodsTable.$inferSelect;
