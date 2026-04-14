import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/admin/components/AdminPageHeader";
import { formatDate } from "@/admin/utils/format";
import { listAdminActions } from "@/admin/services/adminCatalogService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const auditQuery = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => listAdminActions(500),
  });

  const entityOptions = useMemo(() => {
    const setValues = new Set<string>();
    for (const row of auditQuery.data || []) {
      if (row.entityType) {
        setValues.add(row.entityType);
      }
    }
    return Array.from(setValues.values()).sort((a, b) => a.localeCompare(b));
  }, [auditQuery.data]);

  const actionOptions = useMemo(() => {
    const setValues = new Set<string>();
    for (const row of auditQuery.data || []) {
      if (row.action) {
        setValues.add(row.action);
      }
    }
    return Array.from(setValues.values()).sort((a, b) => a.localeCompare(b));
  }, [auditQuery.data]);

  const filteredRows = useMemo(() => {
    const safeSearch = search.trim().toLowerCase();

    return (auditQuery.data || []).filter((row) => {
      if (entityFilter !== "all" && row.entityType !== entityFilter) {
        return false;
      }

      if (actionFilter !== "all" && row.action !== actionFilter) {
        return false;
      }

      if (!safeSearch) {
        return true;
      }

      const payloadText = JSON.stringify(row.payload).toLowerCase();
      return (
        row.action.toLowerCase().includes(safeSearch) ||
        row.entityType.toLowerCase().includes(safeSearch) ||
        (row.entityId || "").toLowerCase().includes(safeSearch) ||
        row.userId.toLowerCase().includes(safeSearch) ||
        payloadText.includes(safeSearch)
      );
    });
  }, [auditQuery.data, search, entityFilter, actionFilter]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Auditoria"
        description="Registro inmutable de acciones administrativas sobre datos y operaciones."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca por accion, entidad, usuario o contenido de payload.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar..." className="lg:col-span-2" />

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {entityOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Accion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {actionOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>{filteredRows.length} registros coinciden con los filtros actuales.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Accion</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>ID entidad</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.action}</Badge>
                  </TableCell>
                  <TableCell>{row.entityType}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.entityId || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.userId}</TableCell>
                  <TableCell>
                    <pre className="max-h-24 max-w-[420px] overflow-auto whitespace-pre-wrap rounded bg-secondary/50 p-2 text-xs">
                      {JSON.stringify(row.payload, null, 2)}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}

              {!filteredRows.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay eventos para los filtros actuales.
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
