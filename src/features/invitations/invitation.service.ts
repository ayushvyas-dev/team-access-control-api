import { getMembershipByOrgAndMemberId } from "../memberships/membership.repository.js";
import { getOrganizationById } from "../organizations/organization.repository.js";
import crypto from "crypto";
import { hashToken } from "../../utils/token.js";
import {
  acceptInvitationById,
  createInvitationByOrgAndEmail,
  deleteInvitationByOrgAndInvitationId,
  getAllOrgInvitations,
  getInvitationByOrgAndEmail,
  getInvitationByOrgAndInvitationId,
  getMembershipByOrgAndEmail,
  rejectInvitationById,
  createMembershipFromInvitation,
  getUserInvitations,
  findInvitationById,
} from "./invitation.repository.js";
import { Role } from "@prisma/client";
import { sendInvitationEmail } from "../../utils/email.js";
import { config } from "../../config/env.config.js";
import { getUserById } from "../auth/auth.repository.js";
import { AppError } from "../../utils/appError.js";

export async function getUserInvitationsService(userId: string) {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const email = user.email;

  const invitations = await getUserInvitations(email);
  if (!invitations) {
    throw new AppError("No invitations found for the user", 404);
  }
  return invitations;
}

export async function createInvitationService(
  organizationId: string,
  userId: string,
  email: string,
  role: Role,
) {
  const organization = await getOrganizationById(userId, organizationId);

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const membership = await getMembershipByOrgAndMemberId(
    organizationId,
    userId,
  );

  if (!membership) {
    throw new AppError("Membership not found", 404);
  }

  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    throw new AppError("Only admins and owners can create invitations", 403);
  }

  const alreadyMember = await getMembershipByOrgAndEmail(organizationId, email);

  if (alreadyMember) {
    throw new AppError("User is already a member of the organization", 400);
  }

  const alreadyInvited = await getInvitationByOrgAndEmail(
    organizationId,
    email,
  );
  if (alreadyInvited && alreadyInvited.expiresAt < new Date()) {
    throw new AppError("Invitation expired", 400);
  }
  if (alreadyInvited && alreadyInvited.status === "PENDING") {
    throw new AppError(
      "User has already been invited to the organization",
      400,
    );
  }

  const rawInvitation = crypto.randomBytes(32).toString("hex");
  const invitationHash = hashToken(rawInvitation);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await createInvitationByOrgAndEmail(
    organizationId,
    userId,
    email,
    role,
    invitationHash,
    expiresAt,
  );
  if (!invitation) {
    throw new AppError("Failed to create invitation", 500);
  }

  const invitationUrl = `http://localhost:5000/api/v1/invitations/${rawInvitation}/accept`;

  if (config.NODE_ENV === "production") {
    await sendInvitationEmail(email, organization.name, invitationUrl);
  }

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    invitationUrl:
      process.env.NODE_ENV === "development" ? invitationUrl : undefined,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  };
}

export async function getInvitationsService(organizationId: string) {
  const invitations = await getAllOrgInvitations(organizationId);
  if (!invitations) {
    throw new AppError("No invitations found for the organization", 404);
  }
  return invitations;
}

export async function deleteInvitationService(
  organizationId: string,
  invitationId: string,
) {
  const invitation = await getInvitationByOrgAndInvitationId(
    organizationId,
    invitationId,
  );

  if (!invitation) {
    throw new AppError("Invitation not found", 404);
  }

  const deletedInvitation = await deleteInvitationByOrgAndInvitationId(
    organizationId,
    invitationId,
  );
  if (!deletedInvitation) {
    throw new AppError("Failed to delete invitation", 500);
  }

  return invitation;
}

export async function acceptInvitationService(
  userId: string,
  invitationId: string,
) {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const invitation = await findInvitationById(invitationId);

  if (!invitation) {
    throw new AppError("Invitation not found", 404);
  }

  if (invitation.email !== user.email) {
    throw new AppError(
      "This invitation was sent to a different email address",
      400,
    );
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError("Invitation expired", 400);
  }

  if (invitation.status !== "PENDING") {
    throw new AppError("Invitation already accepted or rejected", 400);
  }

  const createMembershipResult = await createMembershipFromInvitation(
    invitation.organizationId,
    userId,
    invitation.role,
  );
  if (!createMembershipResult) {
    throw new AppError("Failed to create membership from invitation", 500);
  }

  const inviteResult = await acceptInvitationById(invitation.id);
  if (!inviteResult) {
    throw new AppError("Failed to accept invitation", 500);
  }

  return inviteResult;
}

export async function rejectInvitationService(
  userId: string,
  invitationId: string,
) {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const invitation = await findInvitationById(invitationId);

  if (!invitation) {
    throw new AppError("Invitation not found", 404);
  }

  if (invitation.email !== user.email) {
    throw new AppError(
      "This invitation was sent to a different email address",
      400,
    );
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError("Invitation expired", 400);
  }

  if (invitation.status !== "PENDING") {
    throw new AppError("Invitation already accepted or rejected", 400);
  }

  const inviteResult = await rejectInvitationById(invitation.id);
  if (!inviteResult) {
    throw new AppError("Failed to reject invitation", 500);
  }

  return inviteResult;
}
