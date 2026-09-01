import {
  registerUser,
  loginUser,
  verifyUserEmail,
  refreshAccessToken,
} from "./auth.service.js";
import { config } from "../../config/env.config.js";
import { NextFunction, Request, Response } from "express";


const getAccessTokenExpiresAt = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
};

const getRefreshTokenExpiresAt = () => {
  return new Date(
    Date.now() +
      config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );
};

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully, verify your email to activate your account",
      data: { name: result.user.name, email: result.user.email },
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
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      expires: getRefreshTokenExpiresAt(),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      expires: getAccessTokenExpiresAt(),
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;

    const { newAccessToken, newRefreshToken,sessionExpiresAt } =
      await refreshAccessToken(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      expires: sessionExpiresAt, // 30 days
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      expires: getAccessTokenExpiresAt(), // 15 minutes
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    return next(error);
  }
}
