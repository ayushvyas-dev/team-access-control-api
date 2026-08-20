import z from "zod";

export const registerUserSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters long"),
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password cannot exceed 30 characters"),
});

export const loginUserSchema = z.object({
  email: z.email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(30, "Password cannot exceed 30 characters"),
});

export const verifyUserSchema = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});
