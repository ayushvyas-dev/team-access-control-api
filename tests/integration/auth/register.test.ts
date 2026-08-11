import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";

import app from "../../../src/app.js";
import prisma from "../../../src/db/prisma.js";

let generatedOtp: string;

vi.mock("../../../src/utils/email.js", () => ({
  sendVerificationEmail: vi.fn(async (_email: string, otp: string) => {
    generatedOtp = otp;
  }),
}));

describe("POST /api/v1/auth/register + POST /api/v1/auth/verify-email", () => {
  const email = `test-${Date.now()}@example.com`;

  it("should register and verify a user", async () => {
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Password@123",
      });

    expect(registerResponse.statusCode).toBe(201);

    expect(generatedOtp).toMatch(/^\d{6}$/);

    const verifyResponse = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({
        email,
        otp: generatedOtp,
      });

    expect(verifyResponse.statusCode).toBe(200);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    expect(user?.emailVerified).toBe(true);
  });
});
