import { generateSlug } from "../../utils/generateSlug.js";
import {
  createOrganizationWithOwner,
  deleteOrganizationById,
  getOrganizationById,
  getOrganizationsByUserId,
  updateOrganizationById,
} from "./organization.repository.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../utils/appError.js";

export async function createOrganizationService(name: string, userId: string) {
  const MAX_ATTEMPTS = 3;

  if (!name) {
    throw new AppError("Organization name is required", 400);
  }
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug(name);

    try {
      return await createOrganizationWithOwner({
        name,
        slug,
        userId,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError("Failed to generate a unique organization slug", 400);
}

export async function getOrganizationsService(userId: string) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const organizations = await getOrganizationsByUserId(userId);
  if (!organizations) {
    throw new AppError("No organizations found for the user", 404);
  }
  return organizations;
}

export async function getOrganizationService(
  userId: string,
  organizationId: string,
) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }

  const organization = await getOrganizationById(userId, organizationId);
  if (!organization) {
    throw new AppError("Organization not found for the user", 404);
  }
  return organization;
}

export async function updateOrganizationService(
  userId: string,
  organizationId: string,
  name: string,
) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }
  if (!name) {
    throw new AppError("Organization name is required", 400);
  }

  const organization = await updateOrganizationById(
    userId,
    organizationId,
    name,
  );
  if (!organization) {
    throw new AppError("Organization not found for the user", 404);
  }
  return organization;
}

export async function deleteOrganizationService(
  userId: string,
  organizationId: string,
) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }

  const organization = await deleteOrganizationById(userId, organizationId);
  if (!organization) {
    throw new AppError("Organization not found for the user", 404);
  }
  return organization;
}
