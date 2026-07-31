import {
  registerUser,
  loginUser,
  verifyUserEmail,
  refreshAccessToken,
} from "../services/auth.service.js";
import { NextFunction, Request, Response } from "express";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully, verify your email to activate your account",
      data: { name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, otp } = req.body;
    const result = await verifyUserEmail(email, otp);
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const userAgent = req.get("user-agent");
    const ip = req.ip;
    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
      userAgent,
      ip,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req: Request, res: Response,next:NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
      throw new Error("Refresh token is required");
    }
    const {newAccessToken,newRefreshToken} = await refreshAccessToken(refreshToken);
  
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return res.status(200).json({
      success: true,
      accessToken:newAccessToken,
    });
  } catch (error){
    
     return next(error)
  }
}

// export async function logoutUser(req: Request, res: Response) {
//   const refreshToken = req.cookies.refreshToken;

//   if (refreshToken) {
//     await logoutUser(refreshToken);
//   }

//   res.clearCookie("accessToken", {
//     ...cookieOptions,
//   });

//   res.clearCookie("refreshToken", {
//     ...cookieOptions,
//     path: "/api/v1/auth",
//   });

//   return res.status(200).json({
//     success: true,
//     message: "Logged out successfully",
//   });
// }

export async function logoutAllUser(req: Request, res: Response) {}

export async function getSessions(req: Request, res: Response) {}

export async function deleteSession(req: Request, res: Response) {}
