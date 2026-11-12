import * as XLSX from 'xlsx';

export interface ParsedExcel {
  sheetNames: string[];
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

/**
 * Parses an uploaded Excel file ArrayBuffer.
 */
export function parseExcelFile(data: ArrayBuffer): ParsedExcel {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const firstSheet = workbook.Sheets[sheetNames[0]];

  // Convert to JSON with headers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

  let headers: string[] = [];
  if (jsonData.length > 0) {
    headers = Object.keys(jsonData[0]);
  } else {
    // Attempt header extraction from raw range
    const range = XLSX.utils.decode_range(firstSheet['!ref'] || 'A1:A1');
    for (let c = range.s.c; c <= range.e.c; ++c) {
      const cell = firstSheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
      if (cell && cell.v) headers.push(String(cell.v));
    }
  }

  return {
    sheetNames,
    headers,
    rows: jsonData,
    totalRows: jsonData.length,
  };
}

/**
 * Validates Excel rows for missing fields or duplicates.
 */
export function validateExcelData(
  rows: Record<string, any>[],
  requiredColumns: string[],
  uniqueKeyColumn?: string
): {
  valid: boolean;
  missingCells: { rowIndex: number; column: string }[];
  duplicateKeys: { key: string; rowIndices: number[] }[];
} {
  const missingCells: { rowIndex: number; column: string }[] = [];
  const keyMap = new Map<string, number[]>();

  rows.forEach((row, idx) => {
    // Check required columns
    for (const col of requiredColumns) {
      if (!row[col] || String(row[col]).trim() === '') {
        missingCells.push({ rowIndex: idx + 1, column: col });
      }
    }

    // Check duplicates
    if (uniqueKeyColumn && row[uniqueKeyColumn]) {
      const keyVal = String(row[uniqueKeyColumn]).trim();
      const existing = keyMap.get(keyVal) || [];
      existing.push(idx + 1);
      keyMap.set(keyVal, existing);
    }
  });

  const duplicateKeys: { key: string; rowIndices: number[] }[] = [];
  keyMap.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicateKeys.push({ key, rowIndices: indices });
    }
  });

  return {
    valid: missingCells.length === 0 && duplicateKeys.length === 0,
    missingCells,
    duplicateKeys,
  };
}

/**
 * Exports data to an Excel file (.xlsx) and triggers browser download.
 */
export function exportToExcel(
  data: Record<string, any>[],
  filename: string,
  sheetName: string = 'Dữ liệu'
) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

