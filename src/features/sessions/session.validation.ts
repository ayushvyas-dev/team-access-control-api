import z from "zod";

export const deleteSessionSchema = z.object({
  sessionId: z.string().uuid(),
});
