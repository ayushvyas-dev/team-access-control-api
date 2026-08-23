import { z } from "zod";
import { AuditAction, AuditResourceType } from "@prisma/client";

export const getAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  action: z.nativeEnum(AuditAction).optional(),

  actorId: z.string().uuid().optional(),

  resourceType: z.nativeEnum(AuditResourceType).optional(),
});
