# 🚀 GUÍA COMPLETA: DEPLOY A PRODUCCIÓN

## 📋 ÍNDICE
1. [Opciones Recomendadas](#opciones-recomendadas)
2. [Railway - MEJOR OPCIÓN (Recomendada)](#railway)
3. [Render - Alternativa Gratuita](#render)
4. [Preparación del Proyecto](#preparación)
5. [Variables de Entorno](#variables-de-entorno)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 OPCIONES RECOMENDADAS

### ⭐ **OPCIÓN #1: RAILWAY** (LA MÁS FÁCIL Y COMPLETA)

**✅ Ventajas:**
- ✅ Deploy de TODO en un solo lugar (Frontend + Backend + MySQL)
- ✅ MySQL incluido (no necesitas servicio externo)
- ✅ Configuración automática
- ✅ Muy estable y rápido
- ✅ SSL/HTTPS automático
- ✅ Logs en tiempo real
- ✅ $5 USD de crédito gratis al mes

**❌ Desventajas:**
- Después de los $5 gratis, pagas por uso (~$10-20/mes)

**💰 Precio:** 
- $5 USD gratis/mes
- Después ~$10-20 USD/mes dependiendo del uso

**🎯 PERFECTO PARA:** Producción seria, aplicaciones reales, sistemas empresariales

---

### 🆓 **OPCIÓN #2: RENDER** (GRATIS AL INICIO)

**✅ Ventajas:**
- ✅ Free tier generoso (750 horas gratis/mes)
- ✅ MySQL en la nube (con Railway o PlanetScale)
- ✅ Deploy automático desde GitHub
- ✅ SSL/HTTPS automático
- ✅ Muy fácil de configurar

**❌ Desventajas:**
- Backend se "duerme" después de 15 min sin uso (tarda ~30s en despertar)
- MySQL no incluido (necesitas Railway o PlanetScale)

**💰 Precio:**
- Frontend: 100% GRATIS
- Backend: GRATIS (pero se duerme)
- MySQL: $5-10 USD/mes (en Railway o PlanetScale)

**🎯 PERFECTO PARA:** Prototipos, pruebas, demos, proyectos personales

---

### 🏢 **OPCIÓN #3: DIGITALOCEAN APP PLATFORM**

**✅ Ventajas:**
- ✅ Muy estable y profesional
- ✅ Bases de datos administradas
- ✅ Escalabilidad fácil
- ✅ Soporte técnico

**❌ Desventajas:**
- Más caro ($12-25 USD/mes)
- Configuración más compleja

**🎯 PERFECTO PARA:** Empresas grandes, sistemas críticos

---

## 🌟 MI RECOMENDACIÓN

### **Para ti: RAILWAY** 🚂

**¿Por qué?**
1. ✅ Todo en un solo lugar (simple)
2. ✅ MySQL incluido (no necesitas otro servicio)
3. ✅ Muy fácil de configurar (10 minutos)
4. ✅ Estable y confiable
5. ✅ $5 USD gratis para empezar
6. ✅ Perfecto para sistemas empresariales

---

---

# 🚂 RAILWAY - GUÍA PASO A PASO

## 📋 PREREQUISITOS

1. ✅ Cuenta de GitHub (ya la tienes)
2. ✅ Proyecto en GitHub (ya lo tienes: `sistemaZarpar`)
3. ✅ Tarjeta de crédito (para verificación, no te cobran si no pasas los $5)

---

## 🚀 PASO 1: CREAR CUENTA EN RAILWAY

1. **Ve a:** https://railway.app/
2. **Click:** "Start a New Project"
3. **Sign Up con GitHub**
4. **Autoriza Railway** a acceder a tus repos

---

## 📦 PASO 2: CREAR PROYECTO NUEVO

1. **En Railway Dashboard:**
   - Click: "New Project"
   - Selecciona: "Deploy from GitHub repo"

2. **Conectar tu repositorio:**
   - Busca: `sistemaZarpar`
   - Click: "Deploy Now"

---

## 🗄️ PASO 3: AGREGAR BASE DE DATOS MYSQL

1. **En tu proyecto de Railway:**
   - Click: "+ New"
   - Selecciona: "Database"
   - Selecciona: "Add MySQL"

2. **Railway creará automáticamente:**
   - ✅ Base de datos MySQL 8.0
   - ✅ Usuario y contraseña
   - ✅ Host y puerto
   - ✅ Variables de entorno

---

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

### **Backend Service:**

En Railway, ve a tu servicio de backend → "Variables" → Agrega:

```env
# Base de Datos (Railway te las da automáticamente)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=zarparDataBase

# Backend
PORT=3456
NODE_ENV=production

# JWT Secret
JWT_SECRET=tu_secreto_super_seguro_produccion_2025_zarpar_railway

# Frontend URL (lo obtienes después del deploy)
FRONTEND_URL=https://tu-dominio.up.railway.app
```

### **Frontend Service:**

```env
# API URL (lo obtienes del backend después del deploy)
VITE_API_URL=https://tu-backend.up.railway.app/api
```

---

## 🛠️ PASO 5: IMPORTAR BASE DE DATOS

### **Opción A: Desde tu computadora**

```bash
# Conectarte a MySQL de Railway
mysql -h <RAILWAY_MYSQL_HOST> \
      -P <RAILWAY_MYSQL_PORT> \
      -u <RAILWAY_MYSQL_USER> \
      -p<RAILWAY_MYSQL_PASSWORD> \
      zarparDataBase < database/backup_completo.sql
```

### **Opción B: Desde Railway CLI (Recomendado)**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Conectar a tu proyecto
railway link

# 4. Importar base de datos
railway run mysql -u root -p < database/backup_completo.sql
```

---

## 🔧 PASO 6: CONFIGURAR BUILD COMMANDS

### **Backend:**

En Railway → Settings → Build:

```json
{
  "buildCommand": "npm install && npm run build:api",
  "startCommand": "npm run start:api"
}
```

### **Frontend:**

En Railway → Settings → Build:

```json
{
  "buildCommand": "npm install && npm run build",
  "startCommand": "npm run preview"
}
```

---

## 🌐 PASO 7: OBTENER DOMINIOS

Railway te da dominios automáticos:

- **Backend:** `https://tu-proyecto-production.up.railway.app`
- **Frontend:** `https://tu-proyecto-production-frontend.up.railway.app`

### **Configurar dominio personalizado (Opcional):**

1. Compra dominio en Namecheap, GoDaddy, etc.
2. En Railway → Settings → Domains
3. Agrega tu dominio personalizado
4. Configura DNS según instrucciones de Railway

---

## ✅ PASO 8: VERIFICAR DEPLOYMENT

### **Backend:**
```
https://tu-backend.up.railway.app/api
```
Deberías ver: respuesta JSON del API

### **Frontend:**
```
https://tu-frontend.up.railway.app
```
Deberías ver: tu aplicación cargando

### **Login:**
```
https://tu-frontend.up.railway.app/login
```
Prueba con: `admin@zarparuy.com` / `admin123`

---

## 🔒 PASO 9: SEGURIDAD EN PRODUCCIÓN

### **1. Actualizar CORS en backend:**

```typescript
// api/app.ts
app.use(cors({
  origin: [
    'https://tu-frontend.up.railway.app',
    'https://tu-dominio-personalizado.com' // Si tienes
  ],
  credentials: true
}));
```

### **2. Cambiar JWT_SECRET:**

```env
# NO usar el mismo que en desarrollo
JWT_SECRET=produccion_ultra_seguro_2025_cambiar_cada_6_meses_zarpar
```

### **3. Deshabilitar logs de desarrollo:**

```typescript
// Solo en producción
if (process.env.NODE_ENV === 'production') {
  // Deshabilitar console.logs sensibles
}
```

---

## 📊 MONITOREO

### **Railway Dashboard:**
- Logs en tiempo real
- Métricas de CPU/RAM
- Uso de base de datos
- Costos en tiempo real

### **Alertas:**
- Configura alertas de $5, $10, $15 para no gastar de más

---

## 💰 COSTOS ESTIMADOS (RAILWAY)

### **Con tráfico moderado:**
```
Backend:     ~$5-8 USD/mes
Frontend:    ~$5 USD/mes
MySQL:       ~$5 USD/mes
TOTAL:       ~$15-18 USD/mes
```

### **Con poco tráfico (empezando):**
```
TOTAL: ~$5-10 USD/mes (entra en el crédito gratis)
```

---

## 🛠️ COMANDOS ÚTILES

### **Ver logs en tiempo real:**
```bash
railway logs
```

### **Conectarse a la base de datos:**
```bash
railway connect MySQL
```

### **Redeploy:**
```bash
railway up
```

### **Ver variables de entorno:**
```bash
railway variables
```

---

---

# 🆓 RENDER - GUÍA PASO A PASO (ALTERNATIVA GRATUITA)

## 🚀 PASO 1: CREAR CUENTA EN RENDER

1. **Ve a:** https://render.com/
2. **Sign Up con GitHub**
3. **Autoriza Render**

---

## 📦 PASO 2: DEPLOY DEL BACKEND

1. **En Render Dashboard:**
   - Click: "New +"
   - Selecciona: "Web Service"
   - Conecta tu repo: `sistemaZarpar`

2. **Configuración:**
   ```
   Name: zarpar-backend
   Region: Oregon (US West)
   Branch: Proyecto_depurado
   Root Directory: (dejar vacío)
   Runtime: Node
   Build Command: npm install && npm run build:api
   Start Command: npm run start:api
   Plan: Free
   ```

3. **Variables de Entorno:**
   ```env
   DB_HOST=<tu-mysql-host>
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=<password>
   DB_NAME=zarparDataBase
   PORT=3456
   NODE_ENV=production
   JWT_SECRET=tu_secreto_produccion
   ```

---

## 🌐 PASO 3: DEPLOY DEL FRONTEND

1. **En Render Dashboard:**
   - Click: "New +"
   - Selecciona: "Static Site"
   - Conecta tu repo: `sistemaZarpar`

2. **Configuración:**
   ```
   Name: zarpar-frontend
   Branch: Proyecto_depurado
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Variables de Entorno:**
   ```env
   VITE_API_URL=https://zarpar-backend.onrender.com/api
   ```

---

## 🗄️ PASO 4: BASE DE DATOS MYSQL

### **Opción A: Railway MySQL (Recomendado)**
1. Crear cuenta en Railway
2. Crear solo MySQL database
3. Obtener credenciales
4. Usarlas en Render

### **Opción B: PlanetScale (Serverless MySQL)**
1. Crear cuenta en https://planetscale.com/
2. Crear database gratuita
3. Obtener connection string
4. Usarla en Render

---

## ✅ VERIFICACIÓN

- **Backend:** `https://zarpar-backend.onrender.com/api`
- **Frontend:** `https://zarpar-frontend.onrender.com`

**NOTA:** El backend tarda ~30s en despertar la primera vez (free tier)

---

---

# 📝 PREPARACIÓN DEL PROYECTO

Antes de hacer deploy, necesitas preparar algunos archivos:

## 1. Crear `package.json` scripts de producción

```json
{
  "scripts": {
    "build:api": "tsc --project tsconfig.api.json",
    "start:api": "node api/dist/server.js",
    "build": "vite build",
    "preview": "vite preview --port 5678 --host"
  }
}
```

## 2. Crear `tsconfig.api.json` para backend

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./api/dist",
    "rootDir": "./api",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["api/**/*"],
  "exclude": ["node_modules"]
}
```

## 3. Actualizar `.env.production` (crear si no existe)

```env
NODE_ENV=production
```

---

---

# 🔐 VARIABLES DE ENTORNO COMPLETAS

## Backend (.env para Railway/Render)

```env
# Base de Datos (Railway te da estas automáticamente)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=zarparDataBase

# Backend
PORT=3456
NODE_ENV=production

# JWT - CAMBIAR EN PRODUCCIÓN
JWT_SECRET=produccion_ultra_secreto_2025_railway_zarpar_cambiar_cada_6_meses
JWT_EXPIRES_IN=7d

# Frontend URL (para CORS)
FRONTEND_URL=https://tu-dominio.up.railway.app
```

## Frontend (.env para Railway/Render)

```env
# API URL - Cambiar por tu backend en Railway
VITE_API_URL=https://tu-backend.up.railway.app/api
```

---

---

# 🔥 TROUBLESHOOTING

## ❌ Error: "Cannot connect to MySQL"

**Solución:**
1. Verifica que importaste el backup de la BD
2. Verifica las variables `DB_HOST`, `DB_PORT`, etc.
3. En Railway: usa las variables `${{MySQL.MYSQL_HOST}}`

---

## ❌ Error: "CORS blocked"

**Solución:**
```typescript
// api/app.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5678',
  credentials: true
}));
```

---

## ❌ Error: "502 Bad Gateway"

**Solución:**
1. Verifica que el backend se esté ejecutando
2. Revisa los logs en Railway/Render
3. Verifica el `PORT` correcto

---

## ❌ Frontend no carga

**Solución:**
1. Verifica que `npm run build` funciona localmente
2. Verifica `VITE_API_URL` esté correcto
3. Revisa la consola del navegador (F12)

---

---

# 📊 COMPARACIÓN FINAL

| Característica | Railway | Render | DigitalOcean |
|----------------|---------|--------|--------------|
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Precio/mes** | $15-20 | $5-15 | $20-30 |
| **MySQL incluido** | ✅ | ❌ | ✅ |
| **Free tier** | $5 gratis | ✅ Frontend gratis | ❌ |
| **Estabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Velocidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (se duerme) | ⭐⭐⭐⭐⭐ |

---

# 🎯 MI RECOMENDACIÓN FINAL

## **Para ti: RAILWAY** 🚂

### **Plan sugerido:**
1. **Mes 1-2:** Usa los $5 gratis para probar
2. **Mes 3+:** Paga ~$15-20/mes si el sistema funciona bien
3. **Futuro:** Escala según necesites

### **¿Por qué Railway?**
- ✅ TODO en un solo lugar
- ✅ Muy fácil de configurar
- ✅ MySQL incluido
- ✅ Estable y profesional
- ✅ Logs en tiempo real
- ✅ Perfecto para tu sistema empresarial

---

# 📚 RECURSOS ÚTILES

- **Railway Docs:** https://docs.railway.app/
- **Render Docs:** https://render.com/docs
- **Railway CLI:** https://docs.railway.app/develop/cli

---

**Última actualización:** 14 de Noviembre, 2025  
**Autor:** Asistente IA  
**Proyecto:** Sistema Zarpar  
**Estado:** Listo para Deploy 🚀

