# 📋 PLAN DE DEPURACIÓN PROFESIONAL - Sistema Zarpar

**Objetivo**: Dejar el proyecto 100% limpio, sin rutas inválidas, tablas no utilizadas, ni código muerto antes de entregar a programador experimentado.

---

## 🔍 ANÁLISIS PRELIMINAR

### 1. Archivos de Documentación Temporales (Root)
**Total encontrados**: ~60+ archivos `.md`

**A ELIMINAR** (documentación de desarrollo temporal):
- [ ] ANALISIS_ESTRUCTURA_PRODUCTOS_Y_STOCK.md
- [ ] AUDITORIA_ENCODING_COMPLETA.md
- [ ] CAMBIOS_GESTIONAR_PRECIOS_STOCK.md
- [ ] CAMBIOS_TRANSFER_TX.md
- [ ] COMO_ACCEDER_BASE_DE_DATOS.md
- [ ] COMO_FUNCIONA_CURSORRULES.md
- [ ] COMO_FUNCIONA_PRODUCTOS_EXPLICACION_VISUAL.md
- [ ] CONTEXTO_AGENTE.md (OBSOLETO, usar `.cursorrules`)
- [ ] CONTROL_PERMISOS_PRODUCTOS_IMPLEMENTADO.md
- [ ] CORRECCION_***.md (todos)
- [ ] EJEMPLOS_TRANSFERENCIAS.md
- [ ] ELIMINACION_CAMPO_DESCRIPCION.md
- [ ] ESTADO_IMPLEMENTACION.md
- [ ] ETIQUETAS_STOCK_VISUAL.md
- [ ] EXPLICACION_VALORES_STOCK.md
- [ ] FILTROS_MODAL_GESTION_PRECIOS.md
- [ ] FIX_***.md (todos)
- [ ] FUNCIONAMIENTO_POS_ROLES.md
- [ ] GARANTIA_EN_CAMINO.md
- [ ] GITHUB_SETUP.md
- [ ] IMPLEMENTACION_***.md (todos)
- [ ] INDICADOR_STOCK_EN_TRANSITO.md
- [ ] INSTRUCCIONES_***.md (todos menos finales)
- [ ] LIMPIEZA_PROYECTO.md
- [ ] MEJORA_***.md (todos)
- [ ] MODAL_EDITABLE_TRANSFERENCIAS.md
- [ ] PLAN_SISTEMA_TRANSFERENCIAS.md
- [ ] PROGRESO_TRANSFERENCIAS_FASE1.md
- [ ] PRUEBAS_Y_VERIFICACION_COMPLETA.md
- [ ] REPORTE_***.md (todos)
- [ ] RESUMEN_***.md (todos)
- [ ] REUBICACION_BOTON_GESTION.md
- [ ] SISTEMA_***.md (todos menos arquitectura principal)
- [ ] SOLUCION_***.md (todos)
- [ ] SUCURSALES_CON_ESPACIOS.md
- [ ] USUARIOS_Y_CONTRASEÑAS.md
- [ ] VERIFICACION_***.md (todos)

**A CONSERVAR** (documentación oficial):
- [x] README.md
- [x] CHANGELOG.md
- [x] .cursorrules (Instrucciones IA actualizadas)
- [x] GUIA_DEPLOYMENT_PRODUCCION.md
- [x] CHECKLIST_DEPLOYMENT.md
- [x] COMPARACION_COSTOS_HOSTING.md

---

### 2. Archivos Temporales/Prueba (Root)
**A ELIMINAR**:
- [ ] test-tipo-columna.html
- [ ] server_logs.txt
- [ ] nodemon.json (si no se usa)
- [ ] tsconfig.tsbuildinfo
- [ ] START-SAFE.bat (redundante)

**A CONSERVAR**:
- [x] START.bat
- [x] start-backend.ps1
- [x] start-frontend.ps1

---

### 3. Archivos SQL de Base de Datos
**Directorio**: `database/`

**A ELIMINAR** (scripts de desarrollo/prueba):
- [ ] actualizar_stock_100.sql
- [ ] add_authentication.sql
- [ ] add_calidades.sql
- [ ] add_categorias_productos.sql
- [ ] agregar_campo_cobra_comisiones.sql
- [ ] agregar_columna_recibidos_recientes.sql
- [ ] agregar_productos_sanisidro.sql
- [ ] agregar_tipo_movimiento_devolucion.sql
- [ ] asignar_precios_sucursales.sql
- [ ] FIX_ALL_ENCODING_MAESTRO.sql
- [ ] fix_all_tipos.sql
- [ ] fix_calidad_column.sql
- [ ] fix_encoding_productos.sql
- [ ] fix_foreign_keys_sucursales.sql
- [ ] fix_nombres_productos.sql
- [ ] fix_productos_sucursal.sql
- [ ] fix_sucursales_nombres.sql
- [ ] insert_test_data.sql
- [ ] insertar_lista_completa_15_paginas.sql
- [ ] insertar_productos_lista_precios.sql
- [ ] insertar_productos_simple.sql
- [ ] insertar_todos_productos_huawei.sql
- [ ] limpiar_stock_en_transito.sql
- [ ] mejorar_sistema_comisiones_por_vendedor.sql
- [ ] poblar_historial_stock_inicial.sql
- [ ] remove_descripcion.sql
- [ ] reset_passwords.sql
- [ ] test_sistema_dinamico.sql
- [ ] update-apellidos.sql
- [ ] verificacion_sistema_dinamico.sql
- [ ] verificar_datos_corruptos.sql

**BACKUPS ANTIGUOS** (conservar solo el más reciente):
- [ ] backup_completo_20251031_101942.sql (ELIMINAR - antiguo)
- [ ] backup_completo_zarpar.sql (ELIMINAR - redundante)
- [ ] backup_limpio_sin_cuenta_corriente_20251103_204112.sql (ELIMINAR)
- [ ] backup_limpio_sin_ventas_20251103_205226.sql (ELIMINAR)
- [x] backup_completo.sql (CONSERVAR - más reciente y completo)

**A CONSERVAR** (esquemas y configuración esencial):
- [x] backup_completo.sql
- [x] schema.sql
- [x] schema_productos.sql
- [x] schema_zarpar_pos.sql
- [x] configurar_sucursal_principal.sql
- [x] crear_sistema_caja.sql
- [x] crear_sistema_comisiones.sql
- [x] crear_tabla_historial_stock.sql
- [x] create_new_tables.sql
- [x] create_ventas_system.sql

**MIGRATIONS** (revisar si alguna está duplicada):
- migrations/001_create_transferencias.sql (puede estar duplicada)
- migrations/001_create_transferencias_fixed.sql
- migrations/002_add_sucursal_principal.sql

---

### 4. Rutas y Controladores del Backend
**Directorio**: `api/`

**REVISAR SI SE USAN**:
- [ ] `carritoTransferencias` - ¿Se usa en frontend?
- [ ] `descuentos` - Verificar uso real
- [ ] `historialStock` - Verificar si se usa actualmente

**POSIBLES TABLAS DE BD NO UTILIZADAS**:
(Pendiente de verificación en base de datos)

---

### 5. Componentes Frontend
**Directorio**: `src/`

**A REVISAR**:
- [ ] Componentes no referenciados
- [ ] Páginas no ruteadas
- [ ] Imports no utilizados
- [ ] Archivos de utilidades duplicados

---

### 6. Scripts de Soporte
**Directorio**: `scripts/`

**A REVISAR**:
- Verificar qué scripts existen
- Eliminar scripts de prueba/desarrollo

---

## 📝 PLAN DE EJECUCIÓN

### Fase 1: Limpieza de Documentación (10 min)
1. Eliminar ~50 archivos .md temporales
2. Conservar solo documentación oficial

### Fase 2: Limpieza de Base de Datos (15 min)
1. Eliminar scripts SQL temporales/antiguos
2. Conservar solo 1 backup principal
3. Mantener esquemas y migraciones esenciales

### Fase 3: Auditoría de Código Backend (20 min)
1. Verificar uso de carritoTransferencias
2. Confirmar uso de descuentos
3. Verificar tablas de BD no utilizadas
4. Eliminar controladores/rutas no usados

### Fase 4: Auditoría de Código Frontend (15 min)
1. Verificar componentes huérfanos
2. Limpiar imports no utilizados
3. Eliminar páginas no ruteadas

### Fase 5: Limpieza de Archivos Temporales (5 min)
1. Eliminar logs
2. Eliminar archivos de prueba HTML
3. Eliminar builds antiguos

### Fase 6: Verificación Funcional (15 min)
1. Levantar backend
2. Levantar frontend
3. Probar módulos principales
4. Confirmar que nada se rompió

### Fase 7: Commit Final (5 min)
1. Git add de cambios
2. Commit profesional
3. Push a repositorio

---

## ⏱️ TIEMPO ESTIMADO TOTAL
**85 minutos (~1.5 horas)**

---

## ✅ CRITERIOS DE ÉXITO
- [ ] Proyecto sin archivos de desarrollo/temporal
- [ ] Solo documentación oficial
- [ ] Solo 1 backup principal de BD
- [ ] Solo scripts SQL esenciales
- [ ] Código backend sin rutas muertas
- [ ] Código frontend sin componentes huérfanos
- [ ] TODO funciona después de la limpieza
- [ ] Listo para entregar a programador experto

---

**Estado**: En progreso
**Fecha**: 13 de Noviembre, 2025

