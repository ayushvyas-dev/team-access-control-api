import {
  createOtp,
  createRefreshToken,
  createUser,
  findOtpByEmail,
  findUserByEmail,
  markUserEmailVerify,
} from "../repositories/auth.repository.js";
import bcrypt from "bcryptjs";

import { hashToken } from "../utils/token.js";
import { createToken } from "../utils/token.js";
import {
  createSession,
  findSessionByRefreshTokenHash,
  rotateRefreshToken,
} from "../repositories/session.repository.js";

import { sendVerificationEmail } from "./email.service.js";
import { AppError } from "../utils/appError.js";

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
  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUser({ name, email, passwordHash });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await createOtp({ userId: user.id, otpHash, expiresAt });
    await sendVerificationEmail(email, otp);

    return user;
  } catch (error) {
    throw error;
  }
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
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    if (user.deletedAt !== null) {
      throw new Error("User account does not exist");
    }

    if (!user.emailVerified) {
      throw new Error("Email not verified");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const session = await createSession({
      userId: user.id,
      userAgent: userAgent,
      ip: ip,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
    });

    const accessToken = createToken(user.id, session.id, "access");

    const refreshToken = createToken(user.id, session.id, "refresh");
    const refreshTokenHash = hashToken(refreshToken);

    await createRefreshToken({
      sessionId: session.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
}

export async function verifyUserEmail(email: string, otp: string) {
  const otpData = await findOtpByEmail(email);
  if (!otpData) {
    throw new Error("Invalid or expired OTP");
  }
  if (otpData.expiresAt <= new Date()) {
    throw new Error("OTP has expired");
  }
  const otpHash = otpData.otpHash;

  const isValidOtp = await bcrypt.compare(otp, otpHash);

  if (!isValidOtp) {
    throw new Error("Invalid OTP");
  }
  await markUserEmailVerify(otpData.userId, otpData.id);
}

export async function refreshAccessToken(refreshToken: string) {
  const refreshTokenHash = hashToken(refreshToken);

  const storedToken = await findSessionByRefreshTokenHash(refreshTokenHash);

  if (!storedToken) {
    throw new Error("Invalid refresh token");
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new Error("Refresh token has expired");
  }

  if (storedToken.revokedAt) {
    throw new Error("Refresh token has been revoked");
  }

  const session = storedToken.session;

  if (session.revokedAt) {
    throw new Error("Session has been revoked");
  }
  if (session.expiresAt <= new Date()) {
    throw new Error("Session expired");
  }

  // Rotate refresh token
  const newRefreshToken = createToken(session.userId, session.id, "refresh");

  const newRefreshTokenHash = hashToken(newRefreshToken);

  await rotateRefreshToken({
    oldTokenId: storedToken.id,
    sessionId: session.id,
    tokenHash: newRefreshTokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
  });

  const newAccessToken = createToken(session.userId, session.id, "access");

  return {
    newAccessToken: newAccessToken,
    newRefreshToken: newRefreshToken,
  };
}

// export async function logoutUser(refreshToken: string) {
//   const hash = hashRefreshToken(refreshToken);

//   const session = await findSessionByRefreshTokenHash(hash);

//   if (!session) {
//     return;
//   }

//   await revokeSession(session.id);
// }
