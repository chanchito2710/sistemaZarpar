# 🚀 START FRESH - Iniciar Sistema Limpio
# Este script garantiza un inicio completamente limpio del sistema

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 INICIO LIMPIO DEL SISTEMA ZARPAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Matar procesos Node
Write-Host "🛑 Paso 1: Deteniendo procesos Node..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Procesos detenidos" -ForegroundColor Green
Write-Host ""

# Paso 2: Limpiar cachés
Write-Host "🧹 Paso 2: Limpiando cachés..." -ForegroundColor Yellow
Remove-Item -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".tsx" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cachés limpiados" -ForegroundColor Green
Write-Host ""

# Paso 3: Verificar MySQL
Write-Host "🐳 Paso 3: Verificando MySQL..." -ForegroundColor Yellow
$mysqlStatus = docker ps --filter "name=zarpar-mysql" --format "{{.Status}}"
if ($mysqlStatus -like "*Up*") {
    Write-Host "✅ MySQL está corriendo" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL NO está corriendo. Iniciando..." -ForegroundColor Red
    docker start zarpar-mysql | Out-Null
    Write-Host "⏳ Esperando 20 segundos a que MySQL inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
    Write-Host "✅ MySQL iniciado" -ForegroundColor Green
}
Write-Host ""

# Paso 4: Probar conexión a MySQL
Write-Host "🔌 Paso 4: Probando conexión a MySQL..." -ForegroundColor Yellow
$testResult = docker exec zarpar-mysql mysqladmin ping -u root -pzarpar2025 2>&1
if ($testResult -like "*mysqld is alive*") {
    Write-Host "✅ MySQL responde correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL no responde aún. Esperando 10 segundos más..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host "✅ Continuando..." -ForegroundColor Green
}
Write-Host ""

# Paso 5: Iniciar sistema
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ SISTEMA LISTO PARA INICIAR" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Ejecutando: npm run dev" -ForegroundColor Yellow
Write-Host ""

# Iniciar npm run dev
npm run dev

