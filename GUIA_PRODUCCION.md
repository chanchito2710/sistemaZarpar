# 🚀 GUÍA DE PREPARACIÓN PARA PRODUCCIÓN - SISTEMA ZARPAR

## 📋 CHECKLIST DE PRE-PRODUCCIÓN

### ✅ **COMPLETADO**

#### **Seguridad** 🔒
- ✅ Protección contra SQL Injection (prepared statements + pattern detection)
- ✅ Protección contra XSS (sanitización de inputs)
- ✅ Protección contra CSRF (validación de origen)
- ✅ Rate Limiting (brute force protection)
- ✅ Security Headers (Helmet.js)
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ CORS configurado
- ✅ Input Validation (express-validator)
- ✅ Security Logging

#### **Base de Datos** 🗄️
- ✅ Encoding UTF-8 completo (utf8mb4)
- ✅ Backups automatizados
- ✅ Estructura optimizada
- ✅ Índices en columnas clave
- ✅ Foreign Keys configuradas
- ✅ Transacciones en operaciones críticas

#### **Funcionalidades** 💼
- ✅ Sistema de Ventas (POS)
- ✅ Gestión de Productos
- ✅ Gestión de Clientes
- ✅ Gestión de Vendedores
- ✅ Cuenta Corriente
- ✅ Sistema de Comisiones
- ✅ Transferencias entre Sucursales
- ✅ Sistema de Caja
- ✅ Devoluciones
- ✅ Descuentos
- ✅ Reportes y Estadísticas
- ✅ Exportación a PDF
- ✅ Lista de Precios

#### **UI/UX** 🎨
- ✅ Responsive Design (móvil, tablet, desktop)
- ✅ Iconos profesionales (Ant Design Icons)
- ✅ Animaciones suaves
- ✅ Feedback visual (loading, success, error)
- ✅ Mensajes claros al usuario

---

## 🔧 PASOS PARA DESPLIEGUE EN PRODUCCIÓN

### **PASO 1: Preparar Variables de Entorno**

Crear archivo `.env.production` en la raíz:

```env
# === BASE DE DATOS ===
DB_HOST=tu-servidor-mysql-produccion
DB_PORT=3306
DB_USER=zarpar_user
DB_PASSWORD=PASSWORD_SEGURA_CAMBIAR_AQUI
DB_NAME=zarparDataBase

# === BACKEND ===
PORT=3456
NODE_ENV=production

# === SEGURIDAD ===
JWT_SECRET=CAMBIAR_POR_STRING_ALEATORIO_LARGO_Y_SEGURO
JWT_EXPIRES_IN=8h

# === FRONTEND ===
VITE_API_URL=https://tu-dominio.com/api

# === CORS ===
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com

# === RATE LIMITING ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# === LOGS ===
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

**⚠️ CRÍTICO:**
- Cambiar `JWT_SECRET` por una cadena aleatoria de al menos 64 caracteres
- Cambiar `DB_PASSWORD` por una contraseña segura
- Actualizar `VITE_API_URL` con tu dominio real
- Actualizar `CORS_ORIGIN` con tu dominio real

---

### **PASO 2: Opciones de Hosting**

#### **Opción A: Railway.app** (Recomendado - Más Fácil) ⭐

**Ventajas:**
- ✅ Deploy automático desde GitHub
- ✅ Base de datos MySQL incluida
- ✅ HTTPS automático
- ✅ Variables de entorno por GUI
- ✅ Logs en tiempo real
- ✅ Free tier disponible

**Pasos:**
1. Ir a https://railway.app
2. Conectar con GitHub
3. Seleccionar este repositorio
4. Agregar servicio MySQL
5. Configurar variables de entorno
6. Deploy automático ✅

**Costo estimado:** $5-10/mes

---

#### **Opción B: VPS (DigitalOcean, Linode, AWS EC2)**

**Ventajas:**
- ✅ Control total del servidor
- ✅ Más barato a largo plazo
- ❌ Requiere configuración manual

**Pasos básicos:**
1. Crear VPS Ubuntu 22.04
2. Instalar Node.js, Docker, Nginx
3. Clonar repositorio
4. Configurar Docker para MySQL
5. Configurar Nginx como reverse proxy
6. Configurar SSL con Let's Encrypt
7. PM2 para mantener app corriendo

**Costo estimado:** $5-12/mes

---

#### **Opción C: Frontend en Vercel + Backend en Railway**

**Ventajas:**
- ✅ Frontend ultra rápido (CDN global)
- ✅ Backend gestionado
- ✅ Free tier generoso

**Pasos:**
1. **Frontend en Vercel:**
   - Conectar repo con Vercel
   - Auto-deploy desde GitHub
   - Configurar `VITE_API_URL`

2. **Backend + MySQL en Railway:**
   - Igual que Opción A

**Costo estimado:** $5/mes (solo Railway)

---

### **PASO 3: Restaurar Base de Datos**

En el servidor de producción:

```bash
# 1. Copiar backup al servidor
scp database/backup_completo_produccion_*.sql usuario@servidor:/tmp/

# 2. En el servidor, restaurar
docker exec -i mysql-container mysql -u root -pPASSWORD \
  --default-character-set=utf8mb4 \
  zarparDataBase < /tmp/backup_completo_produccion_*.sql

# 3. Verificar
docker exec -i mysql-container mysql -u root -pPASSWORD \
  -e "USE zarparDataBase; SHOW TABLES; SELECT COUNT(*) FROM vendedores;"
```

---

### **PASO 4: Build del Frontend**

```bash
# Instalar dependencias
npm install

# Build para producción
npm run build

# Resultado: carpeta dist/ con archivos optimizados
```

---

### **PASO 5: Configurar Nginx (si usas VPS)**

Archivo `/etc/nginx/sites-available/zarpar`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend (archivos estáticos)
    location / {
        root /var/www/zarpar/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3456;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activar configuración
sudo ln -s /etc/nginx/sites-available/zarpar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Configurar SSL con Let's Encrypt
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

---

### **PASO 6: Mantener Backend Corriendo (PM2)**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar backend
pm2 start api/index.ts --name zarpar-api --interpreter node

# Configurar auto-start
pm2 startup
pm2 save

# Ver logs
pm2 logs zarpar-api

# Reiniciar si hay cambios
pm2 restart zarpar-api
```

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

### **Firewall**
```bash
# Permitir solo puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **Actualizar Dependencias**
```bash
# Revisar vulnerabilidades
npm audit

# Actualizar paquetes con vulnerabilidades
npm audit fix
```

### **Monitoreo de Logs**
```bash
# Ver logs de seguridad
tail -f logs/security.log

# Ver intentos de SQL injection
grep "SQL_INJECTION" logs/security.log

# Ver rate limit hits
grep "RATE_LIMIT" logs/security.log
```

---

## 📊 MONITOREO POST-DEPLOY

### **Health Checks**
```bash
# Verificar que API responde
curl https://tu-dominio.com/api/health

# Verificar base de datos
docker exec mysql-container mysqladmin ping -u root -pPASSWORD
```

### **Logs importantes**
- Backend: `pm2 logs zarpar-api`
- Nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- MySQL: `docker logs mysql-container`

---

## 🚨 TROUBLESHOOTING

### **Error: Cannot connect to database**
```bash
# Verificar que MySQL está corriendo
docker ps | grep mysql

# Ver logs
docker logs mysql-container

# Verificar credenciales en .env
```

### **Error: CORS blocked**
```bash
# Verificar CORS_ORIGIN en .env.production
# Debe incluir tu dominio real
```

### **Error: 502 Bad Gateway**
```bash
# Backend no está corriendo
pm2 status
pm2 restart zarpar-api

# Verificar logs
pm2 logs zarpar-api
```

---

## 📋 CHECKLIST POST-DEPLOY

```
[ ] Variables de entorno configuradas correctamente
[ ] Base de datos restaurada y verificada
[ ] Backend corriendo y respondiendo
[ ] Frontend cargando correctamente
[ ] Login funciona con admin@zarparuy.com
[ ] Ventas se pueden hacer desde POS
[ ] Productos se pueden crear/editar
[ ] PDFs se generan correctamente
[ ] Rate limiting funciona (intentar login 6 veces)
[ ] HTTPS activo (candado verde en navegador)
[ ] Backups automáticos configurados
[ ] Monitoreo de logs activo
```

---

## 📞 SOPORTE Y MANTENIMIENTO

### **Backups Regulares**
```bash
# Crear script de backup automático
# /home/usuario/backup-zarpar.sh

#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec mysql-container mysqldump -u root -pPASSWORD \
  --default-character-set=utf8mb4 \
  --single-transaction \
  --routines --triggers --events \
  zarparDataBase > /backups/zarpar_$TIMESTAMP.sql

# Mantener solo últimos 30 días
find /backups -name "zarpar_*.sql" -mtime +30 -delete
```

```bash
# Agregar a crontab (diario a las 2 AM)
0 2 * * * /home/usuario/backup-zarpar.sh
```

### **Actualizar Sistema**
```bash
# 1. Hacer backup
npm run backup:db

# 2. Pull cambios
git pull origin main

# 3. Instalar dependencias
npm install

# 4. Build frontend
npm run build

# 5. Reiniciar backend
pm2 restart zarpar-api
```

---

## 🎯 MÉTRICAS DE ÉXITO

Después del deploy, verificar:

- ✅ Tiempo de respuesta API < 200ms
- ✅ Tasa de error < 1%
- ✅ Uptime > 99.5%
- ✅ Zero incidentes de seguridad
- ✅ Backups funcionando diariamente
- ✅ SSL/HTTPS activo

---

## 📚 DOCUMENTACIÓN RELACIONADA

- `SISTEMA_SEGURIDAD_RUTAS.md` - Sistema de seguridad completo
- `SISTEMA_PROTECCION_INTEGRIDAD_BD.md` - Protección de base de datos
- `database/README_BACKUPS.md` - Guía de backups
- `COMPARACION_COSTOS_HOSTING.md` - Comparación de opciones de hosting

---

**Última actualización**: 14 de Noviembre, 2025  
**Estado**: LISTO PARA PRODUCCIÓN ✅  
**Versión**: 3.0.0

