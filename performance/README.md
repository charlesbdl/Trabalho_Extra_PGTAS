# Testes de Performance com K6

Este diretório contém testes de performance para a API de login usando K6.

## Instalação do K6

### Windows
```powershell
# Via WinGet (Recomendado)
winget install k6 --source winget

# Ou via Chocolatey
choco install k6
```

### Linux/macOS
```bash
# Via brew
brew install k6

# Via snap (Linux)
sudo snap install k6
```

## Como executar os testes

### Pré-requisitos
- K6 instalado no sistema
- API rodando em `http://localhost:3000`

### Execução

1. **Certifique-se de que a API está rodando:**
   ```bash
   npm start
   ```

2. **Execute o teste de performance:**

   **Windows (Recomendado - usando script):**
   ```powershell
   # Execute o script batch (sempre funciona)
   .\run-k6-test.bat
   ```
   
   **Se quiser usar k6 diretamente:**
   ```powershell
   # Primeiro, adicione K6 ao PATH (execute uma vez apenas)
   .\add-k6-to-path.bat
   
   # Reinicie o PowerShell, depois pode usar:
   k6 run performance/api-performance.js
   
   # Ou use o caminho completo (note o & no início):
   & "C:\Program Files\k6\k6.exe" run performance/api-performance.js
   ```

   **Linux/macOS:**
   ```bash
   # Execute o script bash
   ./run-k6-test.sh
   
   # Ou diretamente
   k6 run performance/api-performance.js
   ```

## O que o teste faz

O teste simula múltiplos usuários fazendo as seguintes operações:

- **Registro de usuário** (`POST /register`)
- **Login com credenciais corretas** (`POST /login`)
- **Tentativa de registro duplicado** (deve retornar erro 400)
- **Tentativa de login com senha incorreta** (deve retornar erro 401)

## Configurações do teste

- **Ramp-up:** 10 usuários em 30 segundos
- **Load:** 50 usuários por 1 minuto
- **Ramp-down:** Volta para 0 usuários em 30 segundos

## Métricas analisadas

- **Tempo de resposta:** 95% das requisições devem ser < 1 segundo
- **Taxa de erro:** Deve ser < 10%
- **Throughput:** Requisições por segundo
- **Response time:** Tempo médio, mínimo e máximo de resposta

## Interpretando os resultados

Após a execução, você verá métricas como:
- `http_req_duration`: Tempo de resposta das requisições
- `http_req_failed`: Porcentagem de requisições que falharam
- `http_reqs`: Total de requisições feitas
- `vus`: Número de usuários virtuais ativos

## Customização

Para ajustar o teste, modifique as configurações em `api-performance.js`:
- Altere `stages` para diferentes padrões de carga
- Modifique `thresholds` para critérios de performance mais ou menos rigorosos
- Adicione novos cenários de teste conforme necessário