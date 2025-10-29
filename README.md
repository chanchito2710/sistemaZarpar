# 🏪 Sistema ZARPAR - Sistema POS Multi-Sucursal

Sistema completo de Punto de Venta (POS) para gestión de inventario, ventas, clientes y finanzas en múltiples sucursales.

---

## 🚀 Características Principales

- ✅ **Multi-Sucursal**: Gestión de 7 sucursales independientes (Maldonado, Pando, Rivera, Melo, Paysandú, Salto, Tacuarembó)
- ✅ **Control de Roles**: Administrador con acceso total, usuarios por sucursal con acceso limitado
- ✅ **Gestión de Productos**: Catálogo de productos con stock y precios por sucursal
- ✅ **Punto de Venta (POS)**: Interfaz para realizar ventas con selección de sucursal, cliente y vendedor
- ✅ **Gestión de Clientes**: Base de datos de clientes por sucursal
- ✅ **Inventario**: Control de stock en tiempo real por sucursal
- ✅ **Finanzas**: Módulos de caja, bancos, gastos, sueldos y transferencias
- ✅ **Reportes**: Dashboard con estadísticas y métricas
- ✅ **Administración de BD**: Interfaz para gestionar tablas y datos directamente

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** (build tool ultra-rápido)
- **Ant Design 5** (UI components)
- **React Router** (navegación)
- **Axios** (HTTP client)

### Backend
- **Node.js 18+**
- **Express** (API REST)
- **TypeScript**
- **MySQL2** (cliente de base de datos)
- **JWT** (autenticación)
- **bcrypt** (encriptación de contraseñas)

### Base de Datos
- **MySQL 8.0** en **Docker**

### Herramientas de Desarrollo
- **ESLint** (linter)
- **Nodemon** (auto-restart en desarrollo)
- **Concurrently** (ejecutar frontend y backend simultáneamente)

---

## 📦 Instalación Rápida

### Prerequisitos
- Node.js 18+ ([Descargar](https://nodejs.org/))
- Docker Desktop ([Descargar](https://www.docker.com/products/docker-desktop/))
- Git ([Descargar](https://git-scm.com/))

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/sistema-zarpar.git
cd sistema-zarpar

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env en la raíz del proyecto
# Ver sección "Configuración" abajo para el contenido

# 4. Levantar MySQL con Docker
docker run -d \
  --name zarpar-mysql \
  -e MYSQL_ROOT_PASSWORD=zarpar2025 \
  -e MYSQL_DATABASE=zarparDataBase \
  -p 3307:3306 \
  --restart unless-stopped \
  mysql:8.0

# Esperar 30 segundos para que MySQL se inicialice

# 5. Restaurar la base de datos
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 < database/backup_completo.sql

# 6. Levantar el proyecto
npm run dev

# ¡Listo! 🎉
# Frontend: http://localhost:5678
# Backend: http://localhost:3456
```

---

## ⚙️ Configuración

### Archivo `.env`

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de Datos (MySQL en Docker)
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=zarpar2025
DB_NAME=zarparDataBase

# Backend
PORT=3456

# JWT Secret (para autenticación)
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion_zarpar2025

# Frontend (Vite)
VITE_API_URL=http://localhost:3456/api
```

**⚠️ IMPORTANTE:** En producción, cambia `JWT_SECRET` por una cadena aleatoria segura.

---

## 🔐 Usuarios y Credenciales

### Administrador (Acceso Total)
- **Email**: `admin@zarparuy.com`
- **Contraseña**: `admin123`
- **Permisos**: ✅ Acceso a todas las sucursales, puede crear/editar productos, ver todos los reportes

### Usuarios por Sucursal (Acceso Limitado)

| Sucursal | Email | Contraseña | Permisos |
|----------|-------|------------|----------|
| Pando | `pando@zarparuy.com` | `pando123` | Solo sucursal Pando |
| Maldonado | `maldonado@zarparuy.com` | `maldonado123` | Solo sucursal Maldonado |
| Rivera | `rivera@zarparuy.com` | `rivera123` | Solo sucursal Rivera |
| Melo | `melo@zarparuy.com` | `melo123` | Solo sucursal Melo |
| Paysandú | `paysandu@zarparuy.com` | `paysandu123` | Solo sucursal Paysandú |
| Salto | `salto@zarparuy.com` | `salto123` | Solo sucursal Salto |
| Tacuarembó | `tacuarembo@zarparuy.com` | `tacuarembo123` | Solo sucursal Tacuarembó |

---

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5678 | Interfaz de usuario principal |
| **Login** | http://localhost:5678/login | Página de inicio de sesión |
| **Dashboard** | http://localhost:5678/dashboard | Panel principal con estadísticas |
| **POS** | http://localhost:5678/pos | Punto de Venta |
| **Productos** | http://localhost:5678/products | Gestión de productos y stock |
| **Clientes** | http://localhost:5678/customers | Base de clientes |
| **Admin DB** | http://localhost:5678/admin/database | Administrador de base de datos |
| **Backend API** | http://localhost:3456/api | API REST del backend |
| **MySQL** | localhost:3307 | Base de datos (usar cliente MySQL) |

---

## 📂 Estructura del Proyecto

```
sistema-zarpar/
├── api/                          # Backend (Node.js + Express + TypeScript)
│   ├── config/
│   │   └── database.ts          # Configuración de MySQL
│   ├── controllers/             # Controladores de la API
│   │   ├── clientesController.ts
│   │   ├── vendedoresController.ts
│   │   ├── productosController.ts
│   │   └── databaseController.ts
│   ├── middleware/              # Middlewares (autenticación, etc.)
│   ├── routes/                  # Rutas de la API
│   ├── app.ts                   # Configuración de Express
│   └── server.ts                # Punto de entrada del backend
│
├── src/                         # Frontend (React + TypeScript + Vite)
│   ├── components/              # Componentes reutilizables
│   │   └── layout/
│   │       └── MainLayout.tsx   # Layout principal con sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   ├── pages/                   # Páginas de la aplicación
│   │   ├── Login.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── pos/
│   │   │   └── POS.tsx          # Punto de Venta
│   │   ├── products/
│   │   │   └── Products.tsx     # Gestión de productos
│   │   ├── customers/
│   │   ├── finance/
│   │   ├── inventory/
│   │   └── admin/
│   │       └── DatabaseManager.tsx  # Admin de BD
│   ├── services/
│   │   └── api.ts               # Cliente HTTP (Axios)
│   ├── types/                   # Tipos TypeScript
│   ├── utils/                   # Utilidades
│   ├── App.tsx                  # Componente principal
│   └── main.tsx                 # Punto de entrada del frontend
│
├── database/                    # Base de datos
│   ├── backup_completo.sql      # Backup completo de la BD
│   ├── schema_zarpar_pos.sql    # Esquema inicial
│   └── schema_productos.sql     # Esquema de productos
│
├── public/                      # Archivos estáticos
├── .env                         # Variables de entorno (NO en Git)
├── .gitignore                   # Archivos ignorados por Git
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración de TypeScript
├── vite.config.ts               # Configuración de Vite
├── nodemon.json                 # Configuración de Nodemon
├── START.bat                    # Script de inicio (Windows)
├── start-backend.ps1            # Script backend (PowerShell)
├── start-frontend.ps1           # Script frontend (PowerShell)
├── CONTEXTO_AGENTE.md           # Documentación para IA (IMPORTANTE)
└── README.md                    # Este archivo
```

---

## 🎯 Scripts Disponibles

### Desarrollo

```bash
# Levantar frontend y backend simultáneamente
npm run dev

# Solo frontend (puerto 5678)
npm run dev:frontend

# Solo backend (puerto 3456)
npm run dev:api
```

### Producción

```bash
# Build del frontend
npm run build

# Preview del build
npm run preview
```

### Base de Datos

```bash
# Hacer backup de la base de datos
npm run db:backup

# Restaurar backup
npm run db:restore
```

---

## 📊 Base de Datos

### Estructura Principal

#### Tablas de Clientes (por sucursal)
- `clientes_pando`
- `clientes_maldonado`
- `clientes_rivera`
- `clientes_melo`
- `clientes_paysandu`
- `clientes_salto`
- `clientes_tacuarembo`

#### Tabla de Vendedores
- `vendedores` (con campo `sucursal` y `cargo`)

#### Tablas de Productos
- `productos` (información general del producto)
- `productos_sucursal` (stock y precio por sucursal)
- `categorias_productos` (marcas, tipos y calidades)

#### Backup y Restauración

**Hacer backup:**
```bash
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 zarparDataBase > database/backup_$(date +%Y%m%d).sql
```

**Restaurar backup:**
```bash
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 < database/backup_completo.sql
```

---

## 🔧 Solución de Problemas

### Puerto 3307 ya está en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3307  # Windows
lsof -i :3307                 # macOS/Linux

# Detener el contenedor
docker stop zarpar-mysql
docker rm zarpar-mysql

# Volver a crear
docker run -d --name zarpar-mysql ...
```

### Error: Cannot connect to MySQL
```bash
# Verificar que el contenedor está corriendo
docker ps | grep zarpar-mysql

# Ver logs
docker logs zarpar-mysql

# Reiniciar contenedor
docker restart zarpar-mysql
```

### Error: Module not found
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentación Adicional

- **`CONTEXTO_AGENTE.md`** → Documentación completa para agentes IA (instrucciones de instalación paso a paso, reglas del proyecto, estructura de BD)
- **`COMO_FUNCIONA_PRODUCTOS_EXPLICACION_VISUAL.md`** → Explicación detallada del sistema de productos
- **`ANALISIS_ESTRUCTURA_PRODUCTOS_Y_STOCK.md`** → Análisis técnico de la base de datos

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y de uso exclusivo para Zarpar Uruguay.

---

## 👤 Autor

**Zarpar Uruguay**

---

## 🙏 Agradecimientos

- Ant Design por los componentes UI
- React y Vite por el stack moderno de frontend
- Docker por simplificar el deployment de MySQL

---

## 🔄 Changelog

### v1.0.0 (Octubre 2025)
- ✅ Sistema de autenticación con JWT
- ✅ Control de roles (Admin vs Sucursal)
- ✅ Gestión de productos con stock y precio por sucursal
- ✅ POS funcional con selección de sucursal, cliente y vendedor
- ✅ Administrador de base de datos (CRUD completo)
- ✅ Dashboard con estadísticas
- ✅ Gestión de clientes por sucursal
- ✅ Sistema multi-sucursal completo

---

**¿Preguntas o problemas?** Consulta el archivo `CONTEXTO_AGENTE.md` para más detalles técnicos.
