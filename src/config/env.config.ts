import { z } from "zod";
import dotenv from "dotenv";

// Load .env if you aren't doing it via start scripts
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  UPSTASH_REDIS_URL: z.string(),
  TEST_DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(30),
  BREVO_API_KEY: z.string(),
  BREVO_SENDER_EMAIL: z.string().email(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
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
