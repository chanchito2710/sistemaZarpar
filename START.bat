@echo off
title Sistema ZARPAR - Iniciar Servidores
cls
echo.
echo ============================================
echo    SISTEMA ZARPAR - INICIAR SERVIDORES
echo ============================================
echo.
echo [1] Iniciar Frontend + Backend
echo [2] Iniciar solo Frontend
echo [3] Iniciar solo Backend
echo [4] Salir
echo.
set /p choice="Selecciona una opcion (1-4): "

if "%choice%"=="1" goto ambos
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto backend
if "%choice%"=="4" goto salir
goto inicio

:ambos
echo.
echo Iniciando Frontend y Backend...
start "ZARPAR Frontend" powershell -ExecutionPolicy Bypass -File "%~dp0start-frontend.ps1"
timeout /t 3 /nobreak >nul
start "ZARPAR Backend" powershell -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"
echo.
echo ✓ Servidores iniciados en ventanas separadas
echo.
echo Frontend: http://localhost:5678
echo Backend:  http://localhost:3456/api
echo.
pause
goto salir

:frontend
echo.
echo Iniciando Frontend...
start "ZARPAR Frontend" powershell -ExecutionPolicy Bypass -File "%~dp0start-frontend.ps1"
echo.
echo ✓ Frontend iniciado
echo   URL: http://localhost:5678
echo.
pause
goto salir

:backend
echo.
echo Iniciando Backend...
start "ZARPAR Backend" powershell -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"
echo.
echo ✓ Backend iniciado
echo   URL: http://localhost:3456/api
echo.
pause
goto salir

:salir
exit


