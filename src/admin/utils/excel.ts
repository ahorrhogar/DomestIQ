import * as XLSX from "xlsx";

export interface ExcelColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
  width?: number;
}

interface ExportOptions<T> {
  rows: T[];
  columns: ExcelColumn<T>[];
  fileName: string;
  sheetName?: string;
}

function toColumnName(index: number): string {
  let current = index + 1;
  let result = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

export function exportRowsToExcel<T>({ rows, columns, fileName, sheetName = "Datos" }: ExportOptions<T>): void {
  if (!rows.length) {
    throw new Error("No hay registros para exportar");
  }

  const headerRow = columns.map((column) => column.header);
  const dataRows = rows.map((row) => columns.map((column) => column.value(row) ?? ""));

  const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
  worksheet["!cols"] = columns.map((column) => ({ wch: column.width ?? Math.max(column.header.length + 2, 14) }));

  const lastCell = `${toColumnName(columns.length - 1)}${rows.length + 1}`;
  worksheet["!autofilter"] = { ref: `A1:${lastCell}` };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
}
