import { Request, Response, NextFunction } from "express";
import { Ratelimit } from "@upstash/ratelimit";

export const rateLimit = (limiter: Ratelimit) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identifier = req.ip ?? "unknown";

      const { success, limit, remaining, reset } =
        await limiter.limit(identifier);

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", remaining);
      res.setHeader("X-RateLimit-Reset", reset);

      if (!success) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
};
