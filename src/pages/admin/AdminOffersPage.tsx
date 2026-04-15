import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2, History, Pencil, PowerOff, RefreshCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BulkActionsBar } from "@/admin/components/BulkActionsBar";
import { useBulkSelection } from "@/admin/hooks/useBulkSelection";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatCurrency, formatDate, formatNumber } from "@/admin/utils/format";
import { exportRowsToExcel } from "@/admin/utils/excel";
import {
  deactivateOffer,
  deleteOffer,
  listCategories,
  listMerchants,
  listOfferPriceHistory,
  listOffers,
  listProductsForSelect,
  markOfferReviewed,
  requestOfferSync,
  saveOfferPriceChange,
  upsertOffer,
} from "@/admin/services/adminCatalogService";
import type {
  AdminOfferPriceHistoryRecord,
  AdminOfferRecord,
  OfferSourceType,
  OfferSyncStatus,
  OfferUpdateMode,
} from "@/admin/types";
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
  sourceType: z.enum(["manual", "api", "feed", "future_auto"]),
  updateMode: z.enum(["manual", "auto", "hybrid"]),
});

interface FormState {
  id?: string;
  productId: string;
  merchantId: string;
  price: string;
  oldPrice: string;
  url: string;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sourceType: OfferSourceType;
  updateMode: OfferUpdateMode;
}

const INITIAL_FORM: FormState = {
  productId: "",
  merchantId: "",
  price: "",
  oldPrice: "0",
  url: "",
  stock: true,
  isActive: true,
  isFeatured: false,
  sourceType: "manual",
  updateMode: "manual",
};

const SOURCE_LABELS: Record<OfferSourceType, string> = {
  manual: "Manual",
  api: "API",
  feed: "Feed",
  future_auto: "Auto",
};

const SYNC_LABELS: Record<OfferSyncStatus, string> = {
  ok: "Fresca",
  pending: "Pendiente",
  stale: "Desactualizada",
  error: "Error",
};

function parseDecimalInput(value: string): number | null {
  const raw = String(value || "").trim().replace(/\s+/g, "");

  if (!raw) {
    return null;
  }

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  let normalized = raw;
  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    normalized = raw.split(thousandsSeparator).join("").replace(decimalSeparator, ".");
  } else {
    normalized = raw.replace(",", ".");
  }

  normalized = normalized.replace(/[^\d.-]/g, "");

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed < 0) {
    return null;
  }

  return parsed;
}

function syncBadgeVariant(status: OfferSyncStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "error") {
    return "destructive";
  }

  if (status === "stale") {
    return "secondary";
  }

  if (status === "pending") {
    return "outline";
  }

  return "default";
}

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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | OfferSourceType>("all");
  const [syncFilter, setSyncFilter] = useState<"all" | OfferSyncStatus>("all");
  const [reviewQueueFirst, setReviewQueueFirst] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [dialogInitialForm, setDialogInitialForm] = useState(() => JSON.stringify(INITIAL_FORM));
  const [deleteTarget, setDeleteTarget] = useState<AdminOfferRecord | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState<{ offerId: string; price: number; oldPrice: number; stock: boolean } | null>(null);
  const [priceDraftInitial, setPriceDraftInitial] = useState<string | null>(null);
  const [historyOffer, setHistoryOffer] = useState<AdminOfferRecord | null>(null);
  const debouncedProductFilterSearch = useDebouncedValue(productFilterSearch, 300);
  const debouncedProductFormSearch = useDebouncedValue(productFormSearch, 300);

  const isDialogDirty = useMemo(() => {
    if (!dialogOpen) {
      return false;
    }

    return JSON.stringify(form) !== dialogInitialForm;
  }, [dialogOpen, form, dialogInitialForm]);

  const isQuickPriceDirty = useMemo(() => {
    if (!priceDialogOpen || !priceDraft || !priceDraftInitial) {
      return false;
    }

    return JSON.stringify(priceDraft) !== priceDraftInitial;
  }, [priceDialogOpen, priceDraft, priceDraftInitial]);

  const offersQuery = useQuery({
    queryKey: [
      "admin-offers",
      { page, pageSize, search, productFilter, categoryFilter, merchantFilter, statusFilter, sourceFilter, syncFilter, reviewQueueFirst },
    ],
    queryFn: () =>
      listOffers({
        page,
        pageSize,
        search,
        productId: productFilter === "all" ? undefined : productFilter,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        merchantId: merchantFilter === "all" ? undefined : merchantFilter,
        sourceType: sourceFilter === "all" ? undefined : sourceFilter,
        syncStatus: syncFilter === "all" ? undefined : syncFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
        reviewQueueFirst,
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
  const categoriesQuery = useQuery({ queryKey: ["admin-categories"], queryFn: listCategories });

  const offerHistoryQuery = useQuery({
    queryKey: ["admin-offer-history", historyOffer?.id],
    queryFn: () => listOfferPriceHistory(String(historyOffer?.id || ""), 150),
    enabled: Boolean(historyOffer?.id),
  });

  const saveMutation = useMutation({
    mutationFn: upsertOffer,
    onSuccess: async () => {
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
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta eliminada");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la oferta");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: markOfferReviewed,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta marcada como revisada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo marcar como revisada");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateOffer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta desactivada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar la oferta");
    },
  });

  const syncMutation = useMutation({
    mutationFn: requestOfferSync,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      toast.success("Oferta enviada a sincronizacion pendiente");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo encolar la sincronizacion");
    },
  });

  const quickPriceMutation = useMutation({
    mutationFn: saveOfferPriceChange,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      if (historyOffer?.id) {
        await queryClient.invalidateQueries({ queryKey: ["admin-offer-history", historyOffer.id] });
      }
      toast.success("Cambio de precio guardado");
      setPriceDialogOpen(false);
      setPriceDraft(null);
      setPriceDraftInitial(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el cambio de precio");
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

  const categoryFilterOptions = useMemo(() => {
    const options = (categoriesQuery.data || []).map((category) => ({
      value: category.id,
      label: category.parentName ? `${category.parentName} / ${category.name}` : category.name,
    }));

    return [{ value: "all", label: "Todas las categorias" }, ...options];
  }, [categoriesQuery.data]);

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
    setDialogInitialForm(JSON.stringify(INITIAL_FORM));
    setProductFormSearch("");
    setDialogOpen(true);
  };

  const openEdit = (offer: AdminOfferRecord) => {
    const nextForm: FormState = {
      id: offer.id,
      productId: offer.productId,
      merchantId: offer.merchantId,
      price: String(offer.price),
      oldPrice: String(offer.oldPrice || 0),
      url: offer.url,
      stock: offer.stock,
      isActive: offer.isActive,
      isFeatured: offer.isFeatured,
      sourceType: offer.sourceType,
      updateMode: offer.updateMode,
    };
    setForm(nextForm);
    setDialogInitialForm(JSON.stringify(nextForm));
    setProductFormSearch("");
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

  const openPriceDialog = (offer: AdminOfferRecord) => {
    const nextDraft = {
      offerId: offer.id,
      price: String(offer.currentPrice),
      oldPrice: String(offer.oldPrice || offer.currentPrice),
      stock: offer.stock,
    };
    setPriceDraft(nextDraft);
    setPriceDraftInitial(JSON.stringify(nextDraft));
    setPriceDialogOpen(true);
  };

  const requestClosePriceDialog = () => {
    if (!isQuickPriceDirty) {
      setPriceDialogOpen(false);
      setPriceDraft(null);
      setPriceDraftInitial(null);
      return;
    }

    const shouldClose = window.confirm("Hay cambios sin guardar. ¿Seguro que quieres salir?");
    if (shouldClose) {
      setPriceDialogOpen(false);
      setPriceDraft(null);
      setPriceDraftInitial(null);
    }
  };

  const openHistoryDialog = (offer: AdminOfferRecord) => {
    setHistoryOffer(offer);
  };

  const onSave = async () => {
    const parsedPrice = parseDecimalInput(form.price);
    const parsedOldPrice = parseDecimalInput(form.oldPrice);

    const parsed = schema.safeParse({
      ...form,
      price: parsedPrice,
      oldPrice: parsedOldPrice ?? 0,
    });
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
      sourceType: parsed.data.sourceType,
      updateMode: parsed.data.updateMode,
    });
  };

  const onQuickPriceSave = async () => {
    if (!priceDraft) {
      return;
    }

    const parsedPrice = parseDecimalInput(priceDraft.price);
    const parsedOldPrice = parseDecimalInput(priceDraft.oldPrice);

    if (!parsedPrice || parsedPrice <= 0) {
      toast.error("Precio invalido");
      return;
    }

    if (parsedOldPrice === null) {
      toast.error("Precio anterior invalido");
      return;
    }

    await quickPriceMutation.mutateAsync({
      offerId: priceDraft.offerId,
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      stock: priceDraft.stock,
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
          { header: "Fuente", value: (row) => SOURCE_LABELS[row.sourceType], width: 12 },
          { header: "Sync", value: (row) => SYNC_LABELS[row.syncStatus], width: 14 },
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
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-8">
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

          <Select
            value={sourceFilter}
            onValueChange={(value: "all" | OfferSourceType) => {
              setPage(1);
              setSourceFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="feed">Feed</SelectItem>
              <SelectItem value="future_auto">Auto</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={syncFilter}
            onValueChange={(value: "all" | OfferSyncStatus) => {
              setPage(1);
              setSyncFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sync" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="ok">Fresca</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="stale">Desactualizada</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2 lg:col-span-1">
            <div>
              <p className="text-xs font-medium">Cola revision</p>
              <p className="text-[11px] text-muted-foreground">Stale y prioridad</p>
            </div>
            <Switch checked={reviewQueueFirst} onCheckedChange={setReviewQueueFirst} />
          </div>
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
              <TableHead>Fuente</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Sync</TableHead>
              <TableHead>Actualizada</TableHead>
              <TableHead className="w-[240px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offersQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  Cargando ofertas...
                </TableCell>
              </TableRow>
            ) : null}

            {offersQuery.error ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-destructive">
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
                  <Badge variant="outline">{SOURCE_LABELS[offer.sourceType]}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatCurrency(offer.currentPrice)}</p>
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
                <TableCell>
                  <Badge variant={syncBadgeVariant(offer.syncStatus)}>{SYNC_LABELS[offer.syncStatus]}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{formatDate(offer.updatedAt)}</p>
                    <p className="text-xs text-muted-foreground">Rev: {offer.lastCheckedAt ? formatDate(offer.lastCheckedAt) : "-"}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void reviewMutation.mutateAsync(offer.id);
                      }}
                      title="Marcar como revisada"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openPriceDialog(offer)} title="Guardar cambio de precio">
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void syncMutation.mutateAsync(offer.id);
                      }}
                      title="Actualizar precio"
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openHistoryDialog(offer)} title="Ver historial">
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        void deactivateMutation.mutateAsync(offer.id);
                      }}
                      title="Desactivar oferta"
                    >
                      <PowerOff className="h-4 w-4" />
                    </Button>
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
                <TableCell colSpan={11} className="text-center text-muted-foreground">
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
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
              <Label>Fuente</Label>
              <Select
                value={form.sourceType}
                onValueChange={(value: OfferSourceType) => setForm((prev) => ({ ...prev, sourceType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fuente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="future_auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modo de actualizacion</Label>
              <Select
                value={form.updateMode}
                onValueChange={(value: OfferUpdateMode) => setForm((prev) => ({ ...prev, updateMode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-price">Precio</Label>
              <Input
                id="offer-price"
                type="text"
                inputMode="decimal"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-old-price">Precio anterior</Label>
              <Input
                id="offer-old-price"
                type="text"
                inputMode="decimal"
                value={form.oldPrice}
                onChange={(event) => setForm((prev) => ({ ...prev, oldPrice: event.target.value }))}
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
            <Button variant="outline" onClick={requestCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={onSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={priceDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setPriceDialogOpen(true);
            return;
          }

          requestClosePriceDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Guardar cambio de precio</DialogTitle>
            <DialogDescription>Actualiza precio y marca la oferta como revisada en una sola accion.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quick-price">Precio actual</Label>
              <Input
                id="quick-price"
                type="text"
                inputMode="decimal"
                value={priceDraft?.price ?? ""}
                onChange={(event) => {
                  setPriceDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          price: event.target.value,
                        }
                      : prev,
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-old-price">Precio anterior</Label>
              <Input
                id="quick-old-price"
                type="text"
                inputMode="decimal"
                value={priceDraft?.oldPrice ?? ""}
                onChange={(event) => {
                  setPriceDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          oldPrice: event.target.value,
                        }
                      : prev,
                  );
                }}
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium">Stock disponible</p>
                <p className="text-xs text-muted-foreground">Marca disponibilidad durante la revision manual.</p>
              </div>
              <Switch
                checked={Boolean(priceDraft?.stock)}
                onCheckedChange={(checked) => {
                  setPriceDraft((prev) => (prev ? { ...prev, stock: checked } : prev));
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={requestClosePriceDialog}>
              Cancelar
            </Button>
            <Button onClick={onQuickPriceSave} disabled={quickPriceMutation.isPending}>
              {quickPriceMutation.isPending ? "Guardando..." : "Guardar cambio de precio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(historyOffer)}
        onOpenChange={(open) => {
          if (!open) {
            setHistoryOffer(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial de precio</DialogTitle>
            <DialogDescription>
              {historyOffer ? `Cambios registrados para ${historyOffer.productName} en ${historyOffer.merchantName}.` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[360px] overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Anterior</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerHistoryQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Cargando historial...
                    </TableCell>
                  </TableRow>
                ) : null}

                {offerHistoryQuery.error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive">
                      {offerHistoryQuery.error instanceof Error ? offerHistoryQuery.error.message : "No se pudo cargar historial"}
                    </TableCell>
                  </TableRow>
                ) : null}

                {(offerHistoryQuery.data || []).map((entry: AdminOfferPriceHistoryRecord) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.checkedAt || entry.createdAt)}</TableCell>
                    <TableCell>{formatCurrency(entry.price)}</TableCell>
                    <TableCell>{entry.oldPrice ? formatCurrency(entry.oldPrice) : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{SOURCE_LABELS[entry.sourceType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={syncBadgeVariant(entry.syncStatus)}>{SYNC_LABELS[entry.syncStatus]}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{entry.changeReason || "-"}</TableCell>
                  </TableRow>
                ))}

                {!offerHistoryQuery.isLoading && !offerHistoryQuery.error && !(offerHistoryQuery.data || []).length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Sin historial disponible.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOffer(null)}>
              Cerrar
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
