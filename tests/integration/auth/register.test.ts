// Vitest
import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../../../src/app.js";

describe("POST /auth/register", async () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "ayushvyas909@gmail.com",
      password: "password",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
