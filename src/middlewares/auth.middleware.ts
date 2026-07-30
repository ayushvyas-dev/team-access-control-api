import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      sessionId: payload.sessionId,
    };

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
}
