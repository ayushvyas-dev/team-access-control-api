import { getMembershipByOrgAndMemberId } from "../memberships/membership.repository.js";
import { getOrganizationById } from "../organizations/organization.repository.js";
import crypto from "crypto";
import { hashToken } from "../../utils/token.js";
import {
  acceptInvitationById,
  createInvitationByOrgAndEmail,
  deleteInvitationByOrgAndInvitationId,
  findInvitationByToken,
  getAllOrgInvitations,
  getInvitationByOrgAndEmail,
  getInvitationByOrgAndInvitationId,
  getMembershipByOrgAndEmail,
  rejectInvitationById,
  createMebershipFromInvitation,
} from "./invitation.repository.js";
import { Role } from "@prisma/client";
import { sendInvitationEmail } from "../../utils/email.js";
import { config } from "../../config/env.config.js";
import { getUserById } from "../auth/auth.repository.js";

export async function createInvitationService(
  organizationId: string,
  userId: string,
  email: string,
  role: Role,
) {
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }
  if (!email || !role) {
    throw new Error("Email and role are required");
  }

  const organization = await getOrganizationById(userId, organizationId);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const membership = await getMembershipByOrgAndMemberId(
    organizationId,
    userId,
  );

  if (!membership) {
    throw new Error("Membership not found");
  }

  if (membership.role !== "ADMIN" && membership.role !== "OWNER") {
    throw new Error("Only admins and owners can create invitations");
  }

  const alreadyMember = await getMembershipByOrgAndEmail(organizationId, email);

  if (alreadyMember) {
    throw new Error("User is already a member of the organization");
  }

  const alreadyInvited = await getInvitationByOrgAndEmail(
    organizationId,
    email,
  );
  if (alreadyInvited && alreadyInvited.expiresAt < new Date()) {
    throw new Error("Invitation expired");
  }
  if (alreadyInvited && alreadyInvited.status === "PENDING") {
    throw new Error("User has already been invited to the organization");
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
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const invitations = await getAllOrgInvitations(organizationId);
  return invitations;
}

export async function deleteInvitationService(
  organizationId: string,
  invitationId: string,
) {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }
  if (!invitationId) {
    throw new Error("Invitation ID is required");
  }

  const invitation = await getInvitationByOrgAndInvitationId(
    organizationId,
    invitationId,
  );

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  await deleteInvitationByOrgAndInvitationId(organizationId, invitationId);

  return invitation;
}

export async function acceptInvitationService(token: string, userId: string) {
  if (!token) {
    throw new Error("Token is required");
  }
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const invitationHash = hashToken(token);

  const invitation = await findInvitationByToken(invitationHash);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.email !== user.email) {
    throw new Error("This invitation was sent to a different email address");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation expired");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation already accepted or rejected");
  }

  await createMebershipFromInvitation(
    invitation.organizationId,
    invitation.invitedById,
    invitation.role,
  );

  const inviteResult = await acceptInvitationById(invitation.id);

  return inviteResult;
}

export async function rejectInvitationService(token: string, userId: string) {
  if (!token) {
    throw new Error("Token is required");
  }
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const invitationHash = hashToken(token);

  const invitation = await findInvitationByToken(invitationHash);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.email !== user.email) {
    throw new Error("This invitation was sent to a different email address");
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error("Invitation expired");
  }

  if (invitation.status !== "PENDING") {
    throw new Error("Invitation already accepted or rejected");
  }

  const inviteResult = await rejectInvitationById(invitation.id);

  return inviteResult;
}
