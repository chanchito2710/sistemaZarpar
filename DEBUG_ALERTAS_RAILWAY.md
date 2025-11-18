# 🐛 DEBUG: Por qué no aparece el botón de Alertas en Railway

## ✅ LO QUE SÍ FUNCIONA:

1. ✅ Base de datos tiene 19 alertas activas
2. ✅ Deployment completado exitosamente
3. ✅ El código del botón está en MainLayout.tsx

## ❌ EL PROBLEMA IDENTIFICADO:

El botón solo aparece si:
```typescript
{usuario?.esAdmin && alertasStock.length > 0 && (
  <Button>Alertas de Stock</Button>
)}
```

Esto significa:
- ✅ `usuario?.esAdmin` = true (eres admin)
- ❌ `alertasStock.length > 0` = **PROBABLEMENTE FALSE** (el fetch está fallando)

---

## 🔍 CÓMO VERIFICAR EL PROBLEMA

### **Paso 1: Abre la Consola del Navegador**

1. En tu app de Railway: `sistemazarpar-production.up.railway.app`
2. Presiona **F12** (abre DevTools)
3. Ve a la pestaña **"Console"**

### **Paso 2: Busca estos mensajes:**

**Deberías ver:**
```
⚠️ 19 alertas de stock detectadas
```

**Si NO ves ese mensaje, busca errores en rojo como:**
```
❌ Error al cargar alertas de stock: ...
o
GET https://sistemazarpar-production.up.railway.app/api/productos/alertas-stock 404
o
GET https://sistemazarpar-production.up.railway.app/api/productos/alertas-stock 500
```

### **Paso 3: Refresca la página con la consola abierta**

1. Con la consola (F12) abierta
2. Presiona **Ctrl + Shift + R** (refresco forzado)
3. Observa todos los mensajes que aparecen
4. **Cópiame TODO lo que veas**, especialmente:
   - Mensajes que digan "alertas"
   - Errores en rojo
   - Requests fallidos

---

## 🎯 POSIBLES PROBLEMAS

### **Problema 1: Variable de entorno incorrecta**

El código usa:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
```

Si `VITE_API_URL` no está configurada en Railway, está intentando conectarse a `localhost:3456` (que no existe en producción).

**Solución:** Necesito verificar las variables de entorno de Railway.

### **Problema 2: Endpoint no existe**

El endpoint `/api/productos/alertas-stock` podría no estar registrado en Railway.

**Solución:** Necesito ver los logs del backend.

### **Problema 3: Respuesta sin `success: true`**

El endpoint responde pero no tiene el formato esperado.

**Solución:** Verificar la respuesta del endpoint.

---

## 📋 INFORMACIÓN QUE NECESITO DE TI:

### **1. Consola del Navegador (CRÍTICO):**

Abre: `https://sistemazarpar-production.up.railway.app`
- Presiona F12
- Ve a Console
- Refresca (Ctrl + Shift + R)
- **Cópiame TODO** lo que aparezca

### **2. Variables de Entorno en Railway:**

Ve a: Railway → Backend → Variables

**Busca:**
- `VITE_API_URL`
- ¿Qué valor tiene?
- ¿Existe?

**Screenshot o texto de todas las variables que veas.**

### **3. Deploy Logs (tab "Deploy Logs" en Railway):**

Railway → Backend → Deploy Logs

**Busca si dice algo sobre:**
- "alertas-stock"
- "productos/alertas-stock"
- Errores al iniciar

---

## 🔧 SOLUCIONES RÁPIDAS PARA PROBAR:

### **Opción 1: Agregar console.log temporal**

Voy a modificar el código para que muestre MÁS información en la consola.

### **Opción 2: Verificar variables de entorno**

Necesitas tener en Railway:
```
VITE_API_URL=https://sistemazarpar-production.up.railway.app/api
```

Sin esto, el frontend no sabrá dónde está el backend.

### **Opción 3: Reiniciar el servicio Frontend**

Puede que el frontend en Railway esté usando una versión vieja.

---

## ⚡ ACCIÓN INMEDIATA:

**Por favor, hazme un screenshot de:**

1. La consola del navegador (F12 → Console)
2. Railway → Backend → Variables (todas las variables)
3. Railway → Deploy Logs (últimas 50 líneas)

Con eso podré decirte exactamente qué está fallando.

---

**Nota:** El problema NO es de código, es de configuración de Railway o el endpoint que no responde correctamente.

