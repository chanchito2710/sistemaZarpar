import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CajaContextType {
  montoCaja: number;
  setMontoCaja: (monto: number) => void;
  actualizarCaja: () => void;
  triggerActualizacion: number;
}

const CajaContext = createContext<CajaContextType | undefined>(undefined);

export const CajaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [montoCaja, setMontoCaja] = useState(0);
  const [triggerActualizacion, setTriggerActualizacion] = useState(0);

  // Función para forzar actualización
  const actualizarCaja = () => {
    console.log('🔄 Trigger de actualización de caja activado');
    setTriggerActualizacion(prev => prev + 1);
  };

  return (
    <CajaContext.Provider value={{ montoCaja, setMontoCaja, actualizarCaja, triggerActualizacion }}>
      {children}
    </CajaContext.Provider>
  );
};

export const useCaja = () => {
  const context = useContext(CajaContext);
  if (context === undefined) {
    throw new Error('useCaja debe ser usado dentro de un CajaProvider');
  }
  return context;
};

