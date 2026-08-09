import { Router } from "express";
import {
  acceptInvitation,
  createInvitation,
  deleteInvitation,
  getInvitations,
  rejectInvitation,
} from "./invitation.controller.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  invitationParamSchema,
  invitationBodySchema,
  invitationDeleteParamSchema,
  invitationTokenParamsSchema,
} from "./invitation.validation.js";
import { requireOrgMembership } from "../../middlewares/organization.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";
import { permissions } from "../../config/permissions.config.js";

const invitationRouter = Router();

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
  "/invitations/:token/accept",
  authenticate,
  validate({ params: invitationTokenParamsSchema }),
  acceptInvitation,
);

invitationRouter.post(
  "/invitations/:token/reject",
  authenticate,
  validate({ params: invitationTokenParamsSchema }),
  rejectInvitation,
);

export default invitationRouter;
