import type { Request, Response } from "express";
import * as ordersService from "../../services/admin/orders.service";

export async function list(req: Request, res: Response): Promise<void> {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const data = await ordersService.listOrders(status);
  res.json({ data });
}

export async function get(req: Request, res: Response): Promise<void> {
  const data = await ordersService.getOrder(String(req.params.orderCode));
  res.json({ data });
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body as { status?: string };
  const data = await ordersService.updateOrderStatus(String(req.params.orderCode), status ?? "");
  res.json({ data });
}
