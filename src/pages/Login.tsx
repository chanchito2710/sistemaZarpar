import React from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Login values:', values);
    // Aquí iría la lógica de autenticación
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 16
        }}
        className="fade-in"
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #1890ff, #722ed1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 32,
            color: 'white'
          }}>
            🚢
          </div>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Sistema Zarpar
          </Title>
          <Text type="secondary">
            Gestión Empresarial Integral
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Por favor ingresa tu usuario' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Usuario" 
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Contraseña" 
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              icon={<LoginOutlined />}
              style={{ 
                height: 48, 
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                border: 'none'
              }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Acceso Rápido
          </Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Button block size="small" type="text">
            <Text type="secondary" style={{ fontSize: 12 }}>
              👤 Admin: admin / admin123
            </Text>
          </Button>
          <Button block size="small" type="text">
            <Text type="secondary" style={{ fontSize: 12 }}>
              💼 Vendedor: vendedor / venta123
            </Text>
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            © 2024 Sistema Zarpar - Todos los derechos reservados
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;