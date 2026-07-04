import { db } from "@workspace/db";
import { productsTable, productImagesTable } from "@workspace/db/schema";
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

function serializeImage(img: { id: string; url: string; alt: string | null; sortOrder: number }) {
  return { id: img.id, url: img.url, alt: img.alt, sortOrder: img.sortOrder };
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

  const images = await getProductImages(product.id);

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
  };
}
