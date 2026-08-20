import {
  getUserById,
  softDeleteUserById,
  updateUserById,
} from "../auth/auth.repository.js";
import { AppError } from "../../utils/appError.js";

export async function getCurrentUser(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateCurrentUser(userId: string, name: string) {
  const user = await updateUserById(userId, name);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function deleteCurrentUser(userId: string) {
  const user = await softDeleteUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}
