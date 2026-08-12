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

/**
 * @openapi
 * /api/v1/organizations:
 *   post:
 *     summary: Create an organization
 *     description: Creates a new organization for the authenticated user.
 *     tags:
 *       - Organizations
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Organization
 *     responses:
 *       201:
 *         description: Organization created successfully.
 *       400:
 *         description: Invalid request body.
 *       401:
 *         description: Unauthorized. Authentication is required.
 */
organizationRouter.post(
  "/",
  authenticate,
  validate({ body: createOrganizationSchema }),
  createOrganization,
);

/**
 * @openapi
 * /api/v1/organizations:
 *   get:
 *     summary: Get user's organizations
 *     description: Returns all organizations that the authenticated user belongs to.
 *     tags:
 *       - Organizations
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Organizations retrieved successfully.
 *       401:
 *         description: Unauthorized. Authentication is required.
 */

organizationRouter.get("/", authenticate, getOrganizations);

/**
 * @openapi
 * /api/v1/organizations/{orgId}:
 *   get:
 *     summary: Get organization by ID
 *     description: Returns details of a specific organization for the authenticated user.
 *     tags:
 *       - Organizations
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: The ID of the organization.
 *         schema:
 *           type: string
 *         example: clx123abc456
 *     responses:
 *       200:
 *         description: Organization retrieved successfully.
 *       400:
 *         description: Invalid organization ID.
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       403:
 *         description: User does not have access to this organization.
 *       404:
 *         description: Organization not found.
 */
organizationRouter.get(
  "/:organizationId",
  authenticate,
  validate({ params: organizationIdSchema }),
  getOrganization,
);

/**
 * @openapi
 * /api/v1/organizations/{orgId}:
 *   patch:
 *     summary: Update an organization
 *     description: Updates the name of an organization. Only an authorized organization owner can perform this operation.
 *     tags:
 *       - Organizations
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: The ID of the organization to update.
 *         schema:
 *           type: string
 *         example: clx123abc456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Organization Name
 *     responses:
 *       200:
 *         description: Organization updated successfully.
 *       400:
 *         description: Invalid organization ID or request body.
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       403:
 *         description: User is not authorized to update this organization.
 *       404:
 *         description: Organization not found.
 */
organizationRouter.patch(
  "/:organizationId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.ORGANIZATION_UPDATE),
  validate({ params: organizationIdSchema, body: createOrganizationSchema }),
  updateOrganization,
);

/**
 * @openapi
 * /api/v1/organizations/{orgId}:
 *   delete:
 *     summary: Delete an organization
 *     description: Deletes an organization. Only an authorized organization owner can perform this operation.
 *     tags:
 *       - Organizations
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: The ID of the organization to delete.
 *         schema:
 *           type: string
 *         example: clx123abc456
 *     responses:
 *       200:
 *         description: Organization deleted successfully.
 *       400:
 *         description: Invalid organization ID.
 *       401:
 *         description: Unauthorized. Authentication is required.
 *       403:
 *         description: User is not authorized to delete this organization.
 *       404:
 *         description: Organization not found.
 */
organizationRouter.delete(
  "/:organizationId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.ORGANIZATION_DELETE),
  validate({ params: organizationIdSchema }),
  deleteOrganization,
);

export default organizationRouter;

// organizationRouter.patch(
//   "/:organizationId/members/:userId/role",
//   (req, res) => {
//     res.send("update member role endpoint");
//   },
// );

// organizationRouter.delete("/:organizationId/members/:userId", (req, res) => {
//   res.send("remove member from organization endpoint");
// });

// organizationRouter.post("/:organizationId/invitations", (req, res) => {
//   res.send("invite member endpoint");
// });

// organizationRouter.get("/:organizationId/invitations", (req, res) => {
//   res.send("list organization invitations endpoint");
// });

// organizationRouter.post("invitations/:token/accept", (req, res) => {
//   res.send("accept invitation endpoint");
// });

// organizationRouter.post("invitations/:token/resend", (req, res) => {
//   res.send("resend invitation endpoint");
// });

// organizationRouter.delete("invitations/:token/decline", (req, res) => {
//   res.send("decline invitation endpoint");
// });

// organizationRouter.get("/:organizationId/audit-logs", (req, res) => {
//   res.send("get organization audit logs endpoint");
// });
