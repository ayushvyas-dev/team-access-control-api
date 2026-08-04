import z from "zod";
import { Role } from "@prisma/client";

export const invitationParamSchema = z.object({
  organizationId: z.uuid(),
});

export const invitationBodySchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

export const invitationDeleteParamSchema = z.object({
  organizationId: z.string().uuid(),
  invitationId: z.string().uuid(),
});
