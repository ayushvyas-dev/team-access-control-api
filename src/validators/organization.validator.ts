import z from "zod";

export const createOrganizationSchema = z.object({
    name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(255, "Name must be at most 255 characters long"),
});