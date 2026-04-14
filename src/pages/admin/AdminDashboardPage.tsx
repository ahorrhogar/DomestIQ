import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, Boxes, MousePointerClick, Store } from "lucide-react";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate, formatNumber } from "@/admin/utils/format";
import { getDashboardMetrics, listClicks } from "@/admin/services/adminCatalogService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabel: Record<string, string> = {
  healthy: "Saludable",
  warning: "Advertencia",
  error: "Error",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  healthy: "default",
  warning: "secondary",
  error: "destructive",
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const metricsQuery = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: getDashboardMetrics,
  });

  const clicksQuery = useQuery({
    queryKey: ["admin-recent-clicks"],
    queryFn: () => listClicks(20),
  });

  if (metricsQuery.isLoading) {
    return (
      <>
        <AdminPageHeader
          title="Dashboard"
          description="Visibilidad operativa del catalogo, conversion y salud de sincronizacion."
        />
        <DashboardSkeleton />
      </>
    );
  }

  if (metricsQuery.error) {
    return (
      <>
        <AdminPageHeader title="Dashboard" description="No se pudo cargar la informacion." />
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            {metricsQuery.error instanceof Error ? metricsQuery.error.message : "Error al consultar dashboard"}
          </CardContent>
        </Card>
      </>
    );
  }

  const metrics = metricsQuery.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Visibilidad operativa del catalogo, conversion y salud de sincronizacion."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Boxes className="h-4 w-4" /> Productos
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(metrics.totalProducts)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Total en catalogo</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Ofertas activas
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(metrics.activeOffers)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Con stock y activas</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Store className="h-4 w-4" /> Tiendas activas
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(metrics.activeMerchants)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Merchants con actividad</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" /> Clics
            </CardDescription>
            <CardTitle className="text-3xl">{formatNumber(metrics.totalClicks)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Productos incompletos: {formatNumber(metrics.incompleteProducts)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de sincronizacion</CardTitle>
            <CardDescription>Fuentes y ultima ejecucion conocida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.syncStatus.length ? (
              metrics.syncStatus.map((status) => (
                <div key={status.id} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{status.source}</p>
                    <Badge variant={statusVariant[status.status] || "outline"}>
                      {statusLabel[status.status] || status.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Actualizado: {formatDate(status.updatedAt)}</p>
                  <p className="text-xs text-muted-foreground">{status.message || "Sin mensaje"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay fuentes registradas.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencias de busqueda</CardTitle>
            <CardDescription>Terminos mas usados dentro de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Termino</TableHead>
                  <TableHead className="text-right">Conteo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.topSearchTerms.length ? (
                  metrics.topSearchTerms.map((term) => (
                    <TableRow key={term.term}>
                      <TableCell>{term.term}</TableCell>
                      <TableCell className="text-right">{formatNumber(term.count)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      Sin datos de busqueda
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analitica detallada</CardTitle>
          <CardDescription>Top productos, tiendas y actividad de clics recientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products" className="space-y-4">
            <TabsList>
              <TabsTrigger value="products">Top productos clicados</TabsTrigger>
              <TabsTrigger value="merchants">Top tiendas clicadas</TabsTrigger>
              <TabsTrigger value="views">Productos mas vistos</TabsTrigger>
              <TabsTrigger value="clicks">Ultimos clics</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
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
            </TabsContent>

            <TabsContent value="merchants">
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
            </TabsContent>

            <TabsContent value="views">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Vistas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topViewedProducts.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.views)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="clicks">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(clicksQuery.data || []).map((click) => (
                    <TableRow key={click.id}>
                      <TableCell>{click.productName}</TableCell>
                      <TableCell>{click.merchantName}</TableCell>
                      <TableCell>{formatDate(click.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {clicksQuery.isLoading ? <p className="mt-2 text-xs text-muted-foreground">Cargando clics...</p> : null}
              {clicksQuery.error ? (
                <p className="mt-2 text-xs text-destructive">
                  {clicksQuery.error instanceof Error ? clicksQuery.error.message : "No se pudieron cargar clics"}
                </p>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lectura rapida</CardTitle>
          <CardDescription>Resumen ejecutivo para monitoreo diario.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Hay {formatNumber(metrics.totalProducts)} productos y {formatNumber(metrics.activeOffers)} ofertas activas.
            </li>
            <li>
              {formatNumber(metrics.incompleteProducts)} productos activos no tienen oferta o imagen principal.
            </li>
            <li>
              La seccion de analitica muestra los items con mayor traccion para ajustar priorizacion de catalogo.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
