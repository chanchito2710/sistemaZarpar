# 🔐 USUARIOS Y CONTRASEÑAS DEL SISTEMA ZARPAR

## 📋 Lista Completa de Usuarios

### 👑 **ADMINISTRADOR (Acceso Total)**

| Usuario | Contraseña | Sucursal | Permisos |
|---------|------------|----------|----------|
| **admin@zarparuy.com** | `zarpar123` | Administración | ✅ Acceso a TODAS las sucursales<br>✅ Gestión completa de productos<br>✅ Gestión de vendedores<br>✅ Reportes globales<br>✅ Configuración del sistema |

---

### 🏢 **USUARIOS POR SUCURSAL (Acceso Limitado)**

| Sucursal | Usuario | Contraseña | Permisos |
|----------|---------|------------|----------|
| **Pando** | pando@zarparuy.com | `zarpar123` | ❌ Solo sucursal Pando<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Pando<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Maldonado** | maldonado@zarparuy.com | `zarpar123` | ❌ Solo sucursal Maldonado<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Maldonado<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Rivera** | rivera@zarparuy.com | `zarpar123` | ❌ Solo sucursal Rivera<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Rivera<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Melo** | melo@zarparuy.com | `zarpar123` | ❌ Solo sucursal Melo<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Melo<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Paysandú** | paysandu@zarparuy.com | `zarpar123` | ❌ Solo sucursal Paysandú<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Paysandú<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Salto** | salto@zarparuy.com | `zarpar123` | ❌ Solo sucursal Salto<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Salto<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Tacuarembó** | tacuarembo@zarparuy.com | `zarpar123` | ❌ Solo sucursal Tacuarembó<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Tacuarembó<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Rio Negro** | rionegro@zarparuy.com | `zarpar123` | ❌ Solo sucursal Rio Negro<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Rio Negro<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |
| **Soriano** | soriano@zarparuy.com | `zarpar123` | ❌ Solo sucursal Soriano<br>👁️ Ver productos (solo lectura)<br>✅ Gestionar clientes de Soriano<br>✅ Realizar ventas<br>✅ Gestionar cuenta corriente |

---

## 🔑 Contraseña Por Defecto

**TODOS los usuarios tienen la misma contraseña por defecto:**
```
zarpar123
```

⚠️ **IMPORTANTE**: Se recomienda cambiar las contraseñas después del primer login.

---

## 🌐 URL de Login

```
http://localhost:5678/login
```

---

## 📝 Notas de Seguridad

1. ✅ Las contraseñas están encriptadas con **bcrypt** (hash seguro)
2. ✅ Las contraseñas NO se almacenan en texto plano
3. ✅ El sistema usa **JWT** (JSON Web Tokens) para autenticación
4. ⚠️ Cambia las contraseñas por defecto en producción
5. 🔒 Los usuarios de sucursal NO pueden acceder a otras sucursales
6. 👑 Solo el administrador tiene acceso total

---

## 🧪 Pruebas de Login

### Probar Administrador:
```
Usuario: admin@zarparuy.com
Contraseña: zarpar123
```
**Resultado esperado**: Acceso a todas las sucursales y funcionalidades completas.

### Probar Sucursal (ejemplo Pando):
```
Usuario: pando@zarparuy.com
Contraseña: zarpar123
```
**Resultado esperado**: Acceso solo a clientes y ventas de Pando.

---

## 🔄 Cambiar Contraseñas

Las contraseñas se pueden cambiar desde:
```
http://localhost:5678/staff/sellers
→ Tab "Gestión de Usuarios"
```

Solo el **administrador** puede cambiar contraseñas de todos los usuarios.

---

**Última actualización**: 12 de Noviembre, 2025  
**Sistema**: Zarpar POS v3.0.0

