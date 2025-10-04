import React from 'react';
import { Card, Typography, Switch, Select, Button, Space, Row, Col, Divider, Form, InputNumber } from 'antd';
import { SettingOutlined, BellOutlined, GlobalOutlined, SecurityScanOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Settings saved:', values);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          Configuración del Sistema
        </Title>
        <Text type="secondary">
          Personaliza la configuración general del sistema
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          language: 'es',
          currency: 'USD',
          timezone: 'America/Mexico_City',
          notifications: true,
          emailAlerts: true,
          autoBackup: true,
          sessionTimeout: 30,
          maxLoginAttempts: 3,
          passwordExpiry: 90
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Configuración General" className="hover-lift">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Idioma del Sistema</Text>
                  <Form.Item name="language" style={{ marginBottom: 0, marginTop: 8 }}>
                    <Select style={{ width: '100%' }}>
                      <Option value="es">🇪🇸 Español</Option>
                      <Option value="en">🇺🇸 English</Option>
                      <Option value="pt">🇧🇷 Português</Option>
                    </Select>
                  </Form.Item>
                </div>
                
                <div>
                  <Text strong>Moneda</Text>
                  <Form.Item name="currency" style={{ marginBottom: 0, marginTop: 8 }}>
                    <Select style={{ width: '100%' }}>
                      <Option value="USD">💵 Dólar (USD)</Option>
                      <Option value="MXN">🇲🇽 Peso Mexicano (MXN)</Option>
                      <Option value="EUR">💶 Euro (EUR)</Option>
                    </Select>
                  </Form.Item>
                </div>
                
                <div>
                  <Text strong>Zona Horaria</Text>
                  <Form.Item name="timezone" style={{ marginBottom: 0, marginTop: 8 }}>
                    <Select style={{ width: '100%' }}>
                      <Option value="America/Mexico_City">🇲🇽 Ciudad de México (GMT-6)</Option>
                      <Option value="America/New_York">🇺🇸 Nueva York (GMT-5)</Option>
                      <Option value="Europe/Madrid">🇪🇸 Madrid (GMT+1)</Option>
                    </Select>
                  </Form.Item>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BellOutlined style={{ color: '#fa8c16' }} />
                  Notificaciones
                </Space>
              } 
              className="hover-lift"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Notificaciones del Sistema</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Recibir alertas importantes
                    </Text>
                  </div>
                  <Form.Item name="notifications" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Alertas por Email</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Enviar notificaciones por correo
                    </Text>
                  </div>
                  <Form.Item name="emailAlerts" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Respaldo Automático</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Crear respaldos diarios
                    </Text>
                  </div>
                  <Form.Item name="autoBackup" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <SecurityScanOutlined style={{ color: '#f5222d' }} />
                  Configuración de Seguridad
                </Space>
              } 
              className="hover-lift"
            >
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <div>
                    <Text strong>Tiempo de Sesión (minutos)</Text>
                    <Form.Item name="sessionTimeout" style={{ marginTop: 8 }}>
                      <InputNumber 
                        min={5} 
                        max={120} 
                        style={{ width: '100%' }}
                        addonAfter="min"
                      />
                    </Form.Item>
                  </div>
                </Col>
                
                <Col xs={24} sm={8}>
                  <div>
                    <Text strong>Intentos de Login Máximos</Text>
                    <Form.Item name="maxLoginAttempts" style={{ marginTop: 8 }}>
                      <InputNumber 
                        min={1} 
                        max={10} 
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </div>
                </Col>
                
                <Col xs={24} sm={8}>
                  <div>
                    <Text strong>Expiración de Contraseña (días)</Text>
                    <Form.Item name="passwordExpiry" style={{ marginTop: 8 }}>
                      <InputNumber 
                        min={30} 
                        max={365} 
                        style={{ width: '100%' }}
                        addonAfter="días"
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card title="Información del Sistema" className="hover-lift">
              <Row gutter={16}>
                <Col xs={24} sm={6}>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Text type="secondary">Versión</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>v2.1.0</div>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Text type="secondary">Base de Datos</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>MySQL 8.0</div>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Text type="secondary">Último Respaldo</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>Hoy 09:00</div>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Text type="secondary">Usuarios Activos</Text>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>12</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
              Guardar Configuración
            </Button>
            <Button size="large">
              Restaurar Valores por Defecto
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;