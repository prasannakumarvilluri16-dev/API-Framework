import { test, expect } from '@playwright/test';

/*test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});*/

test('create get api request in playwright', async ({ page, request }) => {
  const response = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: {
      firstname: 'Jane',
      lastname: 'Doe',
      totalprice: 100,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-01-01',
        checkout: '2025-01-05'
      },
      additionalneeds: 'Breakfast'
    }
  });

  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('bookingid');
  console.log(responseBody);
  console.log(responseBody.bookingid);
  console.log(response.status());
 
});
