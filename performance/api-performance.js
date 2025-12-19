import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { randomString, randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { 
  validateResponse, 
  generateFakeUser, 
  validateJWT, 
  extractToken, 
  createAuthHeaders 
} from './helpers.js';

// Data-Driven Testing - Carrega dados de teste
const testData = new SharedArray('test users', function () {
  return JSON.parse(open('./test-data.json'));
});

// Variáveis de Ambiente
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_RESPONSE_TIME = parseInt(__ENV.MAX_RESPONSE_TIME) || 1000;
const SUCCESS_RATE_THRESHOLD = parseFloat(__ENV.SUCCESS_RATE_THRESHOLD) || 0.95;

// Trends personalizadas para métricas específicas
const loginTrend = new Trend('login_duration');
const registerTrend = new Trend('register_duration');
const authFailures = new Counter('auth_failures');
const tokenValidations = new Counter('token_validations');

// Configurações do teste com Stages e Thresholds avançados
export let options = {
  stages: [
    { duration: '5s', target: 5 },     // Ramp up to 5 users
    { duration: '20s', target: 5 },    // Stay at 5 users
    { duration: '5s', target: 0 },     // Ramp down
  ],
  thresholds: {
    // Thresholds básicos
    http_req_duration: [`p(95)<${MAX_RESPONSE_TIME}`],
    'checks': [`rate>${SUCCESS_RATE_THRESHOLD}`],
    
    // Thresholds para trends customizadas
    login_duration: ['p(90)<800', 'p(95)<1200'],
    register_duration: ['p(90)<600', 'p(95)<1000'],
    
    // Thresholds para counters
    auth_failures: ['count<50'],
    token_validations: ['count>50'],
    
    // Thresholds por grupo
    'group_duration{group:::Login Flow}': ['p(95)<2000'],
    'group_duration{group:::Registration Flow}': ['p(95)<1500'],
  },
};

// Variável global para armazenar tokens válidos (Reaproveitamento de Resposta)
let validTokens = new Map();

export default function () {
  // Data-Driven Testing - Seleciona usuário aleatório dos dados de teste
  const testUser = randomItem(testData);
  
  // Faker - Gera usuário fake para testes de registro
  const fakeUser = generateFakeUser();
  
  // Groups - Agrupa cenários relacionados
  group('Registration Flow', function () {
    // Teste de registro com usuário fake
    let registerResponse = http.post(`${BASE_URL}/register`, 
      JSON.stringify({
        login: fakeUser.login,
        senha: fakeUser.senha,
        email: fakeUser.email,
        name: fakeUser.name
      }), 
      {
        headers: createAuthHeaders(),
        tags: { scenario: 'registration' }
      }
    );

    // Checks com helper personalizado
    validateResponse(registerResponse, 201, 'User Registration');
    
    // Trend personalizada
    registerTrend.add(registerResponse.timings.duration);
    
    // Reaproveitamento de Resposta - extrai e valida token
    const token = extractToken(registerResponse);
    if (token && validateJWT(token)) {
      validTokens.set(fakeUser.login, token);
      tokenValidations.add(1);
    }

    sleep(1);
  });

  group('Login Flow', function () {
    // Teste de login com dados do arquivo
    let loginResponse = http.post(`${BASE_URL}/login`, 
      JSON.stringify({
        login: testUser.login,
        senha: testUser.senha
      }), 
      {
        headers: createAuthHeaders(),
        tags: { scenario: 'login', role: testUser.role }
      }
    );

    // Checks detalhados
    const loginSuccess = check(loginResponse, {
      'Login status is 200': (r) => r.status === 200,
      'Login response has message': (r) => r.json('message') !== undefined,
      'Login response has user': (r) => r.json('user') !== undefined,
      'Login response time < 500ms': (r) => r.timings.duration < 500,
      'Login has valid token': (r) => {
        const token = extractToken(r);
        return token && validateJWT(token);
      }
    });

    // Trend personalizada
    loginTrend.add(loginResponse.timings.duration);

    // Counter para falhas de autenticação
    if (!loginSuccess) {
      authFailures.add(1);
    }

    // Reaproveitamento de token
    const loginToken = extractToken(loginResponse);
    if (loginToken) {
      validTokens.set(testUser.login, loginToken);
      tokenValidations.add(1);
    }

    sleep(1);
  });

  group('Protected Routes with Authentication', function () {
    // Uso de Token de Autenticação
    const userToken = validTokens.get(testUser.login) || validTokens.get(fakeUser.login);
    
    if (userToken) {
      // Simula acesso a rota protegida (assumindo que existe)
      let protectedResponse = http.get(`${BASE_URL}/profile`, {
        headers: createAuthHeaders(userToken),
        tags: { scenario: 'protected_route' }
      });

      check(protectedResponse, {
        'Protected route accessible with token': (r) => r.status === 200 || r.status === 404, // 404 se rota não existe ainda
        'Token is valid': () => validateJWT(userToken),
      });
    }

    sleep(1);
  });

  group('Error Handling Tests', function () {
    // Teste de usuário duplicado
    let duplicateResponse = http.post(`${BASE_URL}/register`, 
      JSON.stringify({
        login: testUser.login, // Usa login existente
        senha: testUser.senha
      }), 
      {
        headers: createAuthHeaders(),
        tags: { scenario: 'duplicate_user' }
      }
    );

    validateResponse(duplicateResponse, 400, 'Duplicate User Registration');

    sleep(0.5);

    // Teste de login com credenciais inválidas
    let wrongLoginResponse = http.post(`${BASE_URL}/login`, 
      JSON.stringify({
        login: testUser.login,
        senha: 'senhaErrada123'
      }), 
      {
        headers: createAuthHeaders(),
        tags: { scenario: 'invalid_login' }
      }
    );

    const failedLogin = check(wrongLoginResponse, {
      'Wrong login status is 401': (r) => r.status === 401,
      'Wrong login has error message': (r) => r.json('error') !== undefined,
    });

    if (!failedLogin) {
      authFailures.add(1);
    }

    sleep(0.5);
  });

  group('Data Validation Tests', function () {
    // Teste com dados inválidos usando Faker
    const invalidData = {
      login: '', // Login vazio
      senha: '123', // Senha muito curta
      email: 'email-inválido' // Email malformado
    };

    let invalidDataResponse = http.post(`${BASE_URL}/register`, 
      JSON.stringify(invalidData), 
      {
        headers: createAuthHeaders(),
        tags: { scenario: 'invalid_data' }
      }
    );

    validateResponse(invalidDataResponse, 400, 'Invalid Data Registration');
  });
}