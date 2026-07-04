import { db } from "@workspace/db";
import {
  productsTable,
  productImagesTable,
  productBundlesTable,
  productFeaturesTable,
  productFaqsTable,
} from "@workspace/db/schema";
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

  const [images, bundles, features, faqs] = await Promise.all([
    db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(productImagesTable.sortOrder),
    db
      .select()
      .from(productBundlesTable)
      .where(eq(productBundlesTable.productId, productId))
      .orderBy(productBundlesTable.sortOrder),
    db
      .select()
      .from(productFeaturesTable)
      .where(eq(productFeaturesTable.productId, productId))
      .orderBy(productFeaturesTable.sortOrder),
    db
      .select()
      .from(productFaqsTable)
      .where(eq(productFaqsTable.productId, productId))
      .orderBy(productFaqsTable.sortOrder),
  ]);

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
    bundles: bundles.map((b) => ({
      id: b.id,
      quantity: b.quantity,
      price: b.price,
      label: b.label,
      badge: b.badge,
      isFeatured: b.isFeatured,
      sortOrder: b.sortOrder,
    })),
    features: features.map((f) => ({
      id: f.id,
      imageUrl: f.imageUrl,
      title: f.title,
      description: f.description,
      sortOrder: f.sortOrder,
    })),
    faqs: faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
    })),
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductBundleInput {
  quantity: number;
  price: number;
  label?: string | null;
  badge?: string | null;
  isFeatured?: boolean;
}

export interface ProductFeatureInput {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
}

export interface ProductFaqInput {
  question: string;
  answer: string;
}

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
  bundles?: ProductBundleInput[];
  features?: ProductFeatureInput[];
  faqs?: ProductFaqInput[];
}

function validateBundles(raw: unknown): ProductBundleInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "bundles harus berupa array");
  return raw.map((item, idx) => {
    const b = item as Partial<ProductBundleInput>;
    if (typeof b.quantity !== "number" || b.quantity < 1)
      throw new AppError("VALIDATION_ERROR", `bundles[${idx}].quantity harus angka >= 1`);
    if (typeof b.price !== "number" || b.price < 0)
      throw new AppError("VALIDATION_ERROR", `bundles[${idx}].price harus angka non-negatif`);
    return {
      quantity: b.quantity,
      price: b.price,
      label: b.label ?? null,
      badge: b.badge ?? null,
      isFeatured: b.isFeatured ?? false,
    };
  });
}

function validateFeatures(raw: unknown): ProductFeatureInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "features harus berupa array");
  return raw.map((item, idx) => {
    const f = item as Partial<ProductFeatureInput>;
    if (!f.title || typeof f.title !== "string")
      throw new AppError("VALIDATION_ERROR", `features[${idx}].title wajib diisi`);
    return {
      imageUrl: f.imageUrl ?? null,
      title: f.title,
      description: f.description ?? null,
    };
  });
}

function validateFaqs(raw: unknown): ProductFaqInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "faqs harus berupa array");
  return raw.map((item, idx) => {
    const f = item as Partial<ProductFaqInput>;
    if (!f.question || typeof f.question !== "string")
      throw new AppError("VALIDATION_ERROR", `faqs[${idx}].question wajib diisi`);
    if (!f.answer || typeof f.answer !== "string")
      throw new AppError("VALIDATION_ERROR", `faqs[${idx}].answer wajib diisi`);
    return { question: f.question, answer: f.answer };
  });
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
    bundles: validateBundles(input.bundles),
    features: validateFeatures(input.features),
    faqs: validateFaqs(input.faqs),
  };
}

async function replaceBundles(productId: string, bundles: ProductBundleInput[] | undefined) {
  if (bundles === undefined) return;
  await db.delete(productBundlesTable).where(eq(productBundlesTable.productId, productId));
  if (bundles.length === 0) return;
  await db.insert(productBundlesTable).values(
    bundles.map((b, idx) => ({
      id: generateId(),
      productId,
      quantity: b.quantity,
      price: b.price,
      label: b.label ?? null,
      badge: b.badge ?? null,
      isFeatured: b.isFeatured ?? false,
      sortOrder: idx,
    })),
  );
}

async function replaceFeatures(productId: string, features: ProductFeatureInput[] | undefined) {
  if (features === undefined) return;
  await db.delete(productFeaturesTable).where(eq(productFeaturesTable.productId, productId));
  if (features.length === 0) return;
  await db.insert(productFeaturesTable).values(
    features.map((f, idx) => ({
      id: generateId(),
      productId,
      imageUrl: f.imageUrl ?? null,
      title: f.title,
      description: f.description ?? null,
      sortOrder: idx,
    })),
  );
}

async function replaceFaqs(productId: string, faqs: ProductFaqInput[] | undefined) {
  if (faqs === undefined) return;
  await db.delete(productFaqsTable).where(eq(productFaqsTable.productId, productId));
  if (faqs.length === 0) return;
  await db.insert(productFaqsTable).values(
    faqs.map((f, idx) => ({
      id: generateId(),
      productId,
      question: f.question,
      answer: f.answer,
      sortOrder: idx,
    })),
  );
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

  await Promise.all([
    replaceBundles(productId, input.bundles),
    replaceFeatures(productId, input.features),
    replaceFaqs(productId, input.faqs),
  ]);

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

  await Promise.all([
    replaceBundles(productId, input.bundles),
    replaceFeatures(productId, input.features),
    replaceFaqs(productId, input.faqs),
  ]);

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
