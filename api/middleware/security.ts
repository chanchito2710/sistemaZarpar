/**
 * ====================================================
 * MIDDLEWARE DE SEGURIDAD
 * Protección contra ataques y validación de datos
 * ====================================================
 * 
 * PROTECCIONES IMPLEMENTADAS:
 * 1. SQL Injection → Prepared Statements
 * 2. XSS → Sanitización de inputs
 * 3. Brute Force → Rate Limiting
 * 4. CSRF → Tokens y validación de origen
 * 5. Headers inseguros → Helmet
 * 6. DOS → Límites de requests
 * 
 * ====================================================
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult, query, param } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

// =====================================================
// 1. RATE LIMITING - Prevenir Ataques de Fuerza Bruta
// =====================================================

/**
 * Rate Limiter GENERAL
 * Límite: 100 requests por 15 minutos por IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: {
    error: 'Demasiadas solicitudes desde esta IP. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true, // Retornar info en headers `RateLimit-*`
  legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
  handler: (req: Request, res: Response) => {
    console.log(`🚨 RATE LIMIT EXCEDIDO - IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      retryAfter: '15 minutos'
    });
  }
});

/**
 * Rate Limiter para LOGIN
 * Límite: 5 intentos por 15 minutos por IP
 * Protección contra ataques de fuerza bruta
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    error: 'Demasiados intentos de login. Tu cuenta ha sido bloqueada temporalmente.'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req: Request, res: Response) => {
    console.log(`🚨 INTENTO DE BRUTE FORCE LOGIN - IP: ${req.ip}, Email: ${req.body.email}`);
    res.status(429).json({
      success: false,
      error: 'Demasiados intentos de login fallidos. Intenta de nuevo en 15 minutos.',
      retryAfter: '15 minutos'
    });
  }
});

/**
 * Rate Limiter para OPERACIONES CRÍTICAS
 * Límite: 20 requests por 5 minutos
 * Para endpoints de modificación de datos sensibles
 */
export const criticalOperationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // 20 requests
  message: {
    error: 'Demasiadas operaciones críticas. Espera 5 minutos.'
  },
  handler: (req: Request, res: Response) => {
    console.log(`🚨 RATE LIMIT CRÍTICO - IP: ${req.ip}, Ruta: ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Límite de operaciones alcanzado. Intenta de nuevo en 5 minutos.',
      retryAfter: '5 minutos'
    });
  }
});

// =====================================================
// 2. HELMET - Headers de Seguridad
// =====================================================

/**
 * Configuración de Helmet
 * Agrega headers de seguridad HTTP
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Deshabilitar para desarrollo
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Middleware para BLOQUEAR SEO y Rastreadores
 * Previene que el sitio sea indexado por motores de búsqueda
 */
export const antiSEOHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Headers para prevenir indexación por bots
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  
  // Cache control estricto
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Prevenir que aparezca en archives
  res.setHeader('X-Archive', 'never');
  
  // Eliminar headers que revelan información
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

// =====================================================
// 3. VALIDACIÓN DE INPUTS
// =====================================================

/**
 * Sanitizar String
 * Elimina caracteres peligrosos de un string
 */
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    // Eliminar tags HTML
    .replace(/<[^>]*>/g, '')
    // Eliminar scripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar caracteres especiales peligrosos
    .replace(/[<>\"'`]/g, '')
    // Limitar longitud
    .slice(0, 500);
};

/**
 * Validar Email
 */
export const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Email debe tener entre 5 y 100 caracteres'),
];

/**
 * Validar Password
 */
export const validatePassword = [
  body('password')
    .isString()
    .withMessage('Password debe ser un string')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password debe tener entre 6 y 100 caracteres')
    .matches(/^[a-zA-Z0-9@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
    .withMessage('Password contiene caracteres no permitidos'),
];

/**
 * Validar ID Numérico
 */
export const validateNumericId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número positivo')
    .toInt(),
];

/**
 * Validar Sucursal
 */
export const validateSucursal = [
  body('sucursal')
    .optional()
    .isString()
    .withMessage('Sucursal debe ser un string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Sucursal debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Sucursal contiene caracteres no permitidos')
    .customSanitizer(sanitizeString),
];

/**
 * Validar Monto
 */
export const validateMonto = [
  body('monto')
    .isFloat({ min: 0 })
    .withMessage('Monto debe ser un número positivo')
    .toFloat(),
];

/**
 * Validar Texto General
 */
export const validateTexto = (campo: string, min: number = 1, max: number = 500) => [
  body(campo)
    .optional()
    .isString()
    .withMessage(`${campo} debe ser un string`)
    .isLength({ min, max })
    .withMessage(`${campo} debe tener entre ${min} y ${max} caracteres`)
    .customSanitizer(sanitizeString),
];

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ ERRORES DE VALIDACIÓN:', errors.array());
    console.log('   IP:', req.ip);
    console.log('   Ruta:', req.path);
    console.log('   Body:', JSON.stringify(req.body));
    
    res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      errores: errors.array().map(err => ({
        campo: err.type === 'field' ? err.path : 'unknown',
        mensaje: err.msg
      }))
    });
    return;
  }
  
  next();
};

// =====================================================
// 4. PROTECCIÓN SQL INJECTION
// =====================================================

/**
 * Validar que NO haya SQL Injection
 * Este middleware detecta patrones sospechosos en los datos
 */
export const preventSQLInjection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Patrones más específicos y menos falsos positivos
  const suspiciousPatterns = [
    // Comandos SQL peligrosos (con espacios o al inicio/fin)
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b.*\b(FROM|INTO|WHERE|SET|TABLE)\b)/gi,
    // Comentarios SQL
    /(--|\/\*|\*\/|#)/gi,
    // Procedimientos almacenados peligrosos
    /(xp_|sp_cmdshell)/gi,
    // Múltiples statements
    /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/gi,
  ];

  const checkForInjection = (obj: any, path: string = ''): boolean => {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      // ⚠️ EXCEPCIÓN: No validar el campo 'email' con estos patrones
      // Los emails legítimos contienen @ que puede generar falsos positivos
      if (key === 'email' && typeof value === 'string') {
        // Para emails, solo verificar patrones MUY obvios de SQL injection
        const emailDangerousPatterns = [
          /'\s+OR\s+'/gi,      // ' OR '
          /--/gi,               // Comentarios SQL
          /;\s*DROP/gi,         // ; DROP
          /UNION\s+SELECT/gi    // UNION SELECT
        ];
        
        for (const pattern of emailDangerousPatterns) {
          if (pattern.test(value)) {
            console.log(`🚨 SQL INJECTION en EMAIL detectado:`);
            console.log(`   IP: ${req.ip}`);
            console.log(`   Ruta: ${req.path}`);
            console.log(`   Email: ${value}`);
            return true;
          }
        }
        continue; // Skip patrones normales para email
      }
      
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            console.log(`🚨 POSIBLE SQL INJECTION DETECTADO:`);
            console.log(`   IP: ${req.ip}`);
            console.log(`   Ruta: ${req.path}`);
            console.log(`   Campo: ${currentPath}`);
            console.log(`   Valor: ${value}`);
            console.log(`   Patrón: ${pattern}`);
            return true;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        if (checkForInjection(value, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar body, query y params
  if (
    checkForInjection(req.body, 'body') ||
    checkForInjection(req.query, 'query') ||
    checkForInjection(req.params, 'params')
  ) {
    res.status(400).json({
      success: false,
      error: 'Solicitud rechazada por razones de seguridad',
      mensaje: 'Se detectó un patrón sospechoso en los datos enviados'
    });
    return;
  }

  next();
};

// =====================================================
// 5. LOG DE SEGURIDAD
// =====================================================

/**
 * Middleware para registrar todas las requests
 * Útil para auditoría y detección de ataques
 */
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.socket.remoteAddress;
  const method = req.method;
  const path = req.path;
  const userAgent = req.get('user-agent') || 'Unknown';

  console.log(`🔒 [${timestamp}] ${method} ${path} - IP: ${ip}`);
  
  // Log adicional para operaciones sensibles
  const sensitivePaths = ['/login', '/admin', '/database', '/vendedores'];
  if (sensitivePaths.some(p => path.includes(p))) {
    console.log(`   🔴 OPERACIÓN SENSIBLE`);
    console.log(`   User-Agent: ${userAgent}`);
  }

  next();
};

// =====================================================
// 6. VALIDACIÓN DE ORIGEN (CSRF Protection)
// =====================================================

/**
 * Validar origen de la request
 * Prevenir ataques CSRF
 */
export const validateOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = req.get('origin');
  const referer = req.get('referer');
  
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:5678',
    'http://localhost:3456',
    'http://127.0.0.1:5678',
    'http://127.0.0.1:3456',
    // Agregar tu dominio de producción aquí
    // 'https://tu-dominio.com',
  ];

  // Permitir requests sin origen (ej: Postman, curl)
  if (!origin && !referer) {
    next();
    return;
  }

  // Verificar origen
  const isAllowed = allowedOrigins.some(allowed => {
    if (origin && origin.startsWith(allowed)) return true;
    if (referer && referer.startsWith(allowed)) return true;
    return false;
  });

  if (!isAllowed) {
    console.log(`🚨 ORIGEN NO PERMITIDO:`);
    console.log(`   Origin: ${origin}`);
    console.log(`   Referer: ${referer}`);
    console.log(`   IP: ${req.ip}`);
    console.log(`   Path: ${req.path}`);
    
    res.status(403).json({
      success: false,
      error: 'Origen no permitido',
      mensaje: 'La solicitud proviene de un origen no autorizado'
    });
    return;
  }

  next();
};

// =====================================================
// 7. EXPORTAR VALIDACIONES COMBINADAS
// =====================================================

/**
 * Validación completa para LOGIN
 */
export const validateLogin = [
  ...validateEmail,
  ...validatePassword,
  handleValidationErrors
];

/**
 * Validación para crear/actualizar PRODUCTOS
 */
export const validateProducto = [
  body('nombre')
    .isString()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nombre debe tener entre 3 y 200 caracteres')
    .customSanitizer(sanitizeString),
  
  body('marca')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(sanitizeString),
  
  body('tipo')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer(sanitizeString),
  
  body('calidad')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(sanitizeString),
  
  body('codigo_barras')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Código de barras contiene caracteres no permitidos'),
  
  handleValidationErrors
];

/**
 * Validación para VENTAS
 */
export const validateVenta = [
  body('cliente_id')
    .isInt({ min: 1 })
    .withMessage('Cliente ID inválido')
    .toInt(),
  
  body('total')
    .isFloat({ min: 0.01 })
    .withMessage('Total debe ser mayor a 0')
    .toFloat(),
  
  body('metodo_pago')
    .isIn(['efectivo', 'transferencia', 'cuenta_corriente'])
    .withMessage('Método de pago inválido'),
  
  body('productos')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un producto'),
  
  ...validateSucursal,
  
  handleValidationErrors
];

export default {
  generalLimiter,
  loginLimiter,
  criticalOperationsLimiter,
  securityHeaders,
  preventSQLInjection,
  securityLogger,
  validateOrigin,
  validateLogin,
  validateProducto,
  validateVenta,
  handleValidationErrors,
};

