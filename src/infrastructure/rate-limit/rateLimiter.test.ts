import { describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/infrastructure/rate-limit/rateLimiter";

describe("rateLimiter", () => {
  it("blocks when request count exceeds policy", () => {
    const policy = { key: "unit-test-limit", windowMs: 60_000, maxRequests: 2 };

    const first = checkRateLimit(policy);
    const second = checkRateLimit(policy);
    const third = checkRateLimit(policy);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });

  it("resets after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T12:00:00.000Z"));

    const policy = { key: "unit-test-reset", windowMs: 1_000, maxRequests: 1 };

    const first = checkRateLimit(policy);
    const second = checkRateLimit(policy);
    vi.advanceTimersByTime(1_100);
    const third = checkRateLimit(policy);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(third.allowed).toBe(true);

    vi.useRealTimers();
  });
});
