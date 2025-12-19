@echo off
echo Executando teste K6 avançado com todos os conceitos...
echo.

REM Define variáveis de ambiente para o teste
set BASE_URL=http://localhost:3000
set MAX_RESPONSE_TIME=1000
set SUCCESS_RATE_THRESHOLD=0.95

echo Configuração do teste:
echo - Base URL: %BASE_URL%
echo - Max Response Time: %MAX_RESPONSE_TIME%ms
echo - Success Rate Threshold: %SUCCESS_RATE_THRESHOLD%
echo.

REM Executa o teste K6
"C:\Program Files\k6\k6.exe" run --env BASE_URL=%BASE_URL% --env MAX_RESPONSE_TIME=%MAX_RESPONSE_TIME% --env SUCCESS_RATE_THRESHOLD=%SUCCESS_RATE_THRESHOLD% performance/api-performance.js

echo.
echo Teste finalizado!