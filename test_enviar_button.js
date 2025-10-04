// Script para probar el botón Enviar y el modal de confirmación
console.log('🧪 Iniciando test del botón Enviar...');

// Buscar el botón Enviar
const enviarButton = document.querySelector('button');
const buttons = Array.from(document.querySelectorAll('button'));
const enviarBtn = buttons.find(btn => btn.textContent.includes('Enviar'));

if (enviarBtn) {
    console.log('✅ Botón Enviar encontrado:', enviarBtn.textContent);
    console.log('🖱️ Haciendo clic en el botón Enviar...');
    
    // Simular click
    enviarBtn.click();
    
    // Esperar un momento y verificar si apareció el modal
    setTimeout(() => {
        const modal = document.querySelector('[role="dialog"]') || 
                     document.querySelector('.modal') ||
                     document.querySelector('[data-testid="modal"]') ||
                     document.querySelector('div[style*="position: fixed"]');
        
        if (modal) {
            console.log('✅ Modal de confirmación apareció correctamente');
            console.log('📋 Contenido del modal:', modal.textContent);
        } else {
            console.log('❌ No se encontró el modal de confirmación');
        }
    }, 500);
    
} else {
    console.log('❌ No se encontró el botón Enviar');
    console.log('🔍 Botones disponibles:', buttons.map(btn => btn.textContent));
}