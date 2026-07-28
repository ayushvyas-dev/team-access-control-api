// import prisma  from "../db/db.js";

// interface CreateSessionInput {
//   userId: string;
//   refreshTokenHash: string;
//   expiresAt: Date;
// }

// export const createSession = async ({
//   userId,
//   refreshTokenHash,
//   expiresAt,
// }: CreateSessionInput) => {
//   return prisma.session.create({
//     data: {
//       userId,
//       refreshTokenHash,
//       expiresAt,
//     },
//   });
// };

// export const findSessionByRefreshTokenHash = async (
//   refreshTokenHash: string
// ) => {
//   return prisma.session.findUnique({
//     where: {
//       refreshTokenHash,
//     },
//   });
// };

// export const updateSessionRefreshToken = async (
//   sessionId: string,
//   refreshTokenHash: string
// ) => {
//   return prisma.session.update({
//     where: {
//       id: sessionId,
//     },
//     data: {
//       refreshTokenHash,
//     },
//   });
// };

// export const revokeSession = async (sessionId: string) => {
//   return prisma.session.update({
//     where: {
//       id: sessionId,
//     },
//     data: {
//       revokedAt: new Date(),
//     },
//   });
// };

// export const revokeAllUserSessions = async (userId: string) => {
//   return prisma.session.updateMany({
//     where: {
//       userId,
//       revokedAt: null,
//     },
//     data: {
//       revokedAt: new Date(),
//     },
//   });
// };
