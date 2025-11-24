import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Configurações do teste
export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    'checks': ['rate>0.95'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const uniqueLogin = `user_${randomString(8)}_${__VU}_${__ITER}`;
  const password = 'senha123';

  // Teste primeira part: Registrar um novo usuário
  let registerResponse = http.post(`${BASE_URL}/register`, 
    JSON.stringify({
      login: uniqueLogin,
      senha: password
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(registerResponse, {
    'Register status is 201': (r) => r.status === 201,
    'Register response has message': (r) => r.json('message') !== undefined,
    'Register response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Teste segunda parte, realizar login
  let loginResponse = http.post(`${BASE_URL}/login`, 
    JSON.stringify({
      login: uniqueLogin,
      senha: password
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(loginResponse, {
    'Login status is 200': (r) => r.status === 200,
    'Login response has message': (r) => r.json('message') !== undefined,
    'Login response has user': (r) => r.json('user') !== undefined,
    'Login response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Teste extra 3 , tentar registrar usuário duplicado
  let duplicateResponse = http.post(`${BASE_URL}/register`, 
    JSON.stringify({
      login: uniqueLogin,
      senha: password
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(duplicateResponse, {
    'Duplicate register status is 400': (r) => r.status === 400,
    'Duplicate register has error message': (r) => r.json('error') !== undefined,
  });

  sleep(1);
 
  // Teste extra 4 , Tentar login com senha incorreta
  let wrongLoginResponse = http.post(`${BASE_URL}/login`, 
    JSON.stringify({
      login: uniqueLogin,
      senha: 'senhaErrada'
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(wrongLoginResponse, {
    'Wrong login status is 401': (r) => r.status === 401,
    'Wrong login has error message': (r) => r.json('error') !== undefined,
  });
}