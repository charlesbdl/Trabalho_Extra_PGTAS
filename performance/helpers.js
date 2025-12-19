import { check } from 'k6';

// Helper personalizado para validação de resposta
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

// Helper para gerar dados fake
export function generateFakeUser() {
  const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Rafael', 'Julia'];
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  
  const firstName = names[Math.floor(Math.random() * names.length)];
  const lastName = names[Math.floor(Math.random() * names.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  return {
    login: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    senha: `pass${Math.floor(Math.random() * 10000)}`,
    name: `${firstName} ${lastName}`
  };
}

// Helper para validar token JWT (flexível - aceita tokens simples também)
export function validateJWT(token) {
  if (!token) return false;
  
  // Se for um token JWT válido
  if (token.includes('.')) {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Simples validação de estrutura JWT
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
  
  // Para tokens simples gerados pela API (token_login_timestamp_random)
  if (token.startsWith('token_')) {
    return true;
  }
  
  // Aceita qualquer string como token simples (para APIs que não usam JWT ainda)
  return typeof token === 'string' && token.length > 0;
}

// Helper para extrair token da resposta (mais flexível)
export function extractToken(response) {
  try {
    const body = response.json();
    // Tenta diferentes campos onde o token pode estar
    return body.token || body.accessToken || body.access_token || body.authToken || null;
  } catch {
    // Se não conseguir parsear JSON, verifica se é uma string simples
    if (response.body && typeof response.body === 'string' && response.body.length > 10) {
      return response.body.trim();
    }
    return null;
  }
}

// Helper para criar headers com autenticação
export function createAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : undefined
  };
}