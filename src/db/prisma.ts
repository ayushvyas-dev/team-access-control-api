import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { config } from "../config/env.config.js";

const connectionString = config.DATABASE_URL;

const adapter = new PrismaNeon({ connectionString });

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
