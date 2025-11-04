import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider, Spin } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        // Redirigir al dashboard
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
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
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email (ej: pando@zarparuy.com)" 
              style={{ borderRadius: 8 }}
              disabled={loading}
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
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              icon={<LoginOutlined />}
              loading={loading}
              style={{ 
                height: 48, 
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                border: 'none'
              }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Acceso Rápido
          </Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Button 
            block 
            size="small" 
            type="text"
            onClick={() => form.setFieldsValue({
              email: 'admin@zarparuy.com',
              password: 'admin123'
            })}
            disabled={loading}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              👑 Admin: admin@zarparuy.com / admin123
            </Text>
          </Button>
          <Button 
            block 
            size="small" 
            type="text"
            onClick={() => form.setFieldsValue({
              email: 'pando@zarparuy.com',
              password: 'pando123'
            })}
            disabled={loading}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              💼 Vendedor Pando: pando@zarparuy.com / pando123
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