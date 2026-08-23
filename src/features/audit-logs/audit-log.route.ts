import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getAuditLogsQuerySchema,
  getAuditLogParamSchema,
} from "./audit-log.validation.js";
import { organizationIdSchema } from "../organizations/organization.validation.js";
import { getAuditLog, getAuditLogs } from "./audit-log.controller.js";
import { authenticate } from "../../middlewares/authentication.middleware.js";
import { requireOrgMembership } from "../../middlewares/organization.middleware.js";
import { requirePermission } from "../../middlewares/authorization.middleware.js";
import { permissions } from "../../config/permissions.config.js";

const auditLogRouter = Router();

auditLogRouter.get(
  "/organizations/:organizationId/audit-logs",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.AUDIT_LOG_READ),
  validate({ params: organizationIdSchema, query: getAuditLogsQuerySchema }),
  getAuditLogs,
);

auditLogRouter.get(
  "/organizations/:organizationId/audit-logs/:auditLogId",
  authenticate,
  requireOrgMembership,
  requirePermission(permissions.AUDIT_LOG_READ),
  validate({ params: getAuditLogParamSchema }),
  getAuditLog,
);

export default auditLogRouter;
