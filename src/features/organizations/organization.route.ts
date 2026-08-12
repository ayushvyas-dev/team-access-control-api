import { Router } from "express";

import {
  createOrganizationSchema,
  organizationIdSchema,
} from "./organization.validation.js";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
} from "./organization.controller.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireOrgMembership } from "../../middlewares/organization.middleware.js";
import { permissions } from "../../config/permissions.config.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";

const organizationRouter = Router();

organizationRouter.post(
  "/",
  authenticate,
  validate({ body: createOrganizationSchema }),
  createOrganization,
);

organizationRouter.get("/", authenticate, getOrganizations);

organizationRouter.get(
  "/:organizationId",
  authenticate,
  validate({ params: organizationIdSchema }),
  getOrganization,
);

organizationRouter.patch(
  "/:organizationId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.ORGANIZATION_UPDATE),
  validate({ params: organizationIdSchema, body: createOrganizationSchema }),
  updateOrganization,
);

organizationRouter.delete(
  "/:organizationId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.ORGANIZATION_DELETE),
  validate({ params: organizationIdSchema }),
  deleteOrganization,
);

export default organizationRouter;

// organizationRouter.get("/:organizationId/audit-logs", (req, res) => {
//   res.send("get organization audit logs endpoint");
// });
