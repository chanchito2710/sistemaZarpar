-- =====================================================
-- AGREGAR CAMPO: cobra_comisiones A TABLA VENDEDORES
-- Permite activar/desactivar comisiones por vendedor
-- =====================================================

USE zarparDataBase;

-- Agregar columna cobra_comisiones (por defecto SÍ cobra)
ALTER TABLE vendedores
ADD COLUMN cobra_comisiones TINYINT(1) NOT NULL DEFAULT 1
AFTER activo;

-- Actualizar descripción de la tabla
ALTER TABLE vendedores
COMMENT = 'Vendedores del sistema - incluye campo cobra_comisiones para control individual';

-- =====================================================
-- VERIFICAR CAMBIO
-- =====================================================

SELECT '✅ Campo agregado exitosamente:' AS mensaje;
DESCRIBE vendedores;

SELECT '✅ Vista previa de vendedores:' AS mensaje;
SELECT id, nombre, apellido, cargo, sucursal, activo, cobra_comisiones 
FROM vendedores 
LIMIT 5;

-- =====================================================
-- EXPLICACIÓN
-- =====================================================

/*
LÓGICA DE COMISIONES CON ESTE CAMPO:

1. Cuando se hace una venta:
   - PRIMERO: Verificar si vendedor.cobra_comisiones = 1
   - SI cobra_comisiones = 0 (desactivado):
     → NO registrar comisión
     → Continuar con la venta normal
   - SI cobra_comisiones = 1 (activado):
     → Buscar comisión personalizada o global
     → Registrar comisión normalmente

2. En el frontend (/staff):
   - Toggle o switch para activar/desactivar
   - Indicador visual del estado
   - Mensaje claro: "Este vendedor NO cobra comisiones"

3. Beneficios:
   - Control granular por vendedor
   - Fácil de activar/desactivar
   - No hardcodeado
   - Auditable (histórico se mantiene)
*/








