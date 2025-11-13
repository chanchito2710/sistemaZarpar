/**
 * Componente de Protección para Rutas de Administrador
 * Redirige al dashboard si el usuario no es administrador
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const esAdmin = usuario?.esAdmin || usuario?.email === 'admin@zarparuy.com';

  useEffect(() => {
    if (!esAdmin) {
      message.error('⛔ No tienes permisos para acceder a esta sección. Solo administradores.');
      navigate('/');
    }
  }, [esAdmin, navigate]);

  // Si no es admin, no renderizar nada (ya está redirigiendo)
  if (!esAdmin) {
    return null;
  }

  // Si es admin, renderizar el componente hijo
  return <>{children}</>;
};

export default ProtectedAdminRoute;

