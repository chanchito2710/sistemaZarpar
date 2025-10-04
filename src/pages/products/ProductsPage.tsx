import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Input,
  Card,
  Button,
  Select,
  Row,
  Col,
  Badge,
  Typography,
  Space,
  Drawer,
  List,
  InputNumber,
  Divider,
  Tag,
  Avatar,
  Tooltip,
  notification,
  Empty,
  Affix,
  Modal,
  Radio,
  Result
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  FilePdfOutlined,
  FilterOutlined,
  MobileOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  GiftOutlined,
  StarOutlined,
  DollarOutlined,
  CreditCardOutlined,
  BankOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface LocationState {
  branch: string;
  client: string;
  seller: string;
}

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [selectedBrand, setSelectedBrand] = useState('Todo');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Datos de productos
  const products: Product[] = [
    // Displays
    { id: '1', name: 'Display iPhone 12', category: 'Display', brand: 'iPhone', price: 150, stock: 15, description: 'Pantalla OLED original' },
    { id: '2', name: 'Display Samsung A54', category: 'Display', brand: 'Samsung', price: 80, stock: 20, description: 'Pantalla AMOLED' },
    { id: '3', name: 'Display Xiaomi Redmi Note 12', category: 'Display', brand: 'Xiaomi', price: 60, stock: 12, description: 'Pantalla IPS' },
    { id: '4', name: 'Display Huawei P40', category: 'Display', brand: 'Huawei', price: 90, stock: 8, description: 'Pantalla OLED' },
    
    // Baterías
    { id: '5', name: 'Batería iPhone 13', category: 'Baterías', brand: 'iPhone', price: 45, stock: 25, description: '3240mAh Li-ion' },
    { id: '6', name: 'Batería Samsung S23', category: 'Baterías', brand: 'Samsung', price: 35, stock: 30, description: '3900mAh Li-ion' },
    { id: '7', name: 'Batería Xiaomi Mi 11', category: 'Baterías', brand: 'Xiaomi', price: 25, stock: 18, description: '4600mAh Li-Po' },
    { id: '8', name: 'Batería TCL 20 Pro', category: 'Baterías', brand: 'TCL', price: 28, stock: 10, description: '4500mAh Li-Po' },
    
    // Placas de carga
    { id: '9', name: 'Placa Carga iPhone 14', category: 'Placa Carga', brand: 'iPhone', price: 30, stock: 15, description: 'Conector Lightning' },
    { id: '10', name: 'Placa Carga Samsung A34', category: 'Placa Carga', brand: 'Samsung', price: 20, stock: 22, description: 'Conector USB-C' },
    { id: '11', name: 'Placa Carga Huawei P40', category: 'Placa Carga', brand: 'Huawei', price: 25, stock: 12, description: 'Conector USB-C' },
    
    // Pines de carga
    { id: '12', name: 'Pin Carga USB-C', category: 'Pin de Carga', brand: 'Todo', price: 5, stock: 50, description: 'Universal USB-C' },
    { id: '13', name: 'Pin Carga Lightning', category: 'Pin de Carga', brand: 'iPhone', price: 8, stock: 35, description: 'Conector Lightning' },
    { id: '14', name: 'Pin Carga Micro USB', category: 'Pin de Carga', brand: 'Todo', price: 3, stock: 40, description: 'Universal Micro USB' },
    
    // Flex
    { id: '15', name: 'Flex Botón Home iPhone', category: 'Flex', brand: 'iPhone', price: 15, stock: 20, description: 'Flex con Touch ID' },
    { id: '16', name: 'Flex Volumen Samsung', category: 'Flex', brand: 'Samsung', price: 12, stock: 25, description: 'Flex botones laterales' },
    { id: '17', name: 'Flex Power Xiaomi', category: 'Flex', brand: 'Xiaomi', price: 10, stock: 18, description: 'Flex botón encendido' },
    
    // Carcasas
    { id: '18', name: 'Carcasa iPhone 12 Pro', category: 'Carcasa', brand: 'iPhone', price: 25, stock: 15, description: 'Marco de aluminio' },
    { id: '19', name: 'Carcasa Samsung A54', category: 'Carcasa', brand: 'Samsung', price: 18, stock: 20, description: 'Marco plástico' },
    { id: '20', name: 'Carcasa ZTE Blade', category: 'Carcasa', brand: 'ZTE', price: 12, stock: 8, description: 'Marco básico' },
    
    // Tapas traseras
    { id: '21', name: 'Tapa Trasera iPhone 13', category: 'Tapa Trasera', brand: 'iPhone', price: 20, stock: 12, description: 'Cristal con logo' },
    { id: '22', name: 'Tapa Trasera Xiaomi Redmi', category: 'Tapa Trasera', brand: 'Xiaomi', price: 15, stock: 18, description: 'Plástico premium' },
    { id: '23', name: 'Tapa Trasera Samsung A34', category: 'Tapa Trasera', brand: 'Samsung', price: 16, stock: 14, description: 'Plástico texturizado' },
    
    // Hidrogeles
    { id: '24', name: 'Hidrogel Universal', category: 'Hidrogel', brand: 'Todo', price: 3, stock: 100, description: 'Protector universal' },
    { id: '25', name: 'Hidrogel iPhone Específico', category: 'Hidrogel', brand: 'iPhone', price: 5, stock: 60, description: 'Corte perfecto iPhone' },
    { id: '26', name: 'Hidrogel Samsung Premium', category: 'Hidrogel', brand: 'Samsung', price: 4, stock: 80, description: 'Anti-reflejo' },
    
    // Herramientas
    { id: '27', name: 'Kit Destornilladores', category: 'Herramientas', brand: 'Todo', price: 12, stock: 25, description: 'Set completo 32 piezas' },
    { id: '28', name: 'Ventosas Profesionales', category: 'Herramientas', brand: 'Todo', price: 8, stock: 30, description: 'Doble ventosa' },
    { id: '29', name: 'Palancas Plásticas', category: 'Herramientas', brand: 'Todo', price: 6, stock: 40, description: 'Set 6 palancas' },
    { id: '30', name: 'Pistola Calor', category: 'Herramientas', brand: 'Todo', price: 35, stock: 8, description: 'Temperatura regulable' }
  ];

  const categories = ['Todo', 'Display', 'Baterías', 'Placa Carga', 'Pin de Carga', 'Flex', 'Carcasa', 'Tapa Trasera', 'Hidrogel', 'Herramientas'];
  const brands = ['Todo', 'iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'TCL', 'ZTE'];

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todo' || product.category === selectedCategory;
      const matchesBrand = selectedBrand === 'Todo' || product.brand === selectedBrand;
      
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [searchTerm, selectedCategory, selectedBrand]);

  // Funciones del carrito
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    
    notification.success({
      message: 'Producto agregado',
      description: `${product.name} agregado al carrito`,
      placement: 'topRight',
      duration: 2
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(cartItems.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Funciones del checkout
  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      notification.warning({
        message: 'Carrito vacío',
        description: 'Agrega productos al carrito antes de finalizar la venta'
      });
      return;
    }
    setCartVisible(false);
    setCheckoutVisible(true);
  };

  const handlePaymentMethodChange = (e: any) => {
    setPaymentMethod(e.target.value);
  };

  const handleCompleteSale = () => {
    if (!paymentMethod) {
      notification.warning({
        message: 'Método de pago requerido',
        description: 'Selecciona un método de pago para continuar'
      });
      return;
    }

    setLoading(true);
    
    // Simular procesamiento
    setTimeout(() => {
      const newInvoiceNumber = `INV-${Date.now()}`;
      setInvoiceNumber(newInvoiceNumber);
      
      // Guardar venta en localStorage
      const sale = {
        invoiceNumber: newInvoiceNumber,
        items: cartItems,
        total: getTotalAmount(),
        paymentMethod,
        date: new Date().toISOString(),
        branch: location.state?.branch || 'Sucursal Principal',
        client: location.state?.client || 'Cliente General',
        seller: location.state?.seller || 'Vendedor'
      };
      
      const existingSales = JSON.parse(localStorage.getItem('sales') || '[]');
      existingSales.push(sale);
      localStorage.setItem('sales', JSON.stringify(existingSales));
      
      setLoading(false);
      setCheckoutVisible(false);
      setSuccessVisible(true);
      
      // Auto cerrar después de 5 segundos
      setTimeout(() => {
        handleNewSale();
      }, 5000);
    }, 2000);
  };

  const handleNewSale = () => {
    setCartItems([]);
    setPaymentMethod('');
    setSuccessVisible(false);
    setInvoiceNumber('');
  };

  const handlePrintInvoice = () => {
    generatePDF();
    notification.success({
      message: 'Factura generada',
      description: 'La factura se ha generado correctamente'
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Generar PDF
  const generatePDF = () => {
    if (cartItems.length === 0) {
      notification.warning({
        message: 'Carrito vacío',
        description: 'Agrega productos al carrito antes de generar la factura'
      });
      return;
    }

    setLoading(true);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('FACTURA DE VENTA', pageWidth / 2, 20, { align: 'center' });
    
    // Información de la venta
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Sucursal: ${state?.branch || 'N/A'}`, 20, 50);
    doc.text(`Cliente: ${state?.client || 'N/A'}`, 20, 60);
    doc.text(`Vendedor: ${state?.seller || 'N/A'}`, 20, 70);
    
    // Línea separadora
    doc.line(20, 80, pageWidth - 20, 80);
    
    // Headers de la tabla
    doc.setFontSize(10);
    doc.text('Producto', 20, 95);
    doc.text('Cant.', 120, 95);
    doc.text('Precio', 140, 95);
    doc.text('Total', 170, 95);
    
    // Línea bajo headers
    doc.line(20, 100, pageWidth - 20, 100);
    
    // Productos
    let yPosition = 110;
    cartItems.forEach((item) => {
      doc.text(item.name.substring(0, 35), 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`$${item.price}`, 140, yPosition);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });
    
    // Total
    doc.line(20, yPosition + 5, pageWidth - 20, yPosition + 5);
    doc.setFontSize(14);
    doc.text(`TOTAL: $${getTotalAmount().toFixed(2)}`, pageWidth - 60, yPosition + 20, { align: 'right' });
    
    // Guardar PDF
    doc.save(`factura_${new Date().getTime()}.pdf`);
    
    setLoading(false);
    notification.success({
      message: 'PDF generado',
      description: 'La factura se ha descargado correctamente'
    });
  };

  // Iconos por categoría
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Display': <MobileOutlined style={{ color: '#1890ff' }} />,
      'Baterías': <ThunderboltOutlined style={{ color: '#52c41a' }} />,
      'Placa Carga': <SafetyOutlined style={{ color: '#faad14' }} />,
      'Pin de Carga': <SafetyOutlined style={{ color: '#fa8c16' }} />,
      'Flex': <AppstoreOutlined style={{ color: '#eb2f96' }} />,
      'Carcasa': <MobileOutlined style={{ color: '#722ed1' }} />,
      'Tapa Trasera': <MobileOutlined style={{ color: '#13c2c2' }} />,
      'Hidrogel': <SafetyOutlined style={{ color: '#a0d911' }} />,
      'Herramientas': <ToolOutlined style={{ color: '#f5222d' }} />
    };
    return iconMap[category] || <AppstoreOutlined />;
  };

  // Sugerencias proactivas
  const getProductSuggestions = (product: Product) => {
    const suggestions = [];
    
    if (product.category === 'Display') {
      suggestions.push('💡 Sugerencia: Agrega herramientas para la instalación');
    }
    if (product.category === 'Baterías') {
      suggestions.push('🔧 Recomendado: Kit de destornilladores para el cambio');
    }
    if (product.price > 50) {
      suggestions.push('💰 Descuento: 5% en compras mayores a $200');
    }
    
    return suggestions;
  };

  if (!state) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Title level={3}>Acceso no autorizado</Title>
        <Text>Debes seleccionar sucursal, cliente y vendedor primero.</Text>
        <br /><br />
        <Button type="primary" onClick={() => navigate('/pos')}>Volver al POS</Button>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <Header style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>📱 Productos Celulares</Title>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            <Space><ShopOutlined style={{ color: '#52c41a' }} /> {state.branch}</Space>
            <Space><UserOutlined style={{ color: '#1890ff' }} /> {state.client}</Space>
            <Space><UserOutlined style={{ color: '#fa8c16' }} /> {state.seller}</Space>
            <Space><CalendarOutlined style={{ color: '#722ed1' }} /> {new Date().toLocaleDateString()}</Space>
          </div>
        </div>
        
        <Affix offsetTop={10}>
          <Badge count={getTotalItems()} size="small">
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />} 
              size="large"
              onClick={() => setCartVisible(true)}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                border: 'none',
                borderRadius: '25px',
                height: '45px',
                paddingLeft: '20px',
                paddingRight: '20px'
              }}
            >
              Carrito ${getTotalAmount().toFixed(2)}
            </Button>
          </Badge>
        </Affix>
      </Header>

      <Layout>
        {/* Sidebar con filtros */}
        <Sider 
          width={280} 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            margin: '16px 0 16px 16px',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '24px' }}>
            <Title level={4} style={{ color: '#1890ff', marginBottom: '20px' }}>
              <FilterOutlined /> Filtros
            </Title>
            
            {/* Búsqueda */}
            <div style={{ marginBottom: '20px' }}>
              <Text strong>Buscar productos:</Text>
              <Input
                placeholder="Buscar por nombre o descripción..."
                prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginTop: '8px', borderRadius: '8px' }}
                size="large"
              />
            </div>
            
            {/* Filtro por categoría */}
            <div style={{ marginBottom: '20px' }}>
              <Text strong>Categoría:</Text>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%', marginTop: '8px' }}
                size="large"
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {getCategoryIcon(category)} {category}
                  </Option>
                ))}
              </Select>
            </div>
            
            {/* Filtro por marca */}
            <div style={{ marginBottom: '20px' }}>
              <Text strong>Marca:</Text>
              <Select
                value={selectedBrand}
                onChange={setSelectedBrand}
                style={{ width: '100%', marginTop: '8px' }}
                size="large"
              >
                {brands.map(brand => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>
            </div>
            
            {/* Estadísticas */}
            <Card size="small" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ color: 'white', margin: 0 }}>{filteredProducts.length}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Productos encontrados</Text>
              </div>
            </Card>
          </div>
        </Sider>

        {/* Contenido principal */}
        <Content style={{ margin: '16px', padding: '24px', background: 'transparent' }}>
          {filteredProducts.length === 0 ? (
            <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
              <Empty 
                description="No se encontraron productos"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => {
                const suggestions = getProductSuggestions(product);
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ padding: '16px' }}
                      actions={[
                        <Tooltip title="Agregar al carrito">
                          <Button 
                            type="primary" 
                            icon={<PlusOutlined />}
                            onClick={() => addToCart(product)}
                            style={{
                              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                              border: 'none',
                              borderRadius: '20px'
                            }}
                          >
                            Agregar
                          </Button>
                        </Tooltip>
                      ]}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <Avatar 
                          size={48} 
                          style={{ 
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            marginBottom: '8px'
                          }}
                        >
                          {getCategoryIcon(product.category)}
                        </Avatar>
                        <Title level={5} style={{ margin: '8px 0 4px 0', fontSize: '14px' }}>
                          {product.name}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {product.description}
                        </Text>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Tag color={product.brand === 'iPhone' ? 'blue' : product.brand === 'Samsung' ? 'green' : 'orange'}>
                          {product.brand}
                        </Tag>
                        <Tag color={product.stock > 10 ? 'success' : product.stock > 5 ? 'warning' : 'error'}>
                          Stock: {product.stock}
                        </Tag>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ 
                          color: '#52c41a', 
                          margin: '8px 0',
                          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          ${product.price}
                        </Title>
                      </div>
                      
                      {/* Sugerencias */}
                      {suggestions.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          {suggestions.map((suggestion, index) => (
                            <Text key={index} style={{ fontSize: '11px', color: '#fa8c16', display: 'block' }}>
                              {suggestion}
                            </Text>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Content>
      </Layout>

      {/* Drawer del carrito */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCartOutlined style={{ color: '#1890ff' }} />
            <span>Carrito de Compras</span>
            <Badge count={getTotalItems()} style={{ marginLeft: '8px' }} />
          </div>
        }
        placement="right"
        onClose={() => setCartVisible(false)}
        open={cartVisible}
        width={400}
        bodyStyle={{ padding: 0 }}
        footer={
          <div style={{ padding: '16px', background: '#f5f5f5' }}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <Title level={3} style={{ 
                color: '#52c41a',
                margin: 0,
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Total: ${getTotalAmount().toFixed(2)}
              </Title>
            </div>
            <Button 
              size="large" 
              block
              onClick={handleFinalizeSale}
              style={{ 
                borderRadius: '8px', 
                height: '48px',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              Finalizar Venta
            </Button>
          </div>
        }
      >
        {cartItems.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <Empty 
              description="El carrito está vacío"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                        {item.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ${item.price} c/u
                      </Text>
                    </div>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(item.id)}
                      size="small"
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Button 
                        size="small" 
                        icon={<MinusOutlined />}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      />
                      <InputNumber 
                        size="small"
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.id, value || 1)}
                        style={{ width: '60px' }}
                      />
                      <Button 
                        size="small" 
                        icon={<PlusOutlined />}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      />
                    </div>
                    
                    <Title level={5} style={{ 
                      margin: 0, 
                      color: '#52c41a',
                      fontSize: '16px'
                    }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Title>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* Modal de Checkout */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCartOutlined style={{ color: '#1890ff' }} />
            <span>Finalizar Venta</span>
          </div>
        }
        open={checkoutVisible}
        onCancel={() => setCheckoutVisible(false)}
        width={500}
        footer={[
          <Button key="cancel" onClick={() => setCheckoutVisible(false)}>
            Cancelar
          </Button>,
          <Button 
            key="complete" 
            type="primary" 
            loading={loading}
            disabled={!paymentMethod}
            onClick={handleCompleteSale}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none'
            }}
          >
            Finalizar Venta
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          {/* Resumen de productos */}
          <div style={{ marginBottom: '24px' }}>
            <Typography.Title level={4}>Resumen de Compra</Typography.Title>
            <List
              size="small"
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.name} x {item.quantity}</span>
                    <span style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </List.Item>
              )}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#52c41a' }}>${getTotalAmount().toFixed(2)}</span>
            </div>
          </div>

          {/* Métodos de pago */}
          <div>
            <Typography.Title level={4}>Método de Pago</Typography.Title>
            <Radio.Group 
              value={paymentMethod} 
              onChange={handlePaymentMethodChange}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio value="contado" style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DollarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Contado</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Pago en efectivo</div>
                    </div>
                  </div>
                </Radio>
                <Radio value="cuenta_corriente" style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CreditCardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Cuenta Corriente</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Pago a crédito</div>
                    </div>
                  </div>
                </Radio>
                <Radio value="transferencia" style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BankOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>Transferencia Bancaria</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Pago por transferencia</div>
                    </div>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        </div>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        open={successVisible}
        onCancel={handleNewSale}
        footer={null}
        width={500}
        centered
        closable={false}
        style={{
          background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
        }}
      >
        <Result
          icon={
            <CheckCircleOutlined 
              style={{ 
                fontSize: '80px', 
                color: '#52c41a',
                animation: 'bounce 1s ease-in-out'
              }} 
            />
          }
          title={
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#52c41a',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              animation: 'fadeInUp 1s ease-out'
            }}>
              ¡Venta Realizada Correctamente!
            </div>
          }
          subTitle={
            <div style={{ fontSize: '16px', color: '#666', marginTop: '16px' }}>
              <div>Factura: <strong>{invoiceNumber}</strong></div>
              <div>Total: <strong style={{ color: '#52c41a' }}>${getTotalAmount().toFixed(2)}</strong></div>
              <div>Método: <strong>{paymentMethod === 'contado' ? 'Contado' : paymentMethod === 'cuenta_corriente' ? 'Cuenta Corriente' : 'Transferencia Bancaria'}</strong></div>
            </div>
          }
          extra={[
            <Button 
              key="print" 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={handlePrintInvoice}
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '40px',
                marginRight: '8px'
              }}
            >
              Imprimir Factura
            </Button>,
            <Button 
              key="new" 
              icon={<ReloadOutlined />}
              onClick={handleNewSale}
              style={{
                borderRadius: '8px',
                height: '40px'
              }}
            >
              Nueva Venta
            </Button>
          ]}
        />
        
        {/* Animaciones CSS */}
        <style>{`
          @keyframes bounce {
            0%, 20%, 60%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-20px);
            }
            80% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes confetti {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </Modal>
    </Layout>
  );
};

export default ProductsPage;