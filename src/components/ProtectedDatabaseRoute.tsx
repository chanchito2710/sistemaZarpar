/**
 * Componente de Protección con PIN para Database Manager
 * Solicita una clave (PIN: 2710) antes de permitir el acceso
 */

import React, { useState, useEffect } from 'react';
import { Modal, Input, message, Button, Typography, Space } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import DatabaseManager from '../pages/admin/DatabaseManager';

const { Title, Text } = Typography;

const PIN_CORRECTO = '2710';
const PIN_STORAGE_KEY = 'db_access_granted';
const PIN_EXPIRY_KEY = 'db_access_expiry';

const ProtectedDatabaseRoute: React.FC = () => {
  const [pinVisible, setPinVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [accesoConcedido, setAccesoConcedido] = useState(false);

  // Verificar si ya tiene acceso (sesión válida)
  useEffect(() => {
    verificarAccesoExistente();
  }, []);

  const verificarAccesoExistente = () => {
    const accessGranted = sessionStorage.getItem(PIN_STORAGE_KEY);
    const expiry = sessionStorage.getItem(PIN_EXPIRY_KEY);
    
    if (accessGranted === 'true' && expiry) {
      const expiryTime = parseInt(expiry);
      const now = Date.now();
      
      // Acceso válido por 30 minutos
      if (now < expiryTime) {
        setAccesoConcedido(true);
        return;
      }
    }
    
    // No tiene acceso o expiró
    setPinVisible(true);
  };

  const handleVerificarPin = () => {
    setLoading(true);
    
    // Simular verificación (puedes agregar un pequeño delay para efecto)
    setTimeout(() => {
      if (pin === PIN_CORRECTO) {
        // PIN correcto
        const expiry = Date.now() + (30 * 60 * 1000); // 30 minutos
        sessionStorage.setItem(PIN_STORAGE_KEY, 'true');
        sessionStorage.setItem(PIN_EXPIRY_KEY, expiry.toString());
        
        setAccesoConcedido(true);
        setPinVisible(false);
        setPin('');
        message.success('🔓 Acceso concedido a Base de Datos');
      } else {
        // PIN incorrecto
        message.error('❌ PIN incorrecto. Inténtalo de nuevo.');
        setPin('');
      }
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerificarPin();
    }
  };

  // Si el acceso fue concedido, mostrar el Database Manager
  if (accesoConcedido) {
    return <DatabaseManager />;
  }

  // Si no tiene acceso, mostrar el modal de PIN
  return (
    <>
      {/* Placeholder mientras se muestra el modal */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 200px)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          margin: '24px',
        }}
      >
        <Space direction="vertical" align="center" size="large">
          <LockOutlined style={{ fontSize: '80px', color: '#fff' }} />
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            Área Protegida
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
            Se requiere autenticación para acceder a la Base de Datos
          </Text>
        </Space>
      </div>

      {/* Modal de verificación de PIN */}
      <Modal
        title={
          <Space>
            <SafetyOutlined style={{ color: '#1890ff' }} />
            <span>Verificación de Seguridad</span>
          </Space>
        }
        open={pinVisible}
        onOk={handleVerificarPin}
        onCancel={() => {
          // No permitir cerrar el modal, solo redirigir
          window.history.back();
        }}
        okText="Verificar"
        cancelText="Cancelar"
        confirmLoading={loading}
        closable={false}
        maskClosable={false}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text type="secondary">
              Esta área está protegida con un PIN de seguridad.
            </Text>
            <br />
            <Text type="secondary">
              Solo usuarios autorizados pueden acceder.
            </Text>
          </div>
          
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Ingresa el PIN de 4 dígitos:
            </Text>
            <Input.Password
              size="large"
              placeholder="****"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyPress={handleKeyPress}
              maxLength={4}
              prefix={<LockOutlined />}
              autoFocus
              style={{
                fontSize: '24px',
                letterSpacing: '8px',
                textAlign: 'center',
              }}
            />
          </div>
          
          <div style={{ 
            background: '#f0f2f5', 
            padding: '12px', 
            borderRadius: '8px',
            borderLeft: '4px solid #faad14',
          }}>
            <Text type="warning" style={{ fontSize: '12px' }}>
              ⚠️ El acceso será válido por 30 minutos
            </Text>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default ProtectedDatabaseRoute;










