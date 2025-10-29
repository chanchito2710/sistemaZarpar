-- Modificar la tabla categorias_productos para agregar 'calidad'
ALTER TABLE categorias_productos 
MODIFY COLUMN tipo ENUM('marca', 'tipo', 'calidad') NOT NULL;

-- Insertar las calidades solicitadas
INSERT INTO categorias_productos (tipo, valor) VALUES
('calidad', 'Incell jk'),
('calidad', 'Oled'),
('calidad', 'Original'),
('calidad', 'Oem'),
('calidad', 'Incell zy'),
('calidad', 'Incell'),
('calidad', 'Otro')
ON DUPLICATE KEY UPDATE tipo = tipo;

