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

export async function updateMembershipByOrgAndMemberId(
  organizationId: string,
  memberId: string,
  role: Role,
) {
  return prisma.membership.update({
    where: {
      userId_organizationId: {
        organizationId,
        userId: memberId,
      },
    },
    data: {
      role,
    },
    select: {
      role: true,
    },
  });
}

export async function deleteMembershipByOrgAndMemberId(
  organizationId: string,
  memberId: string,
) {
  return prisma.membership.deleteMany({
    where: {
      organizationId,
      userId: memberId,
    },
  });
}

export async function deleteCurrentUserMembershipById(
  userId: string,
  organizationId: string,
) {
  return prisma.membership.deleteMany({
    where: {
      userId,
      organizationId,
    },
  });
}
