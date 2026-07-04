import { db } from "@workspace/db";
import { storesTable, shippingMethodsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
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
    .where(eq(shippingMethodsTable.storeId, store.id))
    .where(eq(shippingMethodsTable.isActive, true))
    .orderBy(shippingMethodsTable.sortOrder);

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    logoUrl: store.logoUrl,
    primaryColor: store.primaryColor,
    announcementText: store.announcementText,
    currency: store.currency,
    country: store.country,
    contactEmail: store.contactEmail,
    contactPhone: store.contactPhone,
    activePaymentMethods: ["manual_fake_qris"],
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

export async function getSettings() {
  const store = await requireActiveStore();
  return {
    name: store.name,
    tagline: (store as any).tagline ?? "",
    contactEmail: store.contactEmail ?? "",
    contactPhone: store.contactPhone ?? "",
    website: (store as any).website ?? "",
    addressLine1: (store as any).addressLine1 ?? "",
    city: (store as any).city ?? "",
    province: (store as any).province ?? "",
    postalCode: (store as any).postalCode ?? "",
    country: store.country,
    currency: store.currency,
  };
}

export interface UpdateSettingsInput {
  name: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  addressLine1?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  currency?: string;
}

export async function updateSettings(input: UpdateSettingsInput) {
  if (!input.name?.trim()) {
    throw new AppError("VALIDATION_ERROR", "Nama toko wajib diisi");
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
      updatedAt: new Date(),
      ...({
        tagline: input.tagline?.trim() || null,
        website: input.website?.trim() || null,
        addressLine1: input.addressLine1?.trim() || null,
        city: input.city?.trim() || null,
        province: input.province?.trim() || null,
        postalCode: input.postalCode?.trim() || null,
      } as any),
    })
    .where(eq(storesTable.id, store.id));

  return { success: true };
}
