import type { Request, Response } from "express";
import * as storeService from "../../services/store.service";

export async function get(_req: Request, res: Response): Promise<void> {
  const data = await storeService.getSettings();
  res.json({ data });
}

export async function update(req: Request, res: Response): Promise<void> {
  const data = await storeService.updateSettings(req.body);
  res.json({ data });
}
