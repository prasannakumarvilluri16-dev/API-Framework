import { test, expect } from '@playwright/test';

const postRequestBody = require('./data/post_request_body.json');

test('simple post api request using json data', async ({ request }) => {
  const response = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: postRequestBody,
  });

  // validate status code and response body
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('bookingid');
  console.log(responseBody);
  console.log(responseBody.bookingid);
});