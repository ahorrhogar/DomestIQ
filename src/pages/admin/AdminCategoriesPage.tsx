import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { BulkActionsBar } from "@/admin/components/BulkActionsBar";
import { useBulkSelection } from "@/admin/hooks/useBulkSelection";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate, formatNumber } from "@/admin/utils/format";
import { exportRowsToExcel } from "@/admin/utils/excel";
import {
  deleteCategory,
  listCategories,
  uploadCategoryImageFile,
  upsertCategory,
} from "@/admin/services/adminCatalogService";
import type { AdminCategoryRecord } from "@/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().optional(),
  parentId: z.string().optional().nullable(),
  icon: z.string().optional(),
  imageUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  sortOrder: z.number().min(0),
  isActive: z.boolean(),
});

interface FormState {
  id?: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const INITIAL_FORM: FormState = {
  name: "",
  slug: "",
  parentId: null,
  icon: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [dialogInitialForm, setDialogInitialForm] = useState(() => JSON.stringify(INITIAL_FORM));
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadInputKey, setUploadInputKey] = useState(0);

  const isDialogDirty = useMemo(() => {
    if (!dialogOpen) {
      return false;
    }

    return JSON.stringify(form) !== dialogInitialForm || uploadFile !== null;
  }, [dialogOpen, form, dialogInitialForm, uploadFile]);

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: listCategories,
  });

  const saveMutation = useMutation({
    mutationFn: upsertCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(form.id ? "Categoria actualizada" : "Categoria creada");
      setDialogOpen(false);
      setForm(INITIAL_FORM);
      setUploadFile(null);
      setUploadInputKey((prev) => prev + 1);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la categoria");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Categoria eliminada");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la categoria");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadCategoryImageFile,
    onSuccess: (url) => {
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setUploadFile(null);
      setUploadInputKey((prev) => prev + 1);
      toast.success("Imagen subida y asignada. Pulsa Guardar para aplicar el cambio");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen");
    },
  });

  const filteredRows = useMemo(() => {
    const safeSearch = search.trim().toLowerCase();

    if (!safeSearch) {
      return categoriesQuery.data || [];
    }

    return (categoriesQuery.data || []).filter((category) => {
      return (
        category.name.toLowerCase().includes(safeSearch) ||
        (category.parentName || "").toLowerCase().includes(safeSearch) ||
        (category.slug || "").toLowerCase().includes(safeSearch)
      );
    });
  }, [categoriesQuery.data, search]);
  const bulkSelection = useBulkSelection(filteredRows);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setDialogInitialForm(JSON.stringify(INITIAL_FORM));
    setUploadFile(null);
    setUploadInputKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const openEdit = (category: AdminCategoryRecord) => {
    const nextForm: FormState = {
      id: category.id,
      name: category.name,
      slug: category.slug || "",
      parentId: category.parentId || null,
      icon: category.icon || "",
      imageUrl: category.imageUrl || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    };
    setForm(nextForm);
    setDialogInitialForm(JSON.stringify(nextForm));
    setUploadFile(null);
    setUploadInputKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const requestCloseDialog = () => {
    if (!isDialogDirty) {
      setDialogOpen(false);
      return;
    }

    const shouldClose = window.confirm("Hay cambios sin guardar. ¿Seguro que quieres salir?");
    if (shouldClose) {
      setDialogOpen(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setDialogOpen(true);
      return;
    }

    requestCloseDialog();
  };

  const parentOptions = useMemo(() => {
    const all = categoriesQuery.data || [];
    return all.filter((category) => !form.id || category.id !== form.id);
  }, [categoriesQuery.data, form.id]);

  const onSave = async () => {
    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Formulario invalido");
      return;
    }

    await saveMutation.mutateAsync({
      id: form.id,
      name: parsed.data.name,
      slug: parsed.data.slug || undefined,
      parentId: parsed.data.parentId || null,
      icon: parsed.data.icon || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    });
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: async (selectedRows: AdminCategoryRecord[]) => {
      for (const row of selectedRows) {
        await deleteCategory(row.id);
      }
      return selectedRows;
    },
    onSuccess: async (deletedRows) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      bulkSelection.clearSelection();
      setBulkDeleteOpen(false);
      toast.success(`${deletedRows.length} categorias eliminadas`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudieron eliminar las categorias seleccionadas");
    },
  });

  const onExportSelected = () => {
    try {
      exportRowsToExcel({
        rows: bulkSelection.selectedRows,
        columns: [
          { header: "Categoria", value: (row) => row.name, width: 28 },
          { header: "Slug", value: (row) => row.slug || "", width: 24 },
          { header: "Padre", value: (row) => row.parentName || "", width: 24 },
          { header: "Activa", value: (row) => (row.isActive ? "Si" : "No"), width: 10 },
          { header: "Productos", value: (row) => row.productCount ?? 0, width: 12 },
          { header: "Orden", value: (row) => row.sortOrder, width: 10 },
          { header: "Actualizada", value: (row) => formatDate(row.updatedAt), width: 20 },
        ],
        fileName: `categorias_${new Date().toISOString().slice(0, 10)}`,
        sheetName: "Categorias",
      });
      toast.success("Excel exportado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el Excel");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categorias"
        description="Gestion jerarquica de categorias y subcategorias."
        actionLabel="Nueva categoria"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar categoria..."
            className="sm:max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            {(categoriesQuery.data || []).length} categorias registradas
          </p>
        </div>

        {bulkSelection.selectedCount > 0 ? (
          <BulkActionsBar
            selectedCount={bulkSelection.selectedCount}
            onExport={onExportSelected}
            onDelete={() => setBulkDeleteOpen(true)}
            onClear={bulkSelection.clearSelection}
            isDeleting={bulkDeleteMutation.isPending}
          />
        ) : null}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={bulkSelection.allSelected ? true : bulkSelection.someSelected ? "indeterminate" : false}
                  onCheckedChange={(checked) => bulkSelection.setAllSelected(Boolean(checked))}
                  aria-label="Seleccionar todas"
                />
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Padre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Actualizada</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Cargando categorias...
                </TableCell>
              </TableRow>
            ) : null}

            {categoriesQuery.error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive">
                  {categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "No se pudieron cargar categorias"}
                </TableCell>
              </TableRow>
            ) : null}

            {filteredRows.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <Checkbox
                    checked={bulkSelection.isSelected(category.id)}
                    onCheckedChange={(checked) => bulkSelection.setRowSelected(category.id, Boolean(checked))}
                    aria-label={`Seleccionar categoria ${category.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.slug || "Sin slug"}</p>
                  </div>
                </TableCell>
                <TableCell>{category.parentName || "-"}</TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell>{formatNumber(category.productCount)}</TableCell>
                <TableCell>{category.sortOrder}</TableCell>
                <TableCell>{formatDate(category.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(category)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!categoriesQuery.isLoading && !categoriesQuery.error && !filteredRows.length ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No se encontraron categorias.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar categoria" : "Nueva categoria"}</DialogTitle>
            <DialogDescription>Configura nombre, jerarquia y visibilidad.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-name">Nombre</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="hogar-decor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-order">Orden</Label>
              <Input
                id="category-order"
                type="number"
                value={String(form.sortOrder)}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setForm((prev) => ({ ...prev, sortOrder: Number.isFinite(next) ? next : 0 }));
                }}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Categoria padre</Label>
              <Select
                value={form.parentId || "__none__"}
                onValueChange={(value) => setForm((prev) => ({ ...prev, parentId: value === "__none__" ? null : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin padre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin padre</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.parentName ? `${option.parentName} / ${option.name}` : option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-icon">Icono</Label>
              <Input
                id="category-icon"
                value={form.icon}
                onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
                placeholder="home"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-image">Imagen URL</Label>
              <Input
                id="category-image"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="category-image-file">Subir imagen desde archivo</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  key={uploadInputKey}
                  id="category-image-file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!uploadFile || uploadImageMutation.isPending}
                  onClick={() => {
                    if (uploadFile) {
                      uploadImageMutation.mutate(uploadFile);
                    }
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadImageMutation.isPending ? "Subiendo..." : "Subir"}
                </Button>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Categoria activa</p>
                <p className="text-xs text-muted-foreground">Controla si se usara en selectors y catalogo activo.</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={requestCloseDialog}>
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
            <AlertDialogTitle>Eliminar categoria</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminara la categoria ${deleteTarget?.name}. Si tiene productos asociados, la eliminacion puede fallar.`}
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categorias seleccionadas</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminaran ${bulkSelection.selectedCount} categorias. Si tienen productos asociados, la eliminacion puede fallar.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void bulkDeleteMutation.mutateAsync(bulkSelection.selectedRows);
              }}
            >
              Eliminar seleccionadas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
