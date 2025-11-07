# 🔤 SOLUCIÓN COMPLETA: ENCODING UTF-8 EN SISTEMA ZARPAR

## 📋 PROBLEMA IDENTIFICADO

### Síntoma:
Los tipos de productos se mostraban con caracteres corruptos:
- ❌ "BaterÃ­a" en lugar de "Batería"
- ❌ "BotÃ³n" en lugar de "Botón"

### Causa Raíz:
1. **Conexión MySQL sin charset UTF-8**: La conexión Node.js → MySQL no especificaba el charset correcto
2. **Datos con doble encoding**: Los datos originales tenían doble encoding UTF-8
3. **Tablas desincronizadas**: `categorias_productos` y `productos` tenían valores diferentes

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1️⃣ Configuración de Conexión MySQL

**Archivo**: `api/config/database.ts`

**Cambios aplicados:**
```typescript
export const pool = mysql.createPool({
  // ... otras configuraciones ...
  
  // ✅ AGREGADO: Configuración de encoding UTF-8
  charset: 'utf8mb4',
  connectAttributes: {
    charset: 'utf8mb4'
  }
});
```

**En `testConnection()`:**
```typescript
// ✅ AGREGADO: Forzar UTF-8 en cada conexión
await connection.query("SET NAMES 'utf8mb4'");
await connection.query("SET CHARACTER SET utf8mb4");
await connection.query("SET character_set_connection=utf8mb4");
```

---

### 2️⃣ Corrección de Datos en Base de Datos

**Tablas afectadas:**
- `categorias_productos` (catálogo de tipos válidos)
- `productos` (datos de productos reales)

**Tipos estandarizados:**

| Tipo | Encoding | Productos |
|------|----------|-----------|
| Antena | ✅ UTF-8 | 3 |
| **Batería** | ✅ UTF-8 con acento | 36 |
| **Botón** | ✅ UTF-8 con acento | 5 |
| Display | ✅ UTF-8 | 228 |
| Flex | ✅ UTF-8 | 8 |
| Placa Carga | ✅ UTF-8 | 15 |
| Herramienta | ✅ UTF-8 | 0 |
| Main Sub | ✅ UTF-8 | 0 |
| Otro | ✅ UTF-8 | 0 |

**Scripts ejecutados:**
- `database/fix_encoding_productos.sql` - Corregir tabla `productos`
- `database/fix_all_tipos.sql` - Corregir y sincronizar ambas tablas

---

## 📊 ESTRUCTURA DE DATOS

### Tabla: `categorias_productos`

**Propósito**: Catálogo maestro de categorías (tipos, marcas, calidades)

```sql
CREATE TABLE categorias_productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('marca', 'tipo', 'calidad') NOT NULL,
  valor VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Datos actuales (tipo='tipo'):**
- Antena
- Batería ✅
- Botón ✅
- Display
- Flex
- Herramienta
- Main Sub
- Otro
- Placa Carga

### Tabla: `productos`

**Propósito**: Catálogo de productos con sus tipos

```sql
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  tipo VARCHAR(100),  -- ⚠️ Debe coincidir con categorias_productos
  codigo_barras VARCHAR(50),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔄 FLUJO DE DATOS: TIPOS DE PRODUCTOS

```
┌─────────────────────────────┐
│  categorias_productos       │
│  (Catálogo Maestro)         │
│  ┌─────────────────────┐   │
│  │ tipo = 'tipo'       │   │
│  │ valor = 'Batería'   │◄──┼── Fuente de verdad
│  │ valor = 'Botón'     │   │
│  │ valor = 'Display'   │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
          │
          │ Referencia
          ▼
┌─────────────────────────────┐
│  productos                  │
│  ┌─────────────────────┐   │
│  │ tipo = 'Batería'    │◄──┼── Debe coincidir
│  │ tipo = 'Botón'      │   │
│  │ tipo = 'Display'    │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
          │
          │ API REST (UTF-8)
          ▼
┌─────────────────────────────┐
│  Frontend React             │
│  ┌─────────────────────┐   │
│  │ Muestra: "Batería"  │◄──┼── Visualización correcta
│  │ Muestra: "Botón"    │   │
│  │ Muestra: "Display"  │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
          │
          │ jsPDF (UTF-8)
          ▼
┌─────────────────────────────┐
│  PDF Generado               │
│  ┌─────────────────────┐   │
│  │ Imprime: "Batería"  │◄──┼── PDF con acentos correctos
│  │ Imprime: "Botón"    │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

---

## 🎯 GARANTÍAS DE LA SOLUCIÓN

### ✅ Sin datos hardcodeados
- Los tipos vienen dinámicamente de `categorias_productos`
- Cualquier nuevo tipo agregado a la BD funcionará automáticamente

### ✅ Encoding consistente
- Conexión MySQL configurada con `utf8mb4`
- Todas las queries usan UTF-8
- Los datos en BD están correctamente codificados

### ✅ Sincronización de tablas
- `categorias_productos` = fuente de verdad
- `productos.tipo` debe coincidir con valores de `categorias_productos`

### ✅ Futuras inserciones
- Cualquier nuevo producto con tipo "Batería" o "Botón" se guardará correctamente
- No se volverá a corromper el encoding

---

## 🔧 MANTENIMIENTO

### Agregar un nuevo tipo de producto:

```sql
-- 1. Agregar a categorias_productos (fuente de verdad)
INSERT INTO categorias_productos (tipo, valor)
VALUES ('tipo', 'Nuevo Tipo');

-- 2. Usar en productos
INSERT INTO productos (nombre, marca, tipo)
VALUES ('Producto X', 'Marca Y', 'Nuevo Tipo');
```

### Verificar encoding de un tipo:

```sql
SELECT 
  valor,
  HEX(valor) as hex_encoding,
  LENGTH(valor) as bytes,
  CHAR_LENGTH(valor) as caracteres
FROM categorias_productos
WHERE tipo = 'tipo' AND valor = 'Batería';

-- Resultado esperado:
-- valor: Batería
-- hex_encoding: 4261746572C3AD61
-- bytes: 8
-- caracteres: 7
```

---

## 📁 ARCHIVOS MODIFICADOS

### Backend:
- ✅ `api/config/database.ts` - Configuración UTF-8 en pool de conexiones

### Base de Datos:
- ✅ `database/fix_encoding_productos.sql` - Script inicial de corrección
- ✅ `database/fix_all_tipos.sql` - Script completo de sincronización
- ✅ `scripts/fix-encoding.sql` - Script de verificación

### Documentación:
- ✅ `SOLUCION_ENCODING_UTF8.md` - Este documento

---

## 🚀 CÓMO VERIFICAR QUE FUNCIONA

### 1. Reiniciar el backend
```bash
# El backend aplicará la nueva configuración de charset
npm run dev:api
```

### 2. Verificar en la interfaz web
```
http://localhost:5678/products/prices
```
- Seleccionar una sucursal
- Verificar que se vea "Batería" y no "BaterÃ­a"

### 3. Generar un PDF
- Hacer clic en "Generar PDF"
- Abrir el PDF descargado
- Verificar que muestra "Batería" y "Botón" correctamente

### 4. Verificar en POS
```
http://localhost:5678/pos
```
- Los tipos de productos deben verse correctamente con acentos

---

## ⚠️ PREVENCIÓN DE FUTUROS PROBLEMAS

### ❌ NO hacer:
1. NO insertar datos sin especificar UTF-8
2. NO copiar/pegar datos de fuentes con encoding diferente
3. NO modificar el charset de la conexión MySQL
4. NO hardcodear tipos en el código

### ✅ SÍ hacer:
1. SIEMPRE usar `categorias_productos` para tipos válidos
2. SIEMPRE verificar encoding con HEX() al insertar datos
3. SIEMPRE mantener configuración UTF-8 en `database.ts`
4. SIEMPRE sincronizar `categorias_productos` ↔ `productos`

---

## 📞 SOPORTE

Si vuelve a aparecer un problema de encoding:

1. Verificar configuración de charset en `api/config/database.ts`
2. Ejecutar script de verificación: `scripts/fix-encoding.sql`
3. Verificar HEX de los datos problemáticos
4. Aplicar script de corrección si es necesario

---

**✅ Solución implementada**: 5 de noviembre, 2025  
**Estado**: Completamente funcional  
**Encoding**: UTF-8 (utf8mb4) en toda la aplicación


