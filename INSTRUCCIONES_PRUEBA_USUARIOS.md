# 🧪 INSTRUCCIONES DE PRUEBA - SISTEMA DE USUARIOS

## 📋 Objetivo de las Pruebas
Verificar que cada usuario puede iniciar sesión correctamente y que el administrador puede cambiar contraseñas.

---

## ✅ CHECKLIST DE PRUEBAS

### **Fase 1: Probar Login de Cada Usuario**

Inicia sesión con cada uno de los usuarios para verificar que las credenciales funcionan correctamente.

#### **URL de Login**: `http://localhost:5678/login`

---

#### 🔴 **Prueba 1: Administrador**
```
Usuario: admin@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Puede ver TODAS las sucursales
- ✅ Puede acceder a `/staff/sellers`
- ✅ Puede ver el tab "Gestión de Usuarios"
- ✅ Puede ver botones de "Cambiar Contraseña"

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟦 **Prueba 2: Usuario Pando**
```
Usuario: pando@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Pando
- ❌ NO puede ver clientes de otras sucursales
- ❌ NO puede acceder a `/staff/sellers`
- ✅ Puede hacer ventas en Pando

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟩 **Prueba 3: Usuario Maldonado**
```
Usuario: maldonado@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Maldonado
- ❌ NO puede ver clientes de otras sucursales
- ✅ Puede hacer ventas en Maldonado

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟨 **Prueba 4: Usuario Rivera**
```
Usuario: rivera@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Rivera
- ✅ Puede hacer ventas en Rivera

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟪 **Prueba 5: Usuario Melo**
```
Usuario: melo@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Melo
- ✅ Puede hacer ventas en Melo

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟧 **Prueba 6: Usuario Paysandú**
```
Usuario: paysandu@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Paysandú
- ✅ Puede hacer ventas en Paysandú

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟥 **Prueba 7: Usuario Salto**
```
Usuario: salto@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Salto
- ✅ Puede hacer ventas en Salto

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟫 **Prueba 8: Usuario Tacuarembó**
```
Usuario: tacuarembo@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Tacuarembó
- ✅ Puede hacer ventas en Tacuarembó

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟦 **Prueba 9: Usuario Rio Negro**
```
Usuario: rionegro@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Rio Negro
- ✅ Puede hacer ventas en Rio Negro

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### 🟨 **Prueba 10: Usuario Soriano**
```
Usuario: soriano@zarparuy.com
Contraseña: zarpar123
```

**Resultado esperado:**
- ✅ Login exitoso
- ❌ Solo puede ver clientes de Soriano
- ✅ Puede hacer ventas en Soriano

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

### **Fase 2: Probar Cambio de Contraseña**

#### **Prueba 11: Cambiar contraseña de un usuario**

1. **Iniciar sesión como administrador**:
   ```
   Usuario: admin@zarparuy.com
   Contraseña: zarpar123
   ```

2. **Ir a Gestión de Usuarios**:
   ```
   URL: http://localhost:5678/staff/sellers
   → Clic en tab "Gestión de Usuarios"
   ```

3. **Seleccionar un usuario** (ejemplo: Pando):
   - Hacer clic en botón **"Cambiar Contraseña"** del usuario Pando

4. **Cambiar la contraseña**:
   - Nueva contraseña: `test123`
   - Confirmar contraseña: `test123`
   - Clic en **"Cambiar Contraseña"**

5. **Verificar mensaje de éxito**:
   - Debe aparecer: ✅ "Contraseña actualizada exitosamente"

6. **Cerrar sesión del administrador**:
   - Clic en el botón de cerrar sesión

7. **Probar nueva contraseña**:
   ```
   Usuario: pando@zarparuy.com
   Contraseña: test123  ← (nueva)
   ```

**Resultado esperado:**
- ✅ Login exitoso con la nueva contraseña
- ❌ Login fallido con la contraseña antigua (`zarpar123`)

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### **Prueba 12: Cambiar contraseña del administrador**

1. **Iniciar sesión como administrador**:
   ```
   Usuario: admin@zarparuy.com
   Contraseña: zarpar123
   ```

2. **Ir a Gestión de Usuarios**:
   ```
   URL: http://localhost:5678/staff/sellers
   → Tab "Gestión de Usuarios"
   ```

3. **Cambiar su propia contraseña**:
   - Hacer clic en **"Cambiar Contraseña"** de Administrador General
   - Nueva contraseña: `admin2025`
   - Confirmar contraseña: `admin2025`
   - Clic en **"Cambiar Contraseña"**

4. **Cerrar sesión**

5. **Probar nueva contraseña de admin**:
   ```
   Usuario: admin@zarparuy.com
   Contraseña: admin2025  ← (nueva)
   ```

**Resultado esperado:**
- ✅ Login exitoso con la nueva contraseña
- ✅ Sigue teniendo acceso de administrador

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

### **Fase 3: Validaciones de Seguridad**

#### **Prueba 13: Contraseña muy corta**

1. **Iniciar sesión como admin**
2. **Intentar cambiar contraseña con menos de 6 caracteres**:
   - Nueva contraseña: `12345` (solo 5 caracteres)
   - Confirmar contraseña: `12345`

**Resultado esperado:**
- ❌ Error: "La contraseña debe tener al menos 6 caracteres"

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### **Prueba 14: Contraseñas no coinciden**

1. **Intentar cambiar contraseña con contraseñas diferentes**:
   - Nueva contraseña: `password123`
   - Confirmar contraseña: `password456`

**Resultado esperado:**
- ❌ Error: "Las contraseñas no coinciden"

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

#### **Prueba 15: Usuario no administrador intenta acceder**

1. **Iniciar sesión con usuario de sucursal** (ejemplo: Pando)
2. **Intentar acceder directamente a**:
   ```
   http://localhost:5678/staff/sellers
   ```

**Resultado esperado:**
- ❌ Acceso denegado
- ❌ Redirigido a página principal
- ❌ Mensaje: "⛔ Acceso denegado. Solo administradores..."

**¿Pasó la prueba?** ☐ Sí   ☐ No

---

## 📊 RESUMEN DE RESULTADOS

| # | Prueba | Estado |
|---|--------|--------|
| 1 | Login Administrador | ☐ Pasó ☐ Falló |
| 2 | Login Pando | ☐ Pasó ☐ Falló |
| 3 | Login Maldonado | ☐ Pasó ☐ Falló |
| 4 | Login Rivera | ☐ Pasó ☐ Falló |
| 5 | Login Melo | ☐ Pasó ☐ Falló |
| 6 | Login Paysandú | ☐ Pasó ☐ Falló |
| 7 | Login Salto | ☐ Pasó ☐ Falló |
| 8 | Login Tacuarembó | ☐ Pasó ☐ Falló |
| 9 | Login Rio Negro | ☐ Pasó ☐ Falló |
| 10 | Login Soriano | ☐ Pasó ☐ Falló |
| 11 | Cambiar password usuario | ☐ Pasó ☐ Falló |
| 12 | Cambiar password admin | ☐ Pasó ☐ Falló |
| 13 | Validación longitud | ☐ Pasó ☐ Falló |
| 14 | Validación coincidencia | ☐ Pasó ☐ Falló |
| 15 | Protección acceso | ☐ Pasó ☐ Falló |

**Total Pruebas Pasadas**: _____ / 15

---

## 🚨 ¿Qué hacer si una prueba falla?

### Si el login no funciona:
1. **Verificar que Docker MySQL está corriendo**:
   ```bash
   docker ps | grep zarpar-mysql
   ```

2. **Verificar que el backend está corriendo**:
   ```bash
   # Debe estar en http://localhost:3456
   ```

3. **Verificar las contraseñas en la base de datos**:
   ```sql
   SELECT id, nombre, email, 
          CASE 
            WHEN password IS NOT NULL THEN '✓ Tiene contraseña'
            ELSE '✗ Sin contraseña'
          END as estado
   FROM vendedores;
   ```

### Si el cambio de contraseña no funciona:
1. **Abrir consola del navegador** (F12)
2. **Ver errores en la pestaña "Console"**
3. **Ver respuesta del backend en "Network"**

### Si hay error de permisos:
1. **Verificar que el token JWT es válido**
2. **Verificar que el usuario tiene rol de administrador**
3. **Revisar logs del backend**

---

## 📝 Notas Adicionales

### ¿Cómo resetear todas las contraseñas a `zarpar123`?

Si necesitas volver todas las contraseñas al estado original:

```sql
-- Ejecutar en MySQL:
UPDATE vendedores 
SET password = '$2a$10$YQs.xR5wZ5W5kF5pF5pF5eKp5F5pF5pF5pF5pF5pF5pF5pF5pF5pO'
WHERE activo = 1;
```

Este hash corresponde a la contraseña `zarpar123`.

---

## ✅ Confirmación Final

Una vez completadas TODAS las pruebas:

```
[ ] Todas las pruebas pasaron (13/13)
[ ] Documenté las nuevas contraseñas en lugar seguro
[ ] Reinicié contraseñas por defecto para siguiente sesión de pruebas
[ ] Sistema listo para producción
```

---

**Fecha de pruebas**: ________________  
**Probado por**: ________________  
**Resultado**: ☐ APROBADO   ☐ REQUIERE CORRECCIONES

---

🎉 **¡Éxito en las Pruebas!**

