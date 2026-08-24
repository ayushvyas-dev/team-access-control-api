import { Role } from "@prisma/client";
import {
  getMembershipsByOrgId,
  getMembershipByOrgAndMemberId,
  deleteMembershipWithAuditLog,
  deleteCurrentUserMembershipById,
  updateMembershipWithAuditLog,
} from "./membership.repository.js";
import { AppError } from "../../utils/appError.js";

export async function getMembershipsService(organizationId: string) {
  const memberships = await getMembershipsByOrgId(organizationId);
  if (!memberships) {
    throw new AppError(
      "Memberships not found for the given organization and member",
      404,
    );
  }
  return memberships;
}

export async function getMembershipService(
  organizationId: string,
  memberId: string,
) {
  const membership = await getMembershipByOrgAndMemberId(
    organizationId,
    memberId,
  );
  if (!membership) {
    throw new AppError(
      "Membership not found for the given organization and member",
      404,
    );
  }
  return membership;
}

export async function updateMembershipService(
  organizationId: string,
  memberId: string,
  role: Role,
  actorId: string,
) {
  const membership = await updateMembershipWithAuditLog(
    organizationId,
    memberId,
    role,
    actorId,
  );
  if (!membership) {
    throw new AppError(
      "Membership not found for the given organization and member",
      404,
    );
  }
  return membership;
}

export async function deleteMembershipService(
  organizationId: string,
  memberId: string,
  actorId: string,
) {
  const membership = await deleteMembershipWithAuditLog(
    organizationId,
    memberId,
    actorId,
  );
  if (!membership) {
    throw new AppError(
      "Membership not found for the given organization and member",
      404,
    );
  }
  return membership;
}

export async function deleteCurrentUserMembershipService(
  userId: string,
  organizationId: string,
) {
  const membership = await deleteCurrentUserMembershipById(
    userId,
    organizationId,
  );
  if (!membership) {
    throw new AppError(
      "Membership not found for the given user and organization",
      404,
    );
  }
  return membership;
}
