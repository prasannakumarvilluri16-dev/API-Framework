import { test, expect } from '@playwright/test';

test('simple post api request using dynamic data', async ({ request }) => {
  const { faker } = await import('@faker-js/faker');

  const payload = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 500 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: faker.date.soon({ days: 7 }).toISOString().split('T')[0],
      checkout: faker.date.soon({ days: 14 }).toISOString().split('T')[0]
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'None'])
  };

  const response = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: payload,
  });

  // validate status code and response body
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('bookingid');
  console.log(responseBody);
  console.log(responseBody.bookingid);
});
