import { Router } from "express";
import {
  deleteCurrentUserMembership,
  deleteMembership,
  getMembership,
  getMemberships,
  updateMembership,
} from "./membership.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { membershipParamsSchema, roleSchema } from "./membership.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { organizationIdSchema } from "../organizations/organization.validation.js";

const membershipRouter = Router();

membershipRouter.get(
  "/organizations/:organizationId/members",
  authenticate,
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
  validate({ params: membershipParamsSchema }),
  deleteMembership,
);

export default membershipRouter;
