import type { Request, Response } from "express";
import * as storeService from "../services/store.service";

export async function getStorefront(_req: Request, res: Response): Promise<void> {
  const data = await storeService.getStorefront();
  res.json({ data });
}
