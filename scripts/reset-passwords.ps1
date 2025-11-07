# Script para resetear todas las contraseñas de usuarios
# Garantiza que las contraseñas estén correctas

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🔐 RESETEO DE CONTRASEÑAS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "Aplicando contraseñas correctas..." -ForegroundColor Yellow
Write-Host ""

# Leer el archivo SQL y ejecutarlo
$sqlContent = Get-Content "database/reset_passwords.sql" -Raw

# Ejecutar el SQL en el contenedor Docker
$sqlContent | docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Todas las contraseñas actualizadas exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Credenciales disponibles:" -ForegroundColor Cyan
    Write-Host "  • admin@zarparuy.com / admin123" -ForegroundColor Gray
    Write-Host "  • pando@zarparuy.com / pando123" -ForegroundColor Gray
    Write-Host "  • maldonado@zarparuy.com / maldonado123" -ForegroundColor Gray
    Write-Host "  • rivera@zarparuy.com / rivera123" -ForegroundColor Gray
    Write-Host "  • melo@zarparuy.com / melo123" -ForegroundColor Gray
    Write-Host "  • paysandu@zarparuy.com / paysandu123" -ForegroundColor Gray
    Write-Host "  • salto@zarparuy.com / salto123" -ForegroundColor Gray
    Write-Host "  • tacuarembo@zarparuy.com / tacuarembo123" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error al actualizar contraseñas" -ForegroundColor Red
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""



