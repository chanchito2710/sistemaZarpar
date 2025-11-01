# 📖 EJEMPLOS PRÁCTICOS: SISTEMA DE TRANSFERENCIAS

> **Casos de uso reales** para entender el flujo completo

---

## 📋 CASO 1: Transferencia Simple (Sin Problemas)

### Contexto:
- **Sucursal**: Pando
- **Producto**: Pantalla iPhone 14 Pro
- **Stock Maldonado**: 25 unidades
- **Stock Pando**: 8 unidades
- **Ventas Pando (última semana)**: 5 unidades

---

### Paso 1: Casa Central Analiza Ventas

**Usuario**: admin@zarparuy.com (Casa Central)  
**Página**: http://localhost:5678/inventory/transfer

**Acciones**:
1. Selecciona rango de fechas: 24/10/2025 - 31/10/2025
2. Sistema calcula ventas:
   - Pando: 5 vendidas
   - Rivera: 3 vendidas
   - Melo: 2 vendidas

**Vista en tabla**:
```
Producto              | Maldonado | Pando        | Rivera       | Melo
                      |           | Stock: 8     | Stock: 5     | Stock: 4
                      |           | Vendido: 5   | Vendido: 3   | Vendido: 2
Pantalla iPhone 14 Pro| 25        | [5]          | [3]          | [2]
```

**Decisión**: Enviar 5 a Pando, 3 a Rivera, 2 a Melo

---

### Paso 2: Confirmar Envío

**Modal**:
```
╔══════════════════════════════════════╗
║   Confirmar Transferencias           ║
╠══════════════════════════════════════╣
║                                      ║
║  📦 Pando: 1 producto (5 unidades)  ║
║     • Pantalla iPhone 14 Pro: 5     ║
║     [Confirmado]                     ║
║                                      ║
║  📦 Rivera: 1 producto (3 unidades) ║
║     • Pantalla iPhone 14 Pro: 3     ║
║     [Confirmado]                     ║
║                                      ║
║  📦 Melo: 1 producto (2 unidades)   ║
║     • Pantalla iPhone 14 Pro: 2     ║
║     [Confirmado]                     ║
║                                      ║
╚══════════════════════════════════════╝
```

**Usuario** hace clic en "Confirmado" para Pando

---

### Paso 3: Backend Procesa (Maldonado)

**Antes del envío**:
```sql
-- Stock Maldonado
stock: 25
stock_en_transito: 0

-- Stock Pando
stock: 8
stock_en_transito: 0
```

**Después del envío**:
```sql
-- Stock Maldonado
stock: 20  (25 - 5)
stock_en_transito: 5

-- Stock Pando (SIN CAMBIO AÚN)
stock: 8  (igual)
stock_en_transito: 5  (nuevo)

-- Transferencia creada
INSERT INTO transferencias (
  codigo: 'TRANS-2025-001',
  sucursal_origen: 'maldonado',
  sucursal_destino: 'pando',
  estado: 'en_transito',
  total_productos: 1,
  total_unidades: 5
)
```

**Mensaje**:
> ✅ Transferencia TRANS-2025-001 enviada a Pando (5 unidades)

---

### Paso 4: Sucursal Recibe Notificación

**Usuario**: pando@zarparuy.com  
**Página**: http://localhost:5678/inventory/receive

**Vista**:
```
╔══════════════════════════════════════════════════════╗
║   Transferencias Pendientes de Recibir               ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  🔔 Tienes 1 transferencia pendiente                ║
║                                                      ║
║  Código: TRANS-2025-001                             ║
║  Enviado: 31/10/2025 10:30                          ║
║  Productos: 1                                        ║
║  Unidades: 5                                         ║
║                                                      ║
║  [Ver Detalle]                                       ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

### Paso 5: Verifica Mercadería

**Usuario** hace clic en "Ver Detalle"

**Vista de confirmación**:
```
╔════════════════════════════════════════════════════╗
║   Confirmar Recepción - TRANS-2025-001             ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  Enviado desde: Maldonado                         ║
║  Fecha envío: 31/10/2025 10:30                    ║
║                                                    ║
║  ────────────────────────────────────────────────  ║
║                                                    ║
║  Producto: Pantalla iPhone 14 Pro                 ║
║  Marca: iPhone                                     ║
║  Tipo: Pantallas                                   ║
║                                                    ║
║  Cantidad Enviada: 5                              ║
║  Cantidad Recibida: [5] ✓                         ║
║                                                    ║
║  ────────────────────────────────────────────────  ║
║                                                    ║
║  Notas (opcional):                                 ║
║  [Todo en perfecto estado]                         ║
║                                                    ║
║  [Confirmar Recepción]                             ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

**Usuario** verifica que recibió 5 unidades físicamente  
**Usuario** confirma

---

### Paso 6: Backend Actualiza Stock (Pando)

**Antes de confirmar**:
```sql
-- Stock Pando
stock: 8
stock_en_transito: 5
```

**Después de confirmar**:
```sql
-- Stock Pando
stock: 13  (8 + 5)
stock_en_transito: 0

-- Stock Maldonado
stock_en_transito: 0  (5 - 5)

-- Transferencia actualizada
UPDATE transferencias SET
  estado = 'completada',
  fecha_recepcion = '2025-11-01 14:20:00',
  usuario_recepcion = 'pando@zarparuy.com'
WHERE id = 1
```

**Mensaje**:
> ✅ Recepción confirmada. Stock actualizado: 13 unidades

---

### Resultado Final:

| Concepto | Antes | Después |
|----------|-------|---------|
| **Maldonado Stock** | 25 | 20 |
| **Pando Stock** | 8 | 13 |
| **En Tránsito** | 0 | 0 |
| **Estado** | - | Completada ✅ |

---

## 📋 CASO 2: Transferencia con Faltantes

### Contexto:
- **Enviado**: 10 unidades
- **Recibido**: 8 unidades (faltan 2)

---

### Paso 1-4: Igual al Caso 1

---

### Paso 5: Verifica y Detecta Faltantes

**Usuario** cuenta la mercadería física: solo 8 unidades

**Vista de confirmación**:
```
╔════════════════════════════════════════════════════╗
║   Confirmar Recepción - TRANS-2025-002             ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  Producto: Batería Samsung A54                     ║
║                                                    ║
║  Cantidad Enviada: 10                             ║
║  Cantidad Recibida: [8] ⚠️                        ║
║                                                    ║
║  ⚠️ ALERTA: Faltante de 2 unidades                ║
║                                                    ║
║  Notas (OBLIGATORIO):                              ║
║  [Faltan 2 baterías. Caja llegó abierta.]         ║
║                                                    ║
║  [Confirmar con Diferencia]                        ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

### Paso 6: Backend Registra Diferencia

```sql
-- Stock actualizado con lo RECIBIDO
UPDATE productos_sucursal SET
  stock = stock + 8,  -- Solo suma lo recibido
  stock_en_transito = stock_en_transito - 10
WHERE producto_id = 6 AND sucursal = 'pando'

-- Transferencia con diferencia
UPDATE transferencias SET
  estado = 'completada',
  diferencias = 'Faltante: 2 unidades'
WHERE id = 2

-- Detalle con diferencia
UPDATE transferencias_detalle SET
  cantidad_recibida = 8,
  cantidad_faltante = 2
WHERE transferencia_id = 2
```

---

### Paso 7: Notificación a Casa Central

**Usuario admin** ve alerta:

```
╔═════════════════════════════════════════════════╗
║   🚨 Alerta: Diferencia en Transferencia        ║
╠═════════════════════════════════════════════════╣
║                                                 ║
║  Código: TRANS-2025-002                        ║
║  Destino: Pando                                 ║
║  Fecha: 01/11/2025                              ║
║                                                 ║
║  Producto: Batería Samsung A54                  ║
║  Enviado: 10                                    ║
║  Recibido: 8                                    ║
║  Faltante: 2                                    ║
║                                                 ║
║  Nota: Faltan 2 baterías. Caja llegó abierta. ║
║                                                 ║
║  [Investigar]  [Reenviar Faltantes]            ║
║                                                 ║
╚═════════════════════════════════════════════════╝
```

---

### Resultado Final:

| Concepto | Esperado | Real |
|----------|----------|------|
| **Enviado** | 10 | 10 |
| **Recibido** | 10 | 8 ⚠️ |
| **Faltante** | 0 | 2 |
| **Stock Actualizado** | +10 | +8 |
| **Estado** | Completada con diferencia ⚠️ |

**Acción sugerida**: Investigar con transporte o reenviar faltantes

---

## 📋 CASO 3: Transferencia Múltiple

### Contexto:
Enviar varios productos a una sucursal a la vez

---

### Paso 1: Selección Múltiple

**Usuario** ingresa cantidades para múltiples productos:

```
Producto                  | Maldonado | Pando
                          |           | Stock: 8, Vendido: 5
Pantalla iPhone 14 Pro    | 25        | [5]
                          |           | Stock: 5, Vendido: 3
Batería Samsung A54       | 20        | [3]
                          |           | Stock: 7, Vendido: 4
Carcasa iPhone 13         | 100       | [4]
```

**Total para Pando**: 3 productos, 12 unidades

---

### Paso 2: Modal de Confirmación

```
╔══════════════════════════════════════════════════╗
║   Confirmar Transferencias                       ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  📦 Pando: 3 productos (12 unidades)            ║
║                                                  ║
║     • Pantalla iPhone 14 Pro: 5                 ║
║     • Batería Samsung A54: 3                    ║
║     • Carcasa iPhone 13: 4                      ║
║                                                  ║
║     Total: 12 unidades                          ║
║                                                  ║
║     [Confirmado]                                 ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

---

### Paso 3: Backend Crea Transferencia con Detalle

```sql
-- Transferencia principal
INSERT INTO transferencias (
  codigo: 'TRANS-2025-003',
  sucursal_destino: 'pando',
  total_productos: 3,
  total_unidades: 12
)

-- Detalle por producto
INSERT INTO transferencias_detalle (
  transferencia_id: 3,
  producto_id: 1,
  cantidad_enviada: 5
),
(
  transferencia_id: 3,
  producto_id: 6,
  cantidad_enviada: 3
),
(
  transferencia_id: 3,
  producto_id: 3,
  cantidad_enviada: 4
)
```

---

### Paso 4: Recepción en Sucursal

**Usuario** ve detalle completo:

```
╔════════════════════════════════════════════════════╗
║   Confirmar Recepción - TRANS-2025-003             ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  Total: 3 productos (12 unidades)                 ║
║                                                    ║
║  ────────────────────────────────────────────────  ║
║  Producto 1: Pantalla iPhone 14 Pro               ║
║  Enviado: 5  |  Recibido: [5] ✓                  ║
║  ────────────────────────────────────────────────  ║
║  Producto 2: Batería Samsung A54                   ║
║  Enviado: 3  |  Recibido: [3] ✓                  ║
║  ────────────────────────────────────────────────  ║
║  Producto 3: Carcasa iPhone 13                     ║
║  Enviado: 4  |  Recibido: [4] ✓                  ║
║  ────────────────────────────────────────────────  ║
║                                                    ║
║  [Confirmar Todo]                                  ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## 📊 REPORTES - EJEMPLOS

### Dashboard Principal

```
╔═══════════════════════════════════════════════════════════╗
║           📊 Dashboard de Transferencias                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  [15]              [3]              [2.5 días]           ║
║  Transferencias    En Tránsito     Tiempo Promedio       ║
║  Este Mes                          de Recepción          ║
║                                                           ║
║  ───────────────────────────────────────────────────────  ║
║                                                           ║
║  📈 Transferencias por Sucursal (Este Mes)               ║
║                                                           ║
║  Pando     ████████████████████████ 8                    ║
║  Rivera    ████████████████ 5                            ║
║  Melo      ████████ 2                                     ║
║                                                           ║
║  ───────────────────────────────────────────────────────  ║
║                                                           ║
║  🥧 Productos Más Transferidos                            ║
║                                                           ║
║      40%                                                  ║
║   Pantallas                                               ║
║                 25%                                       ║
║              Baterías                                     ║
║                        20%                                ║
║                     Carcasas                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

### Reporte de Diferencias

```
╔═══════════════════════════════════════════════════════════════════════╗
║              ⚠️ Reporte de Diferencias - Octubre 2025                ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  Código         | Producto        | Enviado | Recibido | Diferencia  ║
║  ──────────────────────────────────────────────────────────────────  ║
║  TRANS-2025-002 | Batería S A54   | 10      | 8        | -2 ⚠️      ║
║  TRANS-2025-007 | Pantalla iPh 14 | 5       | 6        | +1 ⚠️      ║
║  TRANS-2025-012 | Flex iPhone 12  | 8       | 7        | -1 ⚠️      ║
║                                                                       ║
║  ──────────────────────────────────────────────────────────────────  ║
║                                                                       ║
║  Total Enviado: 23                                                   ║
║  Total Recibido: 21                                                  ║
║  Diferencia: -2 unidades                                             ║
║                                                                       ║
║  Tasa de Precisión: 91.3%                                            ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

### Stock en Tránsito (Vista en Tiempo Real)

```
╔═══════════════════════════════════════════════════════════════════════╗
║                   📦 Stock en Tránsito                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  Producto             | Maldonado | En Tránsito | Destino(s)         ║
║  ──────────────────────────────────────────────────────────────────  ║
║  Pantalla iPhone 14   | 20        | 10          | Pando (5)          ║
║                       |           |             | Rivera (3)         ║
║                       |           |             | Melo (2)           ║
║  ──────────────────────────────────────────────────────────────────  ║
║  Batería Samsung A54  | 15        | 6           | Pando (3)          ║
║                       |           |             | Salto (3)          ║
║  ──────────────────────────────────────────────────────────────────  ║
║                                                                       ║
║  TOTAL EN TRÁNSITO: 16 unidades                                      ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 VENTAJAS DEL SISTEMA

### Para Casa Central:
1. ✅ Decisiones basadas en datos reales (ventas)
2. ✅ Control total del inventario
3. ✅ Detección inmediata de problemas
4. ✅ Historial completo de movimientos
5. ✅ Reportes automáticos

### Para Sucursales:
1. ✅ Proceso simple de confirmación
2. ✅ Registro de cualquier anomalía
3. ✅ Stock siempre preciso
4. ✅ Notificaciones automáticas
5. ✅ Sin actualizaciones manuales propensas a errores

### Para el Negocio:
1. ✅ Reducción de errores humanos
2. ✅ Trazabilidad completa
3. ✅ Auditoría automática
4. ✅ Datos para optimización
5. ✅ Escalable a cualquier número de sucursales

---

**Fecha**: Octubre 31, 2025  
**Autor**: Sistema Zarpar - Documentación


