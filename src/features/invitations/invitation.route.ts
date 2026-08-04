import { Router } from "express";
import {
  createInvitation,
  deleteInvitation,
  getInvitations,
} from "./invitation.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  invitationParamSchema,
  invitationBodySchema,
  invitationDeleteParamSchema,
} from "./invitation.validation.js";

const invitationRouter = Router();

invitationRouter.post(
  "/organizations/:organizationId/invitations",
  authenticate,
  validate({ params: invitationParamSchema, body: invitationBodySchema }),
  createInvitation,
);

invitationRouter.get(
  "/organizations/:organizationId/invitations",
  authenticate,
  validate({ params: invitationParamSchema }),
  getInvitations,
);

invitationRouter.delete(
  "/organizations/:organizationId/invitations/:invitationId",
  authenticate,
  validate({ params: invitationDeleteParamSchema }),
  deleteInvitation,
);

// invitationRouter.post("/invitations/:token/accept", acceptInvitation);

// invitationRouter.post("/invitations/:token/reject", rejectInvitation);

export default invitationRouter;
