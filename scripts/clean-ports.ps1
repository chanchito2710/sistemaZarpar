# Script para limpiar puertos antes de iniciar el sistema
# Elimina procesos que ocupan los puertos 3456 y 5678

Write-Host ""
Write-Host "🧹 Limpiando puertos del sistema..." -ForegroundColor Cyan
Write-Host ""

# Función para limpiar un puerto específico
function Clean-Port {
    param (
        [int]$Port,
        [string]$ServiceName
    )
    
    Write-Host "🔍 Verificando puerto $Port ($ServiceName)..." -ForegroundColor Yellow
    
    # Buscar procesos en el puerto
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-Host "  ⚠️  Puerto $Port ocupado por: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
                Write-Host "  🛑 Deteniendo proceso..." -ForegroundColor Yellow
                
                try {
                    Stop-Process -Id $processId -Force -ErrorAction Stop
                    Write-Host "  ✅ Proceso detenido exitosamente" -ForegroundColor Green
                    Start-Sleep -Seconds 1
                } catch {
                    Write-Host "  ❌ Error al detener proceso: $_" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "  ✅ Puerto $Port está libre" -ForegroundColor Green
    }
}

# Limpiar puerto 3456 (Backend)
Clean-Port -Port 3456 -ServiceName "Backend API"

# Limpiar puerto 5678 (Frontend)
Clean-Port -Port 5678 -ServiceName "Frontend Vite"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Limpieza completada - Puertos listos para usar" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""







