# 🐛 DEBUG: Modal "Ver Ventas" → Productos se queda cargando en Railway

## 🎯 PROBLEMA REPORTADO:

En Railway, cuando:
1. Vas a `/customers`
2. Click en "Ver Ventas" de un cliente
3. Click en pestaña "Productos"
4. Se queda cargando infinitamente (loading...)

En local funciona perfectamente.

---

## 🔍 DIAGNÓSTICO EN PROGRESO:

Agregué logs de debug para identificar el problema exacto.

---

## ⏰ ESPERA 3 MINUTOS

Railway está redesplergando **AHORA MISMO** con los nuevos logs.

---

## 📋 DESPUÉS DE 3 MINUTOS, HAZ ESTO EN RAILWAY:

### **Paso 1: Abre tu app en Railway**
```
https://sistemazarpar-production.up.railway.app/customers
```

### **Paso 2: Abre la Consola del Navegador**
- Presiona **F12**
- Ve a la pestaña **"Console"**
- Deja la consola abierta

### **Paso 3: Inicia sesión**
- Email: `admin@zarparuy.com`
- Contraseña: `admin123`

### **Paso 4: Abre el modal "Ver Ventas"**
- Click en **"Ver Ventas"** de cualquier cliente que tenga ventas
- El modal se abre

### **Paso 5: Haz clic en la pestaña "Productos"**
- Click en la pestaña **"Productos (X)"**
- Se quedará cargando...

### **Paso 6: Observa la consola**

Deberías ver mensajes como:

```
🔍 [DEBUG Productos Cliente] Iniciando carga de productos
🔍 [DEBUG] Hostname: sistemazarpar-production.up.railway.app
🔍 [DEBUG] API_URL: ??? ← ⭐ ESTO ES LO IMPORTANTE
🔍 [DEBUG] Cliente ID: 123
🔍 [DEBUG] Sucursal: maldonado
🔍 [DEBUG] Full URL: ??? ← ⭐ ESTO TAMBIÉN
🔍 [DEBUG] Response status: ???
🔍 [DEBUG] Response ok? ???
```

---

## 📸 NECESITO QUE ME MUESTRES:

**Screenshot de la consola mostrando:**
1. Los mensajes `[DEBUG Productos Cliente]`
2. El valor de `API_URL:`
3. El valor de `Full URL:`
4. El `Response status:` (si aparece)
5. Cualquier error en rojo

---

## 🎯 ESCENARIOS POSIBLES:

### **Escenario 1: API_URL = http://localhost:3456/api**

❌ **PROBLEMA:** Variable de entorno mal configurada (igual que alertas)

✅ **SOLUCIÓN:** Ya tengo el fix listo, solo esperando confirmación

### **Escenario 2: API_URL = /api pero Response status = 404**

❌ **PROBLEMA:** El endpoint no existe en Railway

✅ **SOLUCIÓN:** Verificar rutas del backend

### **Escenario 3: API_URL = /api pero Response status = 500**

❌ **PROBLEMA:** Error en el backend

✅ **SOLUCIÓN:** Ver logs del backend en Railway

### **Escenario 4: API_URL = /api pero nunca llega Response status**

❌ **PROBLEMA:** Request colgado (timeout, CORS, etc.)

✅ **SOLUCIÓN:** Investigar network tab

---

## 🔧 FIX PREPARADO (pendiente de confirmación):

Si el problema es el mismo que alertas (`API_URL = localhost:3456`), el fix es simple:

**ANTES:**
```typescript
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');
```

**DESPUÉS:**
Será el mismo fix que aplicamos para alertas, usando detección dinámica dentro de las funciones.

---

## ⚡ ACCIONES RÁPIDAS:

### **Si ves API_URL: http://localhost:3456/api**

Aplicaré el mismo fix que para alertas de stock.

### **Si ves API_URL: /api pero status 404**

Verificaré que el endpoint exista en el backend:
```
GET /api/ventas/cliente/:sucursal/:clienteId/productos
```

### **Si ves API_URL: /api pero status 500**

Necesitaré los logs del backend:
1. Railway → Backend → Logs
2. Copia las últimas 50 líneas

---

## 📊 CHECKLIST:

```
[ ] Esperé 3 minutos después del push
[ ] Railway deployment está en verde 🟢
[ ] Abrí /customers en Railway
[ ] Abrí consola (F12)
[ ] Click en "Ver Ventas" de un cliente
[ ] Click en pestaña "Productos"
[ ] Vi mensajes [DEBUG Productos Cliente]
[ ] Hice screenshot de la consola
[ ] Copié el valor de API_URL
```

---

## 📝 MIENTRAS ESPERAS:

**Prueba en local que funcione:**

```bash
npm run dev
# Ve a: http://localhost:5678/customers
# Click en "Ver Ventas"
# Click en "Productos"
# Debería funcionar y mostrar productos
```

---

**Cuando tengas el screenshot de la consola en Railway, muéstramelo y aplicaré el fix inmediatamente.** 🔍

