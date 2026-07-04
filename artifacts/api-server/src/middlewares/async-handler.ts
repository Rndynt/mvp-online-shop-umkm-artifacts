import type { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Membungkus async route handler agar semua error diteruskan ke next()
 * sehingga centralized error handler dapat menangkapnya.
 */
export const asyncHandler = (fn: AsyncFn): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
