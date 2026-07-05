import type { Request, Response } from "express";
import * as svc from "../../services/payment-methods.service";

export async function get(_req: Request, res: Response): Promise<void> {
  const data = await svc.getPaymentConfig();
  res.json({ data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await svc.updatePaymentConfig(req.body);
  res.json({ data });
}
