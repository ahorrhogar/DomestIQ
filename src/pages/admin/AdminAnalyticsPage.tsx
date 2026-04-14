import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate, formatNumber } from "@/admin/utils/format";
import { getDashboardMetrics, listClicks } from "@/admin/services/adminCatalogService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function toDayLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit" }).format(date);
}

export default function AdminAnalyticsPage() {
  const metricsQuery = useQuery({
    queryKey: ["admin-analytics-metrics"],
    queryFn: getDashboardMetrics,
  });

  const clicksQuery = useQuery({
    queryKey: ["admin-analytics-clicks"],
    queryFn: () => listClicks(2000),
  });

  const dailyClicks = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const click of clicksQuery.data || []) {
      const day = click.createdAt.slice(0, 10);
      grouped.set(day, (grouped.get(day) || 0) + 1);
    }

    return Array.from(grouped.entries())
      .map(([day, clicks]) => ({ day, label: toDayLabel(day), clicks }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-30);
  }, [clicksQuery.data]);

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
        description="Seguimiento de clics, terminos de busqueda y rendimiento de tiendas/productos."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clics diarios (ultimos 30 dias)</CardTitle>
            <CardDescription>Basado en eventos registrados en la tabla clicks.</CardDescription>
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
            <CardDescription>Ranking de intencion de usuario para priorizar catalogo.</CardDescription>
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
            <CardTitle>Top productos por clics</CardTitle>
            <CardDescription>Productos con mayor salida hacia merchants.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top tiendas por clics</CardTitle>
            <CardDescription>Merchants con mejor traccion en comparador.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos de clic recientes</CardTitle>
          <CardDescription>Ultimos eventos para trazabilidad.</CardDescription>
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
