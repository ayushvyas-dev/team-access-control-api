import { Role } from "@prisma/client";
import {
  getMembershipsByOrgId,
  getMembershipByOrgAndMemberId,
  updateMembershipByOrgAndMemberId,
  deleteMembershipByOrgAndMemberId,
  deleteCurrentUserMembershipById,
} from "./membership.repository.js";
import { AppError } from "../../utils/appError.js";

export async function getMembershipsService(organizationId: string) {
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }

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
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }
  if (!memberId) {
    throw new AppError("Member ID is required", 400);
  }

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
) {
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }
  if (!memberId) {
    throw new AppError("Member ID is required", 400);
  }
  if (!role) {
    throw new AppError("Role is required", 400);
  }

  const membership = await updateMembershipByOrgAndMemberId(
    organizationId,
    memberId,
    role,
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
) {
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }
  if (!memberId) {
    throw new AppError("Member ID is required", 400);
  }

  const membership = await deleteMembershipByOrgAndMemberId(
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

export async function deleteCurrentUserMembershipService(
  userId: string,
  organizationId: string,
) {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }

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
