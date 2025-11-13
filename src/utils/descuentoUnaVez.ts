/**
 * Utilidad para manejar descuentos de "una vez"
 * Funciones helper para integrar con el POS
 */

/**
 * Verificar si una sucursal tiene descuento de "una vez" activo
 * @param sucursal - Nombre de la sucursal
 * @returns true si tiene descuento activo de una vez
 */
export const tieneDescuentoUnaVez = (sucursal: string): boolean => {
  try {
    const stored = localStorage.getItem('descuentos_una_vez');
    if (!stored) return false;
    
    const sucursales: string[] = JSON.parse(stored);
    return sucursales.includes(sucursal.toLowerCase());
  } catch (error) {
    console.error('Error al verificar descuento una vez:', error);
    return false;
  }
};

/**
 * Consumir descuento de "una vez" (llamar después de aplicar el descuento)
 * @param sucursal - Nombre de la sucursal
 */
export const consumirDescuentoUnaVez = (sucursal: string): void => {
  try {
    const stored = localStorage.getItem('descuentos_una_vez');
    if (!stored) return;
    
    const sucursales: string[] = JSON.parse(stored);
    const sucursalesActualizadas = sucursales.filter(
      s => s !== sucursal.toLowerCase()
    );
    
    localStorage.setItem('descuentos_una_vez', JSON.stringify(sucursalesActualizadas));
    
    console.log(`✅ Descuento de una vez consumido para ${sucursal.toUpperCase()}`);
  } catch (error) {
    console.error('Error al consumir descuento una vez:', error);
  }
};

/**
 * Ejemplo de integración en el POS:
 * 
 * import { tieneDescuentoUnaVez, consumirDescuentoUnaVez } from '../../utils/descuentoUnaVez';
 * 
 * // Al momento de aplicar descuento en POS:
 * const handleAplicarDescuento = () => {
 *   const sucursalActual = usuario.sucursal;
 *   const descuentoHabilitado = configuracionDescuento.descuento_habilitado;
 *   const tieneUnaVez = tieneDescuentoUnaVez(sucursalActual);
 *   
 *   // Verificar si puede aplicar descuento
 *   if (descuentoHabilitado || tieneUnaVez) {
 *     // Aplicar descuento
 *     aplicarDescuentoAVenta();
 *     
 *     // Si fue un descuento de "una vez", consumirlo
 *     if (tieneUnaVez) {
 *       consumirDescuentoUnaVez(sucursalActual);
 *       message.info('⚡ Descuento de uso único aplicado. Ya no estará disponible.');
 *     }
 *   } else {
 *     message.error('No tienes permisos para aplicar descuentos');
 *   }
 * };
 */

