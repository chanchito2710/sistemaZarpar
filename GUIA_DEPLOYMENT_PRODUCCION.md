# 🚀 GUÍA COMPLETA DE DEPLOYMENT A PRODUCCIÓN
## Sistema Zarpar - Despliegue Profesional

---

## 📋 TABLA DE CONTENIDOS

1. [Preparación del Proyecto](#1-preparación-del-proyecto)
2. [Opciones de Hosting](#2-opciones-de-hosting)
3. [Deployment en Hostinger](#3-deployment-en-hostinger)
4. [Deployment Alternativo (Railway/Render)](#4-deployment-alternativo-recomendado)
5. [Configuración de Base de Datos](#5-configuración-de-base-de-datos)
6. [Variables de Entorno](#6-variables-de-entorno)
7. [Seguridad en Producción](#7-seguridad-en-producción)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. 📦 PREPARACIÓN DEL PROYECTO

### 1.1 Verificar que todo funciona localmente

```bash
# 1. Asegurarse de que el proyecto compila sin errores
npm run build

# 2. Verificar el backend
cd api
npm run build

# 3. Probar localmente en modo producción
npm start
```

### 1.2 Crear archivo `.env.production`

```env
# .env.production (para el frontend)
VITE_API_URL=https://tu-dominio.com/api

# .env (para el backend)
NODE_ENV=production
PORT=3456

# Base de Datos de Producción
DB_HOST=tu-servidor-mysql.com
DB_PORT=3306
DB_USER=tu_usuario_produccion
DB_PASSWORD=tu_password_produccion
DB_NAME=zarparDataBase

# JWT Secret (CAMBIAR POR UNO SEGURO)
JWT_SECRET=tu_secreto_super_seguro_aleatorio_minimo_32_caracteres_2025
```

### 1.3 Actualizar `package.json` con scripts de producción

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:api": "cd api && tsc",
    "start": "NODE_ENV=production node api/dist/index.js",
    "deploy": "npm run build && npm run build:api"
  }
}
```

---

## 2. 🌐 OPCIONES DE HOSTING

### Comparación de Servicios:

| Servicio | Precio | Ventajas | Desventajas | Recomendado |
|----------|--------|----------|-------------|-------------|
| **Hostinger VPS** | $4-8/mes | Control total, SSH, Node.js | Configuración manual | ⭐⭐⭐⭐ |
| **Railway** | $5/mes (+ uso) | Deploy automático, fácil | Pago por uso | ⭐⭐⭐⭐⭐ |
| **Render** | Gratis - $7/mes | Gratis tier, fácil | Duerme si no se usa | ⭐⭐⭐⭐⭐ |
| **Vercel** (solo frontend) | Gratis | Muy rápido, CI/CD | Solo frontend | ⭐⭐⭐ |
| **Heroku** | $7/mes | Fácil, conocido | Ya no tiene tier gratis | ⭐⭐⭐ |
| **DigitalOcean** | $6/mes | Profesional, escalable | Más técnico | ⭐⭐⭐⭐ |

---

## 3. 🏠 DEPLOYMENT EN HOSTINGER

### 3.1 Requisitos en Hostinger

**Necesitas un plan VPS** (Virtual Private Server):
- ❌ **NO funciona** con hosting compartido estándar
- ✅ **SÍ funciona** con VPS (KVM 1, KVM 2, etc.)
- Precio: ~$4-8 USD/mes

### 3.2 Pasos para Hostinger VPS

#### **Paso 1: Crear VPS en Hostinger**

1. Ir a Hostinger → VPS Hosting
2. Elegir plan (mínimo KVM 1: 1 vCore, 4GB RAM)
3. Sistema operativo: **Ubuntu 22.04 LTS**
4. Configurar SSH y obtener credenciales

#### **Paso 2: Conectarse al VPS**

```bash
# Desde tu computadora (Windows)
ssh root@tu-ip-del-vps

# Ejemplo:
ssh root@123.456.789.012
```

#### **Paso 3: Instalar Node.js en el VPS**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

#### **Paso 4: Instalar MySQL en el VPS**

```bash
# Instalar MySQL
sudo apt install mysql-server -y

# Configurar MySQL
sudo mysql_secure_installation

# Crear base de datos
sudo mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE zarparDataBase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zarpar_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON zarparDataBase.* TO 'zarpar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### **Paso 5: Subir el proyecto al VPS**

```bash
# Opción A: Clonar desde GitHub (RECOMENDADO)
cd /var/www
git clone https://github.com/chanchito2710/sistemaZarpar.git
cd sistemaZarpar
git checkout Proyecto_sin_Depurar

# Opción B: Subir manualmente con SFTP
# Usar FileZilla o WinSCP para transferir archivos
```

#### **Paso 6: Instalar dependencias**

```bash
cd /var/www/sistemaZarpar

# Instalar dependencias
npm install

# Construir el proyecto
npm run build
npm run build:api
```

#### **Paso 7: Configurar variables de entorno**

```bash
# Crear archivo .env en el servidor
nano .env

# Copiar y pegar:
NODE_ENV=production
PORT=3456
DB_HOST=localhost
DB_PORT=3306
DB_USER=zarpar_user
DB_PASSWORD=tu_password_seguro
DB_NAME=zarparDataBase
JWT_SECRET=tu_secreto_super_seguro_aleatorio_minimo_32_caracteres_2025
```

#### **Paso 8: Importar base de datos**

```bash
# Subir el backup SQL al servidor
# Luego importar:
mysql -u zarpar_user -p zarparDataBase < database/backup_completo.sql
```

#### **Paso 9: Instalar PM2 (Process Manager)**

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Crear archivo ecosystem.config.js
nano ecosystem.config.js
```

**Contenido de `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [{
    name: 'zarpar-api',
    script: './api/dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3456
    }
  }]
};
```

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs

# Verificar estado
pm2 status

# Configurar PM2 para arranque automático
pm2 startup
pm2 save
```

#### **Paso 10: Configurar Nginx (Proxy Inverso)**

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/zarpar
```

**Contenido del archivo Nginx:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend (archivos estáticos)
    location / {
        root /var/www/sistemaZarpar/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3456;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/zarpar /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

#### **Paso 11: Configurar HTTPS con Let's Encrypt**

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática (ya está configurada)
sudo systemctl status certbot.timer
```

#### **Paso 12: Configurar Firewall**

```bash
# Permitir puertos necesarios
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

---

## 4. 🚂 DEPLOYMENT ALTERNATIVO (RECOMENDADO)

### Opción A: Railway (Más Fácil) ⭐⭐⭐⭐⭐

**Railway** es perfecto para aplicaciones Node.js + MySQL.

#### **Paso 1: Crear cuenta en Railway**
- Ir a: https://railway.app
- Registrarse con GitHub

#### **Paso 2: Crear nuevo proyecto**
1. Click en "New Project"
2. Elegir "Deploy from GitHub repo"
3. Seleccionar `sistemaZarpar` → rama `Proyecto_sin_Depurar`

#### **Paso 3: Agregar MySQL**
1. Click en "New" → "Database" → "Add MySQL"
2. Railway creará automáticamente la base de datos

#### **Paso 4: Configurar variables de entorno**

En el dashboard de Railway, agregar:

```env
NODE_ENV=production
PORT=3456
DB_HOST=${{MYSQL.MYSQLHOST}}
DB_PORT=${{MYSQL.MYSQLPORT}}
DB_USER=${{MYSQL.MYSQLUSER}}
DB_PASSWORD=${{MYSQL.MYSQLPASSWORD}}
DB_NAME=${{MYSQL.MYSQLDATABASE}}
JWT_SECRET=tu_secreto_super_seguro_aleatorio_minimo_32_caracteres_2025
```

#### **Paso 5: Importar base de datos**

```bash
# Desde tu computadora local
railway login
railway link
railway run mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/backup_completo.sql
```

#### **Paso 6: Deploy automático**
- Railway detecta automáticamente Node.js
- Hace build y deploy automáticamente
- Te da una URL: `https://tu-proyecto.up.railway.app`

**Costo**: ~$5/mes + uso de recursos

---

### Opción B: Render (Tiene Plan Gratuito) ⭐⭐⭐⭐⭐

#### **Backend en Render**

1. Ir a: https://render.com
2. Crear "New Web Service"
3. Conectar GitHub → Seleccionar repo
4. Configuración:
   - **Name**: zarpar-api
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build:api`
   - **Start Command**: `node api/dist/index.js`
   - **Plan**: Free (o Starter $7/mes)

5. Variables de entorno (igual que Railway)

#### **Frontend en Vercel (Gratis)**

1. Ir a: https://vercel.com
2. Importar proyecto desde GitHub
3. Configurar:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://zarpar-api.onrender.com/api
     ```

4. Deploy automático

**Costo**: 
- Backend: Gratis (duerme después de 15 min sin uso) o $7/mes
- Frontend: Gratis
- Base de datos: $7/mes en Render o usar PlanetScale (gratis)

---

## 5. 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### Opciones para MySQL en Producción:

| Servicio | Precio | Características |
|----------|--------|-----------------|
| **Railway MySQL** | ~$5/mes | Fácil, integrado |
| **Render PostgreSQL** | Gratis - $7/mes | Alternativa (requiere cambios) |
| **PlanetScale** | Gratis - $29/mes | MySQL serverless, escalable |
| **AWS RDS** | ~$15/mes | Profesional, confiable |

### Migrar a PlanetScale (Recomendado para MySQL)

```bash
# 1. Crear cuenta en https://planetscale.com
# 2. Crear base de datos "zarpar"
# 3. Obtener connection string
# 4. Importar datos:

pscale connect zarpar main --port 3309
mysql -h 127.0.0.1 -P 3309 -u root < database/backup_completo.sql
```

---

## 6. 🔐 VARIABLES DE ENTORNO

### Frontend (`.env.production`):

```env
VITE_API_URL=https://tu-api.com/api
```

### Backend (`.env`):

```env
NODE_ENV=production
PORT=3456

# Base de Datos
DB_HOST=tu-servidor-mysql.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
DB_NAME=zarparDataBase

# JWT Secret (IMPORTANTE: Cambiar)
JWT_SECRET=$(openssl rand -base64 32)

# CORS (Permitir tu dominio)
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### Generar JWT Secret Seguro:

```bash
# En Linux/Mac:
openssl rand -base64 32

# En Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))

# Online:
# https://www.grc.com/passwords.htm
```

---

## 7. 🔒 SEGURIDAD EN PRODUCCIÓN

### Checklist de Seguridad:

```markdown
[ ] Cambiar JWT_SECRET a uno aleatorio y seguro
[ ] Configurar CORS para permitir solo tu dominio
[ ] Usar HTTPS (SSL/TLS) con Let's Encrypt
[ ] Cambiar contraseñas de MySQL
[ ] Desactivar modo debug en producción
[ ] Configurar rate limiting
[ ] Validar TODAS las entradas de usuario
[ ] Usar prepared statements (ya lo haces ✅)
[ ] Configurar backups automáticos de base de datos
[ ] Implementar logging con rotación
[ ] Configurar firewall (ufw en Ubuntu)
[ ] Mantener sistema operativo actualizado
```

### Configurar CORS en producción:

**Archivo**: `api/app.ts`

```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://tu-dominio.com',
  'https://www.tu-dominio.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Rate Limiting:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Demasiadas solicitudes desde esta IP'
});

app.use('/api/', limiter);
```

---

## 8. 🔧 TROUBLESHOOTING

### Problema: CORS Error

```
Access to fetch at 'https://api.com' from origin 'https://frontend.com' has been blocked by CORS policy
```

**Solución**: Configurar CORS correctamente en `api/app.ts`

### Problema: 502 Bad Gateway

**Solución**: Verificar que el backend esté corriendo:

```bash
pm2 status
pm2 logs
```

### Problema: Base de datos no conecta

**Solución**: Verificar credenciales y firewall:

```bash
# Probar conexión
mysql -h tu-servidor -P 3306 -u usuario -p

# Verificar que MySQL esté corriendo
sudo systemctl status mysql
```

### Problema: Archivos estáticos no cargan

**Solución**: Verificar configuración de Nginx y permisos:

```bash
# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar permisos
sudo chown -R www-data:www-data /var/www/sistemaZarpar/dist
```

---

## 9. 📊 MONITOREO

### Herramientas Recomendadas:

- **Uptime Monitoring**: UptimeRobot (gratis)
- **Error Tracking**: Sentry (gratis hasta cierto límite)
- **Analytics**: Google Analytics
- **Performance**: Lighthouse CI

---

## 10. 🎯 RESUMEN - MEJOR OPCIÓN PARA TI

### ⭐ **OPCIÓN RECOMENDADA #1: Railway** (Más Fácil)

**Pros**:
- ✅ Deploy en 5 minutos
- ✅ MySQL incluido
- ✅ Git push = auto-deploy
- ✅ SSL automático
- ✅ Backups automáticos

**Contras**:
- ❌ ~$5-10/mes

**Pasos**:
1. Registrarse en Railway
2. Conectar GitHub
3. Agregar MySQL
4. Deploy automático
5. ¡Listo!

---

### ⭐ **OPCIÓN RECOMENDADA #2: Render (Frontend) + Railway (Backend + DB)**

**Pros**:
- ✅ Frontend puede ser gratis (Vercel/Netlify)
- ✅ Muy profesional
- ✅ Escalable

**Contras**:
- ❌ Más pasos de configuración

---

### 🏠 **OPCIÓN #3: Hostinger VPS**

**Pros**:
- ✅ Control total
- ✅ Precio fijo ($4-8/mes)
- ✅ Aprenderás mucho

**Contras**:
- ❌ Configuración manual compleja
- ❌ Necesitas conocimientos de Linux

**Solo si**: Te sientes cómodo con Linux y quieres aprender DevOps

---

## 11. 📞 PRÓXIMOS PASOS

1. **Elegir opción de hosting** (Railway recomendado)
2. **Preparar variables de entorno**
3. **Hacer deploy del backend**
4. **Hacer deploy del frontend**
5. **Importar base de datos**
6. **Probar todo**
7. **Configurar dominio personalizado** (opcional)
8. **Celebrar** 🎉

---

¿Necesitas ayuda con algún paso específico? ¡Dime y te guío! 🚀

