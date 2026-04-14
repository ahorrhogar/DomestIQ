import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatCurrency, formatDate, formatNumber } from "@/admin/utils/format";
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
  const [productLookup, setProductLookup] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [merchantFilter, setMerchantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminOfferRecord | null>(null);
  const debouncedProductLookup = useDebouncedValue(productLookup, 300);

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

  const productsForSelectQuery = useQuery({
    queryKey: ["admin-products-select", debouncedProductLookup],
    queryFn: () => listProductsForSelect(debouncedProductLookup, 25),
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

  const rows = offersQuery.data?.rows || [];
  const total = offersQuery.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openCreate = () => {
    setForm(INITIAL_FORM);
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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ofertas"
        description="Gestion de precios, links y stock por tienda."
        actionLabel="Nueva oferta"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-6">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Buscar por URL..."
            className="lg:col-span-2"
          />

          <Input
            value={productLookup}
            onChange={(event) => setProductLookup(event.target.value)}
            placeholder="Buscar producto..."
          />

          <Select
            value={productFilter}
            onValueChange={(value) => {
              setPage(1);
              setProductFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Producto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los productos</SelectItem>
              {(productsForSelectQuery.data || []).map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={merchantFilter}
            onValueChange={(value) => {
              setPage(1);
              setMerchantFilter(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tienda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las tiendas</SelectItem>
              {(merchantsQuery.data || []).map((merchant) => (
                <SelectItem key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

        {productsForSelectQuery.isFetching ? <p className="mb-3 text-xs text-muted-foreground">Buscando productos...</p> : null}

        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Cargando ofertas...
                </TableCell>
              </TableRow>
            ) : null}

            {offersQuery.error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive">
                  {offersQuery.error instanceof Error ? offersQuery.error.message : "No se pudieron cargar ofertas"}
                </TableCell>
              </TableRow>
            ) : null}

            {rows.map((offer) => (
              <TableRow key={offer.id}>
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
                <TableCell colSpan={8} className="text-center text-muted-foreground">
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
              <Input
                value={productLookup}
                onChange={(event) => setProductLookup(event.target.value)}
                placeholder="Buscar producto para seleccionar"
              />
              <Select value={form.productId || ""} onValueChange={(value) => setForm((prev) => ({ ...prev, productId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona producto" />
                </SelectTrigger>
                <SelectContent>
                  {(productsForSelectQuery.data || []).map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tienda</Label>
              <Select
                value={form.merchantId || ""}
                onValueChange={(value) => setForm((prev) => ({ ...prev, merchantId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tienda" />
                </SelectTrigger>
                <SelectContent>
                  {(merchantsQuery.data || []).map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  );
}
