import prisma from "../../db/prisma.js";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// export async function createUser(data: {
//   name: string;
//   email: string;
//   passwordHash: string;
// }) {
//   return prisma.user.create({
//     data,
//   });
// }

// export async function createOtp(data: {
//   userId: string;
//   otpHash: string;
//   expiresAt: Date;
// }) {
//   return prisma.otp.create({
//     data,
//   });
// }

export async function createUserWithOtp({
  user,
  otp,
}: {
  user: {
    name: string;
    email: string;
    passwordHash: string;
  };
  otp: {
    otpHash: string;
    expiresAt: Date;
  };
}) {
  return prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: user,
    });

    const createdOtp = await tx.otp.create({
      data: {
        userId: createdUser.id,
        otpHash: otp.otpHash,
        expiresAt: otp.expiresAt,
      },
    });

    return {
      user: createdUser,
      otp: createdOtp,
    };
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

export async function createRefreshToken(data: {
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.refreshToken.create({
    data,
  });
}

export async function updateUserById(userId: string, name: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function softDeleteUserById(userId: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}
