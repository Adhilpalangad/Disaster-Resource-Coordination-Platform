/**
 * Application-level error carrying an explicit HTTP status code.
 *
 * Throw this (or pass it to `next()`) from anywhere inside a controller —
 * Express 5 forwards a rejected async handler to the centralized error
 * middleware automatically, which reads `statusCode` off the error to
 * decide the response status (see server/src/middleware/error.middleware.ts).
 *
 * Keeps controllers free of inline `res.status(xxx).json(...)` calls so
 * there is a single place (the error middleware) that decides response
 * shape and logging behaviour.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, message);
  }

  static notFound(message: string): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static unauthorized(message: string): AppError {
    return new AppError(401, message);
  }
}
