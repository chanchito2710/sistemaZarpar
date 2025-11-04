import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme, Tag, Spin, Space, Typography, Empty } from 'antd';
import './MainLayout.css';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CrownOutlined,
  ShopOutlined,
  DatabaseOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { menuItems } from '../../utils/menuItems';
import { useAuth } from '../../contexts/AuthContext';
import { ventasService } from '../../services/api';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [ventasDelDia, setVentasDelDia] = useState<any>(null);
  const [ultimasVentas, setUltimasVentas] = useState<any[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { usuario, isAuthenticated, isLoading, logout } = useAuth();

  // Cargar ventas del día
  useEffect(() => {
    const cargarVentasDelDia = async () => {
      try {
        const datos = await ventasService.obtenerVentasDelDia();
        setVentasDelDia(datos);
      } catch (error) {
        console.error('Error al cargar ventas del día:', error);
      }
    };
    
    cargarVentasDelDia();
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarVentasDelDia, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cargar últimas ventas
  useEffect(() => {
    const cargarUltimasVentas = async () => {
      try {
        setLoadingVentas(true);
        const ventas = await ventasService.obtenerUltimas(3);
        setUltimasVentas(ventas);
      } catch (error) {
        console.error('Error al cargar últimas ventas:', error);
      } finally {
        setLoadingVentas(false);
      }
    };

    cargarUltimasVentas();
    // Actualizar cada 2 minutos
    const interval = setInterval(cargarUltimasVentas, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Función para refrescar ventas manualmente
  const handleRefreshVentas = async () => {
    try {
      setLoadingVentas(true);
      const ventas = await ventasService.obtenerUltimas(3);
      setUltimasVentas(ventas);
    } catch (error) {
      console.error('Error al refrescar ventas:', error);
    } finally {
      setLoadingVentas(false);
    }
  };

  // Obtener color e ícono del método de pago
  const getMetodoPagoColor = (metodo: string): string => {
    const colores: Record<string, string> = {
      'efectivo': '#52c41a',
      'transferencia': '#1890ff',
      'cuenta_corriente': '#faad14',
      'tarjeta': '#722ed1'
    };
    return colores[metodo] || '#8c8c8c';
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return <DollarOutlined />;
      case 'transferencia':
        return <BankOutlined />;
      case 'cuenta_corriente':
        return <CreditCardOutlined />;
      default:
        return <CreditCardOutlined />;
    }
  };

  // Redirigir a login si no está autenticado
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

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

  const handleUserMenuClick = async ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'database':
        navigate('/admin/database');
        break;
      case 'logout':
        await logout();
        navigate('/login', { replace: true });
        break;
    }
  };

  // Verificar si el usuario es administrador
  const esAdministrador = usuario?.email === 'admin@zarparuy.com';

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
    // Opción de Base de Datos solo para administrador
    ...(esAdministrador ? [{
      key: 'database',
      icon: <DatabaseOutlined />,
      label: 'Base de Datos',
    }] : []),
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

        <div style={{ 
          height: '15%', 
          display: 'flex', 
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '24px'
        }}>
          <Menu
            mode="inline"
            selectedKeys={[getCurrentMenuKey()]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              width: '100%',
            }}
          />
        </div>

        {/* Métricas en el sidebar */}
        <div style={{ 
          padding: collapsed ? '12px 8px' : '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Ventas del Día */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '10px',
            padding: collapsed ? '10px 8px' : '12px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
          }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', marginBottom: '4px', fontWeight: 500 }}>
              {collapsed ? 'Ventas' : 'Ventas del Día'}
            </div>
            <div style={{ fontSize: collapsed ? '16px' : '18px', color: 'white', fontWeight: 700, marginBottom: '2px' }}>
              ${ventasDelDia?.total_ingresos?.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
            </div>
            {!collapsed && (
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)' }}>
                {ventasDelDia?.total_ventas || 0} ventas
              </div>
            )}
          </div>

          {/* Productos en Stock */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '10px',
            padding: collapsed ? '10px 8px' : '12px',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
          }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', marginBottom: '4px', fontWeight: 500 }}>
              {collapsed ? 'Stock' : 'Productos en Stock'}
            </div>
            <div style={{ fontSize: collapsed ? '16px' : '18px', color: 'white', fontWeight: 700, marginBottom: '2px' }}>
              1,234
            </div>
            {!collapsed && (
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span>↓</span> 3.2% vs mes anterior
              </div>
            )}
          </div>

          {/* Ventas Recientes */}
          {!collapsed && (
            <div style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f0f0f0',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <Text strong style={{ fontSize: '11px', color: '#1f2937' }}>
                  <ShoppingCartOutlined style={{ marginRight: 4 }} />
                  Ventas Recientes
                </Text>
                <ReloadOutlined 
                  spin={loadingVentas}
                  onClick={handleRefreshVentas}
                  style={{ 
                    cursor: 'pointer', 
                    color: '#1890ff',
                    fontSize: '12px'
                  }}
                />
              </div>

              {loadingVentas ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin size="small" />
                </div>
              ) : ultimasVentas.length === 0 ? (
                <Empty 
                  description="Sin ventas recientes"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '10px 0' }}
                  imageStyle={{ height: 40 }}
                />
              ) : (
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  {ultimasVentas.map((venta, index) => (
                    <div
                      key={venta.id || index}
                      style={{
                        background: '#fafafa',
                        borderRadius: '6px',
                        padding: '8px',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.borderColor = '#d9d9d9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fafafa';
                        e.currentTarget.style.borderColor = '#f0f0f0';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text strong style={{ fontSize: '10px', color: '#1890ff' }}>
                          {venta.numero_venta}
                        </Text>
                        <Text strong style={{ fontSize: '10px', color: '#52c41a' }}>
                          ${parseFloat(venta.total).toFixed(2)}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <Tag 
                          color="blue" 
                          style={{ 
                            margin: 0, 
                            fontSize: 8, 
                            padding: '0 3px',
                            lineHeight: '16px'
                          }}
                        >
                          {venta.sucursal.toUpperCase()}
                        </Tag>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: 9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                          title={venta.cliente_nombre}
                        >
                          {venta.cliente_nombre}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: 8,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                          title={venta.primer_producto}
                        >
                          📦 {venta.primer_producto || 'Sin productos'}
                        </Text>
                        <Tag 
                          color={getMetodoPagoColor(venta.metodo_pago)}
                          icon={getMetodoPagoIcon(venta.metodo_pago)}
                          style={{ 
                            margin: 0, 
                            fontSize: 7, 
                            padding: '0 3px',
                            lineHeight: '14px'
                          }}
                        >
                          {venta.metodo_pago.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </Space>
              )}
            </div>
          )}
        </div>
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
          <div></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                  icon={usuario?.esAdmin ? <CrownOutlined /> : <UserOutlined />}
                  style={{
                    background: usuario?.esAdmin 
                      ? 'linear-gradient(135deg, #faad14 0%, #d4b106 100%)'
                      : 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: token.colorText,
                        lineHeight: 1.2,
                      }}
                    >
                      {usuario?.nombre || 'Usuario'}
                    </span>
                    {usuario?.esAdmin && (
                      <Tag 
                        icon={<CrownOutlined />} 
                        color="gold" 
                        style={{ margin: 0, fontSize: 10 }}
                      >
                        ADMIN
                      </Tag>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShopOutlined style={{ fontSize: 11, color: token.colorTextSecondary }} />
                    <span
                      style={{
                        fontSize: 12,
                        color: token.colorTextSecondary,
                        lineHeight: 1.2,
                      }}
                    >
                      {usuario?.sucursal || 'Sin sucursal'}
                    </span>
                  </div>
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