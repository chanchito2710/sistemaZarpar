# 🎯 FUNCIONAMIENTO DEL SISTEMA POS POR ROLES

## 📋 RESUMEN EJECUTIVO

El sistema POS (`http://localhost:5678/pos`) tiene **dos comportamientos diferentes** según el usuario que inicie sesión:

---

## 👑 COMPORTAMIENTO PARA ADMINISTRADOR

**Usuario:** `admin@zarparuy.com`

### ✅ Selectores TOTALMENTE HABILITADOS

| Selector | Estado | Comportamiento |
|----------|--------|----------------|
| **Sucursal** | ✅ Habilitado | Puede elegir cualquier sucursal de la lista |
| **Cliente** | ✅ Habilitado | Puede elegir cualquier cliente de la sucursal seleccionada |
| **Vendedor** | ✅ Habilitado | Puede elegir cualquier vendedor de la sucursal seleccionada |

### 📊 Flujo de Trabajo del Admin

```
1. 🔓 Login como admin@zarparuy.com
   ↓
2. 🏢 Entra al POS
   ↓
3. ✅ Selector de SUCURSAL: Habilitado
   - Ve todas las sucursales: Pando, Maldonado, Rivera, Melo, Paysandú, Salto, Tacuarembó
   - Puede elegir la que quiera
   ↓
4. ✅ Selector de CLIENTE: Habilitado
   - Al seleccionar una sucursal (ej: Pando)
   - Se cargan los clientes de clientes_pando
   - Puede elegir cualquier cliente de esa sucursal
   ↓
5. ✅ Selector de VENDEDOR: Habilitado
   - Al seleccionar una sucursal (ej: Pando)
   - Se cargan los vendedores de esa sucursal
   - Puede elegir cualquier vendedor
   ↓
6. ➡️ Click en "Siguiente"
   - Continúa al módulo de productos con todos los datos seleccionados
```

### 💡 Ejemplo Práctico Admin

```
Escenario: El administrador quiere hacer una venta para Pando

1. ✅ Selecciona "Pando" en sucursal
2. ✅ Selecciona "Juan Pérez" en cliente (de clientes_pando)
3. ✅ Selecciona "Vendedor Pando" en vendedor
4. ➡️ Continúa a productos
```

---

## 👤 COMPORTAMIENTO PARA VENDEDORES

**Usuarios:** `pando@zarparuy.com`, `maldonado@zarparuy.com`, `rivera@zarparuy.com`, etc.

### 🔒 Selectores AUTO-SELECCIONADOS Y BLOQUEADOS

| Selector | Estado | Comportamiento |
|----------|--------|----------------|
| **Sucursal** | 🔒 Bloqueado | Se auto-selecciona su sucursal y NO puede cambiarla |
| **Cliente** | ✅ Habilitado | Puede elegir solo clientes de SU sucursal |
| **Vendedor** | 🔒 Bloqueado | Se auto-selecciona su vendedor y NO puede cambiarlo |

### 📊 Flujo de Trabajo del Vendedor

```
1. 🔓 Login como pando@zarparuy.com (ejemplo)
   ↓
2. 🏢 Entra al POS
   ↓
3. 🔒 Selector de SUCURSAL: AUTO-SELECCIONADO "Pando" + BLOQUEADO
   - El sistema detecta que el email es pando@zarparuy.com
   - Automáticamente selecciona "Pando"
   - El selector queda deshabilitado (gris)
   - NO puede cambiar a otra sucursal
   ↓
4. ✅ Selector de CLIENTE: Habilitado (solo de Pando)
   - Se cargan automáticamente los clientes de clientes_pando
   - Puede elegir cualquier cliente de Pando
   - NO puede ver clientes de otras sucursales
   ↓
5. 🔒 Selector de VENDEDOR: AUTO-SELECCIONADO + BLOQUEADO
   - Se cargan los vendedores de Pando
   - El sistema busca el vendedor con email pando@zarparuy.com
   - Automáticamente selecciona ese vendedor
   - El selector queda deshabilitado (gris)
   - Muestra mensaje: "Auto-seleccionado según tu usuario"
   ↓
6. ➡️ Click en "Siguiente"
   - Continúa al módulo de productos con:
     * Sucursal: Pando (fija)
     * Vendedor: Vendedor de Pando (fijo)
     * Cliente: El que eligió
```

### 💡 Ejemplo Práctico Vendedor

```
Escenario: El vendedor de Melo quiere hacer una venta

1. 🔓 Login como melo@zarparuy.com
2. 🏢 Entra al POS
3. 🔒 Sucursal: "Melo" (auto-seleccionado, bloqueado)
4. ✅ Cliente: Elige "Ana García" de clientes_melo
5. 🔒 Vendedor: "Vendedor Melo" (auto-seleccionado, bloqueado)
6. ➡️ Continúa a productos
```

---

## 🔧 DETALLES TÉCNICOS DE LA IMPLEMENTACIÓN

### 1. Detección de Rol

```typescript
// El sistema verifica si el usuario es admin
if (usuario.email === 'admin@zarparuy.com') {
  // Es ADMIN → Todos los selectores habilitados
} else {
  // Es VENDEDOR → Auto-selección y bloqueo
}
```

### 2. Auto-Selección de Sucursal (Solo Vendedores)

```typescript
// En src/pages/pos/POS.tsx líneas 69-79
useEffect(() => {
  if (usuario && sucursales.length > 0) {
    // Si NO es admin, auto-seleccionar su sucursal
    if (!usuario.esAdmin) {
      const sucursalUsuario = usuario.sucursal?.toLowerCase();
      if (sucursalUsuario && sucursales.includes(sucursalUsuario)) {
        setSelectedBranch(sucursalUsuario); // Auto-selecciona
      }
    }
  }
}, [usuario, sucursales]);
```

### 3. Bloqueo de Selector de Sucursal (Solo Vendedores)

```typescript
// En src/pages/pos/POS.tsx línea 371
<Select
  disabled={!usuario?.esAdmin && !!selectedBranch}
  // Si NO es admin Y ya hay sucursal seleccionada → BLOQUEADO
>
```

**Explicación:**
- `!usuario?.esAdmin` → Si NO es admin (true para vendedores)
- `!!selectedBranch` → Si hay una sucursal seleccionada (true después de auto-selección)
- Resultado: `true && true = true` → `disabled={true}` → **BLOQUEADO** ✅

### 4. Auto-Selección de Vendedor (Solo Vendedores)

```typescript
// En src/pages/pos/POS.tsx líneas 105-138
useEffect(() => {
  if (
    vendedores.length > 0 && 
    usuario && 
    !usuario.esAdmin && 
    selectedBranch
  ) {
    const sucursalUsuario = usuario.sucursal?.toLowerCase();
    const sucursalSeleccionada = selectedBranch.toLowerCase();
    
    if (sucursalUsuario === sucursalSeleccionada) {
      // Buscar el vendedor con el email del usuario
      const vendedorUsuario = vendedores.find(v => 
        v.email?.toLowerCase() === usuario.email?.toLowerCase()
      );
      
      if (vendedorUsuario) {
        setSelectedSeller(vendedorUsuario.id); // Auto-selecciona
      }
    }
  }
}, [vendedores, usuario, selectedBranch]);
```

### 5. Bloqueo de Selector de Vendedor (Solo Vendedores)

```typescript
// En src/pages/pos/POS.tsx línea 470
<Select
  disabled={
    !selectedBranch || 
    loadingVendedores || 
    (!usuario?.esAdmin && !!selectedSeller)
  }
>
```

**Explicación:**
- `!selectedBranch` → Si no hay sucursal, bloqueado
- `loadingVendedores` → Si está cargando, bloqueado
- `(!usuario?.esAdmin && !!selectedSeller)` → Si NO es admin Y ya hay vendedor → **BLOQUEADO** ✅

---

## 📊 TABLA COMPARATIVA RÁPIDA

| Característica | Admin | Vendedor |
|----------------|-------|----------|
| **Email** | admin@zarparuy.com | sucursal@zarparuy.com |
| **Sucursal Selector** | ✅ Habilitado | 🔒 Auto-seleccionado + Bloqueado |
| **Cliente Selector** | ✅ Habilitado (todas las sucursales) | ✅ Habilitado (solo su sucursal) |
| **Vendedor Selector** | ✅ Habilitado | 🔒 Auto-seleccionado + Bloqueado |
| **Ver clientes de otras sucursales** | ✅ Sí | ❌ No |
| **Cambiar de sucursal** | ✅ Sí | ❌ No |
| **Elegir otro vendedor** | ✅ Sí | ❌ No |

---

## ✅ VERIFICACIÓN DE FUNCIONAMIENTO

### Para Administrador:

1. ✅ Cerrar sesión
2. ✅ Login con `admin@zarparuy.com`
3. ✅ Ir a `/pos`
4. ✅ Verificar que TODOS los selectores están habilitados (no grises)
5. ✅ Elegir "Pando" → Ver clientes de Pando
6. ✅ Cambiar a "Maldonado" → Ver clientes de Maldonado
7. ✅ Poder elegir cualquier vendedor de la sucursal seleccionada

### Para Vendedor:

1. ✅ Cerrar sesión
2. ✅ Login con `melo@zarparuy.com` (ejemplo)
3. ✅ Ir a `/pos`
4. ✅ Verificar que "Melo" está auto-seleccionado y el selector está **GRIS/BLOQUEADO**
5. ✅ Verificar que el vendedor está auto-seleccionado y el selector está **GRIS/BLOQUEADO**
6. ✅ Verificar mensaje "Auto-seleccionado según tu usuario" debajo del vendedor
7. ✅ Solo el selector de cliente está habilitado
8. ✅ Ver únicamente clientes de Melo (clientes_melo)

---

## 🚨 NOTAS IMPORTANTES

1. **"Administrador" NO es una sucursal física**
   - Es un ROL
   - NO aparece en el selector de sucursales
   - El admin SELECCIONA entre las sucursales reales: Pando, Maldonado, Rivera, Melo, Paysandú, Salto, Tacuarembó

2. **Los vendedores NO pueden ver otras sucursales**
   - Seguridad y privacidad de datos
   - Cada vendedor solo ve su información

3. **La relación email → sucursal es automática**
   - `pando@zarparuy.com` → Sucursal "Pando" → clientes_pando
   - `melo@zarparuy.com` → Sucursal "Melo" → clientes_melo

4. **El admin puede seleccionar cualquier combinación**
   - Puede elegir sucursal Pando + vendedor de Pando
   - Puede elegir sucursal Maldonado + vendedor de Maldonado
   - etc.

---

## 🎓 CONCEPTOS QUE APRENDISTE

### 1. **Renderizado Condicional**
Los componentes React pueden cambiar su apariencia y comportamiento según el estado:
```typescript
disabled={!usuario?.esAdmin && !!selectedBranch}
```

### 2. **useEffect con Dependencias**
Se ejecuta automáticamente cuando cambian ciertas variables:
```typescript
useEffect(() => {
  // Se ejecuta cuando cambia vendedores, usuario o selectedBranch
}, [vendedores, usuario, selectedBranch]);
```

### 3. **Rol-Based Access Control (RBAC)**
Control de acceso basado en roles:
- Admin: Acceso total
- Vendedor: Acceso limitado a su sucursal

### 4. **Auto-Selección**
El sistema puede pre-llenar campos automáticamente según el contexto del usuario

### 5. **UI Disabled States**
Deshabilitar controles para prevenir acciones no permitidas

---

**Estado:** ✅ IMPLEMENTADO Y FUNCIONANDO  
**Última actualización:** Octubre 28, 2025  
**Archivo de implementación:** `src/pages/pos/POS.tsx`

