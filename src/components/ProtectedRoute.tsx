/**
 * ====================================================
 * COMPONENTE: ProtectedRoute
 * Protección de Rutas - Sistema de Seguridad
 * ====================================================
 * 
 * Este componente protege rutas que requieren autenticación
 * y/o permisos específicos
 * 
 * USO:
 * <Route path="/ruta" element={
 *   <ProtectedRoute requireAdmin={false}>
 *     <MiComponente />
 *   </ProtectedRoute>
 * } />
 * 
 * ====================================================
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermisos?: string[];
  excludeRoles?: string[]; // Roles que NO pueden acceder
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requirePermisos = [],
  excludeRoles = [],
  redirectTo = '/login'
}) => {
  const { usuario, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // ========================================
  // 1. LOADING: Verificando autenticación
  // ========================================
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
          size="large" 
        />
        <p style={{ color: '#666', marginTop: 16 }}>
          Verificando autenticación...
        </p>
      </div>
    );
  }

  // ========================================
  // 2. NO AUTENTICADO: Redirigir a login
  // ========================================
  if (!isAuthenticated || !usuario) {
    console.warn('🚫 Acceso denegado: Usuario no autenticado');
    console.warn(`   Ruta solicitada: ${location.pathname}`);
    console.warn(`   Redirigiendo a: ${redirectTo}`);
    
    // Guardar la ruta a la que intentaba acceder
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // ========================================
  // 3. VERIFICAR ROLES EXCLUIDOS
  // ========================================
  if (excludeRoles.length > 0 && usuario.cargo) {
    const cargoUsuario = usuario.cargo.toLowerCase();
    const esRolExcluido = excludeRoles.some(rol => rol.toLowerCase() === cargoUsuario);
    
    if (esRolExcluido) {
      console.warn('🚫 Acceso denegado: Rol excluido');
      console.warn(`   Usuario: ${usuario.email}`);
      console.warn(`   Cargo: ${usuario.cargo}`);
      console.warn(`   Ruta: ${location.pathname}`);
      
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          padding: 24
        }}>
          <Result
            status="403"
            icon={<LockOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
            title={<span style={{ fontSize: 24, fontWeight: 600 }}>Acceso Restringido</span>}
            subTitle={
              <div style={{ fontSize: 16, color: '#666', marginTop: 16 }}>
                <p style={{ margin: 0 }}>
                  Esta página no está disponible para tu rol actual.
                </p>
                <p style={{ margin: '8px 0 0 0' }}>
                  Tu cuenta (<strong>{usuario.email}</strong>) con rol de <strong>{usuario.cargo}</strong> no tiene acceso a este recurso.
                </p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="dashboard" 
                onClick={() => window.location.href = '/'}
                size="large"
              >
                Volver al Dashboard
              </Button>,
              <Button 
                key="back" 
                onClick={() => window.history.back()}
                size="large"
              >
                Regresar
              </Button>
            ]}
            style={{
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              padding: '48px 24px'
            }}
          />
        </div>
      );
    }
  }

  // ========================================
  // 4. VERIFICAR PERMISO DE ADMIN
  // ========================================
  if (requireAdmin && !usuario.esAdmin) {
    console.warn('🚫 Acceso denegado: Requiere permisos de administrador');
    console.warn(`   Usuario: ${usuario.email}`);
    console.warn(`   Cargo: ${usuario.cargo}`);
    console.warn(`   Ruta: ${location.pathname}`);
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        padding: 24
      }}>
        <Result
          status="403"
          icon={<LockOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
          title={<span style={{ fontSize: 24, fontWeight: 600 }}>Acceso Denegado</span>}
          subTitle={
            <div style={{ fontSize: 16, color: '#666', marginTop: 16 }}>
              <p style={{ margin: 0 }}>
                Esta página requiere permisos de <strong>Administrador</strong>.
              </p>
              <p style={{ margin: '8px 0 0 0' }}>
                Tu cuenta actual (<strong>{usuario.email}</strong>) no tiene acceso a este recurso.
              </p>
            </div>
          }
          extra={[
            <Button 
              type="primary" 
              key="dashboard" 
              onClick={() => window.location.href = '/'}
              size="large"
            >
              Volver al Dashboard
            </Button>,
            <Button 
              key="back" 
              onClick={() => window.history.back()}
              size="large"
            >
              Regresar
            </Button>
          ]}
          style={{
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '48px 24px'
          }}
        />
      </div>
    );
  }

  // ========================================
  // 5. VERIFICAR PERMISOS ESPECÍFICOS
  // ========================================
  if (requirePermisos.length > 0) {
    const tienePermisos = requirePermisos.every(permiso => {
      // @ts-ignore - Acceso dinámico a permisos
      return usuario.permisos?.[permiso] === true;
    });

    if (!tienePermisos) {
      console.warn('🚫 Acceso denegado: Permisos insuficientes');
      console.warn(`   Usuario: ${usuario.email}`);
      console.warn(`   Permisos requeridos: ${requirePermisos.join(', ')}`);
      console.warn(`   Ruta: ${location.pathname}`);
      
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          padding: 24
        }}>
          <Result
            status="403"
            icon={<LockOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />}
            title={<span style={{ fontSize: 24, fontWeight: 600 }}>Permisos Insuficientes</span>}
            subTitle={
              <div style={{ fontSize: 16, color: '#666', marginTop: 16 }}>
                <p style={{ margin: 0 }}>
                  No tienes los permisos necesarios para acceder a esta página.
                </p>
                <p style={{ margin: '8px 0 0 0' }}>
                  Contacta al administrador para solicitar acceso.
                </p>
              </div>
            }
            extra={[
              <Button 
                type="primary" 
                key="dashboard" 
                onClick={() => window.location.href = '/'}
                size="large"
              >
                Volver al Dashboard
              </Button>,
              <Button 
                key="back" 
                onClick={() => window.history.back()}
                size="large"
              >
                Regresar
              </Button>
            ]}
            style={{
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              padding: '48px 24px'
            }}
          />
        </div>
      );
    }
  }

  // ========================================
  // 6. ACCESO PERMITIDO: Renderizar componente
  // ========================================
  console.log('✅ Acceso permitido a:', location.pathname);
  console.log(`   Usuario: ${usuario.email}`);
  console.log(`   Cargo: ${usuario.cargo}`);
  console.log(`   Sucursal: ${usuario.sucursal}`);
  
  return <>{children}</>;
};

export default ProtectedRoute;

