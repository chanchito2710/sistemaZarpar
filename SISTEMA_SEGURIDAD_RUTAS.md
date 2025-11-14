# 🔐 SISTEMA DE SEGURIDAD DE RUTAS
## Sistema Zarpar - Protección de Acceso

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Seguridad](#arquitectura-de-seguridad)
3. [Componentes de Protección](#componentes-de-protección)
4. [Rutas Protegidas](#rutas-protegidas)
5. [Permisos y Roles](#permisos-y-roles)
6. [Flujo de Autenticación](#flujo-de-autenticación)
7. [Casos de Uso](#casos-de-uso)

---

## 🎯 RESUMEN EJECUTIVO

El sistema implementa **3 capas de protección** para garantizar el acceso seguro a las rutas:

| Capa | Componente | Protección |
|------|------------|------------|
| 1 | `MainLayout` | Verificación general de autenticación |
| 2 | `ProtectedRoute` | Control de acceso por ruta |
| 3 | `Backend API` | Validación de permisos en cada request |

---

## 🏗️ ARQUITECTURA DE SEGURIDAD

### Flujo de Protección

```
Usuario intenta acceder a /products
           ↓
1. MainLayout verifica autenticación
           ├─ NO autenticado → Redirect /login
           └─ SÍ autenticado → Continuar
           ↓
2. ProtectedRoute verifica permisos
           ├─ requireAdmin=true → Verificar si es admin
           │  ├─ NO es admin → Mostrar error 403
           │  └─ SÍ es admin → Continuar
           ├─ requirePermisos → Verificar permisos específicos
           │  ├─ Sin permisos → Mostrar error 403
           │  └─ Con permisos → Continuar
           └─ Sin restricciones → Renderizar componente
           ↓
3. Componente carga datos desde API
           ↓
4. API Backend verifica token JWT
           ├─ Token inválido → Error 401
           ├─ Sin permisos → Error 403
           └─ Token válido → Retornar datos
```

---

## 🛡️ COMPONENTES DE PROTECCIÓN

### 1. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)

**Propósito:** Proteger rutas individuales con verificación granular de permisos.

**Props:**

| Prop | Tipo | Descripción | Ejemplo |
|------|------|-------------|---------|
| `children` | ReactNode | Componente a proteger | `<Products />` |
| `requireAdmin` | boolean | Requiere ser administrador | `true` |
| `requirePermisos` | string[] | Permisos específicos requeridos | `['gestionarBaseDatos']` |
| `redirectTo` | string | Ruta de redirección si no autenticado | `'/login'` |

**Uso básico:**

```tsx
// Ruta que requiere estar logueado
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Ruta que requiere ser admin
<Route path="/products" element={
  <ProtectedRoute requireAdmin={true}>
    <Products />
  </ProtectedRoute>
} />

// Ruta que requiere permiso específico
<Route path="/admin/database" element={
  <ProtectedRoute 
    requireAdmin={true} 
    requirePermisos={['gestionarBaseDatos']}
  >
    <DatabaseManager />
  </ProtectedRoute>
} />
```

**Estados del componente:**

#### Estado 1: Loading (Verificando autenticación)

```tsx
// Se muestra mientras se verifica el token
<Spin size="large" />
<p>Verificando autenticación...</p>
```

#### Estado 2: No Autenticado

```tsx
// Redirige automáticamente a /login
<Navigate to="/login" state={{ from: location.pathname }} />
```

#### Estado 3: Sin Permisos de Admin (403)

```tsx
<Result
  status="403"
  icon={<LockOutlined />}
  title="Acceso Denegado"
  subTitle="Esta página requiere permisos de Administrador."
  extra={[
    <Button onClick={() => navigate('/')}>Volver al Dashboard</Button>
  ]}
/>
```

#### Estado 4: Sin Permisos Específicos (403)

```tsx
<Result
  status="403"
  title="Permisos Insuficientes"
  subTitle="No tienes los permisos necesarios para acceder a esta página."
/>
```

#### Estado 5: Acceso Permitido

```tsx
// Renderiza el componente hijo
{children}
```

---

### 2. **MainLayout** (`src/components/layout/MainLayout.tsx`)

**Propósito:** Capa base de protección para todas las rutas dentro del layout.

**Verificación:**

```tsx
const { usuario, isAuthenticated, isLoading, logout } = useAuth();

if (!isLoading && !isAuthenticated) {
  return <Navigate to="/login" replace />;
}
```

**Beneficio:** Todas las rutas dentro de `<MainLayout />` están automáticamente protegidas.

---

### 3. **AuthContext** (`src/contexts/AuthContext.tsx`)

**Propósito:** Gestión centralizada de autenticación y usuario.

**Estado Global:**

```tsx
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  cargo: string;
  sucursal: string;
  esAdmin: boolean;
  tablasClientes: string[];
  permisos: {
    verTodasSucursales: boolean;
    modificarUsuarios: boolean;
    verReportesGlobales: boolean;
    gestionarBaseDatos: boolean;
  };
}
```

**Funciones:**

| Función | Descripción |
|---------|-------------|
| `login(email, password)` | Autenticar usuario |
| `logout()` | Cerrar sesión |
| `verificarAutenticacion()` | Verificar token almacenado |

**Uso en componentes:**

```tsx
import { useAuth } from '../contexts/AuthContext';

const MiComponente = () => {
  const { usuario, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return <div>Hola {usuario.nombre}</div>;
};
```

---

## 🔐 RUTAS PROTEGIDAS

### Tabla de Rutas y Permisos

| Ruta | Requiere Login | Solo Admin | Permisos Especiales |
|------|----------------|------------|---------------------|
| `/login` | ❌ No | ❌ No | - |
| `/` (Dashboard) | ✅ Sí | ❌ No | - |
| `/pos` | ✅ Sí | ❌ No | - |
| `/sales` | ✅ Sí | ❌ No | - |
| `/sales/returns` | ✅ Sí | ❌ No | - |
| `/inventory` | ✅ Sí | ❌ No | - |
| `/inventory/transfer` | ✅ Sí | ✅ **SÍ** | - |
| `/products` | ✅ Sí | ✅ **SÍ** | - |
| `/products/prices` | ✅ Sí | ❌ No | - |
| `/customers` | ✅ Sí | ❌ No | - |
| `/finance/cash` | ✅ Sí | ❌ No | - |
| `/finance/expenses` | ✅ Sí | ❌ No | - |
| `/admin/database` | ✅ Sí | ✅ **SÍ** | `gestionarBaseDatos` |
| `/staff/sellers` | ✅ Sí | ✅ **SÍ** | - |

---

## 👥 PERMISOS Y ROLES

### Roles del Sistema

#### 1. **Usuario Normal (Sucursal)**

**Características:**
- Email: `{sucursal}@zarparuy.com`
- Cargo: Vendedor, Encargado, etc.
- `esAdmin`: `false`

**Acceso:**
- ✅ Dashboard
- ✅ POS (Punto de Venta)
- ✅ Ventas de su sucursal
- ✅ Devoluciones
- ✅ Inventario (solo lectura)
- ✅ Clientes de su sucursal
- ✅ Finanzas de su sucursal
- ❌ Gestión de productos
- ❌ Transferencias de inventario
- ❌ Base de datos
- ❌ Gestión de vendedores

**Ejemplo de Usuario:**
```json
{
  "email": "pando@zarparuy.com",
  "nombre": "Juan Pérez",
  "cargo": "Vendedor",
  "sucursal": "pando",
  "esAdmin": false,
  "permisos": {
    "verTodasSucursales": false,
    "modificarUsuarios": false,
    "verReportesGlobales": false,
    "gestionarBaseDatos": false
  }
}
```

---

#### 2. **Administrador**

**Características:**
- Email: `admin@zarparuy.com`
- Cargo: Administrador / Director General
- `esAdmin`: `true`

**Acceso:**
- ✅ **TODO** el sistema
- ✅ Todas las sucursales
- ✅ Gestión de productos
- ✅ Transferencias de inventario
- ✅ Base de datos
- ✅ Gestión de vendedores
- ✅ Reportes globales

**Ejemplo de Usuario:**
```json
{
  "email": "admin@zarparuy.com",
  "nombre": "Administrador",
  "cargo": "Administrador",
  "sucursal": "administracion",
  "esAdmin": true,
  "permisos": {
    "verTodasSucursales": true,
    "modificarUsuarios": true,
    "verReportesGlobales": true,
    "gestionarBaseDatos": true
  }
}
```

---

## 🔄 FLUJO DE AUTENTICACIÓN

### Escenario 1: Usuario Nuevo (Sin Token)

```
1. Usuario abre http://localhost:5678/products
   ↓
2. App.tsx carga
   ↓
3. AuthProvider verifica localStorage
   ├─ No hay token
   └─ isAuthenticated = false
   ↓
4. MainLayout detecta !isAuthenticated
   ↓
5. Redirect a /login
   ↓
6. Usuario ingresa credenciales
   ↓
7. AuthContext.login() llama API
   ↓
8. API retorna { token, usuario }
   ↓
9. Token se guarda en localStorage
   ↓
10. isAuthenticated = true
   ↓
11. Redirect a /products
   ↓
12. ProtectedRoute verifica requireAdmin
   ├─ usuario.esAdmin = true → Permitir
   └─ usuario.esAdmin = false → Error 403
```

---

### Escenario 2: Usuario con Token Válido

```
1. Usuario abre http://localhost:5678/
   ↓
2. AuthProvider verifica localStorage
   ├─ Token encontrado
   └─ Llama /api/auth/verificar
   ↓
3. API valida token JWT
   ├─ Token válido → Retorna datos de usuario
   └─ Token inválido → Error 401
   ↓
4. Si válido:
   ├─ isAuthenticated = true
   ├─ usuario = {...}
   └─ Renderiza Dashboard
```

---

### Escenario 3: Usuario Intenta Acceso No Autorizado

```
Usuario: pando@zarparuy.com (NO admin)
Intenta acceder: /products

1. MainLayout permite (está autenticado)
   ↓
2. ProtectedRoute verifica requireAdmin
   ├─ Requerido: true
   ├─ Usuario.esAdmin: false
   └─ ACCESO DENEGADO
   ↓
3. Renderiza pantalla de Error 403
   ├─ Mensaje: "Requiere permisos de Administrador"
   ├─ Botón: "Volver al Dashboard"
   └─ Botón: "Regresar"
```

---

## 💡 CASOS DE USO

### Caso 1: Proteger Nueva Ruta

**Requisito:** Crear ruta `/reports/sales` solo para administradores.

**Solución:**

```tsx
// En App.tsx
<Route path="reports/sales" element={
  <ProtectedRoute requireAdmin={true}>
    <SalesReport />
  </ProtectedRoute>
} />
```

---

### Caso 2: Proteger Ruta con Permiso Específico

**Requisito:** Ruta `/config/system` solo para usuarios con permiso `configurarSistema`.

**Solución:**

1. Agregar permiso al tipo `Usuario`:

```tsx
// En AuthContext.tsx
interface Usuario {
  // ... otros campos
  permisos: {
    // ... otros permisos
    configurarSistema: boolean;
  };
}
```

2. Proteger la ruta:

```tsx
// En App.tsx
<Route path="config/system" element={
  <ProtectedRoute requirePermisos={['configurarSistema']}>
    <SystemConfig />
  </ProtectedRoute>
} />
```

---

### Caso 3: Verificar Permisos Dentro de un Componente

**Requisito:** Mostrar botón "Eliminar" solo si es admin.

**Solución:**

```tsx
import { useAuth } from '../contexts/AuthContext';

const MiComponente = () => {
  const { usuario } = useAuth();
  
  return (
    <div>
      <Button>Ver</Button>
      <Button>Editar</Button>
      
      {usuario?.esAdmin && (
        <Button danger>Eliminar</Button>
      )}
    </div>
  );
};
```

---

### Caso 4: Redirigir Después del Login

**Requisito:** Redirigir al usuario a la página que intentó acceder antes de loguearse.

**Solución:**

```tsx
// En Login.tsx
const navigate = useNavigate();
const location = useLocation();

const onFinish = async (values) => {
  const success = await login(values.email, values.password);
  
  if (success) {
    // Redirigir a la página original o al dashboard
    const from = location.state?.from || '/';
    navigate(from, { replace: true });
  }
};
```

---

## 🎯 MEJORES PRÁCTICAS

### 1. Siempre Verificar en el Backend

❌ **MAL:**
```tsx
// Solo verificación en frontend
{usuario.esAdmin && <Button>Eliminar</Button>}
```

✅ **BIEN:**
```tsx
// Verificación en frontend + backend
{usuario.esAdmin && <Button onClick={handleEliminar}>Eliminar</Button>}

// Y en handleEliminar:
const handleEliminar = async () => {
  try {
    // El backend TAMBIÉN verifica permisos
    await api.delete(`/productos/${id}`);
  } catch (error) {
    if (error.response.status === 403) {
      message.error('No tienes permisos para esta acción');
    }
  }
};
```

---

### 2. Usar ProtectedRoute en Vez de Lógica Manual

❌ **MAL:**
```tsx
const MiComponente = () => {
  const { usuario } = useAuth();
  
  if (!usuario) return <Navigate to="/login" />;
  if (!usuario.esAdmin) return <div>Acceso denegado</div>;
  
  return <div>Contenido</div>;
};
```

✅ **BIEN:**
```tsx
// En App.tsx
<Route path="/ruta" element={
  <ProtectedRoute requireAdmin={true}>
    <MiComponente />
  </ProtectedRoute>
} />
```

---

### 3. Logs de Seguridad

El sistema automáticamente registra en consola:

```
✅ Acceso permitido a: /products
   Usuario: admin@zarparuy.com
   Cargo: Administrador
   Sucursal: administracion

🚫 Acceso denegado: Requiere permisos de administrador
   Usuario: pando@zarparuy.com
   Cargo: Vendedor
   Ruta: /products
```

**Beneficio:** Auditoría de accesos y detección de intentos no autorizados.

---

## 🔧 CONFIGURACIÓN AVANZADA

### Personalizar Pantalla de Error 403

```tsx
// En ProtectedRoute.tsx, modificar el Result:
<Result
  status="403"
  title="Acceso Restringido"
  subTitle="Esta sección está disponible solo para administradores."
  extra={[
    <Button type="primary" onClick={() => navigate('/')}>
      Ir al Inicio
    </Button>
  ]}
/>
```

---

### Agregar Nuevos Roles

**Paso 1:** Definir nuevo rol en backend (`api/controllers/authController.ts`):

```typescript
// Identificar rol "Gerente"
const esGerente = cargo.toLowerCase().includes('gerente');

// Agregar al payload del token
const tokenPayload = {
  // ... otros campos
  esGerente,
  permisos: {
    // ... otros permisos
    aprobarGastos: esGerente || esAdmin
  }
};
```

**Paso 2:** Actualizar interfaz `Usuario` en frontend:

```tsx
interface Usuario {
  // ... otros campos
  esGerente: boolean;
  permisos: {
    // ... otros permisos
    aprobarGastos: boolean;
  };
}
```

**Paso 3:** Proteger rutas según el nuevo rol:

```tsx
<Route path="/gastos/aprobar" element={
  <ProtectedRoute requirePermisos={['aprobarGastos']}>
    <AprobarGastos />
  </ProtectedRoute>
} />
```

---

## ✅ CHECKLIST DE SEGURIDAD

```
[ ] ✅ Todas las rutas sensibles usan ProtectedRoute
[ ] ✅ MainLayout verifica autenticación general
[ ] ✅ Backend valida permisos en cada endpoint
[ ] ✅ Token JWT con expiración configurada
[ ] ✅ Logs de acceso en consola
[ ] ✅ Pantallas de error 403 informativas
[ ] ✅ Redirección post-login funcional
[ ] ✅ Logout limpia localStorage y estado
```

---

## 🎓 DOCUMENTACIÓN RELACIONADA

- **Autenticación JWT:** `api/middleware/auth.ts`
- **Contexto de Auth:** `src/contexts/AuthContext.tsx`
- **Componente de Protección:** `src/components/ProtectedRoute.tsx`
- **Configuración de Rutas:** `src/App.tsx`

---

## 🚀 RESULTADO FINAL

```
╔════════════════════════════════════════════════╗
║   🔐 SISTEMA DE SEGURIDAD 100% FUNCIONAL     ║
╚════════════════════════════════════════════════╝

✅ 3 Capas de protección activas
✅ Verificación de permisos granular
✅ Protección frontend + backend
✅ Logs de auditoría en consola
✅ Rutas críticas protegidas
✅ Experiencia de usuario clara
```

---

**Versión:** 1.0.0  
**Fecha:** 14 de Noviembre, 2025  
**Sistema:** Zarpar - Gestión Empresarial

