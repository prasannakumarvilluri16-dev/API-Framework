import { test, expect } from '@playwright/test';
import { readExcel } from './utils/readExcel';
import path from 'path';

const dataFile = path.join(__dirname, 'data', 'testdata.csv');
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
