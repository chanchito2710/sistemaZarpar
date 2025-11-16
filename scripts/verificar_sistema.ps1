# =====================================================
# SCRIPT: Verificación Completa del Sistema
# =====================================================
# Uso: .\scripts\verificar_sistema.ps1
# =====================================================

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   VERIFICACIÓN COMPLETA DEL SISTEMA ZARPAR        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# =====================================================
# 1. Verificar Docker MySQL
# =====================================================
Write-Host "1️⃣  Verificando contenedor MySQL..." -ForegroundColor Yellow
$dockerStatus = docker ps --filter "name=zarpar-mysql" --format "{{.Status}}" 2>$null

if ($dockerStatus -match "Up") {
    Write-Host "   ✅ MySQL corriendo: $dockerStatus" -ForegroundColor Green
} else {
    Write-Host "   ❌ MySQL NO está corriendo" -ForegroundColor Red
    exit 1
}
Write-Host ""

# =====================================================
# 2. Verificar Tablas de Clientes
# =====================================================
Write-Host "2️⃣  Verificando tablas de clientes en BD..." -ForegroundColor Yellow
$tablas = docker exec -i zarpar-mysql mysql -u root -pzarpar2025 -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'zarparDataBase' AND TABLE_NAME LIKE 'clientes_%';" 2>$null | Select-Object -Skip 1

$tablasArray = $tablas -split "`n" | Where-Object { $_ -ne "" }
$totalTablas = $tablasArray.Count

Write-Host "   ✅ Total de sucursales: $totalTablas" -ForegroundColor Green
foreach ($tabla in $tablasArray) {
    Write-Host "      - $tabla" -ForegroundColor Cyan
}
Write-Host ""

# =====================================================
# 3. Verificar que Minas NO existe
# =====================================================
Write-Host "3️⃣  Verificando que 'Minas' fue eliminada..." -ForegroundColor Yellow
$minasExiste = docker exec -i zarpar-mysql mysql -u root -pzarpar2025 -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'zarparDataBase' AND TABLE_NAME = 'clientes_minas';" 2>$null | Select-Object -Skip 1

if ($minasExiste) {
    Write-Host "   ❌ ERROR: 'clientes_minas' aún existe" -ForegroundColor Red
} else {
    Write-Host "   ✅ 'clientes_minas' NO existe (correctamente eliminada)" -ForegroundColor Green
}
Write-Host ""

# =====================================================
# 4. Verificar Productos por Sucursal
# =====================================================
Write-Host "4️⃣  Verificando productos por sucursal..." -ForegroundColor Yellow
$productos = docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase -e "SELECT sucursal, COUNT(*) as total FROM productos_sucursal GROUP BY sucursal ORDER BY sucursal;" 2>$null | Select-Object -Skip 1

Write-Host ""
Write-Host "   Sucursal        | Productos" -ForegroundColor Cyan
Write-Host "   ----------------|----------" -ForegroundColor Cyan

$minProductos = 999
$maxProductos = 0

foreach ($linea in $productos) {
    $partes = $linea -split "\s+"
    if ($partes.Count -ge 2) {
        $sucursal = $partes[0]
        $total = [int]$partes[1]
        
        if ($total -lt $minProductos) { $minProductos = $total }
        if ($total -gt $maxProductos) { $maxProductos = $total }
        
        $color = if ($total -eq 4) { "Green" } else { "Yellow" }
        Write-Host ("   {0,-16}| {1}" -f $sucursal, $total) -ForegroundColor $color
    }
}

Write-Host ""
if ($minProductos -eq $maxProductos) {
    Write-Host "   ✅ Todas las sucursales tienen la misma cantidad de productos ($maxProductos)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Hay diferencias: Min=$minProductos, Max=$maxProductos" -ForegroundColor Yellow
    Write-Host "      (Esto puede ser normal si acabas de crear sucursales nuevas)" -ForegroundColor Gray
}
Write-Host ""

# =====================================================
# 5. Verificar Backend API
# =====================================================
Write-Host "5️⃣  Verificando respuesta de Backend API..." -ForegroundColor Yellow

try {
    $response = curl -s http://localhost:3456/api/sucursales | ConvertFrom-Json
    
    if ($response.success) {
        $totalSucursales = $response.data.Count
        Write-Host "   ✅ API responde correctamente" -ForegroundColor Green
        Write-Host "   ✅ Total sucursales devueltas: $totalSucursales" -ForegroundColor Green
        
        # Verificar si "minas" está en la lista
        $minasEnAPI = $response.data | Where-Object { $_.sucursal -eq "minas" }
        if ($minasEnAPI) {
            Write-Host "   ❌ ERROR: 'Minas' está en la respuesta de la API" -ForegroundColor Red
        } else {
            Write-Host "   ✅ 'Minas' NO está en la respuesta de la API" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ API respondió con error" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ No se pudo conectar con la API" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
}
Write-Host ""

# =====================================================
# 6. Verificar Vendedores por Sucursal
# =====================================================
Write-Host "6️⃣  Verificando vendedores por sucursal..." -ForegroundColor Yellow
$vendedores = docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase -e "SELECT sucursal, COUNT(*) as total FROM vendedores WHERE activo = 1 GROUP BY sucursal ORDER BY sucursal;" 2>$null | Select-Object -Skip 1

Write-Host ""
Write-Host "   Sucursal        | Vendedores" -ForegroundColor Cyan
Write-Host "   ----------------|------------" -ForegroundColor Cyan

foreach ($linea in $vendedores) {
    $partes = $linea -split "\s+"
    if ($partes.Count -ge 2) {
        $sucursal = $partes[0]
        $total = [int]$partes[1]
        
        $color = if ($total -gt 0) { "Green" } else { "Yellow" }
        Write-Host ("   {0,-16}| {1}" -f $sucursal, $total) -ForegroundColor $color
    }
}
Write-Host ""

# =====================================================
# 7. Verificar Servicios del Sistema
# =====================================================
Write-Host "7️⃣  Verificando servicios del sistema..." -ForegroundColor Yellow

# Verificar Frontend
$frontendRunning = netstat -ano | Select-String ":5678.*LISTENING"
if ($frontendRunning) {
    Write-Host "   ✅ Frontend corriendo en puerto 5678" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend NO está corriendo" -ForegroundColor Red
}

# Verificar Backend
$backendRunning = netstat -ano | Select-String ":3456.*LISTENING"
if ($backendRunning) {
    Write-Host "   ✅ Backend corriendo en puerto 3456" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NO está corriendo" -ForegroundColor Red
}

# Verificar MySQL
$mysqlRunning = netstat -ano | Select-String ":3307.*LISTENING"
if ($mysqlRunning) {
    Write-Host "   ✅ MySQL corriendo en puerto 3307" -ForegroundColor Green
} else {
    Write-Host "   ❌ MySQL NO está corriendo" -ForegroundColor Red
}
Write-Host ""

# =====================================================
# RESUMEN FINAL
# =====================================================
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              RESUMEN DE VERIFICACIÓN              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Sucursales totales: $totalTablas" -ForegroundColor Green
Write-Host "✅ 'Minas' eliminada: $(if (!$minasExiste) { 'Sí' } else { 'No' })" -ForegroundColor $(if (!$minasExiste) { 'Green' } else { 'Red' })
Write-Host "✅ Productos por sucursal: Min=$minProductos, Max=$maxProductos" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 URLs del Sistema:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5678" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3456/api" -ForegroundColor White
Write-Host "   MySQL:    localhost:3307" -ForegroundColor White
Write-Host ""

Write-Host "📝 Próximos Pasos:" -ForegroundColor Yellow
Write-Host "   1. Refrescar el navegador en /products (F5)" -ForegroundColor White
Write-Host "   2. Verificar que 'Minas' NO aparece en el selector" -ForegroundColor White
Write-Host "   3. Verificar que todas las sucursales tienen productos" -ForegroundColor White
Write-Host ""

Write-Host "✅ Verificación completa finalizada" -ForegroundColor Green
Write-Host ""

















