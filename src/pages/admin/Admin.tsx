import React from 'react';
import { Card, Typography, Row, Col, Button, Space, List, Avatar, Switch, Divider } from 'antd';
import { SettingOutlined, UserOutlined, SecurityScanOutlined, DatabaseOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Admin: React.FC = () => {
  const systemSettings = [
    {
      title: 'Configuración General',
      description: 'Ajustes básicos del sistema',
      icon: <SettingOutlined style={{ color: '#1890ff' }} />,
      enabled: true
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar permisos y roles',
      icon: <UserOutlined style={{ color: '#52c41a' }} />,
      enabled: true
    },
    {
      title: 'Seguridad',
      description: 'Configuración de seguridad y acceso',
      icon: <SecurityScanOutlined style={{ color: '#fa8c16' }} />,
      enabled: true
    },
    {
      title: 'Base de Datos',
      description: 'Respaldos y mantenimiento',
      icon: <DatabaseOutlined style={{ color: '#722ed1' }} />,
      enabled: false
    },
    {
      title: 'Notificaciones',
      description: 'Configurar alertas del sistema',
      icon: <BellOutlined style={{ color: '#eb2f96' }} />,
      enabled: true
    },
    {
      title: 'Integración API',
      description: 'Conexiones externas y webhooks',
      icon: <GlobalOutlined style={{ color: '#13c2c2' }} />,
      enabled: false
    }
  ];

  const recentActivities = [
    'Usuario admin inició sesión - 10:30 AM',
    'Respaldo automático completado - 09:00 AM',
    'Nuevo usuario registrado: Carlos M. - 08:45 AM',
    'Actualización de inventario - 08:30 AM',
    'Sistema reiniciado - 08:00 AM'
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
          Administración del Sistema
        </Title>
        <Text type="secondary">
          Configuración avanzada y gestión del sistema
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Configuraciones del Sistema" className="hover-lift">
            <List
              itemLayout="horizontal"
              dataSource={systemSettings}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Switch 
                      key="switch"
                      checked={item.enabled} 
                      size="small"
                    />,
                    <Button key="config" type="text" size="small">
                      Configurar
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={item.icon} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Estado del Sistema" className="hover-lift">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>CPU</Text>
                  <Text strong style={{ color: '#52c41a' }}>23%</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Memoria</Text>
                  <Text strong style={{ color: '#faad14' }}>67%</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Disco</Text>
                  <Text strong style={{ color: '#1890ff' }}>45%</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Red</Text>
                  <Text strong style={{ color: '#52c41a' }}>Normal</Text>
                </div>
              </Space>
            </Card>
            
            <Card title="Actividad Reciente" className="hover-lift">
              <List
                size="small"
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item>
                    <Text style={{ fontSize: 12 }}>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      <Divider />
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="hover-lift" style={{ textAlign: 'center' }}>
            <DatabaseOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
            <Title level={4}>Respaldo</Title>
            <Text type="secondary">Crear respaldo del sistema</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" block>
                Crear Respaldo
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="hover-lift" style={{ textAlign: 'center' }}>
            <SecurityScanOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
            <Title level={4}>Seguridad</Title>
            <Text type="secondary">Auditoría de seguridad</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" block>
                Ejecutar Auditoría
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card className="hover-lift" style={{ textAlign: 'center' }}>
            <GlobalOutlined style={{ fontSize: 48, color: '#13c2c2', marginBottom: 16 }} />
            <Title level={4}>Actualizaciones</Title>
            <Text type="secondary">Verificar actualizaciones</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" block>
                Verificar
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;