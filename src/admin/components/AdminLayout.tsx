import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { AdminNoIndex } from "@/admin/components/AdminNoIndex";

const adminNavItems = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/articulos", label: "Articulos" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/ofertas", label: "Ofertas" },
  { to: "/admin/marcas", label: "Marcas" },
  { to: "/admin/tiendas", label: "Tiendas" },
  { to: "/admin/categorias", label: "Categorias" },
  { to: "/admin/importaciones", label: "Importaciones" },
  { to: "/admin/analitica", label: "Analitica" },
  { to: "/admin/auditoria", label: "Auditoria" },
  { to: "/admin/configuracion", label: "Configuracion" },
];

function segmentToLabel(segment: string): string {
  if (!segment) {
    return "Dashboard";
  }

  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAdminAuth();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sesion cerrada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cerrar sesion");
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminNoIndex />

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[250px_1fr]">
        <aside className="border-r border-border bg-background">
          <div className="flex h-16 items-center gap-2 px-4">
            <Link to="/admin" className="flex items-center gap-2">
              <img
                src="/homara-logo.svg"
                alt="Homara"
                className="h-7 w-auto"
                loading="eager"
                decoding="async"
              />
              <div>
                <p className="text-sm font-semibold leading-none">Panel Admin</p>
              </div>
            </Link>
          </div>
          <Separator />

          <ScrollArea className="h-[calc(100vh-64px)] p-3">
            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={Boolean(item.exact)}
                  className={({ isActive }) =>
                    [
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/admin" className="hover:text-foreground">
                  Admin
                </Link>
                {segments.map((segment, index) => {
                  const route = `/admin/${segments.slice(0, index + 1).join("/")}`;
                  const isLast = index === segments.length - 1;

                  return (
                    <span key={route} className="flex items-center gap-2">
                      <span>/</span>
                      {isLast ? (
                        <span className="text-foreground">{segmentToLabel(segment)}</span>
                      ) : (
                        <Link to={route} className="hover:text-foreground">
                          {segmentToLabel(segment)}
                        </Link>
                      )}
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm leading-none">{user?.email || "admin"}</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Salir
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
