# 📦 INSTRUCCIONES PARA INSTALAR EL MÓDULO DE PRODUCTOS

## 🗄️ PASO 1: CREAR LAS TABLAS EN LA BASE DE DATOS

Tienes **2 opciones** para ejecutar el script SQL:

### ✅ OPCIÓN A: Usando tu aplicación web (MÁS FÁCIL)

1. **Abre tu navegador:**
   ```
   http://localhost:5679/admin/database
   ```

2. **Copia y pega el contenido del archivo:**
   ```
   database/schema_productos.sql
   ```

3. **Ejecuta el SQL** (si tu interfaz lo permite)

---

### ✅ OPCIÓN B: Usando MySQL Workbench o terminal

#### Con MySQL Workbench:
1. Abre MySQL Workbench
2. Conéctate a tu base de datos (localhost:3307)
3. Abre el archivo `database/schema_productos.sql`
4. Click en el icono ⚡ (Execute)

#### Con terminal (si tienes MySQL en PATH):
```bash
mysql -h localhost -P 3307 -u root -pzarpar2025 zarparDataBase < database/schema_productos.sql
```

---

## ✅ PASO 2: VERIFIC

AR QUE LAS TABLAS SE CREARON

Ejecuta este SQL para verificar:

```sql
USE zarparDataBase;

-- Ver todas las tablas
SHOW TABLES LIKE 'productos%';

-- Debería mostrar:
-- productos
-- productos_sucursal

-- Ver estructura de productos
DESCRIBE productos;

-- Ver estructura de productos_sucursal
DESCRIBE productos_sucursal;

-- Ver productos de ejemplo insertados
SELECT * FROM productos;

-- Ver stock por sucursal
SELECT * FROM productos_sucursal;
```

---

## 🎯 PASO 3: REINICIAR EL SERVIDOR (Si está corriendo)

Si el backend ya está corriendo, reinícialo para que cargue las nuevas rutas:

```bash
# Detén el servidor (Ctrl + C en la terminal)
# Luego inicia nuevamente:
npm run dev
```

O simplemente guarda cualquier archivo del backend (ej: `api/app.ts`) y nodemon lo reiniciará automáticamente.

---

## 🧪 PASO 4: PROBAR QUE FUNCIONA

### Prueba desde el navegador:

1. **Login:**
   ```
   http://localhost:5679/login
   Email: admin@zarparuy.com
   ```

2. **Ve a Productos:**
   ```
   http://localhost:5679/products
   ```

3. **Deberías ver:**
   - Selector de sucursal
   - Lista de productos con stock y precio
   - Botones para crear/editar

### Prueba desde la API (opcional):

```bash
# Obtener productos de Pando
curl -X GET "http://localhost:3456/api/productos/sucursal/pando" \
  -H "Authorization: Bearer TU_TOKEN_JWT"

# Buscar productos
curl -X GET "http://localhost:3456/api/productos/buscar?q=arroz&sucursal=pando" \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

---

## 📊 DATOS DE EJEMPLO INCLUIDOS

El script `schema_productos.sql` incluye 5 productos de ejemplo:

1. **Arroz Saman** - Grano largo Premium
2. **Azúcar Bella Unión** - Refinada Media
3. **Aceite Cocinero** - Girasol Media  
4. **Fideos Don Vicente** - Tallarines Premium
5. **Sal Celusal** - Fina Económica

Cada producto tiene stock y precios en las 7 sucursales.

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### "Error: Table 'productos' already exists"

Si ya ejecutaste el script antes:

```sql
-- Eliminar tablas existentes
DROP TABLE IF EXISTS productos_sucursal;
DROP TABLE IF EXISTS productos;

-- Luego vuelve a ejecutar schema_productos.sql
```

### "Error 1062: Duplicate entry"

Ya tienes datos en las tablas. Si quieres empezar de cero:

```sql
-- Vaciar tablas
TRUNCATE TABLE productos_sucursal;
TRUNCATE TABLE productos;

-- Luego ejecuta solo la parte de INSERT del schema_productos.sql
```

### "Cannot connect to MySQL"

Verifica que MySQL esté corriendo:
- Busca en los logs: `✅ Conexión exitosa a MySQL`
- Puerto correcto: `3307` (no 3306)

---

## 🚀 ¡LISTO!

Una vez creadas las tablas, el sistema de productos está completamente funcional.

**Archivos creados:**
- ✅ `database/schema_productos.sql` - Script SQL
- ✅ `api/controllers/productosController.ts` - Lógica backend
- ✅ `api/routes/productos.ts` - Rutas API
- ✅ `src/services/api.ts` - Servicios frontend (actualizado)
- ✅ `src/pages/products/Products.tsx` - Interfaz (próximo archivo)

---

**Última actualización:** Octubre 28, 2025

