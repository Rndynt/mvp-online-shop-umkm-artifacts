import type { Request, Response } from "express";
import * as productsService from "../../services/admin/products.service";

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await productsService.listProducts();
  res.json({ data });
}

export async function get(req: Request, res: Response): Promise<void> {
  const data = await productsService.getProduct(req.params.id);
  res.json({ data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const data = await productsService.createProduct(req.body);
  res.status(201).json({ data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await productsService.updateProduct(req.params.id, req.body);
  res.json({ data });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const data = await productsService.deleteProduct(req.params.id);
  res.json({ data });
}
