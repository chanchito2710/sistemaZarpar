# 🚀 INSTRUCCIONES: Agregar columna `una_vez_activo` en Railway

## ⚠️ PROBLEMA
El botón "Habilitar 1 vez" funciona en local pero **NO en Railway** porque falta la columna `una_vez_activo` en la base de datos de producción.

---

## ✅ SOLUCIÓN: Ejecutar SQL en Railway Web Console

### **PASO 1: Acceder a Railway Dashboard**

1. Ir a: https://railway.app
2. Iniciar sesión
3. Seleccionar el proyecto "Sistema Zarpar"
4. Click en el servicio **"MySQL"**

---

### **PASO 2: Abrir la Consola de MySQL**

1. Click en la pestaña **"Data"** (arriba)
2. Verás un editor SQL donde puedes ejecutar queries directamente

---

### **PASO 3: Copiar y Pegar este SQL**

Copia **TODO** el contenido del archivo `EJECUTAR_EN_RAILWAY_UNA_VEZ.sql` y pégalo en el editor de Railway.

**O copia esto:**

```sql
USE zarparDataBase;

-- Verificar si la columna ya existe
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'zarparDataBase'
  AND TABLE_NAME = 'configuracion_descuentos_sucursal'
  AND COLUMN_NAME = 'una_vez_activo';

-- Si el resultado anterior está vacío, ejecuta esto:
ALTER TABLE `configuracion_descuentos_sucursal`
ADD COLUMN `una_vez_activo` TINYINT(1) DEFAULT 0 
COMMENT 'Descuento habilitado SOLO para la próxima venta (0=NO, 1=SÍ)' 
AFTER `descuento_habilitado`;

-- Verificar que se agregó correctamente
DESCRIBE configuracion_descuentos_sucursal;

-- Ver datos actuales
SELECT 
  sucursal, 
  descuento_habilitado, 
  una_vez_activo,
  updated_at 
FROM configuracion_descuentos_sucursal
ORDER BY sucursal;

-- Registrar la migración
INSERT IGNORE INTO `migraciones` (`nombre`) VALUES ('009_agregar_una_vez_descuentos.sql');

-- Verificar migraciones ejecutadas
SELECT * FROM migraciones ORDER BY ejecutado_en DESC LIMIT 5;
```

---

### **PASO 4: Ejecutar el SQL**

1. Click en **"Run Query"** o presiona `Ctrl + Enter`
2. Espera 2-3 segundos
3. Deberías ver resultados como:

```
✅ ALTER TABLE ejecutado correctamente

✅ DESCRIBE muestra la nueva columna:
Field               Type         Default
...
una_vez_activo      tinyint(1)   0

✅ SELECT muestra todas las sucursales con una_vez_activo = 0
```

---

### **PASO 5: Verificar en la Aplicación**

1. Ir a tu aplicación desplegada en Railway
2. Login como admin
3. Ir a `/staff/sellers` → Tab "Descuentos"
4. Click en **"Habilitar 1 vez"** para cualquier sucursal
5. **Debería funcionar** ✅

---

## 🔍 VERIFICACIÓN RÁPIDA

Si quieres verificar que la columna se agregó correctamente, ejecuta en Railway:

```sql
USE zarparDataBase;
DESCRIBE configuracion_descuentos_sucursal;
```

Deberías ver una columna llamada `una_vez_activo` de tipo `tinyint(1)`.

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Error: "Column 'una_vez_activo' already exists"
✅ **Solución**: La columna ya existe, no necesitas hacer nada.

### Error: "Table 'configuracion_descuentos_sucursal' doesn't exist"
❌ **Problema**: Falta la tabla completa.
✅ **Solución**: Ejecuta primero `database/migrations/008_crear_configuracion_descuentos.sql`

### No veo la pestaña "Data" en Railway
✅ **Solución**: Asegúrate de estar en el servicio **MySQL**, no en el servicio de Node.js

---

## 📋 RESUMEN

1. ✅ Acceder a Railway → MySQL → Data
2. ✅ Copiar y pegar el SQL
3. ✅ Ejecutar (Ctrl + Enter)
4. ✅ Verificar resultados
5. ✅ Probar en la aplicación

**¡Listo!** El botón "Habilitar 1 vez" debería funcionar en producción.

