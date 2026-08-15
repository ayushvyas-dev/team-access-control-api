import prisma from "../../db/prisma.js";
import { Role } from "@prisma/client";

export async function getUserInvitations(email: string) {
  return prisma.invitation.findMany({
    where: {
      email: email,
      status: "PENDING",
    },
    select: {
      id: true,
      organizationId: true,
      email: true,
      role: true,
      expiresAt: true,
      createdAt: true,
    },
  });
}

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

export async function getInvitationByOrgAndInvitationId(
  organizationId: string,
  invitationId: string,
) {
  return prisma.invitation.findFirst({
    where: {
      organizationId,
      id: invitationId,
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

export async function deleteInvitationByOrgAndInvitationId(
  organizationId: string,
  invitationId: string,
) {
  return prisma.invitation.delete({
    where: {
      organizationId,
      id: invitationId,
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

export async function getAllOrgInvitations(organizationId: string) {
  return prisma.invitation.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      createdAt: true,
    },
  });
}

export async function findInvitationById(invitationId: string) {
  return prisma.invitation.findFirst({
    where: {
      id: invitationId,
    },
  });
}

export async function createMembershipFromInvitation(
  organizationId: string,
  userId: string,
  role: Role,
) {
  return prisma.membership.create({
    data: {
      organizationId,
      userId,
      role,
    },
  });
}

export async function acceptInvitationById(invitationId: string) {
  return prisma.invitation.update({
    where: {
      id: invitationId,
    },
    data: {
      status: "ACCEPTED",
    },
  });
}

export async function rejectInvitationById(invitationId: string) {
  return prisma.invitation.update({
    where: {
      id: invitationId,
    },
    data: {
      status: "REJECTED",
    },
  });
}
