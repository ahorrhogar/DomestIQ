import { useEffect, useMemo, useState } from "react";

export function useBulkSelection<T extends { id: string }>(rows: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleIdSet = useMemo(() => new Set(rows.map((row) => row.id)), [rows]);

  useEffect(() => {
    setSelectedIds((previous) => {
      const next = new Set<string>();
      for (const id of previous) {
        if (visibleIdSet.has(id)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [visibleIdSet]);

  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.has(row.id)), [rows, selectedIds]);

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  const someSelected = !allSelected && rows.some((row) => selectedIds.has(row.id));

  const setRowSelected = (id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const setAllSelected = (checked: boolean) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(rows.map((row) => row.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    selectedCount: selectedIds.size,
    selectedRows,
    allSelected,
    someSelected,
    isSelected: (id: string) => selectedIds.has(id),
    setRowSelected,
    setAllSelected,
    clearSelection,
  };
}
