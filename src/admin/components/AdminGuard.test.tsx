import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { AdminGuard } from "@/admin/components/AdminGuard";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

vi.mock("@/admin/hooks/useAdminAuth", () => ({
  useAdminAuth: vi.fn(),
}));

function renderGuard() {
  render(
    <MemoryRouter initialEntries={["/admin/productos"]}>
      <Routes>
        <Route
          path="/admin/productos"
          element={
            <AdminGuard>
              <div>Contenido admin</div>
            </AdminGuard>
          }
        />
        <Route path="/admin/login" element={<div>Pantalla login</div>} />
        <Route path="/admin/denegado" element={<div>Acceso denegado</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminGuard", () => {
  it("permite entrada cuando el usuario es admin", () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      loading: false,
      user: { id: "admin-user" },
      session: null,
      isAdmin: true,
      error: null,
      refresh: vi.fn(),
      signOut: vi.fn(),
    } as never);

    renderGuard();

    expect(screen.getByText("Contenido admin")).toBeInTheDocument();
  });

  it("bloquea y redirige a denegado cuando no es admin", () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      loading: false,
      user: { id: "regular-user" },
      session: null,
      isAdmin: false,
      error: null,
      refresh: vi.fn(),
      signOut: vi.fn(),
    } as never);

    renderGuard();

    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
  });

  it("redirige a login cuando no hay usuario", () => {
    vi.mocked(useAdminAuth).mockReturnValue({
      loading: false,
      user: null,
      session: null,
      isAdmin: false,
      error: null,
      refresh: vi.fn(),
      signOut: vi.fn(),
    } as never);

    renderGuard();

    expect(screen.getByText("Pantalla login")).toBeInTheDocument();
  });
});
