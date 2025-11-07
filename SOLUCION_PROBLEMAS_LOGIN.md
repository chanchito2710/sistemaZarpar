# 🔧 Solución de Problemas de Login

## 📋 Problema Original

El login se quedaba trabado en "Iniciando sesión..." y nunca completaba la autenticación.

### Causas Identificadas:
1. **Puerto 3456 ocupado**: Procesos incorrectos (PowerShell en lugar de Node.js) ocupaban el puerto del backend
2. **Contraseñas incorrectas**: Los hashes de las contraseñas no coincidían con las credenciales esperadas

---

## ✅ Soluciones Implementadas

### 1. Script de Limpieza Automática de Puertos

**Archivo**: `scripts/clean-ports.ps1`

Este script limpia automáticamente los puertos 3456 y 5678 antes de iniciar el sistema.

**Uso manual**:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/clean-ports.ps1
```

### 2. Script de Inicio Seguro

**Archivo**: `START-SAFE.bat`

Este script ejecuta automáticamente la limpieza de puertos antes de iniciar el sistema.

**Uso**:
```bash
./START-SAFE.bat
```

**Qué hace**:
1. Limpia puertos 3456 y 5678
2. Verifica que MySQL Docker esté corriendo
3. Inicia el sistema con `npm run dev`

### 3. Reseteo de Contraseñas

**Archivo**: `database/reset_passwords.sql`

Script SQL con todas las contraseñas correctamente hasheadas.

**Contraseñas incluidas**:
- `admin@zarparuy.com` / `admin123`
- `pando@zarparuy.com` / `pando123`
- `maldonado@zarparuy.com` / `maldonado123`
- `rivera@zarparuy.com` / `rivera123`
- `melo@zarparuy.com` / `melo123`
- `paysandu@zarparuy.com` / `paysandu123`
- `salto@zarparuy.com` / `salto123`
- `tacuarembo@zarparuy.com` / `tacuarembo123`

**Uso manual**:
```bash
# Opción 1: PowerShell
powershell -ExecutionPolicy Bypass -File scripts/reset-passwords.ps1

# Opción 2: Docker directo
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase < database/reset_passwords.sql
```

### 4. Generador de Hashes

**Archivo**: `scripts/generate-all-hashes.mjs`

Script Node.js para generar hashes de contraseñas correctos usando bcryptjs.

**Uso**:
```bash
node scripts/generate-all-hashes.mjs
```

---

## 🚀 Cómo Prevenir el Problema

### Método 1: Usar START-SAFE.bat (Recomendado)

En lugar de usar `npm run dev`, usa:

```bash
./START-SAFE.bat
```

Este script se encarga de:
- ✅ Limpiar puertos automáticamente
- ✅ Verificar Docker MySQL
- ✅ Iniciar el sistema limpiamente

### Método 2: Limpiar Manualmente Antes de Iniciar

Si prefieres usar `npm run dev`, primero ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/clean-ports.ps1
npm run dev
```

### Método 3: Reiniciar con "rs" en nodemon

Si el sistema ya está corriendo pero el backend no responde:

1. Ve a la terminal donde corre `npm run dev`
2. Escribe: `rs`
3. Presiona Enter
4. Espera a ver: `✅ Conexión exitosa a MySQL`

---

## 🔍 Diagnóstico de Problemas

### Síntoma: Login se queda en "Iniciando sesión..."

**Verificar**:

1. **¿Backend está corriendo?**
   ```powershell
   netstat -ano | findstr ":3456"
   ```
   Debe mostrar un proceso LISTENING en puerto 3456

2. **¿Es Node.js el que está corriendo?**
   ```powershell
   $pid = (netstat -ano | Select-String "LISTENING.*3456" | Select-Object -First 1) -replace '.*\s+(\d+)\s*$', '$1'
   Get-Process -Id $pid
   ```
   Debe mostrar ProcessName = "node" (NO "pwsh" ni "powershell")

3. **¿MySQL está corriendo?**
   ```bash
   docker ps | findstr "zarpar-mysql"
   ```
   Debe mostrar el contenedor UP

4. **¿Las contraseñas son correctas?**
   ```bash
   # Probar login desde terminal
   curl -X POST http://localhost:3456/api/auth/login ^
     -H "Content-Type: application/json" ^
     -d "{\"email\":\"admin@zarparuy.com\",\"password\":\"admin123\"}"
   ```
   Debe retornar un token, NO error 401

---

## 🛠️ Soluciones Rápidas

### Problema: Puerto 3456 ocupado por proceso incorrecto

**Solución**:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/clean-ports.ps1
```

### Problema: Contraseña no funciona

**Solución**:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/reset-passwords.ps1
```

### Problema: Backend no se inicia

**Solución**:
1. Presiona `Ctrl+C` en la terminal de `npm run dev`
2. Ejecuta `./START-SAFE.bat`

### Problema: MySQL no responde

**Solución**:
```bash
docker restart zarpar-mysql
# Esperar 30 segundos
docker exec zarpar-mysql mysql -u root -pzarpar2025 -e "SELECT 1;"
```

---

## 📊 Checklist de Verificación

Antes de reportar un problema, verifica:

```
[ ] Docker Desktop está corriendo
[ ] Contenedor zarpar-mysql está UP (docker ps)
[ ] Puerto 3456 está libre o ocupado por Node.js
[ ] Puerto 5678 está libre o ocupado por Vite
[ ] Credenciales son correctas (admin@zarparuy.com / admin123)
[ ] Backend muestra "✅ Conexión exitosa a MySQL"
[ ] Frontend carga en http://localhost:5678
```

---

## 🎯 Comandos Útiles

### Verificar Estado Completo
```powershell
# Ver todos los puertos del sistema
netstat -ano | findstr "5678 3456 3307"

# Ver procesos Node
Get-Process node

# Ver contenedores Docker
docker ps

# Ver logs del backend (en la terminal de npm run dev)
# Los logs aparecen automáticamente con prefijo [1]
```

### Reiniciar Todo el Sistema
```powershell
# Opción 1: Segura
Ctrl+C en terminal de npm run dev
./START-SAFE.bat

# Opción 2: Manual
Ctrl+C en terminal de npm run dev
powershell -ExecutionPolicy Bypass -File scripts/clean-ports.ps1
npm run dev
```

### Backup de Emergencia
```bash
# Hacer backup de la BD antes de resetear contraseñas
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 zarparDataBase > backup_antes_reset.sql
```

---

## 💡 Tips de Prevención

1. **Siempre usa START-SAFE.bat**: Es la forma más segura de iniciar el sistema
2. **No cierres la terminal bruscamente**: Usa `Ctrl+C` para detener npm run dev correctamente
3. **Verifica Docker antes de iniciar**: Asegúrate de que Docker Desktop esté corriendo
4. **Mantén backups**: Haz backups periódicos de la base de datos
5. **Usa "rs" para reiniciar**: Si el backend falla, escribe "rs" en lugar de reiniciar todo

---

## 📞 Soporte

Si el problema persiste después de seguir estos pasos:

1. Revisa los logs en la terminal (busca mensajes de error en rojo)
2. Verifica el archivo `.env` (debe tener las variables correctas)
3. Asegúrate de que no hay firewalls bloqueando los puertos
4. Reinicia Docker Desktop si es necesario

---

**Última actualización**: 5 de Noviembre, 2025
**Versión**: 1.0.0



