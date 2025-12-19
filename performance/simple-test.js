import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    'checks': ['rate>0.95'],
  },
};

export default function () {
  // Teste simples de registro
  let registerResponse = http.post('http://localhost:3000/register', 
    JSON.stringify({
      login: `user_${Math.random()}_${Date.now()}`,
      senha: 'senha123'
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(registerResponse, {
    'Register status is 201': (r) => r.status === 201,
  });

  sleep(1);
}