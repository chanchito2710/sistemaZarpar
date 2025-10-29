# 🔐 SISTEMA DE AUTENTICACIÓN Y ROLES - ZARPAR

## 📋 RESUMEN

Se ha implementado un sistema completo de autenticación y roles con las siguientes características:

- ✅ Login con email y contraseña
- ✅ Tokens JWT seguros
- ✅ Roles de usuario (Admin y Vendedores por sucursal)
- ✅ Protección de rutas en frontend y backend
- ✅ Permisos por sucursal

---

## 👥 USUARIOS DEL SISTEMA

### 👑 Administrador (Acceso Total)
```
Email: admin@zarparuy.com
Contraseña: zarpar123
Permisos: Acceso a TODAS las sucursales y TODAS las tablas de clientes
```

### 🏢 Vendedores por Sucursal (Acceso Limitado)

| Sucursal    | Email                    | Contraseña  | Acceso                        |
|-------------|--------------------------|-------------|-------------------------------|
| Pando       | pando@zarparuy.com       | zarpar123   | Solo `clientes_pando`         |
| Maldonado   | maldonado@zarparuy.com   | zarpar123   | Solo `clientes_maldonado`     |
| Rivera      | rivera@zarparuy.com      | zarpar123   | Solo `clientes_rivera`        |
| Melo        | melo@zarparuy.com        | zarpar123   | Solo `clientes_melo`          |
| Paysandú    | paysandu@zarparuy.com    | zarpar123   | Solo `clientes_paysandu`      |
| Salto       | salto@zarparuy.com       | zarpar123   | Solo `clientes_salto`         |
| Tacuarembó  | tacuarembo@zarparuy.com  | zarpar123   | Solo `clientes_tacuarembo`    |

---

## 🎯 REGLAS DE NEGOCIO

### 1. Acceso por Rol

#### Administrador (admin@zarparuy.com)
- ✅ Puede ver **TODAS** las tablas de clientes
- ✅ Puede acceder a **TODAS** las sucursales
- ✅ Puede gestionar vendedores de cualquier sucursal
- ✅ Puede generar reportes consolidados
- ✅ Tiene permisos completos en la base de datos

#### Vendedor Normal
- ✅ Solo puede ver clientes de **SU sucursal**
- ❌ NO puede acceder a otras sucursales
- ❌ NO puede ver clientes de otras sucursales
- ✅ Puede gestionar solo sus clientes asignados

### 2. Relaciones

```
Usuario → Sucursal → Clientes

Ejemplo 1 (Admin):
admin@zarparuy.com → Todas las sucursales → Todas las tablas de clientes

Ejemplo 2 (Vendedor):
pando@zarparuy.com → Sucursal Pando → Solo clientes_pando
```

---

## 🔧 ARCHIVOS IMPLEMENTADOS

### Backend

#### 📁 Configuración
- `api/config/database.ts` - Conexión a MySQL
- `.env` - Variables de entorno (DB_HOST, DB_PORT, JWT_SECRET, etc.)

#### 📁 Controladores
- `api/controllers/authController.ts` - Login, logout, verificar token, cambiar contraseña
- `api/controllers/clientesController.ts` - CRUD de clientes por sucursal (ya existía)
- `api/controllers/vendedoresController.ts` - Gestión de vendedores (ya existía)

#### 📁 Middleware
- `api/middleware/auth.ts` - Middleware de autenticación y verificación de roles
  - `verificarAutenticacion` - Verifica que el token JWT sea válido
  - `verificarAdmin` - Verifica que el usuario sea administrador
  - `verificarAccesoSucursal` - Verifica que el usuario tenga acceso a la sucursal
  - `verificarAccesoTablaClientes` - Verifica acceso a tablas de clientes

#### 📁 Rutas
- `api/routes/auth.ts` - Rutas de autenticación (/api/auth/login, /logout, /verificar, etc.)
- `api/routes/clientes.ts` - Rutas de clientes (protegidas con middleware)

#### 📁 Base de Datos
- `database/add_authentication.sql` - Script SQL para agregar autenticación
- `database/schema_zarpar_pos.sql` - Schema de la base de datos (ya existía)

#### 📁 Scripts
- `scripts/setup-auth.js` - Script ejecutado para configurar usuarios (eliminado después)

### Frontend

#### 📁 Contextos
- `src/contexts/AuthContext.tsx` - Contexto global de autenticación
  - Hook: `useAuth()` - Para acceder al usuario y funciones de auth

#### 📁 Páginas
- `src/pages/Login.tsx` - Página de login con formulario funcional

#### 📁 Componentes
- `src/components/layout/MainLayout.tsx` - Layout principal con protección de rutas

#### 📁 Servicios
- `src/services/api.ts` - Cliente Axios con interceptores para tokens

#### 📁 App
- `src/App.tsx` - Envuelto con `AuthProvider` y rutas configuradas

---

## 🚀 FLUJO DE AUTENTICACIÓN

### 1. Login

```typescript
Usuario ingresa email y contraseña
    ↓
POST /api/auth/login
    ↓
Backend verifica credenciales en DB
    ↓
Backend genera token JWT (válido 24h)
    ↓
Frontend guarda token en localStorage
    ↓
Frontend guarda usuario en contexto
    ↓
Redirecciona a Dashboard
```

### 2. Acceso a Rutas Protegidas

```typescript
Usuario intenta acceder a /customers
    ↓
MainLayout verifica isAuthenticated
    ↓
Si NO está autenticado → Redirige a /login
    ↓
Si SÍ está autenticado → Permite acceso
```

### 3. Peticiones a la API

```typescript
Frontend hace petición (ej: obtener clientes)
    ↓
Interceptor agrega: Authorization: Bearer <token>
    ↓
Backend middleware verifica token
    ↓
Backend middleware verifica permisos de sucursal
    ↓
Si es Admin → Permite acceso a cualquier sucursal
Si es Vendedor → Solo permite su sucursal
    ↓
Retorna datos o error 403 (Forbidden)
```

### 4. Logout

```typescript
Usuario hace click en "Cerrar Sesión"
    ↓
Frontend llama a logout()
    ↓
POST /api/auth/logout (opcional, para logging)
    ↓
Frontend elimina token de localStorage
    ↓
Frontend limpia contexto de usuario
    ↓
Redirecciona a /login
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

### 1. Contraseñas
- ✅ Encriptadas con `bcryptjs` (10 rounds)
- ✅ Nunca se devuelven en respuestas de API
- ✅ Validación de longitud mínima (6 caracteres)

### 2. Tokens JWT
- ✅ Firmados con secret key (cambiar en producción)
- ✅ Expiración de 24 horas
- ✅ Incluyen información del usuario (id, email, rol, sucursal)
- ✅ Verificados en cada petición

### 3. Rutas Protegidas
- ✅ Backend: Middleware de autenticación en todas las rutas sensibles
- ✅ Frontend: Redirección automática a login si no está autenticado
- ✅ Validación de permisos por sucursal

### 4. Validación de Inputs
- ✅ Validación de email (formato correcto)
- ✅ Sanitización de datos
- ✅ Prepared statements en SQL (protección contra SQL Injection)
- ✅ Manejo de errores apropiado

### 5. Headers de Seguridad
- ✅ Authorization: Bearer <token>
- ✅ Content-Type: application/json
- ✅ CORS configurado

---

## 🔧 CONFIGURACIÓN NECESARIA

### Variables de Entorno (.env)

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=zarpar2025
DB_NAME=zarparDataBase

# Servidor
PORT=3456
NODE_ENV=development

# JWT (⚠️ CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=zarpar_secret_key_2025_change_in_production
```

### Dependencias Instaladas

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cookie-parser": "^1.4.6"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cookie-parser": "^1.4.6"
  }
}
```

---

## 📝 EJEMPLOS DE USO

### Frontend: Usar el Hook useAuth

```typescript
import { useAuth } from '../contexts/AuthContext';

function MiComponente() {
  const { usuario, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <p>Sucursal: {usuario?.sucursal}</p>
      {usuario?.esAdmin && <p>👑 Eres administrador</p>}
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### Backend: Acceder al Usuario en Controladores

```typescript
import { Request, Response } from 'express';

export const miControlador = async (req: Request, res: Response) => {
  // El usuario está disponible en req.usuario (agregado por el middleware)
  const usuario = req.usuario;

  console.log(`Usuario ${usuario?.email} accediendo a ${req.path}`);

  if (usuario?.esAdmin) {
    // Lógica especial para admin
  } else {
    // Lógica para vendedor normal
  }
};
```

### Backend: Proteger Rutas Nuevas

```typescript
import { Router } from 'express';
import { verificarAutenticacion, verificarAdmin } from '../middleware/auth.js';
import { miControlador } from '../controllers/miControlador.js';

const router = Router();

// Ruta que requiere autenticación
router.get('/protegida', verificarAutenticacion, miControlador);

// Ruta que solo admin puede acceder
router.post('/admin-only', verificarAutenticacion, verificarAdmin, miControlador);

export default router;
```

---

## ⚠️ IMPORTANTE PARA PRODUCCIÓN

### 🔴 ANTES DE SUBIR A PRODUCCIÓN:

1. **Cambiar contraseñas por defecto**
   - ❌ `zarpar123` es TEMPORAL
   - ✅ Usar contraseñas fuertes y únicas

2. **Cambiar JWT_SECRET**
   - ❌ NO usar `zarpar_secret_key_2025_change_in_production`
   - ✅ Generar secret aleatorio y fuerte
   - Ejemplo: `openssl rand -base64 64`

3. **Configurar HTTPS**
   - ❌ NO enviar tokens por HTTP
   - ✅ Usar HTTPS en producción

4. **Configurar CORS correctamente**
   - ❌ NO permitir `*` (todos los orígenes)
   - ✅ Especificar dominios permitidos

5. **Implementar rate limiting**
   - ✅ Limitar intentos de login
   - ✅ Proteger contra fuerza bruta

6. **Logs de seguridad**
   - ✅ Registrar intentos de login fallidos
   - ✅ Registrar accesos no autorizados

---

## 🧪 CÓMO PROBAR

### 1. Iniciar el Sistema

```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
npm run client:dev
```

### 2. Ir a http://localhost:5678/login

### 3. Probar con diferentes usuarios

**Prueba 1: Administrador**
- Email: `admin@zarparuy.com`
- Contraseña: `zarpar123`
- Resultado: Debería ver tag "ADMIN" dorado y sucursal "Administracion"

**Prueba 2: Vendedor**
- Email: `pando@zarparuy.com`
- Contraseña: `zarpar123`
- Resultado: Debería ver sucursal "pando" y acceso limitado

### 4. Verificar Permisos

- Como admin: Acceder a `/admin/database` → ✅ Permitido
- Como vendedor: Intentar acceder datos de otra sucursal → ❌ Error 403

---

## 📚 PRÓXIMOS PASOS SUGERIDOS

### 1. Interfaz de Gestión de Usuarios
- Crear página para que admin pueda:
  - Crear nuevos vendedores
  - Desactivar usuarios
  - Cambiar contraseñas
  - Asignar sucursales

### 2. Selector de Sucursales para Admin
- Agregar dropdown en el header para que admin pueda:
  - Filtrar vista por sucursal
  - Ver datos consolidados de todas

### 3. Recuperación de Contraseña
- Implementar flujo de "Olvidé mi contraseña"
- Envío de emails con token temporal

### 4. Sesiones Simultáneas
- Decidir si permitir múltiples sesiones
- Implementar "logout de todos los dispositivos"

### 5. Auditoría
- Tabla de logs de acciones
- Registro de quién modificó qué y cuándo

---

## 📞 SOPORTE

Si tienes problemas:

1. Verificar que MySQL esté corriendo
2. Verificar que las credenciales en `.env` sean correctas
3. Verificar que todos los usuarios existan en la tabla `vendedores`
4. Ver logs de consola en frontend y backend
5. Verificar que el token esté en localStorage: `localStorage.getItem('token')`

---

**Fecha de implementación**: Octubre 28, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ COMPLETADO Y FUNCIONAL

