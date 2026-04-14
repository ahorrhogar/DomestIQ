import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate } from "@/admin/utils/format";
import { deleteBrand, listBrands, logAdminAction, upsertBrand } from "@/admin/services/adminCatalogService";
import type { AdminBrandRecord } from "@/admin/types";
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
  isActive: z.boolean(),
});

interface FormState {
  id?: string;
  name: string;
  logoUrl: string;
  isActive: boolean;
}

const INITIAL_FORM: FormState = {
  name: "",
  logoUrl: "",
  isActive: true,
};

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminBrandRecord | null>(null);

  const brandsQuery = useQuery({
    queryKey: ["admin-brands"],
    queryFn: listBrands,
  });

  const saveMutation = useMutation({
    mutationFn: upsertBrand,
    onSuccess: async (data) => {
      await logAdminAction({
        action: form.id ? "brand.update" : "brand.create",
        entityType: "brand",
        entityId: data.id,
        payload: { name: data.name },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success(form.id ? "Marca actualizada" : "Marca creada");
      setDialogOpen(false);
      setForm(INITIAL_FORM);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la marca");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: async () => {
      if (deleteTarget) {
        await logAdminAction({
          action: "brand.delete",
          entityType: "brand",
          entityId: deleteTarget.id,
          payload: { name: deleteTarget.name },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Marca eliminada");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la marca");
    },
  });

  const filteredRows = useMemo(() => {
    const safeSearch = search.trim().toLowerCase();

    if (!safeSearch) {
      return brandsQuery.data || [];
    }

    return (brandsQuery.data || []).filter((brand) => brand.name.toLowerCase().includes(safeSearch));
  }, [brandsQuery.data, search]);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setDialogOpen(true);
  };

  const openEdit = (brand: AdminBrandRecord) => {
    setForm({
      id: brand.id,
      name: brand.name,
      logoUrl: brand.logoUrl || "",
      isActive: brand.isActive,
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
      isActive: parsed.data.isActive,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Marcas"
        description="Gestion de marcas disponibles en el catalogo."
        actionLabel="Nueva marca"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar marca..."
            className="sm:max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            {(brandsQuery.data || []).length} marcas registradas
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Actualizada</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.logoUrl || "Sin logo"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={brand.isActive ? "default" : "secondary"}>
                    {brand.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell>{brand.productCount || 0}</TableCell>
                <TableCell>{formatDate(brand.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(brand)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!filteredRows.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No se encontraron marcas.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar marca" : "Nueva marca"}</DialogTitle>
            <DialogDescription>Completa los datos y guarda.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Nombre</Label>
              <Input
                id="brand-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-logo">Logo URL</Label>
              <Input
                id="brand-logo"
                value={form.logoUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Marca activa</p>
                <p className="text-xs text-muted-foreground">Si esta desactivada, no aparecera en selecciones operativas.</p>
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
            <AlertDialogTitle>Eliminar marca</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminara la marca ${deleteTarget?.name}. Esta accion no se puede deshacer.`}
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
