-- =====================================================
-- MEJORA DEL SISTEMA DE COMISIONES
-- Agregar comisiones personalizadas por vendedor
-- =====================================================

USE zarparDataBase;

-- =====================================================
-- TABLA: comisiones_por_vendedor
-- Comisiones personalizadas por vendedor y tipo
-- =====================================================

CREATE TABLE IF NOT EXISTS comisiones_por_vendedor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendedor_id INT NOT NULL,
  tipo_producto VARCHAR(50) NOT NULL,
  monto_comision DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  UNIQUE KEY unique_vendedor_tipo (vendedor_id, tipo_producto),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_tipo (tipo_producto),
  
  -- Foreign key
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- COMENTARIOS
-- =====================================================

ALTER TABLE comisiones_por_vendedor 
  COMMENT = 'Comisiones personalizadas por vendedor y tipo de producto';

-- =====================================================
-- VERIFICAR CREACIÓN
-- =====================================================

SELECT '✅ Tabla creada exitosamente:' AS mensaje;
SHOW TABLES LIKE 'comisiones_por_vendedor';

SELECT '✅ Estructura de la tabla:' AS mensaje;
DESCRIBE comisiones_por_vendedor;

-- =====================================================
-- EXPLICACIÓN DEL FLUJO
-- =====================================================

/*
LÓGICA DE COMISIONES:

1. Cuando se hace una venta:
   - Buscar en `comisiones_por_vendedor` si existe comisión personalizada para ese vendedor + tipo
   - Si EXISTE → usar ese monto
   - Si NO EXISTE → usar el monto de `configuracion_comisiones` (global)

2. Cuando se registra un pago de cuenta corriente:
   - Aplicar la misma lógica
   - Sumar remanentes anteriores
   - Priorizar: Display > Batería > Flex > resto
   - Guardar nuevo remanente si sobra dinero

3. Beneficios:
   - Flexibilidad total: cada vendedor puede tener comisiones diferentes
   - No hardcodeado: todo viene de la base de datos
   - Fallback automático: si no hay comisión personalizada, usa la global
   - Escalable: agregar nuevos tipos o vendedores es simple
*/




