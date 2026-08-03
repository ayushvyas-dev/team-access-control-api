import prisma from "../../db/prisma.js";
import { Role } from "@prisma/client";

export async function getInvitationByOrgAndEmail(
  organizationId: string,
  email: string,
) {
  return prisma.invitation.findFirst({
    where: {
      organizationId,
      email,
    },
  });
}

export async function createInvitationByOrgAndEmail(
  organizationId: string,
  invitedById: string,
  email: string,
  role: Role,
  invitationHash: string,
  expiresAt: Date,
) {
  return prisma.invitation.create({
    data: {
      organizationId,
      invitedById,
      email,
      role,
      token: invitationHash,
      expiresAt,
    },
  });
}

export async function deleteInvitation(id: string) {
  return prisma.invitation.delete({
    where: {
      id,
    },
  });
}

export async function getMembershipByOrgAndEmail(
  organizationId: string,
  email: string,
) {
  return prisma.membership.findFirst({
    where: {
      organizationId,
      user: {
        email,
      },
    },
  });
}
