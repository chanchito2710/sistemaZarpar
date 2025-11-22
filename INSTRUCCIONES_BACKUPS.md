# 🗄️ SISTEMA DE BACKUPS - INSTRUCCIONES DE USO

## ✅ IMPLEMENTACIÓN COMPLETADA

El sistema de backups automáticos y manuales está **100% funcional**.

---

## 🚀 CÓMO USAR

### 1️⃣ Acceder al Sistema de Backups

1. Inicia sesión como **administrador**:
   - Email: `admin@zarparuy.com`
   - Contraseña: `admin123`

2. Ve a la página: **http://localhost:5678/admin/database**

3. Haz click en la pestaña **"Backups del Sistema"**

---

### 2️⃣ Crear Backup Manual

#### **Opción A: Backup Rápido (Sin nombre)**

1. Click en el botón verde grande: **🟢 BACKUP DEL SISTEMA**
2. Dejar los campos vacíos
3. Click en **"🟢 Crear Backup"**
4. ✅ Listo - Backup creado en ~10-30 segundos

#### **Opción B: Backup con Nombre y Nota**

1. Click en **🟢 BACKUP DEL SISTEMA**
2. Llenar los campos:
   - **Nombre:** Ej: "Antes de actualizar precios"
   - **Nota:** Ej: "Backup preventivo antes de modificar productos importados"
3. Click en **"🟢 Crear Backup"**
4. ✅ El backup aparecerá en la lista con tu nombre y nota

---

### 3️⃣ Restaurar un Backup

⚠️ **ADVERTENCIA:** Esto sobrescribirá TODOS los datos actuales.

1. En la lista de backups, busca el que quieres restaurar
2. Click en el botón **"Restaurar"**
3. Lee la advertencia cuidadosamente
4. Si estás seguro, click en **"SÍ, RESTAURAR"**
5. Espera 10-30 segundos
6. ✅ La página se recargará automáticamente

**Recomendación:** Hacer un backup manual antes de restaurar otro.

---

### 4️⃣ Descargar un Backup

1. En la lista de backups, click en **"Descargar"**
2. El archivo `.sql` se descargará a tu computadora
3. Puedes guardar este archivo en un lugar seguro

**Uso:** Tienes una copia local por si algo falla.

---

### 5️⃣ Eliminar un Backup

⚠️ No puedes eliminar el último backup disponible.

1. En la lista de backups, click en **"Eliminar"**
2. Confirma la acción
3. ✅ El backup se elimina permanentemente

**Nota:** Los backups > 7 días se eliminan automáticamente.

---

## 🤖 BACKUPS AUTOMÁTICOS

### ¿Cuándo se ejecutan?

- **Todos los días a las 3:00 AM** (hora de Uruguay)
- Se ejecutan automáticamente sin intervención
- No necesitas hacer nada

### ¿Qué incluyen?

- ✅ Todas las tablas de la base de datos
- ✅ Toda la estructura (schema)
- ✅ Todos los datos (registros)
- ✅ Triggers y rutinas
- ✅ Charset UTF-8 correcto

### ¿Dónde se guardan?

- **Carpeta:** `backups/` en tu proyecto
- **Base de datos:** Metadata en tabla `backups_metadata`
- **Logs:** Tabla `backup_logs`

---

## 📊 ESTADÍSTICAS

En la parte superior de la página de Backups verás:

- **Tamaño Base de Datos:** Tamaño actual de tu BD
- **Total Backups:** Cantidad de backups disponibles
- **Último Backup:** Cuándo fue el último
- **Próximo Automático:** Cuándo será el próximo (3:00 AM)

---

## 🔐 SEGURIDAD

### ✅ Características de Seguridad:

1. **Solo administrador** puede acceder
2. **Confirmación doble** antes de restaurar
3. **Logs de auditoría** de todas las acciones
4. **No se suben a Git** (están en `.gitignore`)
5. **Encoding UTF-8** correcto
6. **Validación de permisos** en backend

### ⚠️ Restricciones:

- No puedes eliminar el último backup
- Máximo 7 días de retención
- Solo admin tiene acceso
- Restaurar requiere confirmación explícita

---

## 📋 POLÍTICA DE RETENCIÓN (7 DÍAS)

```
Día 1 → Backup A (más reciente)
Día 2 → Backup B
Día 3 → Backup C
Día 4 → Backup D
Día 5 → Backup E
Día 6 → Backup F
Día 7 → Backup G
Día 8 → Backup A se elimina automáticamente
```

**Siempre tendrás los últimos 7 días disponibles.**

---

## 🛠️ PRUEBAS RECOMENDADAS

### Prueba 1: Crear Backup Manual

1. Ve a `/admin/database` → Tab "Backups del Sistema"
2. Click en "🟢 BACKUP DEL SISTEMA"
3. Nombre: "Prueba de backup manual"
4. Nota: "Esta es una prueba del sistema"
5. Crear
6. ✅ Debería aparecer en la lista

### Prueba 2: Descargar Backup

1. Click en "Descargar" del backup que creaste
2. ✅ Se debe descargar un archivo `.sql`
3. Abrir con editor de texto
4. ✅ Debería contener SQL válido

### Prueba 3: Ver Estadísticas

1. Verificar que las estadísticas muestran datos correctos
2. ✅ Total backups debe ser >= 1
3. ✅ Tamaño BD debe mostrar MB
4. ✅ Próximo automático debe decir "03:00"

### Prueba 4: Esperar Backup Automático

1. Esperar hasta las 3:00 AM
2. Al día siguiente, verificar que hay un backup nuevo
3. ✅ Debe decir "🤖 Automático"
4. ✅ Nota debe decir "Backup automático programado"

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "No hay backups disponibles"

**Causa:** Es la primera vez que usas el sistema

**Solución:** Crear tu primer backup manual

### Error: "Error al crear backup"

**Causa:** Permisos insuficientes o MySQL no disponible

**Solución:**
1. Verificar que Docker está corriendo: `docker ps`
2. Verificar que MySQL está activo: `docker logs zarpar-mysql`
3. Reiniciar MySQL: `docker restart zarpar-mysql`

### Error: "No puedes eliminar el último backup"

**Causa:** Estás intentando eliminar el único backup

**Solución:** Crear otro backup antes de eliminar

### Los backups automáticos no se crean

**Causa:** El servidor no está corriendo a las 3 AM

**Solución:**
- Dejar el servidor corriendo (Railway está siempre corriendo)
- Verificar logs del cron: Ver consola del backend
- Verificar tabla `backup_logs` para errores

---

## 📞 COMANDOS ÚTILES

### Ver logs del cron (Backend)

Los logs aparecen en la terminal donde corre `npm run dev:api`:

```
⏰ Cron activado - Iniciando backup automático...
🔄 Iniciando backup automático...
✅ Backup automático creado: backup_auto_2025-11-22T03-00-00.sql (15.2 MB)
```

### Verificar backups en la base de datos

```sql
-- Ver todos los backups
SELECT * FROM backups_metadata ORDER BY created_at DESC;

-- Ver logs de acciones
SELECT * FROM backup_logs ORDER BY created_at DESC LIMIT 10;
```

### Restaurar backup desde terminal (si falla la interfaz)

```bash
# Docker local
docker exec -i zarpar-mysql mysql -u root -pzarpar2025 --default-character-set=utf8mb4 zarparDataBase < backups/backup_FECHA.sql

# Railway
railway run mysql -u root -p[PASSWORD] [DATABASE] < backups/backup_FECHA.sql
```

---

## 🎯 CHECKLIST DE FUNCIONALIDADES

### Backend:
```
✅ Servicio de backups (backupService.ts)
✅ Controlador de backups (backupController.ts)
✅ Rutas protegidas (/api/backups)
✅ Cron job automático (3:00 AM)
✅ Limpieza automática (> 7 días)
✅ Logs de auditoría
✅ Validación de permisos
```

### Frontend:
```
✅ Componente BackupsManager
✅ Integración con DatabaseManager
✅ Botón verde "BACKUP DEL SISTEMA"
✅ Modal para crear backup
✅ Lista de backups con acciones
✅ Estadísticas en tiempo real
✅ Confirmación doble para restaurar
✅ Descarga de backups
✅ Eliminación con validación
```

### Base de Datos:
```
✅ Tabla backups_metadata
✅ Tabla backup_logs
✅ Migración ejecutada
✅ Índices creados
✅ Foreign keys configuradas
```

---

## 📈 MEJORAS FUTURAS (Opcionales)

1. **Notificaciones por Email:**
   - Enviar email cuando un backup automático falla
   - Enviar email cuando se restaura un backup

2. **Backup a la Nube:**
   - Subir backups automáticamente a AWS S3 o Google Cloud Storage
   - Mantener backups por más de 7 días en la nube

3. **Compresión:**
   - Comprimir backups con gzip para ahorrar espacio
   - Descomprimir automáticamente al restaurar

4. **Backups Incrementales:**
   - Solo guardar cambios desde el último backup
   - Ahorrar espacio en disco

---

**Sistema implementado el:** 22/11/2025  
**Versión:** 1.0.0  
**Estado:** ✅ Funcionando correctamente

---

## 🎉 ¡SISTEMA LISTO PARA USAR!

Tu sistema de backups está completamente configurado y funcionando.

**Próximos pasos:**
1. Prueba crear un backup manual
2. Verifica las estadísticas
3. Espera hasta mañana para ver el backup automático
4. Familiarízate con la interfaz

**¿Dudas?** Revisa este documento o los logs del sistema.

