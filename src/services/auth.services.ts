import {
  createOtp,
  createRefreshToken,
  createUser,
  findOtpByEmail,
  findUserByEmail,
  markUserEmailVerify,
} from "../repositories/auth.repositories.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";
import crypto from "crypto";



import {
  createSession,
  findSessionByRefreshTokenHash,
  rotateRefreshToken,
} from "../repositories/session.repository.js";

import { sendVerificationEmail } from "./email.services.js";
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

    const accessToken = jwt.sign(
      {
        sub: user.id,
        sessionId: session.id,
        type: "access",
      },
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: 15 * 60,
        jwtid: crypto.randomUUID()
      },
    );


    const refreshToken = jwt.sign(
      {
        sub: user.id,
        sessionId: session.id,
        type: "refresh",
      },
      config.REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_LIFETIME,
        jwtid: crypto.randomUUID()
      },
    );
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");


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
 
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

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
  const newRefreshToken = jwt.sign(
    {
      sub: session.userId,
      sessionId: session.id,
      type: "refresh",
    },
    config.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
      jwtid: crypto.randomUUID()
    },
  );

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

   

    await rotateRefreshToken({
    oldTokenId: storedToken.id,
    sessionId: session.id,
    tokenHash: newRefreshTokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_LIFETIME),
  });

 
  const newAccessToken = jwt.sign(
    {
      sub: session.userId,
      sessionId: session.id,
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
      jwtid: crypto.randomUUID()
    },
  );

 

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
