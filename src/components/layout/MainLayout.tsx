import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme, Tag, Spin, Space, Typography, Empty, Button, Modal, Divider, Row, Col, Statistic, Card, Upload, message, Badge, Drawer, Table, Alert, Tooltip } from 'antd';
import ReactSelect, { StylesConfig } from 'react-select';
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
  WalletOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { menuItems } from '../../utils/menuItems';
import { useAuth } from '../../contexts/AuthContext';
import { useCaja } from '../../contexts/CajaContext';
import { ventasService, cajaService, vendedoresService } from '../../services/api';
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
  
  // Estados para caja en el header
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [casaPrincipal, setCasaPrincipal] = useState<string>('');
  const [sucursalSeleccionadaCaja, setSucursalSeleccionadaCaja] = useState<string>('');
  const [loadingCaja, setLoadingCaja] = useState(false);
  
  // Usar contexto de caja para compartir estado entre componentes
  const { montoCaja, setMontoCaja, triggerActualizacion } = useCaja();
  
  // Estados para personalización de logo
  const [modalPersonalizarVisible, setModalPersonalizarVisible] = useState(false);
  const [logoEmpresa, setLogoEmpresa] = useState<string | null>(null);
  const [faviconEmpresa, setFaviconEmpresa] = useState<string | null>(null);
  
  // ⭐ Estados para alertas de stock bajo
  const [alertasStock, setAlertasStock] = useState<any[]>([]);
  const [modalAlertasVisible, setModalAlertasVisible] = useState(false);
  const [loadingAlertas, setLoadingAlertas] = useState(false);
  const [filtroSucursalAlertas, setFiltroSucursalAlertas] = useState<string>('todas');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { usuario, isAuthenticated, isLoading, logout } = useAuth();

  // ⭐ Estilos personalizados para react-select
  const customSelectStyles: StylesConfig = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      borderColor: state.isFocused ? '#1890ff' : '#d9d9d9',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#1890ff'
      },
      cursor: 'pointer',
      borderRadius: '6px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#1890ff' 
        : state.isFocused 
        ? '#e6f7ff' 
        : 'white',
      color: state.isSelected ? 'white' : '#262626',
      cursor: 'pointer',
      padding: '8px 12px',
      '&:active': {
        backgroundColor: '#1890ff'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#262626'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 9999
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999
    })
  };

  // Función para actualizar el favicon dinámicamente
  const actualizarFavicon = (base64: string) => {
    try {
      console.log('🔄 Actualizando favicon...');
      
      if (!base64 || typeof base64 !== 'string') {
        console.error('❌ Base64 inválido:', base64);
        return;
      }
      
      // Eliminar todos los favicons existentes para forzar actualización en Chrome
      const existingFavicons = document.querySelectorAll("link[rel*='icon']");
      console.log(`🗑️ Eliminando ${existingFavicons.length} favicons existentes`);
      existingFavicons.forEach(link => {
        try {
          link.remove();
        } catch (e) {
          console.warn('No se pudo eliminar favicon:', e);
        }
      });
      
      // Crear nuevo favicon con timestamp para evitar cache
      const timestamp = new Date().getTime();
      const faviconUrl = `${base64}?t=${timestamp}`;
      console.log(`⏰ Timestamp agregado: ${timestamp}`);
      
      // Agregar favicon estándar
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = faviconUrl;
      document.head.appendChild(link);
      console.log('✅ Favicon estándar agregado');
      
      // Agregar shortcut icon (para compatibilidad con navegadores antiguos)
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/x-icon';
      shortcutLink.href = faviconUrl;
      document.head.appendChild(shortcutLink);
      console.log('✅ Shortcut icon agregado');
      
      // Forzar recarga del favicon en Chrome
      // Truco: cambiar y restaurar el href para forzar actualización
      setTimeout(() => {
        try {
          link.href = link.href;
          console.log('🔁 Favicon forzado a recargar');
        } catch (e) {
          console.warn('No se pudo forzar recarga:', e);
        }
      }, 100);
      
      console.log('✅ Favicon actualizado completamente');
    } catch (error) {
      console.error('❌ Error al actualizar favicon:', error);
      message.error('Error al actualizar el favicon');
    }
  };

  // Cargar logo y favicon desde localStorage al iniciar
  useEffect(() => {
    try {
      console.log('🚀 Cargando logos desde localStorage...');
      
      const logoGuardado = localStorage.getItem('logoEmpresa');
      if (logoGuardado) {
        console.log('✅ Logo empresarial encontrado');
        setLogoEmpresa(logoGuardado);
      } else {
        console.log('⚠️ No hay logo empresarial guardado');
      }
      
      const faviconGuardado = localStorage.getItem('faviconEmpresa');
      if (faviconGuardado) {
        console.log('✅ Favicon encontrado, actualizando...');
        setFaviconEmpresa(faviconGuardado);
        actualizarFavicon(faviconGuardado);
      } else {
        console.log('⚠️ No hay favicon guardado, usando el por defecto');
      }
    } catch (error) {
      console.error('❌ Error al cargar logos desde localStorage:', error);
    }
  }, []);

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
        
        // Obtener ventas según rol del usuario
        if (usuario) {
          let ventas;
          if (usuario.esAdmin) {
            // Admin obtiene las 3 últimas ventas globales
            ventas = await ventasService.obtenerUltimas(3);
          } else {
            // Usuario normal obtiene las 3 últimas ventas de SU sucursal
            const sucursalUsuario = usuario.sucursal?.toLowerCase() || '';
            ventas = await ventasService.obtenerUltimas(3, sucursalUsuario);
          }
        setUltimasVentas(ventas);
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
      
      // Obtener ventas según rol del usuario
      if (usuario) {
        let ventas;
        if (usuario.esAdmin) {
          // Admin obtiene las 3 últimas ventas globales
          ventas = await ventasService.obtenerUltimas(3);
        } else {
          // Usuario normal obtiene las 3 últimas ventas de SU sucursal
          const sucursalUsuario = usuario.sucursal?.toLowerCase() || '';
          ventas = await ventasService.obtenerUltimas(3, sucursalUsuario);
        }
      setUltimasVentas(ventas);
      }
    } catch (error) {
      console.error('Error al refrescar ventas:', error);
    } finally {
      setLoadingVentas(false);
    }
  };

  // Cargar sucursales
  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        const sucursalesDisponibles = await vendedoresService.obtenerSucursales();
        setSucursales(sucursalesDisponibles);
        
        // Casa principal por defecto es la primera sucursal
        // TODO: En el futuro, obtener esto desde la configuración de la base de datos
        const casaPrincipalNombre = sucursalesDisponibles[0] || '';
        setCasaPrincipal(casaPrincipalNombre);
        
        // Determinar sucursal inicial para mostrar caja
        if (usuario) {
          if (usuario.esAdmin) {
            // Admin: mostrar casa principal por defecto
            setSucursalSeleccionadaCaja(casaPrincipalNombre);
          } else {
            // Usuario normal: su propia sucursal
            setSucursalSeleccionadaCaja(usuario.sucursal?.toLowerCase() || '');
          }
        }
      } catch (error) {
        console.error('Error al cargar sucursales:', error);
      }
    };
    
    if (usuario) {
      cargarSucursales();
    }
  }, [usuario]);
  
  // Cargar monto de caja
  const cargarMontoCaja = async (sucursal: string) => {
    if (!sucursal) {
      console.log('⚠️ No hay sucursal para cargar caja');
      return;
    }
    
    console.log('📥 Cargando monto de caja para sucursal:', sucursal);
    setLoadingCaja(true);
    try {
      const data = await cajaService.obtenerCaja(sucursal);
      const montoNuevo = data?.monto_actual || 0;
      console.log('💵 Monto de caja recibido:', montoNuevo);
      setMontoCaja(montoNuevo);
      console.log('✅ Estado de montoCaja actualizado');
    } catch (error) {
      console.error('❌ Error al cargar monto de caja:', error);
      setMontoCaja(0);
    } finally {
      setLoadingCaja(false);
    }
  };
  
  // Efecto para cargar caja cuando cambia la sucursal seleccionada
  useEffect(() => {
    if (sucursalSeleccionadaCaja) {
      cargarMontoCaja(sucursalSeleccionadaCaja);
      
      // Actualizar cada 2 minutos
      const interval = setInterval(() => {
        cargarMontoCaja(sucursalSeleccionadaCaja);
      }, 2 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [sucursalSeleccionadaCaja]);
  
  // Efecto para recargar caja cuando se dispara actualización desde otros componentes
  useEffect(() => {
    if (triggerActualizacion > 0 && sucursalSeleccionadaCaja) {
      console.log('🔄 Trigger de actualización detectado:', triggerActualizacion);
      cargarMontoCaja(sucursalSeleccionadaCaja);
    }
  }, [triggerActualizacion]);

  // ⭐ Función para cargar alertas de stock bajo
  const cargarAlertasStock = async () => {
    if (!usuario?.esAdmin) return; // Solo para administradores
    
    setLoadingAlertas(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const response = await fetch(`${API_URL}/productos/alertas-stock`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlertasStock(data.data || []);
        console.log(`⚠️ ${data.data?.length || 0} alertas de stock detectadas`);
      }
    } catch (error) {
      console.error('Error al cargar alertas de stock:', error);
    } finally {
      setLoadingAlertas(false);
    }
  };
  
  // Efecto para cargar alertas de stock (solo admin)
  useEffect(() => {
    if (usuario?.esAdmin) {
      cargarAlertasStock();
      
      // Actualizar cada 5 minutos
      const interval = setInterval(cargarAlertasStock, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [usuario]);

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
      case 'database':
        navigate('/admin/database');
        break;
      case 'customize':
        setModalPersonalizarVisible(true);
        break;
      case 'logout':
        await logout();
        navigate('/login', { replace: true });
        break;
    }
  };

  // Función para manejar la subida del logo
  const handleUploadLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogoEmpresa(base64);
      localStorage.setItem('logoEmpresa', base64);
      message.success('Logo actualizado correctamente');
    };
    reader.readAsDataURL(file);
    return false; // Prevenir upload automático
  };

  // Función para eliminar el logo
  const handleEliminarLogo = () => {
    setLogoEmpresa(null);
    localStorage.removeItem('logoEmpresa');
    message.success('Logo eliminado correctamente');
  };

  // Función para manejar la subida del favicon
  const handleUploadFavicon = (file: File) => {
    try {
      console.log('📤 Subiendo favicon:', file.name, file.type, file.size);
      
      // Validar el archivo
      if (!file) {
        message.error('No se seleccionó ningún archivo');
        return false;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        message.error('El archivo es muy grande. Máximo 2MB.');
        return false;
      }
      
      // Validar tipo de archivo
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        message.warning('Formato no recomendado. Usa PNG, ICO o SVG.');
      }
      
      const reader = new FileReader();
      
      reader.onerror = (error) => {
        console.error('❌ Error al leer el archivo:', error);
        message.error('Error al leer el archivo');
      };
      
      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string;
          
          if (!base64 || typeof base64 !== 'string') {
            console.error('❌ Base64 inválido');
            message.error('Error al procesar la imagen');
            return;
          }
          
          console.log('✅ Favicon convertido a base64, longitud:', base64.length);
          
          setFaviconEmpresa(base64);
          localStorage.setItem('faviconEmpresa', base64);
          console.log('💾 Favicon guardado en localStorage');
          
          actualizarFavicon(base64);
          console.log('🔄 Favicon actualizado en DOM');
          
          message.success('Favicon actualizado correctamente');
        } catch (error) {
          console.error('❌ Error al procesar el favicon:', error);
          message.error('Error al procesar el favicon');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Error al subir favicon:', error);
      message.error('Error al subir el favicon');
    }
    
    return false; // Prevenir upload automático
  };

  // Función para eliminar el favicon
  const handleEliminarFavicon = () => {
    setFaviconEmpresa(null);
    localStorage.removeItem('faviconEmpresa');
    
    // Eliminar todos los favicons existentes
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(link => link.remove());
    
    // Restaurar favicon original con timestamp para evitar cache
    const timestamp = new Date().getTime();
    const faviconUrl = `/favicon.svg?t=${timestamp}`;
    
    // Agregar favicon estándar
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = faviconUrl;
    document.head.appendChild(link);
    
    // Agregar shortcut icon
    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = 'image/svg+xml';
    shortcutLink.href = faviconUrl;
    document.head.appendChild(shortcutLink);
    
    message.success('Favicon eliminado correctamente');
  };

  // Verificar si el usuario es administrador
  const esAdministrador = usuario?.email === 'admin@zarparuy.com';

  const userMenuItems = [
    // Opciones solo para administrador
    ...(esAdministrador ? [{
      key: 'database',
      icon: <DatabaseOutlined />,
      label: 'Base de Datos',
    }, {
      key: 'customize',
      icon: <PictureOutlined />,
      label: 'Personalizar',
    }] : []),
    ...(esAdministrador ? [{
      type: 'divider' as const,
    }] : []),
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
              {logoEmpresa ? (
                <img 
                  src={logoEmpresa} 
                  alt="Logo" 
                  style={{
                    maxWidth: '291px',
                    maxHeight: '100px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <>
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
                      flexShrink: 0,
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
                </>
              )}
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
          {/* Caja en el centro del header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Selector de sucursal (solo admin) */}
            {usuario?.esAdmin && (
              <div style={{ width: 140 }}>
                <ReactSelect
                  value={{
                    value: sucursalSeleccionadaCaja,
                    label: sucursalSeleccionadaCaja.toUpperCase()
                  }}
                  onChange={(option) => {
                    if (option) {
                      setSucursalSeleccionadaCaja(option.value);
                    }
                  }}
                  options={sucursales.map(s => ({
                    value: s,
                    label: s.toUpperCase()
                  }))}
                  styles={customSelectStyles}
                  isClearable={false}
                  isSearchable={false}
                  isLoading={loadingCaja}
                  placeholder="Sucursal"
                  noOptionsMessage={() => 'No hay sucursales'}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            )}
            
            {/* Div verde con la caja */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)',
            }}>
              <WalletOutlined style={{ fontSize: 20, color: 'white' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>
                  Caja {!usuario?.esAdmin ? sucursalSeleccionadaCaja.toUpperCase() : ''}
                </Text>
                <Text strong style={{ fontSize: 16, color: 'white', lineHeight: 1.2 }}>
                  {loadingCaja ? (
                    <Spin size="small" style={{ color: 'white' }} />
                  ) : (
                    `$${montoCaja.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  )}
                </Text>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* ⭐ Botón de Alertas de Stock (solo admin) */}
            {usuario?.esAdmin && alertasStock.length > 0 && (
              <Tooltip title={`${alertasStock.length} productos con stock bajo o agotado`}>
                <Badge count={alertasStock.length} overflowCount={99}>
                  <Button
                    danger
                    size="large"
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => setModalAlertasVisible(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 'bold',
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    Alertas de Stock
                  </Button>
                </Badge>
              </Tooltip>
            )}
            
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

      {/* Modal de Personalización de Logo */}
      <Modal
        title={
          <span style={{ color: '#000' }}>
            <PictureOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Personalizar Logo de la Empresa
          </span>
        }
        open={modalPersonalizarVisible}
        onCancel={() => setModalPersonalizarVisible(false)}
        footer={null}
        width={900}
      >
        <div style={{ padding: '20px 0' }}>
          <Row gutter={24}>
            {/* COLUMNA 1: LOGO */}
            <Col xs={24} md={12}>
              <div style={{ 
                padding: 16, 
                background: '#fafafa', 
                borderRadius: 8,
                height: '100%',
                border: '1px solid #e8e8e8'
              }}>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 16, 
                  fontSize: 16,
                  color: '#1890ff'
                }}>
                  🖼️ Logo Empresarial
                </Text>
                
                {/* Vista previa del logo actual */}
                {logoEmpresa && (
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Text style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#666' }}>
                      Logo Actual:
                    </Text>
                    <div
                      style={{
                        padding: 16,
                        background: '#fff',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 80,
                        border: '1px dashed #d9d9d9',
                      }}
                    >
                      <img
                        src={logoEmpresa}
                        alt="Logo actual"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100px',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleEliminarLogo}
                      style={{ marginTop: 8 }}
                      size="small"
                    >
                      Eliminar Logo
                    </Button>
                  </div>
                )}

                {/* Subir nuevo logo */}
                <div style={{ marginTop: logoEmpresa ? 16 : 0 }}>
                  <Text style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#666' }}>
                    {logoEmpresa ? 'Cambiar Logo:' : 'Subir Logo:'}
                  </Text>
                  <Upload.Dragger
                    name="logo"
                    accept="image/*"
                    beforeUpload={handleUploadLogo}
                    showUploadList={false}
                    style={{ padding: '24px 12px' }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: 13 }}>
                      Haz clic o arrastra aquí
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#999', fontSize: 11 }}>
                      JPG, PNG, GIF, SVG
                      <br />
                      Recomendado: 600x200 px (máx: 291x100px en sidebar)
                    </p>
                  </Upload.Dragger>
                </div>

                {/* Información del logo */}
                <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 6 }}>
                  <Text strong style={{ color: '#1890ff', display: 'block', marginBottom: 6, fontSize: 12 }}>
                    ℹ️ Uso:
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: 16, color: '#666', fontSize: 11, lineHeight: 1.6 }}>
                    <li>Sidebar de la aplicación</li>
                    <li>Reportes PDF</li>
                    <li>Imagen horizontal preferida</li>
                  </ul>
                </div>
              </div>
            </Col>

            {/* COLUMNA 2: FAVICON */}
            <Col xs={24} md={12}>
              <div style={{ 
                padding: 16, 
                background: '#fafafa', 
                borderRadius: 8,
                height: '100%',
                border: '1px solid #e8e8e8'
              }}>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 16, 
                  fontSize: 16,
                  color: '#52c41a'
                }}>
                  🌐 Favicon (Miniatura)
                </Text>
                
                {/* Vista previa del favicon actual */}
                {faviconEmpresa && (
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Text style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#666' }}>
                      Favicon Actual:
                    </Text>
                    <div
                      style={{
                        padding: 16,
                        background: '#fff',
                        borderRadius: 8,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 80,
                        border: '1px dashed #d9d9d9',
                      }}
                    >
                      <img
                        src={faviconEmpresa}
                        alt="Favicon actual"
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleEliminarFavicon}
                      style={{ marginTop: 8 }}
                      size="small"
                    >
                      Eliminar Favicon
                    </Button>
                  </div>
                )}

                {/* Subir nuevo favicon */}
                <div style={{ marginTop: faviconEmpresa ? 16 : 0 }}>
                  <Text style={{ display: 'block', marginBottom: 8, fontSize: 12, color: '#666' }}>
                    {faviconEmpresa ? 'Cambiar Favicon:' : 'Subir Favicon:'}
                  </Text>
                  <Upload.Dragger
                    name="favicon"
                    accept="image/*"
                    beforeUpload={handleUploadFavicon}
                    showUploadList={false}
                    style={{ padding: '24px 12px' }}
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: 13 }}>
                      Haz clic o arrastra aquí
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#999', fontSize: 11 }}>
                      ICO, PNG (cuadrado)
                      <br />
                      Recomendado: 64x64 px o 32x32 px
                    </p>
                  </Upload.Dragger>
                </div>

                {/* Información del favicon */}
                <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 6 }}>
                  <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: 6, fontSize: 12 }}>
                    ℹ️ Uso:
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: 16, color: '#666', fontSize: 11, lineHeight: 1.6 }}>
                    <li>Pestaña del navegador</li>
                    <li>Favoritos/marcadores</li>
                    <li>Barra de direcciones</li>
                    <li>Usa imagen cuadrada</li>
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>

      {/* ⭐ Drawer de Alertas de Stock */}
      <Drawer
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
            <span style={{ fontSize: 18, fontWeight: 'bold' }}>
              Alertas de Stock ({alertasStock.filter(a => filtroSucursalAlertas === 'todas' || a.sucursal === filtroSucursalAlertas).length} de {alertasStock.length})
            </span>
          </Space>
        }
        placement="right"
        width={900}
        open={modalAlertasVisible}
        onClose={() => {
          setModalAlertasVisible(false);
          setFiltroSucursalAlertas('todas'); // Reset filtro al cerrar
        }}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={cargarAlertasStock}
            loading={loadingAlertas}
          >
            Actualizar
          </Button>
        }
      >
        <Alert
          message="⚠️ Productos con Stock Bajo o Agotado"
          description="Los productos listados tienen un stock mínimo configurado y su stock actual está por debajo de ese mínimo. Solo aparecen productos con alertas configuradas (stock_minimo > 0)."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Filtro de Sucursales */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col>
              <Text strong>Filtrar por Sucursal:</Text>
            </Col>
            <Col flex="auto">
              <ReactSelect
                value={
                  filtroSucursalAlertas === 'todas'
                    ? { value: 'todas', label: '🌐 Todas las Sucursales' }
                    : { 
                        value: filtroSucursalAlertas, 
                        label: `🏪 ${filtroSucursalAlertas.charAt(0).toUpperCase() + filtroSucursalAlertas.slice(1)}` 
                      }
                }
                onChange={(option) => {
                  if (option) {
                    setFiltroSucursalAlertas(option.value);
                  }
                }}
                options={[
                  { value: 'todas', label: '🌐 Todas las Sucursales' },
                  ...sucursales.map(s => ({
                    value: s,
                    label: `🏪 ${s.charAt(0).toUpperCase() + s.slice(1)}`
                  }))
                ]}
                styles={customSelectStyles}
                isClearable={false}
                isSearchable={true}
                placeholder="Seleccionar sucursal"
                noOptionsMessage={() => 'No hay sucursales disponibles'}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </Col>
            <Col>
              <Text type="secondary">
                Mostrando: {alertasStock.filter(a => filtroSucursalAlertas === 'todas' || a.sucursal === filtroSucursalAlertas).length} alertas
              </Text>
            </Col>
          </Row>
        </Card>
        
        <Table
          dataSource={alertasStock.filter(a => filtroSucursalAlertas === 'todas' || a.sucursal === filtroSucursalAlertas)}
          rowKey={(record) => `${record.producto_id}-${record.sucursal}`}
          loading={loadingAlertas}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
          columns={[
            {
              title: 'Producto',
              dataIndex: 'nombre',
              key: 'nombre',
              width: 200,
              fixed: 'left',
              render: (text: string) => <Text strong>{text}</Text>
            },
            {
              title: 'Marca',
              dataIndex: 'marca',
              key: 'marca',
              width: 100,
              render: (marca: string) => marca || '-'
            },
            {
              title: 'Tipo',
              dataIndex: 'tipo',
              key: 'tipo',
              width: 100,
              render: (tipo: string) => <Tag color="blue">{tipo}</Tag>
            },
            {
              title: 'Sucursal',
              dataIndex: 'sucursal',
              key: 'sucursal',
              width: 120,
              render: (sucursal: string) => (
                <Tag color="purple">{sucursal.toUpperCase()}</Tag>
              )
            },
            {
              title: 'Stock Actual',
              dataIndex: 'stock',
              key: 'stock',
              width: 100,
              align: 'center',
              render: (stock: number, record: any) => {
                // Si stock = 0 y tiene stock_minimo configurado, es AGOTADO
                if (stock === 0 && record.stock_minimo > 0) {
                  return <Tag color="red" style={{ fontSize: '13px', fontWeight: 'bold' }}>⛔ AGOTADO</Tag>;
                }
                // Si stock < stock_minimo pero > 0, es STOCK BAJO
                return <Tag color="orange" style={{ fontSize: '13px', fontWeight: 'bold' }}>⚠️ {stock}</Tag>;
              }
            },
            {
              title: 'Stock Mínimo',
              dataIndex: 'stock_minimo',
              key: 'stock_minimo',
              width: 100,
              align: 'center',
              render: (stock_minimo: number) => (
                <Tag color="default">{stock_minimo || 0}</Tag>
              )
            },
            {
              title: 'Estado',
              key: 'estado',
              width: 120,
              render: (_, record: any) => {
                // Solo mostrar estados si stock_minimo está configurado (> 0)
                if (record.stock_minimo > 0) {
                  if (record.stock === 0) {
                    return <Tag color="red">🔴 AGOTADO</Tag>;
                  } else if (record.stock < record.stock_minimo) {
                    return <Tag color="orange">⚠️ STOCK BAJO</Tag>;
                  }
                }
                // Si no tiene stock_minimo configurado, no debería estar en esta lista
                return <Tag color="green">✅ NORMAL</Tag>;
              }
            },
            {
              title: 'Acción',
              key: 'accion',
              width: 120,
              fixed: 'right',
              render: (_, record: any) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    navigate('/products');
                    setModalAlertasVisible(false);
                  }}
                >
                  Ver Productos
                </Button>
              )
            }
          ]}
          rowClassName={(record) => {
            // Solo productos con stock_minimo > 0 aparecen en esta tabla
            if (record.stock === 0 && record.stock_minimo > 0) {
              return 'row-agotado';
            }
            return 'row-stock-bajo';
          }}
        />
      </Drawer>
    </Layout>
  );
};

export default MainLayout;