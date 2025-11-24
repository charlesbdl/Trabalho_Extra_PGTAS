@echo off
REM Script alternativo para executar K6 encontrando o executável

echo Procurando pelo K6 instalado...

REM Tenta diferentes caminhos possíveis
set "K6_PATH1=C:\Users\%USERNAME%\AppData\Local\Microsoft\WinGet\Packages\GrafanaLabs.k6_Microsoft.Winget.Source_8wekyb3d8bbwe\k6.exe"
set "K6_PATH2=C:\Program Files\k6\k6.exe"
set "K6_PATH3=C:\Program Files (x86)\k6\k6.exe"

if exist "%K6_PATH1%" (
    echo Encontrado em: %K6_PATH1%
    "%K6_PATH1%" run performance/api-performance.js
    goto :end
)

if exist "%K6_PATH2%" (
    echo Encontrado em: %K6_PATH2%
    "%K6_PATH2%" run performance/api-performance.js
    goto :end
)

if exist "%K6_PATH3%" (
    echo Encontrado em: %K6_PATH3%
    "%K6_PATH3%" run performance/api-performance.js
    goto :end
)

echo K6 não encontrado! Tente reinstalar com:
echo winget install k6 --source winget
echo.
echo Ou baixe diretamente de: https://k6.io/docs/get-started/installation/

:end
echo.
echo Teste concluído!
pause