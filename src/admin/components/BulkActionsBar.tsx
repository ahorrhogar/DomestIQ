import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
  isDeleting?: boolean;
  exportLabel?: string;
  deleteLabel?: string;
}

export function BulkActionsBar({
  selectedCount,
  onExport,
  onDelete,
  onClear,
  isDeleting = false,
  exportLabel = "Exportar Excel",
  deleteLabel = "Eliminar seleccionados",
}: BulkActionsBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3">
      <p className="text-sm font-medium">{selectedCount} seleccionados</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          {exportLabel}
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={onDelete} disabled={isDeleting}>
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Eliminando..." : deleteLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
