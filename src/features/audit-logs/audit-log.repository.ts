import prisma from "../../db/prisma.js";
import { AuditAction, AuditResourceType, Prisma } from "@prisma/client";

// export interface CreateAuditLogData {
//   organizationId: string;
//   actorId: string;
//   action: AuditAction;
//   resourceType: AuditResourceType;
//   resourceId?: string;
//   metadata?: Prisma.InputJsonValue;
//   ip?: string;
//   userAgent?: string;
// }

export interface GetAuditLogsOptions {
  page: number;
  limit: number;
  action?: AuditAction;
  actorId?: string;
  resourceType?: AuditResourceType;
}

// export async function createAuditLog(data: CreateAuditLogData) {
//   return prisma.auditLog.create({
//     data: {
//       organizationId: data.organizationId,
//       actorId: data.actorId,
//       action: data.action,
//       resourceType: data.resourceType,
//       resourceId: data.resourceId,
//       metadata: data.metadata,
//       ip: data.ip,
//       userAgent: data.userAgent,
//     },
//   });
// }

export async function getAuditLogs(
  organizationId: string,
  options: GetAuditLogsOptions,
) {
  const { page, limit, action, actorId, resourceType } = options;

  const where: Prisma.AuditLogWhereInput = {
    organizationId,
    ...(action && { action }),
    ...(actorId && { actorId }),
    ...(resourceType && { resourceType }),
  };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  return {
    logs,
    total,
  };
}

export async function getAuditLogById(
  organizationId: string,
  auditLogId: string,
) {
  return prisma.auditLog.findFirst({
    where: {
      id: auditLogId,
      organizationId,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
