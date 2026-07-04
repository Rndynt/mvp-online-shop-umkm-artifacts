import type { Request, Response } from "express";
import * as shippingService from "../services/shipping.service";

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await shippingService.listShippingMethods();
  res.json({ data });
}
