# 📦 BACKUPS DE BASE DE DATOS - SISTEMA ZARPAR

## 🎯 PROPÓSITO

Este directorio contiene los backups completos de la base de datos MySQL del Sistema Zarpar, organizados y listos para restauración en producción.

---

## 📂 ESTRUCTURA DE ARCHIVOS

### **Backups Completos** (Datos + Estructura)
```
backup_completo_produccion_YYYYMMDD_HHMMSS.sql
```
- ✅ **Contenido**: Estructura completa + TODOS los datos
- ✅ **Incluye**: Tablas, datos, rutinas, triggers, eventos
- ✅ **Charset**: UTF-8 (utf8mb4)
- ✅ **Uso**: Restauración completa del sistema

### **Schema Only** (Solo Estructura)
```
schema_produccion_YYYYMMDD_HHMMSS.sql
```
- ✅ **Contenido**: Solo estructura de tablas
- ✅ **Incluye**: CREATE TABLE, rutinas, triggers, eventos
- ❌ **NO incluye**: Datos (INSERT)
- ✅ **Uso**: Crear base de datos vacía o comparar estructuras

### **Migraciones**
```
migrations/
  ├── 001_create_transferencias_fixed.sql
  ├── 002_create_caja_system.sql
  └── ...
```
- ✅ Scripts incrementales para actualizar la BD
- ✅ Ejecutar en orden numérico

### **Scripts de Utilidad**
```
create_ventas_system.sql          # Sistema de ventas
fix_all_tipos.sql                 # Corrección de encoding
FIX_ALL_ENCODING_MAESTRO.sql      # Corrección masiva UTF-8
verificar_datos_corruptos.sql     # Auditoría de encoding
```

---

## 🚀 RESTAURAR BACKUP EN PRODUCCIÓN

### **Opción 1: Restauración Completa (Recomendado)**

```bash
# En el servidor de producción
docker exec -i zarpar-mysql mysql -u root -p[PASSWORD] --default-character-set=utf8mb4 < backup_completo_produccion_YYYYMMDD_HHMMSS.sql
```

### **Opción 2: Crear Base de Datos Nueva**

```bash
# 1. Crear base de datos vacía
docker exec -i zarpar-mysql mysql -u root -p[PASSWORD] -e "CREATE DATABASE zarparDataBase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Restaurar backup
docker exec -i zarpar-mysql mysql -u root -p[PASSWORD] --default-character-set=utf8mb4 zarparDataBase < backup_completo_produccion_YYYYMMDD_HHMMSS.sql
```

### **Opción 3: Solo Estructura (Base de Datos Vacía)**

```bash
docker exec -i zarpar-mysql mysql -u root -p[PASSWORD] --default-character-set=utf8mb4 zarparDataBase < schema_produccion_YYYYMMDD_HHMMSS.sql
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **1. Charset UTF-8 OBLIGATORIO**
```bash
# ✅ SIEMPRE usar --default-character-set=utf8mb4
docker exec -i zarpar-mysql mysql -u root -pPASSWORD --default-character-set=utf8mb4 ...

# ❌ NUNCA sin charset (causará problemas con acentos)
docker exec -i zarpar-mysql mysql -u root -pPASSWORD ...
```

### **2. Verificar Después de Restaurar**
```sql
-- Conectar a MySQL
docker exec -it zarpar-mysql mysql -u root -pPASSWORD

-- Verificar charset
SHOW VARIABLES LIKE 'char%';

-- Verificar tablas
USE zarparDataBase;
SHOW TABLES;

-- Verificar datos (acentos correctos)
SELECT nombre FROM clientes_pando LIMIT 5;
```

### **3. Backup Antes de Actualizar**
```bash
# SIEMPRE hacer backup antes de cualquier cambio
docker exec zarpar-mysql mysqldump -u root -pPASSWORD \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --routines --triggers --events \
  zarparDataBase > backup_pre_cambio_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📊 INFORMACIÓN DE LA BASE DE DATOS

### **Tablas Principales**

#### **Productos** (3 tablas)
- `productos` - Catálogo maestro
- `productos_sucursal` - Stock y precios por sucursal
- `categorias_productos` - Tipos, marcas, calidades

#### **Clientes** (Dinámicas por sucursal)
- `clientes_pando`
- `clientes_maldonado`
- `clientes_rivera`
- `clientes_melo`
- `clientes_paysandu`
- `clientes_salto`
- `clientes_tacuarembo`
- `clientes_rionegro`
- `clientes_sanisidro`
- ... (se crean dinámicamente)

#### **Ventas** (3 tablas)
- `ventas` - Ventas principales
- `ventas_detalle` - Líneas de productos vendidos
- `ventas_diarias_resumen` - Resúmenes agregados

#### **Caja** (2 tablas)
- `caja` - Saldo actual por sucursal
- `movimientos_caja` - Historial de movimientos

#### **Cuenta Corriente** (3 tablas)
- `cuenta_corriente_movimientos`
- `pagos_cuenta_corriente`
- `resumen_cuenta_corriente`

#### **Comisiones** (6 tablas)
- `comisiones_vendedores`
- `comisiones_por_vendedor`
- `configuracion_comisiones`
- `historial_cambios_comisiones`
- `historial_pagos_comisiones`
- `remanentes_comisiones`

#### **Staff** (2 tablas)
- `vendedores` - Usuarios y vendedores
- `configuracion_sucursales`

#### **Transferencias** (3 tablas)
- `transferencias`
- `transferencias_detalle`
- `historial_transferencias`

#### **Sistema** (1 tabla)
- `secuencias` - Números de venta

**TOTAL**: 30+ tablas (dinámicas según sucursales)

---

## 🔧 CREAR BACKUP MANUAL

### **Backup Completo**
```bash
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --routines --triggers --events \
  zarparDataBase > backup_completo_$(date +%Y%m%d_%H%M%S).sql
```

### **Solo Esquema**
```bash
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 \
  --default-character-set=utf8mb4 \
  --no-data \
  --routines --triggers --events \
  zarparDataBase > schema_$(date +%Y%m%d_%H%M%S).sql
```

### **Tablas Específicas**
```bash
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 \
  --default-character-set=utf8mb4 \
  zarparDataBase productos productos_sucursal > backup_productos.sql
```

---

## 📅 HISTORIAL DE BACKUPS

| Fecha | Archivo | Descripción |
|-------|---------|-------------|
| 2025-11-14 | backup_completo_produccion_20251114_*.sql | Backup completo para producción - Sistema con seguridad completa |
| 2025-11-14 | schema_produccion_20251114_*.sql | Esquema completo para referencia |

---

## 🔐 SEGURIDAD

### ⚠️ NUNCA:
- ❌ Subir backups a repositorios públicos
- ❌ Compartir backups sin encriptar
- ❌ Dejar backups en servidores accesibles públicamente

### ✅ SIEMPRE:
- ✅ Guardar backups en almacenamiento seguro
- ✅ Encriptar backups sensibles
- ✅ Mantener múltiples copias (3-2-1 rule)
- ✅ Verificar integridad después de restaurar

---

## 📞 SOPORTE

Si tienes problemas restaurando un backup:

1. Verifica que Docker está corriendo
2. Verifica que el contenedor MySQL está activo
3. Verifica que el archivo backup existe
4. Verifica que usas `--default-character-set=utf8mb4`
5. Revisa logs: `docker logs zarpar-mysql`

---

**Última actualización**: 14 de Noviembre, 2025  
**Sistema**: Zarpar - Gestión de Repuestos  
**Versión BD**: 3.0.0

