import {
  getUserById,
  softDeleteUserById,
  updateUserById,
} from "../auth/auth.repository.js";

export async function getCurrentUser(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function updateCurrentUser(userId: string, name: string) {
  try {
    const user = await updateUserById(userId, name);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
}

export async function deleteCurrentUser(userId: string) {
  try {
    const user = await softDeleteUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
}
