import { Router } from "express";
import {
  acceptInvitation,
  createInvitation,
  deleteInvitation,
  getInvitations,
  getUserInvitations,
  rejectInvitation,
} from "./invitation.controller.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  invitationParamSchema,
  invitationBodySchema,
  invitationDeleteParamSchema,
  invitationIdParamsSchema,
} from "./invitation.validation.js";
import { requireOrgMembership } from "../../middlewares/organization.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";
import { permissions } from "../../config/permissions.config.js";

const invitationRouter = Router();

invitationRouter.get("/invitations", authenticate, getUserInvitations);

invitationRouter.post(
  "/organizations/:organizationId/invitations",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.INVITATION_CREATE),
  validate({ params: invitationParamSchema, body: invitationBodySchema }),
  createInvitation,
);

invitationRouter.get(
  "/organizations/:organizationId/invitations",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.INVITATION_READ),
  validate({ params: invitationParamSchema }),
  getInvitations,
);

invitationRouter.delete(
  "/organizations/:organizationId/invitations/:invitationId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.INVITATION_DELETE),
  validate({ params: invitationDeleteParamSchema }),
  deleteInvitation,
);

invitationRouter.post(
  "/invitations/:invitationId/accept",
  authenticate,
  validate({ params: invitationIdParamsSchema }),
  acceptInvitation,
);

invitationRouter.post(
  "/invitations/:invitationId/reject",
  authenticate,
  validate({ params: invitationIdParamsSchema }),
  rejectInvitation,
);

export default invitationRouter;
