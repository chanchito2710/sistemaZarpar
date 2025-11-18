# 📋 QUÉ HACER AHORA - PASO A PASO

## ✅ LO QUE ACABO DE HACER:

Agregué **logs de debug** al código para que puedas ver **exactamente qué está fallando**.

Railway está redesplergando **AHORA MISMO** con estos logs.

---

## ⏰ ESPERA 3 MINUTOS

Railway necesita compilar y desplegar el nuevo código con los logs.

**Verifica en Railway:**
- Backend → Deployments → Debería aparecer un nuevo deployment "Building" o "Deploying"
- Espera a que esté en verde 🟢

---

## 📋 DESPUÉS DE 3 MINUTOS:

### **Paso 1: Abre tu app**

```
https://sistemazarpar-production.up.railway.app
```

### **Paso 2: Abre la Consola del Navegador**

- Presiona **F12**
- Ve a la pestaña **"Console"**
- Deja la consola abierta

### **Paso 3: Refresca la página FORZADAMENTE**

- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### **Paso 4: Inicia sesión como admin**

- Email: `admin@zarparuy.com`
- Contraseña: `admin123`

### **Paso 5: Observa la consola**

Deberías ver mensajes como estos:

```
🔍 [DEBUG] Iniciando carga de alertas de stock
🔍 [DEBUG] Usuario es admin? true
🔍 [DEBUG] API_URL: https://sistemazarpar-production.up.railway.app/api
🔍 [DEBUG] Full URL: https://sistemazarpar-production.up.railway.app/api/productos/alertas-stock
🔍 [DEBUG] Token existe? true
🔍 [DEBUG] Response status: 200
🔍 [DEBUG] Response ok? true
🔍 [DEBUG] Response data: { ... }
✅ 19 alertas de stock detectadas
```

---

## 📸 NECESITO QUE ME MUESTRES:

### **1. Screenshot de la Consola (CRÍTICO)**

Haz un screenshot de TODA la consola después de refrescar.

**Busca específicamente:**
- Mensajes que digan `[DEBUG]`
- Mensajes en rojo (errores)
- El mensaje `API_URL:` → **¿Qué URL muestra?**
- El mensaje `Response status:` → **¿Qué código muestra? (200, 401, 404, 500?)**

### **2. Variables de Entorno en Railway**

Ve a: **Railway → Backend → Variables**

**Busca:**
- ¿Existe `VITE_API_URL`?
- ¿Qué valor tiene?
- Screenshot o cópiame todas las variables

---

## 🎯 ESCENARIOS POSIBLES:

### **Escenario 1: API_URL = http://localhost:3456/api**

❌ **PROBLEMA:** Variable de entorno mal configurada

✅ **SOLUCIÓN:** Agregar en Railway:
```
VITE_API_URL=https://sistemazarpar-production.up.railway.app/api
```

### **Escenario 2: Response status: 404**

❌ **PROBLEMA:** El endpoint no existe

✅ **SOLUCIÓN:** Verificar que el backend tiene el endpoint registrado

### **Escenario 3: Response status: 401**

❌ **PROBLEMA:** Token inválido o expirado

✅ **SOLUCIÓN:** Cerrar sesión y volver a iniciar

### **Escenario 4: Response status: 500**

❌ **PROBLEMA:** Error en el backend

✅ **SOLUCIÓN:** Verificar logs del backend en Railway

### **Escenario 5: Response success = false**

❌ **PROBLEMA:** El endpoint respondió pero con error

✅ **SOLUCIÓN:** Ver el mensaje de error en Response data

---

## ⚡ ACCIONES RÁPIDAS:

### **Si ves API_URL: http://localhost:3456/api**

Necesitas agregar la variable de entorno en Railway:

1. Railway → Backend → Variables
2. Click en **"New Variable"**
3. Name: `VITE_API_URL`
4. Value: `https://sistemazarpar-production.up.railway.app/api`
5. Click en **"Add"**
6. **Reiniciar el servicio**

### **Si ves Response status: 401**

1. Cierra sesión en la app
2. Vuelve a iniciar sesión
3. Refresca la consola

### **Si ves algún error en rojo**

Cópiame TODO el error, tal cual aparece.

---

## 📊 CHECKLIST:

```
[ ] Esperé 3 minutos después del push
[ ] Railway deployment está en verde 🟢
[ ] Abrí la app de Railway
[ ] Abrí la consola (F12)
[ ] Refresqué con Ctrl + Shift + R
[ ] Inicié sesión como admin
[ ] Vi mensajes [DEBUG] en la consola
[ ] Hice screenshot de TODA la consola
[ ] Verifiqué las variables de entorno en Railway
```

---

**Cuando tengas el screenshot de la consola y las variables, me lo muestras y te digo exactamente qué arreglar.** 🔍

