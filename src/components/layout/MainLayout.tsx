import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { menuItems } from '../../utils/menuItems';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // Obtener la clave del menú actual basada en la ruta
  const getCurrentMenuKey = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.substring(1).split('/')[0];
  };

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        // Aquí implementarías la lógica de logout
        console.log('Logout');
        break;
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.06)',
        }}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 24px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainer,
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Z
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: token.colorText,
                }}
              >
                Sistema Zarpar
              </span>
            </div>
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              Z
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[getCurrentMenuKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '16px 8px',
          }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 600,
                  color: token.colorText,
                }}
              >
                Dashboard
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  fontSize: '16px',
                  width: 40,
                  height: 40,
                }}
              />
            </Badge>

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = token.colorBgTextHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: token.colorText,
                      lineHeight: 1.2,
                    }}
                  >
                    Admin Usuario
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: token.colorTextSecondary,
                      lineHeight: 1.2,
                    }}
                  >
                    Administrador
                  </span>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            overflow: 'auto',
          }}
        >
          {children || <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;