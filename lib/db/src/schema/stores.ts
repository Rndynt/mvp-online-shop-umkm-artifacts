import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const storesTable = pgTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#0F766E"),
  announcementText: text("announcement_text"),
  currency: text("currency").notNull().default("IDR"),
  country: text("country").notNull().default("Indonesia"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertStore = typeof storesTable.$inferInsert;
export type Store = typeof storesTable.$inferSelect;
