import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
