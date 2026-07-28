// import { config } from "dotenv";

// config({ path: `.env` })

// export const {
//     PORT
// } = process.env


import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env if you aren't doing it via start scripts
dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Environment validation failed:', parsed.error.format());
    process.exit(1); // Kill the server instantly
}

export const config = parsed.data;