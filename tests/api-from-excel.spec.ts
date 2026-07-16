import { test, expect } from '@playwright/test';
import { readExcel } from './utils/readExcel';
import path from 'path';
import fs from 'fs';

const xlsxPath = path.join(__dirname, 'data', 'testdata.xlsx');
const csvPath = path.join(__dirname, 'data', 'testdata.csv');
let dataFile: string;
if (fs.existsSync(xlsxPath)) {
  process.env.FEATURE_XLSX = 'true';
  dataFile = xlsxPath;
} else if (fs.existsSync(csvPath)) {
  // ensure XLSX feature is not enabled so readExcel will parse CSV
  process.env.FEATURE_XLSX = '';
  dataFile = csvPath;
} else {
  throw new Error('No test data file found: expected testdata.xlsx or testdata.csv in tests/data');
}

const rows = readExcel(dataFile, 'Sheet1');

for (const row of rows) {
  test(`create booking for ${row.firstname}`, async ({ request }) => {
    const payload = {
      firstname: String(row.firstname),
      lastname: String(row.lastname),
      totalprice: Number(row.totalprice || 0),
      depositpaid: row.depositpaid === true || String(row.depositpaid).toLowerCase() === 'true',
      bookingdates: {
        checkin: String(row.checkin),
        checkout: String(row.checkout)
      },
      additionalneeds: String(row.additionalneeds || '')
    };

    const res = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    expect(res.status()).toBe(Number(row.expectedStatus || 200));
    const body = await res.json();
    expect(body).toHaveProperty('bookingid');
  });
}
