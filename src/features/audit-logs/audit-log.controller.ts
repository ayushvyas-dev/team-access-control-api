import { Request, Response, NextFunction } from "express";

export async function getAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const { page, limit, action, actorId, resourceType } = req.query;

    const result = await getAuditLogsService({
      organizationId,
      page,
      limit,
      action,
      actorId,
      resourceType,
    });

    return res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAuditLog(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizationId = req.params.organizationId as string;
    const auditLogId = req.params.auditLogId as string;
    const auditLog = await getAuditLogService(organizationId, auditLogId);
    return res.status(200).json({
      success: true,
      message: "Audit log retrieved successfully",
      data: auditLog,
    });
  } catch (error) {
    return next(error);
  }
}
