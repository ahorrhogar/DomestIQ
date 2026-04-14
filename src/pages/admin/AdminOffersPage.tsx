import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BulkActionsBar } from "@/admin/components/BulkActionsBar";
import { useBulkSelection } from "@/admin/hooks/useBulkSelection";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatCurrency, formatDate, formatNumber } from "@/admin/utils/format";
import { exportRowsToExcel } from "@/admin/utils/excel";
import {
  deleteOffer,
  listMerchants,
  listOffers,
  listProductsForSelect,
  logAdminAction,
  upsertOffer,
} from "@/admin/services/adminCatalogService";
import type { AdminOfferRecord } from "@/admin/types";
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

const schema = z.object({
  productId: z.string().uuid("Selecciona un producto"),
  merchantId: z.string().uuid("Selecciona una tienda"),
  price: z.number().positive("Precio invalido"),
  oldPrice: z.number().nonnegative().optional(),
  url: z.string().url("URL invalida"),
  stock: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

interface FormState {
  id?: string;
  productId: string;
  merchantId: string;
  price: number;
  oldPrice: number;
  url: string;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

const INITIAL_FORM: FormState = {
  productId: "",
  merchantId: "",
  price: 0,
  oldPrice: 0,
  url: "",
  stock: true,
  isActive: true,
  isFeatured: false,
};

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function AdminOffersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [productFilterSearch, setProductFilterSearch] = useState("");
  const [productFormSearch, setProductFormSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminOfferRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const debouncedProductFilterSearch = useDebouncedValue(productFilterSearch, 300);
  const debouncedProductFormSearch = useDebouncedValue(productFormSearch, 300);

  const offersQuery = useQuery({
    queryKey: ["admin-offers", { page, pageSize, search, productFilter, merchantFilter, statusFilter }],
    queryFn: () =>
      listOffers({
        page,
        pageSize,
        search,
        productId: productFilter === "all" ? undefined : productFilter,
        merchantId: merchantFilter === "all" ? undefined : merchantFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      }),
  });

  const productsForFilterQuery = useQuery({
    queryKey: ["admin-products-select-filter", debouncedProductFilterSearch],
    queryFn: () => listProductsForSelect(debouncedProductFilterSearch, 25),
  });

  const productsForFormQuery = useQuery({
    queryKey: ["admin-products-select-form", debouncedProductFormSearch],
    queryFn: () => listProductsForSelect(debouncedProductFormSearch, 25),
    enabled: dialogOpen,
  });

  const merchantsQuery = useQuery({ queryKey: ["admin-merchants"], queryFn: listMerchants });

  const saveMutation = useMutation({
    mutationFn: upsertOffer,
    onSuccess: async (data) => {
      await logAdminAction({
        action: form.id ? "offer.update" : "offer.create",
        entityType: "offer",
        entityId: data.id,
        payload: { productId: data.productId, merchantId: data.merchantId },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success(form.id ? "Oferta actualizada" : "Oferta creada");
      setDialogOpen(false);
      setForm(INITIAL_FORM);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la oferta");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOffer,
    onSuccess: async () => {
      if (deleteTarget) {
        await logAdminAction({
          action: "offer.delete",
          entityType: "offer",
          entityId: deleteTarget.id,
          payload: { productId: deleteTarget.productId, merchantId: deleteTarget.merchantId },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta eliminada");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la oferta");
    },
  });

  const rows = useMemo(() => offersQuery.data?.rows || [], [offersQuery.data]);
  const bulkSelection = useBulkSelection(rows);
  const total = offersQuery.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const merchantOptions = useMemo(
    () => (merchantsQuery.data || []).map((merchant) => ({ value: merchant.id, label: merchant.name })),
    [merchantsQuery.data],
  );

  const productFilterOptions = useMemo(() => {
    const options = (productsForFilterQuery.data || []).map((product) => ({ value: product.id, label: product.name }));

    if (productFilter !== "all" && !options.some((option) => option.value === productFilter)) {
      const selectedRow = rows.find((row) => row.productId === productFilter);
      if (selectedRow) {
        options.unshift({ value: selectedRow.productId, label: selectedRow.productName });
      }
    }

    return [{ value: "all", label: "Todos los productos" }, ...options];
  }, [productsForFilterQuery.data, productFilter, rows]);

  const merchantFilterOptions = useMemo(() => {
    const options = [...merchantOptions];

    if (merchantFilter !== "all" && !options.some((option) => option.value === merchantFilter)) {
      const selectedRow = rows.find((row) => row.merchantId === merchantFilter);
      if (selectedRow) {
        options.unshift({ value: selectedRow.merchantId, label: selectedRow.merchantName });
      }
    }

    return [{ value: "all", label: "Todas las tiendas" }, ...options];
  }, [merchantOptions, merchantFilter, rows]);

  const productFormOptions = useMemo(() => {
    const options = (productsForFormQuery.data || []).map((product) => ({ value: product.id, label: product.name }));

    if (form.productId && !options.some((option) => option.value === form.productId)) {
      const selectedRow = rows.find((row) => row.productId === form.productId);
      if (selectedRow) {
        options.unshift({ value: selectedRow.productId, label: selectedRow.productName });
      }
    }

    return options;
  }, [productsForFormQuery.data, form.productId, rows]);

  const merchantFormOptions = useMemo(() => {
    const options = [...merchantOptions];

    if (form.merchantId && !options.some((option) => option.value === form.merchantId)) {
      const selectedRow = rows.find((row) => row.merchantId === form.merchantId);
      if (selectedRow) {
        options.unshift({ value: selectedRow.merchantId, label: selectedRow.merchantName });
      }
    }

    return options;
  }, [merchantOptions, form.merchantId, rows]);

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setProductFormSearch("");
    setDialogOpen(true);
  };

  const openEdit = (offer: AdminOfferRecord) => {
    setForm({
      id: offer.id,
      productId: offer.productId,
      merchantId: offer.merchantId,
      price: offer.price,
      oldPrice: offer.oldPrice || 0,
      url: offer.url,
      stock: offer.stock,
      isActive: offer.isActive,
      isFeatured: offer.isFeatured,
    });
    setProductFormSearch("");
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
      productId: parsed.data.productId,
      merchantId: parsed.data.merchantId,
      price: parsed.data.price,
      oldPrice: parsed.data.oldPrice && parsed.data.oldPrice > 0 ? parsed.data.oldPrice : undefined,
      url: parsed.data.url,
      stock: parsed.data.stock,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured,
    });
  };

  const bulkDeleteMutation = useMutation({
    mutationFn: async (selectedRows: AdminOfferRecord[]) => {
      for (const row of selectedRows) {
        await deleteOffer(row.id);
      }
      return selectedRows;
    },
    onSuccess: async (deletedRows) => {
      for (const row of deletedRows) {
        await logAdminAction({
          action: "offer.delete",
          entityType: "offer",
          entityId: row.id,
          payload: { productId: row.productId, merchantId: row.merchantId, bulk: true },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      bulkSelection.clearSelection();
      setBulkDeleteOpen(false);
      toast.success(`${deletedRows.length} ofertas eliminadas`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudieron eliminar las ofertas seleccionadas");
    },
  });

  const onExportSelected = () => {
    try {
      exportRowsToExcel({
        rows: bulkSelection.selectedRows,
        columns: [
          { header: "Producto", value: (row) => row.productName, width: 30 },
          { header: "Tienda", value: (row) => row.merchantName, width: 24 },
          { header: "Precio", value: (row) => row.price, width: 14 },
          { header: "Precio anterior", value: (row) => row.oldPrice ?? "", width: 16 },
          { header: "Descuento %", value: (row) => row.discountPercent ?? "", width: 14 },
          { header: "Stock", value: (row) => (row.stock ? "Si" : "No"), width: 10 },
          { header: "Activa", value: (row) => (row.isActive ? "Si" : "No"), width: 10 },
          { header: "URL", value: (row) => row.url, width: 40 },
          { header: "Actualizada", value: (row) => formatDate(row.updatedAt), width: 20 },
        ],
        fileName: `ofertas_${new Date().toISOString().slice(0, 10)}`,
        sheetName: "Ofertas",
      });
      toast.success("Excel exportado correctamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar el Excel");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ofertas"
        description="Gestion de precios, links y stock por tienda."
        actionLabel="Nueva oferta"
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
            placeholder="Buscar por URL..."
            className="lg:col-span-2"
          />

          <SearchableSelect
            value={productFilter}
            onValueChange={(value) => {
              setPage(1);
              setProductFilter(value || "all");
            }}
            options={productFilterOptions}
            placeholder="Producto"
            searchPlaceholder="Buscar producto..."
            emptyText="Sin productos"
            searchValue={productFilterSearch}
            onSearchValueChange={setProductFilterSearch}
            loading={productsForFilterQuery.isFetching}
          />

          <SearchableSelect
            value={merchantFilter}
            onValueChange={(value) => {
              setPage(1);
              setMerchantFilter(value || "all");
            }}
            options={merchantFilterOptions}
            placeholder="Tienda"
            searchPlaceholder="Buscar tienda..."
            emptyText="Sin tiendas"
            loading={merchantsQuery.isLoading}
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
              <SelectItem value="active">Activas</SelectItem>
              <SelectItem value="inactive">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {productsForFilterQuery.isFetching ? <p className="mb-3 text-xs text-muted-foreground">Buscando productos...</p> : null}

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
              <TableHead>Producto</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Actualizada</TableHead>
              <TableHead className="w-[120px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Cargando ofertas...
                </TableCell>
              </TableRow>
            ) : null}

            {offersQuery.error ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-destructive">
                  {offersQuery.error instanceof Error ? offersQuery.error.message : "No se pudieron cargar ofertas"}
                </TableCell>
              </TableRow>
            ) : null}

            {rows.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>
                  <Checkbox
                    checked={bulkSelection.isSelected(offer.id)}
                    onCheckedChange={(checked) => bulkSelection.setRowSelected(offer.id, Boolean(checked))}
                    aria-label={`Seleccionar oferta ${offer.productName}`}
                  />
                </TableCell>
                <TableCell>{offer.productName}</TableCell>
                <TableCell>{offer.merchantName}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatCurrency(offer.price)}</p>
                    {offer.oldPrice ? (
                      <p className="text-xs text-muted-foreground line-through">{formatCurrency(offer.oldPrice)}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{offer.discountPercent ? `${offer.discountPercent}%` : "-"}</TableCell>
                <TableCell>
                  <Badge variant={offer.stock ? "default" : "secondary"}>{offer.stock ? "En stock" : "Sin stock"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={offer.isActive ? "default" : "secondary"}>{offer.isActive ? "Activa" : "Inactiva"}</Badge>
                </TableCell>
                <TableCell>{formatDate(offer.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(offer)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(offer)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!offersQuery.isLoading && !offersQuery.error && !rows.length ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No hay ofertas para los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Mostrando {rows.length} de {formatNumber(total)} ofertas
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar oferta" : "Nueva oferta"}</DialogTitle>
            <DialogDescription>Configura precio, URL de salida y disponibilidad.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Producto</Label>
              <SearchableSelect
                value={form.productId || ""}
                onValueChange={(value) => setForm((prev) => ({ ...prev, productId: value }))}
                options={productFormOptions}
                placeholder="Selecciona producto"
                searchPlaceholder="Buscar producto..."
                emptyText="Sin productos"
                searchValue={productFormSearch}
                onSearchValueChange={setProductFormSearch}
                loading={productsForFormQuery.isFetching}
                portalled={false}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tienda</Label>
              <SearchableSelect
                value={form.merchantId || ""}
                onValueChange={(value) => setForm((prev) => ({ ...prev, merchantId: value }))}
                options={merchantFormOptions}
                placeholder="Selecciona tienda"
                searchPlaceholder="Buscar tienda..."
                emptyText="Sin tiendas"
                loading={merchantsQuery.isLoading}
                portalled={false}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-price">Precio</Label>
              <Input
                id="offer-price"
                type="number"
                min={0}
                step="0.01"
                value={String(form.price)}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-old-price">Precio anterior</Label>
              <Input
                id="offer-old-price"
                type="number"
                min={0}
                step="0.01"
                value={String(form.oldPrice)}
                onChange={(event) => setForm((prev) => ({ ...prev, oldPrice: Number(event.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="offer-url">URL</Label>
              <Input
                id="offer-url"
                value={form.url}
                onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://tienda.com/producto"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Stock disponible</p>
                <p className="text-xs text-muted-foreground">Marca si la tienda reporta disponibilidad.</p>
              </div>
              <Switch checked={form.stock} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, stock: checked }))} />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Oferta activa</p>
                <p className="text-xs text-muted-foreground">Controla visibilidad en resultados.</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Destacada</p>
                <p className="text-xs text-muted-foreground">Permite dar prioridad interna en listados.</p>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isFeatured: checked }))}
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
            <AlertDialogTitle>Eliminar oferta</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminara la oferta de ${deleteTarget?.productName} en ${deleteTarget?.merchantName}.`}
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
            <AlertDialogTitle>Eliminar ofertas seleccionadas</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminaran ${bulkSelection.selectedCount} ofertas. Esta accion no se puede deshacer.`}
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
