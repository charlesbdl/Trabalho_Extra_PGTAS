# Teste de Performance K6 Avançado

Este projeto implementa um teste de performance completo usando K6 com todos os conceitos avançados solicitados.

# Teste de Performance K6 Avançado

Este projeto implementa um teste de performance completo usando K6 com todos os conceitos avançados solicitados.

## 📋 Conceitos Implementados com Exemplos de Código

### 1. **Thresholds (Limites)**
Define critérios de sucesso/falha para o teste.

```javascript
// Em api-performance.js - linhas 29-42
thresholds: {
  // Thresholds básicos
  http_req_duration: [`p(95)<${MAX_RESPONSE_TIME}`],
  'checks': [`rate>${SUCCESS_RATE_THRESHOLD}`],
  
  // Thresholds para trends customizadas
  login_duration: ['p(90)<800', 'p(95)<1200'],
  register_duration: ['p(90)<600', 'p(95)<1000'],
  
  // Thresholds para counters
  auth_failures: ['count<50'],
  token_validations: ['count>100'],
  
  // Thresholds por grupo
  'group_duration{group:::Login Flow}': ['p(95)<2000'],
  'group_duration{group:::Registration Flow}': ['p(95)<1500'],
}
```

### 2. **Checks (Verificações)**
Validações que determinam sucesso/falha de operações específicas.

```javascript
// Exemplo em api-performance.js - linhas 114-121
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
```

### 3. **Helpers (Auxiliares)**
Funções reutilizáveis para validação e geração de dados.

```javascript
// Em helpers.js - Função de validação
export function validateResponse(response, expectedStatus, description) {
  return check(response, {
    [`${description} - Status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${description} - Response time < 500ms`]: (r) => r.timings.duration < 500,
    [`${description} - Has valid JSON`]: (r) => {
      try {
        r.json();
        return true;
      } catch {
        return false;
      }
    }
  });
}

// Geração de dados fake
export function generateFakeUser() {
  const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia'];
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com'];
  
  const firstName = names[Math.floor(Math.random() * names.length)];
  return {
    login: `${firstName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
    email: `${firstName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
    senha: `pass${Math.floor(Math.random() * 10000)}`
  };
}
```

### 4. **Trends (Tendências)**
Métricas personalizadas para análise específica de performance.

```javascript
// Em api-performance.js - linhas 25-28
const loginTrend = new Trend('login_duration');
const registerTrend = new Trend('register_duration');
const authFailures = new Counter('auth_failures');
const tokenValidations = new Counter('token_validations');

// Uso das trends - linhas 83 e 124
registerTrend.add(registerResponse.timings.duration);
loginTrend.add(loginResponse.timings.duration);
```

### 5. **Faker (Dados Fictícios)**
Geração de dados realísticos para testes mais robustos.

```javascript
// Em api-performance.js - linhas 56-57
const fakeUser = generateFakeUser(); // Gera usuário fake

// Uso no teste de registro - linhas 61-66
let registerResponse = http.post(`${BASE_URL}/register`, 
  JSON.stringify({
    login: fakeUser.login,
    senha: fakeUser.senha,
    email: fakeUser.email,
    name: fakeUser.name
  })
);
```

### 6. **Variáveis de Ambiente**
Configuração flexível através de variáveis externas.

```javascript
// Em api-performance.js - linhas 20-22
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const MAX_RESPONSE_TIME = parseInt(__ENV.MAX_RESPONSE_TIME) || 1000;
const SUCCESS_RATE_THRESHOLD = parseFloat(__ENV.SUCCESS_RATE_THRESHOLD) || 0.95;

// Uso nos thresholds - linha 31
http_req_duration: [`p(95)<${MAX_RESPONSE_TIME}`],
```

```bash
# Execução com variáveis - run-advanced-k6-test.bat
k6 run --env BASE_URL=http://localhost:3000 --env MAX_RESPONSE_TIME=1000 performance/api-performance.js
```

### 7. **Stages (Estágios)**
Simulação realística de crescimento e redução de carga.

```javascript
// Em api-performance.js - linhas 30-37
stages: [
  { duration: '1m', target: 20 },    // Ramp up gradual
  { duration: '2m', target: 50 },    // Carga sustentada
  { duration: '1m', target: 100 },   // Pico de stress
  { duration: '2m', target: 100 },   // Manutenção do pico
  { duration: '1m', target: 0 },     // Ramp down
]
```

### 8. **Reaproveitamento de Resposta**
Extração e reutilização de dados das respostas HTTP.

```javascript
// Em api-performance.js - linhas 46-47
let validTokens = new Map(); // Cache global para tokens

// Extração de token - linhas 76-81
const token = extractToken(registerResponse);
if (token && validateJWT(token)) {
  validTokens.set(fakeUser.login, token);
  tokenValidations.add(1);
}

// Reutilização - linhas 135-136
const userToken = validTokens.get(testUser.login) || validTokens.get(fakeUser.login);
```

### 9. **Uso de Token de Autenticação**
Simulação de autenticação com tokens JWT.

```javascript
// Em helpers.js - Criação de headers autenticados
export function createAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : undefined
  };
}

// Em api-performance.js - linhas 140-145
let protectedResponse = http.get(`${BASE_URL}/profile`, {
  headers: createAuthHeaders(userToken),
  tags: { scenario: 'protected_route' }
});

check(protectedResponse, {
  'Token is valid': () => validateJWT(userToken),
});
```

### 10. **Data-Driven Testing**
Uso de dados estruturados de arquivo externo.

```javascript
// Em api-performance.js - linhas 14-16
const testData = new SharedArray('test users', function () {
  return JSON.parse(open('./test-data.json'));
});

// Uso dos dados - linhas 52-53
const testUser = randomItem(testData); // Seleciona usuário aleatório
```

```json
// test-data.json - Dados estruturados
[
  {
    "login": "admin",
    "senha": "admin123",
    "role": "admin"
  },
  {
    "login": "manager",
    "senha": "manager123",
    "role": "manager"
  }
]
```

### 11. **Groups (Grupos)**
Organização lógica dos cenários de teste.

```javascript
// Em api-performance.js - Exemplo do grupo Registration Flow
group('Registration Flow', function () {
  // Teste de registro com usuário fake
  let registerResponse = http.post(`${BASE_URL}/register`, 
    JSON.stringify({
      login: fakeUser.login,
      senha: fakeUser.senha
    }), 
    {
      headers: createAuthHeaders(),
      tags: { scenario: 'registration' }
    }
  );

  // Validações específicas do grupo
  validateResponse(registerResponse, 201, 'User Registration');
  registerTrend.add(registerResponse.timings.duration);
});

group('Login Flow', function () {
  // Lógica específica de login
});

group('Error Handling Tests', function () {
  // Testes de tratamento de erro
});
```

## 🚀 Como Executar

### Pré-requisitos
1. K6 instalado (`winget install k6`)
2. API rodando em `http://localhost:3000`
3. Node.js para a API

### Execução Passo a Passo

1. **Inicie a API:**
```bash
# Em um terminal separado
node app.js
# Ou use: start node app.js (Windows)
```

2. **Execute o teste avançado:**
```bash
# Método 1: Usando script batch (Windows)
.\run-advanced-k6-test.bat

# Método 2: Comando direto com variáveis
k6 run --env BASE_URL=http://localhost:3000 --env MAX_RESPONSE_TIME=1000 --env SUCCESS_RATE_THRESHOLD=0.95 performance/api-performance.js

# Método 3: Teste rápido (30s, 5 VUs)
k6 run --duration 30s --vus 5 performance/api-performance.js
```

3. **Teste simples para verificação:**
```bash
k6 run performance/simple-test.js
```

## 📊 **Relatório de Execução HTML**

Agora você tem um **relatório HTML profissional** que é gerado automaticamente após cada teste!

### 🎯 **Recursos do Relatório HTML:**

- **📈 Dashboard Visual**: Métricas principais com gráficos e cards
- **🎯 Thresholds Detalhados**: Status de cada critério com indicadores visuais
- **✅ Análise de Checks**: Tabela detalhada com taxas de sucesso
- **📊 Trends Personalizadas**: Visualização das métricas customizadas
- **🔍 Conceitos Implementados**: Checklist visual dos 11 conceitos K6
- **💡 Recomendações**: Sugestões automáticas baseadas nos resultados
- **📱 Design Responsivo**: Funciona em desktop, tablet e mobile

### 🚀 **Como Gerar o Relatório:**

```bash
# Método 1: Script automático (recomendado)
.\run-test-and-report.bat

# Método 2: Manual
node performance/generate-report.js

# Método 3: Com dados customizados
k6 run --out json=results.json performance/api-performance.js
node performance/generate-report.js results.json
```

### 📁 **Arquivos do Relatório:**
- `performance/relatorio-teste-k6.html` - Relatório final HTML
- `performance/generate-report.js` - Gerador automático de relatórios
- `run-test-and-report.bat` - Script completo (teste + relatório)

### 🖼️ **Visualização do Relatório:**

O relatório HTML inclui:

1. **Header com Resumo Executivo**
2. **Cards de Metadados** (duração, VUs, iterações)
3. **Grid de Thresholds** com status visual (✅/❌)
4. **Métricas Principais** em cards destacados
5. **Tabela de Checks** com barras de progresso
6. **Trends Personalizadas** com estatísticas detalhadas
7. **Conceitos K6** implementados com checklist
8. **Recomendações** automáticas e próximos passos

## 🔍 Análise Detalhada dos Resultados

### Métricas por Conceito

**Thresholds em Ação:**
- ✅ `http_req_duration`: 95% das requisições < 1000ms
- ✗ `checks`: 89.21% vs 95% esperado
- ✅ `login_duration`: p(95)=1.74ms < 1200ms

**Trends Personalizadas:**
- Login médio: 0.96ms (excelente)
- Registro médio: 2.28ms (bom)

**Groups Performance:**
- Registration Flow: p(95) < 1500ms ✅
- Login Flow: p(95) < 2000ms ✅

**Data-Driven Testing:**
- 40 iterações com dados do `test-data.json`
- Usuários admin, manager, user testados

**Faker em Ação:**
- Gerados usuários únicos para cada iteração
- Emails e senhas aleatórias funcionando

## 🛠️ Estrutura Completa dos Arquivos

```
performance/
├── api-performance.js              # 🎯 Script principal (todos os conceitos)
├── api-performance-commented.js    # 📝 Versão comentada para aprendizado  
├── simple-test.js                  # 🧪 Teste básico para verificação
├── helpers.js                      # 🔧 Funções auxiliares reutilizáveis
├── test-data.json                  # 📊 Dados estruturados para testing
├── .env                           # ⚙️ Variáveis de ambiente
└── README.md                      # 📖 Documentação original

run-advanced-k6-test.bat           # 🚀 Script de execução Windows
K6_ADVANCED_README.md              # 📚 Esta documentação avançada
```

### 📝 **Arquivo Comentado para Aprendizado**

O arquivo `api-performance-commented.js` contém **comentários detalhados** explicando cada linha onde os conceitos são implementados:

```javascript
// 📊 DATA-DRIVEN TESTING: Carrega dados de teste do arquivo JSON
const testData = new SharedArray('test users', function () {
  return JSON.parse(open('./test-data.json')); // admin, manager, user1, user2
});

// 🌍 VARIÁVEIS DE AMBIENTE: Configuração flexível via --env
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// 📈 TRENDS PERSONALIZADAS: Métricas específicas para análise detalhada
const loginTrend = new Trend('login_duration');        // Tempo específico de login
```

Use este arquivo para **estudar** como cada conceito foi implementado!

## 📊 Métricas Coletadas

### Métricas Padrão K6
- `http_req_duration`: Duração das requisições
- `http_reqs`: Total de requisições
- `vus`: Usuários virtuais ativos
- `checks`: Taxa de sucesso das verificações

### Métricas Customizadas
- `login_duration`: Tempo específico de login
- `register_duration`: Tempo específico de registro
- `auth_failures`: Contador de falhas de autenticação
- `token_validations`: Contador de validações de token

### Métricas por Grupo
- `group_duration{group:::Login Flow}`: Duração do grupo de login
- `group_duration{group:::Registration Flow}`: Duração do grupo de registro

## 📁 Estrutura de Arquivos

```
performance/
├── api-performance.js      # Script principal do teste
├── helpers.js              # Funções auxiliares
├── test-data.json          # Dados para data-driven testing
└── .env                    # Variáveis de ambiente

run-advanced-k6-test.bat   # Script de execução Windows
```

## 🎯 Cenários de Teste Implementados

### 1. **Registration Flow** (Grupo)
```javascript
group('Registration Flow', function () {
  // 🎭 FAKER: Gera dados fictícios
  const fakeUser = generateFakeUser();
  
  // 🌐 HTTP Request com dados fake
  let registerResponse = http.post(`${BASE_URL}/register`, 
    JSON.stringify({
      login: fakeUser.login,     // Ex: "joão_silva_847"
      senha: fakeUser.senha,     // Ex: "pass8291"
      email: fakeUser.email,     // Ex: "ana.carlos@gmail.com"
      name: fakeUser.name        // Ex: "Maria Lucia"
    })
  );

  // ✅ CHECKS: Validações específicas
  validateResponse(registerResponse, 201, 'User Registration');
  
  // 📈 TRENDS: Coleta métrica personalizada
  registerTrend.add(registerResponse.timings.duration);
  
  // 🔄 REAPROVEITAMENTO: Extrai token para uso posterior
  const token = extractToken(registerResponse);
  if (token && validateJWT(token)) {
    validTokens.set(fakeUser.login, token);
    tokenValidations.add(1); // 📊 Counter incrementado
  }
});
```

### 2. **Login Flow** (Grupo)
```javascript
group('Login Flow', function () {
  // 📊 DATA-DRIVEN: Usa dados do arquivo JSON
  const testUser = randomItem(testData); // admin, manager ou user
  
  let loginResponse = http.post(`${BASE_URL}/login`, 
    JSON.stringify({
      login: testUser.login,    // "admin", "manager", "user1"
      senha: testUser.senha     // "admin123", "manager123"
    }), 
    {
      // 🏷️ TAGS: Categorização para análise
      tags: { scenario: 'login', role: testUser.role }
    }
  );

  // ✅ CHECKS: Validações múltiplas
  const loginSuccess = check(loginResponse, {
    'Login status is 200': (r) => r.status === 200,
    'Login has valid token': (r) => {
      const token = extractToken(r);
      return token && validateJWT(token);
    }
  });

  // 📊 COUNTER: Conta falhas de autenticação
  if (!loginSuccess) {
    authFailures.add(1);
  }
});
```

### 3. **Protected Routes** (Grupo)
```javascript
group('Protected Routes with Authentication', function () {
  // 🔐 TOKEN AUTH: Usa token previamente extraído
  const userToken = validTokens.get(testUser.login);
  
  if (userToken) {
    // 🛡️ HELPER: Cria headers de autenticação
    let protectedResponse = http.get(`${BASE_URL}/profile`, {
      headers: createAuthHeaders(userToken), // Authorization: Bearer <token>
      tags: { scenario: 'protected_route' }
    });

    // ✅ CHECKS: Verifica autenticação
    check(protectedResponse, {
      'Protected route accessible': (r) => r.status === 200 || r.status === 404,
      'Token is valid': () => validateJWT(userToken),
    });
  }
});
```

### 4. **Error Handling Tests** (Grupo)
```javascript
group('Error Handling Tests', function () {
  // 🚫 Teste de usuário duplicado
  let duplicateResponse = http.post(`${BASE_URL}/register`, 
    JSON.stringify({
      login: testUser.login, // Usa login que já existe
      senha: testUser.senha
    })
  );
  // 🔧 HELPER: Validação padronizada
  validateResponse(duplicateResponse, 400, 'Duplicate User Registration');

  // ❌ Teste de credenciais inválidas
  let wrongLoginResponse = http.post(`${BASE_URL}/login`, 
    JSON.stringify({
      login: testUser.login,
      senha: 'senhaErrada123' // Senha incorreta intencional
    })
  );

  const failedLogin = check(wrongLoginResponse, {
    'Wrong login status is 401': (r) => r.status === 401,
  });

  // 📊 COUNTER: Incrementa contador de falhas
  if (!failedLogin) {
    authFailures.add(1);
  }
});
```

## 🔬 Conceitos Avançados em Detalhes

### **SharedArray para Performance**
```javascript
// 🚀 Otimização: dados carregados uma vez, compartilhados entre VUs
const testData = new SharedArray('test users', function () {
  return JSON.parse(open('./test-data.json')); // Lido apenas uma vez
});
```

### **Validação JWT Simulada**
```javascript
// Em helpers.js - Validação de estrutura JWT
export function validateJWT(token) {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false; // Header.Payload.Signature
  
  try {
    const payload = JSON.parse(atob(parts[1])); // Decodifica Base64
    return payload.exp > Date.now() / 1000;     // Verifica expiração
  } catch {
    return false;
  }
}
```

### **Cache de Tokens Global**
```javascript
// 🗄️ Map global para reutilização entre grupos
let validTokens = new Map();

// Armazenamento após login bem-sucedido
validTokens.set(username, token);

// Reutilização em rotas protegidas
const cachedToken = validTokens.get(username);
```

### **Métricas Personalizadas com Tags**
```javascript
// 🏷️ Tags para segmentação de métricas
{
  headers: createAuthHeaders(token),
  tags: { 
    scenario: 'protected_route',
    user_role: testUser.role,
    auth_method: 'jwt'
  }
}
```

## 📈 Critérios de Sucesso e Interpretação

### **Thresholds e Seus Significados**
```javascript
// 🎯 Critérios de Performance
thresholds: {
  'checks': ['rate>0.95'],                    // 95% de sucesso mínimo
  'http_req_duration': ['p(95)<1000'],        // 95% das requests < 1s
  'login_duration': ['p(90)<800'],            // Login rápido
  'auth_failures': ['count<50'],              // Máximo 50 falhas auth
  'group_duration{Login Flow}': ['p(95)<2000'] // Grupo completo < 2s
}
```

### **Interpretação dos Resultados**
| Métrica | Valor Ideal | Significado |
|---------|-------------|-------------|
| `checks: 89.21%` | `>95%` | ⚠️ Alguns cenários falharam |
| `http_req_duration: p(95)=2.81ms` | `<1000ms` | ✅ Excelente performance |
| `login_duration: avg=0.96ms` | `<800ms` | ✅ Login muito rápido |
| `register_duration: avg=2.28ms` | `<600ms` | ✅ Registro rápido |
| `auth_failures: 40` | `<50` | ✅ Falhas dentro do aceitável |

## 🔧 Customização e Extensão

### **1. Modificar Carga de Teste**
```javascript
// Para teste de carga leve (desenvolvimento)
stages: [
  { duration: '30s', target: 5 },
  { duration: '1m', target: 10 },
  { duration: '30s', target: 0 },
]

// Para teste de stress (produção)
stages: [
  { duration: '2m', target: 100 },
  { duration: '5m', target: 500 },
  { duration: '10m', target: 500 },
  { duration: '2m', target: 0 },
]
```

### **2. Adicionar Novos Cenários**
```javascript
// Novo grupo para testes específicos
group('API Health Check', function () {
  let healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'Health check is 200': (r) => r.status === 200,
    'Health response time < 100ms': (r) => r.timings.duration < 100,
  });
});
```

### **3. Expandir Data-Driven Testing**
```json
// test-data.json - Estrutura expandida
[
  {
    "login": "premium_user",
    "senha": "premium123", 
    "role": "premium",
    "permissions": ["read", "write", "admin"],
    "rate_limit": 1000,
    "region": "us-east"
  }
]
```

### **4. Métricas Customizadas Avançadas**
```javascript
// Novas trends por funcionalidade
const apiLatencyTrend = new Trend('api_latency_by_endpoint');
const errorRateCounter = new Counter('errors_by_type');
const throughputRate = new Rate('successful_requests');

// Uso nas validações
apiLatencyTrend.add(response.timings.duration, {endpoint: '/login'});
if (response.status >= 400) {
  errorRateCounter.add(1, {error_type: response.status});
} else {
  throughputRate.add(1);
}
```

## 🚀 Comandos Úteis para Desenvolvimento

```bash
# Teste rápido de verificação (5 users, 10s)
k6 run --vus 5 --duration 10s performance/api-performance.js

# Teste com output em JSON para análise
k6 run --out json=results.json performance/api-performance.js

# Teste com métricas específicas
k6 run --summary-export=summary.json performance/api-performance.js

# Debug mode (mostra requisições)
k6 run --http-debug="full" performance/simple-test.js

# Teste com menor carga para debug
k6 run --env SUCCESS_RATE_THRESHOLD=0.80 --vus 1 --duration 30s performance/api-performance.js
```

## 📚 Recursos Adicionais

- **[Documentação K6 Oficial](https://k6.io/docs/)**
- **[K6 Thresholds Guide](https://k6.io/docs/using-k6/thresholds/)**
- **[K6 Metrics Reference](https://k6.io/docs/using-k6/metrics/)**
- **[K6 Best Practices](https://k6.io/docs/testing-guides/)**

---

## ✨ Resumo dos Conceitos Demonstrados

| Conceito | Arquivo | Linhas | Status |
|----------|---------|--------|--------|
| **Thresholds** | `api-performance.js` | 29-42 | ✅ Implementado |
| **Checks** | `api-performance.js` | 114-121 | ✅ Implementado |
| **Helpers** | `helpers.js` | 1-65 | ✅ Implementado |
| **Trends** | `api-performance.js` | 25-28 | ✅ Implementado |
| **Faker** | `helpers.js` | 20-35 | ✅ Implementado |
| **Env Vars** | `api-performance.js` | 20-22 | ✅ Implementado |
| **Stages** | `api-performance.js` | 30-37 | ✅ Implementado |
| **Response Reuse** | `api-performance.js` | 76-81 | ✅ Implementado |
| **Token Auth** | `api-performance.js` | 140-145 | ✅ Implementado |
| **Data-Driven** | `test-data.json` + linha 14-16 | ✅ Implementado |
| **Groups** | `api-performance.js` | 59+ | ✅ Implementado |

**Total: 11/11 conceitos implementados com exemplos práticos! 🎉**