# 🚀 Guía para Subir el Proyecto a GitHub

## 📋 Checklist Pre-Upload

Antes de subir a GitHub, verifica:

- [x] ✅ Backup de base de datos creado (`database/backup_completo.sql`)
- [x] ✅ Variables sensibles en `.env` (NO se sube)
- [x] ✅ `.gitignore` configurado
- [x] ✅ Documentación completa (README.md, CHANGELOG.md, .cursorrules)
- [x] ✅ Proyecto funciona localmente
- [x] ✅ No hay errores de linter

---

## 🔧 Paso a Paso para Subir a GitHub

### 1️⃣ Crear Repositorio en GitHub

1. Ve a https://github.com
2. Haz clic en "New repository"
3. Configura:
   - **Nombre**: `sistema-zarpar`
   - **Descripción**: "Sistema POS y gestión empresarial multi-sucursal con React, TypeScript, Express y MySQL"
   - **Visibilidad**: 
     - ✅ **Private** (recomendado para proyectos empresariales)
     - ⚠️ Public (solo si quieres compartir)
   - ❌ **NO** inicializar con README (ya tenemos uno)
   - ❌ **NO** agregar .gitignore (ya tenemos uno)

4. Haz clic en "Create repository"

---

### 2️⃣ Configurar Git Local (Primera Vez)

Si es la primera vez que usas Git en esta máquina:

```bash
# Configurar nombre
git config --global user.name "Tu Nombre"

# Configurar email
git config --global user.email "tu_email@ejemplo.com"
```

---

### 3️⃣ Inicializar Git en el Proyecto

```bash
# Navegar al directorio del proyecto
cd "C:\Users\Fullstack\Desktop\Mis Proyectos\En-proceso\sistema"

# Inicializar Git (si no está inicializado)
git init

# Verificar estado
git status
```

---

### 4️⃣ Agregar Archivos al Stage

```bash
# Agregar TODOS los archivos (respeta .gitignore)
git add .

# Verificar qué archivos se agregarán
git status
```

**Deberías ver:**
- ✅ Archivos de código fuente (`.ts`, `.tsx`, `.css`)
- ✅ `package.json`, `package-lock.json`
- ✅ `README.md`, `CHANGELOG.md`, `.cursorrules`
- ✅ `database/backup_completo.sql`
- ✅ `.gitignore`

**NO deberías ver:**
- ❌ `.env`
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `database/backup_completo_*.sql` (con timestamp)

---

### 5️⃣ Hacer el Primer Commit

```bash
# Commit inicial con mensaje descriptivo
git commit -m "🎉 Initial commit - Sistema Zarpar v2.0.0

- Sistema completo de POS y gestión empresarial
- Frontend: React 18 + TypeScript + Vite + Ant Design
- Backend: Express + TypeScript + MySQL
- Docker: MySQL 8.0
- Multi-sucursal: 7 sucursales activas
- Sistema de vendedores con eliminación inteligente
- Documentación completa en español
- Backup completo de base de datos incluido
"
```

---

### 6️⃣ Conectar con el Repositorio Remoto

```bash
# Agregar el repositorio remoto (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/sistema-zarpar.git

# Verificar que se agregó correctamente
git remote -v
```

Deberías ver:
```
origin  https://github.com/TU_USUARIO/sistema-zarpar.git (fetch)
origin  https://github.com/TU_USUARIO/sistema-zarpar.git (push)
```

---

### 7️⃣ Subir al Repositorio (Push)

```bash
# Subir a la rama main
git push -u origin main
```

Si es la primera vez, puede pedirte autenticación:
- **Opción 1**: Personal Access Token (recomendado)
- **Opción 2**: GitHub Desktop
- **Opción 3**: SSH Key

---

### 8️⃣ Verificar en GitHub

1. Ve a tu repositorio en GitHub
2. Deberías ver todos los archivos
3. Verifica que el README.md se muestra correctamente
4. Confirma que `.env` NO está subido

---

## 🔐 Crear Personal Access Token (Si es necesario)

Si GitHub te pide autenticación:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Configura:
   - **Note**: "Sistema Zarpar - Local Dev"
   - **Expiration**: 90 days (o lo que prefieras)
   - **Scopes**: Selecciona `repo` (acceso completo a repositorios)
4. Click "Generate token"
5. **COPIA EL TOKEN** (solo se muestra una vez)
6. Úsalo como contraseña cuando Git te lo pida

---

## 📦 Borrar Repositorio Viejo (Si existe)

Si ya tienes un repositorio viejo y quieres empezar de cero:

### En GitHub:
1. Ve al repositorio viejo
2. Settings → Scroll hasta abajo → "Delete this repository"
3. Confirma escribiendo el nombre del repositorio

### En tu máquina:
```bash
# Si ya existe una carpeta .git, elimínala
rm -rf .git

# En Windows PowerShell:
Remove-Item -Recurse -Force .git

# Luego sigue los pasos desde "3️⃣ Inicializar Git en el Proyecto"
```

---

## 🔄 Comandos de Git para el Futuro

### Agregar Cambios Nuevos

```bash
# Ver qué archivos cambiaron
git status

# Agregar archivos específicos
git add archivo.ts

# O agregar todos los cambios
git add .

# Commit con mensaje
git commit -m "✨ Descripción del cambio"

# Subir a GitHub
git push
```

### Ver Historial

```bash
# Ver commits
git log --oneline

# Ver cambios en un archivo
git diff archivo.ts
```

### Sincronizar con GitHub

```bash
# Bajar cambios nuevos
git pull

# Subir cambios locales
git push
```

---

## 📋 Template de Mensajes de Commit

Usa emojis para mensajes claros:

```bash
# Nueva característica
git commit -m "✨ feat: Agregar sistema de ventas"

# Corrección de bug
git commit -m "🐛 fix: Corregir error al eliminar vendedor"

# Documentación
git commit -m "📝 docs: Actualizar README con nuevas características"

# Mejora de rendimiento
git commit -m "⚡ perf: Optimizar consultas SQL"

# Refactorización
git commit -m "♻️ refactor: Reorganizar estructura de componentes"

# Actualizar dependencias
git commit -m "⬆️ deps: Actualizar React a v18.3.0"
```

---

## ⚠️ IMPORTANTE: Seguridad

### ❌ NUNCA subas a GitHub:

- `.env` (credenciales de base de datos)
- `node_modules/` (paquetes se instalan con npm install)
- Backups con datos sensibles de clientes reales
- Tokens o contraseñas en el código
- Archivos de configuración con IPs o datos internos

### ✅ Siempre verifica:

```bash
# Antes de hacer commit, revisa
git status

# Antes de push, revisa commits
git log --oneline

# Si subiste algo sensible por error
git reset --soft HEAD~1  # Deshace el último commit
```

---

## 🆘 Solución de Problemas

### Error: "Repository not found"
**Solución**: Verifica que el repositorio existe y que tienes permisos.

### Error: "Authentication failed"
**Solución**: Usa Personal Access Token en vez de contraseña.

### Error: "Updates were rejected"
**Solución**:
```bash
git pull --rebase origin main
git push
```

### Error: "fatal: not a git repository"
**Solución**:
```bash
git init
git remote add origin https://github.com/TU_USUARIO/sistema-zarpar.git
```

---

## 🎉 ¡Listo!

Una vez subido el proyecto:

1. ✅ Comparte el link con tu equipo
2. ✅ Configura branch protection (opcional)
3. ✅ Agrega colaboradores si es necesario
4. ✅ Configura GitHub Actions para CI/CD (futuro)

---

## 📞 Links Útiles

- **GitHub Docs**: https://docs.github.com/
- **Git Cheat Sheet**: https://training.github.com/downloads/github-git-cheat-sheet/
- **Personal Access Tokens**: https://github.com/settings/tokens

---

**Última actualización**: 31 de Octubre, 2025  
**Versión**: 1.0.0

