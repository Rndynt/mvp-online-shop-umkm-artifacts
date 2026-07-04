import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { storesTable } from "./stores.js";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  storeId: text("store_id")
    .notNull()
    .references(() => storesTable.id),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  sku: text("sku"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImagesTable = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productBundlesTable = pgTable("product_bundles", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  label: text("label"),
  badge: text("badge"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productFeaturesTable = pgTable("product_features", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productFaqsTable = pgTable("product_faqs", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type InsertProduct = typeof productsTable.$inferInsert;
export type InsertProductImage = typeof productImagesTable.$inferInsert;
export type InsertProductBundle = typeof productBundlesTable.$inferInsert;
export type InsertProductFeature = typeof productFeaturesTable.$inferInsert;
export type InsertProductFaq = typeof productFaqsTable.$inferInsert;
export type Product = typeof productsTable.$inferSelect;
export type ProductImage = typeof productImagesTable.$inferSelect;
export type ProductBundle = typeof productBundlesTable.$inferSelect;
export type ProductFeature = typeof productFeaturesTable.$inferSelect;
export type ProductFaq = typeof productFaqsTable.$inferSelect;
