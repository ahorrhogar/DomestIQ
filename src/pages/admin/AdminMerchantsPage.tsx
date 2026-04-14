import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate, formatNumber } from "@/admin/utils/format";
import {
  deleteMerchant,
  listMerchants,
  logAdminAction,
  upsertMerchant,
} from "@/admin/services/adminCatalogService";
import type { AdminMerchantRecord } from "@/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  logoUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  domain: z.string().optional(),
  country: z.string().min(2, "Pais requerido"),
  brandColor: z.string().optional(),
  isActive: z.boolean(),
});

interface FormState {
  id?: string;
  name: string;
  logoUrl: string;
  domain: string;
  country: string;
  brandColor: string;
  isActive: boolean;
}

const INITIAL_FORM: FormState = {
  name: "",
  logoUrl: "",
  domain: "",
  country: "ES",
  brandColor: "",
  isActive: true,
};

export default function AdminMerchantsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminMerchantRecord | null>(null);

  const merchantsQuery = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: listMerchants,
  });

  const saveMutation = useMutation({
    mutationFn: upsertMerchant,
    onSuccess: async (data) => {
      await logAdminAction({
        action: form.id ? "merchant.update" : "merchant.create",
        entityType: "merchant",
        entityId: data.id,
        payload: { name: data.name },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
      toast.success(form.id ? "Tienda actualizada" : "Tienda creada");
      setDialogOpen(false);
      setForm(INITIAL_FORM);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la tienda");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMerchant,
    onSuccess: async () => {
      if (deleteTarget) {
        await logAdminAction({
          action: "merchant.delete",
          entityType: "merchant",
          entityId: deleteTarget.id,
          payload: { name: deleteTarget.name },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
      toast.success("Tienda eliminada");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la tienda");
    },
  });

  const filteredRows = useMemo(() => {
    const safeSearch = search.trim().toLowerCase();

    if (!safeSearch) {
      return merchantsQuery.data || [];
    }

    return (merchantsQuery.data || []).filter((merchant) => {
      return merchant.name.toLowerCase().includes(safeSearch) || (merchant.domain || "").toLowerCase().includes(safeSearch);
    });
  }, [merchantsQuery.data, search]);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setDialogOpen(true);
  };

  const openEdit = (merchant: AdminMerchantRecord) => {
    setForm({
      id: merchant.id,
      name: merchant.name,
      logoUrl: merchant.logoUrl || "",
      domain: merchant.domain || "",
      country: merchant.country || "ES",
      brandColor: merchant.brandColor || "",
      isActive: merchant.isActive,
    });
    setDialogOpen(true);
  };

  const onSave = async () => {
    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Formulario invalido");
      return;
    }

    await saveMutation.mutateAsync({
      id: form.id,
      name: parsed.data.name,
      logoUrl: parsed.data.logoUrl || undefined,
      domain: parsed.data.domain || undefined,
      country: parsed.data.country,
      brandColor: parsed.data.brandColor || undefined,
      isActive: parsed.data.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tiendas"
        description="Gestion de merchants y dominios de redireccion."
        actionLabel="Nueva tienda"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar tienda..."
            className="sm:max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            {(merchantsQuery.data || []).length} tiendas registradas
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tienda</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ofertas</TableHead>
              <TableHead>Clics</TableHead>
              <TableHead>Actualizada</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchantsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando tiendas...
                </TableCell>
              </TableRow>
            ) : null}

            {merchantsQuery.error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive">
                  {merchantsQuery.error instanceof Error ? merchantsQuery.error.message : "No se pudieron cargar tiendas"}
                </TableCell>
              </TableRow>
            ) : null}

            {filteredRows.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <p className="text-xs text-muted-foreground">{merchant.domain || "Sin dominio"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={merchant.isActive ? "default" : "secondary"}>
                    {merchant.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell>{formatNumber(merchant.offerCount)}</TableCell>
                <TableCell>{formatNumber(merchant.clicks)}</TableCell>
                <TableCell>{formatDate(merchant.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(merchant)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(merchant)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!merchantsQuery.isLoading && !merchantsQuery.error && !filteredRows.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No se encontraron tiendas.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar tienda" : "Nueva tienda"}</DialogTitle>
            <DialogDescription>Completa los datos de la tienda.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="merchant-name">Nombre</Label>
              <Input
                id="merchant-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="merchant-domain">Dominio</Label>
              <Input
                id="merchant-domain"
                value={form.domain}
                onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
                placeholder="ejemplo.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="merchant-logo">Logo URL</Label>
              <Input
                id="merchant-logo"
                value={form.logoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-country">Pais</Label>
              <Input
                id="merchant-country"
                value={form.country}
                onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-color">Color marca</Label>
              <Input
                id="merchant-color"
                value={form.brandColor}
                onChange={(event) => setForm((prev) => ({ ...prev, brandColor: event.target.value }))}
                placeholder="#111111"
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Tienda activa</p>
                <p className="text-xs text-muted-foreground">Si esta inactiva no se mostraran ofertas nuevas.</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tienda</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminara la tienda ${deleteTarget?.name}. Esta accion no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  void deleteMutation.mutateAsync(deleteTarget.id);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
