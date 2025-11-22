/**
 * ====================================================
 * SERVIDOR API - SISTEMA ZARPAR
 * Sistema de Gestión Empresarial con Seguridad Máxima
 * ====================================================
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
// import { fileURLToPath } from 'url' // No necesario en CommonJS

// ========== MIDDLEWARES DE SEGURIDAD ==========
import {
  generalLimiter,
  securityHeaders,
  antiSEOHeaders,
  securityLogger,
  // preventSQLInjection, // Deshabilitado - prepared statements protegen
  // validateOrigin, // Deshabilitado - desarrollo local
} from './middleware/security.js'

// ========== RUTAS DE LA API ==========
import authRoutes from './routes/auth.js'
import vendedoresRoutes from './routes/vendedores.js'
import clientesRoutes from './routes/clientes.js'
import databaseRoutes from './routes/database.js'
import productosRoutes from './routes/productos.js'
import ventasRoutes from './routes/ventas.js'
import sucursalesRoutes from './routes/sucursales.js'
import transferenciasRoutes from './routes/transferencias.js'
import comisionesRoutes from './routes/comisiones.js'
import cajaRoutes from './routes/caja.js'
import sueldosRoutes from './routes/sueldos.js'
import devolucionesRoutes from './routes/devoluciones.js'
import descuentosRoutes from './routes/descuentos.js'
import historialStockRoutes from './routes/historialStock.js'
import enviosFallasRoutes from './routes/enviosFallas.js'
import pedidosRoutes from './routes/pedidos.js'
import cuentaCorrienteRoutes from './routes/cuentaCorriente.js'
import backupsRoutes from './routes/backups.js'

// En CommonJS, __filename y __dirname ya están disponibles globalmente
// No necesitamos definirlos manualmente

// load env
dotenv.config()

const app: express.Application = express()

// ========================================
// CONFIGURACIÓN DE TRUST PROXY (Railway/Producción)
// ========================================
// Railway usa un proxy inverso (Nginx) que agrega X-Forwarded-For
// Express necesita confiar en este proxy para rate limiting y seguridad
app.set('trust proxy', 1);

// ====================================================
// MIDDLEWARES GLOBALES DE SEGURIDAD
// ====================================================

// 1. Headers de seguridad (Helmet)
app.use(securityHeaders)

// 2. Anti-SEO Headers (Bloquear indexación por motores de búsqueda)
app.use(antiSEOHeaders)

// 3. CORS con configuración segura
app.use(cors({
  origin: [
    'http://localhost:5678',
    'http://localhost:5679',
    'http://localhost:3456',
    'http://127.0.0.1:5678',
    'http://127.0.0.1:5679',
    'http://127.0.0.1:3456',
    // Agregar dominio de producción aquí
  ],
  credentials: true,
  optionsSuccessStatus: 200
}))

// 4. Body parsers con límites
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 5. Logger de seguridad (registra todas las requests)
app.use(securityLogger)

// 6. Rate Limiting general (100 req/15min por IP) - ❌ DESHABILITADO
// app.use('/api', generalLimiter)

// 7. Protección contra SQL Injection - DESHABILITADO temporalmente
// Los prepared statements ya protegen contra SQL injection
// app.use('/api', preventSQLInjection)

// 8. Validación de origen (CSRF protection) - DESHABILITADO para desarrollo
// app.use('/api', validateOrigin)

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/vendedores', vendedoresRoutes)
app.use('/api/sucursales', sucursalesRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/database', databaseRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/transferencias', transferenciasRoutes)
app.use('/api/comisiones', comisionesRoutes)
app.use('/api/caja', cajaRoutes)
app.use('/api/sueldos', sueldosRoutes)
app.use('/api/devoluciones', devolucionesRoutes)
app.use('/api/descuentos', descuentosRoutes)
app.use('/api/historial-stock', historialStockRoutes)
app.use('/api/envios-fallas', enviosFallasRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/cuenta-corriente', cuentaCorrienteRoutes)
app.use('/api/backups', backupsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * Servir archivos estáticos del frontend (React build)
 */
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../dist');
  app.use(express.static(frontendPath));
  
  // Para SPA routing - todas las rutas no-API sirven index.html
  app.get('*', (req: Request, res: Response) => {
    // Solo para rutas que NO empiezan con /api
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ ERROR EN EL SERVIDOR:', error);
  console.error('Stack:', error.stack);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler - solo para rutas /api
 */
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
