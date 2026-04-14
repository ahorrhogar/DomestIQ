import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNoIndex } from "@/admin/components/AdminNoIndex";

export default function AdminDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <AdminNoIndex />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 inline-flex w-fit rounded-full bg-destructive/10 p-2 text-destructive">
            <ShieldX className="h-5 w-5" />
          </div>
          <CardTitle>Acceso denegado</CardTitle>
          <CardDescription>
            Tu usuario esta autenticado, pero no tiene permisos de administrador para este panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/login">Probar con otro usuario</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Volver al sitio publico</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
