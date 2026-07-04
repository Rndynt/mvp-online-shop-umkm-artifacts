import { db } from "@workspace/db";
import { productsTable, productImagesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../../lib/errors";
import { generateId } from "../../lib/utils";
import { requireActiveStore } from "../store.service";

// ---------------------------------------------------------------------------
// Shared serializer
// ---------------------------------------------------------------------------

export async function serializeProduct(productId: string) {
  const product = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1)
    .then((r) => r[0]);

  if (!product) return null;

  const images = await db
    .select()
    .from(productImagesTable)
    .where(eq(productImagesTable.productId, productId))
    .orderBy(productImagesTable.sortOrder);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    sortOrder: product.sortOrder,
    images: images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
    })),
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductInput {
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  stockQuantity: number;
  isActive?: boolean;
  imageUrl?: string | null;
}

function validateProductInput(body: unknown): ProductInput {
  const input = body as Partial<ProductInput>;
  if (!input || typeof input !== "object")
    throw new AppError("VALIDATION_ERROR", "Request body tidak valid");
  if (!input.name || typeof input.name !== "string")
    throw new AppError("VALIDATION_ERROR", "name wajib diisi");
  if (!input.slug || typeof input.slug !== "string")
    throw new AppError("VALIDATION_ERROR", "slug wajib diisi");
  if (typeof input.price !== "number" || input.price < 0)
    throw new AppError("VALIDATION_ERROR", "price harus berupa angka non-negatif");
  if (typeof input.stockQuantity !== "number" || input.stockQuantity < 0)
    throw new AppError("VALIDATION_ERROR", "stockQuantity harus berupa angka non-negatif");

  return {
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription ?? null,
    description: input.description ?? null,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    sku: input.sku ?? null,
    stockQuantity: input.stockQuantity,
    isActive: input.isActive ?? true,
    imageUrl: input.imageUrl ?? null,
  };
}

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

export async function listProducts() {
  const store = await requireActiveStore();

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.storeId, store.id))
    .orderBy(productsTable.sortOrder);

  const data = await Promise.all(products.map((p) => serializeProduct(p.id)));
  return data.filter(Boolean);
}

export async function getProduct(productId: string) {
  const product = await serializeProduct(productId);
  if (!product) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);
  return product;
}

export async function createProduct(body: unknown) {
  const store = await requireActiveStore();
  const input = validateProductInput(body);

  // Cek duplikat slug
  const existingSlug = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.storeId, store.id), eq(productsTable.slug, input.slug)))
    .limit(1)
    .then((r) => r[0]);

  if (existingSlug) throw new AppError("SLUG_CONFLICT", "Slug sudah digunakan produk lain");

  const productId = generateId();
  await db.insert(productsTable).values({
    id: productId,
    storeId: store.id,
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription,
    description: input.description,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    sku: input.sku,
    stockQuantity: input.stockQuantity,
    isActive: input.isActive ?? true,
    sortOrder: 0,
  });

  if (input.imageUrl) {
    await db.insert(productImagesTable).values({
      id: generateId(),
      productId,
      url: input.imageUrl,
      sortOrder: 0,
    });
  }

  const product = await serializeProduct(productId);
  return product!;
}

export async function updateProduct(productId: string, body: unknown) {
  const existing = await db
    .select({ id: productsTable.id, storeId: productsTable.storeId })
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);

  const input = validateProductInput(body);

  // Cek duplikat slug (kecuali produk ini sendiri)
  const slugConflict = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(
      and(
        eq(productsTable.storeId, existing.storeId),
        eq(productsTable.slug, input.slug),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  if (slugConflict && slugConflict.id !== productId) {
    throw new AppError("SLUG_CONFLICT", "Slug sudah digunakan produk lain");
  }

  await db
    .update(productsTable)
    .set({
      name: input.name,
      slug: input.slug,
      shortDescription: input.shortDescription,
      description: input.description,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      sku: input.sku,
      stockQuantity: input.stockQuantity,
      isActive: input.isActive,
      updatedAt: new Date(),
    })
    .where(eq(productsTable.id, productId));

  if (input.imageUrl) {
    const existingImage = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(productImagesTable.sortOrder)
      .limit(1)
      .then((r) => r[0]);

    if (existingImage) {
      await db
        .update(productImagesTable)
        .set({ url: input.imageUrl })
        .where(eq(productImagesTable.id, existingImage.id));
    } else {
      await db.insert(productImagesTable).values({
        id: generateId(),
        productId,
        url: input.imageUrl,
        sortOrder: 0,
      });
    }
  }

  const product = await serializeProduct(productId);
  return product!;
}

export async function deleteProduct(productId: string) {
  const existing = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1)
    .then((r) => r[0]);

  if (!existing) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);

  await db.delete(productsTable).where(eq(productsTable.id, productId));
  return { success: true };
}
