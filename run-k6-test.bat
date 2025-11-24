@echo off
REM Script para executar K6 nativo no Windows
REM Este script facilita a execução dos testes de performance

echo Executando teste de performance com K6...
echo Certifique-se de que a API está rodando em http://localhost:3000
echo.

REM Tenta primeiro o comando k6 global, se não funcionar usa o caminho específico
k6 run performance/api-performance.js 2>nul || "C:\Program Files\k6\k6.exe" run performance/api-performance.js

echo.
echo Teste concluído!
pause