import {
  getUserById,
  softDeleteUserById,
  updateUserById,
} from "../auth/auth.repository.js";
import { AppError } from "../../utils/appError.js";

export async function getCurrentUser(userId: string) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateCurrentUser(userId: string, name: string) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  if (!name) {
    throw new AppError("User name is required", 400);
  }

  const user = await updateUserById(userId, name);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function deleteCurrentUser(userId: string) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const user = await softDeleteUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
