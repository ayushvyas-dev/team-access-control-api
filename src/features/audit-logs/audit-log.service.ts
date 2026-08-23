import { AppError } from "../../utils/appError.js";
import {
  createAuditLog,
  getAuditLogById,
  getAuditLogs,
  CreateAuditLogData,
  GetAuditLogsOptions,
} from "./audit-log.repository.js";

export async function createAuditLogService(data: CreateAuditLogData) {
  return createAuditLog(data);
}

export async function getAuditLogsService(
  organizationId: string,
  options: GetAuditLogsOptions,
) {
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }

  const auditLogs = await getAuditLogs(organizationId, options);
  if (!auditLogs) {
    throw new AppError("No audit logs found for the given organization", 404);
  }

  return auditLogs;
}

export async function getAuditLogService(
  organizationId: string,
  auditLogId: string,
) {
  if (!organizationId) {
    throw new AppError("Organization ID is required", 400);
  }
  if (!auditLogId) {
    throw new AppError("Audit Log ID is required", 400);
  }

  const auditLog = await getAuditLogById(organizationId, auditLogId);
  if (!auditLog) {
    throw new AppError("Audit log not found", 404);
  }
  return auditLog;
}
