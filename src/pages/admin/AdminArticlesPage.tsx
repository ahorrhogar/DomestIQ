import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import {
  deleteEditorialArticle,
  listEditorialArticles,
  upsertEditorialArticle,
  type AdminEditorialListFilters,
} from "@/admin/services/adminEditorialService";
import type { AdminEditorialArticleRecord } from "@/admin/types";
import { formatDate, formatNumber } from "@/admin/utils/format";
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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(8, "El titulo debe tener al menos 8 caracteres"),
  excerpt: z.string().min(20, "El extracto debe tener al menos 20 caracteres"),
  categoryName: z.string().min(2, "Categoria requerida"),
  categorySlug: z.string().min(2, "Slug de categoria requerido"),
  intent: z.enum(["comparativa", "calidad-precio", "ahorro", "premium", "guia-practica"]),
  status: z.enum(["draft", "published", "inactive"]),
  readMinutes: z.number().int().min(1).max(240),
  averageBudget: z.number().min(0).optional(),
  coverImage: z.string().url("URL de portada invalida").optional().or(z.literal("")),
  coverImageAlt: z.string().max(200).optional(),
});

interface FormState {
  id?: string;
  title: string;
  slug: string;
  path: string;
  excerpt: string;
  categoryName: string;
  categorySlug: string;
  intent: "comparativa" | "calidad-precio" | "ahorro" | "premium" | "guia-practica";
  status: "draft" | "published" | "inactive";
  readMinutes: number;
  averageBudget: string;
  isFeatured: boolean;
  coverImage: string;
  coverImageAlt: string;
  tagsText: string;
  relatedCategorySlugsText: string;
  relatedProductSlugsText: string;
  sectionsText: string;
}

const INITIAL_FORM: FormState = {
  title: "",
  slug: "",
  path: "",
  excerpt: "",
  categoryName: "",
  categorySlug: "",
  intent: "comparativa",
  status: "draft",
  readMinutes: 8,
  averageBudget: "",
  isFeatured: false,
  coverImage: "",
  coverImageAlt: "",
  tagsText: "",
  relatedCategorySlugsText: "",
  relatedProductSlugsText: "",
  sectionsText: "",
};

function toCommaSeparated(values: string[]): string {
  return values.join(", ");
}

function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseSectionsText(value: string): Array<{ heading: string; body: string }> {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [headingRaw, ...bodyParts] = line.split("::");
      const heading = (headingRaw || "").trim();
      const body = bodyParts.join("::").trim();
      return { heading, body };
    })
    .filter((section) => Boolean(section.heading) && Boolean(section.body));
}

function getStatusBadge(status: AdminEditorialArticleRecord["status"]) {
  if (status === "published") {
    return <Badge>Publicado</Badge>;
  }

  if (status === "inactive") {
    return <Badge variant="secondary">Inactivo</Badge>;
  }

  return <Badge variant="outline">Borrador</Badge>;
}

export default function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published" | "inactive">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not-featured">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AdminEditorialArticleRecord | null>(null);

  const filters: AdminEditorialListFilters = {
    page: 1,
    pageSize: 80,
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    isFeatured: featuredFilter === "all" ? undefined : featuredFilter === "featured",
  };

  const articlesQuery = useQuery({
    queryKey: ["admin-editorial-articles", filters],
    queryFn: () => listEditorialArticles(filters),
  });

  const rows = useMemo(() => articlesQuery.data?.rows || [], [articlesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: upsertEditorialArticle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-editorial-articles"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-analytics-metrics"] });
      toast.success(form.id ? "Articulo actualizado" : "Articulo creado");
      setDialogOpen(false);
      setForm(INITIAL_FORM);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el articulo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEditorialArticle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-editorial-articles"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-analytics-metrics"] });
      toast.success("Articulo eliminado");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el articulo");
    },
  });

  const openCreate = () => {
    setForm(INITIAL_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: AdminEditorialArticleRecord) => {
    const sectionsText = row.sections.map((section) => `${section.heading}::${section.body}`).join("\n");

    setForm({
      id: row.id,
      title: row.title,
      slug: row.slug,
      path: row.path,
      excerpt: row.excerpt,
      categoryName: row.categoryName,
      categorySlug: row.categorySlug,
      intent: row.intent,
      status: row.status,
      readMinutes: row.readMinutes,
      averageBudget: typeof row.averageBudget === "number" ? String(row.averageBudget) : "",
      isFeatured: row.isFeatured,
      coverImage: row.coverImage || "",
      coverImageAlt: row.coverImageAlt || "",
      tagsText: toCommaSeparated(row.tags),
      relatedCategorySlugsText: toCommaSeparated(row.relatedCategorySlugs),
      relatedProductSlugsText: toCommaSeparated(row.relatedProductSlugs),
      sectionsText,
    });

    setDialogOpen(true);
  };

  const onSave = async () => {
    const parsed = formSchema.safeParse({
      ...form,
      readMinutes: Number(form.readMinutes || 0),
      averageBudget: form.averageBudget ? Number(form.averageBudget) : undefined,
      coverImage: form.coverImage,
      coverImageAlt: form.coverImageAlt,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Formulario invalido");
      return;
    }

    await saveMutation.mutateAsync({
      id: form.id,
      title: parsed.data.title,
      slug: form.slug || undefined,
      path: form.path || undefined,
      excerpt: parsed.data.excerpt,
      categoryName: parsed.data.categoryName,
      categorySlug: parsed.data.categorySlug,
      intent: parsed.data.intent,
      status: parsed.data.status,
      readMinutes: parsed.data.readMinutes,
      averageBudget: parsed.data.averageBudget,
      isFeatured: form.isFeatured,
      coverImage: parsed.data.coverImage || undefined,
      coverImageAlt: parsed.data.coverImageAlt || undefined,
      tags: parseCommaSeparated(form.tagsText),
      relatedCategorySlugs: parseCommaSeparated(form.relatedCategorySlugsText),
      relatedProductSlugs: parseCommaSeparated(form.relatedProductSlugsText),
      sections: parseSectionsText(form.sectionsText),
    });
  };

  const toggleActivation = async (row: AdminEditorialArticleRecord) => {
    const nextStatus = row.status === "inactive" ? "published" : "inactive";

    await saveMutation.mutateAsync({
      id: row.id,
      title: row.title,
      slug: row.slug,
      path: row.path,
      excerpt: row.excerpt,
      categoryName: row.categoryName,
      categorySlug: row.categorySlug,
      intent: row.intent,
      status: nextStatus,
      readMinutes: row.readMinutes,
      averageBudget: row.averageBudget,
      isFeatured: row.isFeatured,
      coverImage: row.coverImage,
      coverImageAlt: row.coverImageAlt,
      tags: row.tags,
      relatedCategorySlugs: row.relatedCategorySlugs,
      relatedProductSlugs: row.relatedProductSlugs,
      sections: row.sections,
      publishedAt: row.publishedAt,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Articulos"
        description="Gestion completa del blog editorial con control de estado, destacados y metadatos SEO."
        actionLabel="Nuevo articulo"
        onAction={openCreate}
      />

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por titulo, slug o categoria..."
              className="sm:max-w-sm"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="inactive">Inactivo</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(event) => setFeaturedFilter(event.target.value as typeof featuredFilter)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos</option>
              <option value="featured">Destacados</option>
              <option value="not-featured">No destacados</option>
            </select>
          </div>

          <p className="text-xs text-muted-foreground">{formatNumber(articlesQuery.data?.total || 0)} articulos</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Destacado</TableHead>
              <TableHead className="text-right">Vistas</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="w-[180px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articlesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Cargando articulos...
                </TableCell>
              </TableRow>
            ) : null}

            {articlesQuery.error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-destructive">
                  {articlesQuery.error instanceof Error ? articlesQuery.error.message : "No se pudieron cargar los articulos"}
                </TableCell>
              </TableRow>
            ) : null}

            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div>
                    <p className="font-medium leading-tight">{row.title}</p>
                    <p className="text-xs text-muted-foreground">/{row.slug}</p>
                  </div>
                </TableCell>
                <TableCell>{row.categoryName}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                <TableCell>{row.isFeatured ? <Badge variant="outline">Si</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                <TableCell className="text-right">{formatNumber(row.views)}</TableCell>
                <TableCell>{formatDate(row.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => toggleActivation(row)} disabled={saveMutation.isPending}>
                      {row.status === "inactive" ? "Activar" : "Desactivar"}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTarget(row)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!articlesQuery.isLoading && !articlesQuery.error && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron articulos con los filtros actuales.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar articulo" : "Nuevo articulo"}</DialogTitle>
            <DialogDescription>
              Usa el formato Seccion::Contenido en el campo secciones (una por linea).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="article-title">Titulo</Label>
              <Input
                id="article-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-slug">Slug</Label>
              <Input
                id="article-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="opcional, se genera automaticamente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-path">Path</Label>
              <Input
                id="article-path"
                value={form.path}
                onChange={(event) => setForm((prev) => ({ ...prev, path: event.target.value }))}
                placeholder="/blog/mi-articulo"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="article-excerpt">Extracto</Label>
              <Textarea
                id="article-excerpt"
                value={form.excerpt}
                onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-category-name">Categoria (nombre)</Label>
              <Input
                id="article-category-name"
                value={form.categoryName}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryName: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-category-slug">Categoria (slug)</Label>
              <Input
                id="article-category-slug"
                value={form.categorySlug}
                onChange={(event) => setForm((prev) => ({ ...prev, categorySlug: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-intent">Intencion</Label>
              <select
                id="article-intent"
                value={form.intent}
                onChange={(event) => setForm((prev) => ({ ...prev, intent: event.target.value as FormState["intent"] }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="comparativa">Comparativa</option>
                <option value="calidad-precio">Calidad-precio</option>
                <option value="ahorro">Ahorro</option>
                <option value="premium">Premium</option>
                <option value="guia-practica">Guia practica</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-status">Estado</Label>
              <select
                id="article-status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as FormState["status"] }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-read-minutes">Minutos de lectura</Label>
              <Input
                id="article-read-minutes"
                type="number"
                min={1}
                max={240}
                value={form.readMinutes}
                onChange={(event) => setForm((prev) => ({ ...prev, readMinutes: Number(event.target.value || 1) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-budget">Presupuesto medio (opcional)</Label>
              <Input
                id="article-budget"
                type="number"
                min={0}
                step="0.01"
                value={form.averageBudget}
                onChange={(event) => setForm((prev) => ({ ...prev, averageBudget: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="article-cover-image">Imagen portada URL</Label>
              <Input
                id="article-cover-image"
                value={form.coverImage}
                onChange={(event) => setForm((prev) => ({ ...prev, coverImage: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="article-cover-alt">Texto alternativo portada</Label>
              <Input
                id="article-cover-alt"
                value={form.coverImageAlt}
                onChange={(event) => setForm((prev) => ({ ...prev, coverImageAlt: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="article-tags">Tags (separados por coma)</Label>
              <Input
                id="article-tags"
                value={form.tagsText}
                onChange={(event) => setForm((prev) => ({ ...prev, tagsText: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-related-categories">Categorias relacionadas</Label>
              <Input
                id="article-related-categories"
                value={form.relatedCategorySlugsText}
                onChange={(event) => setForm((prev) => ({ ...prev, relatedCategorySlugsText: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-related-products">Productos relacionados</Label>
              <Input
                id="article-related-products"
                value={form.relatedProductSlugsText}
                onChange={(event) => setForm((prev) => ({ ...prev, relatedProductSlugsText: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="article-sections">Secciones (una por linea: Seccion::Contenido)</Label>
              <Textarea
                id="article-sections"
                rows={5}
                value={form.sectionsText}
                onChange={(event) => setForm((prev) => ({ ...prev, sectionsText: event.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <Switch
                id="article-featured"
                checked={form.isFeatured}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isFeatured: Boolean(checked) }))}
              />
              <Label htmlFor="article-featured">Destacar en portada de guias</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={onSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : "Guardar articulo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar articulo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el articulo y su historial de vistas asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
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
