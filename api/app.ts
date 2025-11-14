/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
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

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
