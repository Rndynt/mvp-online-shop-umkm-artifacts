import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { storesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getActiveStore() {
  return db
    .select()
    .from(storesTable)
    .where(eq(storesTable.isActive, true))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

// GET /api/admin/settings
router.get("/admin/settings", async (_req, res) => {
  const store = await getActiveStore();
  if (!store) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Toko tidak ditemukan" } });
    return;
  }
  res.json({
    data: {
      name: store.name,
      tagline: (store as any).tagline ?? "",
      contactEmail: store.contactEmail ?? "",
      contactPhone: store.contactPhone ?? "",
      website: (store as any).website ?? "",
      addressLine1: (store as any).addressLine1 ?? "",
      city: (store as any).city ?? "",
      province: (store as any).province ?? "",
      postalCode: (store as any).postalCode ?? "",
      country: store.country,
      currency: store.currency,
    },
  });
});

// PUT /api/admin/settings
router.put("/admin/settings", async (req, res) => {
  const store = await getActiveStore();
  if (!store) {
    res.status(404).json({ error: { code: "STORE_NOT_FOUND", message: "Toko tidak ditemukan" } });
    return;
  }

  const body = req.body as Record<string, string>;
  const name = body.name?.trim();

  if (!name) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nama toko wajib diisi" } });
    return;
  }

  await db
    .update(storesTable)
    .set({
      name,
      contactEmail: body.contactEmail?.trim() || null,
      contactPhone: body.contactPhone?.trim() || null,
      country: body.country?.trim() || store.country,
      currency: body.currency?.trim() || store.currency,
      updatedAt: new Date(),
      // Extra columns added to schema — cast to any until generated types regenerate
      ...({
        tagline: body.tagline?.trim() || null,
        website: body.website?.trim() || null,
        addressLine1: body.addressLine1?.trim() || null,
        city: body.city?.trim() || null,
        province: body.province?.trim() || null,
        postalCode: body.postalCode?.trim() || null,
      } as any),
    })
    .where(eq(storesTable.id, store.id));

  res.json({ data: { success: true } });
});

export default router;
