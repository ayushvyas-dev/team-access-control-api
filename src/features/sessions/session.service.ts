import {
  deleteAllSessionsByUserId,
  deleteSessionById,
  findAllSessionById,
} from "./session.repository.js";

export async function getAllSessionService(userId: string) {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const sessions = await findAllSessionById(userId);
    if (!sessions) {
      throw new Error("No sessions found for the user");
    }
    return sessions;
  } catch (error) {
    throw error;
  }
}

export async function deleteSessionService(userId: string, sessionId: string) {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (!sessionId) {
      throw new Error("SessionId is required");
    }

    const session = await deleteSessionById(userId, sessionId);
    if (session.count === 0) {
      throw new Error("Session not found or does not belong to the user");
    }
    return session;
  } catch (error) {
    throw new Error("Failed to delete session");
  }
}

export async function deleteAllSessionService(userId: string) {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const sessions = await deleteAllSessionsByUserId(userId);
    if (sessions.count === 0) {
      throw new Error("Session not found or does not belong to the user");
    }
    return sessions;
  } catch (error) {
    throw new Error("Failed to delete all sessions");
  }
}
