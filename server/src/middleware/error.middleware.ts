import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response: any = {
    success: false,
    message,
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.error = err;
  }

  console.error(`[Error] ${statusCode} - ${message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json(response);
};
