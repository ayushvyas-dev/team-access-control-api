import prisma from "../../db/prisma.js";
import { Role } from "@prisma/client";

export async function getMembershipsByOrgId(organizationId: string) {
  return prisma.membership.findMany({
    where: {
      organizationId,
    },
  });
}

export async function getMembershipByOrgAndMemberId(
  organizationId: string,
  memberId: string,
) {
  return prisma.membership.findFirst({
    where: {
      organizationId,
      userId: memberId,
    },
  });
}

export async function updateMembershipWithAuditLog(
  organizationId: string,
  memberId: string,
  role: Role,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findFirst({
      where: {
        id: memberId,
        organizationId,
      },
    });

    if (!membership) {
      return null;
    }

    const updatedMembership = await tx.membership.update({
      where: {
        id: membership.id,
      },
      data: {
        role,
      },
      select: {
        role: true,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId,
        actorId,
        action: "ROLE_CHANGED",
        resourceType: "MEMBERSHIP",
        resourceId: membership.id,
        metadata: {
          memberId,
          previousRole: membership.role,
          newRole: role,
        },
      },
    });

    return updatedMembership;
  });
}

export async function deleteMembershipWithAuditLog(
  organizationId: string,
  memberId: string,
  actorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: memberId,
          organizationId,
        },
      },
    });

    if (!membership) {
      return null;
    }

    await tx.membership.delete({
      where: {
        id: membership.id,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId,
        actorId,
        action: "MEMBER_REMOVED",
        resourceType: "MEMBERSHIP",
        resourceId: membership.id,
        metadata: {
          removedUserId: memberId,
          previousRole: membership.role,
        },
      },
    });

    return membership;
  });
}

export async function deleteUserMembershipWithAuditLog(
  userId: string,
  organizationId: string,
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      return null;
    }

    await tx.membership.delete({
      where: {
        id: membership.id,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId,
        actorId: userId,
        action: "MEMBER_LEFT",
        resourceType: "MEMBERSHIP",
        resourceId: membership.id,
        metadata: {
          memberId: userId,
          previousRole: membership.role,
        },
      },
    });

    return membership;
  });
}
