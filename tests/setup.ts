import prisma from "../src/db/prisma.js";

import { beforeAll, afterAll } from "vitest";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  // disconnect from database after each test
  await prisma.$disconnect();
});
