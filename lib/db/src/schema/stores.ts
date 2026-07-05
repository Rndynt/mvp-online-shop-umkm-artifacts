import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export interface BankAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface PaymentConfig {
  qrisEnabled: boolean;
  qrisImageUrl?: string | null;
  bankTransferEnabled: boolean;
  bankAccounts: BankAccount[];
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  qrisEnabled: true,
  qrisImageUrl: null,
  bankTransferEnabled: true,
  bankAccounts: [
    { bank: "BCA", accountNumber: "1234567890", accountName: "Kopio Indonesia" },
    { bank: "BNI", accountNumber: "0987654321", accountName: "Kopio Indonesia" },
    { bank: "Mandiri", accountNumber: "1122334455", accountName: "Kopio Indonesia" },
  ],
};

export const storesTable = pgTable("stores", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  tagline: text("tagline"),
  website: text("website"),
  addressLine1: text("address_line_1"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#0F766E"),
  secondaryColor: text("secondary_color").notNull().default("#F1F5F9"),
  tertiaryColor: text("tertiary_color").notNull().default("#7C3AED"),
  announcementText: text("announcement_text"),
  homepageTemplate: text("homepage_template").notNull().default("basic"),
  currency: text("currency").notNull().default("IDR"),
  country: text("country").notNull().default("Indonesia"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  paymentConfig: jsonb("payment_config").$type<PaymentConfig>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type InsertStore = typeof storesTable.$inferInsert;
export type Store = typeof storesTable.$inferSelect;
