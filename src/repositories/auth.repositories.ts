import prisma from "../db/db.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({
    data,
  });
}

export async function createOtp(data: {
  userId: string;
  otpHash: string;
  expiresAt: Date;
}) {
  return prisma.otp.create({
    data,
  });
}

export async function findOtpByEmail(email: string) {
  return prisma.otp.findFirst({
    where: {
      user: {
        email,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      otpHash: true,
      expiresAt: true,
      userId: true,
    },
  });
}

export async function markUserEmailVerify(userId: string, otpId: string) {
  return prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: true,
      },
    }),
    prisma.otp.delete({
      where: {
        id: otpId,
      },
    }),
  ]);
}
