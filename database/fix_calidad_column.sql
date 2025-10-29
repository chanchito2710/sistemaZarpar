-- Cambiar columna calidad de ENUM a VARCHAR para permitir valores dinámicos
ALTER TABLE productos 
MODIFY COLUMN calidad VARCHAR(100) DEFAULT 'Media';

