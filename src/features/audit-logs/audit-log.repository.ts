import prisma from "../../db/prisma.js";
import { AuditAction, AuditResourceType, Prisma } from "@prisma/client";

export interface GetAuditLogsOptions {
  page: number;
  limit: number;
  action?: AuditAction;
  actorId?: string;
  resourceType?: AuditResourceType;
}

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
    page,
    limit,
    totalPages: Math.ceil(total / limit),
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
