import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Copy, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { BulkActionsBar } from "@/admin/components/BulkActionsBar";
import { useBulkSelection } from "@/admin/hooks/useBulkSelection";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatCurrency, formatDate, formatNumber } from "@/admin/utils/format";
import { exportRowsToExcel } from "@/admin/utils/excel";
import {
  addProductImage,
  deleteProduct,
  deleteProductImage,
  duplicateProduct,
  listBrands,
  listCategories,
  listProductImages,
  listProducts,
  logAdminAction,
  setPrimaryProductImage,
  upsertProduct,
  uploadProductImage,
} from "@/admin/services/adminCatalogService";
import type { AdminProductRecord } from "@/admin/types";
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(3, "Nombre requerido"),
  slug: z.string().min(3, "Slug requerido"),
  brandId: z.string().uuid("Selecciona una marca"),
  categoryId: z.string().uuid("Selecciona una categoria"),
  shortDescription: z.string().min(10, "Descripcion corta requerida"),
  longDescription: z.string().min(20, "Descripcion larga requerida"),
  tags: z.string().optional(),
  technicalSpecsText: z.string().optional(),
  sku: z.string().optional(),
  ean: z.string().optional(),
  isActive: z.boolean(),
});

interface FormState {
  id?: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  shortDescription: string;
  longDescription: string;
  tags: string;
  technicalSpecsText: string;
  sku: string;
  ean: string;
  isActive: boolean;
}

const INITIAL_FORM: FormState = {
  name: "",
  slug: "",
  brandId: "",
  categoryId: "",
  shortDescription: "",
  longDescription: "",
  tags: "",
  technicalSpecsText: "",
  sku: "",
  ean: "",
  isActive: true,
};

function buildSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function specsToText(specs: Array<{ label: string; value: string }>): string {
  return specs.map((item) => `${item.label}: ${item.value}`).join("\n");
}

function parseSpecsText(value: string): Array<{ label: string; value: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(":");
      const label = parts.shift()?.trim() || "";
      const specValue = parts.join(":").trim();
      return { label, value: specValue };
    })
    .filter((item) => item.label && item.value);
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const brandsQuery = useQuery({ queryKey: ["admin-brands"], queryFn: listBrands });
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });

  const productsQuery = useQuery({
    queryKey: ["admin-products", { page, pageSize, search, brandFilter, categoryFilter, statusFilter }],
    queryFn: () =>
      listProducts({
        page,
        pageSize,
        search,
        brandId: brandFilter === "all" ? undefined : brandFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      }),
  });

  const productImagesQuery = useQuery({
    queryKey: ["admin-product-images", form.id],
    queryFn: () => listProductImages(form.id as string),
    enabled: dialogOpen && Boolean(form.id),
  });

  const saveMutation = useMutation({
    mutationFn: upsertProduct,
    onSuccess: async (data) => {
      await logAdminAction({
        action: form.id ? "product.update" : "product.create",
        entityType: "product",
        entityId: data.id,
        payload: { name: data.name },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(form.id ? "Producto actualizado" : "Producto creado");
      setDialogOpen(false);
      setForm(INITIAL_FORM);
      setNewImageUrl("");
      setUploadFile(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el producto");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: async (data) => {
      await logAdminAction({
        action: "product.duplicate",
        entityType: "product",
        entityId: data.id,
        payload: { from: "manual" },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Producto duplicado");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo duplicar el producto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      if (deleteTarget) {
        await logAdminAction({
          action: "product.delete",
          entityType: "product",
          entityId: deleteTarget.id,
          payload: { name: deleteTarget.name },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Producto eliminado");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el producto");
    },
  });

  const addImageUrlMutation = useMutation({
    mutationFn: (params: { productId: string; url: string }) => addProductImage(params.productId, params.url, false),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-product-images", form.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setNewImageUrl("");
      toast.success("Imagen agregada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo agregar imagen");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (params: { productId: string; file: File }) => uploadProductImage(params.productId, params.file, false),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-product-images", form.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setUploadFile(null);
      toast.success("Imagen subida");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo subir imagen");
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (params: { productId: string; imageId: string }) => setPrimaryProductImage(params.productId, params.imageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-product-images", form.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Imagen principal actualizada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar imagen principal");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-product-images", form.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Imagen eliminada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la imagen");
    },
  });

  const rows = productsQuery.data?.rows || [];
  const bulkSelection = useBulkSelection(rows);
  const total = productsQuery.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const categoryOptions = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const brandOptions = useMemo(() => brandsQuery.data || [], [brandsQuery.data]);
  const categorySelectOptions = useMemo(
    () =>
      categoryOptions.map((category) => ({
        value: category.id,
        label: category.parentName ? `${category.parentName} / ${category.name}` : category.name,
      })),
    [categoryOptions],
  );
  const categoryFilterOptions = useMemo(
    () => [{ value: "all", label: "Todas las categorias" }, ...categorySelectOptions],
    [categorySelectOptions],
  );

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setDialogOpen(true);
  };

  const openEdit = (product: AdminProductRecord) => {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brandId: product.brandId,
      categoryId: product.categoryId,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      tags: product.tags.join(", "),
      technicalSpecsText: specsToText(product.technicalSpecs),
      sku: product.sku || "",
      ean: product.ean || "",
      isActive: product.isActive,
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
      slug: parsed.data.slug,
      brandId: parsed.data.brandId,
      categoryId: parsed.data.categoryId,
      shortDescription: parsed.data.shortDescription,
      longDescription: parsed.data.longDescription,
      tags: (parsed.data.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      technicalSpecs: parseSpecsText(parsed.data.technicalSpecsText || ""),
      isActive: parsed.data.isActive,
      sku: parsed.data.sku || undefined,
      ean: parsed.data.ean || undefined,
    });
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: async (selectedRows: AdminProductRecord[]) => {
      for (const row of selectedRows) {
        await deleteProduct(row.id);
      }
      return selectedRows;
    },
    onSuccess: async (deletedRows) => {
      for (const row of deletedRows) {
        await logAdminAction({
          action: "product.delete",
          entityType: "product",
          entityId: row.id,
          payload: { name: row.name, bulk: true },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      bulkSelection.clearSelection();
      setBulkDeleteOpen(false);
      toast.success(`${deletedRows.length} productos eliminados`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudieron eliminar los productos seleccionados");
    },
  });

  const onExportSelected = () => {
    try {
      exportRowsToExcel({
        rows: bulkSelection.selectedRows,
        columns: [
          { header: "Nombre", value: (row) => row.name, width: 32 },
          { header: "Slug", value: (row) => row.slug, width: 28 },
          { header: "Marca", value: (row) => row.brandName, width: 24 },
          { header: "Categoria", value: (row) => row.categoryName, width: 24 },
          { header: "Activo", value: (row) => (row.isActive ? "Si" : "No"), width: 12 },
          { header: "Ofertas", value: (row) => row.offerCount, width: 12 },
          { header: "Precio min", value: (row) => row.minPrice, width: 14 },
          { header: "Actualizado", value: (row) => formatDate(row.updatedAt), width: 20 },
        ],
        fileName: `productos_${new Date().toISOString().slice(0, 10)}`,
        sheetName: "Productos",
      });
      toast.success("Excel exportado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el Excel");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        description="CRUD de catalogo con control de metadata e imagenes."
        actionLabel="Nuevo producto"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar producto..."
            className="lg:col-span-2"
          />

          <Select
            value={brandFilter}
            onValueChange={(value) => {
              setPage(1);
              setBrandFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brandOptions.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SearchableSelect
            value={categoryFilter}
            onValueChange={(value) => {
              setPage(1);
              setCategoryFilter(value || "all");
            }}
            options={categoryFilterOptions}
            placeholder="Categoria"
            searchPlaceholder="Buscar categoria..."
            emptyText="Sin categorias"
            loading={categoriesQuery.isLoading}
          />

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setPage(1);
              setStatusFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
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
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ofertas</TableHead>
              <TableHead>Precio min</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-[160px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={bulkSelection.isSelected(product.id)}
                    onCheckedChange={(checked) => bulkSelection.setRowSelected(product.id, Boolean(checked))}
                    aria-label={`Seleccionar ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.slug}</p>
                  </div>
                </TableCell>
                <TableCell>{product.brandName}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>{formatNumber(product.offerCount)}</TableCell>
                <TableCell>{formatCurrency(product.minPrice)}</TableCell>
                <TableCell>{formatDate(product.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => duplicateMutation.mutate(product.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No hay productos para los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Mostrando {rows.length} de {formatNumber(total)} productos
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
              Anterior
            </Button>
            <span>
              Pagina {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            <DialogDescription>Completa informacion base, SEO y catalogo.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-6 overflow-auto pr-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-name">Nombre</Label>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name: value,
                      slug: prev.id ? prev.slug : buildSlug(value),
                    }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: buildSlug(event.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-brand">Marca</Label>
                <Select value={form.brandId || ""} onValueChange={(value) => setForm((prev) => ({ ...prev, brandId: value }))}>
                  <SelectTrigger id="product-brand">
                    <SelectValue placeholder="Selecciona marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-category">Categoria</Label>
                <SearchableSelect
                  id="product-category"
                  value={form.categoryId || ""}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}
                  options={categorySelectOptions}
                  placeholder="Selecciona categoria"
                  searchPlaceholder="Buscar categoria..."
                  emptyText="Sin categorias"
                  loading={categoriesQuery.isLoading}
                  portalled={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  value={form.sku}
                  onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-ean">EAN</Label>
                <Input
                  id="product-ean"
                  value={form.ean}
                  onChange={(event) => setForm((prev) => ({ ...prev, ean: event.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-short-description">Descripcion corta</Label>
                <Textarea
                  id="product-short-description"
                  value={form.shortDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-long-description">Descripcion larga</Label>
                <Textarea
                  id="product-long-description"
                  value={form.longDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, longDescription: event.target.value }))}
                  rows={5}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-tags">Tags (separados por coma)</Label>
                <Input
                  id="product-tags"
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="decoracion, cocina, premium"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="product-specs">Especificaciones (una por linea: clave: valor)</Label>
                <Textarea
                  id="product-specs"
                  value={form.technicalSpecsText}
                  onChange={(event) => setForm((prev) => ({ ...prev, technicalSpecsText: event.target.value }))}
                  rows={4}
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Producto activo</p>
                  <p className="text-xs text-muted-foreground">Si esta inactivo no se mostrara en resultados publicos.</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>

            {form.id ? (
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Imagenes del producto</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber((productImagesQuery.data || []).length)} imagenes
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={newImageUrl}
                    onChange={(event) => setNewImageUrl(event.target.value)}
                    placeholder="https://..."
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!form.id || !newImageUrl.trim()) {
                        toast.error("Ingresa una URL valida");
                        return;
                      }
                      addImageUrlMutation.mutate({ productId: form.id, url: newImageUrl.trim() });
                    }}
                    disabled={addImageUrlMutation.isPending}
                  >
                    Agregar URL
                  </Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outline"
                    disabled={!uploadFile || uploadImageMutation.isPending}
                    onClick={() => {
                      if (!form.id || !uploadFile) {
                        return;
                      }
                      uploadImageMutation.mutate({ productId: form.id, file: uploadFile });
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir
                  </Button>
                </div>

                <div className="space-y-2">
                  {(productImagesQuery.data || []).map((image) => (
                    <div key={image.id} className="flex flex-col gap-2 rounded-md border border-border p-2 sm:flex-row sm:items-center">
                      <img src={image.url} alt="Producto" className="h-16 w-16 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-muted-foreground">{image.url}</p>
                        {image.isPrimary ? <Badge className="mt-1">Principal</Badge> : null}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!form.id) return;
                            setPrimaryMutation.mutate({ productId: form.id, imageId: image.id });
                          }}
                        >
                          Principal
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteImageMutation.mutate(image.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}

                  {productImagesQuery.isLoading ? <p className="text-xs text-muted-foreground">Cargando imagenes...</p> : null}
                  {!productImagesQuery.isLoading && !(productImagesQuery.data || []).length ? (
                    <p className="text-xs text-muted-foreground">No hay imagenes cargadas.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
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
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminara el producto ${deleteTarget?.name} y sus ofertas asociadas.`}
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
            <AlertDialogTitle>Eliminar productos seleccionados</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminaran ${bulkSelection.selectedCount} productos y sus ofertas asociadas. Esta accion no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void bulkDeleteMutation.mutateAsync(bulkSelection.selectedRows);
              }}
            >
              Eliminar seleccionados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
