-- Tabla para almacenar marcas y tipos de productos
CREATE TABLE IF NOT EXISTS categorias_productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('marca', 'tipo') NOT NULL,
  valor VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (tipo, valor)
);

-- Insertar marcas predefinidas
INSERT INTO categorias_productos (tipo, valor) VALUES
('marca', 'Iphone'),
('marca', 'Samsung'),
('marca', 'Xiaomi'),
('marca', 'Huawei'),
('marca', 'Tcl'),
('marca', 'nokia'),
('marca', 'Motorola'),
('marca', 'Otro');

-- Insertar tipos predefinidos
INSERT INTO categorias_productos (tipo, valor) VALUES
('tipo', 'Display'),
('tipo', 'Bateria'),
('tipo', 'Flex'),
('tipo', 'Boton'),
('tipo', 'Herramienta'),
('tipo', 'hidrogel'),
('tipo', 'antena'),
('tipo', 'placa carga'),
('tipo', 'main sub'),
('tipo', 'Otro');

