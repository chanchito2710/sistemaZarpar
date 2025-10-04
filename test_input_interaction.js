// Script para probar la interacción con los inputs de transferencia
// Este script simula hacer click en un input, escribir un valor y hacer blur

console.log('=== INICIANDO PRUEBA DE INPUTS ===');

// Función para simular interacción con input
function testInputInteraction() {
  // Buscar el primer input de transferencia
  const inputs = document.querySelectorAll('input[placeholder="0"]');
  console.log('Inputs encontrados:', inputs.length);
  
  if (inputs.length > 0) {
    const firstInput = inputs[0];
    console.log('Probando con el primer input:', firstInput);
    
    // Simular focus
    firstInput.focus();
    console.log('Focus aplicado');
    
    // Simular escribir un valor
    firstInput.value = '5';
    
    // Disparar evento de cambio
    const changeEvent = new Event('change', { bubbles: true });
    firstInput.dispatchEvent(changeEvent);
    console.log('Valor cambiado a:', firstInput.value);
    
    // Simular blur después de un pequeño delay
    setTimeout(() => {
      firstInput.blur();
      console.log('Blur aplicado');
      
      // Verificar estado después de un momento
      setTimeout(() => {
        console.log('=== VERIFICANDO ESTADO DESPUÉS DE INTERACCIÓN ===');
        console.log('Valor del input después del blur:', firstInput.value);
      }, 500);
    }, 1000);
  } else {
    console.log('No se encontraron inputs de transferencia');
  }
}

// Ejecutar la prueba después de un pequeño delay para asegurar que la página esté cargada
setTimeout(testInputInteraction, 2000);

console.log('Script de prueba cargado. Esperando 2 segundos para ejecutar...');