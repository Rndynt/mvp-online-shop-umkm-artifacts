import { db } from "@workspace/db";
import { storesTable, shippingMethodsTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { AppError } from "../lib/errors";

export type Store = typeof storesTable.$inferSelect;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

export async function getActiveStore(): Promise<Store | null> {
  return db
    .select()
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((r) => r[0] ?? null);
}

/**
 * Sama seperti getActiveStore() tapi melempar AppError jika toko tidak ada.
 * Digunakan oleh service lain yang butuh storeId.
 */
export async function requireActiveStore(): Promise<Store> {
  const store = await getActiveStore();
  if (!store) throw new AppError("STORE_NOT_FOUND", "Toko tidak ditemukan", 404);
  return store;
}

// ---------------------------------------------------------------------------
// Public storefront
// ---------------------------------------------------------------------------

export async function getStorefront() {
  const store = await requireActiveStore();

  const shippingMethods = await db
    .select()
    .from(shippingMethodsTable)
    .where(and(eq(shippingMethodsTable.storeId, store.id), eq(shippingMethodsTable.isActive, true)))
    .orderBy(shippingMethodsTable.sortOrder);

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    tagline: store.tagline,
    logoUrl: store.logoUrl,
    primaryColor: store.primaryColor,
    secondaryColor: store.secondaryColor,
    tertiaryColor: store.tertiaryColor,
    announcementText: store.announcementText,
    homepageTemplate: store.homepageTemplate,
    currency: store.currency,
    country: store.country,
    addressLine1: store.addressLine1,
    city: store.city,
    province: store.province,
    postalCode: store.postalCode,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    activePaymentMethods: ["manual_fake_qris", "manual_bank_transfer"],
    activeShippingMethods: shippingMethods.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      description: m.description,
      price: m.price,
    })),
  };
}

// ---------------------------------------------------------------------------
// Admin settings
// ---------------------------------------------------------------------------

export const HOMEPAGE_TEMPLATES = ["basic", "basic-1", "bold"] as const;
export type HomepageTemplate = (typeof HOMEPAGE_TEMPLATES)[number];

export async function getSettings() {
  const store = await requireActiveStore();
  return {
    name: store.name,
    tagline: store.tagline ?? "",
    homepageTemplate: store.homepageTemplate,
    contactEmail: store.contactEmail ?? "",
    contactPhone: store.contactPhone ?? "",
    website: store.website ?? "",
    addressLine1: store.addressLine1 ?? "",
    city: store.city ?? "",
    province: store.province ?? "",
    postalCode: store.postalCode ?? "",
    country: store.country,
    currency: store.currency,
    logoUrl: store.logoUrl ?? "",
    primaryColor: store.primaryColor ?? "",
    secondaryColor: store.secondaryColor ?? "",
    tertiaryColor: store.tertiaryColor ?? "",
  };
}

export interface UpdateSettingsInput {
  name: string;
  tagline?: string;
  homepageTemplate?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  addressLine1?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  currency?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export async function updateSettings(input: UpdateSettingsInput) {
  if (!input.name?.trim()) {
    throw new AppError("VALIDATION_ERROR", "Nama toko wajib diisi");
  }

  if (input.homepageTemplate && !HOMEPAGE_TEMPLATES.includes(input.homepageTemplate as HomepageTemplate)) {
    throw new AppError("VALIDATION_ERROR", "Template homepage tidak valid");
  }

  const store = await requireActiveStore();

  await db
    .update(storesTable)
    .set({
      name: input.name.trim(),
      contactEmail: input.contactEmail?.trim() || null,
      contactPhone: input.contactPhone?.trim() || null,
      country: input.country?.trim() || store.country,
      currency: input.currency?.trim() || store.currency,
      homepageTemplate: input.homepageTemplate?.trim() || store.homepageTemplate,
      updatedAt: new Date(),
      tagline: input.tagline?.trim() || null,
      website: input.website?.trim() || null,
      addressLine1: input.addressLine1?.trim() || null,
      city: input.city?.trim() || null,
      province: input.province?.trim() || null,
      postalCode: input.postalCode?.trim() || null,
      logoUrl: input.logoUrl?.trim() || undefined,
      primaryColor: input.primaryColor?.trim() || undefined,
      secondaryColor: input.secondaryColor?.trim() || undefined,
      tertiaryColor: input.tertiaryColor?.trim() || undefined,
    })
    .where(eq(storesTable.id, store.id));

  return { success: true };
}
