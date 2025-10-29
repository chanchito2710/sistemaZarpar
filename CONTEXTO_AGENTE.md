# 🤖 INSTRUCCIONES PARA EL AGENTE IA - SISTEMA ZARPAR

> **⚠️ LEER OBLIGATORIAMENTE AL INICIO DE CADA CONVERSACIÓN**

---

## 📦 INSTALACIÓN DESDE CERO (Para Nueva Máquina)

### 🎯 OBJETIVO
Levantar el proyecto completo en una máquina nueva desde el repositorio de GitHub, incluyendo Docker, MySQL, frontend y backend.

---

### ✅ PREREQUISITOS

#### 1. Sistema Operativo
- **Windows 10/11** (64-bit)
- **macOS** (Intel o Apple Silicon)
- **Linux** (Ubuntu 20.04+ o similar)

#### 2. Software a Instalar
- Node.js 18.x o superior
- Docker Desktop
- Git
- Editor de código (VS Code recomendado)

---

### 🚀 PASO A PASO: INSTALACIÓN COMPLETA

#### **PASO 1: Instalar Node.js**

##### Windows:
1. Ir a: https://nodejs.org/
2. Descargar el instalador LTS (Long Term Support)
3. Ejecutar el instalador y seguir los pasos
4. Verificar instalación:
   ```bash
   node --version    # Debe mostrar v18.x.x o superior
   npm --version     # Debe mostrar 9.x.x o superior
   ```

##### macOS:
```bash
# Usando Homebrew (recomendado)
brew install node@18

# Verificar
node --version
npm --version
```

##### Linux (Ubuntu/Debian):
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

---

#### **PASO 2: Instalar Docker Desktop**

##### Windows:
1. **Requisitos previos:**
   - Windows 10/11 Pro, Enterprise, o Education (con Hyper-V)
   - O Windows 10/11 Home (con WSL 2)
   - Virtualización habilitada en BIOS

2. **Descargar Docker Desktop:**
   - Ir a: https://www.docker.com/products/docker-desktop/
   - Descargar "Docker Desktop for Windows"
   - Ejecutar el instalador `Docker Desktop Installer.exe`

3. **Configuración inicial:**
   - Durante la instalación, marcar "Use WSL 2 instead of Hyper-V"
   - Reiniciar la computadora cuando se solicite

4. **Iniciar Docker Desktop:**
   - Abrir "Docker Desktop" desde el menú inicio
   - Esperar a que el ícono en la barra de tareas muestre "Docker Desktop is running"
   - Aceptar los términos de servicio

5. **Verificar instalación:**
   ```bash
   docker --version          # Debe mostrar Docker version 24.x.x
   docker compose version    # Debe mostrar Docker Compose version v2.x.x
   ```

##### macOS:
1. **Descargar Docker Desktop:**
   - Ir a: https://www.docker.com/products/docker-desktop/
   - Descargar "Docker Desktop for Mac" (Intel o Apple Silicon según tu Mac)

2. **Instalar:**
   - Abrir el archivo `.dmg` descargado
   - Arrastrar Docker a la carpeta Aplicaciones
   - Abrir Docker desde Aplicaciones
   - Dar permisos de administrador cuando se solicite

3. **Verificar:**
   ```bash
   docker --version
   docker compose version
   ```

##### Linux (Ubuntu):
```bash
# Actualizar paquetes
sudo apt-get update

# Instalar dependencias
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar clave GPG oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurar repositorio
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Agregar usuario al grupo docker (para usar sin sudo)
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker

# Verificar
docker --version
docker compose version
```

---

#### **PASO 3: Instalar Git**

##### Windows:
1. Descargar desde: https://git-scm.com/download/win
2. Ejecutar el instalador
3. Configuración recomendada durante instalación:
   - Editor: VS Code (o el que prefieras)
   - PATH: "Git from the command line and also from 3rd-party software"
   - Line endings: "Checkout Windows-style, commit Unix-style"

4. Verificar:
   ```bash
   git --version
   ```

##### macOS:
```bash
# Git suele venir preinstalado, si no:
brew install git

# Verificar
git --version
```

##### Linux:
```bash
sudo apt-get install git

# Verificar
git --version
```

---

#### **PASO 4: Clonar el Repositorio**

```bash
# Navegar a la carpeta donde quieres el proyecto
cd ~/Desktop  # O la ruta que prefieras

# Clonar el repositorio (reemplaza con tu URL de GitHub)
git clone https://github.com/TU_USUARIO/sistema-zarpar.git

# Entrar al directorio
cd sistema-zarpar

# Verificar que tienes todos los archivos
ls -la  # En Windows: dir
```

---

#### **PASO 5: Configurar Variables de Entorno**

```bash
# Crear archivo .env en la raíz del proyecto
# En Windows PowerShell:
New-Item .env -ItemType File

# En macOS/Linux:
touch .env
```

**Contenido del archivo `.env`:**
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

**⚠️ IMPORTANTE:** Cambia `JWT_SECRET` por una cadena aleatoria segura en producción.

---

#### **PASO 6: Levantar MySQL con Docker**

```bash
# Asegurarse de que Docker Desktop está corriendo
docker ps  # Debe responder sin errores

# Crear y levantar el contenedor de MySQL
docker run -d \
  --name zarpar-mysql \
  -e MYSQL_ROOT_PASSWORD=zarpar2025 \
  -e MYSQL_DATABASE=zarparDataBase \
  -p 3307:3306 \
  --restart unless-stopped \
  mysql:8.0

# Verificar que el contenedor está corriendo
docker ps | grep zarpar-mysql

# Ver logs del contenedor (opcional)
docker logs zarpar-mysql
```

**En Windows PowerShell, el comando es:**
```powershell
docker run -d `
  --name zarpar-mysql `
  -e MYSQL_ROOT_PASSWORD=zarpar2025 `
  -e MYSQL_DATABASE=zarparDataBase `
  -p 3307:3306 `
  --restart unless-stopped `
  mysql:8.0
```

**Esperar 20-30 segundos** para que MySQL termine de inicializarse.

---

#### **PASO 7: Restaurar la Base de Datos**

```bash
# Importar el backup completo a la base de datos
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 < database/backup_completo.sql

# Verificar que se importó correctamente
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 -e "USE zarparDataBase; SHOW TABLES;"
```

**Deberías ver tablas como:**
- `categorias_productos`
- `clientes_maldonado`
- `clientes_pando`
- `clientes_rivera`
- `productos`
- `productos_sucursal`
- `vendedores`
- ... y más

---

#### **PASO 8: Instalar Dependencias del Proyecto**

```bash
# Instalar todas las dependencias de Node.js
npm install

# Esto instalará:
# - Dependencias del frontend (React, Vite, Ant Design, etc.)
# - Dependencias del backend (Express, MySQL2, JWT, etc.)
# - Herramientas de desarrollo (TypeScript, ESLint, etc.)
```

**⏱️ Este paso puede tardar 2-5 minutos** dependiendo de tu conexión a internet.

---

#### **PASO 9: Levantar el Proyecto**

##### Opción A: Usando el script automático (Windows)

```bash
# Ejecutar el archivo START.bat
./START.bat
```

Este script levanta automáticamente:
- Frontend en puerto `5678`
- Backend en puerto `3456`

##### Opción B: Manual (Para ver logs separados)

**Terminal 1 - Backend:**
```bash
npm run dev:api
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

##### Opción C: Usando PowerShell Scripts (Windows)

```powershell
# Backend
./start-backend.ps1

# Frontend (en otra terminal)
./start-frontend.ps1
```

---

#### **PASO 10: Verificar que Todo Funciona**

1. **Frontend:** Abrir navegador en http://localhost:5678
   - Deberías ver la página de login del Sistema Zarpar

2. **Backend:** Verificar en http://localhost:3456/api
   - Deberías ver un mensaje JSON

3. **Base de Datos:** Verificar conexión
   ```bash
   docker exec -i zarpar-mysql mysql -u root -pzarpar2025 -e "SELECT COUNT(*) as total_vendedores FROM zarparDataBase.vendedores;"
   ```

---

#### **PASO 11: Iniciar Sesión**

**Credenciales disponibles:**

| Usuario | Email | Contraseña | Permisos |
|---------|-------|------------|----------|
| **Administrador** | admin@zarparuy.com | admin123 | ✅ Acceso total a todas las sucursales |
| Pando | pando@zarparuy.com | pando123 | ❌ Solo sucursal Pando |
| Maldonado | maldonado@zarparuy.com | maldonado123 | ❌ Solo sucursal Maldonado |
| Rivera | rivera@zarparuy.com | rivera123 | ❌ Solo sucursal Rivera |
| Melo | melo@zarparuy.com | melo123 | ❌ Solo sucursal Melo |
| Paysandú | paysandu@zarparuy.com | paysandu123 | ❌ Solo sucursal Paysandú |
| Salto | salto@zarparuy.com | salto123 | ❌ Solo sucursal Salto |
| Tacuarembó | tacuarembo@zarparuy.com | tacuarembo123 | ❌ Solo sucursal Tacuarembó |

**Recomendación:** Usa `admin@zarparuy.com` / `admin123` para tener acceso completo.

---

### 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

#### ❌ Error: "Docker daemon is not running"
**Solución:**
- Abrir Docker Desktop manualmente
- Esperar a que el ícono muestre "Docker Desktop is running"
- Reintentar el comando

#### ❌ Error: "Port 3307 is already in use"
**Solución:**
```bash
# Ver qué proceso usa el puerto
# Windows:
netstat -ano | findstr :3307

# macOS/Linux:
lsof -i :3307

# Opción 1: Detener el otro contenedor
docker stop $(docker ps -q --filter "publish=3307")

# Opción 2: Usar otro puerto (cambiar en .env y docker run)
```

#### ❌ Error: "Cannot connect to MySQL"
**Solución:**
```bash
# Verificar que el contenedor está corriendo
docker ps | grep zarpar-mysql

# Ver logs para errores
docker logs zarpar-mysql

# Reiniciar contenedor
docker restart zarpar-mysql

# Esperar 30 segundos y reintentar
```

#### ❌ Error: "Module not found" o errores de TypeScript
**Solución:**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install

# En Windows:
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

#### ❌ Error: "EACCES: permission denied" (Linux/macOS)
**Solución:**
```bash
# Cambiar permisos del directorio
sudo chown -R $USER:$USER .

# O usar npm con usuario actual
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

### 📋 CHECKLIST DE VERIFICACIÓN

Antes de considerar que el proyecto está completamente instalado:

```
[ ] Node.js instalado (v18+)
[ ] Docker Desktop instalado y corriendo
[ ] Git instalado
[ ] Repositorio clonado
[ ] Archivo .env creado con las variables correctas
[ ] Contenedor MySQL corriendo (docker ps muestra zarpar-mysql)
[ ] Base de datos importada (SHOW TABLES muestra tablas)
[ ] Dependencias instaladas (node_modules existe)
[ ] Backend corriendo en http://localhost:3456
[ ] Frontend corriendo en http://localhost:5678
[ ] Login funciona con admin@zarparuy.com / admin123
[ ] Puedes navegar por el sistema sin errores
```

---

### 🎓 COMANDOS ÚTILES DE MANTENIMIENTO

#### Reiniciar todo el sistema
```bash
# Detener todo
docker stop zarpar-mysql
# Matar procesos de Node (Ctrl+C en las terminales)

# Iniciar todo de nuevo
docker start zarpar-mysql
npm run dev
```

#### Ver logs del backend
```bash
# Los logs se muestran en la terminal donde ejecutaste npm run dev:api
```

#### Ver logs de MySQL
```bash
docker logs zarpar-mysql
docker logs -f zarpar-mysql  # Seguir logs en tiempo real
```

#### Hacer backup de la base de datos
```bash
docker exec zarpar-mysql mysqldump -u root -pzarpar2025 zarparDataBase > backup_$(date +%Y%m%d).sql
```

#### Restaurar un backup
```bash
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase < backup_20251029.sql
```

#### Actualizar el proyecto desde GitHub
```bash
git pull origin main
npm install  # Por si hay nuevas dependencias
```

---

### 🌐 URLS DEL SISTEMA

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5678 | Interfaz de usuario principal |
| **Login** | http://localhost:5678/login | Página de inicio de sesión |
| **Dashboard** | http://localhost:5678/dashboard | Panel principal |
| **POS** | http://localhost:5678/pos | Punto de Venta |
| **Productos** | http://localhost:5678/products | Gestión de productos |
| **Admin DB** | http://localhost:5678/admin/database | Administrador de base de datos |
| **Backend API** | http://localhost:3456/api | API REST del backend |
| **MySQL** | localhost:3307 | Base de datos (usar MySQL Workbench o similar) |

---

### 📚 DOCUMENTACIÓN ADICIONAL

Archivos de documentación incluidos en el proyecto:

- `CONTEXTO_AGENTE.md` → **Este archivo** - Contexto completo para el agente IA
- `COMO_FUNCIONA_PRODUCTOS_EXPLICACION_VISUAL.md` → Cómo funciona el sistema de productos
- `ANALISIS_ESTRUCTURA_PRODUCTOS_Y_STOCK.md` → Análisis de la base de datos
- `README.md` → Documentación general del proyecto

---

## 🎯 REGLA #1: BASE DE DATOS - NUNCA CAMBIAR

### 🐳 MySQL con Docker

**IMPORTANTE:** Este proyecto usa **Docker** para MySQL.

#### Información del Contenedor:
```
Nombre del contenedor: zarpar-mysql
Imagen: mysql:8.0
Puerto expuesto: 3307 (host) → 3306 (contenedor)
```

#### Verificar que Docker está corriendo:
```bash
# Ver contenedores activos
docker ps

# Deberías ver algo como:
# CONTAINER ID   IMAGE        PORTS                    NAMES
# fd8027103378   mysql:8.0    3307:3306/tcp           zarpar-mysql
```

#### Si el contenedor NO está corriendo:
```bash
# Iniciar el contenedor
docker start zarpar-mysql

# O iniciarlo y ver logs
docker start zarpar-mysql && docker logs -f zarpar-mysql
```

### Conexión MySQL
```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=zarpar2025
DB_NAME=zarparDataBase
```

### Comandos para Levantar el Proyecto
```bash
# 1. PRIMERO: Asegúrate de que Docker Desktop está corriendo
# 2. SEGUNDO: Verifica que el contenedor zarpar-mysql está activo (docker ps)
# 3. TERCERO: Inicia el proyecto

npm run dev

# Frontend: http://localhost:5678
# Backend: http://localhost:3456
# MySQL: localhost:3307 (Docker)
```

### 🔧 Comandos útiles de Docker para MySQL

```bash
# Ver logs del contenedor MySQL
docker logs zarpar-mysql

# Acceder a MySQL desde terminal (dentro del contenedor)
docker exec -it zarpar-mysql mysql -u root -pzarpar2025

# Ver el estado del contenedor
docker ps -a | grep zarpar-mysql

# Reiniciar el contenedor (si hay problemas)
docker restart zarpar-mysql

# Ejecutar SQL desde archivo
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 zarparDataBase < archivo.sql
```

### ⚠️ NUNCA, BAJO NINGUNA CIRCUNSTANCIA:
- ❌ Cambiar el puerto `5678` del frontend
- ❌ Cambiar el puerto `3456` del backend
- ❌ Cambiar el puerto `3307` de MySQL (Docker)
- ❌ Modificar las credenciales de la base de datos
- ❌ Crear una nueva base de datos
- ❌ Cambiar el nombre `zarparDataBase`
- ❌ Detener o eliminar el contenedor `zarpar-mysql` sin backup
- ❌ Cambiar el nombre del contenedor Docker

---

## 🔍 REGLA #2: ANTES DE HACER CUALQUIER CAMBIO

### Proceso OBLIGATORIO:

1. **LEER** todos los archivos relacionados
2. **REVISAR** todas las funciones que usan la base de datos
3. **IDENTIFICAR** qué componentes se verán afectados
4. **VERIFICAR** que no romperás nada existente
5. **PLANIFICAR** el cambio sin afectar código funcional
6. **APLICAR** el cambio
7. **PROBAR** que todo sigue funcionando
8. **VERIFICAR** linter errors

### Archivos Críticos a Revisar SIEMPRE:
```
api/config/database.ts          # Configuración DB
api/controllers/*                # Todos los controladores
api/routes/*                     # Todas las rutas
src/services/api.ts             # Servicios de frontend
src/pages/admin/DatabaseManager.tsx  # Admin de BD
```

### Si Algo se Rompe:
1. **DETENTE** inmediatamente
2. **REVIERTE** el cambio
3. **ANALIZA** el problema
4. **PROPÓN** una solución alternativa al usuario
5. **ESPERA** aprobación antes de continuar

---

## 🌍 REGLA #3: TODO EN ESPAÑOL

### Aplicar en:
- ✅ Comentarios de código
- ✅ Nombres de variables (cuando sea lógico)
- ✅ Nombres de funciones descriptivas
- ✅ Mensajes de error y éxito
- ✅ Documentación
- ✅ Interfaces de usuario
- ✅ Logs de consola
- ✅ Respuestas al usuario

### Ejemplo de Código:
```typescript
// ✅ CORRECTO
const cargarClientes = async () => {
  try {
    const respuesta = await obtenerClientesPorSucursal(sucursal);
    mensaje.success('Clientes cargados exitosamente');
  } catch (error) {
    mensaje.error('Error al cargar los clientes');
  }
};

// ❌ INCORRECTO (mezclar idiomas)
const loadClientes = async () => {
  const response = await getClientesPorSucursal(branch);
}
```

---

## 👨‍🎓 REGLA #4: EL USUARIO ES PRINCIPIANTE

### Tratar al Usuario Como:
- 🎓 Estudiante que está aprendiendo
- 🆕 Principiante en programación
- 📚 Alguien que quiere entender el "por qué"

### SIEMPRE Hacer:
1. **EXPLICAR** cada cambio que hagas
2. **ENSEÑAR** el concepto detrás del código
3. **SIMPLIFICAR** términos técnicos
4. **USAR** analogías del mundo real
5. **SUGERIR** mejoras y buenas prácticas
6. **ANTICIPAR** problemas futuros
7. **DOCUMENTAR** con comentarios claros

### Ejemplo de Respuesta:
```
❌ MAL: "Agregué un useEffect con dependencies array"

✅ BIEN: 
"Agregué un useEffect (una función que se ejecuta automáticamente 
cuando carga el componente). Esto es como tener un ayudante que 
siempre verifica si algo cambió y actualiza la información. 
En este caso, cada vez que cambies de sucursal, automáticamente 
traerá los clientes de esa sucursal."
```

### Actuar Como:
- 💡 **Ingeniero Senior** que revisa y optimiza el código
- 🎯 **Mentor** que enseña y explica
- 🔍 **QA Tester** que encuentra posibles problemas
- 🏗️ **Arquitecto** que sugiere mejores soluciones

---

## 🏢 REGLA #5: SISTEMA DE SUCURSALES Y ROLES

### 👑 USUARIO ADMINISTRADOR (ACCESO TOTAL)

**⭐ ÚNICO USUARIO CON ACCESO A TODO:**

| Rol              | Email                | Acceso                           | Sucursal      |
|------------------|----------------------|----------------------------------|---------------|
| **Administrador**| admin@zarparuy.com   | TODAS las tablas de clientes     | Administracion|
|                  |                      | TODAS las sucursales             |               |
|                  |                      | Vendedores de todas las sucursales|              |

**Características del Admin:**
- ✅ Puede ver `clientes_pando`, `clientes_maldonado`, `clientes_rivera`, etc. (TODAS)
- ✅ Puede gestionar vendedores de cualquier sucursal
- ✅ Tiene permisos de lectura/escritura en toda la base de datos
- ✅ Puede generar reportes consolidados de todas las sucursales
- ✅ Es el ÚNICO usuario con estos privilegios
- ✅ Está en la tabla `vendedores` con cargo "Administrador" o "Director General"
- ✅ **PRODUCTOS**: Puede crear, editar, actualizar stock y precios en `/products`
- ✅ **PRODUCTOS**: Ve botones de acciones (editar, actualizar stock/precio)

### ⚠️ IMPORTANTE: "ADMINISTRADOR" NO ES UNA SUCURSAL

**🚨 REGLA CRÍTICA:**

| Concepto | Descripción | Uso |
|----------|-------------|-----|
| **"Administrador"** | Es un ROL, NO una sucursal física | ❌ NO usar en selectores de sucursales |
| | Es el puesto del gerente general | ❌ NO tiene tabla de clientes |
| | Tiene acceso a TODAS las sucursales | ✅ Puede seleccionar cualquier sucursal real |
| | Email: admin@zarparuy.com | ✅ Se identifica por email, no por sucursal |

**En código, SIEMPRE:**
```typescript
// ❌ MAL - Tratar "Administrador" como sucursal
const sucursales = ['Pando', 'Maldonado', 'Administrador'];

// ✅ BIEN - Filtrar "Administrador" de las sucursales
const sucursales = ['Pando', 'Maldonado', 'Rivera', ...].filter(
  s => s.toLowerCase() !== 'administrador'
);

// ✅ BIEN - Identificar admin por email, no por sucursal
if (usuario.email === 'admin@zarparuy.com') {
  // Dar acceso a todas las sucursales
}
```

**Cuando listar sucursales:**
- ❌ NO incluir "Administrador", "Administracion", "Admin"
- ✅ SOLO listar sucursales físicas: Pando, Maldonado, Rivera, Melo, Paysandú, Salto, Tacuarembó
- ✅ El admin puede SELECCIONAR entre estas sucursales, pero su rol no es una de ellas

### 👥 USUARIOS POR SUCURSAL (ACCESO LIMITADO)

**7 Sucursales con acceso restringido:**

| Sucursal    | Email                    | Tabla de Clientes       | Acceso                    |
|-------------|--------------------------|-------------------------|---------------------------|
| Pando       | pando@zarparuy.com       | clientes_pando          | SOLO Pando                |
| Maldonado   | maldonado@zarparuy.com   | clientes_maldonado      | SOLO Maldonado            |
| Rivera      | rivera@zarparuy.com      | clientes_rivera         | SOLO Rivera               |
| Melo        | melo@zarparuy.com        | clientes_melo           | SOLO Melo                 |
| Paysandú    | paysandu@zarparuy.com    | clientes_paysandu       | SOLO Paysandú             |
| Salto       | salto@zarparuy.com       | clientes_salto          | SOLO Salto                |
| Tacuarembó  | tacuarembo@zarparuy.com  | clientes_tacuarembo     | SOLO Tacuarembó           |

**Restricciones de Usuarios de Sucursal:**
- ❌ **PRODUCTOS**: NO pueden crear productos en `/products`
- ❌ **PRODUCTOS**: NO pueden editar productos
- ❌ **PRODUCTOS**: NO pueden actualizar stock ni precios
- ✅ **PRODUCTOS**: SOLO pueden VER productos (modo lectura)
- ❌ **PRODUCTOS**: NO ven botones de acciones (sin editar, sin actualizar stock/precio)

### Reglas de Relación:

#### 1. Usuario → Sucursal → Clientes

**🔴 CASO ESPECIAL - ADMINISTRADOR:**
```
admin@zarparuy.com → TODAS las sucursales → TODAS las tablas de clientes
├─ clientes_pando
├─ clientes_maldonado
├─ clientes_rivera
├─ clientes_melo
├─ clientes_paysandu
├─ clientes_salto
└─ clientes_tacuarembo
```

**🟢 CASO NORMAL - USUARIOS POR SUCURSAL (1:1):**
- Cada email está asociado a UNA sucursal específica
- `pando@zarparuy.com` → SOLO puede acceder a sucursal Pando → SOLO `clientes_pando`
- `maldonado@zarparuy.com` → SOLO puede acceder a sucursal Maldonado → SOLO `clientes_maldonado`
- Y así sucesivamente...

#### 2. Sucursal → Clientes (1:N)
- Cada sucursal tiene su PROPIA tabla de clientes
- Los clientes de Pando están en `clientes_pando`
- Los clientes de Maldonado están en `clientes_maldonado`
- **EXCEPCIÓN**: Admin ve todas las tablas de clientes

#### 3. Sucursal → Vendedores (1:N)
- Cada sucursal tiene sus propios vendedores
- Los vendedores están en la tabla `vendedores`
- Filtrados por el campo `sucursal`
- **EXCEPCIÓN**: Admin puede ver vendedores de todas las sucursales

### Mapeo Automático (SIEMPRE APLICAR):

```typescript
// Función de mapeo que SIEMPRE debes usar
const obtenerTablaClientes = (
  sucursal: string, 
  email?: string
): string | string[] => {
  
  // ⭐ CASO ESPECIAL: Administrador puede ver TODAS
  if (email === 'admin@zarparuy.com') {
    return [
      'clientes_pando',
      'clientes_maldonado',
      'clientes_rivera',
      'clientes_melo',
      'clientes_paysandu',
      'clientes_salto',
      'clientes_tacuarembo'
    ];
  }
  
  // 🔹 CASO NORMAL: Mapeo por sucursal
  const mapeo = {
    'pando': 'clientes_pando',
    'maldonado': 'clientes_maldonado',
    'rivera': 'clientes_rivera',
    'melo': 'clientes_melo',
    'paysandu': 'clientes_paysandu',
    'salto': 'clientes_salto',
    'tacuarembo': 'clientes_tacuarembo'
  };
  return mapeo[sucursal.toLowerCase()] || 'clientes_pando';
};

// Función para verificar si es administrador
const esAdministrador = (email: string): boolean => {
  return email === 'admin@zarparuy.com';
};

// Función para verificar permisos de acceso
const tieneAccesoASucursal = (
  email: string, 
  sucursal: string
): boolean => {
  // Admin tiene acceso a todo
  if (esAdministrador(email)) {
    return true;
  }
  
  // Usuario normal solo a su sucursal
  const emailALowerCase = email.toLowerCase();
  const sucursalALowerCase = sucursal.toLowerCase();
  
  return emailALowerCase.startsWith(sucursalALowerCase);
};
```

### Sistema de Login (IMPLEMENTAR EN FUTURO):

```
Usuario se logea → Identifica email → Verifica si es Admin → 
Extrae sucursal o da acceso total → Guarda en sesión → 
Filtra datos según permisos
```

#### Ejemplo de Flujo NORMAL:
1. Usuario ingresa: `pando@zarparuy.com`
2. Sistema verifica: NO es admin
3. Sistema identifica: Sucursal = "Pando"
4. Sistema carga: `clientes_pando`
5. Usuario SOLO ve clientes de Pando
6. Usuario SOLO ve vendedores de Pando

#### Ejemplo de Flujo ADMINISTRADOR:
1. Usuario ingresa: `admin@zarparuy.com`
2. Sistema verifica: ✅ ES ADMINISTRADOR
3. Sistema da acceso: TODAS las sucursales
4. Sistema carga: TODAS las tablas de clientes
5. Admin ve: Selector de sucursales para filtrar O ver todas juntas
6. Admin ve: TODOS los vendedores de TODAS las sucursales

### ⚠️ IMPORTANTE:
- Cada sucursal es INDEPENDIENTE (excepto para admin)
- NO mezclar datos entre sucursales (excepto admin que puede verlas todas)
- Validar SIEMPRE la sucursal antes de queries
- Proteger rutas por sucursal Y verificar rol
- **SIEMPRE** verificar si el usuario es `admin@zarparuy.com` antes de filtrar
- Si es admin → acceso total
- Si NO es admin → acceso solo a su sucursal

### 🔐 Lógica de Permisos a Implementar:

```typescript
// En cada endpoint que accede a clientes
const obtenerClientes = async (req, res) => {
  const userEmail = req.user.email; // Del token JWT
  const sucursalSolicitada = req.params.sucursal;
  
  // ⭐ Si es admin, permitir acceso a cualquier sucursal
  if (userEmail === 'admin@zarparuy.com') {
    // Admin puede solicitar cualquier sucursal o todas
    if (sucursalSolicitada === 'todas') {
      // Retornar clientes de todas las sucursales
      return await obtenerTodosLosClientes();
    } else {
      // Retornar clientes de la sucursal específica
      return await obtenerClientesDeSucursal(sucursalSolicitada);
    }
  }
  
  // 🔹 Usuario normal: solo su sucursal
  const sucursalDelUsuario = extraerSucursalDelEmail(userEmail);
  
  // Validar que solo acceda a su sucursal
  if (sucursalSolicitada !== sucursalDelUsuario) {
    return res.status(403).json({ 
      error: 'No tienes permiso para acceder a esta sucursal' 
    });
  }
  
  return await obtenerClientesDeSucursal(sucursalDelUsuario);
};
```

---

## 🗄️ REGLA #6: OPTIMIZACIÓN DE BASE DE DATOS

### Filosofía: MENOS es MÁS

#### Antes de Crear una Tabla Nueva:
1. ¿Puedo agregar columnas a una tabla existente? → **PREFIERE ESTO**
2. ¿Es necesario por performance? → Considera crear tabla
3. ¿Es necesario por seguridad? → Considera crear tabla
4. ¿Es necesario por escalabilidad? → Considera crear tabla

#### Principios de Diseño:

**✅ BUENAS PRÁCTICAS:**
- Reutilizar tablas existentes agregando columnas
- Normalizar datos (evitar redundancia)
- Usar índices en columnas frecuentemente consultadas
- Usar foreign keys para relaciones
- Nombres descriptivos en español o inglés consistente

**❌ MALAS PRÁCTICAS:**
- Crear tabla para cada cosa pequeña
- Duplicar información
- Tablas con 2-3 columnas cuando pueden estar en otra
- Nombres confusos o inconsistentes

#### Consultar ANTES de:
- Crear nueva tabla
- Modificar estructura existente
- Eliminar columnas con datos

#### Ejemplo de Pensamiento:

```
Usuario pide: "Quiero guardar el color favorito del cliente"

❌ MAL: Crear tabla "colores_favoritos"
✅ BIEN: Agregar columna "color_favorito" a tabla de clientes

Usuario pide: "Quiero historial de compras del cliente"

❌ MAL: Agregar 100 columnas "compra_1", "compra_2"... 
✅ BIEN: Crear tabla "compras" relacionada con "clientes"
```

---

## 📚 REGLA #7: EXPLICAR TODO (ENSEÑAR)

### Template de Explicación:

```markdown
## 🔧 Lo que hice:
[Descripción breve en español simple]

## 🤔 ¿Por qué?
[Razón técnica explicada de forma simple]

## 📖 ¿Cómo funciona?
[Analogía del mundo real + explicación técnica]

## 💡 Conceptos que aprendiste:
- Concepto 1: explicación
- Concepto 2: explicación

## 🚀 Beneficios:
- Beneficio 1
- Beneficio 2

## ⚠️ Cuidados:
[Si hay algo que tener en cuenta]
```

### Ejemplo Real:

```markdown
## 🔧 Lo que hice:
Agregué un useEffect que carga los clientes automáticamente

## 🤔 ¿Por qué?
Porque cada vez que cambias de sucursal, necesitas ver los 
clientes diferentes. Sin esto, tendrías que refrescar la página.

## 📖 ¿Cómo funciona?
Imagina que tienes un sensor de movimiento en tu casa. Cuando 
detecta que entraste, automáticamente enciende las luces. 
useEffect es como ese sensor: detecta cuando cambió la sucursal 
y automáticamente carga los clientes nuevos.

## 💡 Conceptos que aprendiste:
- useEffect: Hook que ejecuta código cuando algo cambia
- Dependencies: Lista de cosas que "vigilamos"
- Side Effects: Acciones que afectan fuera del componente

## 🚀 Beneficios:
- Actualización automática
- Mejor experiencia de usuario
- Código más limpio y organizado
```

---

## 🐛 REGLA #8: CERO BUGS, CERO PROBLEMAS

### Filosofía: "Más vale prevenir que lamentar"

#### Antes de Cada Cambio:

**Checklist OBLIGATORIO:**
```
[ ] Leí el código existente
[ ] Entendí cómo funciona actualmente
[ ] Identifiqué qué archivos se afectarán
[ ] Verifiqué que no hay dependencias ocultas
[ ] Planifiqué el cambio sin romper nada
[ ] Tengo un plan B si algo falla
```

#### Después de Cada Cambio:

**Checklist OBLIGATORIO:**
```
[ ] El código compila sin errores
[ ] No hay linter errors
[ ] Probé la funcionalidad manualmente (si es posible)
[ ] No rompí ninguna funcionalidad existente
[ ] Agregué comentarios explicativos
[ ] Actualicé tipos de TypeScript si es necesario
```

#### Si Encuentras un Bug:

1. **NO LO IGNORES** - Nunca dejes un bug sin resolver
2. **ANALIZA LA CAUSA RAÍZ** - No solo los síntomas
3. **PROPÓN SOLUCIÓN** - Explica qué harás
4. **IMPLEMENTA CON CUIDADO** - Sin crear nuevos bugs
5. **VERIFICA TODO** - Asegura que se solucionó

#### Prevención de Bugs:

**✅ HACER:**
- Validar TODOS los inputs
- Manejar TODOS los casos de error
- Usar try-catch en operaciones async
- Agregar tipos de TypeScript
- Comentar código complejo
- Probar casos extremos

**❌ NO HACER:**
- Asumir que los datos son correctos
- Ignorar warnings
- Dejar console.log en producción (algunos sí)
- Hacer cambios "rápidos" sin pensar
- Copiar código sin entender

---

## 🎨 REGLA #9: INTERFAZ PROFESIONAL Y RESPONSIVE

### Principios de Diseño:

#### 1. Responsive 100%
```typescript
// SIEMPRE usar breakpoints de Ant Design
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6} xl={4}>
    {/* Contenido */}
  </Col>
</Row>

// xs: móviles (< 576px) - Full width
// sm: tablets pequeñas (≥ 576px)
// md: tablets (≥ 768px)
// lg: desktop (≥ 992px)
// xl: pantallas grandes (≥ 1200px)
```

#### 2. Iconos Elegantes (Ant Design Icons)
```typescript
import {
  DashboardOutlined,    // Para dashboard
  UserOutlined,         // Para usuarios
  ShoppingOutlined,     // Para ventas
  DatabaseOutlined,     // Para BD
  // etc... SIEMPRE usar iconos semánticos
} from '@ant-design/icons';
```

#### 3. Animaciones Suaves
```typescript
// En CSS/Inline styles
transition: 'all 0.3s ease'

// Para hover effects
style={{
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: hover ? 'translateY(-4px)' : 'translateY(0)',
  boxShadow: hover ? '0 12px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)'
}}
```

#### 4. Efectos Hover Profesionales
```css
.card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
```

#### 5. Paleta de Colores Consistente
```typescript
const COLORS = {
  primary: '#3b82f6',      // Azul principal
  success: '#10b981',      // Verde éxito
  warning: '#f59e0b',      // Amarillo advertencia
  danger: '#ef4444',       // Rojo peligro
  info: '#8b5cf6',         // Morado info
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    // ... etc
  }
};
```

#### 6. Loading States Elegantes
```typescript
// SIEMPRE mostrar feedback visual
<Button loading={isLoading} icon={<SaveOutlined />}>
  Guardar
</Button>

<Spin spinning={loading} tip="Cargando datos...">
  {contenido}
</Spin>
```

#### 7. Mensajes y Feedback
```typescript
// Usar el sistema de mensajes de Ant Design
message.success('✅ Operación exitosa');
message.error('❌ Error al procesar');
message.warning('⚠️ Revisa los datos');
message.info('ℹ️ Información importante');
```

### Componentes que SIEMPRE Deben Ser Responsive:

- ✅ Tablas (scroll horizontal en móvil)
- ✅ Formularios (columna única en móvil)
- ✅ Cards (grid adaptativo)
- ✅ Modales (full screen en móvil)
- ✅ Sidebars (colapsable en móvil)
- ✅ Estadísticas (stack vertical en móvil)

---

## 🔒 REGLA #10: SEGURIDAD MÁXIMA

### Protección Contra SQL Injection:

#### ✅ SIEMPRE Usar Prepared Statements:
```typescript
// ✅ CORRECTO - Parámetros seguros
const query = 'SELECT * FROM `users` WHERE id = ?';
await pool.execute(query, [userId]);

// ✅ CORRECTO - Múltiples parámetros
const query = 'INSERT INTO `clientes` (nombre, email) VALUES (?, ?)';
await pool.execute(query, [nombre, email]);

// ❌ NUNCA HACER ESTO - Vulnerable a SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;
await pool.execute(query);

// ❌ NUNCA HACER ESTO - Concatenación directa
const query = `SELECT * FROM users WHERE name = '${userName}'`;
```

#### ✅ SIEMPRE Escapar Nombres de Tabla/Columna:
```typescript
// ✅ CORRECTO - Backticks protegen
const query = `SELECT * FROM \`${tableName}\` WHERE \`${columnName}\` = ?`;

// ❌ INCORRECTO - Sin protección
const query = `SELECT * FROM ${tableName} WHERE ${columnName} = ?`;
```

### Validación de Inputs:

```typescript
// SIEMPRE validar en Backend
const validarCliente = (data: any) => {
  // Validar campos requeridos
  if (!data.nombre || !data.email) {
    throw new Error('Campos requeridos faltantes');
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Email inválido');
  }
  
  // Validar longitud
  if (data.nombre.length > 100) {
    throw new Error('Nombre muy largo');
  }
  
  // Sanitizar (limpiar caracteres peligrosos)
  data.nombre = data.nombre.trim();
  
  return data;
};
```

### Protección de Rutas:

```typescript
// Middleware de autenticación
const verificarAutenticacion = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ 
      error: 'No autorizado' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido' 
    });
  }
};

// Aplicar a rutas protegidas
router.get('/clientes', verificarAutenticacion, obtenerClientes);
```

### Variables de Entorno Seguras:

```typescript
// ❌ NUNCA hardcodear secretos
const secret = 'mi-password-123';

// ✅ SIEMPRE usar variables de entorno
const secret = process.env.JWT_SECRET;

// ✅ SIEMPRE validar que existan
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está configurado');
}
```

### Rate Limiting:

```typescript
// Proteger contra ataques de fuerza bruta
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Demasiadas solicitudes, intenta más tarde'
});

app.use('/api/', limiter);
```

### Sanitización de Datos:

```typescript
// Limpiar datos antes de guardar
const sanitizarInput = (input: string): string => {
  return input
    .trim()                    // Quitar espacios
    .replace(/[<>]/g, '')      // Quitar < >
    .slice(0, 500);            // Limitar longitud
};
```

### Headers de Seguridad:

```typescript
import helmet from 'helmet';

// Agregar headers de seguridad
app.use(helmet());

// Prevenir clickjacking
app.use(helmet.frameguard({ action: 'deny' }));

// Forzar HTTPS
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true
}));
```

---

## 📋 CHECKLIST PRE-RESPUESTA

Antes de enviar CUALQUIER respuesta al usuario:

```
[ ] Leí CONTEXTO_AGENTE.md
[ ] Entendí el request del usuario
[ ] Revisé el código existente
[ ] Planifiqué sin romper nada
[ ] Consideré todas las reglas (1-10)
[ ] Preparé una explicación educativa
[ ] Verifiqué seguridad
[ ] Consideré el rol de admin@zarparuy.com
[ ] Validé permisos por sucursal
[ ] NUNCA trato "Administrador" como sucursal
[ ] Filtré "Administrador" de listas de sucursales
[ ] Pensé en responsive
[ ] Todo está en español
[ ] Tengo una solución completa
```

---

## 🎯 RESUMEN DE REGLAS

1. ✅ **Base de Datos**: localhost:3307, zarparDataBase, NUNCA cambiar
2. ✅ **Revisar Código**: SIEMPRE antes de cambiar, NO romper nada
3. ✅ **Español**: Todo en español, comentarios, mensajes, UI
4. ✅ **Enseñar**: Usuario principiante, explicar TODO con ejemplos
5. ✅ **Sucursales**: 7 sucursales físicas, "Administrador" NO es sucursal
   - 🚨 **CRÍTICO**: "Administrador" es un ROL, no una sucursal
   - ❌ NUNCA incluir "Administrador" en selectores de sucursales
   - ✅ Admin (admin@zarparuy.com) puede ver TODAS las sucursales
6. ✅ **Optimizar BD**: Evitar tablas innecesarias, agregar columnas primero
7. ✅ **Explicar**: Enseñar el "por qué" y "cómo" con analogías
8. ✅ **Sin Bugs**: Revisar TODO, prevenir problemas, solucionar BIEN
9. ✅ **UI Profesional**: 100% responsive, iconos, animaciones, hover
10. ✅ **Seguridad**: Prepared statements, validación, sanitización

---

## 🚀 TECNOLOGÍAS DEL PROYECTO

- **Frontend**: React 18 + TypeScript + Vite + Ant Design 5
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: MySQL 8.0
- **Puertos**: Frontend:5678, Backend:3456, MySQL:3307

---

**Última actualización**: Octubre 28, 2025  
**Versión**: 1.0.0  
**Estado**: ACTIVO - LEER SIEMPRE
