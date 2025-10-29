/**
 * Contexto de Autenticación
 * Maneja el estado global del usuario autenticado en toda la aplicación
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';

// Interfaz del usuario autenticado
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  cargo: string;
  sucursal: string;
  esAdmin: boolean;
  tablasClientes: string[];
  permisos: {
    verTodasSucursales: boolean;
    modificarUsuarios: boolean;
    verReportesGlobales: boolean;
    gestionarBaseDatos: boolean;
  };
}

// Interfaz del contexto
interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verificarAutenticacion: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del Contexto de Autenticación
 * Debe envolver toda la aplicación en App.tsx
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // URL base de la API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456';

  /**
   * Verificar si hay un token guardado al cargar la aplicación
   */
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    
    if (tokenGuardado) {
      setToken(tokenGuardado);
      verificarToken(tokenGuardado);
    } else {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar si el token es válido
   */
  const verificarToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verificar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data.usuario);
        setIsAuthenticated(true);
      } else {
        // Token inválido o expirado
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar token:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función de Login
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Promise<boolean> - true si el login fue exitoso
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Login exitoso
        setToken(data.token);
        setUsuario(data.usuario);
        setIsAuthenticated(true);
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        // Mostrar mensaje de bienvenida
        message.success(`¡Bienvenido, ${data.usuario.nombre}!`);
        
        return true;
      } else {
        // Login fallido
        message.error(data.error || 'Error al iniciar sesión');
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      message.error('Error de conexión con el servidor');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función de Logout
   * Cierra la sesión del usuario
   */
  const logout = async () => {
    try {
      // Notificar al backend (opcional, pero es buena práctica)
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local
      localStorage.removeItem('token');
      setToken(null);
      setUsuario(null);
      setIsAuthenticated(false);
      
      message.info('Sesión cerrada');
    }
  };

  /**
   * Verificar autenticación actual
   * Útil para refrescar el estado del usuario
   */
  const verificarAutenticacion = async () => {
    const tokenGuardado = localStorage.getItem('token');
    if (tokenGuardado) {
      await verificarToken(tokenGuardado);
    }
  };

  // Valor del contexto
  const value: AuthContextType = {
    usuario,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    verificarAutenticacion
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns AuthContextType
 * @throws Error si se usa fuera del AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Exportar el contexto por si se necesita en casos especiales
export default AuthContext;

