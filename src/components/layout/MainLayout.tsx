import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme, Tag, Spin, Space, Typography, Empty, Button, Modal, Divider, Row, Col } from 'antd';
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
  PrinterOutlined,
  CheckCircleOutlined,
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
  
  // Estados para modal de comprobante
  const [modalComprobanteVisible, setModalComprobanteVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const [detallesVenta, setDetallesVenta] = useState<any[]>([]);
  const [loadingComprobante, setLoadingComprobante] = useState(false);
  
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
        
        // Filtrar ventas según rol del usuario
        if (usuario) {
          if (usuario.esAdmin) {
            // Admin ve todas las ventas
            setUltimasVentas(ventas);
          } else {
            // Usuario normal solo ve ventas de su sucursal
            const sucursalUsuario = usuario.sucursal?.toLowerCase() || '';
            const ventasFiltradas = ventas.filter(
              (venta: any) => venta.sucursal.toLowerCase() === sucursalUsuario
            );
            setUltimasVentas(ventasFiltradas);
          }
        }
      } catch (error) {
        console.error('Error al cargar últimas ventas:', error);
      } finally {
        setLoadingVentas(false);
      }
    };

    if (usuario) {
      cargarUltimasVentas();
      // Actualizar cada 1 minuto
      const interval = setInterval(cargarUltimasVentas, 1 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [usuario]);

  // Función para refrescar ventas manualmente
  const handleRefreshVentas = async () => {
    try {
      setLoadingVentas(true);
      const ventas = await ventasService.obtenerUltimas(3);
      
      // Filtrar ventas según rol del usuario
      if (usuario) {
        if (usuario.esAdmin) {
          // Admin ve todas las ventas
          setUltimasVentas(ventas);
        } else {
          // Usuario normal solo ve ventas de su sucursal
          const sucursalUsuario = usuario.sucursal?.toLowerCase() || '';
          const ventasFiltradas = ventas.filter(
            (venta: any) => venta.sucursal.toLowerCase() === sucursalUsuario
          );
          setUltimasVentas(ventasFiltradas);
        }
      }
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

  // Abrir modal de comprobante
  const handleVerComprobante = async (ventaId: number) => {
    try {
      setLoadingComprobante(true);
      setModalComprobanteVisible(true);
      
      const datos = await ventasService.obtenerDetalle(ventaId);
      setVentaSeleccionada(datos);
      setDetallesVenta(datos.productos || []);
    } catch (error) {
      console.error('Error al cargar comprobante:', error);
    } finally {
      setLoadingComprobante(false);
    }
  };

  // Cerrar modal de comprobante
  const handleCerrarComprobante = () => {
    setModalComprobanteVisible(false);
    setVentaSeleccionada(null);
    setDetallesVenta([]);
  };

  // Imprimir comprobante
  const imprimirComprobante = () => {
    if (!ventaSeleccionada) return;

    const metodoPagoTexto: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      cuenta_corriente: 'Cuenta Corriente',
      tarjeta: 'Tarjeta',
    };

    const formatoFecha = (fecha: string) => {
      try {
        const date = new Date(fecha);
        return date.toLocaleString('es-UY', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return 'Fecha no disponible';
      }
    };

    const contenidoImpresion = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante - ${ventaSeleccionada.numero_venta}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              background: white;
              color: black;
            }
            .comprobante { 
              max-width: 300px; 
              margin: 0 auto; 
              border: 2px solid #000;
              padding: 15px;
            }
            .header { text-align: center; margin-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header p { font-size: 11px; margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-size: 11px;
            }
            .info-row strong { font-weight: bold; }
            .productos { margin: 10px 0; }
            .producto-item { margin: 8px 0; font-size: 11px; }
            .producto-item .nombre { font-weight: bold; }
            .producto-item .detalle { 
              display: flex; 
              justify-content: space-between;
              margin-top: 2px;
            }
            .totales { margin-top: 15px; }
            .total-item { 
              display: flex; 
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .total-item.final { 
              font-size: 16px; 
              font-weight: bold; 
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 10px;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 0.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <h1>SISTEMA ZARPAR</h1>
              <p>Sucursal: ${ventaSeleccionada.sucursal.toUpperCase()}</p>
              <p>Fecha: ${formatoFecha(ventaSeleccionada.fecha_venta)}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-row">
              <strong>N° Venta:</strong>
              <span>${ventaSeleccionada.numero_venta}</span>
            </div>
            <div class="info-row">
              <strong>Cliente:</strong>
              <span>${ventaSeleccionada.cliente_nombre || 'Sin nombre'}</span>
            </div>
            <div class="info-row">
              <strong>Método de Pago:</strong>
              <span>${metodoPagoTexto[ventaSeleccionada.metodo_pago] || ventaSeleccionada.metodo_pago}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="productos">
              <strong style="font-size: 12px;">PRODUCTOS</strong>
              ${detallesVenta.map(item => `
                <div class="producto-item">
                  <div class="nombre">${item.nombre}</div>
                  <div class="detalle">
                    <span>${item.cantidad} x $${item.precio.toFixed(2)}</span>
                    <strong>$${item.subtotal.toFixed(2)}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="totales">
              <div class="total-item">
                <span>Subtotal:</span>
                <strong>$${Number(ventaSeleccionada.subtotal).toFixed(2)}</strong>
              </div>
              ${Number(ventaSeleccionada.descuento) > 0 ? `
                <div class="total-item">
                  <span>Descuento:</span>
                  <strong style="color: #f5222d;">-$${Number(ventaSeleccionada.descuento).toFixed(2)}</strong>
                </div>
              ` : ''}
              <div class="total-item final">
                <span>TOTAL:</span>
                <span>$${Number(ventaSeleccionada.total).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>Sistema ZARPAR</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
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
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: collapsed ? 0 : 24,
            paddingRight: collapsed ? 0 : 24,
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
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: collapsed ? 8 : 16,
          paddingRight: collapsed ? 8 : 16,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Ventas del Día */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '10px',
            paddingTop: collapsed ? 10 : 12,
            paddingBottom: collapsed ? 10 : 12,
            paddingLeft: collapsed ? 8 : 12,
            paddingRight: collapsed ? 8 : 12,
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
            paddingTop: collapsed ? 10 : 12,
            paddingBottom: collapsed ? 10 : 12,
            paddingLeft: collapsed ? 8 : 12,
            paddingRight: collapsed ? 8 : 12,
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleVerComprobante(venta.id)}
                          style={{
                            fontSize: 9,
                            height: 20,
                            padding: '0 8px',
                            borderRadius: 4
                          }}
                        >
                          Ver
                        </Button>
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

      {/* Modal de Comprobante */}
      <Modal
        title={
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircleOutlined
              style={{
                fontSize: 36,
                color: '#52c41a',
                marginBottom: 8,
                display: 'block',
              }}
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Comprobante de Venta
            </Typography.Title>
          </div>
        }
        open={modalComprobanteVisible}
        onCancel={handleCerrarComprobante}
        footer={[
          <Button key="cerrar" onClick={handleCerrarComprobante}>
            Cerrar
          </Button>,
          <Button
            key="imprimir"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={imprimirComprobante}
            disabled={!ventaSeleccionada}
          >
            Imprimir Comprobante
          </Button>,
        ]}
        width={500}
        centered
      >
        {loadingComprobante ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Cargando comprobante...</div>
          </div>
        ) : ventaSeleccionada ? (
          <div>
            {/* Información de la venta */}
            <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>N° Venta:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Tag color="blue">{ventaSeleccionada.numero_venta}</Tag>
              </Col>

              <Col span={12}>
                <Text strong>Sucursal:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text>{ventaSeleccionada.sucursal.toUpperCase()}</Text>
              </Col>

              <Col span={12}>
                <Text strong>Cliente:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text>{ventaSeleccionada.cliente_nombre || 'Sin nombre'}</Text>
              </Col>

              <Col span={12}>
                <Text strong>Fecha:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text type="secondary">
                  {new Date(ventaSeleccionada.fecha_venta).toLocaleString('es-UY', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Col>

              <Col span={12}>
                <Text strong>Método de Pago:</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Tag color="green">
                  {ventaSeleccionada.metodo_pago === 'efectivo' && 'Efectivo'}
                  {ventaSeleccionada.metodo_pago === 'transferencia' && 'Transferencia'}
                  {ventaSeleccionada.metodo_pago === 'cuenta_corriente' && 'Cuenta Corriente'}
                  {ventaSeleccionada.metodo_pago === 'tarjeta' && 'Tarjeta'}
                </Tag>
              </Col>
            </Row>

            <Divider />

            {/* Productos */}
            <Typography.Title level={5} style={{ marginBottom: 12 }}>
              Productos
            </Typography.Title>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {detallesVenta.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: '#fafafa',
                    padding: 12,
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{item.nombre}</Text>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: 4,
                    }}
                  >
                    <Text type="secondary">
                      {item.cantidad} x ${item.precio.toFixed(2)}
                    </Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      ${item.subtotal.toFixed(2)}
                    </Text>
                  </div>
                </div>
              ))}
            </Space>

            <Divider />

            {/* Totales */}
            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text>Subtotal:</Text>
                <Text strong>${Number(ventaSeleccionada.subtotal).toFixed(2)}</Text>
              </div>
              {Number(ventaSeleccionada.descuento) > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text>Descuento:</Text>
                  <Text strong style={{ color: '#f5222d' }}>
                    -${Number(ventaSeleccionada.descuento).toFixed(2)}
                  </Text>
                </div>
              )}
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  TOTAL:
                </Typography.Title>
                <Typography.Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                  ${Number(ventaSeleccionada.total).toFixed(2)}
                </Typography.Title>
              </div>
            </div>

            <Divider />

            {/* Footer */}
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">¡Gracias por su compra!</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sistema ZARPAR
              </Text>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No se encontró el comprobante</Text>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default MainLayout;