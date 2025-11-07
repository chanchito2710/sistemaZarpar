import React from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';
import {
  BarChartOutlined,
  RightOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SettingOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * Página de Acceso Rápido a Reportes y Funcionalidades
 * Contiene botones grandes y llamativos para acceder a diferentes secciones
 */
const InventoryLog: React.FC = () => {
  const navigate = useNavigate();

  // Array de botones configurables
  const buttons = [
    {
      id: 1,
      title: '📊 VENTAS GLOBALES - Historial Diario',
      description: '🔥 ¡Consulta el resumen histórico completo! Filtra por fecha, sucursal y descarga reportes',
      icon: <BarChartOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      borderColor: '#667eea',
      onClick: () => navigate('/global-sales'),
      buttonText: 'VER AHORA',
    },
    {
      id: 2,
      title: '📦 PRÓXIMAMENTE',
      description: 'Nueva funcionalidad en desarrollo...',
      icon: <DatabaseOutlined />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderColor: '#f093fb',
      onClick: () => {},
      buttonText: 'PRÓXIMAMENTE',
      disabled: true,
    },
    {
      id: 3,
      title: '📄 PRÓXIMAMENTE',
      description: 'Nueva funcionalidad en desarrollo...',
      icon: <FileTextOutlined />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      borderColor: '#4facfe',
      onClick: () => {},
      buttonText: 'PRÓXIMAMENTE',
      disabled: true,
    },
    {
      id: 4,
      title: '⚙️ PRÓXIMAMENTE',
      description: 'Nueva funcionalidad en desarrollo...',
      icon: <SettingOutlined />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      borderColor: '#43e97b',
      onClick: () => {},
      buttonText: 'PRÓXIMAMENTE',
      disabled: true,
    },
    {
      id: 5,
      title: '📈 PRÓXIMAMENTE',
      description: 'Nueva funcionalidad en desarrollo...',
      icon: <PieChartOutlined />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      borderColor: '#fa709a',
      onClick: () => {},
      buttonText: 'PRÓXIMAMENTE',
      disabled: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Encabezado */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          📊 Reportes y Funcionalidades
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Accede rápidamente a las diferentes secciones del sistema
        </Text>
      </div>

      {/* Grid de Botones */}
      <Row gutter={[24, 24]}>
        {buttons.map((button) => (
          <Col xs={24} key={button.id}>
            <Card
              style={{
                borderRadius: '16px',
                border: `3px solid ${button.borderColor}`,
                background: button.disabled
                  ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
                  : button.gradient,
                boxShadow: button.disabled
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                  : `0 8px 24px ${button.borderColor}66`,
                cursor: button.disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                opacity: button.disabled ? 0.6 : 1,
              }}
              styles={{ body: { padding: '24px' } }}
              onClick={button.disabled ? undefined : button.onClick}
              hoverable={!button.disabled}
              onMouseEnter={(e) => {
                if (!button.disabled) {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 48px ${button.borderColor}99`;
                }
              }}
              onMouseLeave={(e) => {
                if (!button.disabled) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${button.borderColor}66`;
                }
              }}
            >
              <Row align="middle" gutter={24}>
                {/* Ícono */}
                <Col>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {React.cloneElement(button.icon as React.ReactElement, {
                      style: {
                        fontSize: 48,
                        color: '#ffffff',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      },
                    })}
                  </div>
                </Col>

                {/* Contenido */}
                <Col flex="auto">
                  <Title
                    level={3}
                    style={{
                      margin: '0 0 8px 0',
                      color: '#ffffff',
                      fontWeight: 700,
                      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    {button.title}
                  </Title>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#ffffff',
                      fontWeight: 500,
                      textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    {button.description}
                  </Text>
                </Col>

                {/* Botón de Acción */}
                <Col>
                  <Button
                    type="primary"
                    size="large"
                    icon={!button.disabled ? <RightOutlined /> : undefined}
                    disabled={button.disabled}
                    style={{
                      height: 56,
                      fontSize: 18,
                      fontWeight: 600,
                      borderRadius: 12,
                      background: '#ffffff',
                      color: button.disabled ? '#999999' : button.borderColor,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      padding: '0 32px',
                    }}
                    onMouseEnter={(e) => {
                      if (!button.disabled) {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!button.disabled) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }
                    }}
                  >
                    {button.buttonText}
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Nota informativa */}
      <Card
        style={{
          marginTop: 32,
          background: '#f0f2f5',
          border: '1px dashed #d9d9d9',
        }}
      >
        <Text type="secondary" style={{ fontSize: 14 }}>
          💡 <strong>Nota:</strong> Los botones marcados como "PRÓXIMAMENTE" estarán
          disponibles en futuras actualizaciones del sistema. El botón activo te permite
          acceder a la funcionalidad correspondiente de inmediato.
        </Text>
      </Card>

      {/* Estilos globales */}
      <style>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryLog;
