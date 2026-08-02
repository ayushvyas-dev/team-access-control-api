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

export async function getOrganizationById(
  userId: string,
  organizationId: string,
) {
  return prisma.organization.findFirst({
    where: {
      id: organizationId,
      memberships: {
        some: {
          userId,
        },
      },
    },
  });
}

export async function updateOrganizationById(
  userId: string,
  organizationId: string,
  name: string,
) {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      memberships: {
        some: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found or permission denied");
  }

  return prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      name,
    },
  });
}

export async function deleteOrganizationById(
  userId: string,
  organizationId: string,
) {
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      memberships: {
        some: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  if (!organization) {
    throw new Error("Organization not found or permission denied");
  }

  return prisma.organization.delete({
    where: {
      id: organizationId,
    },
  });
}
