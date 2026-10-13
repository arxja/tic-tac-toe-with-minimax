import { describe, it, expect } from "vitest";

function sum(a: number, b: number): number {
  return a + b;
}

describe("smoke test", () => {
  it("should return the correct product", () => {
    expect(sum(1, 1)).toBe(2)
  })
})