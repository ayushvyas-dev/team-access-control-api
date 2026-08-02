import z from "zod";
import { Role } from "@prisma/client";

export const roleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const memberIdSchema = z.object({
  memberId: z.uuid(),
});
