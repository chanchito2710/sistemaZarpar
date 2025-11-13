# 🚨 IMPORTANTE: INSTRUCCIONES PARA CARGAR CLIENTES

**Fecha**: 12 de Noviembre, 2025  
**Problema resuelto**: Error 403 al cargar clientes en `/customers`

---

## ⚠️ **ACCIÓN REQUERIDA: CERRAR E INICIAR SESIÓN NUEVAMENTE**

Para que los clientes carguen correctamente, **DEBES** hacer lo siguiente:

---

## 📋 **PASOS A SEGUIR (OBLIGATORIOS)**

### **1. Cerrar Sesión Actual**

1. Ve a tu perfil en la esquina superior derecha
2. Haz clic en "Cerrar Sesión" o "Logout"
3. Serás redirigido a la página de login

**O alternativamente:**

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Ejecuta este comando:
   ```javascript
   localStorage.removeItem('token')
   ```
4. Refresca la página (F5)

---

### **2. Iniciar Sesión Nuevamente**

Ve a: http://localhost:5678/login

**Usa tus credenciales:**

#### Si eres **Administrador**:
```
Email: admin@zarparuy.com
Contraseña: zarpar123
```

#### Si eres **Usuario de Pando**:
```
Email: pando@zarparuy.com
Contraseña: zarpar123
```

#### Si eres **Usuario de Maldonado**:
```
Email: maldonado@zarparuy.com
Contraseña: zarpar123
```

*(Y así con las demás sucursales)*

---

### **3. Verificar que Funcione**

1. Una vez logueado, ve a:
   ```
   http://localhost:5678/customers
   ```

2. **Deberías ver:**
   - ✅ Lista de clientes cargada
   - ✅ Sin errores en consola (F12 → Console)
   - ✅ Selector de sucursal funcionando

3. **Si ves errores 403:**
   - Repite el paso 1 (cerrar sesión completamente)
   - Limpia el localStorage manualmente
   - Inicia sesión nuevamente

---

## 🔍 **¿POR QUÉ NECESITO HACER ESTO?**

### **Explicación Simple:**

Tu sesión actual tiene un "pase de acceso" (token JWT) que fue generado con el formato antiguo de sucursales. Este token tiene tu sucursal en **MAYÚSCULAS** (ej: "PANDO"), pero el sistema ahora espera que esté en **minúsculas** (ej: "pando").

Al cerrar sesión e iniciar sesión nuevamente, obtienes un **nuevo pase de acceso** con el formato correcto, y entonces todo funciona.

### **Analogía:**

Es como tener una llave vieja (token antiguo) que ya no abre la puerta (permisos de sucursal). Al cerrar sesión y volver a iniciar, obtienes una **llave nueva** (token actualizado) que sí abre la puerta correctamente.

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

Después de seguir los pasos, verifica que:

```
[ ] Cerraste sesión completamente
[ ] Iniciaste sesión nuevamente con tus credenciales
[ ] Navegaste a http://localhost:5678/customers
[ ] La lista de clientes cargó correctamente
[ ] NO hay errores 403 en la consola del navegador
[ ] El selector de sucursal funciona correctamente
```

---

## 🐛 **SI EL PROBLEMA PERSISTE**

### **Opción 1: Limpiar Cache y LocalStorage**

1. **Abrir DevTools** (F12)
2. **Ir a:** Application → Storage
3. **Hacer clic en:** "Clear site data"
4. **Refrescar la página** (F5)
5. **Iniciar sesión nuevamente**

### **Opción 2: Limpiar Cache del Navegador**

**Google Chrome:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Cookies y otros datos de sitios"
3. Selecciona "Imágenes y archivos almacenados en caché"
4. Haz clic en "Borrar datos"

**Firefox:**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Cookies" y "Caché"
3. Haz clic en "Limpiar ahora"

### **Opción 3: Usar Modo Incógnito**

1. **Abre una ventana de incógnito:**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. **Navega a:** http://localhost:5678/login

3. **Inicia sesión** con tus credenciales

4. **Ve a:** http://localhost:5678/customers

5. **Si funciona en incógnito pero no en normal:**
   - Significa que tu navegador normal tiene cache corrupto
   - Limpia el cache completamente (Opción 1 o 2)

---

## 📞 **SOPORTE**

Si después de seguir todos estos pasos el problema persiste:

1. **Abre la consola del navegador** (F12 → Console)
2. **Copia TODOS los errores** que aparezcan en rojo
3. **Comparte esos errores** para poder diagnosticar

### **Información útil para soporte:**

- ¿Qué navegador estás usando? (Chrome, Firefox, Edge, etc.)
- ¿Qué usuario estás intentando usar? (admin, pando, maldonado, etc.)
- ¿Ves algún error 403 en la consola?
- ¿Cerraste sesión completamente antes de volver a iniciar?

---

## 🎯 **RESUMEN RÁPIDO**

```
1. Cerrar sesión actual
2. Iniciar sesión nuevamente
3. Navegar a /customers
4. Verificar que carguen los clientes
5. ¡Listo! ✅
```

---

**Tiempo estimado**: 1-2 minutos  
**Dificultad**: Muy fácil ⭐  
**Requiere conocimientos técnicos**: No

---

🎉 **¡Gracias por tu paciencia!**

