# 📁 Carpeta de Backups

Esta carpeta almacena los backups de la base de datos del sistema Zarpar.

## 🔐 Seguridad

- ⚠️ Los archivos `.sql` en esta carpeta están **IGNORADOS** por Git (ver `.gitignore`)
- ⚠️ **NO subir backups a repositorios públicos** - Contienen datos sensibles
- ✅ Los backups se guardan **SOLO localmente** o en el repositorio privado SQL

## 📋 Convención de Nombres

### Backups Automáticos:
```
backup_auto_2025-11-22T03-00-00.sql
```
- Prefijo: `backup_auto_`
- Formato fecha: `YYYY-MM-DDTHH-MM-SS`
- Se crean automáticamente a las 3:00 AM

### Backups Manuales:
```
backup_manual_2025-11-22T14-30-00.sql
```
- Prefijo: `backup_manual_`
- Formato fecha: `YYYY-MM-DDTHH-MM-SS`
- Se crean cuando el admin hace click en "BACKUP DEL SISTEMA"

## 🕐 Política de Retención

- **Máximo:** 7 días
- **Limpieza:** Automática (se ejecuta al crear cada backup)
- **Mínimo:** 1 backup (no se puede eliminar el último)

## 📦 Contenido

Cada backup incluye:
- ✅ Todas las tablas de la base de datos
- ✅ Estructura (schema)
- ✅ Datos (registros)
- ✅ Triggers y rutinas
- ✅ Charset UTF-8 (utf8mb4)

## 🔄 Restaurar Backup

### Desde la interfaz web:
1. Ir a `/admin/database`
2. Tab "Backups del Sistema"
3. Click en "Restaurar" del backup deseado

### Desde terminal:
```bash
# Desarrollo (Docker local)
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 --default-character-set=utf8mb4 zarparDataBase < backups/backup_FECHA.sql

# Producción (Railway)
railway run mysql -u root -p[PASSWORD] [DATABASE] < backups/backup_FECHA.sql
```

## 📊 Metadata

La información de cada backup se guarda en:
- **Tabla:** `backups_metadata`
- **Campos:** filename, tipo, nombre_personalizado, nota, tamaño, creado_por, fecha

## 📝 Logs

Todas las acciones se registran en:
- **Tabla:** `backup_logs`
- **Acciones:** crear, restaurar, eliminar, descargar

---

**Última actualización:** 22/11/2025

