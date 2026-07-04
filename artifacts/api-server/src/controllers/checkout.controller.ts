import type { Request, Response } from "express";
import * as checkoutService from "../services/checkout.service";

export async function create(req: Request, res: Response): Promise<void> {
  const data = await checkoutService.createOrder(req.body);
  res.status(201).json({ data });
}
