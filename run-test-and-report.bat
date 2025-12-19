@echo off
echo ============================================
echo 📊 GERADOR DE RELATORIO K6 HTML
echo ============================================
echo.

echo ⚡ Executando teste K6 e gerando relatorio...
echo.

REM Executa o teste K6 avançado
echo 🔄 Executando teste de performance...
"C:\Program Files\k6\k6.exe" run --duration 30s --vus 5 performance/api-performance.js

echo.
echo 📈 Gerando relatorio HTML...

REM Gera o relatório HTML
node performance/generate-report.js

echo.
echo ✅ Processo concluído!
echo.
echo 📁 Relatório disponível em: performance/relatorio-teste-k6.html
echo 🌐 Abra o arquivo no navegador para visualizar
echo.

REM Pergunta se deseja abrir o relatório automaticamente
set /p open="Deseja abrir o relatório automaticamente? (s/n): "
if /i "%open%"=="s" (
    echo 🚀 Abrindo relatório no navegador...
    start "" "performance/relatorio-teste-k6.html"
)

echo.
echo Pressione qualquer tecla para continuar...
pause >nul