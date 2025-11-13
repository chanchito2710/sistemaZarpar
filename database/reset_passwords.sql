-- Resetear contraseñas de todos los usuarios de login a zarpar123
-- Hash bcrypt válido para 'zarpar123'

USE zarparDataBase;

-- Hash generado con bcrypt.hash('zarpar123', 10)
SET @password_hash = '$2b$10$lAzlUyLB21YOB/RtGW0FAep8i/iOvJBwHLUu6csodtok94i5BZgX6';

-- Actualizar administrador
UPDATE vendedores 
SET password = @password_hash
WHERE email = 'admin@zarparuy.com';

-- Actualizar usuarios de sucursales
UPDATE vendedores 
SET password = @password_hash
WHERE email IN (
  'pando@zarparuy.com',
  'maldonado@zarparuy.com',
  'rivera@zarparuy.com',
  'melo@zarparuy.com',
  'paysandu@zarparuy.com',
  'salto@zarparuy.com',
  'tacuarembo@zarparuy.com',
  'rionegro@zarparuy.com',
  'soriano@zarparuy.com'
);

-- Verificar
SELECT 
  email,
  LEFT(password, 30) as password_hash_preview,
  CASE 
    WHEN password LIKE '$2b$10$%' THEN '✓ Hash válido'
    ELSE '✗ Hash inválido'
  END as estado
FROM vendedores
WHERE email IN (
  'admin@zarparuy.com',
  'pando@zarparuy.com',
  'maldonado@zarparuy.com',
  'rivera@zarparuy.com',
  'melo@zarparuy.com',
  'paysandu@zarparuy.com',
  'salto@zarparuy.com',
  'tacuarembo@zarparuy.com',
  'rionegro@zarparuy.com',
  'soriano@zarparuy.com'
)
ORDER BY email;
