import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

export const options: Options = {
  stages: [
    { duration: '5s', target: 50 },
    { duration: '10s', target: 500 }, 
    { duration: '10s', target: 500 }, 
    { duration: '5s', target: 0 },
  ],
};

const BASE_URL = 'https://eternityuc.com';

export default function () {
  // Test 1: Hit Contest Status API (Realtime Timer)
  const resStatus = http.get(`${BASE_URL}/api/contest/status`);

  check(resStatus, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'has serverTime': (r) => {
        try {
            const body = JSON.parse(r.body as string);
            return body.serverTime !== undefined;
        } catch (e) {
            return false;
        }
    },
    'has status': (r) => {
        try {
            const body = JSON.parse(r.body as string);
            return body.status !== undefined;
        } catch (e) {
            return false;
        }
    }
  });

  // Test 2: Hit Rally Period API
  const resPeriod = http.get(`${BASE_URL}/api/rally/period`);

  check(resPeriod, {
    'period status is 200': (r) => r.status === 200,
    'period response < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
