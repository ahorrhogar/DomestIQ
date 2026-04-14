import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminNoIndex } from "@/admin/components/AdminNoIndex";
import { signInAdmin } from "@/admin/services/adminAuthService";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

const schema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(8, "La clave debe tener al menos 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh, loading, isAdmin, user } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from?.startsWith("/admin") ? state.from : "/admin";
  }, [location.state]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate(redirectPath, { replace: true });
    }
  }, [loading, user, isAdmin, navigate, redirectPath]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true);
      await signInAdmin(values.email, values.password);
      await refresh();
      toast.success("Sesion iniciada");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesion");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-secondary to-background p-4">
      <AdminNoIndex />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceso Administrador</CardTitle>
          <CardDescription>Ingresa con un usuario que tenga rol admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Correo</Label>
              <Input id="admin-email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Clave</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Volver al sitio publico: <Link to="/" className="underline">inicio</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
