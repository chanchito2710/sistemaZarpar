# 📚 EXPLICACIÓN VISUAL: ¿Cómo Funciona el Sistema de Productos?

**Para:** Usuario principiante  
**Objetivo:** Entender EXACTAMENTE dónde y cómo se guarda cada dato

---

## 🎯 PREGUNTA: "¿En qué tabla se guarda la información?"

### RESPUESTA CORTA:
Se usa **2 TABLAS** que trabajan juntas:
1. **`productos`** → Información general del producto (nombre, marca, tipo, etc.)
2. **`productos_sucursal`** → Stock y precio **específico** de cada sucursal

---

## 🗂️ ANALOGÍA PARA ENTENDER

Imagina que tienes un **catálogo de productos** (como un menú de restaurant):

### 📕 Tabla `productos` = El Menú Principal
- Lista todos los productos disponibles
- Tiene la descripción básica (nombre, marca, tipo, calidad)
- **NO tiene precios ni stock** (porque eso varía por sucursal)

### 📗 Tabla `productos_sucursal` = Precios y Stock por Local
- Para cada producto del menú, guarda el precio y stock EN CADA LOCAL
- **Un mismo producto puede tener diferente precio** en Pando vs Maldonado
- **Un mismo producto puede tener diferente stock** en cada sucursal

---

## 📊 EJEMPLO REAL CON TU BASE DE DATOS

Tomemos el producto **"iphone 11 j"** (producto_id = 10):

### 📦 TABLA 1: `productos` (1 registro por producto)

```
┌────┬─────────────┬────────┬─────────┬───────────┬───────────────┬────────┐
│ id │   nombre    │ marca  │  tipo   │  calidad  │ codigo_barras │ activo │
├────┼─────────────┼────────┼─────────┼───────────┼───────────────┼────────┤
│ 10 │ iphone 11 j │ Iphone │ Display │ Incell jk │     NULL      │   1    │
└────┴─────────────┴────────┴─────────┴───────────┴───────────────┴────────┘

📝 ESTO SE GUARDA UNA SOLA VEZ (es igual para todas las sucursales)
```

### 🏪 TABLA 2: `productos_sucursal` (7 registros, uno por cada sucursal)

```
┌────┬─────────────┬────────────┬───────┬──────────┬──────────────┬────────────────────┐
│ id │ producto_id │  sucursal  │ stock │  precio  │ stock_minimo │ es_stock_principal │
├────┼─────────────┼────────────┼───────┼──────────┼──────────────┼────────────────────┤
│ 71 │     10      │ maldonado  │   3   │   0.00   │      10      │         1          │ ← Stock Principal
│ 72 │     10      │   pando    │   8   │ 1500.00  │      10      │         0          │ ← ✅ MODIFICADO!
│ 73 │     10      │   rivera   │   0   │   0.00   │      10      │         0          │
│ 74 │     10      │    melo    │   0   │   0.00   │      10      │         0          │
│ 75 │     10      │  paysandu  │   0   │   0.00   │      10      │         0          │
│ 76 │     10      │   salto    │   0   │   0.00   │      10      │         0          │
│ 77 │     10      │ tacuarembo │   0   │   0.00   │      10      │         0          │
└────┴─────────────┴────────────┴───────┴──────────┴──────────────┴────────────────────┘

📝 ESTO SE GUARDA 7 VECES (una por cada sucursal)
```

**Fíjate en el registro id=72 (pando):**
- **Stock**: 8 unidades
- **Precio**: $1500.00 ← ✅ Este es el cambio que hicimos en el modal!

---

## 🔗 ¿CÓMO SE RELACIONAN LAS DOS TABLAS?

Las tablas se conectan por **`producto_id`**:

```
┌──────────────────────────────────────────────────────────────────┐
│                    TABLA: productos                              │
│  ┌────┬─────────────┬────────┬─────────┬───────────┐            │
│  │ id │   nombre    │ marca  │  tipo   │  calidad  │            │
│  ├────┼─────────────┼────────┼─────────┼───────────┤            │
│  │ 10 │ iphone 11 j │ Iphone │ Display │ Incell jk │            │
│  └────┴─────────────┴────────┴─────────┴───────────┘            │
│             │                                                    │
│             │ Este "id" se usa como "producto_id" abajo ↓        │
│             │                                                    │
└─────────────┼────────────────────────────────────────────────────┘
              │
              ↓ RELACIÓN (FOREIGN KEY)
              │
┌─────────────┼────────────────────────────────────────────────────┐
│             ↓                                                    │
│            TABLA: productos_sucursal                             │
│  ┌─────────────┬────────────┬───────┬─────────┐                 │
│  │ producto_id │  sucursal  │ stock │  precio │                 │
│  ├─────────────┼────────────┼───────┼─────────┤                 │
│  │     10      │ maldonado  │   3   │  0.00   │ ← Mismo producto│
│  │     10      │   pando    │   8   │1500.00  │ ← Mismo producto│
│  │     10      │   rivera   │   0   │  0.00   │ ← Mismo producto│
│  │     10      │    melo    │   0   │  0.00   │ ← Mismo producto│
│  │     10      │  paysandu  │   0   │  0.00   │ ← Mismo producto│
│  │     10      │   salto    │   0   │  0.00   │ ← Mismo producto│
│  │     10      │ tacuarembo │   0   │  0.00   │ ← Mismo producto│
│  └─────────────┴────────────┴───────┴─────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

**Explicación:**
- El `id = 10` de la tabla `productos` es el "producto padre"
- Hay 7 "hijos" en `productos_sucursal` (uno por cada sucursal)
- Todos tienen `producto_id = 10` para indicar que pertenecen al producto "iphone 11 j"

---

## 🔄 FLUJO COMPLETO: ¿QUÉ PASA CUANDO EDITAS UN PRODUCTO?

### 🎬 PASO A PASO (Con el ejemplo de cambiar el precio a $1500 en Pando)

#### 1️⃣ **Frontend: Abres el Modal "Editar Producto"**

```
Usuario hace clic en botón "Editar" (✏️) de "iphone 11 j"
                    ↓
Frontend ejecuta: abrirModalEditar(producto)
                    ↓
Frontend hace petición HTTP: GET /api/productos/10
                    ↓
Backend consulta la base de datos:
  - SELECT * FROM productos WHERE id = 10
  - SELECT * FROM productos_sucursal WHERE producto_id = 10
                    ↓
Backend retorna JSON con:
  {
    id: 10,
    nombre: "iphone 11 j",
    marca: "Iphone",
    tipo: "Display",
    calidad: "Incell jk",
    sucursales: [
      { sucursal: "maldonado", stock: 3, precio: 0, stock_minimo: 10 },
      { sucursal: "pando", stock: 8, precio: 0, stock_minimo: 10 },    ← ANTES
      { sucursal: "rivera", stock: 0, precio: 0, stock_minimo: 10 },
      // ... etc
    ]
  }
                    ↓
Frontend rellena el formulario con estos datos
                    ↓
Modal se abre mostrando:
  - Datos básicos: "iphone 11 j", "Iphone", "Display", "Incell jk"
  - Accordion con 7 paneles (uno por sucursal)
    - Pando: Stock=8, Precio=$0.00, Stock Mín=10
```

---

#### 2️⃣ **Usuario: Cambias el Precio**

```
Usuario expande panel "Pando"
                    ↓
Usuario cambia precio de $0.00 a $1500.00
                    ↓
(Los datos se quedan en memoria del navegador, NO se guardan aún)
```

---

#### 3️⃣ **Usuario: Haces Clic en "Guardar Cambios"**

```
Usuario hace clic en "Guardar Cambios"
                    ↓
Frontend ejecuta: handleEditarProducto()
                    ↓
Frontend hace 8 peticiones HTTP:

1. PUT /api/productos/10
   Body: { nombre: "iphone 11 j", marca: "Iphone", tipo: "Display", ... }
   → Actualiza tabla "productos"

2. PUT /api/productos/10/sucursal/maldonado
   Body: { stock: 3, precio: 0, stock_minimo: 10 }
   
3. PUT /api/productos/10/sucursal/pando        ← ESTA ES LA QUE NOS INTERESA
   Body: { stock: 8, precio: 1500, stock_minimo: 10 }
   
4. PUT /api/productos/10/sucursal/rivera
   Body: { stock: 0, precio: 0, stock_minimo: 10 }
   
5-7. ... (misma lógica para melo, paysandu, salto, tacuarembo)
```

---

#### 4️⃣ **Backend: Recibe la Petición y Actualiza la Base de Datos**

```
Backend recibe: PUT /api/productos/10/sucursal/pando
Body: { stock: 8, precio: 1500, stock_minimo: 10 }
                    ↓
Backend ejecuta función: actualizarProductoSucursal()
                    ↓
Backend construye y ejecuta query SQL:

  UPDATE productos_sucursal 
  SET stock = 8, precio = 1500.00, stock_minimo = 10
  WHERE producto_id = 10 AND sucursal = 'pando'
                    ↓
MySQL ejecuta el UPDATE en el disco duro
                    ↓
MySQL confirma: "1 row affected" (1 fila actualizada)
                    ↓
Backend responde al frontend: 
  {
    success: true,
    message: "Stock y precio actualizados exitosamente"
  }
                    ↓
Frontend muestra mensaje:
  ✅ "Producto y stock/precio actualizados exitosamente"
```

---

#### 5️⃣ **Base de Datos: Estado ANTES y DESPUÉS**

**ANTES del UPDATE:**
```sql
-- Registro id=72 en productos_sucursal
┌────┬─────────────┬──────────┬───────┬────────┬──────────────┐
│ id │ producto_id │ sucursal │ stock │ precio │ stock_minimo │
├────┼─────────────┼──────────┼───────┼────────┼──────────────┤
│ 72 │     10      │  pando   │   8   │  0.00  │      10      │
└────┴─────────────┴──────────┴───────┴────────┴──────────────┘
```

**DESPUÉS del UPDATE:**
```sql
-- Registro id=72 en productos_sucursal
┌────┬─────────────┬──────────┬───────┬─────────┬──────────────┐
│ id │ producto_id │ sucursal │ stock │  precio │ stock_minimo │
├────┼─────────────┼──────────┼───────┼─────────┼──────────────┤
│ 72 │     10      │  pando   │   8   │1500.00  │      10      │ ← ✅ CAMBIÓ!
└────┴─────────────┴──────────┴───────┴─────────┴──────────────┘
```

---

## 🔍 ¿CÓMO VERIFICAR QUE SE GUARDÓ?

### Opción 1: Desde MySQL Workbench

```sql
SELECT * FROM productos_sucursal 
WHERE producto_id = 10 AND sucursal = 'pando';
```

### Opción 2: Desde Docker (Terminal)

```bash
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase \
  -e "SELECT * FROM productos_sucursal WHERE producto_id = 10 AND sucursal = 'pando';"
```

### Opción 3: Desde la Interfaz (http://localhost:5678/admin/database)

1. Ir a `http://localhost:5678/admin/database`
2. Seleccionar tabla: `productos_sucursal`
3. Buscar: `producto_id = 10 AND sucursal = pando`
4. Ver: precio = 1500.00 ✅

---

## 💡 VENTAJAS DE USAR 2 TABLAS

### ✅ Ventaja #1: Precios Diferentes por Sucursal

```
Producto: "iphone 11 j" (id=10)

Precio en Maldonado: $0.00     (tabla productos_sucursal, id=71)
Precio en Pando:     $1500.00  (tabla productos_sucursal, id=72)
Precio en Rivera:    $0.00     (tabla productos_sucursal, id=73)

👉 Cada sucursal puede tener SU PROPIO precio
```

### ✅ Ventaja #2: Stock Independiente por Sucursal

```
Producto: "iphone 11 j" (id=10)

Stock en Maldonado: 3 unidades  (tabla productos_sucursal, id=71)
Stock en Pando:     8 unidades  (tabla productos_sucursal, id=72)
Stock en Rivera:    0 unidades  (tabla productos_sucursal, id=73)

👉 Cada sucursal tiene SU PROPIO inventario
```

### ✅ Ventaja #3: Fácil Agregar Productos

```
Cuando creas un nuevo producto:

1. Se inserta 1 registro en "productos" (datos generales)
2. Se insertan 7 registros en "productos_sucursal" (uno por cada sucursal)
   - Todos con stock=0, precio=0 inicialmente
3. Luego cada sucursal puede actualizar su precio y stock
```

### ✅ Ventaja #4: Consultas Flexibles

```sql
-- Ver TODOS los productos de UNA sucursal
SELECT p.nombre, ps.stock, ps.precio
FROM productos p
JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE ps.sucursal = 'pando';

-- Ver UN producto en TODAS las sucursales
SELECT ps.sucursal, ps.stock, ps.precio
FROM productos_sucursal ps
WHERE ps.producto_id = 10;

-- Ver productos con stock bajo en Pando
SELECT p.nombre, ps.stock, ps.stock_minimo
FROM productos p
JOIN productos_sucursal ps ON p.id = ps.producto_id
WHERE ps.sucursal = 'pando' 
  AND ps.stock <= ps.stock_minimo;
```

---

## 📋 RESUMEN FINAL

### ¿Dónde se guarda cada dato?

| Dato                  | Tabla                | Cuántas veces se guarda      |
|-----------------------|----------------------|------------------------------|
| **Nombre del producto**| `productos`         | 1 vez (es igual para todos)  |
| **Marca**             | `productos`          | 1 vez (es igual para todos)  |
| **Tipo**              | `productos`          | 1 vez (es igual para todos)  |
| **Calidad**           | `productos`          | 1 vez (es igual para todos)  |
| **Código de barras**  | `productos`          | 1 vez (es igual para todos)  |
| **Stock**             | `productos_sucursal` | 7 veces (uno por sucursal)   |
| **Precio**            | `productos_sucursal` | 7 veces (uno por sucursal)   |
| **Stock mínimo**      | `productos_sucursal` | 7 veces (uno por sucursal)   |

---

### Flujo Simplificado

```
1. Usuario edita producto en el modal
   ↓
2. Frontend envía datos al backend (8 peticiones HTTP)
   ↓
3. Backend ejecuta UPDATE en MySQL
   ↓
4. MySQL guarda en disco duro (tabla productos_sucursal)
   ↓
5. Backend confirma: "Success"
   ↓
6. Frontend muestra: ✅ "Actualizado exitosamente"
   ↓
7. Datos persistidos en base de datos REAL
```

---

## 🎓 CONCEPTOS APRENDIDOS

### 1. **Normalización de Base de Datos**
- Dividir información en múltiples tablas
- Evitar duplicación de datos
- Mejor organización y mantenimiento

### 2. **Foreign Key (Clave Foránea)**
- `producto_id` en `productos_sucursal` apunta a `id` en `productos`
- Mantiene integridad referencial
- Si eliminas un producto, se eliminan automáticamente sus registros relacionados

### 3. **Relación 1:N (Uno a Muchos)**
- 1 producto → N registros en productos_sucursal (N = 7 en tu caso)
- Cada registro tiene diferente sucursal, stock y precio

### 4. **CRUD Operations**
- **C**reate: INSERT INTO productos_sucursal
- **R**ead: SELECT FROM productos_sucursal
- **U**pdate: UPDATE productos_sucursal ← Esto es lo que haces en el modal
- **D**elete: DELETE FROM productos_sucursal

---

## ✅ CONCLUSIÓN

**Tu sistema guarda la información en estas 2 tablas:**

1. **`productos`** → Datos generales (nombre, marca, tipo, calidad)
2. **`productos_sucursal`** → Stock y precio **por cada sucursal**

**Cuando editas en el modal:**
- Se actualiza `productos` (1 vez)
- Se actualiza `productos_sucursal` (7 veces, una por cada sucursal)

**Y SÍ, todo se guarda en la base de datos REAL** ✅

---

**¿Quedó claro?** Si tienes alguna duda específica, pregúntame y te explico con más detalle esa parte en particular. 🚀

