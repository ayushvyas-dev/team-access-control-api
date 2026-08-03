import z from "zod";
import { Role } from "@prisma/client";

export const roleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const membershipParamsSchema = z.object({
  organizationId: z.uuid(),
  memberId: z.uuid(),
});
