import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrganizationSchema,
  organizationIdSchema,
} from "../validators/organization.validator.js";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  getOrganizations,
  updateOrganization,
} from "../controllers/organization.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

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
  validate({ params: organizationIdSchema, body: createOrganizationSchema }),
  updateOrganization,
);

organizationRouter.patch(
  "/:organizationId/members/:userId/role",
  (req, res) => {
    res.send("update member role endpoint");
  },
);

organizationRouter.delete(
  "/:organizationId",
  authenticate,
  validate({ params: organizationIdSchema }),
  deleteOrganization,
);

organizationRouter.get("/:organizationId/members", (req, res) => {
  res.send("get organization members endpoint");
});

organizationRouter.delete("/:organizationId/members/:userId", (req, res) => {
  res.send("remove member from organization endpoint");
});

organizationRouter.post("/:organizationId/invitations", (req, res) => {
  res.send("invite member endpoint");
});

organizationRouter.get("/:organizationId/invitations", (req, res) => {
  res.send("list organization invitations endpoint");
});

organizationRouter.post("invitations/:token/accept", (req, res) => {
  res.send("accept invitation endpoint");
});

organizationRouter.post("invitations/:token/resend", (req, res) => {
  res.send("resend invitation endpoint");
});

organizationRouter.delete("invitations/:token/decline", (req, res) => {
  res.send("decline invitation endpoint");
});

organizationRouter.get("/:organizationId/audit-logs", (req, res) => {
  res.send("get organization audit logs endpoint");
});

export default organizationRouter;
