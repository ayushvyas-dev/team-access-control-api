import prisma from "../db/db.js";

interface CreateSessionInput {
  userId: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
}

export async function createSession({
  userId,
  userAgent,
  ip,
  expiresAt,
}: CreateSessionInput) {
  return prisma.session.create({
    data: {
      userId,
      userAgent,
      ip,
      expiresAt,
    },
  });
}

export async function findSessionByRefreshTokenHash(tokenHash: string) {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      session: true,
    },
  });
}

export async function rotateRefreshToken(data: {
  oldTokenId: string;
  sessionId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.refreshToken.updateMany({
      where: {
        id: data.oldTokenId,
        sessionId: data.sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (result.count !== 1) {
      throw new Error("Refresh token already revoked or invalid");
    }

    const newRefreshToken = await tx.refreshToken.create({
      data: {
        sessionId: data.sessionId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });

    await tx.refreshToken.update({
      where: {
        id: data.oldTokenId,
      },
      data: {
        replacedByTokenId: newRefreshToken.id,
      },
    });

    return newRefreshToken;
  });
}

export const revokeSession = async (sessionId: string) => {
  return prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const revokeAllUserSessions = async (userId: string) => {
  return prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};
