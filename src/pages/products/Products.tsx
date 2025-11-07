/**
 * Componente de Gestión de Productos
 * Permite ver y gestionar productos con stock y precios por sucursal
 * Sistema ZARPAR
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  RocketOutlined,
  DeleteOutlined
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
  
  // Estados para selección y eliminación de productos
  const [productosSeleccionados, setProductosSeleccionados] = useState<number[]>([]);
  const [loadingEliminar, setLoadingEliminar] = useState(false);

  // Estados para categorías (marcas, tipos y calidades)
  const [marcas, setMarcas] = useState<Array<{ id: number; valor: string }>>([]);
  const [tipos, setTipos] = useState<Array<{ id: number; valor: string }>>([]);
  const [calidades, setCalidades] = useState<Array<{ id: number; valor: string }>>([]);
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
  const [modalGestionarCalidades, setModalGestionarCalidades] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoCompleto | null>(null);
  const [nuevaMarca, setNuevaMarca] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('');
  const [nuevaCalidad, setNuevaCalidad] = useState('');
  const [calidadEditando, setCalidadEditando] = useState<{ id: number; valor: string } | null>(null);
  const [valorEditandoCalidad, setValorEditandoCalidad] = useState('');

  // Forms
  const [formCrear] = Form.useForm();
  const [formEditar] = Form.useForm();
  const [formStock] = Form.useForm();

  /**
   * Orden de prioridad para tipos de producto
   */
  const obtenerOrdenTipo = (tipo: string): number => {
    const orden: { [key: string]: number } = {
      'Display': 1,
      'Batería': 2,
      'Flex': 3,
      'Placa Carga': 4,
      'Botón': 5,
      'Antena': 6
    };
    return orden[tipo] || 999; // Cualquier otro tipo va al final
  };

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
      // Ordenar productos por tipo: Display, Batería, Flex, etc.
      const datosOrdenados = [...data].sort((a, b) => {
        const ordenA = obtenerOrdenTipo(a.tipo);
        const ordenB = obtenerOrdenTipo(b.tipo);
        if (ordenA !== ordenB) {
          return ordenA - ordenB;
        }
        // Si son del mismo tipo, ordenar por nombre
        return a.nombre.localeCompare(b.nombre);
      });
      setProductos(datosOrdenados);
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
   * Editar una calidad existente
   */
  const handleEditarCalidad = async () => {
    if (!calidadEditando || !valorEditandoCalidad.trim()) {
      message.warning('Por favor ingresa un nombre válido para la calidad');
      return;
    }

    try {
      await productosService.editarCategoria(calidadEditando.id, 'calidad', valorEditandoCalidad.trim());
      message.success('Calidad actualizada exitosamente');
      setCalidadEditando(null);
      setValorEditandoCalidad('');
      await cargarCalidades(); // Recargar lista
    } catch (error: any) {
      console.error('Error al editar calidad:', error);
      if (error.response?.status === 409) {
        message.error('Ya existe una calidad con este nombre');
      } else {
        message.error('Error al editar calidad');
      }
    }
  };

  /**
   * Eliminar una calidad
   */
  const handleEliminarCalidad = async (id: number, nombre: string) => {
    try {
      await productosService.eliminarCategoria(id, 'calidad');
      message.success(`Calidad "${nombre}" eliminada exitosamente`);
      await cargarCalidades(); // Recargar lista
    } catch (error: any) {
      console.error('Error al eliminar calidad:', error);
      if (error.response?.status === 409) {
        message.error('No se puede eliminar esta calidad porque hay productos que la están usando');
      } else {
        message.error('Error al eliminar calidad');
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
      // Ordenar resultados de búsqueda por tipo
      const datosOrdenados = [...data].sort((a, b) => {
        const ordenA = obtenerOrdenTipo(a.tipo);
        const ordenB = obtenerOrdenTipo(b.tipo);
        if (ordenA !== ordenB) {
          return ordenA - ordenB;
        }
        // Si son del mismo tipo, ordenar por nombre
        return a.nombre.localeCompare(b.nombre);
      });
      setProductos(datosOrdenados);
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
   * ===================================
   * FUNCIONES DE ELIMINACIÓN
   * ===================================
   */

  /**
   * Manejar selección/deselección de todos los productos
   */
  const handleSeleccionarTodos = (checked: boolean) => {
    if (checked) {
      const todosLosIds = productos.map(p => p.id);
      setProductosSeleccionados(todosLosIds);
    } else {
      setProductosSeleccionados([]);
    }
  };

  /**
   * Manejar selección/deselección de un producto individual
   */
  const handleSeleccionarProducto = (id: number, checked: boolean) => {
    if (checked) {
      setProductosSeleccionados(prev => [...prev, id]);
    } else {
      setProductosSeleccionados(prev => prev.filter(pid => pid !== id));
    }
  };

  /**
   * Eliminar un producto individual
   */
  const handleEliminarProducto = async (id: number, nombre: string) => {
    try {
      setLoadingEliminar(true);
      await productosService.eliminar(id);
      message.success(`Producto "${nombre}" eliminado permanentemente`);
      cargarProductos(); // Recargar lista
      setProductosSeleccionados(prev => prev.filter(pid => pid !== id)); // Quitar de selección
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      message.error('Error al eliminar el producto');
    } finally {
      setLoadingEliminar(false);
    }
  };

  /**
   * Eliminar múltiples productos seleccionados
   */
  const handleEliminarSeleccionados = async () => {
    if (productosSeleccionados.length === 0) {
      message.warning('No hay productos seleccionados para eliminar');
      return;
    }

    try {
      setLoadingEliminar(true);
      const resultado = await productosService.eliminarMultiple(productosSeleccionados);
      message.success(
        `${resultado.productosEliminados} producto(s) eliminado(s) permanentemente de la base de datos`
      );
      setProductosSeleccionados([]); // Limpiar selección
      cargarProductos(); // Recargar lista
    } catch (error) {
      console.error('Error al eliminar productos:', error);
      message.error('Error al eliminar los productos seleccionados');
    } finally {
      setLoadingEliminar(false);
    }
  };

  /**
   * Columnas de la tabla
   */
  /**
   * Productos ordenados: Display primero, Batería segundo, resto después
   * Se aplica el orden cada vez que cambian los productos
   */
  const productosOrdenados = useMemo(() => {
    return [...productos].sort((a, b) => {
      const ordenA = obtenerOrdenTipo(a.tipo);
      const ordenB = obtenerOrdenTipo(b.tipo);
      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }
      // Si son del mismo tipo, ordenar por nombre
      return a.nombre.localeCompare(b.nombre);
    });
  }, [productos]);

  const columns: ColumnsType<ProductoCompleto> = [
    // 🔐 Columna de selección: SOLO para administradores
    ...(esAdministrador ? [{
      title: (
        <input
          type="checkbox"
          checked={productosSeleccionados.length === productos.length && productos.length > 0}
          onChange={(e) => handleSeleccionarTodos(e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
      ),
      key: 'seleccion',
      width: 50,
      fixed: 'left' as const,
      render: (_: any, record: ProductoCompleto) => (
        <input
          type="checkbox"
          checked={productosSeleccionados.includes(record.id)}
          onChange={(e) => handleSeleccionarProducto(record.id, e.target.checked)}
          style={{ cursor: 'pointer' }}
        />
      )
    }] : []),
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
      filters: marcas.map(m => ({ text: m.valor, value: m.valor })),
      onFilter: (value, record) => record.marca === value,
      render: (marca: string) => marca ? <Text>{marca}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
      filters: tipos.map(t => ({ text: t.valor, value: t.valor })),
      onFilter: (value, record) => record.tipo === value,
      sorter: (a, b) => {
        const ordenA = obtenerOrdenTipo(a.tipo);
        const ordenB = obtenerOrdenTipo(b.tipo);
        if (ordenA !== ordenB) {
          return ordenA - ordenB;
        }
        return a.nombre.localeCompare(b.nombre);
      },
      defaultSortOrder: 'ascend' as const,
      render: (tipo: string) => {
        // Colores según tipo para mejor visualización
        const colorTipo: { [key: string]: string } = {
          'Display': 'blue',
          'Batería': 'green',
          'Flex': 'purple',
          'Placa Carga': 'orange',
          'Botón': 'cyan',
          'Antena': 'magenta'
        };
        return tipo ? <Tag color={colorTipo[tipo] || 'default'} style={{ fontSize: '10px' }}>{tipo}</Tag> : <Text type="secondary">-</Text>;
      }
    },
    {
      title: 'Calidad',
      dataIndex: 'calidad',
      key: 'calidad',
      width: 120,
      filters: calidades.map(c => ({ text: c.valor, value: c.valor })),
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
      width: 200,
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
          <Popconfirm
            title="¿Eliminar producto?"
            description={
              <>
                <Text>¿Estás seguro de eliminar <strong>"{record.nombre}"</strong>?</Text>
                <br />
                <Text type="danger" style={{ fontSize: '12px' }}>
                  Esta acción es IRREVERSIBLE y eliminará el producto de todas las sucursales.
                </Text>
              </>
            }
            onConfirm={() => handleEliminarProducto(record.id, record.nombre)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar producto">
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                loading={loadingEliminar}
              />
            </Tooltip>
          </Popconfirm>
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

                  {/* 🗑️ Botón Eliminar Seleccionados */}
                  {productosSeleccionados.length > 0 && (
                    <Popconfirm
                      title={`¿Eliminar ${productosSeleccionados.length} producto(s)?`}
                      description={
                        <>
                          <Text>Estás a punto de eliminar <strong>{productosSeleccionados.length}</strong> producto(s).</Text>
                          <br />
                          <Text type="danger" style={{ fontSize: '12px' }}>
                            Esta acción es IRREVERSIBLE y eliminará los productos de TODAS las sucursales.
                          </Text>
                        </>
                      }
                      onConfirm={handleEliminarSeleccionados}
                      okText="Eliminar Todos"
                      cancelText="Cancelar"
                      okButtonProps={{ danger: true, loading: loadingEliminar }}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="large"
                        loading={loadingEliminar}
                      >
                        Eliminar Seleccionados ({productosSeleccionados.length})
                      </Button>
                    </Popconfirm>
                  )}
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
          dataSource={productosOrdenados}
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
                      options={calidades.map(c => ({ label: c.valor, value: c.valor }))}
                    />
                </Form.Item>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalAgregarCalidad(true)}
                  />
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setModalGestionarCalidades(true)}
                    title="Gestionar Calidades"
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
                        options={calidades.map(c => ({ label: c.valor, value: c.valor }))}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalAgregarCalidad(true)}
                    />
                    <Button
                      icon={<SettingOutlined />}
                      onClick={() => setModalGestionarCalidades(true)}
                      title="Gestionar Calidades"
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

      {/* 🎯 Modal: Gestionar Calidades */}
      <Modal
        title={
          <Space>
            <SettingOutlined style={{ color: '#1890ff' }} />
            <span>Gestionar Calidades</span>
          </Space>
        }
        open={modalGestionarCalidades}
        onCancel={() => {
          setModalGestionarCalidades(false);
          setCalidadEditando(null);
          setValorEditandoCalidad('');
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setModalGestionarCalidades(false);
              setCalidadEditando(null);
              setValorEditandoCalidad('');
            }}
          >
            Cerrar
          </Button>
        ]}
        width={600}
      >
        <Spin spinning={loadingCalidades}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Descripción */}
            <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
              <Text>
                💡 Aquí puedes <strong>editar</strong> o <strong>eliminar</strong> las calidades existentes.
                Las calidades en uso no podrán eliminarse.
              </Text>
            </Card>

            {/* Lista de Calidades */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {calidades.length === 0 ? (
                  <Card>
                    <Text type="secondary">No hay calidades registradas</Text>
                  </Card>
                ) : (
                  calidades.map((calidad) => (
                    <Card
                      key={calidad.id}
                      size="small"
                      style={{
                        border: calidadEditando?.id === calidad.id ? '2px solid #1890ff' : '1px solid #d9d9d9'
                      }}
                    >
                      {calidadEditando?.id === calidad.id ? (
                        // Modo edición
                        <Space style={{ width: '100%' }} size="middle">
                          <Input
                            value={valorEditandoCalidad}
                            onChange={(e) => setValorEditandoCalidad(e.target.value)}
                            onPressEnter={handleEditarCalidad}
                            placeholder="Nuevo nombre"
                            style={{ flex: 1 }}
                            autoFocus
                          />
                          <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleEditarCalidad}
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={() => {
                              setCalidadEditando(null);
                              setValorEditandoCalidad('');
                            }}
                          >
                            Cancelar
                          </Button>
                        </Space>
                      ) : (
                        // Modo visualización
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Space>
                            <TagOutlined style={{ color: '#1890ff' }} />
                            <Text strong>{calidad.valor}</Text>
                          </Space>
                          <Space>
                            <Button
                              type="link"
                              icon={<EditOutlined />}
                              onClick={() => {
                                setCalidadEditando(calidad);
                                setValorEditandoCalidad(calidad.valor);
                              }}
                            >
                              Editar
                            </Button>
                            <Popconfirm
                              title="¿Eliminar calidad?"
                              description={`¿Estás seguro de eliminar "${calidad.valor}"? Esta acción no se puede deshacer.`}
                              onConfirm={() => handleEliminarCalidad(calidad.id, calidad.valor)}
                              okText="Sí, eliminar"
                              cancelText="Cancelar"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="link"
                                danger
                                icon={<WarningOutlined />}
                              >
                                Eliminar
                              </Button>
                            </Popconfirm>
                          </Space>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </Space>
            </div>

            {/* Botón para agregar nueva calidad */}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => {
                setModalGestionarCalidades(false);
                setModalAgregarCalidad(true);
              }}
            >
              Agregar Nueva Calidad
            </Button>
          </Space>
        </Spin>
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
