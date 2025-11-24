@echo off
echo Adicionando K6 ao PATH do Windows...

REM Adiciona o diretório do K6 ao PATH do usuário atual
setx PATH "%PATH%;C:\Program Files\k6"

echo.
echo K6 adicionado ao PATH com sucesso!
echo Reinicie o PowerShell/CMD para que as mudanças tenham efeito.
echo.
echo Após reiniciar, você poderá usar:
echo   k6 version
echo   k6 run performance/api-performance.js
echo.
pause