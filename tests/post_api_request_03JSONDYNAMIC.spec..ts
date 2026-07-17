import { test, expect } from '@playwright/test';
//const { test, expect } = require('@playwright/test');

import { stringFormat } from '../tests/utils//common';

const bookingAPIRequest = require('../utils/bookingAPIRequest');


test('simple post api request using dynamic Json data', async ({ request }) => {
  const { faker } = await import('@faker-js/faker');
  const { DateTime } = require('luxon');

   //const firtname = faker.person.firstName(); // generates a random first name
   //const lastname = faker.person.lastName(); // generates a random last name
   //const totalprice = faker.number.int(100); 
   // generates a random integer between 50 and 500
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
