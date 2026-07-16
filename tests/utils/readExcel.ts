import fs from 'fs';
import path from 'path';

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

// Runtime check for optional xlsx availability
export function isXlsxAvailable(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require.resolve('xlsx');
    return true;
  } catch {
    return false;
  }
}

export function readExcel(filePath: string, sheetName?: string): Array<Record<string, any>> {
  const resolved = path.resolve(filePath);
  const ext = path.extname(resolved).toLowerCase();
  // write a brief runtime log for debugging (file read attempts and feature flag)
  try {
    const logDir = path.resolve(__dirname, '..', 'logs');
    const logPath = path.join(logDir, 'xlsx.log');
    fs.mkdirSync(logDir, { recursive: true });
    const time = new Date().toISOString();
    const availability = `FEATURE_XLSX=${!!process.env.FEATURE_XLSX}`;
    fs.appendFileSync(logPath, `${time} - readExcel called for ${resolved} (ext=${ext}) - ${availability}\n`, 'utf8');
  } catch (e) {
    /* ignore logging errors */
  }
  if (ext === '.csv') {
    const content = fs.readFileSync(resolved, 'utf8');
    return parseCsv(content);
  }
  // Handle .xlsx only when explicitly enabled via feature flag to avoid pulling in xlsx by default
  if (ext === '.xlsx') {
    if (!process.env.FEATURE_XLSX) {
      throw new Error(
        `XLSX support is disabled. To enable: set FEATURE_XLSX=true and install the optional dependency 'xlsx' (npm install xlsx --save-optional).`
      );
    }

    if (!isXlsxAvailable()) {
      throw new Error(
        `XLSX support is enabled but 'xlsx' is not installed. Install it as an optional dependency: npm install xlsx --save-optional`
      );
    }
    // Informational log so developers know XLSX will be used
    // This helps diagnose editor/CI diagnostics when optional dependency is missing
    // eslint-disable-next-line no-console
    const infoMsg = `XLSX support enabled and available — parsing ${resolved}${sheetName ? ` (sheet: ${sheetName})` : ''}`;
    console.info(infoMsg);

    // Also write an informational log to tests/logs/xlsx.log for CI/debugging
    try {
      const logDir = path.resolve(__dirname, '..', 'logs');
      const logPath = path.join(logDir, 'xlsx.log');
      fs.mkdirSync(logDir, { recursive: true });
      const time = new Date().toISOString();
      fs.appendFileSync(logPath, `${time} - ${infoMsg}\n`, 'utf8');
    } catch (e) {
      // don't fail tests because logging failed
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = require('xlsx');
    const wb = XLSX.readFile(resolved, { cellDates: true });
    const sh = wb.Sheets[sheetName || wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sh, { defval: '' }) as Array<Record<string, any>>;
    return rows;
  }

  throw new Error(`Unsupported file extension '${ext}'. Provide a .csv file or enable XLSX support.`);
}
