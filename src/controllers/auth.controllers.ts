import { registerUser, verifyUserEmail } from "../services/auth.services.js";
import { NextFunction, Request, Response } from "express";
import { refreshAccessToken } from "../services/session.service.js";
import { sendVerificationEmail } from "../services/email.services.js";

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
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
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// export async function login(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { email, password } = req.body;
//     const { user, accessToken, refreshToken } = await loginUser({
//       email,
//       password,
//     });

//     res.cookie("accessToken", accessToken, {
//       ...cookieOptions,
//       maxAge: ACCESS_COOKIE_MAX_AGE,
//     });

//     res.cookie("refreshToken", refreshToken, {
//       ...cookieOptions,
//       maxAge: REFRESH_COOKIE_MAX_AGE,
//     });

//     res.status(200).json({
//       success: true,
//       message: "User logged in successfully",
//       user,
//     });
//   } catch (error) {
//     next(error);
//   }
// }

// export async function refreshUser(req: Request, res: Response) {
//   try {
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({
//         success: false,
//         message: "Refresh token missing",
//       });
//     }

//     const tokens = await refreshAccessToken(refreshToken);

//     res.cookie("accessToken", tokens.accessToken, {
//       ...cookieOptions,
//       maxAge: ACCESS_COOKIE_MAX_AGE,
//     });

//     res.cookie("refreshToken", tokens.refreshToken, {
//       ...cookieOptions,
//       maxAge: REFRESH_COOKIE_MAX_AGE,
//       path: "/api/v1/auth",
//     });

//     return res.status(200).json({
//       success: true,
//     });
//   } catch {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired session",
//     });
//   }
// }

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
