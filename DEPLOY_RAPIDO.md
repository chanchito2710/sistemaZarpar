# 🚀 DEPLOY RÁPIDO - RAILWAY

## ⚡ PASOS RÁPIDOS (10 minutos)

### 1️⃣ **Crear cuenta en Railway**
- Ve a: https://railway.app/
- Sign Up con GitHub
- Autoriza Railway

### 2️⃣ **Crear proyecto nuevo**
- Click: "New Project"
- Selecciona: "Deploy from GitHub repo"
- Busca: `sistemaZarpar`
- Click: "Deploy Now"

### 3️⃣ **Agregar MySQL**
- En tu proyecto: Click "+ New"
- Selecciona: "Database" → "Add MySQL"
- Railway crea todo automáticamente ✅

### 4️⃣ **Configurar variables (Backend)**

En Railway → Tu servicio → "Variables":

```
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=zarparDataBase
PORT=3456
NODE_ENV=production
JWT_SECRET=produccion_secreto_2025_railway
```

### 5️⃣ **Configurar variables (Frontend)**

```
VITE_API_URL=https://tu-backend.up.railway.app/api
```

### 6️⃣ **Importar base de datos**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link a tu proyecto
railway link

# Importar
railway run mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD zarparDataBase < database/backup_completo.sql
```

### 7️⃣ **¡LISTO! 🎉**

Railway te dará URLs:
- **Backend:** `https://tu-proyecto.up.railway.app`
- **Frontend:** `https://tu-proyecto-frontend.up.railway.app`

---

## 💰 **COSTO**

- $5 USD gratis al mes
- Después ~$15-20 USD/mes

---

## 📚 **Guía completa**

Lee `GUIA_DEPLOY_PRODUCCION.md` para más detalles.

---

## ❓ **¿Problemas?**

1. Revisa los logs en Railway Dashboard
2. Verifica las variables de entorno
3. Asegúrate de importar la base de datos

---

**¡Tu sistema estará online en 10 minutos!** 🚀

