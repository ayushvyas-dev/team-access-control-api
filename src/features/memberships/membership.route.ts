import { Router } from "express";
import {
  deleteCurrentUserMembership,
  deleteMembership,
  getMembership,
  getMemberships,
  updateMembership,
} from "./membership.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { memberIdSchema, roleSchema } from "./membership.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { organizationIdSchema } from "../organizations/organization.validation.js";

const membershipRouter = Router();

membershipRouter.get(
  "/organizations/:organizationId/members",
  authenticate,
  validate({ params: memberIdSchema }),
  getMemberships,
);

membershipRouter.get(
  "/organizations/:organizationId/members/:memberId",
  authenticate,
  validate({ params: memberIdSchema }),
  getMembership,
);

membershipRouter.patch(
  "/organizations/:organizationId/members/:memberId",
  authenticate,
  validate({ body: roleSchema }),
  updateMembership,
);

membershipRouter.delete(
  "/organizations/:organizationId/members/:memberId",
  authenticate,
  validate({ params: memberIdSchema }),
  deleteMembership,
);

membershipRouter.delete(
  "/organizations/:organizationId/members/me",
  authenticate,
  validate({ params: memberIdSchema }),
  deleteCurrentUserMembership,
);

export default membershipRouter;
