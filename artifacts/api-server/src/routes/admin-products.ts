import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable, productsTable, productImagesTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function generateId(): string {
  return crypto.randomUUID();
}

async function getActiveStoreId(): Promise<string | null> {
  const store = await db
    .select({ id: storesTable.id })
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((r) => r[0]);
  return store?.id ?? null;
}

async function serializeProduct(productId: string) {
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

type ProductInput = {
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
};

function validateInput(body: unknown): { value?: ProductInput; error?: string } {
  const input = body as Partial<ProductInput>;
  if (!input || typeof input !== "object") return { error: "Invalid request body" };
  if (!input.name || typeof input.name !== "string") return { error: "name is required" };
  if (!input.slug || typeof input.slug !== "string") return { error: "slug is required" };
  if (typeof input.price !== "number" || input.price < 0) return { error: "price must be a non-negative number" };
  if (typeof input.stockQuantity !== "number" || input.stockQuantity < 0) {
    return { error: "stockQuantity must be a non-negative number" };
  }
  return {
    value: {
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
    },
  };
}

// GET /api/admin/products
router.get("/admin/products", async (_req, res) => {
  const storeId = await getActiveStoreId();
  if (!storeId) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Store not found" } });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.storeId, storeId))
    .orderBy(productsTable.sortOrder);

  const data = await Promise.all(products.map((p) => serializeProduct(p.id)));
  res.json({ data });
});

// POST /api/admin/products
router.post("/admin/products", async (req, res) => {
  const storeId = await getActiveStoreId();
  if (!storeId) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Store not found" } });
    return;
  }

  const { value, error } = validateInput(req.body);
  if (!value) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error } });
    return;
  }

  const existingSlug = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.storeId, storeId), eq(productsTable.slug, value.slug)))
    .limit(1)
    .then((r) => r[0]);
  if (existingSlug) {
    res.status(400).json({ error: { code: "SLUG_TAKEN", message: "A product with this slug already exists" } });
    return;
  }

  const productId = generateId();
  await db.insert(productsTable).values({
    id: productId,
    storeId,
    name: value.name,
    slug: value.slug,
    shortDescription: value.shortDescription,
    description: value.description,
    price: value.price,
    compareAtPrice: value.compareAtPrice,
    sku: value.sku,
    stockQuantity: value.stockQuantity,
    isActive: value.isActive ?? true,
  });

  if (value.imageUrl) {
    await db.insert(productImagesTable).values({
      id: generateId(),
      productId,
      url: value.imageUrl,
      sortOrder: 0,
    });
  }

  const data = await serializeProduct(productId);
  res.status(201).json({ data });
});

// GET /api/admin/products/:id
router.get("/admin/products/:id", async (req, res) => {
  const data = await serializeProduct(req.params.id);
  if (!data) {
    res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
    return;
  }
  res.json({ data });
});

// PATCH /api/admin/products/:id
router.patch("/admin/products/:id", async (req, res) => {
  const existing = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, req.params.id))
    .limit(1)
    .then((r) => r[0]);
  if (!existing) {
    res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
    return;
  }

  const { value, error } = validateInput(req.body);
  if (!value) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error } });
    return;
  }

  await db
    .update(productsTable)
    .set({
      name: value.name,
      slug: value.slug,
      shortDescription: value.shortDescription,
      description: value.description,
      price: value.price,
      compareAtPrice: value.compareAtPrice,
      sku: value.sku,
      stockQuantity: value.stockQuantity,
      isActive: value.isActive ?? true,
      updatedAt: new Date(),
    })
    .where(eq(productsTable.id, req.params.id));

  if (value.imageUrl) {
    const existingImage = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, req.params.id))
      .orderBy(productImagesTable.sortOrder)
      .limit(1)
      .then((r) => r[0]);

    if (existingImage) {
      await db
        .update(productImagesTable)
        .set({ url: value.imageUrl })
        .where(eq(productImagesTable.id, existingImage.id));
    } else {
      await db.insert(productImagesTable).values({
        id: generateId(),
        productId: req.params.id,
        url: value.imageUrl,
        sortOrder: 0,
      });
    }
  }

  const data = await serializeProduct(req.params.id);
  res.json({ data });
});

// DELETE /api/admin/products/:id
router.delete("/admin/products/:id", async (req, res) => {
  const existing = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.id, req.params.id))
    .limit(1)
    .then((r) => r[0]);
  if (!existing) {
    res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, req.params.id));
  res.json({ data: { success: true } });
});

export default router;
