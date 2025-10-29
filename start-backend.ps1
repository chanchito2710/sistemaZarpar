# Script para iniciar el backend de ZARPAR
Write-Host "🔧 Iniciando Backend ZARPAR en puerto 3456..." -ForegroundColor Green
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location $PSScriptRoot

# Verificar si MySQL está corriendo
$mysqlService = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue

if ($mysqlService -and $mysqlService.Status -eq "Running") {
    Write-Host "✅ MySQL está corriendo" -ForegroundColor Green
} else {
    Write-Host "⚠️  MySQL no está corriendo. Iniciando..." -ForegroundColor Yellow
    try {
        Start-Service -Name "MySQL80" -ErrorAction Stop
        Write-Host "✅ MySQL iniciado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ No se pudo iniciar MySQL. Necesitas ejecutar como Administrador" -ForegroundColor Red
        Write-Host "   O inicia MySQL manualmente desde XAMPP/MySQL Workbench" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Iniciando servidor backend..." -ForegroundColor Cyan

# Iniciar el servidor de desarrollo
npm run server:dev

# Mantener la ventana abierta en caso de error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al iniciar el backend" -ForegroundColor Red
    Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}


