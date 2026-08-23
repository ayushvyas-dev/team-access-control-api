import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  getAuditLogsQuerySchema,
  getAuditLogParamSchema,
} from "./audit-log.validation.js";
import { organizationIdSchema } from "../organizations/organization.validation.js";

const auditLogRouter = Router();

auditLogRouter.get(
  "/organizations/:organizationId/audit-logs",
  validate({ params: organizationIdSchema, query: getAuditLogsQuerySchema }),
  (req, res) => {
    // Logic to retrieve audit logs
    res.send("Retrieve audit logs");
  },
);

auditLogRouter.get(
  "/organizations/:organizationId/audit-logs/:auditLogId",
  validate({ params: getAuditLogParamSchema }),
  (req, res) => {
    // Logic to retrieve a specific audit log entry
    res.send("Retrieve a specific audit log entry");
  },
);

export default auditLogRouter;
