import { db } from "@workspace/db";
import {
  productsTable,
  productImagesTable,
  productBundlesTable,
  productFeaturesTable,
  productFaqsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { AppError } from "../lib/errors";
import { requireActiveStore } from "./store.service";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function getProductImages(productId: string) {
  return db
    .select()
    .from(productImagesTable)
    .where(eq(productImagesTable.productId, productId))
    .orderBy(productImagesTable.sortOrder);
}

async function getProductBundles(productId: string) {
  return db
    .select()
    .from(productBundlesTable)
    .where(eq(productBundlesTable.productId, productId))
    .orderBy(productBundlesTable.sortOrder);
}

async function getProductFeatures(productId: string) {
  return db
    .select()
    .from(productFeaturesTable)
    .where(eq(productFeaturesTable.productId, productId))
    .orderBy(productFeaturesTable.sortOrder);
}

async function getProductFaqs(productId: string) {
  return db
    .select()
    .from(productFaqsTable)
    .where(eq(productFaqsTable.productId, productId))
    .orderBy(productFaqsTable.sortOrder);
}

function serializeImage(img: { id: string; url: string; alt: string | null; sortOrder: number }) {
  return { id: img.id, url: img.url, alt: img.alt, sortOrder: img.sortOrder };
}

function serializeBundle(b: {
  id: string;
  quantity: number;
  price: number;
  label: string | null;
  badge: string | null;
  isFeatured: boolean;
  sortOrder: number;
}) {
  return {
    id: b.id,
    quantity: b.quantity,
    price: b.price,
    label: b.label,
    badge: b.badge,
    isFeatured: b.isFeatured,
    sortOrder: b.sortOrder,
  };
}

function serializeFeature(f: {
  id: string;
  imageUrl: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
}) {
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
      const images = await getProductImages(p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stockQuantity: p.stockQuantity,
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

  const [images, bundles, features, faqs] = await Promise.all([
    getProductImages(product.id),
    getProductBundles(product.id),
    getProductFeatures(product.id),
    getProductFaqs(product.id),
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
  };
}
