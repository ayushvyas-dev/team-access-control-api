import { getMembershipByOrgAndMemberId } from "../memberships/membership.repository.js";
import { getOrganizationById } from "../organizations/organization.repository.js";
import crypto from "crypto";
import { hashToken } from "../../utils/token.js";
import {
  createInvitationByOrgAndEmail,
  getInvitationByOrgAndEmail,
  getMembershipByOrgAndEmail,
} from "./invitation.repository.js";
import { Role } from "@prisma/client";
import { sendInvitationEmail } from "../../utils/email.js";
import { config } from "../../config/env.config.js";

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

  const invitationUrl = `http://localhost:5000/api/v1/invitations/accept?token=${rawInvitation}`;

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
