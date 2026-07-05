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
import { eq, and } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { requireActiveStore } from "./store.service";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function getProductImages(productId: string) {
  return db.select().from(productImagesTable).where(eq(productImagesTable.productId, productId)).orderBy(productImagesTable.sortOrder);
}

async function getProductBundles(productId: string) {
  return db.select().from(productBundlesTable).where(eq(productBundlesTable.productId, productId)).orderBy(productBundlesTable.sortOrder);
}

async function getProductFeatures(productId: string) {
  return db.select().from(productFeaturesTable).where(eq(productFeaturesTable.productId, productId)).orderBy(productFeaturesTable.sortOrder);
}

async function getProductFaqs(productId: string) {
  return db.select().from(productFaqsTable).where(eq(productFaqsTable.productId, productId)).orderBy(productFaqsTable.sortOrder);
}

async function getProductOptionTypes(productId: string) {
  const optionTypesRaw = await db
    .select()
    .from(productOptionTypesTable)
    .where(eq(productOptionTypesTable.productId, productId))
    .orderBy(productOptionTypesTable.sortOrder);

  if (optionTypesRaw.length === 0) return [];

  const valuesPerType = await Promise.all(
    optionTypesRaw.map((ot) =>
      db.select().from(productOptionValuesTable).where(eq(productOptionValuesTable.optionTypeId, ot.id)).orderBy(productOptionValuesTable.sortOrder)
    )
  );

  return optionTypesRaw.map((ot, idx) => ({
    id: ot.id,
    name: ot.name,
    sortOrder: ot.sortOrder,
    values: (valuesPerType[idx] ?? []).map((v) => ({ id: v.id, value: v.value, sortOrder: v.sortOrder })),
  }));
}

async function getProductVariants(productId: string) {
  const variantsRaw = await db
    .select()
    .from(productVariantsTable)
    .where(and(eq(productVariantsTable.productId, productId), eq(productVariantsTable.isActive, true)))
    .orderBy(productVariantsTable.sortOrder);

  if (variantsRaw.length === 0) return [];

  const variantOptions = await Promise.all(
    variantsRaw.map((v) =>
      db.select().from(productVariantOptionsTable).where(eq(productVariantOptionsTable.variantId, v.id))
    )
  );

  return variantsRaw.map((v, idx) => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    stockQuantity: v.stockQuantity,
    imageUrl: v.imageUrl,
    isActive: v.isActive,
    sortOrder: v.sortOrder,
    optionValueIds: (variantOptions[idx] ?? []).map((vo) => vo.optionValueId),
  }));
}

function serializeImage(img: { id: string; url: string; alt: string | null; sortOrder: number }) {
  return { id: img.id, url: img.url, alt: img.alt, sortOrder: img.sortOrder };
}

function serializeBundle(b: { id: string; quantity: number; price: number; label: string | null; badge: string | null; isFeatured: boolean; sortOrder: number }) {
  return { id: b.id, quantity: b.quantity, price: b.price, label: b.label, badge: b.badge, isFeatured: b.isFeatured, sortOrder: b.sortOrder };
}

function serializeFeature(f: { id: string; imageUrl: string | null; title: string; description: string | null; sortOrder: number }) {
  return { id: f.id, imageUrl: f.imageUrl, title: f.title, description: f.description, sortOrder: f.sortOrder };
}

function serializeFaq(f: { id: string; question: string; answer: string; sortOrder: number }) {
  return { id: f.id, question: f.question, answer: f.answer, sortOrder: f.sortOrder };
}

// ---------------------------------------------------------------------------
// Public catalog
// ---------------------------------------------------------------------------

export async function listProducts() {
  const store = await requireActiveStore();

  const products = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.storeId, store.id), eq(productsTable.isActive, true)))
    .orderBy(productsTable.sortOrder);

  return Promise.all(
    products.map(async (p) => {
      const [images, variants, bundles] = await Promise.all([
        getProductImages(p.id),
        db
          .select({ price: productVariantsTable.price, stockQuantity: productVariantsTable.stockQuantity })
          .from(productVariantsTable)
          .where(
            and(
              eq(productVariantsTable.productId, p.id),
              eq(productVariantsTable.isActive, true),
            ),
          ),
        db
          .select({ id: productBundlesTable.id })
          .from(productBundlesTable)
          .where(eq(productBundlesTable.productId, p.id)),
      ]);

      // Each variant's effective price: override if set, else inherit product base price
      let minVariantPrice: number | null = null;
      let maxVariantPrice: number | null = null;
      // When variants exist, aggregate their stock (product-level stockQuantity is not used)
      let stockQuantity = p.stockQuantity;
      if (variants.length > 0) {
        const effectivePrices = variants.map((v) => v.price ?? p.price);
        minVariantPrice = Math.min(...effectivePrices);
        maxVariantPrice = Math.max(...effectivePrices);
        stockQuantity = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stockQuantity,
        minVariantPrice,
        maxVariantPrice,
        hasVariants: variants.length > 0,
        hasBundles: bundles.length > 0,
        images: images.map(serializeImage),
      };
    }),
  );
}

export async function getProductBySlug(slug: string) {
  const store = await requireActiveStore();

  const product = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.storeId, store.id),
        eq(productsTable.slug, slug),
        eq(productsTable.isActive, true),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  if (!product) throw new AppError("PRODUCT_NOT_FOUND", "Produk tidak ditemukan", 404);

  const [images, bundles, features, faqs, optionTypes, variants] = await Promise.all([
    getProductImages(product.id),
    getProductBundles(product.id),
    getProductFeatures(product.id),
    getProductFaqs(product.id),
    getProductOptionTypes(product.id),
    getProductVariants(product.id),
  ]);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stockQuantity: product.stockQuantity,
    images: images.map(serializeImage),
    isActive: product.isActive,
    bundles: bundles.map(serializeBundle),
    features: features.map(serializeFeature),
    faqs: faqs.map(serializeFaq),
    optionTypes,
    variants,
  };
}
