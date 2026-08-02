import { NextFunction, Request, Response } from "express";
import {
  deleteCurrentUser,
  getCurrentUser,
  updateCurrentUser,
} from "./user.service.js";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await getCurrentUser(userId);
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const { name } = req.body;
    const user = await updateCurrentUser(userId, name);
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }
    await deleteCurrentUser(userId);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}
