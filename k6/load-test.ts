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

export default function loadTest() {
  // Ganti dengan endpoint yang melakukan query berat / update data
  // Contoh: Endpoint trading atau rally update
  const url = 'https://eternityuc.com/api/rally/period'; 

  // Header penting (terutama jika endpoint butuh Auth)
  // Note: k6 susah simulasi NextAuth session, sebaiknya buat API Key sementara
  // atau bypass auth di middleware khusus testing.
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..hUqNOYN30ass9pBS.fCQ6GOpGWs0WjAS3decwKFK_xbep3EGg-2_POH4yF8aTf8SjbV5EnbQPXFapFL6yVRnpyIQIzH8zxK5vg6vUoYtjBifS2h0DlOeOKcgAKBYofGH_AbMOmnPuGjOdfNiAdgjwg-fQzbhAapDcRo7urCc1yS-3Nzq2nSS2c_nwlEe--RCubheLpDCZ6i45R_AZGH7dp-0PmBE5tIrBMOLH63nqdsALjhp_1Ubnp6twKUDw.o5Z1IBKC0Szc0erlChg4rQ'
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