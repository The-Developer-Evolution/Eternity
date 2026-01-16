import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

export const options: Options = {
  stages: [
    { duration: '30s', target: 100 }, 
    { duration: '1m', target: 500 }, // Puncak 500 user melakukan request HTTP
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  // Ganti dengan endpoint yang melakukan query berat / update data
  // Contoh: Endpoint trading atau rally update
  const url = 'https://eternityuc.com/api/rally/period'; 

  // Header penting (terutama jika endpoint butuh Auth)
  // Note: k6 susah simulasi NextAuth session, sebaiknya buat API Key sementara
  // atau bypass auth di middleware khusus testing.
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xfg_TWcjOcvUsJn5.cpkO8NZoQoPYPOmi-sGzK_woEvCXidkaF8Qbtkj5I-cFk1E5gSPbMQJE0luBakciFz2rdg-JKew6WT45NxEcE5zvZMJsaUR_MY__UqyJG-Xr6Uekmo8-GV_0f9AnYAms_AF4oPbwRnWDrLKNbiE2_FjJmfxWHYt17kjYa4TTTKXcmnVyVe8DkazSNrIyCPZu_033DnQuxv0ul1_DINToz5hF7azDLRG-aBpRUHwmh9mD.N_H6V-id2PixnLso9QDsSw'
    },
  };

  // Simulasi POST request
  const payload = JSON.stringify({
    someData: "test"
  });

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'duration < 2000ms': (r) => r.timings.duration < 2000, // Toleransi 2 detik
  });

  sleep(1);
}