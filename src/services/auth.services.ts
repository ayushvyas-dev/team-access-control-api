import {
  createOtp,
  createUser,
  findOtpByEmail,
  findUserByEmail,
  markUserEmailVerify,
} from "../repositories/auth.repositories.js";
import bcrypt from "bcryptjs";
import { config } from "../config/env.config.js";

import { createAccessToken } from "../utils/accessToken.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";

import { sendVerificationEmail } from "./email.services.js";

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

// export async function loginUser({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) {
//   try {
//     const user = await findUserByEmail(email);
//     if (!user) {
//       throw new Error("Invalid credentials");
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isPasswordValid) {
//       throw new Error("Invalid credentials");
//     }

//     const refreshToken = generateRefreshToken();
//     const refreshTokenHash = hashRefreshToken(refreshToken);

//     const session = await createSession({
//       userId: user.id,
//       refreshTokenHash,
//       expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
//     });

//     // 5. Create access token
//     const accessToken = createAccessToken(user.id, session.id);
//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//       },
//       accessToken,
//       refreshToken,
//     };
//   } catch (error) {
//     throw error;
//   }
// }

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

// export async function refreshAccessToken(refreshToken: string) {
//   const refreshTokenHash = hashRefreshToken(refreshToken);

//   const session = await findSessionByRefreshTokenHash(refreshTokenHash);

//   if (!session) {
//     throw new Error("Invalid refresh token");
//   }

//   if (session.revokedAt) {
//     throw new Error("Session has been revoked");
//   }

//   if (session.expiresAt <= new Date()) {
//     throw new Error("Session has expired");
//   }

//   // Rotate refresh token
//   const newRefreshToken = generateRefreshToken();

//   const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

//   await updateSessionRefreshToken(session.id, newRefreshTokenHash);

//   const newAccessToken = createAccessToken(session.userId, session.id);

//   return {
//     accessToken: newAccessToken,
//     refreshToken: newRefreshToken,
//   };
// }

// export async function logoutUser(refreshToken: string) {
//   const hash = hashRefreshToken(refreshToken);

//   const session = await findSessionByRefreshTokenHash(hash);

//   if (!session) {
//     return;
//   }

//   await revokeSession(session.id);
// }
