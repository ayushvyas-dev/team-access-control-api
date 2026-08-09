import { Router } from "express";
import {
  deleteCurrentUserMembership,
  deleteMembership,
  getMembership,
  getMemberships,
  updateMembership,
} from "./membership.controller.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { membershipParamsSchema, roleSchema } from "./membership.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { organizationIdSchema } from "../organizations/organization.validation.js";
import { requireOrgMembership } from "../../middlewares/organization.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";
import { permissions } from "../../config/permissions.config.js";

const membershipRouter = Router();

membershipRouter.get(
  "/organizations/:organizationId/members",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.MEMBER_READ),
  validate({ params: organizationIdSchema }),
  getMemberships,
);

membershipRouter.get(
  "/organizations/:organizationId/members/:memberId",
  authenticate,
  validate({ params: membershipParamsSchema }),
  getMembership,
);

membershipRouter.patch(
  "/organizations/:organizationId/members/:memberId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.MEMBER_UPDATE_ROLE),
  validate({ body: roleSchema }),
  updateMembership,
);

membershipRouter.delete(
  "/organizations/:organizationId/members/me",
  authenticate,
  validate({ params: organizationIdSchema }),
  deleteCurrentUserMembership,
);

membershipRouter.delete(
  "/organizations/:organizationId/members/:memberId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.MEMBER_REMOVE),
  validate({ params: membershipParamsSchema }),
  deleteMembership,
);

export default membershipRouter;
