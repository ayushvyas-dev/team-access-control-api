// import { config } from "dotenv";

// config({ path: `.env` })

// export const {
//     PORT
// } = process.env

import { z } from "zod";
import dotenv from "dotenv";

// Load .env if you aren't doing it via start scripts
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.string().default("30"),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment validation failed:", parsed.error.format());
  process.exit(1); // Kill the server instantly
}

export const config = parsed.data;
