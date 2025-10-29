# 📤 INSTRUCCIONES PARA SUBIR EL PROYECTO A GITHUB

**Fecha:** 29 de Octubre, 2025  
**Estado:** ✅ Proyecto preparado y listo para GitHub

---

## ✅ LO QUE YA ESTÁ LISTO

- ✅ **Base de datos exportada**: `database/backup_completo.sql` (30 KB)
- ✅ **CONTEXTO_AGENTE.md actualizado** con instrucciones completas de instalación desde cero
- ✅ **README.md creado** con documentación para GitHub
- ✅ **.gitignore configurado** para no subir archivos sensibles

---

## 📋 ARCHIVOS QUE SE SUBIRÁN A GITHUB

### ✅ Incluidos (se subirán):
- Todo el código fuente (`src/`, `api/`)
- Base de datos de respaldo (`database/backup_completo.sql`)
- Configuración del proyecto (`package.json`, `tsconfig.json`, `vite.config.ts`, etc.)
- Documentación (`README.md`, `CONTEXTO_AGENTE.md`, etc.)
- Scripts de inicio (`START.bat`, `start-backend.ps1`, `start-frontend.ps1`)

### ❌ Excluidos (NO se subirán):
- `node_modules/` (muy pesado, se reinstala con `npm install`)
- `.env` (contiene credenciales sensibles)
- `dist/` y `build/` (archivos compilados)
- Logs y archivos temporales

---

## 🚀 PASOS PARA SUBIR A GITHUB

### **PASO 1: Crear Repositorio en GitHub**

1. Ir a: https://github.com/new
2. Configurar:
   - **Repository name**: `sistema-zarpar` (o el nombre que prefieras)
   - **Description**: "Sistema POS Multi-Sucursal para Zarpar Uruguay"
   - **Visibility**: 
     - ✅ **Private** (recomendado para proyectos empresariales)
     - O **Public** si quieres que sea público
   - **NO marcar** "Add a README file" (ya tienes uno)
   - **NO marcar** "Add .gitignore" (ya tienes uno)
   - **NO marcar** "Choose a license"

3. Hacer clic en **"Create repository"**

4. **Copiar la URL del repositorio** que aparece (algo como):
   ```
   https://github.com/TU_USUARIO/sistema-zarpar.git
   ```

---

### **PASO 2: Inicializar Git (si no está inicializado)**

Abrir terminal en la carpeta del proyecto y ejecutar:

```bash
# Verificar si ya está inicializado
git status

# Si muestra error "not a git repository", inicializar:
git init

# Configurar tu información (si no la tienes configurada globalmente)
git config user.name "Tu Nombre"
git config user.email "tu@email.com"
```

---

### **PASO 3: Agregar Todos los Archivos**

```bash
# Agregar todos los archivos (respetando .gitignore)
git add .

# Verificar qué archivos se agregarán
git status
```

**Deberías ver archivos como:**
- `api/`
- `src/`
- `database/backup_completo.sql`
- `README.md`
- `CONTEXTO_AGENTE.md`
- `package.json`
- etc.

**NO deberías ver:**
- `node_modules/`
- `.env`
- `dist/`

---

### **PASO 4: Hacer el Primer Commit**

```bash
# Hacer commit con mensaje descriptivo
git commit -m "🎉 Versión inicial del Sistema ZARPAR - POS Multi-Sucursal

- Sistema completo de autenticación con JWT
- Control de roles (Admin vs Sucursal)
- Gestión de productos con stock y precio por sucursal
- POS funcional con selección de sucursal, cliente y vendedor
- Administrador de base de datos
- Dashboard con estadísticas
- Base de datos MySQL en Docker
- Documentación completa en CONTEXTO_AGENTE.md"
```

---

### **PASO 5: Conectar con GitHub**

```bash
# Agregar el repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/sistema-zarpar.git

# Verificar que se agregó correctamente
git remote -v
```

**Deberías ver:**
```
origin  https://github.com/TU_USUARIO/sistema-zarpar.git (fetch)
origin  https://github.com/TU_USUARIO/sistema-zarpar.git (push)
```

---

### **PASO 6: Subir el Código a GitHub**

```bash
# Crear y cambiar a la rama main (o master según tu configuración)
git branch -M main

# Subir el código por primera vez
git push -u origin main
```

**Si te pide autenticación:**

#### Opción A: Con Personal Access Token (Recomendado)

1. Ir a: https://github.com/settings/tokens
2. Clic en "Generate new token" → "Generate new token (classic)"
3. Configurar:
   - **Note**: "Sistema ZARPAR"
   - **Expiration**: 90 days (o No expiration si prefieres)
   - **Scopes**: Marcar `repo` (todos los permisos de repositorio)
4. Clic en "Generate token"
5. **COPIAR EL TOKEN** (solo se muestra una vez)
6. Cuando Git pida password, pegar el token

#### Opción B: Con SSH (Más seguro, pero requiere configuración)

```bash
# Generar clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu@email.com"

# Copiar clave pública
# Windows:
type %USERPROFILE%\.ssh\id_ed25519.pub

# macOS/Linux:
cat ~/.ssh/id_ed25519.pub

# Agregar la clave a GitHub:
# 1. Ir a: https://github.com/settings/keys
# 2. Clic en "New SSH key"
# 3. Pegar la clave pública
# 4. Clic en "Add SSH key"

# Cambiar la URL del repositorio a SSH
git remote set-url origin git@github.com:TU_USUARIO/sistema-zarpar.git

# Subir
git push -u origin main
```

---

### **PASO 7: Verificar en GitHub**

1. Ir a tu repositorio: `https://github.com/TU_USUARIO/sistema-zarpar`
2. Deberías ver:
   - ✅ Todos tus archivos
   - ✅ El `README.md` se muestra automáticamente
   - ✅ El commit con tu mensaje

---

## 🔄 COMANDOS PARA FUTURAS ACTUALIZACIONES

### Subir cambios al repositorio

```bash
# 1. Ver qué archivos cambiaron
git status

# 2. Agregar archivos modificados
git add .

# 3. Hacer commit con mensaje descriptivo
git commit -m "Descripción de los cambios"

# 4. Subir a GitHub
git push
```

### Descargar cambios desde GitHub (si trabajas desde otra máquina)

```bash
# Traer los últimos cambios
git pull

# Reinstalar dependencias si cambiaron
npm install
```

---

## 📦 CLONAR EL PROYECTO EN OTRA MÁQUINA

### Pasos completos (ver `CONTEXTO_AGENTE.md` para detalles):

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/sistema-zarpar.git
cd sistema-zarpar

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (ver README.md para el contenido)
# Windows: New-Item .env -ItemType File
# macOS/Linux: touch .env

# 4. Levantar Docker MySQL
docker run -d \
  --name zarpar-mysql \
  -e MYSQL_ROOT_PASSWORD=zarpar2025 \
  -e MYSQL_DATABASE=zarparDataBase \
  -p 3307:3306 \
  --restart unless-stopped \
  mysql:8.0

# 5. Esperar 30 segundos e importar la base de datos
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 < database/backup_completo.sql

# 6. Levantar el proyecto
npm run dev

# ¡Listo! 🎉
```

---

## 🔐 SEGURIDAD

### ⚠️ IMPORTANTE: Archivos Sensibles

El archivo `.gitignore` está configurado para **NO subir**:

- ✅ `.env` (credenciales de base de datos)
- ✅ `node_modules/` (muy pesado)
- ✅ Logs y archivos temporales

**Verifica que estos archivos NO aparezcan cuando hagas `git status`**

### 🔒 Recomendaciones de Seguridad

1. **NUNCA subir el archivo `.env`** a GitHub
2. **Cambiar `JWT_SECRET`** en producción
3. **Usar repositorio PRIVATE** si es un proyecto empresarial
4. **Usar Personal Access Token** en lugar de contraseña
5. **Revocar tokens** que no uses

---

## 📊 ESTRUCTURA DEL REPOSITORIO EN GITHUB

```
sistema-zarpar/
├── 📄 README.md                  ← Se muestra en la página principal
├── 📄 CONTEXTO_AGENTE.md        ← Instrucciones completas
├── 📄 .gitignore                ← Archivos ignorados
├── 📄 package.json              ← Dependencias
├── 📦 api/                      ← Backend
├── 📦 src/                      ← Frontend
├── 🗄️ database/
│   └── backup_completo.sql      ← Base de datos
├── 📄 START.bat                 ← Script de inicio
└── ... más archivos
```

---

## ✅ CHECKLIST FINAL

Antes de considerar que el proyecto está en GitHub:

```
[ ] Repositorio creado en GitHub
[ ] Git inicializado localmente (git init)
[ ] Archivos agregados (git add .)
[ ] Commit realizado (git commit)
[ ] Repositorio remoto conectado (git remote add origin)
[ ] Código subido (git push)
[ ] README.md se muestra correctamente en GitHub
[ ] Archivo .env NO aparece en GitHub
[ ] node_modules/ NO aparece en GitHub
[ ] database/backup_completo.sql SÍ aparece en GitHub
[ ] Puedes clonar el repositorio en otra máquina
```

---

## 🎓 TIPS Y TRUCOS

### Ver historial de commits
```bash
git log --oneline
```

### Deshacer cambios locales
```bash
# Descartar cambios en un archivo
git checkout -- archivo.txt

# Descartar todos los cambios
git reset --hard
```

### Crear una rama para nuevas features
```bash
# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Hacer cambios, commit, y push
git add .
git commit -m "Nueva funcionalidad"
git push -u origin feature/nueva-funcionalidad

# En GitHub, crear Pull Request para merge a main
```

### Ver archivos ignorados por .gitignore
```bash
git status --ignored
```

---

## 📞 SOPORTE

Si tienes problemas:

1. **Verificar Git**: `git --version`
2. **Verificar conexión a GitHub**: `git remote -v`
3. **Ver errores**: Leer el mensaje de error completo
4. **Consultar documentación**: https://docs.github.com/

---

## 🎉 ¡LISTO!

Tu proyecto ahora está en GitHub y cualquier persona (con acceso) puede:
1. Clonarlo
2. Instalar dependencias
3. Levantar Docker
4. Restaurar la base de datos
5. Ejecutar el proyecto

**Todo gracias a la documentación completa en `CONTEXTO_AGENTE.md` y `README.md`** ✅

---

**Documentado por:** AI Assistant  
**Fecha:** 29 de Octubre, 2025  
**Backup de BD:** ✅ `database/backup_completo.sql` (30 KB)  
**Estado:** ✅ **LISTO PARA GITHUB**

