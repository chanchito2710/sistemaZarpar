# 🚨 EJECUTAR ESTO AHORA EN RAILWAY

## 📍 Paso 1: Abrir Railway Dashboard

1. Ve a: https://railway.app/
2. Inicia sesión
3. Click en tu proyecto `sistemaZarpar`

---

## 📍 Paso 2: Abrir MySQL Query Editor

1. En el dashboard, busca el servicio **"MySQL"** (tiene un ícono de base de datos)
2. Click en **"MySQL"**
3. En el menú lateral, busca:
   - **"Data"** o
   - **"Query"** o
   - **"Console"**
4. Se abrirá un editor SQL (fondo negro/oscuro con un área para escribir)

---

## 📍 Paso 3: Ejecutar el SQL

1. **Abre el archivo:** `EJECUTAR_EN_RAILWAY_AHORA.sql`
2. **Copia TODO el contenido** (Ctrl + A, Ctrl + C)
3. **Pega en el editor de Railway** (Ctrl + V)
4. **Click en el botón "Run"** o **"Execute"** o presiona **Ctrl + Enter**

---

## 📍 Paso 4: Verificar Resultados

Deberías ver **6 bloques de resultados**:

### ✅ Resultado Esperado:

```
PASO 1: Verificando...
PASO 2: Agregando columna...
PASO 3: Creando indice...
PASO 4: Verificacion final...
  - COLUMN_NAME: stock_minimo
  - COLUMN_TYPE: int
  - COLUMN_DEFAULT: 0
PASO 5: Configurando alerta...
PASO 6: Verificando alertas...
  - (Muestra 1 o más productos con alertas)
✅ LISTO! Refresca el navegador
```

---

## 📍 Paso 5: Probar en el Frontend

1. Ve a tu app: `https://sistemazarpar-production.up.railway.app`
2. **Hard Refresh:** Presiona **Ctrl + Shift + R** (Windows) o **Cmd + Shift + R** (Mac)
3. Inicia sesión como **admin@zarparuy.com** / **admin123**
4. El botón **"Alertas de Stock"** debería aparecer en el header (rojo con animación de pulso)

---

## 🆘 Si No Aparece el Botón

### Posibles Causas:

1. **No eres admin**: El botón SOLO aparece para usuarios administradores
2. **No hay alertas**: Necesitas productos con:
   - `stock_minimo > 0` configurado
   - Y `stock < stock_minimo` (stock bajo) O `stock = 0` (sin stock)

### Solución Rápida:

Ejecuta este SQL adicional en Railway para forzar una alerta:

```sql
-- Configurar stock_minimo = 999 en varios productos
UPDATE productos_sucursal 
SET stock_minimo = 999 
WHERE sucursal = 'maldonado' 
LIMIT 5;

-- Verificar
SELECT 
  p.nombre,
  ps.sucursal,
  ps.stock,
  ps.stock_minimo,
  CASE 
    WHEN ps.stock < ps.stock_minimo THEN '🔴 ALERTA'
    ELSE '🟢 OK'
  END AS estado
FROM productos_sucursal ps
INNER JOIN productos p ON ps.producto_id = p.id
WHERE ps.stock_minimo > 0
LIMIT 10;
```

Esto **garantiza** que habrá alertas (porque pones stock_minimo muy alto).

---

## 🎯 Resultado Final

Deberías ver:

```
Header (arriba a la derecha):
  [Caja $27650.00]  [🔴 Alertas de Stock]  [👤 Nicolas ADMIN]
                           ↑
                    Este botón (rojo, pulsando)
```

---

## 📞 ¿Sigue sin funcionar?

1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Copia cualquier error y avísame

---

## ✅ Checklist

```
[ ] Abrí Railway Dashboard
[ ] Abrí MySQL Query Editor
[ ] Copié y pegué EJECUTAR_EN_RAILWAY_AHORA.sql
[ ] Ejecuté el SQL (Run/Execute)
[ ] Vi los 6 resultados correctamente
[ ] Refresqué el navegador (Ctrl + Shift + R)
[ ] Verifiqué que estoy logueado como ADMIN
[ ] El botón "Alertas de Stock" APARECE ✅
```

---

**Tiempo estimado:** 3-5 minutos

