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
  Collapse,
  Alert
} from 'antd';
import ReactSelect, { StylesConfig } from 'react-select';
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
  DeleteOutlined,
  InboxOutlined
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
 * ESTILOS PERSONALIZADOS PARA REACT-SELECT
 */
const customSelectStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '48px',
    borderRadius: '12px',
    border: state.isFocused ? '2px solid #1890ff' : '2px solid #d9d9d9',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#1890ff'
    },
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#1890ff' 
      : state.isFocused 
      ? '#e6f7ff' 
      : 'white',
    color: state.isSelected ? 'white' : '#000',
    cursor: 'pointer',
    padding: '12px 16px',
    transition: 'all 0.2s ease',
    '&:active': {
      backgroundColor: '#1890ff'
    }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    marginTop: '4px',
    zIndex: 9999
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
    maxHeight: '300px'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#000',
    fontSize: '15px',
    fontWeight: 500
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#bfbfbf',
    fontSize: '15px'
  }),
  input: (provided) => ({
    ...provided,
    color: '#000',
    fontSize: '15px'
  }),
  indicatorSeparator: () => ({
    display: 'none'
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#1890ff' : '#bfbfbf',
    '&:hover': {
      color: '#1890ff'
    },
    transition: 'all 0.2s ease'
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  })
};

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
  const [modalEditarPrecios, setModalEditarPrecios] = useState(false);
  const [modalGestionarStock, setModalGestionarStock] = useState(false);
  const [modalEditarStock, setModalEditarStock] = useState(false);
  
  // Estados para filtros del modal de gestión
  const [busquedaModalGestion, setBusquedaModalGestion] = useState('');
  const [tipoFiltroModalGestion, setTipoFiltroModalGestion] = useState<string>('todos');
  const [marcaFiltroModalGestion, setMarcaFiltroModalGestion] = useState<string>('todas');
  
  // Estados para filtros del modal de gestión de stock
  const [busquedaModalGestionStock, setBusquedaModalGestionStock] = useState('');
  const [tipoFiltroModalGestionStock, setTipoFiltroModalGestionStock] = useState<string>('todos');
  const [marcaFiltroModalGestionStock, setMarcaFiltroModalGestionStock] = useState<string>('todas');
  
  // Estado para producto seleccionado para editar precios
  const [productoEditandoPrecios, setProductoEditandoPrecios] = useState<ProductoCompleto | null>(null);
  const [preciosPorSucursal, setPreciosPorSucursal] = useState<{ [key: string]: number }>({});
  
  // Estado para producto seleccionado para editar stock
  const [productoEditandoStock, setProductoEditandoStock] = useState<ProductoCompleto | null>(null);
  const [stockPorSucursal, setStockPorSucursal] = useState<{ [key: string]: number }>({});
  const [productosConSucursales, setProductosConSucursales] = useState<ProductoCompleto[]>([]);
  const [loadingProductosConSucursales, setLoadingProductosConSucursales] = useState(false);
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
       const API_URL = import.meta.env.VITE_API_URL || 
         (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
           ? '/api' 
           : 'http://localhost:3456/api');
       const response = await fetch(`${API_URL}/sucursales`);
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
   * Cargar productos con información de TODAS las sucursales
   * Se usa para el modal "Gestionar Stock" que necesita calcular stock total
   */
  const cargarProductosConSucursales = async () => {
    setLoadingProductosConSucursales(true);
    try {
      const data = await productosService.obtenerConSucursales();
      // Ordenar productos por tipo
      const datosOrdenados = [...data].sort((a, b) => {
        const ordenA = obtenerOrdenTipo(a.tipo);
        const ordenB = obtenerOrdenTipo(b.tipo);
        if (ordenA !== ordenB) {
          return ordenA - ordenB;
        }
        return a.nombre.localeCompare(b.nombre);
      });
      setProductosConSucursales(datosOrdenados);
      console.log(`✅ ${datosOrdenados.length} productos cargados con todas las sucursales`);
    } catch (error) {
      console.error('Error al cargar productos con sucursales:', error);
      message.error('Error al cargar productos');
    } finally {
      setLoadingProductosConSucursales(false);
    }
  };

  /**
   * Cargar marcas disponibles desde la base de datos
   */
  const cargarMarcas = async () => {
    setLoadingMarcas(true);
    try {
      const data = await productosService.obtenerCategorias('marca');
      console.log('✅ Marcas cargadas desde BD:', data);
      // Validar que sea un array válido
      if (Array.isArray(data)) {
        setMarcas(data);
      } else {
        console.error('❌ Marcas no es un array:', data);
        setMarcas([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar marcas:', error);
      message.error('Error al cargar marcas desde la base de datos');
      setMarcas([]); // Array vacío en caso de error
    } finally {
      setLoadingMarcas(false);
    }
  };

  /**
   * Cargar tipos disponibles desde la base de datos
   */
  const cargarTipos = async () => {
    setLoadingTipos(true);
    try {
      const data = await productosService.obtenerCategorias('tipo');
      console.log('✅ Tipos cargados desde BD:', data);
      // Validar que sea un array válido
      if (Array.isArray(data)) {
        setTipos(data);
      } else {
        console.error('❌ Tipos no es un array:', data);
        setTipos([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar tipos:', error);
      message.error('Error al cargar tipos desde la base de datos');
      setTipos([]); // Array vacío en caso de error
    } finally {
      setLoadingTipos(false);
    }
  };

  /**
   * Cargar calidades disponibles desde la base de datos
   */
  const cargarCalidades = async () => {
    setLoadingCalidades(true);
    try {
      const data = await productosService.obtenerCategorias('calidad');
      console.log('✅ Calidades cargadas desde BD:', data);
      // Validar que sea un array válido
      if (Array.isArray(data)) {
        setCalidades(data);
      } else {
        console.error('❌ Calidades no es un array:', data);
        setCalidades([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar calidades:', error);
      message.error('Error al cargar calidades desde la base de datos');
      setCalidades([]); // Array vacío en caso de error
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

      console.log('📦 Creando producto:', nuevoProducto);
      const response = await productosService.crear(nuevoProducto);
      console.log('✅ Respuesta del backend:', response);
      
      message.success('✅ Producto creado con stock inicial de 0 en todas las sucursales');
      setModalCrearVisible(false);
      formCrear.resetFields();
      
      // Delay más largo y reload completo para asegurar que se vea el stock correcto
      console.log('⏳ Esperando 1 segundo antes de recargar productos...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Recargando productos de sucursal:', sucursalSeleccionada);
      
      // Forzar recarga completa limpiando la lista primero
      setProductos([]);
      await cargarProductos();
      
      console.log('✅ Productos recargados. Stock debe estar en 0 para el nuevo producto.');
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      message.error('Error al crear producto');
    }
  };

  /**
   * Actualizar información básica del producto + stock, precio y stock_minimo de todas las sucursales
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

      // 2. 🆕 Actualizar stock, precio y stock_minimo de CADA sucursal
      for (const sucursalObj of sucursales) {
        const sucursal = sucursalObj.sucursal;
        const datos: Partial<ProductoSucursalInput> = {
          stock: values[`stock_${sucursal}`] || 0,
          precio: values[`precio_${sucursal}`] || 0,
          stock_minimo: values[`stock_minimo_${sucursal}`] || 0 // ⭐ NUEVO: Guardar stock_minimo configurado
        };

        await productosService.actualizarSucursal(
          productoEditando.id,
          sucursal,
          datos
        );
      }

      message.success('✅ Producto actualizado exitosamente (incluyendo alertas de stock mínimo)');
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
        stock_minimo: 0
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

    // 🆕 Cargar stock, precio y stock_minimo de TODAS las sucursales
    try {
      setLoading(true);
      const productoCompleto = await productosService.obtenerPorId(producto.id);
      
      if (productoCompleto) {
        // Cargar stock, precio y stock_minimo de cada sucursal en el formulario
        const sucursalesData: any = {};
        sucursales.forEach(sucursalObj => {
          const sucursal = sucursalObj.sucursal;
          const sucursalData = productoCompleto.sucursales?.find(s => s.sucursal === sucursal);
          sucursalesData[`stock_${sucursal}`] = sucursalData?.stock || 0;
          sucursalesData[`precio_${sucursal}`] = sucursalData?.precio || 0;
          sucursalesData[`stock_minimo_${sucursal}`] = sucursalData?.stock_minimo || 0; // ⭐ NUEVO
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
      precio: producto.precio || 0
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
      width: 100,
      responsive: ['sm'] as any,
      filters: Array.isArray(marcas) && marcas.length > 0 
        ? marcas.map(m => ({ 
            text: m?.valor || 'Sin marca', 
            value: m?.valor || '' 
          }))
        : [],
      onFilter: (value, record) => record.marca === value,
      render: (marca: string) => marca ? <Text>{marca}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      filters: Array.isArray(tipos) && tipos.length > 0 
        ? tipos.map(t => ({ 
            text: t?.valor || 'Sin tipo', 
            value: t?.valor || '' 
          }))
        : [],
      onFilter: (value, record) => record.tipo === value,
      sorter: (a, b) => {
        const ordenA = obtenerOrdenTipo(a.tipo || '');
        const ordenB = obtenerOrdenTipo(b.tipo || '');
        if (ordenA !== ordenB) {
          return ordenA - ordenB;
        }
        return (a.nombre || '').localeCompare(b.nombre || '');
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
      width: 100,
      responsive: ['md'] as any,
      filters: Array.isArray(calidades) && calidades.length > 0 
        ? calidades.map(c => ({ 
            text: c?.valor || 'Sin calidad', 
            value: c?.valor || '' 
          }))
        : [],
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
      width: 100,
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
              {stock || 0}
            </Tag>
          </Badge>
        );
      }
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.precio || 0) - (b.precio || 0),
      render: (precio: number) => {
        const precioNum = Number(precio) || 0;
        return (
          <Text strong style={{ color: '#52c41a' }}>
            ${precioNum.toFixed(0)}
          </Text>
        );
      }
    },
    {
      title: 'Código',
      dataIndex: 'codigo_barras',
      key: 'codigo_barras',
      width: 130,
      responsive: ['xl'] as any,
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
              
              {/* 📦 Botón Gestionar Stock */}
              <Button
                icon={<InboxOutlined />}
                onClick={() => {
                  // Limpiar filtros al abrir el modal
                  setBusquedaModalGestionStock('');
                  setTipoFiltroModalGestionStock('todos');
                  setMarcaFiltroModalGestionStock('todas');
                  // Cargar productos con información de todas las sucursales
                  cargarProductosConSucursales();
                  setModalGestionarStock(true);
                }}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #ffb3d9 0%, #ff85c0 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(255, 133, 192, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                className="stock-management-btn"
              >
                Gestionar Stock
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
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Selector de Sucursal */}
        <Col xs={24} md={12}>
          <Card 
            hoverable
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              border: sucursalSeleccionada ? '2px solid #1890ff' : '1px solid #d9d9d9',
              background: sucursalSeleccionada ? '#f0f8ff' : 'white',
              height: '100%'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <ShopOutlined 
                style={{ 
                  fontSize: '48px', 
                  color: sucursalSeleccionada ? '#1890ff' : '#8c8c8c'
                }} 
              />
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                Sucursal
              </Title>
              <ReactSelect
                placeholder="Seleccionar sucursal"
                value={sucursalSeleccionada ? { 
                  value: sucursalSeleccionada, 
                  label: formatearNombreSucursal(sucursalSeleccionada) + (sucursalSeleccionada === 'maldonado' ? ' - Stock Principal' : '')
                } : null}
                onChange={(option) => setSucursalSeleccionada(option?.value || '')}
                options={sucursales.map(sucursalObj => ({
                  value: sucursalObj.sucursal,
                  label: formatearNombreSucursal(sucursalObj.sucursal) + (sucursalObj.sucursal === 'maldonado' ? ' - Stock Principal' : '')
                }))}
                styles={customSelectStyles}
                isLoading={loadingSucursales}
                isClearable={false}
                isSearchable={true}
                noOptionsMessage={() => 'No hay sucursales disponibles'}
                loadingMessage={() => 'Cargando...'}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </Space>
          </Card>
        </Col>

        {/* Búsqueda */}
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px solid #d9d9d9',
              height: '100%'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <SearchOutlined 
                style={{ 
                  fontSize: '48px', 
                  color: '#8c8c8c'
                }} 
              />
              <Title level={4} style={{ margin: 0 }}>
                Buscar Producto
              </Title>
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
          </Card>
        </Col>
      </Row>
          
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
          />
        </Card>

      {/* 🎯 Modal: Crear Producto - Diseño Minimalista */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: '#52c41a', fontSize: 20 }} />
            <span style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>Crear Nuevo Producto</span>
          </Space>
        }
        open={modalCrearVisible}
        onOk={handleCrearProducto}
        onCancel={() => {
          setModalCrearVisible(false);
          formCrear.resetFields();
        }}
        okText="💾 Crear Producto"
        cancelText="Cancelar"
        width={700}
        okButtonProps={{
          size: 'large',
          style: { background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', border: 'none' }
        }}
        cancelButtonProps={{ size: 'large' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Info Card */}
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Space>
              <TagOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                El producto se creará en <Text strong>TODAS las sucursales</Text> con stock inicial de 0 unidades
              </Text>
            </Space>
          </Card>

          <Form form={formCrear} layout="vertical">
            {/* Nombre del Producto */}
            <Form.Item
              label={<Text strong>📦 Nombre del Producto</Text>}
              name="nombre"
              rules={[{ required: true, message: 'El nombre es obligatorio' }]}
            >
              <Input 
                placeholder="Ej: iPhone 15 Display" 
                size="large"
                prefix={<TagOutlined style={{ color: '#bfbfbf' }} />}
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              {/* Marca */}
              <Col xs={24} sm={12}>
                <Text strong>🏷️ Marca</Text>
                <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                  <Form.Item name="marca" noStyle>
                    <Select
                      placeholder="Selecciona marca"
                      loading={loadingMarcas}
                      showSearch
                      allowClear
                      size="large"
                      style={{ flex: 1 }}
                      options={Array.isArray(marcas) ? marcas.map(m => ({ 
                        label: m?.valor || 'Sin marca', 
                        value: m?.valor || '' 
                      })) : []}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Tooltip title="Agregar nueva marca">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalAgregarMarca(true)}
                      size="large"
                    />
                  </Tooltip>
                </Space.Compact>
              </Col>

              {/* Tipo */}
              <Col xs={24} sm={12}>
                <Text strong>🔧 Tipo</Text>
                <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                  <Form.Item name="tipo" noStyle>
                    <Select
                      placeholder="Selecciona tipo"
                      loading={loadingTipos}
                      showSearch
                      allowClear
                      size="large"
                      style={{ flex: 1 }}
                      options={Array.isArray(tipos) ? tipos.map(t => ({ 
                        label: t?.valor || 'Sin tipo', 
                        value: t?.valor || '' 
                      })) : []}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Tooltip title="Agregar nuevo tipo">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalAgregarTipo(true)}
                      size="large"
                    />
                  </Tooltip>
                </Space.Compact>
              </Col>

              {/* Calidad */}
              <Col xs={24} sm={12}>
                <Text strong>⭐ Calidad</Text>
                <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                  <Form.Item name="calidad" noStyle>
                    <Select
                      placeholder="Selecciona calidad"
                      loading={loadingCalidades}
                      showSearch
                      allowClear
                      size="large"
                      style={{ flex: 1 }}
                      options={Array.isArray(calidades) ? calidades.map(c => ({ 
                        label: c?.valor || 'Sin calidad', 
                        value: c?.valor || '' 
                      })) : []}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                  </Form.Item>
                  <Tooltip title="Agregar nueva calidad">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalAgregarCalidad(true)}
                      size="large"
                    />
                  </Tooltip>
                  <Tooltip title="Gestionar calidades">
                    <Button
                      icon={<SettingOutlined />}
                      onClick={() => setModalGestionarCalidades(true)}
                      size="large"
                    />
                  </Tooltip>
                </Space.Compact>
              </Col>

              {/* Código de Barras */}
              <Col xs={24} sm={12}>
                <Form.Item label={<Text strong>🔢 Código de Barras (Opcional)</Text>} name="codigo_barras">
                  <Input 
                    placeholder="Ej: 7891234567890" 
                    size="large"
                    prefix={<BarcodeOutlined style={{ color: '#bfbfbf' }} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Space>
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

          {/* 📝 Stock Mínimo (Alertas) por Sucursal */}
          <Card size="small" style={{ marginTop: 16 }} title="⚠️ Configurar Alertas de Stock Mínimo">
            <Alert
              message="Stock Mínimo"
              description="Configura la cantidad mínima de stock para cada sucursal. Cuando el stock esté por debajo de este valor, se mostrará una alerta."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Row gutter={[16, 16]}>
              {sucursales.map(sucursalObj => (
                <Col key={sucursalObj.sucursal} xs={24} sm={12} md={8}>
                  <Form.Item
                    label={`${formatearNombreSucursal(sucursalObj.sucursal)}`}
                    name={`stock_minimo_${sucursalObj.sucursal}`}
                    tooltip="Cuando el stock sea menor a este valor, se mostrará una alerta"
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="Stock mínimo"
                      addonBefore={<WarningOutlined style={{ color: '#faad14' }} />}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
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

      {/* 🎯 Modal: Gestionar Precios */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: '#667eea', fontSize: 20 }} />
            <span style={{ fontSize: 18, fontWeight: 600 }}>Gestionar Precios por Sucursal</span>
          </Space>
        }
        open={modalGestionarPrecios}
        onCancel={() => setModalGestionarPrecios(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Filtros */}
          <Card bodyStyle={{ padding: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <Input
                  placeholder="🔍 Buscar por nombre, marca..."
                  prefix={<SearchOutlined />}
                  value={busquedaModalGestion}
                  onChange={(e) => setBusquedaModalGestion(e.target.value)}
                  allowClear
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={7}>
                <Select
                  placeholder="Filtrar por tipo"
                  value={tipoFiltroModalGestion}
                  onChange={setTipoFiltroModalGestion}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="todos">Todos los tipos</Option>
                  {tipos.map(tipo => (
                    <Option key={tipo.valor} value={tipo.valor}>{tipo.valor}</Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={7}>
                <Select
                  placeholder="Filtrar por marca"
                  value={marcaFiltroModalGestion}
                  onChange={setMarcaFiltroModalGestion}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="todas">Todas las marcas</Option>
                  {marcas.map(marca => (
                    <Option key={marca.valor} value={marca.valor}>{marca.valor}</Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Tabla de Productos */}
          <Table
            columns={[
              {
                title: 'Producto',
                key: 'producto',
                width: 300,
                render: (_, record: ProductoCompleto) => (
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.nombre}</Text>
                    <Space size={4}>
                      <Tag color="blue" style={{ fontSize: 11 }}>{record.marca}</Tag>
                      <Tag color="cyan" style={{ fontSize: 11 }}>{record.tipo}</Tag>
                    </Space>
                  </Space>
                ),
              },
              {
                title: 'Precios por Sucursal',
                key: 'precios',
                render: (_, record: ProductoCompleto) => (
                  <Space wrap size={[4, 4]}>
                    {record.sucursales?.slice(0, 3).map((suc: any) => (
                      <Tag key={suc.sucursal} color={suc.precio > 0 ? 'green' : 'default'}>
                        {formatearNombreSucursal(suc.sucursal)}: ${suc.precio?.toFixed(0) || '0'}
                      </Tag>
                    ))}
                    {record.sucursales && record.sucursales.length > 3 && (
                      <Tag>+{record.sucursales.length - 3} más</Tag>
                    )}
                  </Space>
                ),
              },
              {
                title: 'Acción',
                key: 'accion',
                width: 120,
                align: 'center' as const,
                render: (_, record: ProductoCompleto) => (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setProductoEditandoPrecios(record);
                      // Inicializar precios actuales
                      const preciosActuales: { [key: string]: number } = {};
                      record.sucursales?.forEach((suc: any) => {
                        preciosActuales[suc.sucursal] = suc.precio || 0;
                      });
                      setPreciosPorSucursal(preciosActuales);
                      setModalEditarPrecios(true);
                    }}
                    size="small"
                  >
                    Editar
                  </Button>
                ),
              },
            ]}
            dataSource={productos.filter((producto) => {
              const terminoBusqueda = busquedaModalGestion.toLowerCase();
              const cumpleBusqueda = !terminoBusqueda || 
                producto.nombre.toLowerCase().includes(terminoBusqueda) ||
                producto.marca.toLowerCase().includes(terminoBusqueda);
              const cumpleTipo = tipoFiltroModalGestion === 'todos' || 
                producto.tipo === tipoFiltroModalGestion;
              const cumpleMarca = marcaFiltroModalGestion === 'todas' || 
                producto.marca === marcaFiltroModalGestion;
              return cumpleBusqueda && cumpleTipo && cumpleMarca;
            })}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="small"
            loading={loading}
          />
        </Space>
      </Modal>

      {/* Modal: Editar Precios por Sucursal */}
      <Modal
        title={
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            <span>{productoEditandoPrecios?.nombre} - Precios por Sucursal</span>
          </Space>
        }
        open={modalEditarPrecios}
        onCancel={() => {
          setModalEditarPrecios(false);
          setProductoEditandoPrecios(null);
          setPreciosPorSucursal({});
        }}
        onOk={async () => {
          if (!productoEditandoPrecios) return;
          
          try {
            // Actualizar precios para cada sucursal
            const promesas = Object.entries(preciosPorSucursal).map(([sucursal, precio]) => {
              return productosService.actualizarSucursal(
                productoEditandoPrecios.id,
                sucursal,
                {
                  precio: Number(precio),
                  // Mantener el stock actual sin cambios
                  stock: productoEditandoPrecios.sucursales?.find(s => s.sucursal === sucursal)?.stock || 0,
                  stock_minimo: 0
                }
              );
            });

            await Promise.all(promesas);
            message.success('✅ Precios actualizados correctamente');
            setModalEditarPrecios(false);
            setProductoEditandoPrecios(null);
            setPreciosPorSucursal({});
            cargarProductos();
          } catch (error) {
            message.error('Error al actualizar precios');
            console.error(error);
          }
        }}
        width={700}
        okText="💾 Guardar Precios"
        cancelText="Cancelar"
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Space>
              <TagOutlined style={{ color: '#52c41a' }} />
              <Text strong>{productoEditandoPrecios?.marca}</Text>
              <Tag color="blue">{productoEditandoPrecios?.tipo}</Tag>
            </Space>
          </Card>

          <Row gutter={[16, 16]}>
            {sucursales.map((sucursalObj) => {
              const sucursalNombre = sucursalObj.sucursal;
              const precioActual = preciosPorSucursal[sucursalNombre] || 0;
              
              return (
                <Col xs={24} sm={12} key={sucursalNombre}>
                  <Card size="small" bodyStyle={{ padding: '12px' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size={0}>
                      <Text strong style={{ fontSize: 13 }}>
                        <ShopOutlined /> {formatearNombreSucursal(sucursalNombre)}
                      </Text>
                      <InputNumber
                        prefix="$"
                        value={precioActual}
                        onChange={(value) => {
                          setPreciosPorSucursal({
                            ...preciosPorSucursal,
                            [sucursalNombre]: value || 0
                          });
                        }}
                        style={{ width: '100%', marginTop: 8 }}
                        min={0}
                        precision={2}
                        size="large"
                      />
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Space>
      </Modal>

      {/* 📦 Modal: Gestionar Stock */}
      <Modal
        title={
          <Space>
            <InboxOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span style={{ fontSize: 18, fontWeight: 600, color: 'black' }}>Gestionar Stock por Sucursal</span>
          </Space>
        }
        open={modalGestionarStock}
        onCancel={() => setModalGestionarStock(false)}
        footer={null}
        width={1200}
        style={{ top: 20 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Filtros */}
          <Card bodyStyle={{ padding: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <Input
                  placeholder="🔍 Buscar por nombre, marca..."
                  prefix={<SearchOutlined />}
                  value={busquedaModalGestionStock}
                  onChange={(e) => setBusquedaModalGestionStock(e.target.value)}
                  allowClear
                  size="large"
                />
              </Col>
              <Col xs={24} sm={12} md={7}>
                <Select
                  placeholder="Filtrar por tipo"
                  value={tipoFiltroModalGestionStock}
                  onChange={setTipoFiltroModalGestionStock}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Select.Option value="todos">Todos los tipos</Select.Option>
                  {Array.isArray(tipos) && tipos.map(t => (
                    <Select.Option key={t?.id || Math.random()} value={t?.valor || ''}>
                      {t?.valor || 'Sin tipo'}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={7}>
                <Select
                  placeholder="Filtrar por marca"
                  value={marcaFiltroModalGestionStock}
                  onChange={setMarcaFiltroModalGestionStock}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Select.Option value="todas">Todas las marcas</Select.Option>
                  {Array.isArray(marcas) && marcas.map(m => (
                    <Select.Option key={m?.id || Math.random()} value={m?.valor || ''}>
                      {m?.valor || 'Sin marca'}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Tabla de productos */}
          <Table
            columns={[
              {
                title: 'Producto',
                key: 'producto',
                width: 300,
                render: (_, record: ProductoCompleto) => (
                  <Space direction="vertical" size={0}>
                    <Text strong>{record.nombre}</Text>
                    <Space size={4}>
                      <Tag color="blue" style={{ fontSize: 11 }}>{record.marca}</Tag>
                      <Tag color="cyan" style={{ fontSize: 11 }}>{record.tipo}</Tag>
                    </Space>
                  </Space>
                ),
              },
              {
                title: 'Stock Total',
                key: 'stock_total',
                width: 120,
                align: 'center' as const,
                render: (_, record: ProductoCompleto) => {
                  const stockTotal = record.sucursales?.reduce((sum, suc: any) => sum + (suc.stock || 0), 0) || 0;
                  return (
                    <Tag color={stockTotal > 0 ? 'green' : 'red'}>
                      {stockTotal} unidades
                    </Tag>
                  );
                },
              },
              {
                title: 'Stock por Sucursal',
                key: 'stock_sucursal',
                render: (_, record: ProductoCompleto) => (
                  <Space wrap size={[4, 4]}>
                    {record.sucursales?.slice(0, 3).map((suc: any) => (
                      <Tag key={suc.sucursal} color={suc.stock > 0 ? 'blue' : 'default'}>
                        {formatearNombreSucursal(suc.sucursal)}: {suc.stock || 0}
                      </Tag>
                    ))}
                    {record.sucursales && record.sucursales.length > 3 && (
                      <Tag>+{record.sucursales.length - 3} más</Tag>
                    )}
                  </Space>
                ),
              },
              {
                title: 'Acción',
                key: 'accion',
                width: 120,
                align: 'center' as const,
                render: (_, record: ProductoCompleto) => (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setProductoEditandoStock(record);
                      const stockActual: { [key: string]: number } = {};
                      record.sucursales?.forEach((suc: any) => {
                        stockActual[suc.sucursal] = suc.stock || 0;
                      });
                      setStockPorSucursal(stockActual);
                      setModalEditarStock(true);
                    }}
                    size="small"
                  >
                    Editar
                  </Button>
                ),
              },
            ]}
            dataSource={productosConSucursales.filter((producto) => {
              // Filtro de búsqueda
              const busqueda = busquedaModalGestionStock.toLowerCase();
              const coincideBusqueda = busqueda === '' || 
                producto.nombre.toLowerCase().includes(busqueda) ||
                (producto.marca && producto.marca.toLowerCase().includes(busqueda));
              
              // Filtro de tipo
              const coincideTipo = tipoFiltroModalGestionStock === 'todos' || 
                producto.tipo === tipoFiltroModalGestionStock;
              
              // Filtro de marca
              const coincideMarca = marcaFiltroModalGestionStock === 'todas' || 
                producto.marca === marcaFiltroModalGestionStock;
              
              return coincideBusqueda && coincideTipo && coincideMarca;
            })}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="small"
            loading={loadingProductosConSucursales}
          />
        </Space>
      </Modal>

      {/* Modal: Editar Stock por Sucursal */}
      <Modal
        title={
          <Space>
            <InboxOutlined style={{ color: '#52c41a' }} />
            <span>{productoEditandoStock?.nombre} - Stock por Sucursal</span>
          </Space>
        }
        open={modalEditarStock}
        onCancel={() => {
          setModalEditarStock(false);
          setProductoEditandoStock(null);
          setStockPorSucursal({});
        }}
        onOk={async () => {
          if (!productoEditandoStock) return;
          
          try {
            // Actualizar stock para cada sucursal
            const promesas = Object.entries(stockPorSucursal).map(([sucursal, stock]) => {
              return productosService.actualizarSucursal(
                productoEditandoStock.id,
                sucursal,
                {
                  stock: Number(stock),
                  // Mantener el precio actual sin cambios
                  precio: productoEditandoStock.sucursales?.find(s => s.sucursal === sucursal)?.precio || 0,
                  stock_minimo: 0
                }
              );
            });
            
            await Promise.all(promesas);
            message.success('✅ Stock actualizado correctamente en todas las sucursales');
            setModalEditarStock(false);
            setProductoEditandoStock(null);
            setStockPorSucursal({});
            // Recargar ambas listas de productos
            cargarProductos();
            cargarProductosConSucursales();
          } catch (error) {
            message.error('Error al actualizar stock');
            console.error(error);
          }
        }}
        okText="💾 Guardar Cambios"
        cancelText="Cancelar"
        width={800}
        okButtonProps={{
          style: { background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', border: 'none' }
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Space>
              <TagOutlined style={{ color: '#52c41a' }} />
              <Text strong>{productoEditandoStock?.marca}</Text>
              <Tag color="blue">{productoEditandoStock?.tipo}</Tag>
            </Space>
          </Card>

          <Row gutter={[16, 16]}>
            {sucursales.map((sucursalObj) => {
              const sucursalNombre = sucursalObj.sucursal;
              const stockActual = stockPorSucursal[sucursalNombre] || 0;
              
              return (
                <Col xs={24} sm={12} key={sucursalNombre}>
                  <Card size="small" bodyStyle={{ padding: '12px' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size={0}>
                      <Text strong style={{ fontSize: 13 }}>
                        <ShopOutlined /> {formatearNombreSucursal(sucursalNombre)}
                      </Text>
                      <InputNumber
                        prefix="📦"
                        value={stockActual}
                        onChange={(value) => {
                          setStockPorSucursal({
                            ...stockPorSucursal,
                            [sucursalNombre]: value || 0
                          });
                        }}
                        style={{ width: '100%', marginTop: 8 }}
                        min={0}
                        precision={0}
                        size="large"
                        addonAfter="unidades"
                      />
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Space>
      </Modal>

      {/* Estilos para los botones de gestión */}
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
        
        .stock-management-btn:hover {
          background: linear-gradient(135deg, #ff85c0 0%, #ff5ca8 100%) !important;
          box-shadow: 0 6px 20px rgba(255, 92, 168, 0.6) !important;
          transform: translateY(-2px);
        }
        
        .stock-management-btn:active {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(255, 133, 192, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default Products;
