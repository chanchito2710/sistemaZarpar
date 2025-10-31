# 🏪 Sistema Zarpar - POS y Gestión Empresarial

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Sistema completo de Punto de Venta (POS) y gestión empresarial multi-sucursal**

[Características](#-características) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación) • [Tecnologías](#-tecnologías)

</div>

---

## 📋 Tabla de Contenidos

- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación Rápida](#-instalación-rápida)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Sistema de Sucursales](#-sistema-de-sucursales)
- [Credenciales de Acceso](#-credenciales-de-acceso)
- [Documentación](#-documentación)
- [Comandos Útiles](#-comandos-útiles)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Changelog](#-changelog)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Acerca del Proyecto

**Sistema Zarpar** es una plataforma completa de gestión empresarial diseñada para empresas con múltiples sucursales. Incluye:

- 🛒 **Punto de Venta (POS)** moderno y responsive
- 👥 **Gestión de Clientes** por sucursal
- 📦 **Control de Inventario** multi-sucursal
- 🏢 **Gestión de Vendedores** con permisos
- 📊 **Reportes y Estadísticas** en tiempo real
- 🔐 **Sistema de Autenticación** con JWT
- 🌐 **Multi-sucursal** (7 sucursales activas)

### 🏆 ¿Qué lo hace especial?

- ✅ **100% TypeScript** - Tipado fuerte en frontend y backend
- ✅ **Docker** - Base de datos en contenedor para fácil deployment
- ✅ **Responsive** - Funciona en móvil, tablet y desktop
- ✅ **UI Moderna** - Ant Design 5 con animaciones suaves
- ✅ **Seguro** - Prepared statements, JWT, validación de permisos
- ✅ **Documentado** - Código y documentación 100% en español

---

## ✨ Características

### 🔐 Autenticación y Permisos

| Rol | Acceso | Permisos |
|-----|--------|----------|
| **Administrador** | 🌍 Todas las sucursales | ✅ CRUD completo en todo el sistema |
| **Usuario Sucursal** | 🏢 Solo su sucursal | 👁️ Solo lectura de datos |

### 🏪 Sistema Multi-Sucursal

El sistema soporta **7 sucursales** con datos independientes:

- 📍 Pando
- 📍 Maldonado  
- 📍 Rivera
- 📍 Melo
- 📍 Paysandú
- 📍 Salto
- 📍 Tacuarembó

Cada sucursal tiene:
- ✅ Su propia tabla de clientes (`clientes_[sucursal]`)
- ✅ Sus propios vendedores
- ✅ Control independiente de stock
- ✅ Reportes individuales

### 📦 Gestión de Productos

- ✅ Catálogo unificado de productos
- ✅ Stock por sucursal
- ✅ Precios diferenciados
- ✅ Categorías y subcategorías
- ✅ Control de calidades (A, B, C)

### 👥 Gestión de Vendedores (⭐ ACTUALIZADO)

- ✅ CRUD completo de vendedores
- ✅ **Sistema de eliminación inteligente**:
  - Hard delete si no tiene relaciones
  - Soft delete si tiene clientes/ventas asociadas
- ✅ Advertencias visuales claras
- ✅ Permisos solo para administradores

### 🛒 Punto de Venta (POS)

- ✅ Interfaz intuitiva y rápida
- ✅ Búsqueda de productos en tiempo real
- ✅ Cálculo automático de totales
- ✅ Gestión de clientes integrada

---

## 🚀 Tecnologías

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "antd": "^5.10.0",
  "axios": "^1.5.0",
  "react-router-dom": "^6.17.0"
}
```

### Backend
```json
{
  "express": "^4.18.2",
  "typescript": "^5.0.0",
  "mysql2": "^3.6.0",
  "dotenv": "^16.3.1",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5"
}
```

### Base de Datos
- **MySQL 8.0** (Docker)
- **7 tablas de clientes** (una por sucursal)
- **Foreign Keys** para integridad referencial
- **Triggers y Stored Procedures**

### DevOps
- **Docker** para MySQL
- **Vite** para build optimizado
- **ESLint** para linting
- **TypeScript** para type checking

---

## 🔧 Instalación Rápida

### Prerequisitos

Antes de empezar, asegúrate de tener instalado:

- ✅ Node.js 18+ ([descargar](https://nodejs.org/))
- ✅ Docker Desktop ([descargar](https://www.docker.com/products/docker-desktop/))
- ✅ Git ([descargar](https://git-scm.com/))

### Pasos de Instalación

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/sistema-zarpar.git
cd sistema-zarpar
```

#### 2. Instalar Dependencias

```bash
npm install
```

#### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=zarpar2025
DB_NAME=zarparDataBase

# Backend
PORT=3456

# JWT
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion

# Frontend
VITE_API_URL=http://localhost:3456/api
```

#### 4. Levantar MySQL con Docker

**Windows (PowerShell):**
```powershell
docker run -d `
  --name zarpar-mysql `
  -e MYSQL_ROOT_PASSWORD=zarpar2025 `
  -e MYSQL_DATABASE=zarparDataBase `
  -p 3307:3306 `
  --restart unless-stopped `
  mysql:8.0
```

**macOS/Linux:**
```bash
docker run -d \
  --name zarpar-mysql \
  -e MYSQL_ROOT_PASSWORD=zarpar2025 \
  -e MYSQL_DATABASE=zarparDataBase \
  -p 3307:3306 \
  --restart unless-stopped \
  mysql:8.0
```

**Esperar 20-30 segundos** para que MySQL inicialice.

#### 5. Restaurar la Base de Datos

```bash
# Importar backup completo
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 < database/backup_completo.sql

# Verificar
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 -e "USE zarparDataBase; SHOW TABLES;"
```

#### 6. Levantar el Proyecto

```bash
npm run dev
```

El proyecto estará disponible en:
- 🌐 **Frontend**: http://localhost:5678
- 🔌 **Backend**: http://localhost:3456/api
- 🗄️ **MySQL**: localhost:3307

---

## 📁 Estructura del Proyecto

```
sistema-zarpar/
├── api/                          # Backend (Express + TypeScript)
│   ├── config/
│   │   └── database.ts          # Conexión MySQL
│   ├── controllers/
│   │   ├── vendedoresController.ts   # ⭐ CRUD vendedores
│   │   ├── clientesController.ts     # Gestión clientes
│   │   └── productosController.ts    # Gestión productos
│   ├── routes/
│   │   ├── vendedores.ts        # ⭐ Rutas vendedores
│   │   ├── clientes.ts          # Rutas clientes
│   │   └── productos.ts         # Rutas productos
│   ├── middleware/
│   │   └── auth.ts              # JWT + permisos
│   └── index.ts                 # Servidor Express
│
├── src/                          # Frontend (React + TypeScript)
│   ├── pages/
│   │   ├── staff/
│   │   │   └── StaffSellers.tsx      # ⭐ Gestión vendedores
│   │   ├── admin/
│   │   │   └── DatabaseManager.tsx   # Admin BD
│   │   ├── pos/
│   │   │   └── POS.tsx              # Punto de venta
│   │   └── products/
│   │       └── Products.tsx         # Gestión productos
│   ├── services/
│   │   └── api.ts               # ⭐ Servicios API
│   ├── components/              # Componentes reutilizables
│   └── App.tsx                  # Router principal
│
├── database/                     # Base de Datos
│   ├── backup_completo.sql      # ⭐ Backup principal
│   ├── schema.sql               # Esquema de tablas
│   └── *.sql                    # Otros scripts
│
├── .cursorrules                  # ⭐ Reglas para agentes IA
├── CHANGELOG.md                  # ⭐ Historial de cambios
├── README.md                     # Este archivo
├── package.json                  # Dependencias
├── tsconfig.json                 # Config TypeScript
└── vite.config.ts               # Config Vite
```

---

## 🏢 Sistema de Sucursales

### Mapeo Email → Sucursal → Tabla de Clientes

| Sucursal | Email | Tabla de Clientes | Acceso |
|----------|-------|-------------------|--------|
| **Administrador** | admin@zarparuy.com | ✅ TODAS | 🌍 Global |
| Pando | pando@zarparuy.com | `clientes_pando` | 🏢 Solo Pando |
| Maldonado | maldonado@zarparuy.com | `clientes_maldonado` | 🏢 Solo Maldonado |
| Rivera | rivera@zarparuy.com | `clientes_rivera` | 🏢 Solo Rivera |
| Melo | melo@zarparuy.com | `clientes_melo` | 🏢 Solo Melo |
| Paysandú | paysandu@zarparuy.com | `clientes_paysandu` | 🏢 Solo Paysandú |
| Salto | salto@zarparuy.com | `clientes_salto` | 🏢 Solo Salto |
| Tacuarembó | tacuarembo@zarparuy.com | `clientes_tacuarembo` | 🏢 Solo Tacuarembó |

### ⚠️ IMPORTANTE

- **"Administrador"** es un **ROL**, NO una sucursal física
- ❌ NO incluir "Administrador" en selectores de sucursales
- ✅ El admin puede **seleccionar** cualquier sucursal para trabajar

---

## 🔑 Credenciales de Acceso

### Administrador (Acceso Total)
```
Email: admin@zarparuy.com
Contraseña: admin123
Permisos: ✅ TODAS las sucursales y funcionalidades
```

### Usuarios por Sucursal (Solo Lectura)

| Usuario | Email | Contraseña |
|---------|-------|------------|
| Pando | pando@zarparuy.com | pando123 |
| Maldonado | maldonado@zarparuy.com | maldonado123 |
| Rivera | rivera@zarparuy.com | rivera123 |
| Melo | melo@zarparuy.com | melo123 |
| Paysandú | paysandu@zarparuy.com | paysandu123 |
| Salto | salto@zarparuy.com | salto123 |
| Tacuarembó | tacuarembo@zarparuy.com | tacuarembo123 |

---

## 📚 Documentación

### Documentos Disponibles

| Archivo | Descripción |
|---------|-------------|
| [`.cursorrules`](.cursorrules) | ⭐ **Reglas completas para agentes IA** - Contexto del proyecto |
| [`CHANGELOG.md`](CHANGELOG.md) | 📝 Historial detallado de cambios |
| [`COMO_FUNCIONA_CURSORRULES.md`](COMO_FUNCIONA_CURSORRULES.md) | 📖 Guía de uso de reglas |
| [`README.md`](README.md) | 📄 Este archivo |

### Características Documentadas

- ✅ Instalación desde cero
- ✅ Sistema de sucursales y permisos
- ✅ Gestión de vendedores (incluye eliminación inteligente)
- ✅ Foreign Key Constraints
- ✅ Estructura de base de datos
- ✅ API endpoints
- ✅ Componentes del frontend

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Iniciar proyecto completo (frontend + backend)
npm run dev

# Solo backend
npm run dev:api

# Solo frontend
npm run dev:client

# Build para producción
npm run build
```

### Docker (MySQL)

```bash
# Ver contenedores activos
docker ps

# Iniciar contenedor
docker start zarpar-mysql

# Detener contenedor
docker stop zarpar-mysql

# Ver logs
docker logs zarpar-mysql

# Acceder a MySQL
docker exec -it zarpar-mysql mysql -u root -pzarpar2025
```

### Base de Datos

```bash
# Hacer backup
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 zarparDataBase > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase < backup.sql

# Ver tablas
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 -e "USE zarparDataBase; SHOW TABLES;"
```

---

## 🖼️ Capturas de Pantalla

### Dashboard Principal
> Vista general del sistema con estadísticas

### Gestión de Vendedores
> CRUD completo con eliminación inteligente

### Punto de Venta (POS)
> Interfaz moderna y responsive

### Gestión de Productos
> Catálogo con control de stock por sucursal

---

## 📄 Changelog

### Versión 2.0.0 - 31 de Octubre, 2025

**Nuevas Características:**
- ✅ Sistema de eliminación inteligente de vendedores
- ✅ Hard delete con fallback a soft delete
- ✅ UI mejorada con advertencias visuales
- ✅ Análisis de Foreign Key Constraints

**Mejoras:**
- ✅ Mensajes descriptivos según tipo de eliminación
- ✅ Documentación completa actualizada
- ✅ Backup automático de base de datos

[Ver changelog completo](CHANGELOG.md)

---

## 🤝 Contribuir

### ¿Cómo contribuir?

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

### Convenciones de Código

- ✅ Todo en español (código, comentarios, docs)
- ✅ TypeScript obligatorio
- ✅ ESLint para linting
- ✅ Prepared statements para SQL
- ✅ Comentarios explicativos

---

## 📞 Soporte

¿Problemas? ¿Preguntas? 

1. Revisa la [documentación](.cursorrules)
2. Consulta el [changelog](CHANGELOG.md)
3. Abre un [issue](https://github.com/TU_USUARIO/sistema-zarpar/issues)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Ant Design** - Por los componentes UI
- **React** - Por el framework frontend
- **Express** - Por el framework backend
- **MySQL** - Por la base de datos
- **Docker** - Por la containerización

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

**Hecho con ❤️ por el equipo de Zarpar**

[🔝 Volver arriba](#-sistema-zarpar---pos-y-gestión-empresarial)

</div>
