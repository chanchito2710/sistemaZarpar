import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Input,
  Table,
  InputNumber,
  Space,
  message,
  Spin,
  Select,
  Divider,
  Badge,
  Statistic,
  Tag
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { productosService, type ProductoCompleto, type Venta } from '../../services/api';
import POSCheckout from '../../components/pos/POSCheckout';
import VentaExitosa from '../../components/pos/VentaExitosa';

const { Title, Text } = Typography;
const { Option } = Select;

// Interfaz para los items del carrito
interface CarritoItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  stock_disponible: number;
  marca?: string;
  codigo?: string;
}

// Interfaz para los datos que vienen del POS
interface POSData {
  sucursal: string;
  clienteId: number;
  clienteNombre: string;
  vendedorId: number;
  vendedorNombre: string;
}

const Cart: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Datos del POS (sucursal, cliente, vendedor)
  const posData = location.state as POSData;

  // Estados
  const [productos, setProductos] = useState<ProductoCompleto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoCompleto[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Estados de descuento
  const [tipoDescuento, setTipoDescuento] = useState<'monto' | 'porcentaje'>('porcentaje');
  const [valorDescuento, setValorDescuento] = useState<number>(0);
  
  // Estado del checkout
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState<Venta | null>(null);
  const [carritoVentaCompletada, setCarritoVentaCompletada] = useState<CarritoItem[]>([]);

  // Verificar que tenemos los datos necesarios
  useEffect(() => {
    if (!posData || !posData.sucursal || !posData.clienteId || !posData.vendedorId) {
      message.error('Faltan datos necesarios. Volviendo al POS...');
      navigate('/pos');
      return;
    }
    cargarProductos();
  }, []);

  /**
   * Cargar productos de la sucursal seleccionada
   */
  const cargarProductos = async () => {
    if (!posData?.sucursal) return;

    try {
      setLoading(true);
      
      // Debug: ver qué datos tenemos
      console.log('🛒 Cargando productos para sucursal:', posData.sucursal);
      
      const data = await productosService.obtenerPorSucursal(posData.sucursal);
      
      console.log('📦 Productos recibidos:', data.length);
      
      // Mostrar TODOS los productos (sin filtrar por stock)
      // El usuario puede ver qué hay disponible aunque esté en 0
      setProductos(data);
      setProductosFiltrados(data);
      
      if (data.length === 0) {
        message.warning(`No hay productos registrados para la sucursal ${posData.sucursal.toUpperCase()}`);
      } else {
        message.success(`${data.length} productos cargados`);
      }
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      message.error('Error al cargar los productos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar productos por búsqueda
   */
  useEffect(() => {
    if (!searchText.trim()) {
      setProductosFiltrados(productos);
      return;
    }

    const search = searchText.toLowerCase();
    const filtrados = productos.filter(p =>
      p.nombre.toLowerCase().includes(search) ||
      p.marca?.toLowerCase().includes(search) ||
      p.tipo?.toLowerCase().includes(search) ||
      p.codigo_barras?.toLowerCase().includes(search)
    );

    setProductosFiltrados(filtrados);
  }, [searchText, productos]);

  /**
   * Agregar producto al carrito
   */
  const agregarAlCarrito = (producto: ProductoCompleto) => {
    try {
      console.log('🛒 Agregando producto:', producto);
      
      // ✅ 1. Validar que el producto tenga precio
      if (!producto.precio || producto.precio <= 0) {
        message.error('❌ Este producto no tiene precio configurado');
        return;
      }

      // ✅ 2. Validar stock disponible
      const stockDisponible = producto.stock ?? 0;
      
      // 🚨 NUEVO: NO permitir agregar si NO hay stock
      if (stockDisponible <= 0) {
        message.error(`❌ ${producto.nombre} no tiene stock disponible`);
        return;
      }

      const existe = carrito.find(item => item.producto_id === producto.id);

      if (existe) {
        // ✅ 3. Verificar que no exceda el stock disponible
        if (existe.cantidad >= stockDisponible) {
          message.warning(`⚠️ No puedes agregar más. Stock disponible: ${stockDisponible}`);
          return;
        }

        // ✅ 4. Incrementar cantidad
        const nuevoCarrito = carrito.map(item =>
          item.producto_id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
                marca: item.marca || producto.marca || '',
                codigo: item.codigo || producto.codigo_barras || ''
              }
            : item
        );
        setCarrito(nuevoCarrito);
        message.success(`✅ ${producto.nombre} agregado (${existe.cantidad + 1} / ${stockDisponible})`);
      } else {
        // ✅ 5. Agregar nuevo item
        const nuevoItem: CarritoItem = {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio ?? 0,
          cantidad: 1,
          subtotal: producto.precio ?? 0,
          stock_disponible: stockDisponible,
          marca: producto.marca || '',
          codigo: producto.codigo_barras || ''
        };
        console.log('✅ Nuevo item creado:', nuevoItem);
        setCarrito([...carrito, nuevoItem]);
        message.success(`✅ ${producto.nombre} agregado al carrito (1 / ${stockDisponible})`);
      }
    } catch (error) {
      console.error('❌ Error al agregar producto:', error);
      message.error('Error al agregar el producto al carrito');
    }
  };

  /**
   * Cambiar cantidad de un producto en el carrito
   */
  const cambiarCantidad = (producto_id: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(producto_id);
      return;
    }

    const item = carrito.find(i => i.producto_id === producto_id);
    if (!item) return;

    // Verificar stock
    if (nuevaCantidad > item.stock_disponible) {
      message.warning('No hay suficiente stock');
      return;
    }

    const nuevoCarrito = carrito.map(i =>
      i.producto_id === producto_id
        ? {
            ...i,
            cantidad: nuevaCantidad,
            subtotal: nuevaCantidad * i.precio
          }
        : i
    );
    setCarrito(nuevoCarrito);
  };

  /**
   * Eliminar producto del carrito
   */
  const eliminarDelCarrito = (producto_id: number) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id));
    message.info('Producto eliminado del carrito');
  };

  /**
   * Manejar cierre exitoso del checkout
   */
  /**
   * Manejar venta completada exitosamente
   */
  const handleVentaCompletada = (venta: Venta) => {
    // Guardar la venta completada y el carrito para mostrar la página de éxito
    setCarritoVentaCompletada([...carrito]); // Guardar copia del carrito antes de limpiarlo
    setVentaCompletada(venta);
    // Limpiar carrito
    setCarrito([]);
    setValorDescuento(0);
    setCheckoutVisible(false);
  };

  /**
   * Función para iniciar una nueva venta desde la página de éxito
   */
  const handleNuevaVenta = () => {
    setVentaCompletada(null);
    navigate('/pos');
  };

  /**
   * Calcular totales
   */
  const subtotal = carrito.reduce((sum, item) => {
    const s = Number(item.subtotal) || 0;
    return sum + s;
  }, 0);
  
  let descuento = 0;
  if (tipoDescuento === 'monto') {
    descuento = Number(valorDescuento) || 0;
  } else {
    descuento = (subtotal * (Number(valorDescuento) || 0)) / 100;
  }

  // No permitir descuento mayor al subtotal
  if (descuento > subtotal) {
    descuento = subtotal;
  }

  const total = subtotal - descuento;

  // DEBUG: Log para verificar render
  console.log('🔵 Cart render - Items en carrito:', carrito.length);

  /**
   * Columnas de la tabla de productos
   */
  const columnasProductos: any = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text: string, record: ProductoCompleto) => (
        <div>
          <Text strong>{text}</Text>
          {record.marca && <div><Text type="secondary" style={{ fontSize: 12 }}>{record.marca}</Text></div>}
          {record.tipo && <Tag color="blue" style={{ fontSize: 10 }}>{record.tipo}</Tag>}
        </div>
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center' as const,
      render: (stock: number) => (
        <Badge 
          count={stock} 
          showZero
          style={{ backgroundColor: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#ff4d4f' }}
        />
      )
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: 100,
      align: 'right' as const,
      render: (precio: number | string) => {
        const precioNum = typeof precio === 'string' ? parseFloat(precio) : (precio ?? 0);
        return (
          <Text strong style={{ color: '#1890ff' }}>
            ${precioNum.toFixed(2)}
          </Text>
        );
      }
    },
    {
      title: 'Acción',
      key: 'accion',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: ProductoCompleto) => {
        const sinStock = !record.stock || record.stock === 0;
        const sinPrecio = !record.precio || record.precio === 0;
        
        // 🚨 DESHABILITAR si NO hay precio O si NO hay stock
        const deshabilitado = sinPrecio || sinStock;
        
        // Determinar el texto del botón
        let textoBoton = 'Agregar';
        if (sinPrecio) {
          textoBoton = 'Sin precio';
        } else if (sinStock) {
          textoBoton = 'Sin stock';
        }
        
        return (
          <Button
            type={sinStock ? 'default' : 'primary'}
            icon={<PlusOutlined />}
            onClick={() => agregarAlCarrito(record)}
            disabled={deshabilitado}
            danger={sinStock && !sinPrecio}
          >
            {textoBoton}
          </Button>
        );
      }
    }
  ];

  /**
   * Columnas del carrito
   */
  const columnasCarrito: any = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string) => nombre || 'Sin nombre'
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'precio',
      key: 'precio',
      width: 100,
      align: 'right' as const,
      render: (precio: any) => {
        const p = Number(precio) || 0;
        return `$${p.toFixed(2)}`;
      }
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 150,
      align: 'center' as const,
      render: (cantidad: number, record: CarritoItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => cambiarCantidad(record.producto_id, cantidad - 1)}
          />
          <InputNumber
            min={1}
            max={record.stock_disponible || 999}
            value={cantidad || 1}
            onChange={(value) => cambiarCantidad(record.producto_id, value ?? 1)}
            style={{ width: 60 }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => cambiarCantidad(record.producto_id, cantidad + 1)}
            disabled={cantidad >= (record.stock_disponible || 0)}
          />
        </Space>
      )
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 100,
      align: 'right' as const,
      render: (subtotal: any) => {
        const s = Number(subtotal) || 0;
        return <Text strong>${s.toFixed(2)}</Text>;
      }
    },
    {
      title: '',
      key: 'acciones',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: CarritoItem) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => eliminarDelCarrito(record.producto_id)}
        />
      )
    }
  ];

  // Validación de seguridad
  if (!posData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Text>Cargando datos...</Text>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Modal de éxito de venta */}
      {ventaCompletada && posData && (
        <VentaExitosa
          visible={!!ventaCompletada}
          venta={{
            ...ventaCompletada,
            cliente_nombre: posData.clienteNombre, // Asegurar que tenga el nombre real
          }}
          carrito={carritoVentaCompletada}
          onClose={() => {
            setVentaCompletada(null);
            setCarritoVentaCompletada([]);
            handleNuevaVenta();
          }}
        />
      )}

      {/* Contenido principal del carrito */}
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header con información del POS */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              <ShoppingCartOutlined /> Carrito de Compras
            </Title>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/pos')}>
              Volver al POS
            </Button>
          </div>
          <Row gutter={16}>
            <Col span={8}>
              <Text type="secondary">Sucursal:</Text> <Text strong>{posData.sucursal.toUpperCase()}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Cliente:</Text> <Text strong>{posData.clienteNombre}</Text>
            </Col>
            <Col span={8}>
              <Text type="secondary">Vendedor:</Text> <Text strong>{posData.vendedorNombre}</Text>
            </Col>
          </Row>
        </Space>
      </Card>

      <Row gutter={24}>
        {/* Columna izquierda: Lista de productos */}
        <Col xs={24} lg={14}>
          <Card
            title="Productos Disponibles"
            extra={
              <Badge count={productosFiltrados.length} style={{ backgroundColor: '#1890ff' }} />
            }
          >
            <Input
              placeholder="Buscar por nombre, marca, tipo o código de barras..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ marginBottom: 16 }}
            />
            
            <Spin spinning={loading}>
              <Table
                dataSource={productosFiltrados}
                columns={columnasProductos}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 600 }}
              />
            </Spin>
          </Card>
        </Col>

        {/* Columna derecha: Carrito */}
        <Col xs={24} lg={10}>
          <Card
            title="Carrito"
            extra={
              <Badge count={carrito.length} style={{ backgroundColor: '#52c41a' }} />
            }
          >
            {carrito.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <ShoppingCartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div><Text type="secondary">El carrito está vacío</Text></div>
              </div>
            ) : (
              <>
                <Table
                  dataSource={carrito}
                  columns={columnasCarrito}
                  rowKey="producto_id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 500 }}
                />

                <Divider />

                {/* Sección de descuento */}
                <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Aplicar Descuento:</Text>
                    <Space.Compact style={{ width: '100%' }}>
                      <Select
                        value={tipoDescuento}
                        onChange={setTipoDescuento}
                        style={{ width: 140 }}
                      >
                        <Option value="porcentaje">Porcentaje %</Option>
                        <Option value="monto">Monto $</Option>
                      </Select>
                      <InputNumber
                        min={0}
                        max={tipoDescuento === 'porcentaje' ? 100 : subtotal}
                        value={valorDescuento}
                        onChange={(value) => setValorDescuento(value ?? 0)}
                        style={{ width: '100%' }}
                        prefix={tipoDescuento === 'porcentaje' ? '%' : '$'}
                      />
                    </Space.Compact>
                  </Space>
                </Card>

                {/* Resumen de totales */}
                <Card size="small" style={{ background: '#e6f7ff' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Subtotal:</Text>
                      <Text strong>${Number(subtotal || 0).toFixed(2)}</Text>
                    </div>
                    {descuento > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="success">Descuento:</Text>
                        <Text type="success">-${Number(descuento || 0).toFixed(2)}</Text>
                      </div>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Title level={4} style={{ margin: 0 }}>TOTAL:</Title>
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        ${Number(total || 0).toFixed(2)}
                      </Title>
                    </div>
                  </Space>
                </Card>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<DollarOutlined />}
                  style={{ marginTop: 16 }}
                  disabled={carrito.length === 0}
                  onClick={() => setCheckoutVisible(true)}
                >
                  Procesar Pago
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal de Checkout */}
      {checkoutVisible && (
        <POSCheckout
          visible={checkoutVisible}
          onClose={() => setCheckoutVisible(false)}
          onVentaCompletada={handleVentaCompletada}
          carrito={carrito}
          subtotal={subtotal}
          descuento={descuento}
          total={total}
          sucursal={posData.sucursal}
          clienteId={posData.clienteId}
          clienteNombre={posData.clienteNombre}
          vendedorId={posData.vendedorId}
          vendedorNombre={posData.vendedorNombre}
        />
      )}
    </div>
    </>
  );
};

export default Cart;

