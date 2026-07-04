import type { Request, Response } from "express";
import * as ordersService from "../services/orders.service";

export async function getByCode(req: Request, res: Response): Promise<void> {
  const data = await ordersService.getOrderByCode(req.params.orderCode);
  res.json({ data });
}

export async function confirmPayment(req: Request, res: Response): Promise<void> {
  const data = await ordersService.confirmPayment(req.params.orderCode, req.body);
  res.json({ data });
}
