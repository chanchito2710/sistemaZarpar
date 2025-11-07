/**
 * Script para resetear contraseñas de usuarios
 * Garantiza que todas las contraseñas estén con los hashes correctos
 * 
 * IMPORTANTE: Ejecutar solo si hay problemas de login
 * 
 * Uso:
 * docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase < database/reset_passwords.sql
 */

-- Resetear contraseña del administrador
-- Email: admin@zarparuy.com
-- Password: admin123
UPDATE `vendedores` 
SET `password` = '$2b$10$UuHGaYr79aoUwWEmzfo9jeYuqfZGyfBnElgFDVpQFgcjp.HZIc3Qa'
WHERE `email` = 'admin@zarparuy.com';

-- Resetear contraseña de Pando
-- Email: pando@zarparuy.com
-- Password: pando123
UPDATE `vendedores` 
SET `password` = '$2b$10$yFE/oQ1Q4DzaHYnBUdXsDehesrsX8wRXAT5QCULMjMoXeOhJKpEQG'
WHERE `email` = 'pando@zarparuy.com';

-- Resetear contraseña de Maldonado
-- Email: maldonado@zarparuy.com
-- Password: maldonado123
UPDATE `vendedores` 
SET `password` = '$2b$10$wgkA3.Swqav6ACCa.g8u3OJdhb07p8XMtTiPan6fXre5mUNH8tXyC'
WHERE `email` = 'maldonado@zarparuy.com';

-- Resetear contraseña de Rivera
-- Email: rivera@zarparuy.com
-- Password: rivera123
UPDATE `vendedores` 
SET `password` = '$2b$10$SP1p2quL68OLVHC4EnjUT.s73xmsvd7O.uyQBh3I/2B0o/gPyEgmS'
WHERE `email` = 'rivera@zarparuy.com';

-- Resetear contraseña de Melo
-- Email: melo@zarparuy.com
-- Password: melo123
UPDATE `vendedores` 
SET `password` = '$2b$10$Ua1.LYJOFoe6wGCI9/nZieNimv25FtPE9i0FeLmD7LQMgR7QsrAqG'
WHERE `email` = 'melo@zarparuy.com';

-- Resetear contraseña de Paysandú
-- Email: paysandu@zarparuy.com
-- Password: paysandu123
UPDATE `vendedores` 
SET `password` = '$2b$10$g8JVB2npAfZORZ5CvimIgul/ZRIYoBrSPWpLNursMEDabToC36qDC'
WHERE `email` = 'paysandu@zarparuy.com';

-- Resetear contraseña de Salto
-- Email: salto@zarparuy.com
-- Password: salto123
UPDATE `vendedores` 
SET `password` = '$2b$10$YyQOuHKcb5BOqDFVBU9fGu0YHQCggvDDVp3Y23h/6qfESI9OtTID2'
WHERE `email` = 'salto@zarparuy.com';

-- Resetear contraseña de Tacuarembó
-- Email: tacuarembo@zarparuy.com
-- Password: tacuarembo123
UPDATE `vendedores` 
SET `password` = '$2b$10$Bb8k3nOK6rxZfBTSWxPXmejIOzJG9LxRte8mWHd/ZJeaDE/wro.OS'
WHERE `email` = 'tacuarembo@zarparuy.com';

-- Mostrar resultado
SELECT 
    id,
    nombre,
    email,
    sucursal,
    'Contraseña reseteada correctamente' as estado
FROM `vendedores`
WHERE email IN (
    'admin@zarparuy.com',
    'pando@zarparuy.com',
    'maldonado@zarparuy.com',
    'rivera@zarparuy.com',
    'melo@zarparuy.com',
    'paysandu@zarparuy.com',
    'salto@zarparuy.com',
    'tacuarembo@zarparuy.com'
)
ORDER BY email;

