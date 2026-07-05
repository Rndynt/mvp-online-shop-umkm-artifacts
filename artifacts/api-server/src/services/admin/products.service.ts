import { db } from "@workspace/db";
import {
  productsTable,
  productImagesTable,
  productBundlesTable,
  productFeaturesTable,
  productFaqsTable,
  productOptionTypesTable,
  productOptionValuesTable,
  productVariantsTable,
  productVariantOptionsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
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

  const [images, bundles, features, faqs, optionTypesRaw, variantsRaw] = await Promise.all([
    db.select().from(productImagesTable).where(eq(productImagesTable.productId, productId)).orderBy(productImagesTable.sortOrder),
    db.select().from(productBundlesTable).where(eq(productBundlesTable.productId, productId)).orderBy(productBundlesTable.sortOrder),
    db.select().from(productFeaturesTable).where(eq(productFeaturesTable.productId, productId)).orderBy(productFeaturesTable.sortOrder),
    db.select().from(productFaqsTable).where(eq(productFaqsTable.productId, productId)).orderBy(productFaqsTable.sortOrder),
    db.select().from(productOptionTypesTable).where(eq(productOptionTypesTable.productId, productId)).orderBy(productOptionTypesTable.sortOrder),
    db.select().from(productVariantsTable).where(eq(productVariantsTable.productId, productId)).orderBy(productVariantsTable.sortOrder),
  ]);

  // Fetch option values and variant options in parallel
  const [allOptionValues, allVariantOptions] = await Promise.all([
    optionTypesRaw.length > 0
      ? db.select().from(productOptionValuesTable).where(
          eq(productOptionValuesTable.optionTypeId, optionTypesRaw[0]!.id) // will be replaced below
        ).then(() =>
          Promise.all(
            optionTypesRaw.map((ot) =>
              db.select().from(productOptionValuesTable).where(eq(productOptionValuesTable.optionTypeId, ot.id)).orderBy(productOptionValuesTable.sortOrder)
            )
          )
        )
      : Promise.resolve([] as typeof productOptionValuesTable.$inferSelect[][]),
    variantsRaw.length > 0
      ? Promise.all(
          variantsRaw.map((v) =>
            db.select().from(productVariantOptionsTable).where(eq(productVariantOptionsTable.variantId, v.id))
          )
        )
      : Promise.resolve([] as typeof productVariantOptionsTable.$inferSelect[][]),
  ]);

  const optionTypes = optionTypesRaw.map((ot, idx) => ({
    id: ot.id,
    name: ot.name,
    sortOrder: ot.sortOrder,
    values: (allOptionValues[idx] ?? []).map((v) => ({
      id: v.id,
      value: v.value,
      sortOrder: v.sortOrder,
    })),
  }));

  const variants = variantsRaw.map((v, idx) => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    stockQuantity: v.stockQuantity,
    imageUrl: v.imageUrl,
    isActive: v.isActive,
    sortOrder: v.sortOrder,
    optionValueIds: (allVariantOptions[idx] ?? []).map((vo) => vo.optionValueId),
  }));

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
    images: images.map((img) => ({ id: img.id, url: img.url, alt: img.alt, sortOrder: img.sortOrder })),
    bundles: bundles.map((b) => ({ id: b.id, quantity: b.quantity, price: b.price, label: b.label, badge: b.badge, isFeatured: b.isFeatured, sortOrder: b.sortOrder })),
    features: features.map((f) => ({ id: f.id, imageUrl: f.imageUrl, title: f.title, description: f.description, sortOrder: f.sortOrder })),
    faqs: faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, sortOrder: f.sortOrder })),
    optionTypes,
    variants,
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

export interface OptionTypeInput {
  name: string;
  values: string[];
}

export interface VariantInput {
  /** One value string per option type, in the same order as optionTypes array */
  optionCombination: string[];
  price?: number | null;
  stockQuantity: number;
  sku?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
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
  optionTypes?: OptionTypeInput[];
  variants?: VariantInput[];
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

function validateBundles(raw: unknown): ProductBundleInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "bundles harus berupa array");
  return raw.map((item, idx) => {
    const b = item as Partial<ProductBundleInput>;
    if (typeof b.quantity !== "number" || b.quantity < 1)
      throw new AppError("VALIDATION_ERROR", `bundles[${idx}].quantity harus angka >= 1`);
    if (typeof b.price !== "number" || b.price < 0)
      throw new AppError("VALIDATION_ERROR", `bundles[${idx}].price harus angka non-negatif`);
    return { quantity: b.quantity, price: b.price, label: b.label ?? null, badge: b.badge ?? null, isFeatured: b.isFeatured ?? false };
  });
}

function validateFeatures(raw: unknown): ProductFeatureInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "features harus berupa array");
  return raw.map((item, idx) => {
    const f = item as Partial<ProductFeatureInput>;
    if (!f.title || typeof f.title !== "string")
      throw new AppError("VALIDATION_ERROR", `features[${idx}].title wajib diisi`);
    return { imageUrl: f.imageUrl ?? null, title: f.title, description: f.description ?? null };
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

function validateOptionTypes(raw: unknown): OptionTypeInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "optionTypes harus berupa array");
  return raw.map((item, idx) => {
    const ot = item as Partial<OptionTypeInput>;
    if (!ot.name || typeof ot.name !== "string")
      throw new AppError("VALIDATION_ERROR", `optionTypes[${idx}].name wajib diisi`);
    if (!Array.isArray(ot.values))
      throw new AppError("VALIDATION_ERROR", `optionTypes[${idx}].values harus berupa array`);
    return { name: ot.name, values: ot.values.filter((v) => typeof v === "string" && v.trim()) };
  });
}

function validateVariants(raw: unknown): VariantInput[] | undefined {
  if (raw == null) return undefined;
  if (!Array.isArray(raw)) throw new AppError("VALIDATION_ERROR", "variants harus berupa array");
  return raw.map((item, idx) => {
    const v = item as Partial<VariantInput>;
    if (!Array.isArray(v.optionCombination))
      throw new AppError("VALIDATION_ERROR", `variants[${idx}].optionCombination harus berupa array`);
    if (typeof v.stockQuantity !== "number" || v.stockQuantity < 0)
      throw new AppError("VALIDATION_ERROR", `variants[${idx}].stockQuantity harus angka non-negatif`);
    return {
      optionCombination: v.optionCombination,
      price: v.price ?? null,
      stockQuantity: v.stockQuantity,
      sku: v.sku ?? null,
      imageUrl: v.imageUrl ?? null,
      isActive: v.isActive ?? true,
    };
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
    optionTypes: validateOptionTypes(input.optionTypes),
    variants: validateVariants(input.variants),
  };
}

// ---------------------------------------------------------------------------
// Replace helpers
// ---------------------------------------------------------------------------

async function replaceBundles(productId: string, bundles: ProductBundleInput[] | undefined) {
  if (bundles === undefined) return;
  await db.delete(productBundlesTable).where(eq(productBundlesTable.productId, productId));
  if (bundles.length === 0) return;
  await db.insert(productBundlesTable).values(
    bundles.map((b, idx) => ({ id: generateId(), productId, quantity: b.quantity, price: b.price, label: b.label ?? null, badge: b.badge ?? null, isFeatured: b.isFeatured ?? false, sortOrder: idx })),
  );
}

async function replaceFeatures(productId: string, features: ProductFeatureInput[] | undefined) {
  if (features === undefined) return;
  await db.delete(productFeaturesTable).where(eq(productFeaturesTable.productId, productId));
  if (features.length === 0) return;
  await db.insert(productFeaturesTable).values(
    features.map((f, idx) => ({ id: generateId(), productId, imageUrl: f.imageUrl ?? null, title: f.title, description: f.description ?? null, sortOrder: idx })),
  );
}

async function replaceFaqs(productId: string, faqs: ProductFaqInput[] | undefined) {
  if (faqs === undefined) return;
  await db.delete(productFaqsTable).where(eq(productFaqsTable.productId, productId));
  if (faqs.length === 0) return;
  await db.insert(productFaqsTable).values(
    faqs.map((f, idx) => ({ id: generateId(), productId, question: f.question, answer: f.answer, sortOrder: idx })),
  );
}

async function replaceVariants(
  productId: string,
  optionTypes: OptionTypeInput[] | undefined,
  variants: VariantInput[] | undefined,
) {
  if (optionTypes === undefined && variants === undefined) return;

  // Cascade delete: option types → values → variant options; variants → variant options
  await Promise.all([
    db.delete(productOptionTypesTable).where(eq(productOptionTypesTable.productId, productId)),
    db.delete(productVariantsTable).where(eq(productVariantsTable.productId, productId)),
  ]);

  if (!optionTypes || optionTypes.length === 0) return;

  // Insert option types + values, build lookup: "typeIdx:valueStr" → optionValueId
  const valueLookup = new Map<string, string>();

  for (let typeIdx = 0; typeIdx < optionTypes.length; typeIdx++) {
    const optType = optionTypes[typeIdx]!;
    const typeId = generateId();
    await db.insert(productOptionTypesTable).values({ id: typeId, productId, name: optType.name, sortOrder: typeIdx });

    for (let valIdx = 0; valIdx < optType.values.length; valIdx++) {
      const val = optType.values[valIdx]!;
      const valId = generateId();
      await db.insert(productOptionValuesTable).values({ id: valId, optionTypeId: typeId, value: val, sortOrder: valIdx });
      valueLookup.set(`${typeIdx}:${val}`, valId);
    }
  }

  if (!variants || variants.length === 0) return;

  for (let varIdx = 0; varIdx < variants.length; varIdx++) {
    const variant = variants[varIdx]!;
    const varId = generateId();
    await db.insert(productVariantsTable).values({
      id: varId,
      productId,
      sku: variant.sku ?? null,
      price: variant.price ?? null,
      stockQuantity: variant.stockQuantity,
      imageUrl: variant.imageUrl ?? null,
      isActive: variant.isActive ?? true,
      sortOrder: varIdx,
    });

    for (let typeIdx = 0; typeIdx < variant.optionCombination.length; typeIdx++) {
      const valStr = variant.optionCombination[typeIdx]!;
      const valId = valueLookup.get(`${typeIdx}:${valStr}`);
      if (valId) {
        await db.insert(productVariantOptionsTable).values({ variantId: varId, optionValueId: valId });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

export async function listProducts() {
  const store = await requireActiveStore();
  // Admins see ALL products regardless of isActive status
  return db.select().from(productsTable).where(eq(productsTable.storeId, store.id)).orderBy(productsTable.sortOrder);
}

export async function getProduct(productId: string) {
  const product = await serializeProduct(productId);
  if (!product) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);
  return product;
}

export async function createProduct(body: unknown) {
  const store = await requireActiveStore();
  const input = validateProductInput(body);
  const productId = generateId();

  await db.insert(productsTable).values({
    id: productId,
    storeId: store.id,
    name: input.name,
    slug: input.slug,
    shortDescription: input.shortDescription ?? null,
    description: input.description ?? null,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? null,
    sku: input.sku ?? null,
    stockQuantity: input.stockQuantity,
    isActive: input.isActive ?? true,
    sortOrder: 0,
  });

  if (input.imageUrl) {
    await db.insert(productImagesTable).values({ id: generateId(), productId, url: input.imageUrl, sortOrder: 0 });
  }

  await Promise.all([
    replaceBundles(productId, input.bundles),
    replaceFeatures(productId, input.features),
    replaceFaqs(productId, input.faqs),
    replaceVariants(productId, input.optionTypes, input.variants),
  ]);

  return (await serializeProduct(productId))!;
}

export async function updateProduct(productId: string, body: unknown) {
  const existing = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId)).limit(1).then((r) => r[0]);
  if (!existing) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);

  const input = validateProductInput(body);

  await db
    .update(productsTable)
    .set({
      name: input.name,
      slug: input.slug,
      shortDescription: input.shortDescription ?? null,
      description: input.description ?? null,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      sku: input.sku ?? null,
      stockQuantity: input.stockQuantity,
      isActive: input.isActive ?? true,
      updatedAt: new Date(),
    })
    .where(eq(productsTable.id, productId));

  if (input.imageUrl) {
    const existingImage = await db.select().from(productImagesTable).where(eq(productImagesTable.productId, productId)).orderBy(productImagesTable.sortOrder).limit(1).then((r) => r[0]);
    if (existingImage) {
      await db.update(productImagesTable).set({ url: input.imageUrl }).where(eq(productImagesTable.id, existingImage.id));
    } else {
      await db.insert(productImagesTable).values({ id: generateId(), productId, url: input.imageUrl, sortOrder: 0 });
    }
  }

  await Promise.all([
    replaceBundles(productId, input.bundles),
    replaceFeatures(productId, input.features),
    replaceFaqs(productId, input.faqs),
    replaceVariants(productId, input.optionTypes, input.variants),
  ]);

  return (await serializeProduct(productId))!;
}

export async function deleteProduct(productId: string) {
  const existing = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId)).limit(1).then((r) => r[0]);
  if (!existing) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);
  await db.delete(productsTable).where(eq(productsTable.id, productId));
  return { success: true };
}
