import { Request, Response, NextFunction } from "express";
import {
  deleteAllSessionService,
  deleteSessionService,
  getAllSessionService,
} from "./session.service.js";

export async function getAllSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id as string;
    const sessions = await getAllSessionService(userId);

    return res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data: sessions,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id as string;
    const sessionId = req.params.sessionId as string;

    await deleteSessionService(userId, sessionId);
    return res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAllSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id as string;

    await deleteAllSessionService(userId);
    return res.status(200).json({
      success: true,
      message: "All session deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
