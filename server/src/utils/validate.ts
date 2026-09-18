import type { Request, Response, NextFunction } from "express";
import type { ZodType, ZodError } from "zod";
import { AppError } from "./AppError.js";

/** Turns a ZodError into a single readable message, e.g.
 *  "email: a valid email is required; peopleAffected: Too small". */
export function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "value"}: ${issue.message}`)
    .join("; ");
}

/** Express middleware factory: validates `req.body` against a Zod schema
 *  before the controller runs, and replaces `req.body` with the parsed
 *  (and type-coerced/defaulted) result on success. On failure, forwards a
 *  400 AppError to the centralized error handler instead of responding
 *  directly, so validation errors share the same response shape as every
 *  other error in the app. */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(AppError.badRequest(formatZodError(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}

/** For call sites that already have a parsed plain object (e.g. multipart
 *  form fields deserialised inside the controller) rather than `req.body`
 *  itself — parses and throws an AppError(400) on failure so it flows into
 *  the same `next(error)` path as everything else in that controller. */
export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw AppError.badRequest(formatZodError(result.error));
  }
  return result.data;
}
