# 🚀 CÓMO SUBIR TU SISTEMA A INTERNET - PASO A PASO SUPER SIMPLE

## 📝 LO QUE VAS A HACER:

Vas a subir tu sistema a **Railway** (una página web que te deja hospedar tu aplicación).

**RESULTADO:** Tu sistema funcionando en internet con una URL como: `https://zarpar.up.railway.app`

**TIEMPO:** 15-20 minutos

**COSTO:** $5 USD gratis el primer mes, luego $15-20 USD/mes

---

---

# 🎯 PASO 1: CREAR CUENTA EN RAILWAY

## 1.1 - Abrir Railway

1. **Abre tu navegador** (Chrome, Edge, etc.)
2. **Ve a esta página:** https://railway.app/
3. Verás algo así:

```
┌─────────────────────────────────────┐
│  Railway                            │
│                                     │
│  [Start a New Project]              │
│  [Login]         [Sign Up]          │
└─────────────────────────────────────┘
```

## 1.2 - Crear cuenta con GitHub

1. **Click en "Login"** (arriba a la derecha)
2. **Click en "Login with GitHub"**
3. **Ingresa con tu usuario y contraseña de GitHub**
4. **Autoriza Railway** (click en "Authorize railway")

✅ **Listo!** Ya tienes cuenta en Railway.

---

---

# 🎯 PASO 2: CREAR TU PROYECTO

## 2.1 - Nuevo proyecto

1. **Ya deberías estar en el Dashboard de Railway**
2. Verás un botón grande que dice: **"New Project"**
3. **Click en "New Project"**

## 2.2 - Conectar tu repositorio de GitHub

1. Te aparecerán varias opciones
2. **Click en: "Deploy from GitHub repo"**
3. Te mostrará tus repositorios
4. **Busca:** `sistemaZarpar` (o como se llame tu repo)
5. **Click en tu repositorio**
6. **Click en "Deploy Now"**

✅ **Espera 2-3 minutos** mientras Railway clona tu código.

---

---

# 🎯 PASO 3: AGREGAR BASE DE DATOS MYSQL

## 3.1 - Agregar MySQL

1. **En tu proyecto de Railway**, verás tu servicio corriendo
2. Arriba a la derecha, busca un botón que dice: **"+ New"**
3. **Click en "+ New"**
4. **Click en "Database"**
5. **Click en "Add MySQL"**

✅ Railway creará automáticamente:
- Base de datos MySQL
- Usuario y contraseña
- Todo configurado

**Espera 1 minuto** mientras se crea.

---

---

# 🎯 PASO 4: CONFIGURAR VARIABLES DE ENTORNO (BACKEND)

## 4.1 - Abrir configuración del backend

1. **En tu proyecto**, verás 2 servicios:
   - Uno es tu código (backend)
   - Otro es MySQL
2. **Click en el servicio de tu código** (no en MySQL)

## 4.2 - Ir a Variables

1. **Arriba verás pestañas:** Settings, Variables, Deployments, etc.
2. **Click en "Variables"**

## 4.3 - Agregar estas variables (COPIA Y PEGA)

**Click en "New Variable"** y agrega UNA POR UNA:

### **Variable 1:**
```
Name: DB_HOST
Value: ${{MySQL.MYSQL_HOST}}
```

### **Variable 2:**
```
Name: DB_PORT
Value: ${{MySQL.MYSQL_PORT}}
```

### **Variable 3:**
```
Name: DB_USER
Value: ${{MySQL.MYSQL_USER}}
```

### **Variable 4:**
```
Name: DB_PASSWORD
Value: ${{MySQL.MYSQL_PASSWORD}}
```

### **Variable 5:**
```
Name: DB_NAME
Value: zarparDataBase
```

### **Variable 6:**
```
Name: PORT
Value: 3456
```

### **Variable 7:**
```
Name: NODE_ENV
Value: production
```

### **Variable 8:**
```
Name: JWT_SECRET
Value: produccion_secreto_2025_cambiar_cada_6_meses_zarpar
```

✅ **Listo!** Railway reiniciará automáticamente tu servicio.

---

---

# 🎯 PASO 5: OBTENER LA URL DE TU BACKEND

## 5.1 - Obtener URL

1. **En tu servicio de backend**, ve a la pestaña **"Settings"**
2. **Scroll hacia abajo** hasta encontrar **"Domains"**
3. Verás algo como:
   ```
   https://sistema-zarpar-production-XXXX.up.railway.app
   ```
4. **COPIA ESA URL** (la vas a necesitar en el siguiente paso)

---

---

# 🎯 PASO 6: CONFIGURAR FRONTEND (SI TIENES SERVICIO SEPARADO)

## 6.1 - ¿Tienes 2 servicios en Railway?

**SI SOLO TIENES 1 SERVICIO**, salta al **PASO 7**.

**SI TIENES 2 SERVICIOS** (uno para frontend, otro para backend):

1. **Click en el servicio de FRONTEND**
2. **Ve a "Variables"**
3. **Agrega esta variable:**

```
Name: VITE_API_URL
Value: https://TU-URL-DEL-BACKEND-AQUI/api
```

**⚠️ IMPORTANTE:** Reemplaza `TU-URL-DEL-BACKEND-AQUI` con la URL que copiaste en el paso 5.

**Ejemplo:**
```
VITE_API_URL=https://sistema-zarpar-production-abc123.up.railway.app/api
```

---

---

# 🎯 PASO 7: IMPORTAR TU BASE DE DATOS

## 7.1 - Instalar Railway CLI (solo 1 vez)

**Abre PowerShell en tu computadora** y ejecuta:

```powershell
npm install -g @railway/cli
```

Espera a que termine (1-2 minutos).

## 7.2 - Login en Railway desde la terminal

```powershell
railway login
```

**Se abrirá tu navegador**, autoriza.

## 7.3 - Conectar a tu proyecto

```powershell
cd "C:\Users\Fullstack\Desktop\Mis Proyectos\En-proceso\sistema"
railway link
```

**Selecciona tu proyecto** con las flechas y Enter.

## 7.4 - Importar la base de datos

```powershell
railway run mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD zarparDataBase < database/backup_completo.sql
```

**⚠️ IMPORTANTE:** Si te pide password, presiona Enter (Railway lo pone automáticamente).

✅ **Espera 1-2 minutos** mientras importa tus datos.

---

---

# 🎯 PASO 8: VERIFICAR QUE TODO FUNCIONA

## 8.1 - Ver la URL de tu sistema

1. **Ve a Railway Dashboard**
2. **Click en tu servicio de backend**
3. **Ve a "Settings"**
4. **Busca la sección "Domains"**
5. **Copia la URL**, ejemplo:
   ```
   https://zarpar-production-abc123.up.railway.app
   ```

## 8.2 - Abrir tu sistema en el navegador

1. **Abre esa URL en tu navegador**
2. **Deberías ver tu sistema funcionando!**
3. **Ve a la página de login:**
   ```
   https://zarpar-production-abc123.up.railway.app/login
   ```

## 8.3 - Probar el login

1. **Email:** `admin@zarparuy.com`
2. **Password:** `admin123`
3. **Click "Iniciar Sesión"**

✅ **Si entras, TODO ESTÁ FUNCIONANDO!** 🎉

---

---

# 💰 COSTOS

## ¿Cuánto voy a pagar?

| Periodo | Costo |
|---------|-------|
| **Primer mes** | **$0 USD** (Railway te da $5 gratis) |
| **Segundo mes en adelante** | **$15-20 USD/mes** |

**Railway cobra por uso real**, si tu sistema no tiene mucho tráfico, puede ser menos.

## ¿Cómo pago?

1. **Ve a Railway Dashboard**
2. **Click en tu foto** (arriba derecha)
3. **Click en "Account Settings"**
4. **Click en "Billing"**
5. **Agrega tu tarjeta de crédito/débito**

**⚠️ NO TE COBRARÁN HASTA QUE USES MÁS DE $5 AL MES.**

---

---

# ❓ PREGUNTAS FRECUENTES

## ❓ ¿Qué pasa si algo sale mal?

**Revisa los LOGS en Railway:**
1. Click en tu servicio
2. Ve a la pestaña "Deployments"
3. Click en el deployment más reciente
4. Click en "View Logs"
5. Ahí verás qué está fallando

## ❓ ¿Cómo actualizo mi sistema después?

**Es automático!** Cada vez que hagas `git push` a GitHub, Railway lo detectará y actualizará automáticamente.

## ❓ ¿Puedo usar mi propio dominio?

**SÍ!** 
1. Compra un dominio (en Namecheap, GoDaddy, etc.)
2. En Railway → Settings → Domains
3. Click "Add Custom Domain"
4. Sigue las instrucciones

## ❓ ¿Cómo veo cuánto estoy gastando?

1. Railway Dashboard
2. Click en tu foto (arriba derecha)
3. Click en "Usage"
4. Ahí ves cuánto has gastado en el mes

---

---

# 📞 SI TIENES PROBLEMAS

## Problema 1: "Error al conectar a MySQL"

**Solución:**
1. Ve a Railway → Tu servicio → Variables
2. Verifica que todas las variables están bien escritas
3. Verifica que importaste la base de datos (PASO 7)

## Problema 2: "502 Bad Gateway"

**Solución:**
1. Ve a Deployments
2. Ve los Logs
3. Busca errores en rojo
4. Si dice "Cannot find module", ejecuta: `railway run npm install`

## Problema 3: "La página no carga"

**Solución:**
1. Espera 2-3 minutos (Railway puede tardar en desplegar)
2. Refresca la página (F5)
3. Verifica que el servicio esté "Active" (verde)

---

---

# ✅ CHECKLIST FINAL

Marca con ✅ cuando completes cada paso:

```
[ ] 1. Crear cuenta en Railway
[ ] 2. Crear proyecto desde GitHub
[ ] 3. Agregar MySQL
[ ] 4. Configurar 8 variables de entorno
[ ] 5. Obtener URL del backend
[ ] 6. Configurar frontend (si aplica)
[ ] 7. Importar base de datos
[ ] 8. Verificar que funciona
[ ] 9. Probar login con admin@zarparuy.com
```

---

---

# 🎉 ¡FELICIDADES!

**Tu sistema ahora está en internet!** 

Puedes accederlo desde:
- Tu computadora
- Tu celular
- Cualquier lugar del mundo

**Comparte la URL con tus clientes/empleados y que empiecen a usar el sistema.** 🚀

---

**¿Tienes alguna pregunta? Pregúntame lo que no entiendas.** 😊

