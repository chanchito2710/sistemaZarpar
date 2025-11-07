# 📦 PLAN COMPLETO: SISTEMA DE TRANSFERENCIAS DE INVENTARIO

> **Estado**: Plan Detallado - Esperando Aprobación  
> **Fecha**: Octubre 31, 2025  
> **Objetivo**: Sistema robusto de transferencias con confirmación de recepción

---

## 📋 ÍNDICE

1. [Análisis del Sistema Actual](#análisis-del-sistema-actual)
2. [Cambios Requeridos](#cambios-requeridos)
3. [Diseño de Base de Datos](#diseño-de-base-de-datos)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)
5. [Flujo Completo](#flujo-completo)
6. [API Endpoints](#api-endpoints)
7. [Modificaciones al Frontend](#modificaciones-al-frontend)
8. [Sistema de Reportes](#sistema-de-reportes)
9. [Plan de Implementación](#plan-de-implementación)
10. [Checklist de Verificación](#checklist-de-verificación)

---

## 1. ANÁLISIS DEL SISTEMA ACTUAL

### ✅ Lo que ESTÁ BIEN (No tocar):
- ✅ UI/UX excelente
- ✅ Lógica de filtros por fecha
- ✅ Input de cantidades
- ✅ Modal de confirmación
- ✅ Cálculo de ventas por rango de fechas
- ✅ Estados pendientes

### ❌ Lo que HAY QUE CAMBIAR:
- ❌ Productos hardcodeados (líneas 55-160)
- ❌ Sucursales hardcodeadas (BRANCHES)
- ❌ Ventas generadas aleatoriamente (línea 163-187)
- ❌ Stock se actualiza inmediatamente (línea 238-243)
- ❌ No hay persistencia en BD

---

## 2. CAMBIOS REQUERIDOS

### 2.1 Carga Dinámica desde BD

**Productos**:
```typescript
// ANTES (Hardcoded):
const [products, setProducts] = useState<Product[]>([...]);

// DESPUÉS (Dinámico):
const cargarProductos = async () => {
  const productos = await productosService.obtenerTodos();
  setProductos(productos);
};
```

**Sucursales**:
```typescript
// Cargar dinámicamente desde BD
const sucursales = await sucursalesService.obtenerActivas();
// Ordenar: Maldonado primero (stock principal)
```

**Ventas**:
```typescript
// Obtener ventas reales por fecha
const ventas = await ventasService.obtenerPorRango(fechaInicio, fechaFin);
```

---

### 2.2 Flujo de Transferencia (2 Fases)

#### Fase 1: Envío (Casa Matriz → Sucursal)
```
1. Usuario selecciona cantidades
2. Clic en "Enviar"
3. Modal de confirmación
4. Al confirmar:
   - ✅ Resta del stock de Maldonado
   - ✅ Crea registro de transferencia (estado: "en_transito")
   - ❌ NO suma al stock de destino aún
```

#### Fase 2: Recepción (Sucursal confirma)
```
1. Sucursal recibe mercadería física
2. Verifica cantidades
3. Confirma recepción en sistema
4. Al confirmar:
   - ✅ Suma al stock de la sucursal
   - ✅ Cambia estado a "completada"
   - ✅ Genera comprobante
```

---

## 3. DISEÑO DE BASE DE DATOS

### 3.1 Nueva Tabla: `transferencias`

```sql
CREATE TABLE transferencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Información básica
  codigo VARCHAR(50) UNIQUE NOT NULL,              -- Ej: "TRANS-2025-001"
  fecha_envio DATETIME NOT NULL,
  fecha_recepcion DATETIME NULL,
  
  -- Origen y destino
  sucursal_origen VARCHAR(50) NOT NULL,            -- Siempre "maldonado" (Casa Central)
  sucursal_destino VARCHAR(50) NOT NULL,           -- Pando, Rivera, etc.
  
  -- Estado
  estado ENUM(
    'pendiente',      -- Creada pero no enviada
    'en_transito',    -- Enviada, esperando confirmación
    'recibida',       -- Recibida pero no confirmada
    'completada',     -- Confirmada y stock actualizado
    'cancelada'       -- Cancelada (opcional)
  ) DEFAULT 'pendiente',
  
  -- Responsables
  usuario_envio VARCHAR(100) NOT NULL,             -- Quien envió (email)
  usuario_recepcion VARCHAR(100) NULL,             -- Quien recibió
  
  -- Totales
  total_productos INT NOT NULL,                    -- Total de items únicos
  total_unidades INT NOT NULL,                     -- Total de unidades
  
  -- Notas
  notas_envio TEXT NULL,
  notas_recepcion TEXT NULL,
  diferencias TEXT NULL,                           -- Si hubo faltantes/sobrantes
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_codigo (codigo),
  INDEX idx_estado (estado),
  INDEX idx_sucursal_destino (sucursal_destino),
  INDEX idx_fecha_envio (fecha_envio)
);
```

---

### 3.2 Nueva Tabla: `transferencias_detalle`

```sql
CREATE TABLE transferencias_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relación con transferencia
  transferencia_id INT NOT NULL,
  
  -- Producto
  producto_id INT NOT NULL,
  producto_nombre VARCHAR(200) NOT NULL,           -- Duplicado para historial
  producto_marca VARCHAR(100) NOT NULL,
  producto_tipo VARCHAR(100) NOT NULL,
  
  -- Cantidades
  cantidad_enviada INT NOT NULL,
  cantidad_recibida INT NULL,                      -- Puede ser diferente
  cantidad_faltante INT DEFAULT 0,
  cantidad_sobrante INT DEFAULT 0,
  
  -- Stock al momento de la transferencia
  stock_origen_antes INT NOT NULL,
  stock_origen_despues INT NOT NULL,
  stock_destino_antes INT NOT NULL,
  stock_destino_despues INT NULL,                  -- Se completa al confirmar
  
  -- Motivo (basado en ventas)
  ventas_periodo INT DEFAULT 0,                    -- Ventas que motivaron el envío
  fecha_inicio_ventas DATE NULL,
  fecha_fin_ventas DATE NULL,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relaciones
  FOREIGN KEY (transferencia_id) REFERENCES transferencias(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  
  -- Índices
  INDEX idx_transferencia (transferencia_id),
  INDEX idx_producto (producto_id)
);
```

---

### 3.3 Nueva Tabla: `ventas` (Si no existe)

```sql
CREATE TABLE ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Información de venta
  codigo VARCHAR(50) UNIQUE NOT NULL,
  fecha DATE NOT NULL,
  
  -- Sucursal
  sucursal VARCHAR(50) NOT NULL,
  
  -- Producto
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  
  -- Cliente (opcional)
  cliente_id INT NULL,
  
  -- Vendedor
  vendedor_id INT NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relaciones
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id),
  
  -- Índices
  INDEX idx_fecha (fecha),
  INDEX idx_sucursal (sucursal),
  INDEX idx_producto (producto_id),
  INDEX idx_fecha_sucursal (fecha, sucursal)
);
```

---

### 3.4 Modificación Tabla: `productos_sucursal`

Agregar campo de stock en tránsito:

```sql
ALTER TABLE productos_sucursal
ADD COLUMN stock_en_transito INT DEFAULT 0 COMMENT 'Stock enviado pero no recibido';
```

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Backend (API)

#### Nuevo Controlador: `transferenciasController.ts`

```typescript
// Endpoints principales:

// 1. Crear transferencia (enviar)
POST /api/transferencias
Body: {
  sucursal_destino: string,
  productos: [
    { producto_id, cantidad, ventas_periodo }
  ],
  notas_envio?: string
}

// 2. Obtener transferencias
GET /api/transferencias?estado=en_transito&sucursal=pando

// 3. Confirmar recepción
PUT /api/transferencias/:id/confirmar
Body: {
  productos: [
    { producto_id, cantidad_recibida }
  ],
  notas_recepcion?: string
}

// 4. Obtener detalle
GET /api/transferencias/:id

// 5. Cancelar transferencia
PUT /api/transferencias/:id/cancelar

// 6. Obtener historial
GET /api/transferencias/historial?sucursal=pando&desde=&hasta=

// 7. Reportes
GET /api/transferencias/reportes/resumen
GET /api/transferencias/reportes/por-sucursal
```

---

### 4.2 Frontend (React)

#### Nuevo Servicio: `transferenciasService.ts`

```typescript
export const transferenciasService = {
  // Crear transferencia
  crear: async (data: TransferenciaInput) => {},
  
  // Obtener por estado
  obtenerPorEstado: async (estado: string) => {},
  
  // Confirmar recepción
  confirmarRecepcion: async (id: number, data: ConfirmacionInput) => {},
  
  // Obtener ventas por rango
  obtenerVentas: async (sucursal: string, desde: string, hasta: string) => {},
  
  // Reportes
  obtenerReportes: async (filtros: any) => {}
};
```

---

## 5. FLUJO COMPLETO

### 5.1 Flujo de Envío

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario en Casa Central (Maldonado)         │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 2. Selecciona rango de fechas                   │
│    - Sistema calcula ventas por sucursal        │
│    - Sugiere cantidades a enviar                │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 3. Ingresa cantidades manualmente               │
│    - Puede ajustar sugerencias                  │
│    - Validación: no exceder stock disponible    │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 4. Clic en "Enviar (X items)"                   │
│    - Modal muestra resumen por sucursal         │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 5. Confirma en Modal                            │
│    - POST /api/transferencias                   │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 6. Backend procesa:                             │
│    ✅ Crea registro transferencia               │
│    ✅ Crea detalle por producto                 │
│    ✅ RESTA stock de Maldonado                  │
│    ✅ SUMA a stock_en_transito                  │
│    ❌ NO suma a stock destino                   │
│    ✅ Estado: "en_transito"                     │
│    ✅ Genera código: TRANS-2025-001             │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 7. Respuesta exitosa                            │
│    - Muestra código de transferencia            │
│    - Opción de imprimir comprobante             │
└─────────────────────────────────────────────────┘
```

---

### 5.2 Flujo de Recepción

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario en Sucursal (ej: Pando)             │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 2. Ve notificación: "Tienes X transferencias   │
│    pendientes de recibir"                       │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 3. Accede a sección "Recibir Mercadería"       │
│    - Lista de transferencias en tránsito        │
│    - Filtradas por su sucursal                  │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 4. Abre detalle de transferencia               │
│    - Código: TRANS-2025-001                     │
│    - Fecha envío                                │
│    - Lista de productos esperados               │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 5. Verifica mercadería física                   │
│    - Cuenta productos recibidos                 │
│    - Ingresa cantidades en sistema              │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 6. Si hay diferencias:                          │
│    ⚠️ Faltantes: cantidad_enviada > recibida    │
│    ⚠️ Sobrantes: cantidad_recibida > enviada    │
│    - Sistema alerta visualmente                 │
│    - Solicita notas explicativas                │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 7. Confirma recepción                           │
│    - PUT /api/transferencias/:id/confirmar      │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 8. Backend procesa:                             │
│    ✅ SUMA cantidades recibidas al stock        │
│    ✅ RESTA de stock_en_transito                │
│    ✅ Actualiza estado: "completada"            │
│    ✅ Registra fecha_recepcion                  │
│    ✅ Guarda diferencias si las hay             │
│    ✅ Notifica a Casa Central                   │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 9. Respuesta exitosa                            │
│    - Genera comprobante de recepción            │
│    - Actualiza UI: stock actualizado            │
└─────────────────────────────────────────────────┘
```

---

## 6. API ENDPOINTS

### 6.1 Transferencias

#### POST `/api/transferencias`
**Descripción**: Crear nueva transferencia (envío)

**Request**:
```json
{
  "sucursal_destino": "pando",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 5,
      "ventas_periodo": 3,
      "fecha_inicio": "2025-10-24",
      "fecha_fin": "2025-10-31"
    }
  ],
  "notas_envio": "Envío semanal basado en ventas"
}
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "TRANS-2025-001",
    "fecha_envio": "2025-10-31T10:30:00",
    "estado": "en_transito",
    "total_productos": 1,
    "total_unidades": 5
  }
}
```

---

#### GET `/api/transferencias`
**Descripción**: Listar transferencias con filtros

**Query Params**:
- `estado`: en_transito | completada | todas
- `sucursal`: nombre de sucursal
- `desde`: fecha inicio
- `hasta`: fecha fin

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "TRANS-2025-001",
      "fecha_envio": "2025-10-31T10:30:00",
      "sucursal_destino": "pando",
      "estado": "en_transito",
      "total_unidades": 5,
      "dias_en_transito": 2
    }
  ]
}
```

---

#### PUT `/api/transferencias/:id/confirmar`
**Descripción**: Confirmar recepción de transferencia

**Request**:
```json
{
  "productos": [
    {
      "producto_id": 1,
      "cantidad_recibida": 5
    }
  ],
  "notas_recepcion": "Todo en orden"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Transferencia confirmada exitosamente",
  "data": {
    "id": 1,
    "codigo": "TRANS-2025-001",
    "estado": "completada",
    "fecha_recepcion": "2025-11-02T14:20:00"
  }
}
```

---

#### GET `/api/transferencias/:id`
**Descripción**: Obtener detalle completo

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "codigo": "TRANS-2025-001",
    "fecha_envio": "2025-10-31T10:30:00",
    "fecha_recepcion": null,
    "sucursal_origen": "maldonado",
    "sucursal_destino": "pando",
    "estado": "en_transito",
    "total_productos": 3,
    "total_unidades": 12,
    "productos": [
      {
        "producto_id": 1,
        "producto_nombre": "Pantalla iPhone 14 Pro",
        "cantidad_enviada": 5,
        "cantidad_recibida": null,
        "ventas_periodo": 3
      }
    ]
  }
}
```

---

### 6.2 Ventas

#### GET `/api/ventas/por-rango`
**Descripción**: Obtener ventas por sucursal y rango de fechas

**Query Params**:
- `sucursal`: nombre
- `desde`: YYYY-MM-DD
- `hasta`: YYYY-MM-DD

**Response 200**:
```json
{
  "success": true,
  "data": {
    "sucursal": "pando",
    "desde": "2025-10-24",
    "hasta": "2025-10-31",
    "ventas_por_producto": [
      {
        "producto_id": 1,
        "producto_nombre": "Pantalla iPhone 14 Pro",
        "cantidad_vendida": 3,
        "stock_actual": 7
      }
    ]
  }
}
```

---

## 7. MODIFICACIONES AL FRONTEND

### 7.1 Página Principal: `Transfer.tsx`

#### Cambios Principales:

**1. Cargar Datos Dinámicos**:
```typescript
useEffect(() => {
  cargarProductos();
  cargarSucursales();
}, []);

useEffect(() => {
  if (dateRange[0] && dateRange[1]) {
    cargarVentas();
  }
}, [dateRange]);
```

**2. Renderizar Sucursales Dinámicamente**:
```typescript
// Generar columnas dinámicamente
const columns = [
  { title: 'Producto', ... },
  { title: 'Marca', ... },
  { title: 'Maldonado', ... },  // Siempre primero
  ...sucursales
    .filter(s => s.sucursal !== 'maldonado')
    .map(s => ({
      title: formatearNombreSucursal(s.sucursal),
      key: s.sucursal,
      render: (record) => renderSucursalColumn(record, s.sucursal)
    }))
];
```

**3. Función de Envío**:
```typescript
const handleEnviar = async () => {
  try {
    // Preparar datos
    const transferencias = prepararTransferencias();
    
    // Enviar a API
    const resultado = await transferenciasService.crear(transferencias);
    
    // Mostrar éxito
    message.success(`Transferencias enviadas: ${resultado.codigo}`);
    
    // Limpiar estado
    limpiarPendientes();
    
    // Recargar datos
    cargarProductos();
  } catch (error) {
    message.error('Error al enviar transferencias');
  }
};
```

---

### 7.2 Nueva Página: `ReceiverTransfers.tsx`

Página para que las sucursales confirmen recepciones.

**Ubicación**: `src/pages/inventory/ReceiveTransfers.tsx`

**Funcionalidades**:
1. Lista de transferencias en tránsito
2. Detalle de cada transferencia
3. Formulario de confirmación
4. Ingreso de cantidades recibidas
5. Notas sobre diferencias
6. Botón "Confirmar Recepción"

**Acceso**:
- Solo usuarios de sucursales (no admin)
- Badge con contador de pendientes en navegación

---

### 7.3 Modal de Confirmación Mejorado

```typescript
<Modal
  title={
    <Space>
      <SendOutlined />
      <span>Confirmar Transferencias</span>
    </Space>
  }
  open={isConfirmModalVisible}
  onOk={handleEnviarConfirmado}
  onCancel={() => setIsConfirmModalVisible(false)}
  okText="Confirmar y Enviar"
  cancelText="Cancelar"
  width={600}
>
  {Object.entries(agruparPorSucursal()).map(([sucursal, productos]) => (
    <Card key={sucursal} size="small">
      <Title level={5}>{formatearNombreSucursal(sucursal)}</Title>
      <List
        dataSource={productos}
        renderItem={(item) => (
          <List.Item>
            <Text>{item.nombre}</Text>
            <Text strong>{item.cantidad} unidades</Text>
          </List.Item>
        )}
      />
      <Divider />
      <Space>
        <Text strong>Total:</Text>
        <Text>{calcularTotal(productos)} unidades</Text>
      </Space>
    </Card>
  ))}
</Modal>
```

---

## 8. SISTEMA DE REPORTES

### 8.1 Dashboard de Transferencias

**Métricas Principales**:
- Total transferencias del mes
- Transferencias en tránsito
- Tiempo promedio de recepción
- Diferencias/Faltantes

**Gráficas**:
1. **Transferencias por Sucursal** (Bar Chart)
2. **Evolución Mensual** (Line Chart)
3. **Productos Más Transferidos** (Pie Chart)
4. **Tiempo de Tránsito** (Timeline)

---

### 8.2 Reportes Exportables

#### Reporte 1: Historial de Transferencias
```
Código | Fecha Envío | Destino | Estado | Unidades | Días Tránsito
```

#### Reporte 2: Diferencias Detectadas
```
Código | Producto | Enviado | Recibido | Diferencia | Sucursal
```

#### Reporte 3: Stock en Tránsito
```
Producto | Maldonado | En Tránsito | Destinos
```

---

## 9. PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (1-2 horas)

1. ✅ Crear tabla `transferencias`
2. ✅ Crear tabla `transferencias_detalle`
3. ✅ Crear tabla `ventas` (si no existe)
4. ✅ Agregar campo `stock_en_transito` a `productos_sucursal`
5. ✅ Migración de datos (si es necesario)
6. ✅ Pruebas de integridad

---

### Fase 2: Backend API (3-4 horas)

1. ✅ Crear `transferenciasController.ts`
2. ✅ Implementar endpoints CRUD
3. ✅ Lógica de creación de transferencia
4. ✅ Lógica de confirmación
5. ✅ Validaciones de stock
6. ✅ Manejo de diferencias
7. ✅ Endpoints de reportes
8. ✅ Pruebas con Postman/Insomnia

---

### Fase 3: Frontend - Transfer (3-4 horas)

1. ✅ Crear servicio `transferenciasService.ts`
2. ✅ Modificar `Transfer.tsx`:
   - Cargar productos dinámicamente
   - Cargar sucursales dinámicamente
   - Cargar ventas reales
   - Generar columnas dinámicas
   - Integrar con API de envío
3. ✅ Mejorar modal de confirmación
4. ✅ Feedback visual
5. ✅ Pruebas de UI

---

### Fase 4: Frontend - Recepción (2-3 horas)

1. ✅ Crear `ReceiveTransfers.tsx`
2. ✅ Lista de transferencias pendientes
3. ✅ Detalle de transferencia
4. ✅ Formulario de confirmación
5. ✅ Manejo de diferencias
6. ✅ Integración con API
7. ✅ Agregar al routing

---

### Fase 5: Reportes y Dashboard (2-3 horas)

1. ✅ Crear componentes de gráficas
2. ✅ Endpoints de métricas
3. ✅ Dashboard visual
4. ✅ Exportación a PDF/Excel
5. ✅ Filtros avanzados

---

### Fase 6: Pruebas y Ajustes (1-2 horas)

1. ✅ Pruebas de flujo completo
2. ✅ Verificación de stocks
3. ✅ Pruebas de diferencias
4. ✅ Ajustes de UI/UX
5. ✅ Documentación

---

## 10. CHECKLIST DE VERIFICACIÓN

### Base de Datos:
```
[ ] Tabla transferencias creada
[ ] Tabla transferencias_detalle creada
[ ] Tabla ventas creada/verificada
[ ] Campo stock_en_transito agregado
[ ] Foreign keys configuradas
[ ] Índices optimizados
```

### Backend:
```
[ ] Endpoint POST /api/transferencias funciona
[ ] Endpoint GET /api/transferencias funciona
[ ] Endpoint PUT /api/transferencias/:id/confirmar funciona
[ ] Validación de stock correcto
[ ] Manejo de errores robusto
[ ] Logs implementados
```

### Frontend - Envío:
```
[ ] Productos cargados dinámicamente
[ ] Sucursales cargadas dinámicamente
[ ] Maldonado aparece primero
[ ] Ventas calculadas correctamente
[ ] Modal de confirmación funciona
[ ] Stock se resta de Maldonado al enviar
[ ] No se suma a destino hasta confirmar
```

### Frontend - Recepción:
```
[ ] Página de recepción creada
[ ] Lista de transferencias pendientes
[ ] Confirmación funciona correctamente
[ ] Stock se actualiza al confirmar
[ ] Diferencias se registran
[ ] UI intuitiva
```

### Reportes:
```
[ ] Dashboard con métricas
[ ] Gráficas funcionando
[ ] Exportación a PDF
[ ] Filtros funcionando
```

### General:
```
[ ] Sin código hardcodeado
[ ] Todo dinámico desde BD
[ ] Performance óptimo
[ ] UX fluida
[ ] Sin bugs
[ ] Documentado
```

---

## 📊 ESQUEMA VISUAL DEL FLUJO

```
┌─────────────────────────────────────────────────────────────┐
│                    CASA CENTRAL (MALDONADO)                 │
│                                                             │
│  [Producto A]  Stock: 100  →  Enviar 10 a Pando           │
│  [Producto B]  Stock: 50   →  Enviar 5 a Rivera           │
│                                                             │
│              [Confirmar y Enviar]                           │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ API: POST /transferencias
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                          │
│                                                             │
│  Maldonado: 100 → 90  (resta 10)                           │
│  Pando: 20 → 20  (sin cambio aún)                          │
│  stock_en_transito: 0 → 10                                  │
│                                                             │
│  Transferencia #1: "en_transito"                           │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Estado: EN TRÁNSITO
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUCURSAL (PANDO)                         │
│                                                             │
│  Notificación: "Tienes 1 transferencia pendiente"         │
│                                                             │
│  [Ver Transferencia #1]                                     │
│    - Producto A: Esperando 10 unidades                     │
│    - Recibido: [10] ✓                                       │
│                                                             │
│              [Confirmar Recepción]                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ API: PUT /transferencias/1/confirmar
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                          │
│                                                             │
│  Pando: 20 → 30  (suma 10)                                 │
│  stock_en_transito: 10 → 0                                  │
│                                                             │
│  Transferencia #1: "completada"                            │
│  fecha_recepcion: 2025-11-02                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 RESULTADO ESPERADO

### Para Casa Central:
- ✅ Envío rápido basado en ventas
- ✅ Visibilidad de transferencias en tránsito
- ✅ Alertas de faltantes/diferencias
- ✅ Reportes completos
- ✅ Control de inventario preciso

### Para Sucursales:
- ✅ Notificación de transferencias entrantes
- ✅ Proceso simple de confirmación
- ✅ Registro de diferencias
- ✅ Stock actualizado correctamente
- ✅ Historial de recepciones

### Para el Sistema:
- ✅ 100% dinámico (sin hardcoding)
- ✅ Escalable (funciona con 6 o 60 sucursales)
- ✅ Robusto (maneja errores y diferencias)
- ✅ Auditable (todo registrado)
- ✅ Reportable (métricas y gráficas)

---

## ⏱️ TIEMPO ESTIMADO TOTAL

- **Base de Datos**: 1-2 horas
- **Backend**: 3-4 horas
- **Frontend Envío**: 3-4 horas
- **Frontend Recepción**: 2-3 horas
- **Reportes**: 2-3 horas
- **Pruebas**: 1-2 horas

**TOTAL**: 12-18 horas de desarrollo

---

## 🚀 PRÓXIMO PASO

**¿Apruebas este plan?**

Si estás de acuerdo, procedo a ejecutar en el siguiente orden:

1. ✅ Crear/modificar tablas de BD
2. ✅ Implementar backend (API)
3. ✅ Modificar Transfer.tsx (envío)
4. ✅ Crear ReceiveTransfers.tsx (recepción)
5. ✅ Agregar reportes
6. ✅ Pruebas completas

**Confirma para empezar la implementación.** 🎯

---

**Fecha**: Octubre 31, 2025  
**Estado**: ⏳ Esperando Aprobación  
**Autor**: Sistema Zarpar - Asistente IA










