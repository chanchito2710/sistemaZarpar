# 📦 INDICADOR VISUAL DE STOCK EN TRÁNSITO

> **Fecha**: Octubre 31, 2025  
> **Estado**: ✅ IMPLEMENTADO

---

## 🎯 FUNCIONALIDAD

### Visual del Stock a Enviar
Cuando ingresas una cantidad en el input, aparece **debajo** un indicador en **color marrón** mostrando la cantidad que se va a enviar.

### Al Confirmar Envío
1. El número del input **desaparece** (se limpia)
2. La cantidad **NO se suma** inmediatamente al stock de la sucursal
3. Aparece un nuevo indicador en **color marrón** mostrando "🚚 En camino: X"
4. Este es el **stock en tránsito** - está de camino pero aún no llegó

### Al Confirmar Recepción
Cuando la sucursal confirma que recibió el stock (en la página `/inventory/receive`):
- El stock en tránsito **desaparece**
- Se **suma al stock real** de la sucursal

---

## 🎨 INTERFAZ

### ANTES de enviar:
```
┌────────────────────┐
│  Stock: 50         │
│                    │
│  ┌──────────┐      │
│  │    6     │      │ ← Input
│  └──────────┘      │
│                    │
│   📦 6             │ ← NUEVO: Indicador marrón
└────────────────────┘
```

### DESPUÉS de confirmar envío:
```
┌────────────────────┐
│  Stock: 50         │
│                    │
│  ┌──────────┐      │
│  │          │      │ ← Input VACÍO
│  └──────────┘      │
│                    │
│  🚚 En camino: 6   │ ← NUEVO: Stock en tránsito
└────────────────────┘
```

### DESPUÉS de confirmar recepción:
```
┌────────────────────┐
│  Stock: 56         │ ← Stock se sumó (50 + 6)
│                    │
│  ┌──────────┐      │
│  │          │      │
│  └──────────┘      │
└────────────────────┘
```

---

## 📊 FLUJO COMPLETO

### Paso 1: Ingresar Cantidad
```
Usuario ingresa: 6
┌──────────┐
│    6     │ ← Input naranja (pendiente)
└──────────┘
   📦 6      ← Indicador marrón "va a enviar"
```

### Paso 2: Abrir Modal y Confirmar
```
Usuario presiona "📦 Enviar Stock"
Modal muestra: "Se enviarán 6 unidades"
Usuario confirma: "✅ SÍ, ENVIAR STOCK"
```

### Paso 3: Backend Procesa
```
Backend:
1. Maldonado: 100 → 94 (resta 6)
2. Pando: stock_en_transito: 0 → 6 (suma 6 en tránsito)
3. Pando: stock: 50 → 50 (NO cambia todavía)
```

### Paso 4: Frontend Recarga
```
Input se vacía: 6 → (vacío)
Aparece: 🚚 En camino: 6
```

### Paso 5: Confirmar Recepción (en otra página)
```
Sucursal Pando va a: /inventory/receive
Confirma que recibió 6 unidades
Backend:
1. Pando: stock_en_transito: 6 → 0 (resta)
2. Pando: stock: 50 → 56 (suma 6)
```

### Paso 6: Ver Stock Final
```
Pando ahora tiene:
Stock: 56
Stock en tránsito: 0 (desapareció el indicador)
```

---

## 🎨 ESTILOS DE INDICADORES

### Indicador "Va a Enviar" (debajo del input)
```css
color: #8B4513 (marrón oscuro)
backgroundColor: #FFF8DC (crema claro)
padding: 2px 6px
borderRadius: 4px
fontSize: 11px
fontWeight: bold
Icon: 📦
```

### Indicador "En Camino" (stock en tránsito)
```css
color: #8B4513 (marrón oscuro)
backgroundColor: #FFF8DC (crema claro)
padding: 2px 6px
borderRadius: 4px
border: 1px solid #D2691E (borde marrón)
fontSize: 11px
fontWeight: bold
Icon: 🚚
Tooltip: "Stock en tránsito (pendiente de confirmar)"
```

---

## 🔧 CAMBIOS TÉCNICOS

### 1. Interface ProductoTransfer
```typescript
interface ProductoTransfer extends ProductoCompleto {
  sucursales?: {
    [sucursal: string]: {
      stock: number;
      ventas?: number;
      stock_en_transito?: number; // ✅ NUEVO
    };
  };
}
```

### 2. Interface ProductoSucursal (api.ts)
```typescript
export interface ProductoSucursal {
  sucursal: string;
  stock: number;
  precio: number;
  stock_minimo: number;
  es_stock_principal: boolean;
  activo: boolean;
  stock_en_transito?: number; // ✅ NUEVO
  updated_at: string;
}
```

### 3. Carga de Productos (Transfer.tsx)
```typescript
sucursalesData[suc.sucursal] = {
  stock: suc.stock || 0,
  ventas: 0,
  stock_en_transito: suc.stock_en_transito || 0 // ✅ NUEVO
};
```

### 4. Componente TransferInput
```typescript
// ✅ Indicador debajo del input
{hasPending && (
  <div style={{
    fontSize: '11px',
    color: '#8B4513',
    fontWeight: 'bold',
    backgroundColor: '#FFF8DC',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap'
  }}>
    📦 {pendingAmount}
  </div>
)}
```

### 5. Columna de Sucursal
```typescript
const stockEnTransito = record.sucursales?.[suc]?.stock_en_transito || 0;

// ✅ Mostrar stock en tránsito
{stockEnTransito > 0 && (
  <Tooltip title="Stock en tránsito (pendiente de confirmar)">
    <div style={{
      fontSize: '11px',
      color: '#8B4513',
      fontWeight: 'bold',
      backgroundColor: '#FFF8DC',
      padding: '2px 6px',
      borderRadius: '4px',
      border: '1px solid #D2691E',
      whiteSpace: 'nowrap'
    }}>
      🚚 En camino: {stockEnTransito}
    </div>
  </Tooltip>
)}
```

### 6. Backend (ya implementado)
```sql
SELECT 
  sucursal,
  stock,
  precio,
  stock_minimo,
  es_stock_principal,
  activo,
  stock_en_transito, -- ✅ Ya incluido
  updated_at
FROM productos_sucursal
WHERE producto_id = ?
```

---

## ✅ VALIDACIONES

### Frontend:
1. ✅ Solo muestra indicador si hay cantidad pendiente
2. ✅ Solo muestra stock en tránsito si es > 0
3. ✅ Tooltip explicativo en cada indicador
4. ✅ Colores consistentes (marrón #8B4513)

### Backend:
1. ✅ Campo `stock_en_transito` en tabla `productos_sucursal`
2. ✅ Suma a `stock_en_transito` al enviar
3. ✅ Resta de `stock` origen al enviar
4. ✅ Suma a `stock` destino al confirmar recepción
5. ✅ Resta de `stock_en_transito` al confirmar recepción

---

## 📈 BENEFICIOS

### Para el Usuario:
- ✅ **Claridad**: Ve exactamente qué se va a enviar
- ✅ **Trazabilidad**: Sabe qué está en camino
- ✅ **Confianza**: Sistema refleja la realidad física
- ✅ **Control**: Puede ver el estado de cada transferencia

### Para el Negocio:
- ✅ **Precisión**: Stock refleja la realidad
- ✅ **Auditoría**: Historial completo de movimientos
- ✅ **Prevención**: Evita vender stock que no está disponible
- ✅ **Optimización**: Mejor planificación de envíos

---

## 🎯 EJEMPLO COMPLETO

### Escenario: Enviar iPhones de Maldonado a Pando

**Estado Inicial**:
```
Maldonado: Stock 100
Pando: Stock 20, En tránsito: 0
```

**Usuario ingresa 6 en el input de Pando**:
```
Input: 6 (naranja)
Debajo: 📦 6 (marrón)
Base de datos: NO cambió
```

**Usuario confirma envío**:
```
Backend ejecuta:
- Maldonado: 100 → 94 ✅
- Pando: stock 20, en_transito 0 → 6 ✅

Frontend muestra:
- Input: (vacío)
- Debajo: 🚚 En camino: 6 (marrón con borde)
```

**Sucursal Pando recibe y confirma**:
```
Backend ejecuta:
- Pando: stock 20 → 26 ✅
- Pando: en_transito 6 → 0 ✅

Frontend muestra:
- Stock: 26
- En camino: (desaparecido)
```

**Resultado Final**:
```
Maldonado: Stock 94 (se restó 6) ✅
Pando: Stock 26 (se sumó 6) ✅
Sistema refleja realidad física ✅
```

---

## 🔄 ESTADOS POSIBLES

| Estado | Input | Indicador Pendiente | Stock | Stock Tránsito |
|--------|-------|---------------------|-------|----------------|
| Inicial | vacío | NO | 20 | 0 |
| Ingresando | 6 | 📦 6 | 20 | 0 |
| Enviado | vacío | NO | 20 | 6 (🚚) |
| Confirmado | vacío | NO | 26 | 0 |

---

## 🎨 COLORES USADOS

| Elemento | Color | Hex Code |
|----------|-------|----------|
| Texto marrón | Marrón oscuro | `#8B4513` |
| Fondo | Crema claro | `#FFF8DC` |
| Borde (tránsito) | Marrón medio | `#D2691E` |
| Input pendiente | Naranja | `#fa8c16` |

---

**Estado**: ✅ COMPLETAMENTE FUNCIONAL  
**Fecha**: Octubre 31, 2025  
**Autor**: Sistema Zarpar - Asistente IA










