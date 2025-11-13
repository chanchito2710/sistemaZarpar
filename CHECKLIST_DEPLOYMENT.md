# ✅ CHECKLIST RÁPIDO DE DEPLOYMENT

## 📋 ANTES DE DESPLEGAR

### Verificaciones Locales:
```bash
[ ] npm run build              # Frontend compila sin errores
[ ] cd api && npm run build    # Backend compila sin errores
[ ] Todas las funcionalidades probadas localmente
[ ] Base de datos exportada (backup_completo.sql actualizado)
[ ] .env.example actualizado con todas las variables
[ ] README.md actualizado
[ ] Código subido a GitHub
```

### Seguridad:
```bash
[ ] JWT_SECRET cambiado a uno aleatorio y seguro
[ ] Passwords de producción diferentes a desarrollo
[ ] CORS configurado para dominio de producción
[ ] Rate limiting implementado
[ ] Validación de inputs completa
[ ] SQL injection protegido (prepared statements)
```

---

## 🚀 OPCIÓN 1: RAILWAY (RECOMENDADO)

### Tiempo estimado: **15 minutos**

#### Paso 1: Preparar el proyecto (2 min)

```bash
# Crear .env.example si no existe
cat > .env.example << EOF
NODE_ENV=production
PORT=3456
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zarparDataBase
JWT_SECRET=your_jwt_secret_here_minimum_32_characters
EOF

# Verificar que .gitignore incluya .env
echo ".env" >> .gitignore

# Commit y push
git add .
git commit -m "🚀 Preparado para deployment"
git push origin Proyecto_sin_Depurar
```

#### Paso 2: Railway Setup (5 min)

1. **Registrarse**: https://railway.app (usar GitHub)
2. **New Project** → **Deploy from GitHub repo**
3. Seleccionar: `sistemaZarpar` rama `Proyecto_sin_Depurar`

#### Paso 3: Agregar MySQL (2 min)

1. En Railway: Click **"New"** → **"Database"** → **"Add MySQL"**
2. Esperar a que se cree (1-2 minutos)

#### Paso 4: Configurar Variables (3 min)

En **Settings** → **Variables**, agregar:

```env
NODE_ENV=production
PORT=${{PORT}}
DB_HOST=${{MYSQL.MYSQLHOST}}
DB_PORT=${{MYSQL.MYSQLPORT}}
DB_USER=${{MYSQL.MYSQLUSER}}
DB_PASSWORD=${{MYSQL.MYSQLPASSWORD}}
DB_NAME=${{MYSQL.MYSQLDATABASE}}
JWT_SECRET=<generar-uno-nuevo-aleatorio-aqui>
```

**Generar JWT Secret**:
```bash
# En tu terminal local:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Paso 5: Importar Base de Datos (3 min)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link al proyecto
railway link

# Importar base de datos
railway run sh
# Dentro del shell:
apt-get update && apt-get install -y mysql-client
mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/backup_completo.sql
exit
```

#### Paso 6: Deploy del Frontend

**Opción A: En el mismo Railway**

1. Agregar script en `package.json`:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "start": "node api/dist/index.js && npx serve dist"
  }
}
```

**Opción B: En Vercel (Gratis)**

1. Ir a https://vercel.com
2. Import Git Repository → Seleccionar repo
3. Framework Preset: **Vite**
4. Environment Variables:
   ```
   VITE_API_URL=https://tu-app.up.railway.app/api
   ```
5. Deploy

#### ✅ Resultado:
- Backend: `https://tu-proyecto.up.railway.app`
- Frontend: `https://tu-proyecto.vercel.app`
- Base de datos: Conectada automáticamente

---

## 🌊 OPCIÓN 2: RENDER

### Tiempo estimado: **20 minutos**

#### Paso 1: Backend en Render

1. https://render.com → **New Web Service**
2. Conectar GitHub → Seleccionar repo
3. Configuración:
   - **Name**: `zarpar-api`
   - **Environment**: `Node`
   - **Branch**: `Proyecto_sin_Depurar`
   - **Build Command**: `npm install && cd api && npm run build`
   - **Start Command**: `node api/dist/index.js`
   - **Plan**: Free (o Starter $7/mes)

4. Environment Variables:
```env
NODE_ENV=production
PORT=3456
DB_HOST=<tu-db-host>
DB_PORT=3306
DB_USER=<tu-db-user>
DB_PASSWORD=<tu-db-password>
DB_NAME=zarparDataBase
JWT_SECRET=<generar-aleatorio>
```

#### Paso 2: Base de Datos en Render

1. **New PostgreSQL** (gratis) o **usar PlanetScale** (MySQL)
   
**Opción MySQL con PlanetScale**:
1. https://planetscale.com → Crear base de datos
2. Obtener connection string
3. Usar en variables de Render

#### Paso 3: Frontend en Vercel

(Igual que Railway Opción B)

---

## 🏠 OPCIÓN 3: HOSTINGER VPS

### Tiempo estimado: **2-3 horas**

#### Requisitos:
- Plan VPS de Hostinger (mínimo KVM 1)
- Conocimientos básicos de Linux
- Paciencia 😅

#### Script de Instalación Automatizado:

```bash
#!/bin/bash
# setup-vps.sh - Script de instalación automatizado

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2
sudo npm install -g pm2

# Instalar Git
sudo apt install git -y

# Crear directorio
sudo mkdir -p /var/www
cd /var/www

# Clonar proyecto
sudo git clone https://github.com/chanchito2710/sistemaZarpar.git
cd sistemaZarpar
sudo git checkout Proyecto_sin_Depurar

# Instalar dependencias
sudo npm install

# Build
sudo npm run build
sudo npm run build:api

echo "✅ Instalación base completa"
echo "⚠️ Ahora configura MySQL y variables de entorno"
```

#### Pasos Manuales Restantes:

1. **Configurar MySQL**:
```bash
sudo mysql_secure_installation
sudo mysql -u root -p
# Crear base de datos y usuario
# Importar backup
```

2. **Configurar .env**:
```bash
sudo nano /var/www/sistemaZarpar/.env
# Copiar variables de producción
```

3. **Configurar PM2**:
```bash
pm2 start api/dist/index.js --name zarpar-api
pm2 startup
pm2 save
```

4. **Configurar Nginx** (ver guía completa)

5. **Configurar SSL con Certbot** (ver guía completa)

---

## 🎯 RECOMENDACIÓN FINAL

### Para principiantes: **RAILWAY** ⭐⭐⭐⭐⭐
- Más fácil
- Menos configuración
- Todo integrado
- Costo: ~$5-10/mes

### Para presupuesto limitado: **RENDER FREE + VERCEL**
- Frontend gratis en Vercel
- Backend gratis en Render (duerme después de 15 min)
- Base de datos en PlanetScale (gratis hasta 5GB)
- Costo: $0/mes (con limitaciones)

### Para aprender DevOps: **HOSTINGER VPS**
- Control total
- Aprenderás mucho
- Más complejo
- Costo: $4-8/mes

---

## 📞 CONTACTO Y SOPORTE

Si tienes problemas durante el deployment:

1. **Revisar logs**:
   - Railway: Dashboard → Logs
   - Render: Dashboard → Logs
   - VPS: `pm2 logs` y `sudo tail -f /var/log/nginx/error.log`

2. **Verificar variables de entorno**:
   ```bash
   # Asegurarse de que todas estén configuradas
   echo $DB_HOST
   echo $JWT_SECRET
   ```

3. **Probar conexión a base de datos**:
   ```bash
   mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p
   ```

4. **Verificar que el puerto esté abierto**:
   ```bash
   curl http://localhost:3456/api
   ```

---

## 🎉 DESPUÉS DEL DEPLOYMENT

### Checklist Post-Deployment:

```bash
[ ] Probar login con todos los usuarios
[ ] Verificar que todas las páginas cargan
[ ] Probar crear venta
[ ] Probar devolución
[ ] Verificar que PDF se genera correctamente
[ ] Probar transferencias
[ ] Verificar carga de clientes por sucursal
[ ] Probar sistema de comisiones
[ ] Verificar que los reportes funcionan
[ ] Configurar backups automáticos de base de datos
[ ] Configurar monitoreo (UptimeRobot)
[ ] Compartir URL con el cliente/usuarios
```

### Configurar Backups Automáticos:

```bash
# Crear script de backup
nano /home/backup-db.sh

# Contenido:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD zarparDataBase > /backups/zarpar_$DATE.sql
# Mantener solo últimos 7 días
find /backups -name "zarpar_*.sql" -mtime +7 -delete

# Hacer ejecutable
chmod +x /home/backup-db.sh

# Agregar a cron (cada día a las 2 AM)
crontab -e
0 2 * * * /home/backup-db.sh
```

---

¡Buena suerte con el deployment! 🚀🎉

