import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable, shippingMethodsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function apiError(code: string, message: string, status = 400) {
  return { status, body: { error: { code, message } } };
}

router.get("/storefront", async (_req, res) => {
  const store = await db
    .select()
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((rows) => rows[0]);

  if (!store) {
    const err = apiError("STORE_NOT_FOUND", "Store not found", 404);
    res.status(err.status).json(err.body);
    return;
  }

  const shippingMethods = await db
    .select()
    .from(shippingMethodsTable)
    .where(eq(shippingMethodsTable.storeId, store.id))
    .where(eq(shippingMethodsTable.isActive, true))
    .orderBy(shippingMethodsTable.sortOrder);

  res.json({
    data: {
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
    },
  });
});

export default router;
