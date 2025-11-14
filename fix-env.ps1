# 🔧 FIX ENV - Actualizar DB_HOST a 127.0.0.1

Write-Host "🔧 Actualizando archivo .env..." -ForegroundColor Yellow

$envFile = ".env"

if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    # Reemplazar localhost por 127.0.0.1
    $content = $content -replace 'DB_HOST=localhost', 'DB_HOST=127.0.0.1'
    
    # Guardar
    Set-Content -Path $envFile -Value $content -NoNewline
    
    Write-Host "✅ Archivo .env actualizado" -ForegroundColor Green
    Write-Host "   DB_HOST ahora es: 127.0.0.1" -ForegroundColor Cyan
} else {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
}

