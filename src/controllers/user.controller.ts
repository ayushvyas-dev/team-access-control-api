import { NextFunction, Request, Response } from "express";
import { getCurrentUser } from "../services/user.service.js";

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if(!userId){
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