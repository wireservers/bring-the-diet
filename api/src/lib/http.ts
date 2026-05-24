import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function jsonError(res: Response, status: number, error: string, details?: unknown) {
  return res.status(status).json({ error, details });
}

export function handleError(res: Response, err: unknown) {
  if (err instanceof ZodError) {
    return jsonError(res, 400, "invalid_input", err.flatten());
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error("[api]", message, err);
  return jsonError(res, 500, "server_error", message);
}

export function asyncHandler<T extends Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => handleError(res, err));
  };
}
