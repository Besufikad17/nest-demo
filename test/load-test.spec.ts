import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const failureRate = new Rate('failed_requests');

export const options = {
  vus: 50,

  thresholds: {
    http_req_duration: ['p(95)<500'],
    failed_requests: ['rate<0.1'],
  },

  stages: [
    { duration: '1m', target: 1 },
    { duration: '3m', target: 5 },
    { duration: '3m', target: 10 },
    { duration: '1m', target: 0 },
  ],
};

const BASE_URL = "http://localhost:3000/api/v1";

export default function() {
  // POST register

  if (Math.random() < 0.9) {
    const payload = JSON.stringify({
      type: "ACCOUNT_VERIFICATION",
      identifier: "PHONE",
      value: `+251912${Math.floor(Math.random() * 10000)}`
    });

    const response = http.post(`${BASE_URL}/auth/otp/request`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(response.json());

    check(response, {
      'request otp status was 201': (r) => r.status == 201,
    });
    failureRate.add(response.status !== 201);
    sleep(3);
  }

  // POST new product (10% of requests)
  else {
    const payload = JSON.stringify({
      name: 'Test Product',
      description: 'This is a test product',
      price: 19.99,
      stockQuantity: 100,
      category: 'Test',
      onSale: false,
    });
    const response = http.post(`${BASE_URL}/products`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(response, {
      'login status was 201': (r) => r.status == 201,
    });
    failureRate.add(response.status !== 201);
    sleep(3);
  }
}
