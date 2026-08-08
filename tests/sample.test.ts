import { describe, expect, it } from "vitest";

describe("Sample Test", () => {
  it("should pass", () => {
    expect(1 + 1).toBe(2);
  });

  it("should compare objects", () => {
    expect({
      name: "Ayush",
      age: 20,
    }).toEqual({
      name: "Ayush",
      age: 20,
    });
  });

  it("should work with async code", async () => {
    const result = await Promise.resolve("Hello Vitest");
    expect(result).toBe("Hello Vitest");
  });
});
