import type { Request, Response } from "express";
import * as catalogService from "../services/catalog.service";

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await catalogService.listProducts();
  res.json({ data });
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
  const data = await catalogService.getProductBySlug(req.params.slug);
  res.json({ data });
}
