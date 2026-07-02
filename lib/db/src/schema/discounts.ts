import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";

export const discountsTable = pgTable("discounts", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id),
  code: text("code").notNull(),
  type: text("type").notNull(), // "fixed" | "percentage"
  value: integer("value").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertDiscount = typeof discountsTable.$inferInsert;
export type Discount = typeof discountsTable.$inferSelect;
