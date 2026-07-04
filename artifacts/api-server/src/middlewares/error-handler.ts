import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

/**
 * Centralized Express error handler.
 * Harus dipasang sebagai middleware TERAKHIR di app.ts.
 *
 * - AppError  → dikembalikan sebagai JSON dengan status dan kode yang sesuai
 * - Error lain → 500 Internal Server Error, detail di-log server-side
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.httpStatus).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan internal server",
    },
  });
}
