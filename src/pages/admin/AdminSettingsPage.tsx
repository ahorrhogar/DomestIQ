import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate } from "@/admin/utils/format";
import { listSyncStatus, updateSyncStatus } from "@/admin/services/adminCatalogService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  source: z.string().min(2, "Source requerido"),
  status: z.enum(["healthy", "warning", "error"]),
  message: z.string().optional(),
});

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  healthy: "default",
  warning: "secondary",
  error: "destructive",
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [source, setSource] = useState("catalog_primary");
  const [status, setStatus] = useState<"healthy" | "warning" | "error">("healthy");
  const [message, setMessage] = useState("");

  const syncQuery = useQuery({
    queryKey: ["admin-sync-status"],
    queryFn: listSyncStatus,
  });

  const sourceOptions = useMemo(() => {
    return Array.from(new Set((syncQuery.data || []).map((row) => row.source))).sort((a, b) => a.localeCompare(b));
  }, [syncQuery.data]);

  const updateMutation = useMutation({
    mutationFn: updateSyncStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-sync-status"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard-metrics"] });
      toast.success("Estado de sync actualizado");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el estado");
    },
  });

  const onSubmit = async () => {
    const parsed = schema.safeParse({ source, status, message });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Formulario invalido");
      return;
    }

    const now = new Date().toISOString();
    await updateMutation.mutateAsync({
      source: parsed.data.source,
      status: parsed.data.status,
      message: parsed.data.message || undefined,
      metadata: { updatedFrom: "admin_settings" },
      lastSuccessAt: parsed.data.status === "healthy" ? now : null,
      lastErrorAt: parsed.data.status === "error" ? now : null,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Configuracion"
        description="Estado operativo de fuentes, diagnostico y notas de monitoreo."
      />

      <Card>
        <CardHeader>
          <CardTitle>Actualizar estado de fuente</CardTitle>
          <CardDescription>Permite registrar estado de sincronizacion manual o por incidentes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <Label>Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                  <SelectItem value="catalog_primary">catalog_primary</SelectItem>
                  <SelectItem value="merchant_feed">merchant_feed</SelectItem>
                  <SelectItem value="affiliate_export">affiliate_export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as "healthy" | "warning" | "error") }>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">healthy</SelectItem>
                  <SelectItem value="warning">warning</SelectItem>
                  <SelectItem value="error">error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="sync-source-custom">Source personalizado</Label>
              <Input
                id="sync-source-custom"
                placeholder="Escribe para sobreescribir source"
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.trim()) {
                    setSource(value.trim());
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sync-message">Mensaje</Label>
            <Textarea
              id="sync-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              placeholder="Detalle de estado, causa o accion tomada"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Actualizando..." : "Guardar estado"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado actual de fuentes</CardTitle>
          <CardDescription>Vista consolidada para monitoreo y soporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ultimo exito</TableHead>
                <TableHead>Ultimo error</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead>Mensaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(syncQuery.data || []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status] || "outline"}>{row.status}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(row.lastSuccessAt)}</TableCell>
                  <TableCell>{formatDate(row.lastErrorAt)}</TableCell>
                  <TableCell>{formatDate(row.updatedAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.message || "-"}</TableCell>
                </TableRow>
              ))}

              {!syncQuery.data?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay estados de sincronizacion registrados.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
