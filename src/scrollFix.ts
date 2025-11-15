/**
 * Fix para mejorar la velocidad del scroll
 * Este script acelera el scroll de la rueda del mouse sin interferir con los componentes de Ant Design
 */

// Configurar el multiplicador del scroll (ajustar según preferencia)
const SCROLL_MULTIPLIER = 2.5;

// Flag para evitar múltiples llamadas simultáneas
let isProcessing = false;

/**
 * Mejorar la velocidad del scroll con la rueda del mouse
 */
export const initScrollFix = () => {
  // Detectar si el elemento es un dropdown de Ant Design o un Select
  const isAntdElement = (target: Element | null): boolean => {
    if (!target) return false;
    
    // Verificar si es un dropdown, select o modal de Ant Design
    const element = target as HTMLElement;
    return (
      element.closest('.ant-select-dropdown') !== null ||
      element.closest('.ant-modal') !== null ||
      element.closest('.ant-drawer') !== null ||
      element.closest('.ant-popover') !== null ||
      element.classList.contains('ant-select-selection-search-input') ||
      element.closest('.rc-virtual-list') !== null
    );
  };

  // Listener para mejorar el scroll
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      // NO aplicar aceleración en elementos de Ant Design
      if (isAntdElement(e.target as Element)) {
        return; // Dejar que Ant Design maneje su propio scroll
      }

      // Prevenir el comportamiento por defecto solo si no es un elemento de Ant Design
      if (!isProcessing) {
        isProcessing = true;

        // Calcular el scroll acelerado
        const delta = e.deltaY * SCROLL_MULTIPLIER;

        // Aplicar scroll acelerado
        window.scrollBy({
          top: delta,
          behavior: 'auto', // Sin animación para mejor rendimiento
        });

        // Liberar el flag en el siguiente frame
        requestAnimationFrame(() => {
          isProcessing = false;
        });
      }
    },
    { passive: true } // Mejor rendimiento
  );

  console.log('✅ Scroll acelerado activado (multiplicador: ' + SCROLL_MULTIPLIER + 'x)');
};

