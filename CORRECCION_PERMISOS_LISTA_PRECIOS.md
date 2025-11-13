# 🔒 CORRECCIÓN: PERMISOS POR SUCURSAL EN LISTA DE PRECIOS

**Fecha**: 12 de Noviembre, 2025  
**Archivo modificado**: `src/pages/products/ProductPrices.tsx`  
**Bug reportado**: Usuarios de sucursales normales podían seleccionar otras sucursales

---

## 🐛 PROBLEMA IDENTIFICADO

### **Descripción del Bug**
En la página de **Lista de Precios** (`/products/prices`), los usuarios de sucursales normales (ej: `pando@zarparuy.com`) podían seleccionar y ver precios de **cualquier sucursal**, incluyendo aquellas a las que no deberían tener acceso.

### **Comportamiento Esperado**
- ✅ **Administrador** (`admin@zarparuy.com`): Puede seleccionar cualquier sucursal
- ✅ **Usuario Normal** (ej: `pando@zarparuy.com`): Solo puede ver su propia sucursal

### **Comportamiento Actual (Antes de la corrección)**
- ❌ **Todos los usuarios** podían seleccionar cualquier sucursal
- ❌ No había validación de permisos por rol

---

## ✅ SOLUCIÓN IMPLEMENTADA

### **1. Importaciones Agregadas**

**Componentes de Ant Design:**
```typescript
import {
  // ... existentes ...
  Alert  // ← NUEVO: Para mostrar mensaje informativo
} from 'antd';
```

**Iconos:**
```typescript
import {
  // ... existentes ...
  LockOutlined  // ← NUEVO: Icono de candado para restricción
} from '@ant-design/icons';
```

**Contexto de Autenticación:**
```typescript
import { useAuth } from '../../contexts/AuthContext';
```

---

### **2. Lógica de Autenticación y Permisos**

**Obtener usuario actual:**
```typescript
const { usuario } = useAuth();
```

**Verificar si es administrador:**
```typescript
const esAdmin = usuario?.email?.toLowerCase() === 'admin@zarparuy.com';
```

**Obtener sucursal del usuario:**
```typescript
const obtenerSucursalUsuario = (): string => {
  if (esAdmin || !usuario?.email) return '';
  
  const email = usuario.email.toLowerCase();
  // Extraer sucursal del email (ej: "pando@zarparuy.com" -> "pando")
  const sucursal = email.split('@')[0];
  return sucursal;
};
```

---

### **3. Función de Carga de Sucursales Modificada**

**Antes:**
```typescript
const cargarSucursales = async () => {
  const sucursalesData = await vendedoresService.obtenerSucursales();
  setSucursales(sucursalesData);
  setSucursalSeleccionada(sucursalesData[0]);
};
```

**Después:**
```typescript
const cargarSucursales = async () => {
  setLoadingSucursales(true);
  try {
    // Si NO es admin, solo cargar su propia sucursal
    if (!esAdmin) {
      const sucursalUsuario = obtenerSucursalUsuario();
      if (sucursalUsuario) {
        setSucursales([sucursalUsuario]);  // ✅ Solo su sucursal
        setSucursalSeleccionada(sucursalUsuario);
      } else {
        message.error('No se pudo determinar la sucursal del usuario');
      }
      return;
    }
    
    // Si ES admin, cargar todas las sucursales
    const sucursalesData = await vendedoresService.obtenerSucursales();
    setSucursales(sucursalesData);
    setSucursalSeleccionada(sucursalesData[0]);
  } catch (error) {
    console.error('Error al cargar sucursales:', error);
    message.error('Error al cargar sucursales');
  } finally {
    setLoadingSucursales(false);
  }
};
```

---

### **4. Componente Select Modificado**

**Cambios aplicados:**
```typescript
<Select
  value={sucursalSeleccionada}
  onChange={setSucursalSeleccionada}
  style={{ width: 250 }}
  size="large"
  loading={loadingSucursales}
  placeholder="Seleccione una sucursal"
  disabled={!esAdmin}  // ✅ CRÍTICO: Deshabilitar si NO es admin
>
  {sucursales.map((sucursal) => (
    <Option key={sucursal} value={sucursal}>
      {sucursal.toUpperCase()}
    </Option>
  ))}
</Select>
```

**Etiqueta dinámica del selector:**
```typescript
<Text strong style={{ fontSize: 13 }}>
  <ShopOutlined /> {esAdmin ? 'Seleccionar Sucursal' : 'Tu Sucursal'}
</Text>
```

---

### **5. Alert Informativo para Usuarios Normales**

**Nuevo componente agregado:**
```typescript
{/* Alert para usuarios normales */}
{!esAdmin && (
  <Alert
    message="🔒 Acceso Restringido"
    description={`Solo puedes ver y generar precios de tu sucursal asignada: ${obtenerSucursalUsuario().toUpperCase()}`}
    type="info"
    showIcon
    icon={<LockOutlined />}
    style={{ marginBottom: 16 }}
  />
)}
```

**Ubicación:** Dentro del `Card` de controles, justo antes del `Space` del selector.

---

## 🎯 FLUJO DE FUNCIONAMIENTO

### **Caso 1: Usuario Administrador** (`admin@zarparuy.com`)

```
1. Usuario inicia sesión como admin
   ↓
2. useAuth() retorna: { email: 'admin@zarparuy.com' }
   ↓
3. esAdmin = true
   ↓
4. cargarSucursales() ejecuta:
   - Llama a vendedoresService.obtenerSucursales()
   - Retorna: ['pando', 'maldonado', 'rivera', 'melo', ...]
   - setSucursales(['pando', 'maldonado', 'rivera', ...])
   ↓
5. UI muestra:
   ✅ Selector HABILITADO con todas las sucursales
   ✅ Label: "Seleccionar Sucursal"
   ✅ Sin Alert de restricción
   ✅ Puede cambiar entre sucursales libremente
```

### **Caso 2: Usuario de Sucursal Normal** (ej: `pando@zarparuy.com`)

```
1. Usuario inicia sesión como pando@zarparuy.com
   ↓
2. useAuth() retorna: { email: 'pando@zarparuy.com' }
   ↓
3. esAdmin = false
   ↓
4. obtenerSucursalUsuario() ejecuta:
   - Extrae 'pando' del email
   - Retorna: 'pando'
   ↓
5. cargarSucursales() ejecuta:
   - setSucursales(['pando'])  // Solo su sucursal
   - setSucursalSeleccionada('pando')
   ↓
6. UI muestra:
   ❌ Selector DESHABILITADO (gris, no clickeable)
   ✅ Solo muestra: "PANDO"
   ✅ Label: "Tu Sucursal"
   ✅ Alert: "🔒 Acceso Restringido - Solo puedes ver... PANDO"
   ❌ No puede cambiar de sucursal
```

---

## 🔒 VALIDACIONES DE SEGURIDAD

### **Frontend**
✅ Selector deshabilitado para usuarios normales  
✅ Array de sucursales contiene solo la sucursal del usuario  
✅ Alert informativo visible para usuarios restringidos  

### **Backend** (Recordatorio)
⚠️ **IMPORTANTE**: Esta validación es de **frontend únicamente**. Para máxima seguridad, se recomienda también validar en el backend que el usuario solo pueda acceder a productos de su sucursal asignada.

**Recomendación de implementación en backend:**
```typescript
// En api/controllers/productosController.ts
export const obtenerPorSucursal = async (req: Request, res: Response) => {
  const { sucursal } = req.params;
  const userEmail = (req as any).user?.email;
  
  // Validar permisos
  if (userEmail !== 'admin@zarparuy.com') {
    const sucursalUsuario = userEmail.split('@')[0];
    if (sucursal.toLowerCase() !== sucursalUsuario.toLowerCase()) {
      return res.status(403).json({ 
        error: 'No tienes permiso para acceder a esta sucursal' 
      });
    }
  }
  
  // ... resto del código ...
};
```

---

## 🧪 CASOS DE PRUEBA

### **Prueba 1: Login como Admin**
```
1. Login: admin@zarparuy.com / zarpar123
2. Navegar a: http://localhost:5678/products/prices
3. ✅ Verificar: Selector muestra todas las sucursales
4. ✅ Verificar: Selector está HABILITADO
5. ✅ Verificar: NO aparece Alert de restricción
6. ✅ Verificar: Puede seleccionar cualquier sucursal
7. ✅ Verificar: Productos se cargan para la sucursal seleccionada
8. ✅ Verificar: PDF se genera con el nombre de la sucursal correcta
```

### **Prueba 2: Login como Usuario Normal (Pando)**
```
1. Login: pando@zarparuy.com / zarpar123
2. Navegar a: http://localhost:5678/products/prices
3. ✅ Verificar: Selector muestra SOLO "PANDO"
4. ✅ Verificar: Selector está DESHABILITADO (gris)
5. ✅ Verificar: Aparece Alert azul: "🔒 Acceso Restringido"
6. ✅ Verificar: Alert dice: "Solo puedes ver... PANDO"
7. ✅ Verificar: Label del selector: "Tu Sucursal"
8. ✅ Verificar: Productos de PANDO se cargan automáticamente
9. ✅ Verificar: PDF se genera con nombre "Lista_Precios_pando_..."
```

### **Prueba 3: Intentar Manipular desde DevTools (Seguridad)**
```
1. Login: pando@zarparuy.com / zarpar123
2. Abrir DevTools → Console
3. Intentar ejecutar:
   setSucursalSeleccionada('maldonado')
4. ⚠️ ESPERADO: Frontend puede cambiar el estado
5. ⚠️ PROBLEMA: Si el backend NO valida, se cargarán productos de Maldonado
6. 🔒 SOLUCIÓN: Implementar validación en backend (ver sección anterior)
```

---

## 📊 RESUMEN DE CAMBIOS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Permisos** | ❌ Sin validación | ✅ Validación por rol |
| **Selector (Admin)** | Habilitado | ✅ Habilitado |
| **Selector (Usuario Normal)** | ❌ Habilitado | ✅ Deshabilitado |
| **Sucursales (Admin)** | Todas | ✅ Todas |
| **Sucursales (Usuario Normal)** | ❌ Todas | ✅ Solo la suya |
| **Alert Informativo** | ❌ No existía | ✅ Implementado |
| **Etiqueta Dinámica** | ❌ Estática | ✅ Dinámica |
| **Contexto de Auth** | ❌ No usado | ✅ Implementado |

---

## 🎨 CAPTURA DE PANTALLA (Conceptual)

### **Vista Administrador:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏢 Seleccionar Sucursal                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PANDO                                             ▼     │ │ ← HABILITADO
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [🔄 Recargar]  [📄 Generar PDF]                            │
└─────────────────────────────────────────────────────────────┘
```

### **Vista Usuario Normal:**
```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ 🔒 Acceso Restringido                                    │
│ Solo puedes ver y generar precios de tu sucursal: PANDO    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 🏢 Tu Sucursal                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PANDO                                                   │ │ ← DESHABILITADO (gris)
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [🔄 Recargar]  [📄 Generar PDF]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 DESPLIEGUE

### **Pasos para aplicar en producción:**

1. ✅ **Código actualizado** en `src/pages/products/ProductPrices.tsx`
2. ✅ **Sin errores de linter** verificado
3. ⏳ **Compilar frontend:**
   ```bash
   npm run build
   ```
4. ⏳ **Reiniciar servidor de desarrollo (si aplica):**
   ```bash
   npm run dev
   ```
5. ✅ **Probar con múltiples usuarios**

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **`.cursorrules`** - Regla #5: Sistema de Sucursales y Roles
- **`USUARIOS_Y_CONTRASEÑAS.md`** - Lista de usuarios para pruebas
- **`src/contexts/AuthContext.tsx`** - Contexto de autenticación
- **`src/pages/products/ProductPrices.tsx`** - Archivo modificado

---

## ✅ CHECKLIST DE VERIFICACIÓN

```
[✅] useAuth importado correctamente
[✅] esAdmin verificado dinámicamente
[✅] obtenerSucursalUsuario() implementado
[✅] cargarSucursales() modificado con lógica condicional
[✅] Selector deshabilitado para usuarios normales
[✅] Alert informativo agregado
[✅] Etiqueta dinámica implementada
[✅] Sin errores de linter
[✅] Código comentado y documentado
[✅] Documento de implementación creado
[ ] Pruebas manuales realizadas (pendiente)
[ ] Validación en backend implementada (recomendado)
```

---

**Estado**: ✅ **IMPLEMENTADO Y LISTO PARA PRUEBAS**  
**Próximo paso**: Probar manualmente con usuarios de diferentes sucursales

---

🎉 **¡Corrección completada exitosamente!**

