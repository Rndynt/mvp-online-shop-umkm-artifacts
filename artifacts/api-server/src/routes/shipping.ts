import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable, shippingMethodsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/shipping-methods", async (_req, res) => {
  const store = await db
    .select({ id: storesTable.id })
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((r) => r[0]);

  if (!store) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Store not found" } });
    return;
  }

  const methods = await db
    .select()
    .from(shippingMethodsTable)
    .where(eq(shippingMethodsTable.storeId, store.id))
    .where(eq(shippingMethodsTable.isActive, true))
    .orderBy(shippingMethodsTable.sortOrder);

  res.json({
    data: methods.map((m) => ({
      id: m.id,
      code: m.code,
      name: m.name,
      description: m.description,
      price: m.price,
    })),
  });
});

export default router;
