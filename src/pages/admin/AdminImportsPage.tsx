import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate, formatNumber } from "@/admin/utils/format";
import {
  listImportJobLogs,
  listImportJobs,
} from "@/admin/services/adminCatalogService";
import { parseCsvPreview, runCsvImport } from "@/admin/services/adminImportService";
import type { CsvPreviewResult } from "@/admin/services/adminImportService";
import type { ImportColumnMapping } from "@/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const FIELD_LABELS: Record<keyof ImportColumnMapping, string> = {
  productName: "Nombre producto",
  brandName: "Marca",
  categoryName: "Categoria",
  subcategoryName: "Subcategoria",
  description: "Descripcion corta",
  longDescription: "Descripcion larga",
  price: "Precio",
  oldPrice: "Precio anterior",
  merchantName: "Tienda",
  offerUrl: "URL oferta",
  stock: "Stock",
  imageUrl: "URL imagen",
  sku: "SKU",
  ean: "EAN",
  tags: "Tags",
};

const JOB_STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  running: "outline",
  completed: "default",
  failed: "destructive",
};

export default function AdminImportsPage() {
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<CsvPreviewResult | null>(null);
  const [mapping, setMapping] = useState<ImportColumnMapping | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const jobsQuery = useQuery({
    queryKey: ["admin-import-jobs"],
    queryFn: () => listImportJobs(100),
  });

  const logsQuery = useQuery({
    queryKey: ["admin-import-job-logs", selectedJobId],
    queryFn: () => listImportJobLogs(selectedJobId as string),
    enabled: Boolean(selectedJobId),
  });

  const parseMutation = useMutation({
    mutationFn: async (payload: string) => parseCsvPreview(payload),
    onSuccess: (data) => {
      setPreview(data);
      setMapping(data.mapping);
      toast.success(`Preview lista: ${formatNumber(data.totalRows)} filas`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo leer el CSV");
    },
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!mapping) {
        throw new Error("Primero genera preview y revisa mapeo");
      }

      return runCsvImport({
        csvText,
        mapping,
        sourceLabel: "admin_panel_csv",
      });
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-import-jobs"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-merchants"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });

      setSelectedJobId(result.jobId);
      toast.success(
        `Importacion completada. Filas: ${result.processedRows}, creados: ${result.createdCount}, actualizados: ${result.updatedCount}, errores: ${result.errorCount}, advertencias: ${result.warningCount}`,
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo ejecutar la importacion");
    },
  });

  const headers = preview?.headers || [];
  const previewRows = preview?.rows || [];

  const selectedJob = useMemo(() => {
    return (jobsQuery.data || []).find((job) => job.id === selectedJobId) || null;
  }, [jobsQuery.data, selectedJobId]);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      return;
    }

    const text = await file.text();
    setCsvText(text);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Importaciones"
        description="Carga CSV, valida mapeo y monitorea jobs de importacion."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nuevo CSV</CardTitle>
          <CardDescription>Sube un archivo o pega texto CSV para ejecutar importacion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Archivo CSV</Label>
              <Input id="csv-file" type="file" accept=".csv,text/csv" onChange={(event) => void handleFileSelect(event.target.files?.[0] || null)} />
            </div>
            <Button variant="outline" onClick={() => parseMutation.mutate(csvText)} disabled={!csvText.trim() || parseMutation.isPending}>
              {parseMutation.isPending ? "Analizando..." : "Generar preview"}
            </Button>
            <Button onClick={() => importMutation.mutate()} disabled={!preview || !mapping || importMutation.isPending}>
              <UploadCloud className="mr-2 h-4 w-4" />
              {importMutation.isPending ? "Importando..." : "Ejecutar importacion"}
            </Button>
          </div>

          {preview ? (
            <p className="text-xs text-muted-foreground">
              Preparado para importar {formatNumber(preview.totalRows)} filas en bloques transaccionales de 100.
            </p>
          ) : null}

          {importMutation.isPending ? (
            <p className="text-xs text-muted-foreground">Importacion en curso. Si falla una fila, el bloque completo se revierte.</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="csv-text">CSV en texto</Label>
            <Textarea
              id="csv-text"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              rows={10}
              placeholder="product_name,brand_name,price,..."
            />
          </div>
        </CardContent>
      </Card>

      {preview && mapping ? (
        <Card>
          <CardHeader>
            <CardTitle>Mapeo de columnas</CardTitle>
            <CardDescription>
              Headers detectados: {headers.length}. Filas detectadas: {formatNumber(preview.totalRows)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(Object.keys(FIELD_LABELS) as Array<keyof ImportColumnMapping>).map((key) => (
                <div key={key} className="space-y-2">
                  <Label>{FIELD_LABELS[key]}</Label>
                  <Select
                    value={mapping[key] || "__none__"}
                    onValueChange={(value) =>
                      setMapping((prev) =>
                        prev
                          ? {
                              ...prev,
                              [key]: value === "__none__" ? "" : value,
                            }
                          : prev,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona columna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Sin mapear</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={`${key}-${header}`} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Preview de filas</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.slice(0, 8).map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.slice(0, 8).map((row, index) => (
                    <TableRow key={index}>
                      {headers.slice(0, 8).map((header) => (
                        <TableCell key={`${index}-${header}`} className="max-w-[180px] truncate">
                          {row[header] || ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Historial de jobs</CardTitle>
          <CardDescription>Estado de importaciones recientes y sus metricas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Filas</TableHead>
                <TableHead>Creados</TableHead>
                <TableHead>Actualizados</TableHead>
                <TableHead>Errores</TableHead>
                <TableHead className="text-right">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Cargando jobs...
                  </TableCell>
                </TableRow>
              ) : null}

              {jobsQuery.error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-destructive">
                    {jobsQuery.error instanceof Error ? jobsQuery.error.message : "No se pudieron cargar jobs"}
                  </TableCell>
                </TableRow>
              ) : null}

              {(jobsQuery.data || []).map((job) => (
                <TableRow key={job.id} data-state={selectedJobId === job.id ? "selected" : undefined}>
                  <TableCell>{formatDate(job.createdAt)}</TableCell>
                  <TableCell>{job.source}</TableCell>
                  <TableCell>
                    <Badge variant={JOB_STATUS_VARIANT[job.status] || "outline"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{formatNumber(job.rowCount)}</TableCell>
                  <TableCell>{formatNumber(job.createdCount)}</TableCell>
                  <TableCell>{formatNumber(job.updatedCount)}</TableCell>
                  <TableCell>{formatNumber(job.errorCount)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelectedJobId(job.id)}>
                      Ver logs
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!jobsQuery.isLoading && !jobsQuery.error && !jobsQuery.data?.length ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Aun no hay jobs ejecutados.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedJob ? (
        <Card>
          <CardHeader>
            <CardTitle>Logs del job seleccionado</CardTitle>
            <CardDescription>
              Job {selectedJob.id} ({selectedJob.status})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Fila</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsQuery.error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-destructive">
                      {logsQuery.error instanceof Error ? logsQuery.error.message : "No se pudieron cargar logs"}
                    </TableCell>
                  </TableRow>
                ) : null}

                {(logsQuery.data || []).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={log.level === "error" ? "destructive" : log.level === "warning" ? "secondary" : "outline"}>
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{typeof log.rowIndex === "number" ? log.rowIndex + 1 : "-"}</TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))}

                {!logsQuery.isLoading && !logsQuery.error && !logsQuery.data?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay logs para este job.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            {logsQuery.isLoading ? <p className="mt-2 text-xs text-muted-foreground">Cargando logs...</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
