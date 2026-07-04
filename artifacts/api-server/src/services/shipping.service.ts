import { db } from "@workspace/db";
import { shippingMethodsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireActiveStore } from "./store.service";

export async function listShippingMethods() {
  const store = await requireActiveStore();

  const methods = await db
    .select()
    .from(shippingMethodsTable)
    .where(eq(shippingMethodsTable.storeId, store.id))
    .where(eq(shippingMethodsTable.isActive, true))
    .orderBy(shippingMethodsTable.sortOrder);

  return methods.map((m) => ({
    id: m.id,
    code: m.code,
    name: m.name,
    description: m.description,
    price: m.price,
    estimatedDays: m.estimatedDays,
  }));
}
