import React from 'react';
import { Card, Typography, Form, Input, Button, Avatar, Row, Col, Divider, Space, Tag } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Profile update:', values);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Mi Perfil
        </Title>
        <Text type="secondary">
          Gestiona tu información personal y configuración de cuenta
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card className="hover-lift" style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />} 
              style={{ 
                backgroundColor: '#1890ff',
                marginBottom: 16
              }}
            />
            <Title level={4} style={{ margin: '16px 0 8px' }}>
              Juan Carlos Pérez
            </Title>
            <Text type="secondary">Administrador del Sistema</Text>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag color="blue">Administrador</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Último acceso: Hoy, 10:30 AM
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Miembro desde: Enero 2024
              </Text>
            </Space>
            
            <Divider />
            
            <Button type="primary" icon={<EditOutlined />} block>
              Cambiar Foto
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card title="Información Personal" className="hover-lift">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                firstName: 'Juan Carlos',
                lastName: 'Pérez',
                email: 'juan.perez@sistemazarpar.com',
                phone: '+1 234-567-8901',
                address: 'Av. Principal 123, Ciudad',
                position: 'Administrador del Sistema',
                department: 'Administración'
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="firstName"
                    label="Nombre"
                    rules={[{ required: true, message: 'El nombre es requerido' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="lastName"
                    label="Apellido"
                    rules={[{ required: true, message: 'El apellido es requerido' }]}
                  >
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Correo Electrónico"
                    rules={[
                      { required: true, message: 'El email es requerido' },
                      { type: 'email', message: 'Formato de email inválido' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Teléfono"
                    rules={[{ required: true, message: 'El teléfono es requerido' }]}
                  >
                    <Input prefix={<PhoneOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="address"
                label="Dirección"
              >
                <Input prefix={<HomeOutlined />} />
              </Form.Item>
              
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="position"
                    label="Cargo"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="department"
                    label="Departamento"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Guardar Cambios
                  </Button>
                  <Button>
                    Cancelar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Cambiar Contraseña" className="hover-lift">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="currentPassword"
                    label="Contraseña Actual"
                    rules={[{ required: true, message: 'Ingresa tu contraseña actual' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="newPassword"
                    label="Nueva Contraseña"
                    rules={[{ required: true, message: 'Ingresa una nueva contraseña' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirmar Contraseña"
                    rules={[{ required: true, message: 'Confirma tu nueva contraseña' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Button type="primary">
                  Actualizar Contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;