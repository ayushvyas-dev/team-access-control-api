import { findSessionByRefreshTokenHash, revokeSession, updateSessionRefreshToken } from "../repositories/session.repository.js";
import { createAccessToken } from "../utils/accessToken.js";
import { generateRefreshToken, hashRefreshToken } from "../utils/refreshToken.js";


export const refreshAccessToken = async (
  refreshToken: string
) => {
  const refreshTokenHash =
    hashRefreshToken(refreshToken);

  const session =
    await findSessionByRefreshTokenHash(
      refreshTokenHash
    );

  if (!session) {
    throw new Error("Invalid refresh token");
  }

  if (session.revokedAt) {
    throw new Error("Session has been revoked");
  }

  if (session.expiresAt <= new Date()) {
    throw new Error("Session has expired");
  }

  // Rotate refresh token
  const newRefreshToken =
    generateRefreshToken();

  const newRefreshTokenHash =
    hashRefreshToken(newRefreshToken);

  await updateSessionRefreshToken(
    session.id,
    newRefreshTokenHash
  );

  const newAccessToken = createAccessToken(
    session.userId,
    session.id
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


export const logoutUser = async (
  refreshToken: string
) => {
  const hash = hashRefreshToken(refreshToken);

  const session =
    await findSessionByRefreshTokenHash(hash);

  if (!session) {
    return;
  }

  await revokeSession(session.id);
};