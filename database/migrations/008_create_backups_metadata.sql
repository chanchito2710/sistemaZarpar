-- ============================================================================
-- MIGRACIÓN: Tabla de Metadata de Backups
-- Descripción: Almacena información sobre todos los backups creados
-- Fecha: 22/11/2025
-- ============================================================================

USE zarparDataBase;

-- Crear tabla de metadata de backups
CREATE TABLE IF NOT EXISTS backups_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  tipo ENUM('automatico', 'manual') NOT NULL,
  nombre_personalizado VARCHAR(255) NULL,
  nota TEXT NULL,
  tamano_bytes BIGINT,
  creado_por_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_tipo (tipo),
  INDEX idx_created_at (created_at),
  INDEX idx_creado_por (creado_por_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de logs de operaciones con backups
CREATE TABLE IF NOT EXISTS backup_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accion ENUM('crear', 'restaurar', 'eliminar', 'descargar') NOT NULL,
  backup_filename VARCHAR(255),
  usuario_email VARCHAR(255),
  exitoso BOOLEAN DEFAULT TRUE,
  detalles TEXT,
  duracion_segundos INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_accion (accion),
  INDEX idx_usuario (usuario_email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar log de migración
INSERT INTO backup_logs (accion, backup_filename, usuario_email, detalles)
VALUES ('crear', 'system', 'sistema', 'Tablas de backups creadas exitosamente');

