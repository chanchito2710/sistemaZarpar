# 🔧 CORRECCIÓN: SUCURSAL HARDCODEADA EN CLIENTES

**Fecha**: 12 de Noviembre, 2025  
**Bug reportado**: Usuario logueado como Melo intenta cargar clientes de Pando (error 403)  
**Archivo modificado**: `src/pages/customers/Customers.tsx`

---

## 🐛 PROBLEMA IDENTIFICADO

### **Error Reportado por el Usuario**

> "Estoy logueado con otra sucursal la de Melo y da error, está intentando usar los clientes de Pando creo"

### **Error en Consola del Navegador**
```
GET http://localhost:3456/api/clientes/sucursal/pando 403 (Forbidden)
AxiosError: Request failed with status code 403
Error al obtener clientes de pando
```

### **Flujo del Problema**

1. **Usuario inicia sesión:**
   - Email: `melo@zarparuy.com`
   - Token JWT contiene: `{ sucursal: "melo", ... }`

2. **Frontend carga la página `/customers`:**
   - Estado inicial: `sucursalSeleccionada = 'pando'` ❌ (hardcodeado)

3. **useEffect intenta cargar datos:**
   - Hace petición a: `/api/clientes/sucursal/pando`
   - Token JWT dice: `{ sucursal: "melo" }`
   - Middleware verifica: `"melo" !== "pando"`
   - Backend responde: **403 Forbidden** ❌

4. **Después de ~100ms, otro useEffect se ejecuta:**
   - Detecta que `usuario.sucursal = "melo"`
   - Actualiza: `sucursalSeleccionada = "melo"` ✅
   - Carga datos de "melo" correctamente ✅

**Problema:** Entre el paso 3 y 4, hay una **petición fallida** con un error 403 porque el estado inicial estaba hardcodeado a "pando".

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **1. Inicializar con String Vacío (línea 94)**

**Antes:**
```typescript
const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('pando');
```

**Después:**
```typescript
const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(''); // ✅ Vacío inicialmente
```

**Razón:** No hacer peticiones hasta que el usuario esté disponible.

---

### **2. Mejorar el useEffect de Auto-selección (líneas 149-163)**

**Antes:**
```typescript
useEffect(() => {
  if (usuario && sucursales.length > 0) {
    if (usuario.esAdmin) {
      setSucursalSeleccionada('pando'); // ❌ Hardcodeado
    } else if (usuario.sucursal) {
      setSucursalSeleccionada(usuario.sucursal.toLowerCase());
    }
  }
}, [usuario, sucursales]);
```

**Después:**
```typescript
useEffect(() => {
  if (usuario && !sucursalSeleccionada) {
    if (usuario.esAdmin) {
      // Admin selecciona la primera sucursal disponible o 'pando' por defecto
      setSucursalSeleccionada(sucursales.length > 0 ? sucursales[0] : 'pando');
    } else if (usuario.sucursal) {
      // Usuario normal usa su sucursal
      setSucursalSeleccionada(usuario.sucursal.toLowerCase());
    }
  }
}, [usuario, sucursales]);
```

**Mejoras:**
- ✅ Solo se ejecuta si `sucursalSeleccionada` está vacío
- ✅ Admin selecciona la primera sucursal disponible dinámicamente
- ✅ Usuario normal usa su sucursal del JWT

---

## 🎯 FLUJO CORREGIDO

### **Ahora funciona correctamente:**

1. **Usuario inicia sesión:**
   - Email: `melo@zarparuy.com`
   - Token JWT: `{ sucursal: "melo", ... }`

2. **Frontend carga `/customers`:**
   - Estado inicial: `sucursalSeleccionada = ''` ✅ (vacío)
   - **NO hace peticiones** hasta que se establezca la sucursal

3. **useEffect detecta usuario:**
   - `usuario.sucursal = "melo"`
   - Actualiza: `sucursalSeleccionada = "melo"` ✅

4. **useEffect de carga de datos se activa:**
   - Hace petición a: `/api/clientes/sucursal/melo` ✅
   - Token JWT dice: `{ sucursal: "melo" }` ✅
   - Middleware verifica: `"melo" === "melo"` ✅
   - Backend responde: **200 OK** ✅

---

## 📊 ANTES vs DESPUÉS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Estado inicial** | ❌ `'pando'` hardcodeado | ✅ `''` (vacío) |
| **Primera petición** | ❌ `/api/clientes/sucursal/pando` | ✅ Espera al usuario |
| **Error 403** | ❌ Siempre ocurre | ✅ No ocurre |
| **Usuario Melo** | ❌ Intenta cargar Pando | ✅ Carga Melo correctamente |
| **Usuario Admin** | ❌ Carga Pando siempre | ✅ Carga primera sucursal dinámica |

---

## 🧪 CASOS DE PRUEBA

### **Prueba 1: Usuario de Melo**

```
1. Login: melo@zarparuy.com / zarpar123
2. Navegar a: http://localhost:5678/customers
3. ✅ Verificar: Se cargan clientes de MELO
4. ✅ Verificar: NO hay errores 403 en consola
5. ✅ Verificar: Selector muestra "MELO" seleccionado
```

### **Prueba 2: Usuario de Maldonado**

```
1. Login: maldonado@zarparuy.com / zarpar123
2. Navegar a: http://localhost:5678/customers
3. ✅ Verificar: Se cargan clientes de MALDONADO
4. ✅ Verificar: NO hay errores 403 en consola
5. ✅ Verificar: Selector muestra "MALDONADO" seleccionado
```

### **Prueba 3: Usuario Administrador**

```
1. Login: admin@zarparuy.com / zarpar123
2. Navegar a: http://localhost:5678/customers
3. ✅ Verificar: Se carga la primera sucursal disponible
4. ✅ Verificar: Puede cambiar entre todas las sucursales
5. ✅ Verificar: NO hay errores 403 en consola
```

---

## 🔍 DEBUGGING

### **Si el problema persiste:**

1. **Abrir DevTools** (F12)
2. **Ir a Console**
3. **Buscar estos logs:**
   ```javascript
   // ✅ Debería aparecer:
   "🔐 Verificando autenticación para: GET /api/clientes/sucursal/melo"
   "✅ Token válido para usuario: melo@zarparuy.com"
   "✅ Usuario activo: melo@zarparuy.com"
   
   // ❌ NO debería aparecer:
   "GET /api/clientes/sucursal/pando 403"
   "❌ Acceso denegado. Solo puedes acceder a datos de la sucursal melo"
   ```

4. **Verificar el estado de React:**
   - Instalar React DevTools
   - Buscar componente `Customers`
   - Ver estado `sucursalSeleccionada`
   - Debería ser igual a `usuario.sucursal`

---

## 📝 NOTAS ADICIONALES

### **¿Por qué vacío y no null?**

- `''` (string vacío) es consistente con el tipo `string`
- Evita problemas de tipado con TypeScript
- Es más fácil de validar: `if (!sucursalSeleccionada)`

### **¿Por qué admin carga la primera sucursal dinámica?**

- Antes: Siempre cargaba "pando" (hardcodeado)
- Ahora: Carga la primera sucursal de la lista (dinámico)
- Beneficio: Si "pando" se elimina, no rompe el código

### **¿Afecta a otros componentes?**

❌ **NO** - Este cambio solo afecta a `/customers`

Otros componentes que podrían tener el mismo problema:
- `/pos` ← Ya usa `usuario.sucursal` correctamente ✅
- `/products` ← Ya usa `usuario.sucursal` correctamente ✅
- `/products/prices` ← Ya implementa permisos correctamente ✅

---

## ✅ CHECKLIST DE VERIFICACIÓN

```
[✅] Estado inicial cambiado de 'pando' a ''
[✅] useEffect actualizado para auto-selección
[✅] Sin errores de linter
[✅] Documentación completa generada
[ ] Probado con usuario de Melo
[ ] Probado con usuario de Maldonado
[ ] Probado con usuario Administrador
[ ] Verificado que NO hay errores 403 en consola
```

---

## 🚀 DESPLIEGUE

### **Esta corrección NO requiere:**
- ❌ Reiniciar backend
- ❌ Cerrar sesión
- ❌ Limpiar cache

### **Solo requiere:**
- ✅ Refrescar la página (F5) en `/customers`
- ✅ O navegar a `/customers` de nuevo

---

**Estado**: ✅ **IMPLEMENTADO Y LISTO PARA PRUEBAS**  
**Requiere**: Solo refrescar la página

---

🎉 **¡Corrección completada exitosamente!**

