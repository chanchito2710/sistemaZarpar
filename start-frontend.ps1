# Script para iniciar el frontend de ZARPAR
Write-Host "🚀 Iniciando Frontend ZARPAR en puerto 5678..." -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location $PSScriptRoot

# Iniciar el servidor de desarrollo
npm run client:dev

# Mantener la ventana abierta en caso de error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al iniciar el frontend" -ForegroundColor Red
    Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}


