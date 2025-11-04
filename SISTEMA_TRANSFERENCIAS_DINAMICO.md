# 🚀 SISTEMA DE TRANSFERENCIAS DINÁMICO - SIN HARDCODEO

**Fecha**: 31 de Octubre, 2025  
**Estado**: 🟡 EN DESARROLLO  
**Objetivo**: Eliminar TODA lógica hardcodeada y hacer el sistema completamente dinámico

---

## 🎯 REQUISITOS DEL USUARIO

### **1. Sucursal Principal Dinámica**
- ❌ NO hardcodear "maldonado"
- ✅ Identificar por `es_stock_principal = 1` en base de datos
- ✅ Permitir cambiar sucursal principal en el futuro

### **2. Descuento Inmediato al Ingresar Cantidad**
- Cuando el usuario ingresa cantidad en el `input`
- Se descuenta INMEDIATAMENTE de la sucursal principal
- Se agrega a `stock_en_transito` en la sucursal destino
- Aparece el indicador "🚚 En camino: X"

### **3. Modal de Confirmación con Detalle por Producto**
- Mostrar lista de productos (no agrupados por sucursal)
- Cada producto muestra:
  - Nombre del producto
  - Sucursal destino
  - Cantidad a enviar (EDITABLE)
  - Stock disponible en principal
  - "Quedará: X" (stock principal después del envío)

### **4. Edición en Modal con Ajuste en Tiempo Real**
- Poder editar cantidades en el modal
- Si **REDUCE** cantidad: sobrante vuelve a sucursal principal
- Si **AUMENTA** cantidad: descuenta más de sucursal principal
- Cambios en stock principal son INMEDIATOS
- Cambios en stock destino solo al confirmar

### **5. Confirmación Final**
- Al presionar "✅ SÍ, ENVIAR STOCK":
  - `stock_en_transito` se suma a `stock` real en destino
  - `stock_en_transito` vuelve a 0

---

## 📦 IMPLEMENTACIÓN

### **FASE 1: BACKEND** ✅ COMPLETADO

#### **Archivos Modificados:**
1. ✅ `api/controllers/productosController.ts`
   - Agregada función `obtenerSucursalPrincipal()`
   - Endpoint `GET /api/productos/sucursal-principal`
   - Endpoint `POST /api/productos/preparar-transferencia`
   - Endpoint `POST /api/productos/ajustar-transferencia`
   - Endpoint `POST /api/productos/confirmar-transferencia`

2. ✅ `api/routes/productos.ts`
   - Agregadas 4 nuevas rutas para transferencias dinámicas

#### **Endpoints Creados:**

```typescript
// 1. Obtener sucursal principal
GET /api/productos/sucursal-principal
Response: { success: true, data: { sucursal: "maldonado" } }

// 2. Preparar transferencia (descontar de principal + agregar a en_transito)
POST /api/productos/preparar-transferencia
Body: { producto_id: 1, sucursal_destino: "pando", cantidad: 10 }
Response: { success: true, data: { stock_restante: 30 } }

// 3. Ajustar transferencia (edición en modal)
POST /api/productos/ajustar-transferencia
Body: { producto_id: 1, sucursal_destino: "pando", cantidad_anterior: 10, cantidad_nueva: 5 }
Response: { success: true, data: { diferencia: -5 } }

// 4. Confirmar transferencia (stock_en_transito → stock)
POST /api/productos/confirmar-transferencia
Body: { transferencias: [{ producto_id: 1, sucursal: "pando", cantidad: 5 }] }
Response: { success: true, data: { transferencias_confirmadas: 1 } }
```

---

### **FASE 2: FRONTEND - SERVICIOS** ⏳ SIGUIENTE

#### **Archivo a Modificar:** `src/services/api.ts`

Agregar servicios:
```typescript
export const transferenciasService = {
  obtenerSucursalPrincipal: async (): Promise<string> => { ... },
  prepararTransferencia: async (producto_id, sucursal_destino, cantidad) => { ... },
  ajustarTransferencia: async (producto_id, sucursal_destino, cantidad_anterior, cantidad_nueva) => { ... },
  confirmarTransferencia: async (transferencias) => { ... }
};
```

---

### **FASE 3: FRONTEND - COMPONENTE TRANSFER** ⏳ PENDIENTE

#### **Archivo a Modificar:** `src/pages/inventory/Transfer.tsx`

**Cambios Necesarios:**

1. **Cargar Sucursal Principal al Inicio**
```typescript
const [sucursalPrincipal, setSucursalPrincipal] = useState<string>('');

useEffect(() => {
  const cargarSucursalPrincipal = async () => {
    const sucursal = await transferenciasService.obtenerSucursalPrincipal();
    setSucursalPrincipal(sucursal);
  };
  cargarSucursalPrincipal();
}, []);
```

2. **Reemplazar Hardcodeo de "maldonado"**
```typescript
// ❌ ANTES
const stockMaldonado = record.sucursales?.['maldonado']?.stock || 0;

// ✅ AHORA
const stockPrincipal = record.sucursales?.[sucursalPrincipal]?.stock || 0;
```

3. **Descuento Inmediato al Ingresar Cantidad**
```typescript
const handleBlur = async () => {
  const finalValue = inputValue || 0;
  
  if (finalValue > 0) {
    try {
      // Preparar transferencia (descuenta y agrega a en_transito)
      await transferenciasService.prepararTransferencia(
        productoId,
        sucursal,
        finalValue
      );
      
      // Actualizar stock localmente
      setPendingTransfers(prev => ({
        ...prev,
        [productoId]: {
          ...prev[productoId],
          [sucursal]: finalValue
        }
      }));
      
      // Recargar productos para ver cambios
      await cargarProductos();
      
    } catch (error) {
      message.error('Error al preparar transferencia');
    }
  }
};
```

4. **Modal de Confirmación con Detalle por Producto**
```typescript
// Estructura de datos para modal
const [modalItems, setModalItems] = useState<{
  producto_id: number;
  producto_nombre: string;
  sucursal: string;
  cantidad: number;
  stock_principal: number;
}[]>([]);

// Al abrir modal
const handleEnviarClick = () => {
  const items = [];
  Object.entries(pendingTransfers).forEach(([productoId, sucursales]) => {
    Object.entries(sucursales).forEach(([sucursal, cantidad]) => {
      const producto = productos.find(p => p.id === Number(productoId));
      items.push({
        producto_id: Number(productoId),
        producto_nombre: producto?.nombre || '',
        sucursal,
        cantidad,
        stock_principal: producto?.sucursales?.[sucursalPrincipal]?.stock || 0
      });
    });
  });
  setModalItems(items);
  setIsConfirmModalVisible(true);
};
```

5. **Edición de Cantidades en Modal**
```typescript
const handleCantidadChange = async (index: number, nuevaCantidad: number) => {
  const item = modalItems[index];
  const cantidadAnterior = item.cantidad;
  
  try {
    // Ajustar transferencia en backend
    await transferenciasService.ajustarTransferencia(
      item.producto_id,
      item.sucursal,
      cantidadAnterior,
      nuevaCantidad
    );
    
    // Actualizar localmente
    const newItems = [...modalItems];
    newItems[index].cantidad = nuevaCantidad;
    setModalItems(newItems);
    
    // Recargar productos para ver stock principal actualizado
    await cargarProductos();
    
  } catch (error) {
    message.error('Error al ajustar cantidad');
  }
};
```

6. **Confirmación Final**
```typescript
const handleConfirmar = async () => {
  try {
    // Preparar transferencias para confirmar
    const transferencias = modalItems.map(item => ({
      producto_id: item.producto_id,
      sucursal: item.sucursal,
      cantidad: item.cantidad
    }));
    
    // Confirmar (stock_en_transito → stock)
    await transferenciasService.confirmarTransferencia(transferencias);
    
    message.success('Transferencias confirmadas');
    
    // Limpiar pendientes
    setPendingTransfers({});
    setIsConfirmModalVisible(false);
    
    // Recargar productos
    await cargarProductos();
    
  } catch (error) {
    message.error('Error al confirmar transferencias');
  }
};
```

---

## 🗂️ ESTRUCTURA DE DATOS

### **Estado Local (Frontend)**

```typescript
// Sucursal principal (dinámico)
sucursalPrincipal: string; // ej: "maldonado"

// Transferencias pendientes (con cantidad ingresada)
pendingTransfers: {
  [productoId: number]: {
    [sucursal: string]: number; // cantidad
  }
};
// Ejemplo: { 1: { "pando": 10, "rivera": 5 }, 2: { "melo": 3 } }

// Items en modal (con detalle)
modalItems: {
  producto_id: number;
  producto_nombre: string;
  sucursal: string;
  cantidad: number;
  stock_principal: number;
}[];
```

### **Base de Datos (MySQL)**

```sql
productos_sucursal
├─ producto_id
├─ sucursal
├─ stock (stock real)
├─ stock_en_transito (stock en camino)
├─ es_stock_principal (1 = principal, 0 = sucursal)
└─ ...
```

---

## 🔄 FLUJO COMPLETO

### **1. Usuario ingresa cantidad (ej: 10 a Pando)**
```
Frontend:
  └─> onChange input
      └─> onBlur
          └─> POST /api/productos/preparar-transferencia
              { producto_id: 1, sucursal_destino: "pando", cantidad: 10 }

Backend:
  ├─> Verificar stock en sucursal principal (maldonado)
  ├─> UPDATE productos_sucursal SET stock = stock - 10 WHERE sucursal = 'maldonado'
  ├─> UPDATE productos_sucursal SET stock_en_transito = stock_en_transito + 10 WHERE sucursal = 'pando'
  └─> COMMIT

Frontend:
  └─> Recargar productos
      └─> Ver "🚚 En camino: 10" en columna Pando
```

### **2. Usuario abre modal de confirmación**
```
Frontend:
  └─> Botón "Enviar Stock"
      └─> Agrupar pendingTransfers en modalItems (por producto)
      └─> Mostrar modal con lista de productos
```

### **3. Usuario edita cantidad en modal (ej: de 10 a 7)**
```
Frontend:
  └─> InputNumber onChange
      └─> POST /api/productos/ajustar-transferencia
          { producto_id: 1, sucursal_destino: "pando", 
            cantidad_anterior: 10, cantidad_nueva: 7 }

Backend:
  ├─> Calcular diferencia: 7 - 10 = -3
  ├─> Devolver 3 a sucursal principal:
  │   └─> UPDATE productos_sucursal SET stock = stock + 3 WHERE sucursal = 'maldonado'
  ├─> Quitar 3 de en_transito:
  │   └─> UPDATE productos_sucursal SET stock_en_transito = stock_en_transito - 3 WHERE sucursal = 'pando'
  └─> COMMIT

Frontend:
  └─> Recargar productos
      └─> Ver "🚚 En camino: 7" (actualizado)
      └─> Ver stock principal aumentado en 3
```

### **4. Usuario confirma "SÍ, ENVIAR STOCK"**
```
Frontend:
  └─> Botón confirmar
      └─> POST /api/productos/confirmar-transferencia
          { transferencias: [
            { producto_id: 1, sucursal: "pando", cantidad: 7 }
          ]}

Backend:
  ├─> Para cada transferencia:
  │   ├─> Verificar stock_en_transito suficiente
  │   ├─> UPDATE productos_sucursal 
  │   │       SET stock = stock + 7,
  │   │           stock_en_transito = stock_en_transito - 7
  │   │       WHERE sucursal = 'pando'
  └─> COMMIT

Frontend:
  └─> Limpiar pendingTransfers
  └─> Cerrar modal
  └─> Recargar productos
      └─> Ya NO se ve "🚚 En camino"
      └─> Se ve stock aumentado en Pando (+7)
```

---

## ✅ VENTAJAS DE ESTE SISTEMA

1. **✅ Sin Hardcodeo**: Todo dinámico basado en `es_stock_principal`
2. **✅ Escalable**: Puedes cambiar sucursal principal en cualquier momento
3. **✅ Robusto**: Transacciones en BD garantizan consistencia
4. **✅ Transparente**: Usuario ve cada paso (stock principal, en_transito, destino)
5. **✅ Flexible**: Puedes editar antes de confirmar
6. **✅ Seguro**: Stock se descuenta inmediatamente (no queda "disponible" por error)

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend ✅
- [x] Función `obtenerSucursalPrincipal()`
- [x] Endpoint `GET /api/productos/sucursal-principal`
- [x] Endpoint `POST /api/productos/preparar-transferencia`
- [x] Endpoint `POST /api/productos/ajustar-transferencia`
- [x] Endpoint `POST /api/productos/confirmar-transferencia`
- [x] Rutas agregadas en `api/routes/productos.ts`
- [x] Sin errores de linter

### Frontend (Siguiente Fase)
- [ ] Agregar servicios en `src/services/api.ts`
- [ ] Cargar sucursal principal dinámicamente
- [ ] Eliminar hardcodeo de "maldonado"
- [ ] Implementar descuento inmediato al ingresar cantidad
- [ ] Modificar modal para mostrar detalle por producto
- [ ] Implementar edición de cantidades en modal
- [ ] Implementar confirmación final
- [ ] Probar flujo completo

---

**🎯 Estado Actual**: Backend completado, frontend pendiente  
**⏰ Tiempo Estimado Frontend**: 2-3 horas  
**🔍 Prioridad**: ALTA







