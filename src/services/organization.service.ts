import { generateSlug } from "../utils/generateSlug.js";
import {
  createOrganizationWithOwner,
  getOrganizationsByUserId,
} from "../repositories/organization.repository.js";
import { Prisma } from "@prisma/client";

export async function createOrganizationService(name: string, userId: string) {
  // if (!userId) {
  //         throw new Error("User not found");
  //     }
  const MAX_ATTEMPTS = 3;

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

  throw new Error("Failed to generate a unique organization slug");
}

export async function getOrganizationsService(userId: string) {
  try {
    const organizations = await getOrganizationsByUserId(userId);
    if (!organizations) {
      throw new Error("No organizations found for the user");
    }
    return organizations;
  } catch (error) {
    throw error;
  }
}
