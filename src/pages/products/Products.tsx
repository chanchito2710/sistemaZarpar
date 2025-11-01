/**
 * Componente de Gestión de Productos
 * Permite ver y gestionar productos con stock y precios por sucursal
 * Sistema ZARPAR
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Statistic,
  InputNumber,
  Typography,
  Spin,
  Tooltip,
  Popconfirm,
  Badge,
  Divider,
  Collapse
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  ShopOutlined,
  DollarOutlined,
  WarningOutlined,
  ReloadOutlined,
  SaveOutlined,
  BarcodeOutlined,
  TagOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  RocketOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '../../contexts/AuthContext';
import { 
  productosService, 
  type ProductoCompleto, 
  type ProductoInput,
  type ProductoSucursalInput
} from '../../services/api';

const { Option } = Select;
const { Title, Text } = Typography;
const { Search } = Input;

/**
 * Interfaz para Sucursal
 */
interface Sucursal {
  sucursal: string;
  total_vendedores: number;
}

/**
 * UTILIDADES PARA NOMBRES DE SUCURSALES
 */

/**
 * Formatear nombre de sucursal para mostrar: capitaliza cada palabra
 * "rionegro" → "Rio Negro"
 * "cerrolargo" → "Cerro Largo"
 */
const formatearNombreSucursal = (nombre: string): string => {
  const normalizado = nombre.toLowerCase().trim();
  
  // Lista de sucursales conocidas con espacios
  const sucursalesConEspacios: { [key: string]: string } = {
    'rionegro': 'Rio Negro',
    'cerrolargo': 'Cerro Largo',
    'treintaytres': 'Treinta Y Tres',
    'floresdalsur': 'Flores Dal Sur',
    // Agregar más según necesites
  };
  
  // Si está en la lista, usar el formato conocido
  if (sucursalesConEspacios[normalizado]) {
    return sucursalesConEspacios[normalizado];
  }
  
  // Si no, capitalizar la primera letra
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
};

const Products: React.FC = () => {
  const { usuario } = useAuth();

  // 🔐 Verificar si el usuario es administrador
  const esAdministrador = usuario?.esAdmin || usuario?.email === 'admin@zarparuy.com';

  // Estados principales
  const [productos, setProductos] = useState<ProductoCompleto[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para categorías (marcas, tipos y calidades)
  const [marcas, setMarcas] = useState<string[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [calidades, setCalidades] = useState<string[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingCalidades, setLoadingCalidades] = useState(false);

  // Estados de modales
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalStockVisible, setModalStockVisible] = useState(false);
  const [modalAgregarMarca, setModalAgregarMarca] = useState(false);
  const [modalGestionarPrecios, setModalGestionarPrecios] = useState(false);
  
  // Estados para filtros del modal de gestión
  const [busquedaModalGestion, setBusquedaModalGestion] = useState('');
  const [tipoFiltroModalGestion, setTipoFiltroModalGestion] = useState<string>('todos');
  const [modalAgregarTipo, setModalAgregarTipo] = useState(false);
  const [modalAgregarCalidad, setModalAgregarCalidad] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoCompleto | null>(null);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [nuevaCalidad, setNuevaCalidad] = useState('');

  // Forms
  const [formCrear] = Form.useForm();
  const [formEditar] = Form.useForm();
  const [formStock] = Form.useForm();

  /**
   * Cargar sucursales disponibles desde la base de datos
   */
  const cargarSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3456/api'}/sucursales`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSucursales(data.data);
        
        // Si no hay sucursal seleccionada y hay sucursales disponibles, seleccionar la primera
        if (!sucursalSeleccionada && data.data.length > 0) {
          setSucursalSeleccionada(data.data[0].sucursal);
        }
        
        console.log(`✅ ${data.data.length} sucursales cargadas`);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar productos de la sucursal seleccionada
   */
  const cargarProductos = async () => {
    if (!sucursalSeleccionada) return;

    setLoading(true);
    try {
      const data = await productosService.obtenerPorSucursal(sucursalSeleccionada);
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      message.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar marcas disponibles
   */
  const cargarMarcas = async () => {
    setLoadingMarcas(true);
    try {
      const data = await productosService.obtenerCategorias('marca');
      setMarcas(data);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
      message.error('Error al cargar marcas');
    } finally {
      setLoadingMarcas(false);
    }
  };

  /**
   * Cargar tipos disponibles
   */
  const cargarTipos = async () => {
    setLoadingTipos(true);
    try {
      const data = await productosService.obtenerCategorias('tipo');
      setTipos(data);
    } catch (error) {
      console.error('Error al cargar tipos:', error);
      message.error('Error al cargar tipos');
    } finally {
      setLoadingTipos(false);
    }
  };

  /**
   * Cargar calidades disponibles
   */
  const cargarCalidades = async () => {
    setLoadingCalidades(true);
    try {
      const data = await productosService.obtenerCategorias('calidad');
      setCalidades(data);
    } catch (error) {
      console.error('Error al cargar calidades:', error);
      message.error('Error al cargar calidades');
    } finally {
      setLoadingCalidades(false);
    }
  };

  /**
   * Agregar nueva marca
   */
  const handleAgregarMarca = async () => {
    if (!nuevaMarca.trim()) {
      message.warning('Por favor ingresa un nombre para la marca');
      return;
    }

    try {
      await productosService.agregarCategoria('marca', nuevaMarca.trim());
      message.success('Marca agregada exitosamente');
      setNuevaMarca('');
      setModalAgregarMarca(false);
      await cargarMarcas(); // Recargar lista
    } catch (error: any) {
      console.error('Error al agregar marca:', error);
      if (error.response?.status === 409) {
        message.error('Esta marca ya existe');
      } else {
        message.error('Error al agregar marca');
      }
    }
  };

  /**
   * Agregar nuevo tipo
   */
  const handleAgregarTipo = async () => {
    if (!nuevoTipo.trim()) {
      message.warning('Por favor ingresa un nombre para el tipo');
      return;
    }

    try {
      await productosService.agregarCategoria('tipo', nuevoTipo.trim());
      message.success('Tipo agregado exitosamente');
      setNuevoTipo('');
      setModalAgregarTipo(false);
      await cargarTipos(); // Recargar lista
    } catch (error: any) {
      console.error('Error al agregar tipo:', error);
      if (error.response?.status === 409) {
        message.error('Este tipo ya existe');
      } else {
        message.error('Error al agregar tipo');
      }
    }
  };

  /**
   * Agregar nueva calidad
   */
  const handleAgregarCalidad = async () => {
    if (!nuevaCalidad.trim()) {
      message.warning('Por favor ingresa un nombre para la calidad');
      return;
    }

    try {
      await productosService.agregarCategoria('calidad', nuevaCalidad.trim());
      message.success('Calidad agregada exitosamente');
      setNuevaCalidad('');
      setModalAgregarCalidad(false);
      await cargarCalidades(); // Recargar lista
    } catch (error: any) {
      console.error('Error al agregar calidad:', error);
      if (error.response?.status === 409) {
        message.error('Esta calidad ya existe');
      } else {
        message.error('Error al agregar calidad');
      }
    }
  };

  /**
   * Efecto: Cargar productos cuando cambia la sucursal
   */
  useEffect(() => {
    cargarProductos();
  }, [sucursalSeleccionada]);

  /**
   * Efecto: Cargar sucursales, marcas, tipos y calidades al montar el componente
   */
  useEffect(() => {
    cargarSucursales();
    cargarMarcas();
    cargarTipos();
    cargarCalidades();
  }, []);

  /**
   * Buscar productos
   */
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      cargarProductos();
      return;
    }

    setLoading(true);
    try {
      const data = await productosService.buscar(value, sucursalSeleccionada);
      setProductos(data);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      message.error('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear nuevo producto
   */
  const handleCrearProducto = async () => {
    try {
      const values = await formCrear.validateFields();
      const nuevoProducto: ProductoInput = {
        nombre: values.nombre,
        marca: values.marca || undefined,
        tipo: values.tipo || undefined,
        calidad: values.calidad || 'Media',
        codigo_barras: values.codigo_barras || undefined
      };

      await productosService.crear(nuevoProducto);
      message.success('Producto creado exitosamente');
      setModalCrearVisible(false);
      formCrear.resetFields();
      cargarProductos();
    } catch (error) {
      console.error('Error al crear producto:', error);
      message.error('Error al crear producto');
    }
  };

  /**
   * Actualizar información básica del producto + stock y precio de todas las sucursales
   */
  const handleEditarProducto = async () => {
    if (!productoEditando) return;

    try {
      const values = await formEditar.validateFields();
      
      // 1. Actualizar datos básicos del producto
      const datosActualizados: Partial<ProductoInput> = {
        nombre: values.nombre,
        marca: values.marca || undefined,
        tipo: values.tipo || undefined,
        calidad: values.calidad,
        codigo_barras: values.codigo_barras || undefined
      };

      await productosService.actualizar(productoEditando.id, datosActualizados);

      // 2. 🆕 Actualizar stock y precio de CADA sucursal
      for (const sucursalObj of sucursales) {
        const sucursal = sucursalObj.sucursal;
        const datos: Partial<ProductoSucursalInput> = {
          stock: values[`stock_${sucursal}`] || 0,
          precio: values[`precio_${sucursal}`] || 0,
          stock_minimo: values[`stock_minimo_${sucursal}`] || 10
        };

        await productosService.actualizarSucursal(
          productoEditando.id,
          sucursal,
          datos
        );
      }

      message.success('✅ Producto y stock/precio actualizados exitosamente');
      setModalEditarVisible(false);
      setProductoEditando(null);
      formEditar.resetFields();
      cargarProductos();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      message.error('Error al actualizar producto');
    }
  };

  /**
   * Actualizar stock y precio de un producto en la sucursal
   */
  const handleActualizarStock = async () => {
    if (!productoEditando) return;

    try {
      const values = await formStock.validateFields();
      const datos: Partial<ProductoSucursalInput> = {
        stock: values.stock,
        precio: values.precio,
        stock_minimo: values.stock_minimo
      };

      await productosService.actualizarSucursal(
        productoEditando.id,
        sucursalSeleccionada,
        datos
      );

      message.success('Stock y precio actualizados exitosamente');
      setModalStockVisible(false);
      setProductoEditando(null);
      formStock.resetFields();
      cargarProductos();
    } catch (error) {
      console.error('Error al actualizar stock/precio:', error);
      message.error('Error al actualizar stock y precio');
    }
  };

  /**
   * Abrir modal de edición de producto
   */
  const abrirModalEditar = async (producto: ProductoCompleto) => {
    setProductoEditando(producto);
    
    // Cargar datos del producto
    formEditar.setFieldsValue({
      nombre: producto.nombre,
      marca: producto.marca || '',
      tipo: producto.tipo || '',
      calidad: producto.calidad || 'Media',
      codigo_barras: producto.codigo_barras || ''
    });

    // 🆕 Cargar stock y precio de TODAS las sucursales
    try {
      setLoading(true);
      const productoCompleto = await productosService.obtenerPorId(producto.id);
      
      if (productoCompleto) {
        // Cargar stock y precio de cada sucursal en el formulario
        const sucursalesData: any = {};
        sucursales.forEach(sucursalObj => {
          const sucursal = sucursalObj.sucursal;
          const sucursalData = productoCompleto.sucursales?.find(s => s.sucursal === sucursal);
          sucursalesData[`stock_${sucursal}`] = sucursalData?.stock || 0;
          sucursalesData[`precio_${sucursal}`] = sucursalData?.precio || 0;
          sucursalesData[`stock_minimo_${sucursal}`] = sucursalData?.stock_minimo || 10;
        });
        
        formEditar.setFieldsValue(sucursalesData);
      }
    } catch (error) {
      console.error('Error al cargar datos del producto:', error);
      message.error('Error al cargar los datos del producto');
    } finally {
      setLoading(false);
    }

    setModalEditarVisible(true);
  };

  /**
   * Abrir modal de actualización de stock/precio
   */
  const abrirModalStock = (producto: ProductoCompleto) => {
    setProductoEditando(producto);
    formStock.setFieldsValue({
      stock: producto.stock || 0,
      precio: producto.precio || 0,
      stock_minimo: producto.stock_minimo || 10
    });
    setModalStockVisible(true);
  };

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<ProductoCompleto> = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 120,
      filters: marcas.map(m => ({ text: m, value: m })),
      onFilter: (value, record) => record.marca === value,
      render: (marca: string) => marca ? <Text>{marca}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
      filters: tipos.map(t => ({ text: t, value: t })),
      onFilter: (value, record) => record.tipo === value,
      render: (tipo: string) => tipo ? <Tag color="blue">{tipo}</Tag> : <Text type="secondary">-</Text>
    },
    {
      title: 'Calidad',
      dataIndex: 'calidad',
      key: 'calidad',
      width: 120,
      filters: calidades.map(c => ({ text: c, value: c })),
      onFilter: (value, record) => record.calidad === value,
      render: (calidad: string) => {
        const color = {
          'Incell jk': 'cyan',
          'Oled': 'purple',
          'Original': 'gold',
          'Oem': 'blue',
          'Incell zy': 'green',
          'Incell': 'geekblue',
          'Otro': 'default'
        }[calidad] || 'default';
        return <Tag color={color}>{calidad}</Tag>;
      }
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      render: (stock: number, record: ProductoCompleto) => {
        const esBajo = record.tiene_stock_bajo;
        return (
          <Badge
            count={esBajo ? <WarningOutlined style={{ color: '#f5222d' }} /> : 0}
            offset={[10, 0]}
          >
            <Tag color={esBajo ? 'red' : stock > 50 ? 'green' : 'orange'}>
              {stock || 0} uds
            </Tag>
          </Badge>
        );
      }
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.precio || 0) - (b.precio || 0),
      render: (precio: number) => {
        const precioNum = Number(precio) || 0;
        return (
          <Text strong style={{ color: '#52c41a' }}>
            ${precioNum.toFixed(2)}
          </Text>
        );
      }
    },
    {
      title: 'Stock Mín.',
      dataIndex: 'stock_minimo',
      key: 'stock_minimo',
      width: 100,
      align: 'center',
      render: (stock_minimo: number) => (
        <Text type="secondary">{stock_minimo || 0}</Text>
      )
    },
    {
      title: 'Código',
      dataIndex: 'codigo_barras',
      key: 'codigo_barras',
      width: 140,
      render: (codigo: string) => codigo ? (
        <Tooltip title="Código de barras">
          <Space>
            <BarcodeOutlined />
            <Text code>{codigo}</Text>
          </Space>
        </Tooltip>
      ) : <Text type="secondary">-</Text>
    },
    // 🔐 Columna de acciones: SOLO para administradores
    ...(esAdministrador ? [{
      title: 'Acciones',
      key: 'acciones',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: ProductoCompleto) => (
        <Space>
          <Tooltip title="Editar producto">
            <Button
              icon={<EditOutlined />}
              onClick={() => abrirModalEditar(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Actualizar stock y precio">
            <Button
              icon={<DollarOutlined />}
              onClick={() => abrirModalStock(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }] : [])
  ];

  /**
   * Calcular estadísticas
   */
  const estadisticas = {
    totalProductos: productos.length,
    stockBajo: productos.filter(p => p.tiene_stock_bajo).length,
    valorTotal: productos.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.precio) || 0), 0)
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="center" size="large">
              <ShopOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Gestión de Productos
                </Title>
                <Text type="secondary">
                  Administra el inventario y precios por sucursal
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              {/* 🔐 Solo administradores pueden crear productos */}
              {esAdministrador && (
                <>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setModalCrearVisible(true)}
                    size="large"
                  >
                    Nuevo Producto
                  </Button>
                  
                  {/* 🎯 Botón Gestionar Precios y Stock */}
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => {
                      // Limpiar filtros al abrir el modal
                      setBusquedaModalGestion('');
                      setTipoFiltroModalGestion('todos');
                      setModalGestionarPrecios(true);
                    }}
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #2c2416 0%, #3e2723 50%, #4a3728 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(62, 39, 35, 0.4)',
                      transition: 'all 0.3s ease'
                    }}
                    className="price-management-btn"
                  >
                    Gestionar Precios
                  </Button>
                </>
              )}
              <Button
          icon={<ReloadOutlined />} 
                onClick={() => {
                  cargarSucursales();
                  cargarProductos();
                }}
                size="large"
                loading={loadingSucursales || loading}
        >
          Actualizar
        </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Productos"
              value={estadisticas.totalProductos}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Stock Bajo"
              value={estadisticas.stockBajo}
              prefix={<WarningOutlined />}
              valueStyle={{ color: estadisticas.stockBajo > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Valor Total Inventario"
              value={estadisticas.valorTotal}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros y búsqueda */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Sucursal:</Text>
              <Select
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                style={{ width: '100%' }}
                size="large"
              >
                {sucursales.map(sucursalObj => (
                  <Option key={sucursalObj.sucursal} value={sucursalObj.sucursal}>
                    {formatearNombreSucursal(sucursalObj.sucursal)}
                    {sucursalObj.sucursal === 'maldonado' && (
                      <Tag color="gold" style={{ marginLeft: '8px' }}>
                        Stock Principal
                      </Tag>
                    )}
                  </Option>
                ))}
              </Select>
            </Space>
            </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Buscar:</Text>
              <Search
                placeholder="Buscar por nombre, marca, tipo o código"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value) {
                    cargarProductos();
                  }
                }}
              />
            </Space>
            </Col>
          </Row>
      </Card>
          
      {/* Tabla de productos */}
      <Card>
          <Table
            columns={columns}
          dataSource={productos}
          rowKey={(record) => `${record.id}-${sucursalSeleccionada}`}
          loading={loading}
            pagination={{
            pageSize: 20,
              showSizeChanger: true,
            showTotal: (total) => `Total: ${total} productos`,
            pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 1400 }}
          />
        </Card>

      {/* Modal: Crear Producto */}
        <Modal
        title="Crear Nuevo Producto"
        open={modalCrearVisible}
        onOk={handleCrearProducto}
        onCancel={() => {
          setModalCrearVisible(false);
          formCrear.resetFields();
        }}
        okText="Crear Producto"
          cancelText="Cancelar"
        width={600}
      >
        <Form form={formCrear} layout="vertical">
                <Form.Item
                  label="Nombre del Producto"
            name="nombre"
                  rules={[{ required: true, message: 'Por favor ingresa el nombre del producto' }]}
                >
            <Input placeholder="Iphone 17 pro max" />
                </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8 }}>Marca</div>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="marca" noStyle>
                    <Select
                      placeholder="Iphone"
                      loading={loadingMarcas}
                      showSearch
                      allowClear
                      style={{ flex: 1 }}
                      options={marcas.map(m => ({ label: m, value: m }))}
                    />
                </Form.Item>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalAgregarMarca(true)}
                  />
                </Space.Compact>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8 }}>Tipo</div>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="tipo" noStyle>
                    <Select
                      placeholder="Display"
                      loading={loadingTipos}
                      showSearch
                      allowClear
                      style={{ flex: 1 }}
                      options={tipos.map(t => ({ label: t, value: t }))}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalAgregarTipo(true)}
                  />
                </Space.Compact>
              </div>
              </Col>
            </Row>

            <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8 }}>Calidad</div>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="calidad" noStyle>
                    <Select
                      placeholder="Selecciona una calidad"
                      loading={loadingCalidades}
                      showSearch
                      allowClear
                      style={{ flex: 1 }}
                      options={calidades.map(c => ({ label: c, value: c }))}
                    />
                </Form.Item>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalAgregarCalidad(true)}
                  />
                </Space.Compact>
              </div>
              </Col>
            <Col span={12}>
              <Form.Item label="Código de Barras" name="codigo_barras">
                <Input placeholder="Opcional" />
                </Form.Item>
              </Col>
            </Row>
        </Form>
      </Modal>

      {/* Modal: Editar Producto */}
      <Modal
        title="Editar Producto"
        open={modalEditarVisible}
        onOk={handleEditarProducto}
        onCancel={() => {
          setModalEditarVisible(false);
          setProductoEditando(null);
          formEditar.resetFields();
        }}
        okText="Guardar Cambios"
        cancelText="Cancelar"
        width={800}
      >
        <Form form={formEditar} layout="vertical">
          {/* Datos Básicos del Producto */}
          <Card size="small" style={{ marginBottom: 16 }} title="📦 Datos Básicos">
            <Form.Item
              label="Nombre del Producto"
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingresa el nombre del producto' }]}
            >
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Marca" name="marca">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tipo" name="tipo">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Calidad" name="calidad" style={{ marginBottom: 0 }}>
                  <Input.Group compact style={{ display: 'flex' }}>
                    <Form.Item name="calidad" noStyle>
                      <Select
                        placeholder="Selecciona una calidad"
                        loading={loadingCalidades}
                        showSearch
                        allowClear
                        style={{ flex: 1 }}
                        options={calidades.map(c => ({ label: c, value: c }))}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalAgregarCalidad(true)}
                    />
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Código de Barras" name="codigo_barras">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* 📝 Nota: Stock y Precio se configuran desde "Gestionar Precios y Stock" */}
          <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong style={{ color: '#1890ff' }}>
                ℹ️ Stock y Precios por Sucursal
              </Text>
              <Text type="secondary">
                Una vez creado el producto, podrás configurar stock y precios para cada sucursal 
                usando el botón <Text strong>"Gestionar Precios y Stock"</Text> en la parte superior.
              </Text>
            </Space>
          </Card>
        </Form>
      </Modal>

      {/* Modal: Actualizar Stock y Precio */}
      <Modal
        title={`Actualizar Stock y Precio - ${productoEditando?.nombre}`}
        open={modalStockVisible}
        onOk={handleActualizarStock}
        onCancel={() => {
          setModalStockVisible(false);
          setProductoEditando(null);
          formStock.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
        width={500}
      >
        <Form form={formStock} layout="vertical">
                  <Form.Item
            label="Stock Disponible"
            name="stock"
            rules={[{ required: true, message: 'Por favor ingresa el stock' }]}
                  >
                    <InputNumber
              min={0}
                      style={{ width: '100%' }}
              placeholder="Cantidad en unidades"
            />
          </Form.Item>

          <Form.Item
            label="Precio de Venta"
            name="precio"
            rules={[{ required: true, message: 'Por favor ingresa el precio' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
                      prefix="$"
              style={{ width: '100%' }}
              placeholder="Precio en pesos"
            />
          </Form.Item>

          <Form.Item
            label="Stock Mínimo (Alerta)"
            name="stock_minimo"
          >
            <InputNumber
                      min={0}
              style={{ width: '100%' }}
              placeholder="Cantidad mínima antes de alerta"
                    />
                  </Form.Item>

          <Divider />

          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">
              Sucursal: <Text strong>{formatearNombreSucursal(sucursalSeleccionada)}</Text>
            </Text>
            {sucursalSeleccionada === 'maldonado' && (
              <Tag color="gold">Stock Principal</Tag>
            )}
          </Space>
          </Form>
        </Modal>

      {/* Modal: Agregar nueva marca */}
        <Modal
        title="Agregar Nueva Marca"
        open={modalAgregarMarca}
        onOk={handleAgregarMarca}
        onCancel={() => {
          setModalAgregarMarca(false);
          setNuevaMarca('');
        }}
        okText="Agregar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Nombre de la marca (ej: Apple, Samsung...)"
          value={nuevaMarca}
          onChange={(e) => setNuevaMarca(e.target.value)}
          onPressEnter={handleAgregarMarca}
          autoFocus
        />
      </Modal>

      {/* Modal: Agregar nuevo tipo */}
      <Modal
        title="Agregar Nuevo Tipo"
        open={modalAgregarTipo}
        onOk={handleAgregarTipo}
        onCancel={() => {
          setModalAgregarTipo(false);
          setNuevoTipo('');
        }}
        okText="Agregar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Nombre del tipo (ej: Display, Batería...)"
          value={nuevoTipo}
          onChange={(e) => setNuevoTipo(e.target.value)}
          onPressEnter={handleAgregarTipo}
          autoFocus
        />
      </Modal>

      {/* Modal: Agregar nueva calidad */}
      <Modal
        title="Agregar Nueva Calidad"
        open={modalAgregarCalidad}
        onOk={handleAgregarCalidad}
        onCancel={() => {
          setModalAgregarCalidad(false);
          setNuevaCalidad('');
        }}
        okText="Agregar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Nombre de la calidad (ej: Incell jk, Oled...)"
          value={nuevaCalidad}
          onChange={(e) => setNuevaCalidad(e.target.value)}
          onPressEnter={handleAgregarCalidad}
          autoFocus
        />
        </Modal>

      {/* 🎯 Modal: Gestionar Precios y Stock por Sucursal */}
      <Modal
        title={
          <Space>
            <RocketOutlined style={{ color: '#667eea' }} />
            <span>Gestionar Precios y Stock por Sucursal</span>
          </Space>
        }
        open={modalGestionarPrecios}
        onCancel={() => setModalGestionarPrecios(false)}
        footer={[
          <Button key="close" onClick={() => setModalGestionarPrecios(false)}>
            Cerrar
          </Button>
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <Spin spinning={loading}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Descripción */}
            <Card size="small" style={{ background: '#f0f5ff', border: '1px solid #adc6ff' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ color: '#1890ff' }}>
                  💡 Gestión Centralizada
                </Text>
                <Text type="secondary">
                  Configura stock, precios y stock mínimo para cada producto en todas las sucursales.
                  Usa el selector de sucursal y la tabla de productos para hacer los cambios.
                </Text>
              </Space>
            </Card>

            {/* Selector de Sucursal */}
            <Card size="small" title="🏪 Seleccionar Sucursal">
              <Select
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                style={{ width: '100%' }}
                size="large"
              >
                {sucursales.map(sucursalObj => (
                  <Option key={sucursalObj.sucursal} value={sucursalObj.sucursal}>
                    <Space>
                      <ShopOutlined />
                      {formatearNombreSucursal(sucursalObj.sucursal)}
                      {sucursalObj.sucursal === 'maldonado' && (
                        <Tag color="gold">Stock Principal</Tag>
                      )}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Card>

            {/* 🔍 Filtros: Búsqueda y Tipo */}
            <Card size="small" title="🔍 Buscar y Filtrar">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={14}>
                  <Input
                    placeholder="Buscar por nombre, marca o código..."
                    prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                    value={busquedaModalGestion}
                    onChange={(e) => setBusquedaModalGestion(e.target.value)}
                    size="large"
                    allowClear
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  />
                </Col>
                <Col xs={24} md={10}>
                  <Select
                    placeholder="Filtrar por tipo"
                    value={tipoFiltroModalGestion}
                    onChange={setTipoFiltroModalGestion}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <Option value="todos">
                      <Space>
                        <TagOutlined />
                        Todos los tipos
                      </Space>
                    </Option>
                    {tipos.map(tipo => (
                      <Option key={tipo} value={tipo}>
                        <Space>
                          <TagOutlined />
                          {tipo}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Card>

            {/* Lista de Productos con Stock y Precio */}
            <Card 
              size="small" 
              title={
                <Space>
                  <TagOutlined />
                  <Text>Productos - {formatearNombreSucursal(sucursalSeleccionada)}</Text>
                  <Badge 
                    count={
                      productos.filter((producto) => {
                        const terminoBusqueda = busquedaModalGestion.toLowerCase();
                        const cumpleBusqueda = !terminoBusqueda || 
                          producto.nombre.toLowerCase().includes(terminoBusqueda) ||
                          producto.marca.toLowerCase().includes(terminoBusqueda) ||
                          producto.codigo_barras?.toLowerCase().includes(terminoBusqueda);
                        const cumpleTipo = tipoFiltroModalGestion === 'todos' || 
                          producto.tipo === tipoFiltroModalGestion;
                        return cumpleBusqueda && cumpleTipo;
                      }).length
                    } 
                    style={{ backgroundColor: '#667eea' }}
                  />
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {(() => {
                  // Filtrar productos según búsqueda y tipo
                  const productosFiltrados = productos.filter((producto) => {
                    // Filtro de búsqueda
                    const terminoBusqueda = busquedaModalGestion.toLowerCase();
                    const cumpleBusqueda = !terminoBusqueda || 
                      producto.nombre.toLowerCase().includes(terminoBusqueda) ||
                      producto.marca.toLowerCase().includes(terminoBusqueda) ||
                      producto.codigo_barras?.toLowerCase().includes(terminoBusqueda);
                    
                    // Filtro de tipo
                    const cumpleTipo = tipoFiltroModalGestion === 'todos' || 
                      producto.tipo === tipoFiltroModalGestion;
                    
                    return cumpleBusqueda && cumpleTipo;
                  });

                  // Mostrar mensaje si no hay productos
                  if (productos.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text type="secondary">
                          No hay productos disponibles. Crea productos primero usando el botón "Nuevo Producto".
                        </Text>
                      </div>
                    );
                  }

                  // Mostrar mensaje si no hay resultados del filtro
                  if (productosFiltrados.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                          🔍 No se encontraron productos con los filtros aplicados
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '14px', marginTop: '8px' }}>
                          Intenta con otros términos de búsqueda o cambia el filtro de tipo
                        </Text>
                      </div>
                    );
                  }

                  // Mostrar productos filtrados
                  return productosFiltrados.map((producto) => {
                    const sucursalData = producto.sucursales?.find(
                      s => s.sucursal === sucursalSeleccionada
                    );

                    return (
                      <Card 
                        key={producto.id}
                        size="small"
                        style={{ 
                          background: '#fafafa',
                          borderLeft: `4px solid ${sucursalData?.stock && sucursalData.stock > 0 ? '#52c41a' : '#ff4d4f'}`
                        }}
                      >
                        <Row gutter={[16, 16]} align="middle">
                          {/* Información del Producto */}
                          <Col span={8}>
                            <Space direction="vertical" size="small">
                              <Text strong style={{ fontSize: '15px' }}>
                                {producto.nombre}
                              </Text>
                              <Space size="small">
                                <Tag color="blue">{producto.marca}</Tag>
                                <Tag color="cyan">{producto.tipo}</Tag>
                                <Tag color="purple">{producto.calidad}</Tag>
                              </Space>
                            </Space>
                          </Col>

                          {/* Stock Actual */}
                          <Col span={5}>
                            <Space direction="vertical" size={0}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Stock Actual
                              </Text>
                              <Text 
                                strong 
                                style={{ 
                                  fontSize: '20px',
                                  color: sucursalData?.stock && sucursalData.stock > (sucursalData.stock_minimo || 10) 
                                    ? '#52c41a' 
                                    : '#ff4d4f'
                                }}
                              >
                                {sucursalData?.stock || 0}
                              </Text>
                            </Space>
                          </Col>

                          {/* Precio */}
                          <Col span={5}>
                            <Space direction="vertical" size={0}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Precio
                              </Text>
                              <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                                ${sucursalData?.precio?.toFixed(2) || '0.00'}
                              </Text>
                            </Space>
                          </Col>

                          {/* Botón de Editar */}
                          <Col span={6} style={{ textAlign: 'right' }}>
                            <Button
                              type="primary"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setProductoEditando(producto);
                                setModalStockVisible(true);
                                formStock.setFieldsValue({
                                  stock: sucursalData?.stock || 0,
                                  precio: sucursalData?.precio || 0,
                                  stock_minimo: sucursalData?.stock_minimo || 10
                                });
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none'
                              }}
                            >
                              Editar
                            </Button>
                          </Col>
                        </Row>
                      </Card>
                    );
                  });
                })()}
              </Space>
            </Card>
          </Space>
        </Spin>
      </Modal>

      {/* Estilos para el botón de gestión */}
      <style>{`
        .price-management-btn:hover {
          background: linear-gradient(135deg, #3e2723 0%, #4a3728 50%, #5d4037 100%) !important;
          box-shadow: 0 6px 20px rgba(74, 55, 40, 0.6) !important;
          transform: translateY(-2px);
        }
        
        .price-management-btn:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(62, 39, 35, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default Products;
