-- Actualizar apellidos de vendedores existentes
USE zarparDataBase;

UPDATE vendedores SET apellido = 'Witt' WHERE nombre = 'Jonathan' AND email = 'pando@zarparuy.com';
UPDATE vendedores SET apellido = 'Fernandez' WHERE nombre = 'Nicolas' AND email = 'admin@zarparuy.com';

-- Si hay otros vendedores, actualizar también
UPDATE vendedores SET apellido = 'García' WHERE nombre = 'María' AND apellido IS NULL;
UPDATE vendedores SET apellido = 'López' WHERE nombre = 'Carlos' AND apellido IS NULL;
UPDATE vendedores SET apellido = 'Martínez' WHERE nombre = 'Ana' AND apellido IS NULL;
UPDATE vendedores SET apellido = 'Rodríguez' WHERE nombre = 'Pedro' AND apellido IS NULL;
UPDATE vendedores SET apellido = 'González' WHERE nombre = 'Laura' AND apellido IS NULL;
UPDATE vendedores SET apellido = 'Fernández' WHERE nombre = 'Diego' AND apellido IS NULL;

-- Mostrar resultados
SELECT id, nombre, apellido, email, sucursal FROM vendedores ORDER BY id;

