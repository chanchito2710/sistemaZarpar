@echo off
echo.
echo ============================================================
echo   INICIO SEGURO - SISTEMA ZARPAR
echo ============================================================
echo.
echo Limpiando puertos antes de iniciar...
echo.

REM Ejecutar script de limpieza de puertos
powershell -ExecutionPolicy Bypass -File scripts/clean-ports.ps1

echo.
echo Verificando MySQL Docker...
docker ps | findstr "zarpar-mysql" >nul
if errorlevel 1 (
    echo.
    echo ERROR: MySQL Docker no esta corriendo
    echo Por favor inicia Docker Desktop y ejecuta:
    echo   docker start zarpar-mysql
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando sistema...
echo.
npm run dev



