# 🚨 Instrucciones: Habilitar Alertas de Stock en Railway

## 📋 Problema

El botón "Alertas de Stock" no aparece en producción (Railway) porque falta la columna `stock_minimo` en la base de datos.

---

## ✅ Solución Automática (Preferida)

La migración `007_agregar_stock_minimo.sql` se ejecutará **automáticamente** cuando Railway despliegue el nuevo código.

### Pasos:

1. **Push al repositorio** (✅ ya hecho)
   ```bash
   git push origin Proyecto_depurado
   ```

2. **Railway detectará el push** y hará un nuevo deploy automáticamente

3. **Al iniciar el servidor**, se ejecutará:
   ```
   🔄 Verificando migraciones pendientes...
   ✅ Migración ejecutada: 007_agregar_stock_minimo.sql
   ```

4. **Verifica en los logs de Railway**:
   - Ve a tu proyecto en Railway
   - Click en "Deployments"
   - Click en el último deployment
   - Busca en los logs: `Migración ejecutada: 007_agregar_stock_minimo.sql`

---

## 🛠️ Solución Manual (Si falla la automática)

Si después del deploy las alertas **NO aparecen**, ejecuta este SQL manualmente en Railway:

### Paso 1: Conectar a la base de datos de Railway

1. Ve a tu proyecto en Railway
2. Click en el servicio "MySQL"
3. Click en "Data" o "Query"
4. Se abrirá un editor SQL

### Paso 2: Verificar si la columna existe

Ejecuta:
```sql
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';
```

**Si el resultado está vacío** → La columna NO existe, continúa al Paso 3

**Si muestra una fila** → La columna SÍ existe, las alertas deberían funcionar

### Paso 3: Agregar columna (si no existe)

Ejecuta:
```sql
ALTER TABLE productos_sucursal 
ADD COLUMN stock_minimo INT DEFAULT 0 
COMMENT 'Stock mínimo para alertas (0 = sin alerta)';
```

### Paso 4: Crear índice

Ejecuta:
```sql
CREATE INDEX idx_stock_minimo 
ON productos_sucursal(stock_minimo, stock);
```

### Paso 5: Verificar

Ejecuta:
```sql
SELECT 
  COLUMN_NAME,
  COLUMN_TYPE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'productos_sucursal' 
  AND COLUMN_NAME = 'stock_minimo';
```

**Resultado esperado:**
```
COLUMN_NAME: stock_minimo
COLUMN_TYPE: int
COLUMN_DEFAULT: 0
COLUMN_COMMENT: Stock mínimo para alertas (0 = sin alerta)
```

---

## 🧪 Probar que Funciona

1. **Ve a la app en Railway**: `http://tu-app.railway.app`

2. **Inicia sesión como admin**: `admin@zarparuy.com` / `admin123`

3. **Ve a Productos**: `http://tu-app.railway.app/products`

4. **Configura una alerta**:
   - Click en el botón de editar de cualquier producto
   - Scroll hasta "⚠️ Configurar Alertas de Stock Mínimo"
   - Pon un stock mínimo (ej: 10 unidades) para alguna sucursal
   - Guarda

5. **Verifica el botón de alertas**:
   - El botón "Alertas de Stock" debería aparecer en el header (rojo con pulso)
   - Click en el botón
   - Debería mostrar un drawer con las alertas

---

## 📊 Estructura de la Columna

```sql
productos_sucursal
├── producto_id (int)
├── sucursal (varchar)
├── stock (int)
├── precio (decimal)
├── stock_minimo (int) ⭐ NUEVA
└── activo (tinyint)
```

**Valores:**
- `0` = Sin alerta configurada (por defecto)
- `> 0` = Stock mínimo configurado (genera alerta si `stock < stock_minimo`)

---

## 🔍 Troubleshooting

### Problema: El botón "Alertas de Stock" no aparece

**Verificar:**
1. ¿Hay productos con `stock_minimo > 0` configurado?
2. ¿Alguno de esos productos tiene `stock < stock_minimo`?

**Query de diagnóstico:**
```sql
SELECT 
  p.nombre,
  ps.sucursal,
  ps.stock,
  ps.stock_minimo,
  CASE 
    WHEN ps.stock_minimo > 0 AND ps.stock < ps.stock_minimo THEN '🔴 ALERTA'
    WHEN ps.stock = 0 THEN '⚫ SIN STOCK'
    ELSE '🟢 OK'
  END AS estado
FROM productos_sucursal ps
INNER JOIN productos p ON ps.producto_id = p.id
WHERE ps.stock_minimo > 0
ORDER BY ps.stock ASC
LIMIT 20;
```

### Problema: Error al ejecutar la migración

**Error común:** `Column 'stock_minimo' already exists`

**Solución:** La columna ya existe, no hay nada que hacer.

---

## ✅ Checklist Final

```
[ ] Push al repositorio ejecutado
[ ] Railway desplegó el nuevo código
[ ] Logs muestran: "Migración ejecutada: 007_agregar_stock_minimo.sql"
[ ] Columna stock_minimo existe en productos_sucursal
[ ] Configuraste al menos una alerta de stock en un producto
[ ] Botón "Alertas de Stock" aparece en el header (si hay alertas)
[ ] Drawer de alertas se abre correctamente
```

---

## 📞 Soporte

Si después de seguir estos pasos las alertas **TODAVÍA** no funcionan:

1. Revisa los logs de Railway para errores
2. Ejecuta el SQL de diagnóstico (arriba)
3. Verifica que estás logueado como **admin** (solo admins ven alertas)
4. Hard refresh del navegador (Ctrl + Shift + R)

---

**Última actualización:** 2025-11-18

