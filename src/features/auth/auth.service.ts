import {
  createOtp,
  createRefreshToken,
  createUser,
  findOtpByEmail,
  findUserByEmail,
  markUserEmailVerify,
} from "./auth.repository.js";
import bcrypt from "bcryptjs";
import { AppError } from "../../utils/appError.js";

import { hashToken } from "../../utils/token.js";
import { createToken } from "../../utils/token.js";
import {
  createSession,
  findSessionByRefreshTokenHash,
  rotateRefreshToken,
} from "../sessions/session.repository.js";

import { emailQueue } from "../../queues/email.queue.js";

const REFRESH_TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000;

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  if (!name) {
    throw new AppError("Name is required", 400);
  }
  if (!email) {
    throw new AppError("Email is required", 400);
  }
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({ name, email, passwordHash });
  if (!user) {
    throw new AppError("Failed to create user", 500);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 12);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const createdOtp = await createOtp({ userId: user.id, otpHash, expiresAt });
  if (!createdOtp) {
    throw new AppError("Failed to create OTP", 500);
  }
  const createdEmailJob = await emailQueue.add("send-verification-email", {
    email,
    otp,
  });
  if (!createdEmailJob) {
    throw new AppError("Failed to create email job", 500);
  }

  return user;
}

export async function loginUser({
  email,
  password,
  userAgent,
  ip,
}: {
  email: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) {
  if (!email) {
    throw new AppError("Email is required", 400);
  }
  if (!password) {
    throw new AppError("Password is required", 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  if (user.deletedAt !== null) {
    throw new AppError("User account does not exist", 404);
  }

  if (!user.emailVerified) {
    throw new AppError("Email not verified", 400);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const session = await createSession({
    userId: user.id,
    userAgent: userAgent,
    ip: ip,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
  });
  if (!session) {
    throw new AppError("Failed to create session", 500);
  }

  const accessToken = createToken(user.id, session.id, "access");

  const refreshToken = createToken(user.id, session.id, "refresh");
  const refreshTokenHash = hashToken(refreshToken);

  const createdRefreshToken = await createRefreshToken({
    sessionId: session.id,
    tokenHash: refreshTokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
  });
  if (!createdRefreshToken) {
    throw new AppError("Failed to create refresh token", 500);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

export async function verifyUserEmail(email: string, otp: string) {
  if (!email) {
    throw new AppError("Email is required", 400);
  }
  if (!otp) {
    throw new AppError("OTP is required", 400);
  }

  const otpData = await findOtpByEmail(email);
  if (!otpData) {
    throw new AppError("Invalid or expired OTP", 400);
  }
  if (otpData.expiresAt <= new Date()) {
    throw new AppError("OTP has expired", 400);
  }
  const otpHash = otpData.otpHash;

  const isValidOtp = await bcrypt.compare(otp, otpHash);

  if (!isValidOtp) {
    throw new AppError("Invalid OTP", 400);
  }
  const verifyEmail = await markUserEmailVerify(otpData.userId, otpData.id);
  if (!verifyEmail) {
    throw new AppError("Failed to verify email", 500);
  }
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const refreshTokenHash = hashToken(refreshToken);

  const storedToken = await findSessionByRefreshTokenHash(refreshTokenHash);

  if (!storedToken) {
    throw new AppError("Invalid refresh token", 400);
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new AppError("Refresh token has expired", 400);
  }

  if (storedToken.revokedAt) {
    throw new AppError("Refresh token has been revoked", 400);
  }

  const session = storedToken.session;

  if (session.revokedAt) {
    throw new AppError("Session has been revoked", 400);
  }
  if (session.expiresAt <= new Date()) {
    throw new AppError("Session expired", 400);
  }

  // Rotate refresh token
  const newRefreshToken = createToken(session.userId, session.id, "refresh");

  const newRefreshTokenHash = hashToken(newRefreshToken);

  const tokenRotate = await rotateRefreshToken({
    oldTokenId: storedToken.id,
    sessionId: session.id,
    tokenHash: newRefreshTokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
  });

  if (!tokenRotate) {
    throw new AppError("Failed to rotate refresh token", 500);
  }

  const newAccessToken = createToken(session.userId, session.id, "access");
  return {
    newAccessToken: newAccessToken,
    newRefreshToken: newRefreshToken,
  };
}
