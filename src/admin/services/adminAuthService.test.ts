import { beforeEach, describe, expect, it, vi } from "vitest";
import { isUserAdmin } from "@/admin/services/adminAuthService";
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

  it("returns true when app metadata role is admin", async () => {
    const user = { app_metadata: { role: "admin" } } as never;
    await expect(isUserAdmin(user)).resolves.toBe(true);
    expect(getSupabaseClient).not.toHaveBeenCalled();
  });

  it("uses rpc fallback when metadata role is not admin", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    const user = { app_metadata: {} } as never;
    await expect(isUserAdmin(user)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("is_admin");
  });

  it("returns false when rpc fails", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "forbidden" } });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    const user = { app_metadata: {} } as never;
    await expect(isUserAdmin(user)).resolves.toBe(false);
  });
});
