import prisma from "../db/db.js";

export async function createOrganizationWithOwner(data: {
  name: string;
  slug: string;
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    await tx.membership.create({
      data: {
        userId: data.userId,
        organizationId: organization.id,
        role: "OWNER",
      },
    });

    return organization;
  });
}

export async function getOrganizationsByUserId(userId: string) {
  return prisma.organization.findMany({
    where: {
      memberships: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
