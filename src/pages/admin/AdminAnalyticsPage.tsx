import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate, formatNumber } from "@/admin/utils/format";
import { getDashboardMetrics, listClicks } from "@/admin/services/adminCatalogService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function toDayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(date);
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "0%";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-4 text-sm text-muted-foreground">{text}</p>;
}

export default function AdminAnalyticsPage() {
  const metricsQuery = useQuery({
    queryKey: ["admin-analytics-metrics"],
    queryFn: getDashboardMetrics,
  });

  const clicksQuery = useQuery({
    queryKey: ["admin-analytics-clicks"],
    queryFn: () => listClicks(120),
  });

  const dailyClicks = useMemo(() => {
    return (metricsQuery.data?.dailyClicks || []).map((item) => ({
      day: item.day,
      label: toDayLabel(item.day),
      clicks: item.clicks,
    }));
  }, [metricsQuery.data]);

  const dailyArticleViews = useMemo(() => {
    return (metricsQuery.data?.editorial.dailyArticleViews || []).map((item) => ({
      day: item.day,
      label: toDayLabel(item.day),
      views: item.views,
    }));
  }, [metricsQuery.data]);

  const searchTermsSeries = useMemo(() => {
    return (metricsQuery.data?.topSearchTerms || []).slice(0, 12).map((item) => ({
      term: item.term,
      count: item.count,
    }));
  }, [metricsQuery.data]);

  if (metricsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analitica" description="Cargando metricas..." />
      </div>
    );
  }

  if (metricsQuery.error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analitica" description="No se pudo cargar la analitica." />
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {metricsQuery.error instanceof Error ? metricsQuery.error.message : "Error de analitica"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = metricsQuery.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analitica"
        description="Panel operativo para detectar traccion, huecos de catalogo y riesgos del MVP."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clics Totales</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.totalClicks)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clics (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.clicksLast30Days)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Busquedas Sin Resultado</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.searchesWithoutResults)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Importaciones Fallidas</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.failedImportJobs)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Productos Sin Oferta Activa</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.productsWithoutActiveOffers)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ofertas Stale</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.staleActiveOffers)}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Articulos Totales</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.editorial.totalArticles)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Articulos Publicados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.editorial.publishedArticles)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Articulos Inactivos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.editorial.inactiveArticles)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Vistas Blog (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.editorial.viewsLast30Days)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sesiones Blog (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.editorial.uniqueSessionsLast30Days)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Busquedas que llegan al blog</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatNumber(metrics.editorial.searchesLeadingToBlogViews)}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clics diarios</CardTitle>
            <CardDescription>Ultimos 30 dias. Fuente: tabla clicks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top terminos de busqueda</CardTitle>
            <CardDescription>Demanda principal para priorizar catalogo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchTermsSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" interval={0} angle={-18} textAnchor="end" height={64} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vistas diarias de articulos</CardTitle>
            <CardDescription>Ultimos 30 dias de trafico editorial real.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyArticleViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#ea580c" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top busquedas que terminan en blog</CardTitle>
            <CardDescription>Tendencias de busqueda con navegacion editorial posterior.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.editorial.topBlogSearchTerms.length ? <EmptyState text="Sin tendencias de busqueda para blog." /> : null}
            {metrics.editorial.topBlogSearchTerms.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Termino</TableHead>
                    <TableHead className="text-right">Conteo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.editorial.topBlogSearchTerms.map((item) => (
                    <TableRow key={item.term}>
                      <TableCell>{item.term}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Articulos mas vistos</CardTitle>
            <CardDescription>Ranking por vistas registradas en ventana de 30 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.editorial.topViewedArticles.length ? <EmptyState text="Sin vistas registradas en articulos." /> : null}
            {metrics.editorial.topViewedArticles.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Articulo</TableHead>
                    <TableHead className="text-right">Vistas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.editorial.topViewedArticles.map((item) => (
                    <TableRow key={item.articleId}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.views)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de pipeline editorial</CardTitle>
            <CardDescription>Distribucion de lifecycle para contenidos del blog.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Publicados: <strong>{formatNumber(metrics.editorial.publishedArticles)}</strong></p>
            <p>Borradores: <strong>{formatNumber(metrics.editorial.draftArticles)}</strong></p>
            <p>Inactivos: <strong>{formatNumber(metrics.editorial.inactiveArticles)}</strong></p>
            <p>Destacados: <strong>{formatNumber(metrics.editorial.featuredArticles)}</strong></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top productos por clics</CardTitle>
            <CardDescription>Mayor salida hacia merchants.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.topClickedProducts.length ? <EmptyState text="Sin clics registrados." /> : null}
            {metrics.topClickedProducts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topClickedProducts.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.clicks)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top tiendas por clics</CardTitle>
            <CardDescription>Merchants con mejor traccion.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.topClickedMerchants.length ? <EmptyState text="Sin clics por tienda." /> : null}
            {metrics.topClickedMerchants.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tienda</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topClickedMerchants.map((item) => (
                    <TableRow key={item.merchantId}>
                      <TableCell>{item.merchantName}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.clicks)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ofertas Mas Clicadas</CardTitle>
            <CardDescription>Proxy por par producto + merchant.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.topOfferPairs.length ? <EmptyState text="Sin clics por oferta." /> : null}
            {metrics.topOfferPairs.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topOfferPairs.map((item) => (
                    <TableRow key={`${item.productId}-${item.merchantId}`}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.merchantName}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.clicks)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorias Con Mejor Rendimiento</CardTitle>
            <CardDescription>CTR = clics / vistas proxy (search_count).</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.topCategoriesByPerformance.length ? <EmptyState text="Sin categorias con datos." /> : null}
            {metrics.topCategoriesByPerformance.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Clics</TableHead>
                    <TableHead className="text-right">Vistas</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topCategoriesByPerformance.map((item) => (
                    <TableRow key={item.categoryId}>
                      <TableCell>{item.categoryName}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.clicks)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.views)}</TableCell>
                      <TableCell className="text-right">{formatPercent(item.ctr)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busquedas Sin Resultado</CardTitle>
            <CardDescription>Terminos para expandir catalogo MVP.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.noResultSearchTerms.length ? <EmptyState text="No hay terminos sin resultado." /> : null}
            {metrics.noResultSearchTerms.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Termino</TableHead>
                    <TableHead className="text-right">Conteo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.noResultSearchTerms.map((term) => (
                    <TableRow key={term.term}>
                      <TableCell>{term.term}</TableCell>
                      <TableCell className="text-right">{formatNumber(term.count)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Muchos Clics, Pocas Vistas</CardTitle>
            <CardDescription>Posibles casos de alta conversion organica.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.highClicksLowViews.length ? <EmptyState text="Sin outliers detectados." /> : null}
            {metrics.highClicksLowViews.map((item) => (
              <div key={item.productId} className="mb-2 flex items-center justify-between gap-2 rounded border p-2">
                <p className="text-sm font-medium">{item.productName}</p>
                <Badge variant="outline">{formatNumber(item.clicks)} clics / {formatNumber(item.views)} vistas</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Muchas Vistas, Pocos Clics</CardTitle>
            <CardDescription>Priorizar ficha/oferta para mejorar salida.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.highViewsLowClicks.length ? <EmptyState text="Sin outliers detectados." /> : null}
            {metrics.highViewsLowClicks.map((item) => (
              <div key={item.productId} className="mb-2 flex items-center justify-between gap-2 rounded border p-2">
                <p className="text-sm font-medium">{item.productName}</p>
                <Badge variant="outline">{formatNumber(item.clicks)} clics / {formatNumber(item.views)} vistas</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buen Rendimiento No Destacado</CardTitle>
            <CardDescription>Productos con traccion sin featured/manual boost.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.underFeaturedTopPerformers.length ? <EmptyState text="No hay candidatos actualmente." /> : null}
            {metrics.underFeaturedTopPerformers.map((item) => (
              <div key={item.productId} className="mb-2 flex items-center justify-between gap-2 rounded border p-2">
                <p className="text-sm font-medium">{item.productName}</p>
                <Badge variant="secondary">{formatNumber(item.clicks)} clics</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Freshness y Sincronizacion</CardTitle>
            <CardDescription>Estado para detectar datos obsoletos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Ultimo click: {metrics.freshness.lastClickAt ? formatDate(metrics.freshness.lastClickAt) : "Sin datos"}</p>
            <p>Ultima busqueda: {metrics.freshness.lastSearchAt ? formatDate(metrics.freshness.lastSearchAt) : "Sin datos"}</p>
            <p>Ultimo import: {metrics.freshness.lastImportAt ? formatDate(metrics.freshness.lastImportAt) : "Sin datos"}</p>
            <p>Ultimo sync: {metrics.freshness.lastSyncAt ? formatDate(metrics.freshness.lastSyncAt) : "Sin datos"}</p>
            <p>
              Estado freshness: {" "}
              <Badge variant={metrics.freshness.stale ? "destructive" : "default"}>
                {metrics.freshness.stale ? "Stale" : "OK"}
              </Badge>
            </p>
            <p>Fuentes en warning/error: {formatNumber(metrics.freshness.staleSources)}</p>
            <p>Favoritos totales: {metrics.favoritesTotal === null ? "No disponible" : formatNumber(metrics.favoritesTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Admin Recientes</CardTitle>
            <CardDescription>Ultimos eventos de auditoria para trazabilidad operativa.</CardDescription>
          </CardHeader>
          <CardContent>
            {!metrics.recentAdminActions.length ? <EmptyState text="Sin acciones recientes." /> : null}
            {metrics.recentAdminActions.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Accion</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.recentAdminActions.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                      <TableCell>{row.action}</TableCell>
                      <TableCell>{row.entityType}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.userId || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de Clic Recientes</CardTitle>
          <CardDescription>Muestra operativa para debug rapido de trazabilidad.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Tienda</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(clicksQuery.data || []).slice(0, 100).map((click) => (
                <TableRow key={click.id}>
                  <TableCell>{click.productName}</TableCell>
                  <TableCell>{click.merchantName}</TableCell>
                  <TableCell>{formatDate(click.createdAt)}</TableCell>
                </TableRow>
              ))}

              {!clicksQuery.isLoading && !clicksQuery.data?.length ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sin eventos registrados.
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
