import { Role } from "@prisma/client";
import {
  getMembershipsByOrgId,
  getMembershipByOrgAndMemberId,
  updateMembershipByOrgAndMemberId,
  deleteMembershipByOrgAndMemberId,
  deleteCurrentUserMembershipById,
} from "./membership.repository.js";

export async function getMembershipsService(organizationId: string) {
  try {
    const memberships = await getMembershipsByOrgId(organizationId);
    if (!memberships) {
      throw new Error(
        "Memberships not found for the given organization and member",
      );
    }
    return memberships;
  } catch (error) {
    throw error;
  }
}

export async function getMembershipService(
  organizationId: string,
  memberId: string,
) {
  try {
    const membership = await getMembershipByOrgAndMemberId(
      organizationId,
      memberId,
    );
    if (!membership) {
      throw new Error(
        "Membership not found for the given organization and member",
      );
    }
    return membership;
  } catch (error) {
    throw error;
  }
}

export async function updateMembershipService(
  organizationId: string,
  memberId: string,
  role: Role,
) {
  try {
    const membership = await updateMembershipByOrgAndMemberId(
      organizationId,
      memberId,
      role,
    );
    if (!membership) {
      throw new Error(
        "Membership not found for the given organization and member",
      );
    }
    return membership;
  } catch (error) {
    throw error;
  }
}

export async function deleteMembershipService(
  organizationId: string,
  memberId: string,
) {
  try {
    const membership = await deleteMembershipByOrgAndMemberId(
      organizationId,
      memberId,
    );
    if (!membership) {
      throw new Error(
        "Membership not found for the given organization and member",
      );
    }
    return membership;
  } catch (error) {
    throw error;
  }
}

export async function deleteCurrentUserMembershipService(
  userId: string,
  organizationId: string,
) {
  try {
    const membership = await deleteCurrentUserMembershipById(
      userId,
      organizationId,
    );
    if (!membership) {
      throw new Error(
        "Membership not found for the given user and organization",
      );
    }
    return membership;
  } catch (error) {
    throw error;
  }
}
