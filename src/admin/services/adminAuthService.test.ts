import { beforeEach, describe, expect, it, vi } from "vitest";
import { isUserAdmin, signInAdmin } from "@/admin/services/adminAuthService";
import { getSupabaseClient } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

describe("adminAuthService.isUserAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when user is missing", async () => {
    await expect(isUserAdmin(null)).resolves.toBe(false);
  });

  it("uses rpc with user_id and returns result", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    const user = { id: "e3e56e8a-87c5-40f0-90f2-943de3cf05ec" } as never;
    await expect(isUserAdmin(user)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("is_admin", { user_id: "e3e56e8a-87c5-40f0-90f2-943de3cf05ec" });
  });

  it("returns false when rpc fails", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "forbidden" } });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    const user = { id: "e3e56e8a-87c5-40f0-90f2-943de3cf05ec" } as never;
    await expect(isUserAdmin(user)).resolves.toBe(false);
  });

  it("ignores app metadata role and still checks rpc", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    const user = {
      id: "e3e56e8a-87c5-40f0-90f2-943de3cf05ec",
      app_metadata: { role: "admin" },
    } as never;

    await expect(isUserAdmin(user)).resolves.toBe(false);
    expect(rpc).toHaveBeenCalledWith("is_admin", { user_id: "e3e56e8a-87c5-40f0-90f2-943de3cf05ec" });
  });
});

describe("adminAuthService.signInAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when sign in fails", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: { message: "invalid_credentials" } });
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });

    vi.mocked(getSupabaseClient).mockReturnValue({
      auth: { signInWithPassword },
      from,
    } as never);

    await expect(signInAdmin("test@example.com", "bad-pass")).rejects.toBeTruthy();
    expect(from).toHaveBeenCalledWith("admin_actions");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "auth.login_failed",
        entity_type: "auth",
      }),
    );
  });
});
