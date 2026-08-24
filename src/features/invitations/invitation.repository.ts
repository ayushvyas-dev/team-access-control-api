import prisma from "../../db/prisma.js";
import { Role } from "@prisma/client";
import { AuditAction, AuditResourceType, Prisma } from "@prisma/client";

export interface CreateAuditLogData {
  organizationId: string;
  actorId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function getUserInvitations(userEmail: string) {
  return prisma.invitation.findMany({
    where: {
      email: userEmail,
    },
    select: {
      id: true,
      role: true,
      status: true,
      expiresAt: true,
      createdAt: true,

      organization: {
        select: {
          id: true,
          name: true,
        },
      },

      invitedBy: {
        select: {
          id: true,
          email: true,
        },
      },
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

// export async function createInvitationByOrgAndEmail(
//   organizationId: string,
//   invitedById: string,
//   email: string,
//   role: Role,
//   invitationHash: string,
//   expiresAt: Date,
// ) {
//   return prisma.invitation.create({
//     data: {
//       organizationId,
//       invitedById,
//       email,
//       role,
//       tokenHash: invitationHash,
//       expiresAt,
//     },
//   });
// }

export async function createInvitationWithAuditLog(
  organizationId: string,
  invitedById: string,
  email: string,
  role: Role,
  invitationHash: string,
  expiresAt: Date,
  auditLog: CreateAuditLogData,
) {
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        organizationId,
        invitedById,
        email,
        role,
        tokenHash: invitationHash,
        expiresAt,
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId: auditLog.organizationId,
        actorId: auditLog.actorId,
        action: auditLog.action,
        resourceType: auditLog.resourceType,
        resourceId: invitation.id,
        metadata: auditLog.metadata,
      },
    });

    return invitation;
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
      tokenHash: invitationHash,
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

// export async function createMembershipFromInvitation(
//   organizationId: string,
//   userId: string,
//   role: Role,
// ) {
//   return prisma.membership.create({
//     data: {
//       organizationId,
//       userId,
//       role,
//     },
//   });
// }

export async function createMembershipWithAuditLog(
  organizationId: string,
  userId: string,
  role: Role,
  invitationId: string,
) {
  return prisma.$transaction(async (tx) => {
    const membership = await tx.membership.create({
      data: {
        organizationId,
        userId,
        role,
      },
    });

    await tx.invitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    await tx.auditLog.create({
      data: {
        organizationId,
        actorId: userId,
        action: "MEMBER_JOINED",
        resourceType: "MEMBERSHIP",
        resourceId: membership.id,
        metadata: {
          invitationId,
          role,
        },
      },
    });

    return membership;
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
