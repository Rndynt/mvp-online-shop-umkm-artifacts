import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  storesTable,
  productsTable,
  productImagesTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function getActiveStoreId(): Promise<string | null> {
  const store = await db
    .select({ id: storesTable.id })
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((r) => r[0]);
  return store?.id ?? null;
}

async function buildProductImages(productId: string) {
  return db
    .select()
    .from(productImagesTable)
    .where(eq(productImagesTable.productId, productId))
    .orderBy(productImagesTable.sortOrder);
}

// GET /api/products
router.get("/products", async (_req, res) => {
  const storeId = await getActiveStoreId();
  if (!storeId) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Store not found" } });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.storeId, storeId),
        eq(productsTable.isActive, true),
      ),
    )
    .orderBy(productsTable.sortOrder);

  const data = await Promise.all(
    products.map(async (p) => {
      const images = await buildProductImages(p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stockQuantity: p.stockQuantity,
        images: images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        })),
      };
    }),
  );

  res.json({ data });
});

// GET /api/products/:slug
router.get("/products/:slug", async (req, res) => {
  const storeId = await getActiveStoreId();
  if (!storeId) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Store not found" } });
    return;
  }

  const product = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.storeId, storeId),
        eq(productsTable.slug, req.params.slug),
        eq(productsTable.isActive, true),
      ),
    )
    .limit(1)
    .then((r) => r[0]);

  if (!product) {
    res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
    return;
  }

  const images = await buildProductImages(product.id);

  res.json({
    data: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stockQuantity: product.stockQuantity,
      images: images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
      isActive: product.isActive,
    },
  });
});

export default router;
