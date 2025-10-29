# 🗄️ CÓMO ACCEDER A LA BASE DE DATOS

## 🎯 3 FORMAS DE VER TUS TABLAS

---

## ✅ OPCIÓN 1: TU APLICACIÓN WEB (MÁS FÁCIL) ⭐ RECOMENDADO

### Ya tienes un Database Manager integrado en tu sistema

**URL Directa:**
```
http://localhost:5679/admin/database
```

**O desde el menú:**
1. Login como `admin@zarparuy.com`
2. Sidebar → "ADMINISTRACIÓN" → "Base de Datos"

### ✨ Puedes hacer:
- 📋 Ver todas las tablas
- 👁️ Ver estructura y registros
- ✏️ Editar datos
- ➕ Crear nuevos registros
- 🗑️ Eliminar registros
- 🔧 Modificar estructura de tablas
- ➕ Crear nuevas tablas y columnas

---

## ✅ OPCIÓN 2: MYSQL WORKBENCH (PROFESIONAL)

### 1. Descargar e Instalar

**Sitio oficial:**
```
https://dev.mysql.com/downloads/workbench/
```

1. Descarga MySQL Workbench para Windows
2. Instala con las opciones por defecto

### 2. Configurar Conexión

Al abrir MySQL Workbench:

1. Click en el **"+"** al lado de "MySQL Connections"
2. Llenar estos datos:

```
Connection Name:  Zarpar Database
Hostname:         localhost
Port:             3307          ⚠️ IMPORTANTE: 3307, no 3306
Username:         root
Password:         zarpar2025
Default Schema:   zarparDataBase
```

3. Click en **"Test Connection"**
   - Debe decir: ✅ "Successfully connected to MySQL server"

4. Click en **"OK"** para guardar

### 3. Conectarse

1. Doble click en la conexión "Zarpar Database"
2. Si pide password: `zarpar2025`
3. ¡Ya estás dentro! 🎉

### 4. Ver las Tablas

**En el panel izquierdo:**
```
Schemas
└── zarparDataBase
    ├── Tables
    │   ├── clientes_maldonado
    │   ├── clientes_melo
    │   ├── clientes_pando
    │   ├── clientes_paysandu
    │   ├── clientes_rivera
    │   ├── clientes_salto
    │   ├── clientes_tacuarembo
    │   └── vendedores
    └── Views
```

### 5. Ver Contenido de una Tabla

**Opción A - Click Derecho:**
1. Click derecho en una tabla (ej: `vendedores`)
2. Selecciona: **"Select Rows - Limit 1000"**
3. ¡Verás todos los datos! 📊

**Opción B - Query Manual:**
1. Click en el icono de rayo ⚡ (New Query Tab)
2. Escribe:
   ```sql
   USE zarparDataBase;
   SELECT * FROM vendedores;
   ```
3. Presiona **Ctrl + Enter** o click en el rayo ⚡
4. Verás los resultados abajo

### 6. Editar Datos (Cuidado ⚠️)

1. Ver tabla (opción A de arriba)
2. Doble click en la celda que quieras editar
3. Cambia el valor
4. Click en **"Apply"** abajo
5. Confirma los cambios

---

## ✅ OPCIÓN 3: LÍNEA DE COMANDOS (AVANZADO)

### Conectarse por Terminal

**Abre PowerShell** y ejecuta:

```bash
mysql -h localhost -P 3307 -u root -pzarpar2025
```

**Nota:** Si dice que `mysql` no se encuentra, tienes dos opciones:

#### Opción A - Usar la ruta completa:
```bash
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h localhost -P 3307 -u root -pzarpar2025
```

#### Opción B - Si usas Docker (si instalaste MySQL en Docker):
```bash
docker exec -it zarpar-mysql mysql -u root -pzarpar2025
```

### Comandos Básicos de MySQL

Una vez conectado, verás el prompt:
```
mysql>
```

**1. Usar la base de datos:**
```sql
USE zarparDataBase;
```

**2. Ver todas las tablas:**
```sql
SHOW TABLES;
```

Resultado:
```
+---------------------------+
| Tables_in_zarparDataBase  |
+---------------------------+
| clientes_maldonado        |
| clientes_melo             |
| clientes_pando            |
| clientes_paysandu         |
| clientes_rivera           |
| clientes_salto            |
| clientes_tacuarembo       |
| vendedores                |
+---------------------------+
```

**3. Ver estructura de una tabla:**
```sql
DESCRIBE vendedores;
```

**4. Ver contenido de una tabla:**
```sql
SELECT * FROM vendedores LIMIT 10;
```

**5. Ver clientes de una sucursal:**
```sql
SELECT * FROM clientes_pando;
```

**6. Contar registros:**
```sql
SELECT COUNT(*) FROM clientes_maldonado;
```

**7. Buscar un cliente específico:**
```sql
SELECT * FROM clientes_pando WHERE nombre LIKE '%Juan%';
```

**8. Ver vendedores de una sucursal:**
```sql
SELECT * FROM vendedores WHERE sucursal = 'Pando';
```

**9. Salir de MySQL:**
```sql
exit;
```

---

## 📊 RESUMEN COMPARATIVO

| Característica | Aplicación Web | MySQL Workbench | Línea de Comandos |
|----------------|----------------|-----------------|-------------------|
| **Dificultad** | ⭐ Fácil | ⭐⭐ Media | ⭐⭐⭐ Avanzado |
| **Instalación** | ✅ Ya instalado | 📥 Descargar 100MB | ✅ Ya instalado |
| **Interfaz** | 🎨 Moderna y bonita | 🖥️ Profesional | 💻 Terminal |
| **Ver tablas** | ✅ Muy fácil | ✅ Fácil | ⌨️ Comandos |
| **Editar datos** | ✅ Click y editar | ✅ Click y editar | ⌨️ SQL manual |
| **Rapidez** | ⚡ Rápida | ⚡ Rápida | ⚡⚡ Muy rápida |
| **Para principiantes** | ✅✅✅ | ✅✅ | ❌ |
| **Para expertos** | ✅ | ✅✅✅ | ✅✅✅ |

---

## 🎓 RECOMENDACIÓN SEGÚN TU NIVEL

### 👶 Principiante (Tú ahora)
**Usa:** Tu Aplicación Web (`http://localhost:5679/admin/database`)
- Ya está lista
- Interfaz en español
- Diseñada para ser fácil
- No necesitas instalar nada

### 👨‍💻 Intermedio (Cuando aprendas más)
**Usa:** MySQL Workbench
- Más herramientas avanzadas
- Visualización de relaciones entre tablas
- Diseñador de esquemas
- Exportar/Importar datos

### 🧙‍♂️ Avanzado (En el futuro)
**Usa:** Línea de Comandos
- Automatización con scripts
- Operaciones rápidas masivas
- Backups y restauración
- Más control y velocidad

---

## ⚠️ REGLAS DE SEGURIDAD IMPORTANTES

### ❌ NUNCA HAGAS:

1. **Eliminar tablas sin backup**
   ```sql
   DROP TABLE clientes_pando;  ❌ ¡CUIDADO!
   ```

2. **Actualizar sin WHERE**
   ```sql
   UPDATE vendedores SET activo = 0;  ❌ ¡Desactiva TODOS!
   ```

3. **Eliminar sin WHERE**
   ```sql
   DELETE FROM clientes_pando;  ❌ ¡Borra TODOS!
   ```

### ✅ SIEMPRE HAZ:

1. **Usa WHERE en UPDATE/DELETE**
   ```sql
   UPDATE vendedores SET activo = 0 WHERE id = 5;  ✅ Solo uno
   ```

2. **Prueba con SELECT primero**
   ```sql
   -- Primero VE qué vas a cambiar:
   SELECT * FROM vendedores WHERE id = 5;
   
   -- Si está bien, LUEGO actualiza:
   UPDATE vendedores SET activo = 0 WHERE id = 5;
   ```

3. **Haz backups antes de cambios grandes**
   - Usa tu aplicación: `/admin/database`
   - O exporta desde MySQL Workbench

---

## 🚀 INICIO RÁPIDO - 3 PASOS

1. **Abre tu navegador**
   ```
   http://localhost:5679/admin/database
   ```

2. **Selecciona una tabla** (ej: `vendedores`)

3. **¡Explora!**
   - Ver datos
   - Buscar
   - Editar
   - Crear nuevos

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "No puedo conectarme a la base de datos"

1. Verifica que MySQL esté corriendo:
   - Mira los logs de tu terminal
   - Debe decir: ✅ "Conexión exitosa a MySQL"

2. Verifica el puerto:
   - Debe ser: **3307** (no 3306)

3. Verifica las credenciales:
   ```
   Host: localhost
   Puerto: 3307
   Usuario: root
   Contraseña: zarpar2025
   ```

### "No veo las tablas"

1. Asegúrate de estar en la base de datos correcta:
   ```sql
   USE zarparDataBase;
   SHOW TABLES;
   ```

2. Si no hay tablas, revisar los scripts SQL en:
   ```
   database/schema_zarpar_pos.sql
   database/add_authentication.sql
   ```

---

## 📚 RECURSOS ADICIONALES

### Tutoriales SQL Básicos:
- https://www.w3schools.com/sql/
- https://sqlbolt.com/ (Interactivo)

### Documentación Oficial:
- MySQL: https://dev.mysql.com/doc/
- MySQL Workbench: https://dev.mysql.com/doc/workbench/en/

---

**¡Ya sabes 3 formas de acceder a tu base de datos!** 🎉

**Recomendación:** Empieza con tu aplicación web, es la más fácil y visual.

**Última actualización:** Octubre 28, 2025

