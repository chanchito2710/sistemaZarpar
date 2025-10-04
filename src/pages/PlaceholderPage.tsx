import React from 'react';
import { Card, Typography, Button, Space, Result } from 'antd';
import { RocketOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

interface PlaceholderPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title = 'Módulo en Desarrollo',
  description = 'Esta funcionalidad estará disponible próximamente',
  icon = <RocketOutlined style={{ color: '#1890ff' }} />
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extraer el nombre del módulo de la ruta
  const moduleName = location.pathname.split('/')[1] || 'módulo';
  const moduleTitle = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          {icon}
          <span style={{ marginLeft: 8 }}>{moduleTitle}</span>
        </Title>
        <Text type="secondary">
          {description}
        </Text>
      </div>

      <Card className="hover-lift">
        <Result
          icon={<div style={{ fontSize: 72 }}>🚧</div>}
          title={title}
          subTitle={
            <Space direction="vertical" size="small">
              <Text>Este módulo está siendo desarrollado y estará disponible en una próxima actualización.</Text>
              <Text type="secondary">Mientras tanto, puedes explorar otros módulos del sistema.</Text>
            </Space>
          }
          extra={
            <Space>
              <Button 
                type="primary" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/dashboard')}
              >
                Volver al Dashboard
              </Button>
              <Button onClick={() => navigate(-1)}>
                Página Anterior
              </Button>
            </Space>
          }
        />
      </Card>

      <Card title="Funcionalidades Planificadas" className="hover-lift" style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>✨ Características principales:</Text>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Interfaz intuitiva y fácil de usar</li>
              <li>Integración completa con otros módulos</li>
              <li>Reportes y análisis avanzados</li>
              <li>Configuración personalizable</li>
              <li>Soporte para múltiples usuarios</li>
            </ul>
          </div>
          
          <div>
            <Text strong>🔄 Estado del desarrollo:</Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">En planificación y diseño</Text>
            </div>
          </div>
          
          <div>
            <Text strong>📅 Fecha estimada:</Text>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Próxima actualización del sistema</Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default PlaceholderPage;