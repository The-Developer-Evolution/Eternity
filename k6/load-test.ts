import http from 'k6/http';
import { sleep, check } from 'k6';
import { Options } from 'k6/options';

// Konfigurasi Load Test (Tipe Data Aman berkat TypeScript)
export const options: Options = {
  stages: [
    { duration: '10s', target: 500 },  // Naik ke 50 user dalam 10 detik
    { duration: '30s', target: 500 },  // Tahan 50 user selama 30 detik
    { duration: '10s', target: 0 },   // Turun ke 0
  ],
  // Opsional: Set thresholds (batas toleransi)
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% request harus di bawah 500ms
    http_req_failed: ['rate<0.01'],   // Error rate harus di bawah 1%
  },
};

export default function () {
  // Ganti URL ini dengan endpoint lokal atau VPS kamu
  const url = 'https://eternityuc.com/api/contest/status'; 

  const res = http.get(url);

  // Validasi response (bukan cuma status 200, tapi kontennya juga)
  check(res, {
    'status is 200': (r) => r.status === 200,
    'protocol is HTTP/2': (r) => r.proto === 'HTTP/2.0', // Next.js support HTTP/2
  });

  sleep(1);
}