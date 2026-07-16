import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

function parseCsv(content: string): Array<Record<string, any>> {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];

  const parseLine = (line: string) => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result.map(s => s.trim());
  };

  const headers = parseLine(lines[0]);
  const rows: Array<Record<string, any>> = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    if (vals.length === 1 && vals[0] === '') continue;
    const obj: Record<string, any> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = vals[j] ?? '';
    }
    rows.push(obj);
  }
  return rows;
}

export async function readExcel(filePath: string, sheetName?: string): Promise<Array<Record<string, any>>> {
  const resolved = path.resolve(filePath);
  const ext = path.extname(resolved).toLowerCase();

  if (ext === '.csv') {
    const content = fs.readFileSync(resolved, 'utf8');
    return parseCsv(content);
  }

  if (ext === '.xlsx') {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(resolved);

    const worksheet = sheetName
      ? workbook.getWorksheet(sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      throw new Error(`Sheet '${sheetName ?? 'first sheet'}' not found in ${resolved}`);
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values
      .slice(1)
      .map((header) => String(header ?? '').trim());

    const rows: Array<Record<string, any>> = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      const values = row.values.slice(1);
      const rowObj: Record<string, any> = {};
      let hasValue = false;
      for (let j = 0; j < headers.length; j++) {
        const key = headers[j];
        if (!key) continue;
        const value = values[j] ?? '';
        rowObj[key] = value;
        if (value !== '' && value != null) {
          hasValue = true;
        }
      }
      if (hasValue) {
        rows.push(rowObj);
      }
    });

    return rows;
  }

  throw new Error(`Unsupported file extension '${ext}'. Provide a .csv or .xlsx file.`);
}
