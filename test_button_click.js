// Script para probar el botón de transferencia
console.log('Iniciando prueba del botón...');

// Buscar el botón de prueba
const testButton = document.querySelector('button');
if (testButton && testButton.textContent.includes('Prueba: Agregar Transferencia')) {
    console.log('Botón de prueba encontrado, haciendo clic...');
    testButton.click();
    
    // Esperar un momento y verificar si aparece el botón Enviar
    setTimeout(() => {
        const enviarButton = document.querySelector('.enviar-button');
        if (enviarButton) {
            console.log('¡Éxito! El botón Enviar apareció:', enviarButton.textContent);
        } else {
            console.log('Error: El botón Enviar no apareció después de agregar transferencia');
        }
        
        // Verificar el estado de pendingTransfers en React DevTools si está disponible
        if (window.React) {
            console.log('React detectado, verificando estado...');
        }
    }, 1000);
} else {
    console.log('Error: No se encontró el botón de prueba');
    console.log('Botones disponibles:', document.querySelectorAll('button'));
}