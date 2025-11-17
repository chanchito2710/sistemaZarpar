import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Row,
  Col,
  Badge,
  Tooltip,
  Modal,
  InputNumber,
  message,
  Drawer,
  Alert,
  DatePicker,
  Tabs,
  Statistic,
  Progress,
  Divider
} from 'antd';
import {
  InboxOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  ShopOutlined,
  MobileOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  FilePdfOutlined,
  WarningOutlined,
  EyeOutlined,
  DollarOutlined
} from '@ant-design/icons';
import ReactSelect, { StylesConfig } from 'react-select';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRANCHES } from '../../data/branches';
import { productosService, devolucionesService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Inventory.css';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface InventoryItem {
  key: string;
  producto_id: number;
  sucursal: string;
  marca: string;
  modelo: string;
  tipo: string;
  producto: string;
  stock: number;
  recibidos: number;
  categoria: string;
}

interface StockFalla {
  producto_id: number;
  nombre: string;
  marca: string;
  tipo: string;
  sucursal: string;
  stock_fallas: number;
  stock_actual: number;
}

const Inventory: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = usuario?.sucursal?.toLowerCase() || 'pando';
  
  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? '/api' 
      : 'http://localhost:3456/api');
  
  // ✅ Estilos personalizados para react-select (igual que POS)
  const customSelectStyles: StylesConfig = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '48px',
      borderRadius: '10px',
      border: state.isFocused ? '2px solid #1890ff' : '2px solid #d9d9d9',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(24, 144, 255, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#1890ff',
      },
      cursor: 'pointer',
      transition: 'all 0.3s ease',
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
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: state.isSelected ? 600 : 400,
      '&:active': {
        backgroundColor: '#40a9ff',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      marginTop: '4px',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
      maxHeight: '300px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#262626',
      fontSize: '14px',
      fontWeight: 500,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#bfbfbf',
      fontSize: '14px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#8c8c8c',
      '&:hover': {
        color: '#1890ff',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };
  
  const [searchText, setSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSucursal, setSelectedSucursal] = useState<string>(esAdmin ? 'all' : sucursalUsuario);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Datos de inventario desde la BD
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  
  // Estados para marcas, modelos y tipos dinámicos
  const [marcasDisponibles, setMarcasDisponibles] = useState<string[]>([]);
  const [modelosDisponibles, setModelosDisponibles] = useState<string[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>([]);

  // Drawer Stock Fallas
  const [drawerFallasVisible, setDrawerFallasVisible] = useState(false);
  const [stockFallas, setStockFallas] = useState<StockFalla[]>([]);
  const [loadingFallas, setLoadingFallas] = useState(false);
  const [sucursalFallasSeleccionada, setSucursalFallasSeleccionada] = useState<string>('');
  const [sucursalPrincipal, setSucursalPrincipal] = useState<string>('');
  const [fechaFiltroFallasDesde, setFechaFiltroFallasDesde] = useState<dayjs.Dayjs | null>(null);
  const [fechaFiltroFallasHasta, setFechaFiltroFallasHasta] = useState<dayjs.Dayjs | null>(null);

  // Modal Detalle de Fallas
  const [modalDetalleFallasVisible, setModalDetalleFallasVisible] = useState(false);
  const [detalleFallas, setDetalleFallas] = useState<any[]>([]);
  const [loadingDetalleFallas, setLoadingDetalleFallas] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<StockFalla | null>(null);

  // Modal Estadísticas de Fallas
  const [modalEstadisticasVisible, setModalEstadisticasVisible] = useState(false);
  const [estadisticasFallas, setEstadisticasFallas] = useState<any>({});
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [fechasEstadisticas, setFechasEstadisticas] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

  // Cargar sucursales disponibles
  const cargarSucursales = async () => {
    try {
      const response = await fetch(`${API_URL}/sucursales`);
      const data = await response.json();
      if (data.success && data.data) {
        const nombresSucursales = data.data.map((s: any) => s.sucursal);
        setSucursales(nombresSucursales);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  // Cargar sucursal principal
  const cargarSucursalPrincipal = async () => {
    try {
      const response = await fetch(`${API_URL}/vendedores/sucursales`);
      const data = await response.json();
      if (data.success && data.data) {
        const principal = data.data.find((s: any) => s.es_principal === 1 || s.es_principal === true);
        if (principal) {
          const nombrePrincipal = principal.sucursal.toLowerCase();
          setSucursalPrincipal(nombrePrincipal);
          setSucursalFallasSeleccionada(nombrePrincipal);
          
          // ✅ Si es admin, seleccionar la sucursal principal por defecto
          if (esAdmin) {
            setSelectedSucursal(nombrePrincipal);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar sucursal principal:', error);
    }
  };

  // Cargar filtros dinámicos (marcas y modelos)
  const cargarFiltros = async () => {
    try {
      const url = new URL(`${API_URL}/productos/filtros`);
      
      // Filtrar por sucursal si está seleccionada
      if (selectedSucursal && selectedSucursal !== 'all') {
        url.searchParams.append('sucursal', selectedSucursal);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setMarcasDisponibles(data.data.marcas || []);
        setModelosDisponibles(data.data.modelos || []);
        setTiposDisponibles(data.data.tipos || data.data.modelos || []);
      }
    } catch (error) {
      console.error('Error al cargar filtros:', error);
    }
  };

  // Cargar inventario desde la API
  const cargarInventario = async () => {
    try {
      setLoading(true);
      // Pasar filtro de sucursal al API
      const filtros: any = {};
      if (selectedSucursal && selectedSucursal !== 'all') {
        filtros.sucursal = selectedSucursal;
      }
      
      const datos = await productosService.obtenerInventario(filtros);
      
      console.log('📦 [DEBUG] Datos recibidos de la API:', datos.length);
      console.log('🚚 [DEBUG] Productos en tránsito (recibidos > 0):', datos.filter((d: any) => d.recibidos > 0));
      
      // Transformar datos de la API al formato del componente
      const datosTransformados = datos.map((item: any, index: number) => ({
        key: `${item.producto_id}-${item.sucursal}`,
        producto_id: item.producto_id,
        sucursal: item.sucursal,
        marca: item.marca || 'Sin marca',
        modelo: item.modelo || 'Sin modelo',
        tipo: item.tipo || 'Sin tipo',
        producto: item.producto,
        stock: item.stock || 0,
        recibidos: item.recibidos || 0,
        categoria: item.tipo || 'Sin tipo' // Usar TIPO como categoría
      }));
      
      console.log('✅ [DEBUG] Productos transformados en tránsito:', datosTransformados.filter((d: any) => d.recibidos > 0));
      
      setInventoryData(datosTransformados);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      message.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar stock de fallas
  const cargarStockFallas = async (sucursalParam?: string) => {
    setLoadingFallas(true);
    try {
      // Usar la sucursal pasada como parámetro, o la seleccionada en el drawer, o la del usuario
      let sucursalFiltro = sucursalParam || sucursalFallasSeleccionada || (esAdmin ? sucursalPrincipal : sucursalUsuario);
      
      console.log('📦 Cargando stock de fallas para sucursal:', sucursalFiltro);
      console.log('📅 Rango de fechas:', {
        desde: fechaFiltroFallasDesde?.format('YYYY-MM-DD'),
        hasta: fechaFiltroFallasHasta?.format('YYYY-MM-DD')
      });
      
      let data: any[];
      
      // Si hay rango de fechas seleccionado, usar endpoint histórico
      if (fechaFiltroFallasDesde && fechaFiltroFallasHasta) {
        const fechaHastaFormateada = fechaFiltroFallasHasta.format('YYYY-MM-DD');
        console.log('📊 Consultando historial de stock hasta fecha:', fechaHastaFormateada);
        
        data = await devolucionesService.obtenerStockFallasPorFecha(sucursalFiltro, fechaHastaFormateada);
        
        // Filtrar en frontend los registros que están en el rango
        const fechaDesdeTimestamp = fechaFiltroFallasDesde.startOf('day').valueOf();
        const fechaHastaTimestamp = fechaFiltroFallasHasta.endOf('day').valueOf();
        
        // Como el backend solo retorna el stock hasta la fecha_hasta,
        // solo mostramos ese resultado
        
        message.success({
          content: `📅 Mostrando stock de fallas del ${fechaFiltroFallasDesde.format('DD/MM/YYYY')} al ${fechaFiltroFallasHasta.format('DD/MM/YYYY')}`,
          duration: 3
        });
      } else {
        // Sin fecha, usar endpoint normal (stock actual)
        data = await devolucionesService.obtenerStockFallas(sucursalFiltro);
      }
      
      console.log('✅ Stock de fallas recibido:', data.length, 'productos');
      
      setStockFallas(data);
    } catch (error) {
      message.error('Error al cargar stock de fallas');
      console.error('❌ Error al cargar stock de fallas:', error);
    } finally {
      setLoadingFallas(false);
    }
  };

  /**
   * Cargar detalle de fallas de un producto
   */
  const cargarDetalleFallas = async (producto: StockFalla) => {
    setLoadingDetalleFallas(true);
    setProductoSeleccionado(producto);
    setModalDetalleFallasVisible(true);
    
    try {
      console.log('🔍 Cargando detalle de fallas para producto:', producto.producto_id);
      
      const data = await devolucionesService.obtenerDetalleFallas(
        producto.producto_id,
        sucursalFallasSeleccionada
      );
      
      console.log('✅ Detalle de fallas cargado:', data.length, 'registros');
      setDetalleFallas(data);
    } catch (error) {
      message.error('Error al cargar detalle de fallas');
      console.error('❌ Error al cargar detalle de fallas:', error);
    } finally {
      setLoadingDetalleFallas(false);
    }
  };

  /**
   * Cargar estadísticas completas de fallas
   */
  const cargarEstadisticasFallas = async (fechaInicio?: string | null, fechaFin?: string | null) => {
    setLoadingEstadisticas(true);
    if (!modalEstadisticasVisible) {
      setModalEstadisticasVisible(true);
    }
    
    try {
      console.log('📊 Cargando estadísticas de fallas para sucursal:', sucursalFallasSeleccionada);
      console.log('📅 Rango de fechas:', fechaInicio, '-', fechaFin);
      
      const data = await devolucionesService.obtenerEstadisticasFallas(
        sucursalFallasSeleccionada, 
        fechaInicio, 
        fechaFin
      );
      
      console.log('✅ Estadísticas de fallas cargadas:', data);
      setEstadisticasFallas(data);
    } catch (error) {
      message.error('Error al cargar estadísticas de fallas');
      console.error('❌ Error al cargar estadísticas de fallas:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const abrirDrawerFallas = () => {
    setDrawerFallasVisible(true);
    
    // Si ya tiene sucursal seleccionada, cargar inmediatamente
    if (sucursalFallasSeleccionada) {
      cargarStockFallas(sucursalFallasSeleccionada);
    } else if (!esAdmin && sucursalUsuario) {
      // Usuario normal: usar su sucursal
      setSucursalFallasSeleccionada(sucursalUsuario);
      cargarStockFallas(sucursalUsuario);
    }
    // Si es admin sin sucursal seleccionada, el useEffect se encargará
  };

  // Cambiar sucursal de fallas
  const cambiarSucursalFallas = (nuevaSucursal: string) => {
    setSucursalFallasSeleccionada(nuevaSucursal);
    cargarStockFallas(nuevaSucursal);
  };

  // Cargar sucursales y sucursal principal al montar el componente
  useEffect(() => {
    cargarSucursales();
    if (esAdmin) {
      cargarSucursalPrincipal();
    }
  }, []);

  // Cuando se carga la sucursal principal y el drawer está abierto, cargar automáticamente
  useEffect(() => {
    if (sucursalPrincipal && drawerFallasVisible && !sucursalFallasSeleccionada) {
      setSucursalFallasSeleccionada(sucursalPrincipal);
      cargarStockFallas(sucursalPrincipal);
    }
  }, [sucursalPrincipal, drawerFallasVisible]);

  // Establecer sucursal según rol del usuario
  useEffect(() => {
    if (usuario) {
      if (esAdmin) {
        setSelectedSucursal('all');
      } else {
        setSelectedSucursal(sucursalUsuario);
      }
    }
  }, [usuario, esAdmin, sucursalUsuario]);

  // Recargar inventario y filtros cuando cambia la sucursal seleccionada
  useEffect(() => {
    cargarInventario();
    cargarFiltros();
  }, [selectedSucursal]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return inventoryData.filter(item => {
      const matchesSearch = searchText === '' || 
        item.producto.toLowerCase().includes(searchText.toLowerCase()) ||
        item.marca.toLowerCase().includes(searchText.toLowerCase()) ||
        item.modelo.toLowerCase().includes(searchText.toLowerCase()) ||
        item.tipo.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesBrand = selectedBrand === 'all' || item.marca === selectedBrand;
      const matchesCategory = selectedCategory === 'all' || item.categoria === selectedCategory;
      
      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [inventoryData, searchText, selectedBrand, selectedCategory]);

  // Calcular totales de recibidos
  const totalRecibidos = inventoryData.reduce((sum, item) => sum + item.recibidos, 0);
  const recibidosPorSucursal = inventoryData.reduce((acc, item) => {
    acc[item.sucursal] = (acc[item.sucursal] || 0) + item.recibidos;
    return acc;
  }, {} as Record<string, number>);

  // Función para transferir de recibidos a stock
  const handleTransfer = () => {
    if (!selectedItem || transferQuantity <= 0 || transferQuantity > selectedItem.recibidos) {
      message.error('Cantidad inválida');
      return;
    }

    setInventoryData(prev => prev.map(item => {
      if (item.key === selectedItem.key) {
        return {
          ...item,
          stock: item.stock + transferQuantity,
          recibidos: item.recibidos - transferQuantity
        };
      }
      return item;
    }));

    message.success(`${transferQuantity} unidades transferidas a stock`);
    setTransferModalVisible(false);
    setSelectedItem(null);
    setTransferQuantity(0);
  };

  // Función para confirmar recepción manual
  const handleConfirmarRecepcion = async (record: InventoryItem) => {
    try {
      console.log('🔹 [DEBUG] Confirmando recepción:', { 
        producto_id: record.producto_id, 
        sucursal: record.sucursal, 
        recibidos: record.recibidos 
      });
      
      const response = await fetch(`${API_URL}/productos/confirmar-recepcion-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          producto_id: record.producto_id,
          sucursal: record.sucursal
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        message.success(`✓ Recepción confirmada: ${record.recibidos} unidades de ${record.producto}`);
        // Recargar inventario para ver cambios
        await cargarInventario();
      } else {
        message.error(data.message || 'Error al confirmar recepción');
      }
    } catch (error) {
      console.error('Error al confirmar recepción:', error);
      message.error('Error al confirmar la recepción');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Aplicar ordenamiento si existe
    let dataForPDF = [...filteredData];
    if (sortedInfo.columnKey && sortedInfo.order) {
      dataForPDF.sort((a, b) => {
        const aValue = a[sortedInfo.columnKey as keyof InventoryItem];
        const bValue = b[sortedInfo.columnKey as keyof InventoryItem];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortedInfo.order === 'ascend' ? comparison : -comparison;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          const comparison = aValue - bValue;
          return sortedInfo.order === 'ascend' ? comparison : -comparison;
        }
        return 0;
      });
    }
    
    // Configurar fuente y título
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Inventario Zarpar - Reporte Completo', 20, 25);
    
    // Fecha de generación
    doc.setFontSize(12);
    doc.setTextColor(100);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${currentDate}`, 20, 35);
    
    // Resumen
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Resumen:', 20, 50);
    doc.setFontSize(11);
    doc.text(`Total de productos: ${dataForPDF.length}`, 25, 58);
    doc.text(`Stock total: ${dataForPDF.reduce((sum, item) => sum + item.stock, 0)}`, 25, 65);
    doc.text(`Productos recibidos: ${dataForPDF.reduce((sum, item) => sum + item.recibidos, 0)}`, 25, 72);
    
    // Preparar datos para la tabla
    const tableData = dataForPDF.map(item => [
      item.sucursal,
      item.marca,
      item.modelo,
      item.producto,
      item.stock.toString(),
      item.recibidos.toString()
    ]);
    
    // Configurar tabla
    autoTable(doc, {
      head: [['Sucursal', 'Marca', 'Modelo', 'Producto', 'Stock', 'Recibidos']],
      body: tableData,
      startY: 85,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [114, 46, 209], // Color morado
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Sucursal
        1: { cellWidth: 25 }, // Marca
        2: { cellWidth: 30 }, // Modelo
        3: { cellWidth: 40 }, // Producto
        4: { cellWidth: 20, halign: 'center' }, // Stock
        5: { cellWidth: 25, halign: 'center' } // Recibidos
      },
      margin: { left: 20, right: 20 }
    });
    
    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Sistema Zarpar`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Guardar PDF
    doc.save(`inventario-zarpar-${new Date().toISOString().split('T')[0]}.pdf`);
    message.success('PDF generado exitosamente');
  };

  const columns = [
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="blue" icon={<ShopOutlined />}>
          {sucursal}
        </Tag>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      render: (tipo: string) => {
        const tipoColors: Record<string, string> = {
          'Display': '#1890ff',
          'Batería': '#52c41a',
          'Flex': '#722ed1',
          'Placa Carga': '#fa8c16',
          'Botón': '#eb2f96',
          'Antena': '#13c2c2'
        };
        return (
          <Tag color={tipoColors[tipo] || 'default'}>
            {tipo}
          </Tag>
        );
      },
      filters: tiposDisponibles.map(tipo => ({ text: tipo, value: tipo })),
      defaultFilteredValue: ['Display'],
      onFilter: (value: any, record: InventoryItem) => record.tipo === value,
      sorter: (a: InventoryItem, b: InventoryItem) => (a.tipo || '').localeCompare(b.tipo || '')
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 100,
      render: (marca: string) => {
        const brandColors: Record<string, string> = {
          'iPhone': '#007AFF',
          'Samsung': '#1428A0',
          'Xiaomi': '#FF6900',
          'Huawei': '#FF0000',
          'TCL': '#0066CC',
          'ZTE': '#00A651'
        };
        return (
          <Tag color={brandColors[marca] || 'default'} icon={<MobileOutlined />}>
            {marca}
          </Tag>
        );
      },
      filters: marcasDisponibles.map(marca => ({ text: marca, value: marca })),
      onFilter: (value: any, record: InventoryItem) => record.marca === value,
      sorter: (a: InventoryItem, b: InventoryItem) => a.marca.localeCompare(b.marca)
    },
    {
      title: 'Producto',
      dataIndex: 'producto',
      key: 'producto',
      width: 200,
      render: (producto: string, record: InventoryItem) => {
        const categoryIcons: Record<string, React.ReactNode> = {
          'Pantallas': <MobileOutlined style={{ color: '#1890ff' }} />,
          'Baterías': <ThunderboltOutlined style={{ color: '#52c41a' }} />,
          'Carcasas': <InboxOutlined style={{ color: '#722ed1' }} />,
          'Herramientas': <ToolOutlined style={{ color: '#fa8c16' }} />,
          'Flex': <ArrowRightOutlined style={{ color: '#eb2f96' }} />,
          'Cargadores': <PlusOutlined style={{ color: '#13c2c2' }} />,
          'Hidrogel': <FilterOutlined style={{ color: '#faad14' }} />,
          'Tapa Trasera': <InboxOutlined style={{ color: '#f5222d' }} />,
          'Pin de Carga': <PlusOutlined style={{ color: '#a0d911' }} />
        };
        return (
          <Space>
            {categoryIcons[record.categoria] || <InboxOutlined />}
            <Text>{producto}</Text>
          </Space>
        );
      },
      sorter: (a: InventoryItem, b: InventoryItem) => a.producto.localeCompare(b.producto)
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => {
        const color = stock < 10 ? 'red' : stock < 20 ? 'orange' : 'green';
        return (
          <Badge 
            count={stock} 
            style={{ backgroundColor: color }}
            overflowCount={999}
          />
        );
      },
      sorter: (a: InventoryItem, b: InventoryItem) => a.stock - b.stock
    },
    {
      title: 'RECIBIDOS',
      dataIndex: 'recibidos',
      key: 'recibidos',
      width: 100,
      align: 'center' as const,
      defaultSortOrder: 'descend' as const,
      render: (recibidos: number) => {
        if (recibidos > 0) {
          return (
          <Badge 
            count={recibidos} 
              style={{ 
                backgroundColor: '#52c41a',
                boxShadow: '0 0 0 1px #52c41a inset',
                animation: 'pulse 2s infinite'
              }}
            overflowCount={999}
          />
          );
        }
        return <span style={{ color: '#d9d9d9' }}>-</span>;
      },
      sorter: (a: InventoryItem, b: InventoryItem) => b.recibidos - a.recibidos
    }
  ];

  return (
    <div className="fade-in">
      {/* Header con información de recibidos */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <InboxOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          Inventario Zarpar
        </Title>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} sm={8} style={{ display: 'flex' }}>
            <Button
              type="primary"
              size="large"
              block
              onClick={abrirDrawerFallas}
              icon={<WarningOutlined />}
              style={{
                background: 'linear-gradient(135deg, #FFB3BA 0%, #FFADAD 100%)',
                border: 'none',
                color: '#fff',
                height: '100%',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(255, 173, 173, 0.4)',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 173, 173, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 173, 173, 0.4)';
              }}
            >
              📦 Stock de Fallas
            </Button>
          </Col>
          <Col xs={24} sm={16}>
            <Card size="small" className="hover-lift">
              <Text strong>Recibidos por Sucursal: </Text>
              <Space wrap>
                {Object.entries(recibidosPorSucursal).map(([sucursal, cantidad]) => (
                  <Tag key={sucursal} color="processing">
                    {sucursal}: {cantidad}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filtros y búsqueda */}
      <Card 
        className="hover-lift" 
        style={{ 
          marginBottom: 16,
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Fila de Filtros */}
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={24} md={12} lg={6}>
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  gap: 8
                }}>
                  <ShopOutlined style={{ fontSize: 16, color: '#10b981' }} />
                  <Text strong style={{ fontSize: 13, color: '#374151' }}>
                    Sucursal
                  </Text>
                </div>
                
                {/* Si es admin, muestra Select para elegir. Si no, solo muestra su sucursal */}
                {esAdmin ? (
                <ReactSelect
                  placeholder="Seleccionar sucursal"
                  value={
                    selectedSucursal === 'all' 
                      ? { value: 'all', label: '🌐 Todas las Sucursales' }
                      : { 
                          value: selectedSucursal, 
                          label: `🏪 ${selectedSucursal.charAt(0).toUpperCase() + selectedSucursal.slice(1)}` 
                        }
                  }
                  onChange={(option) => {
                    const newValue = option?.value || 'all';
                    console.log('🔄 Cambiando sucursal a:', newValue);
                    setSelectedSucursal(newValue);
                  }}
                  options={[
                    { value: 'all', label: '🌐 Todas las Sucursales' },
                    ...sucursales.map(sucursal => ({
                      value: sucursal,
                      label: `🏪 ${sucursal.charAt(0).toUpperCase() + sucursal.slice(1)}`
                    }))
                  ]}
                  styles={customSelectStyles}
                  isClearable={false}
                  isSearchable={true}
                  noOptionsMessage={() => 'No hay sucursales disponibles'}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 48,
                    padding: '0 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '2px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <span style={{ 
                      fontSize: 20,
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}>
                      🏪
                    </span>
                    <span style={{ 
                      fontWeight: 600, 
                      fontSize: 16,
                      color: '#065f46'
                    }}>
                      {selectedSucursal.charAt(0).toUpperCase() + selectedSucursal.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </Col>
            <Col 
              xs={searchExpanded ? 24 : 6} 
              sm={searchExpanded ? 24 : 4} 
              md={searchExpanded ? 12 : 2} 
              lg={searchExpanded ? 7 : 1} 
              style={{ transition: 'all 0.3s ease' }}
            >
              {!searchExpanded ? (
                <Tooltip title="Buscar productos">
                  <Button
                    type="primary"
                    icon={<SearchOutlined style={{ fontSize: 18 }} />}
                    onClick={() => setSearchExpanded(true)}
                    size="large"
                    block
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  />
                </Tooltip>
              ) : (
                <Input
                  autoFocus
                  placeholder="🔍 Buscar producto, marca, modelo o tipo..."
                  prefix={<SearchOutlined style={{ color: '#3b82f6' }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  onBlur={() => {
                    if (!searchText) {
                      setSearchExpanded(false);
                    }
                  }}
                  onClear={() => {
                    setSearchText('');
                    setSearchExpanded(false);
                  }}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    height: '48px',
                    animation: 'expandSearch 0.3s ease-out'
                  }}
                />
              )}
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 8 : 10} 
              md={searchExpanded ? 6 : 5} 
              lg={searchExpanded ? 4 : 5}
            >
              <div>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  color: '#6b7280',
                  fontSize: 13
                }}>
                  🏷️ Marca
                </Text>
                <Select
                  placeholder="Marca"
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  style={{ width: '100%' }}
                  size="large"
                  variant="filled"
                  suffixIcon={<FilterOutlined style={{ color: '#9ca3af' }} />}
                >
                  <Option value="all">
                    <span style={{ fontWeight: 500 }}>✨ Todas</span>
                  </Option>
                  {marcasDisponibles.map(marca => (
                    <Option key={marca} value={marca}>
                      📱 {marca}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 8 : 10} 
              md={searchExpanded ? 6 : 5} 
              lg={searchExpanded ? 4 : 5}
            >
              <div>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  color: '#6b7280',
                  fontSize: 13
                }}>
                  🏷️ Tipo
                </Text>
                <Select
                  placeholder="Tipo"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: '100%' }}
                  size="large"
                  variant="filled"
                  suffixIcon={<FilterOutlined style={{ color: '#9ca3af' }} />}
                >
                  <Option value="all">
                    <span style={{ fontWeight: 500 }}>✨ Todos</span>
                  </Option>
                  {tiposDisponibles.map(tipo => (
                    <Option key={tipo} value={tipo}>
                      🏷️ {tipo}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 4 : 5} 
              md={searchExpanded ? 3 : 4} 
              lg={searchExpanded ? 2 : 3}
            >
              <Button 
                type="default" 
                icon={<FilePdfOutlined />}
                onClick={generatePDF}
                size="large"
                style={{ 
                  width: '100%',
                  borderColor: '#722ed1',
                  color: '#722ed1',
                  borderRadius: '8px',
                  height: '48px',
                  fontWeight: 600,
                  marginTop: 24
                }}
              >
                PDF
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Tabla principal */}
      <Card 
        title={`Inventario (${filteredData.length} productos)`}
        className="hover-lift"
        extra={
          <Space>
            <Text type="secondary">
              Stock Total: {filteredData.reduce((sum, item) => sum + item.stock, 0)}
            </Text>
            <Text type="secondary">
              Recibidos: {filteredData.reduce((sum, item) => sum + item.recibidos, 0)}
            </Text>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={filteredData}
          loading={loading}
          pagination={{ 
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`
          }}
          scroll={{ x: 800 }}
          size="middle"
          onChange={(pagination, filters, sorter) => {
            setSortedInfo(sorter);
          }}
        />
      </Card>

      {/* Modal para transferir de recibidos a stock */}
      <Modal
        title="Transferir a Stock"
        open={transferModalVisible}
        onOk={handleTransfer}
        onCancel={() => {
          setTransferModalVisible(false);
          setSelectedItem(null);
          setTransferQuantity(0);
        }}
        okText="Transferir"
        cancelText="Cancelar"
      >
        {selectedItem && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text><strong>Producto:</strong> {selectedItem.producto}</Text>
            <Text><strong>Sucursal:</strong> {selectedItem.sucursal}</Text>
            <Text><strong>Recibidos disponibles:</strong> {selectedItem.recibidos}</Text>
            <div>
              <Text>Cantidad a transferir:</Text>
              <InputNumber
                min={1}
                max={selectedItem.recibidos}
                value={transferQuantity}
                onChange={(value) => setTransferQuantity(value || 0)}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>

      {/* Drawer Stock Fallas */}
      <Drawer
        title="📦 Stock de Fallas - Todos los Productos"
        placement="right"
        width={900}
        open={drawerFallasVisible}
        onClose={() => setDrawerFallasVisible(false)}
      >
        <Alert
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span>
                {esAdmin 
                  ? `💡 Stock de Fallas - ${sucursalFallasSeleccionada ? sucursalFallasSeleccionada.toUpperCase() : 'Cargando...'}`
                  : `📍 Sucursal: ${(sucursalUsuario || '').toUpperCase()}`
                }
              </span>
              {esAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Sucursal:</span>
                  <div style={{ width: 180 }}>
                    <ReactSelect
                      value={{
                        value: sucursalFallasSeleccionada,
                        label: sucursalFallasSeleccionada.toUpperCase()
                      }}
                      onChange={(option) => {
                        if (option) {
                          cambiarSucursalFallas(option.value);
                        }
                      }}
                      options={sucursales
                        .filter(s => s.toLowerCase() !== 'administrador' && s.toLowerCase() !== 'administracion')
                        .map(s => ({
                          value: s.toLowerCase(),
                          label: s.toUpperCase()
                        }))
                      }
                      styles={customSelectStyles}
                      isClearable={false}
                      isSearchable={false}
                      placeholder="Selecciona sucursal"
                      noOptionsMessage={() => 'No hay sucursales'}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                </div>
              )}
            </div>
          }
          description={esAdmin 
            ? "Los productos con fallas aparecen primero. Cambia la sucursal usando el selector de arriba."
            : "Mostrando todos los productos con fallas de tu sucursal. Los productos con fallas aparecen primero."
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* Filtro por rango de fechas */}
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#f9f9f9', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>📅 Filtrar por rango de fechas:</span>
          <RangePicker
            value={[fechaFiltroFallasDesde, fechaFiltroFallasHasta]}
            onChange={(dates) => {
              setFechaFiltroFallasDesde(dates ? dates[0] : null);
              setFechaFiltroFallasHasta(dates ? dates[1] : null);
              if (dates && dates[0] && dates[1]) {
                cargarStockFallas();
              }
            }}
            format="DD/MM/YYYY"
            placeholder={['Desde', 'Hasta']}
            style={{ width: 280 }}
            allowClear
          />
          {(fechaFiltroFallasDesde || fechaFiltroFallasHasta) && (
            <Button
              size="small"
              onClick={() => {
                setFechaFiltroFallasDesde(null);
                setFechaFiltroFallasHasta(null);
                cargarStockFallas();
              }}
            >
              Limpiar Filtro
            </Button>
          )}
          
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => cargarEstadisticasFallas(null, null)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontWeight: 600,
              marginLeft: 'auto'
            }}
          >
            📊 Estadísticas Detalladas
          </Button>
        </div>
        
        <Table
          dataSource={stockFallas.filter(item => 
            item.sucursal.toLowerCase() === sucursalFallasSeleccionada.toLowerCase()
          )}
          loading={loadingFallas}
          rowKey="producto_id"
          rowClassName={(record) => record.stock_fallas > 0 ? 'row-with-fallas' : ''}
          columns={[
            { 
              title: 'Producto', 
              dataIndex: 'nombre', 
              key: 'nombre', 
              width: 220,
              render: (nombre, record) => (
                <Text strong={record.stock_fallas > 0} type={record.stock_fallas > 0 ? 'danger' : undefined}>
                  {nombre}
                </Text>
              ),
              sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Tipo', 
              dataIndex: 'tipo', 
              key: 'tipo', 
              width: 120, 
              render: (tipo) => <Tag color="orange">{tipo}</Tag>,
              filters: Array.from(new Set(stockFallas.map(p => p.tipo).filter(Boolean))).map(tipo => ({
                text: tipo,
                value: tipo
              })),
              onFilter: (value, record) => record.tipo === value,
              sorter: (a, b) => (a.tipo || '').localeCompare(b.tipo || ''),
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Marca', 
              dataIndex: 'marca', 
              key: 'marca', 
              width: 120,
              filters: Array.from(new Set(stockFallas.map(p => p.marca).filter(Boolean))).map(marca => ({
                text: marca,
                value: marca
              })),
              onFilter: (value, record) => record.marca === value,
              sorter: (a, b) => (a.marca || '').localeCompare(b.marca || ''),
              sortDirections: ['ascend', 'descend'],
            },
            { 
              title: 'Stock Fallas', 
              dataIndex: 'stock_fallas', 
              key: 'stock_fallas', 
              width: 150,
              align: 'center' as const,
              render: (fallas, record) => {
                if (fallas > 0) {
                  return (
                    <Space>
                      <Badge 
                        count={fallas} 
                        style={{ backgroundColor: '#ff4d4f', fontWeight: 'bold', fontSize: '14px' }} 
                        showZero={false}
                      />
                      <Tooltip title="Ver detalle de fallas">
                        <Button
                          type="primary"
                          icon={<EyeOutlined />}
                          size="small"
                          onClick={() => cargarDetalleFallas(record)}
                          style={{
                            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                            border: 'none',
                          }}
                        />
                      </Tooltip>
                    </Space>
                  );
                }
                return <Text type="secondary">0</Text>;
              },
              sorter: (a, b) => (a.stock_fallas || 0) - (b.stock_fallas || 0),
              sortDirections: ['ascend', 'descend'],
              defaultSortOrder: 'descend' as const,
            },
            { 
              title: 'Stock Actual', 
              dataIndex: 'stock_actual', 
              key: 'stock_actual', 
              width: 100,
              align: 'center' as const,
              render: (stock) => <Text>{stock}</Text>,
              sorter: (a, b) => (a.stock_actual || 0) - (b.stock_actual || 0),
              sortDirections: ['ascend', 'descend'],
            },
          ]}
          pagination={{ 
            pageSize: 50,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100', '200']
          }}
        />
      </Drawer>

      {/* Modal Detalle de Fallas */}
      <Modal
        title={
          <span style={{ color: '#000000' }}>
            <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Detalle de Fallas - {productoSeleccionado?.nombre}
          </span>
        }
        open={modalDetalleFallasVisible}
        onCancel={() => {
          setModalDetalleFallasVisible(false);
          setDetalleFallas([]);
          setProductoSeleccionado(null);
        }}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {productoSeleccionado && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={
                <div>
                  <Text strong>{productoSeleccionado.nombre}</Text>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    <Text type="secondary">
                      {productoSeleccionado.marca} | {productoSeleccionado.tipo} | Sucursal: {productoSeleccionado.sucursal.toUpperCase()}
                    </Text>
                  </div>
                </div>
              }
              description={`Total de fallas: ${productoSeleccionado.stock_fallas} unidad(es)`}
              type="warning"
              showIcon
            />
          </div>
        )}

        <Table
          dataSource={detalleFallas}
          loading={loadingDetalleFallas}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}`,
            simple: false,
          }}
          columns={[
            {
              title: 'Fecha',
              dataIndex: 'fecha_proceso',
              key: 'fecha',
              width: 110,
              render: (fecha) => (
                <Text style={{ fontSize: 11 }}>
                  {dayjs(fecha).format('DD/MM/YYYY')}
                </Text>
              ),
              sorter: (a, b) => dayjs(a.fecha_proceso).unix() - dayjs(b.fecha_proceso).unix(),
            },
            {
              title: 'Tipo',
              dataIndex: 'tipo',
              key: 'tipo',
              width: 120,
              render: (tipo) => (
                <Tag color={tipo === 'devolucion' ? 'red' : 'orange'} style={{ fontSize: 10 }}>
                  {tipo === 'devolucion' ? '🔙 DEVOLUCIÓN' : '🔄 REEMPLAZO'}
                </Tag>
              ),
            },
            {
              title: 'N° Venta',
              dataIndex: 'numero_venta',
              key: 'numero_venta',
              width: 150,
              render: (numero) => (
                <Text strong style={{ fontSize: 11, fontFamily: 'monospace' }}>
                  {numero}
                </Text>
              ),
            },
            {
              title: 'Cliente',
              dataIndex: 'cliente_nombre',
              key: 'cliente',
              width: 150,
              ellipsis: true,
              render: (nombre) => (
                <Tooltip title={nombre}>
                  <Text style={{ fontSize: 11 }}>{nombre}</Text>
                </Tooltip>
              ),
            },
            {
              title: 'Sucursal',
              dataIndex: 'sucursal',
              key: 'sucursal',
              width: 100,
              render: (sucursal) => (
                <Tag color="blue" style={{ fontSize: 10 }}>
                  {sucursal.toUpperCase()}
                </Tag>
              ),
            },
            {
              title: 'Método',
              dataIndex: 'metodo_devolucion',
              key: 'metodo',
              width: 120,
              render: (metodo) => {
                const colores: any = {
                  'efectivo': 'green',
                  'cuenta_corriente': 'orange',
                  'reemplazo': 'blue',
                };
                return (
                  <Tag color={colores[metodo] || 'default'} style={{ fontSize: 10 }}>
                    {metodo === 'efectivo' ? '💵 EFECTIVO' : 
                     metodo === 'cuenta_corriente' ? '📝 C.C.' : 
                     '🔄 REEMPLAZO'}
                  </Tag>
                );
              },
            },
            {
              title: 'Monto',
              dataIndex: 'monto_devuelto',
              key: 'monto',
              width: 100,
              align: 'right',
              render: (monto) => (
                <Text strong style={{ color: '#52c41a', fontSize: 12 }}>
                  {monto ? `$${Number(monto).toLocaleString('es-UY')}` : '-'}
                </Text>
              ),
            },
            {
              title: 'Procesado por',
              dataIndex: 'procesado_por',
              key: 'procesado',
              width: 150,
              ellipsis: true,
              render: (procesado) => (
                <Tooltip title={procesado}>
                  <Text style={{ fontSize: 11, color: '#1890ff' }}>
                    {procesado}
                  </Text>
                </Tooltip>
              ),
            },
            {
              title: 'Observaciones',
              dataIndex: 'observaciones',
              key: 'observaciones',
              ellipsis: true,
              render: (obs) => (
                <Tooltip title={obs}>
                  <Text style={{ fontSize: 11 }}>
                    {obs || '-'}
                  </Text>
                </Tooltip>
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal Estadísticas Completas de Fallas */}
      <Modal
        title={
          <span style={{ color: '#000000', fontSize: 18, fontWeight: 'bold' }}>
            <ThunderboltOutlined style={{ color: '#667eea', marginRight: 8 }} />
            Estadísticas Detalladas de Fallas - {sucursalFallasSeleccionada.toUpperCase()}
          </span>
        }
        open={modalEstadisticasVisible}
        onCancel={() => {
          setModalEstadisticasVisible(false);
          setEstadisticasFallas({});
        }}
        footer={null}
        width={1400}
        style={{ top: 20 }}
      >
        {/* Filtro por Fecha - Común para todos los tabs */}
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: '#f5f5f5', 
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <Text strong style={{ fontSize: 14 }}>
            📅 Filtrar por Fecha:
          </Text>
          <DatePicker.RangePicker
            value={fechasEstadisticas}
            onChange={(dates) => {
              setFechasEstadisticas(dates || [null, null]);
              const fechaInicio = dates?.[0] ? dates[0].format('YYYY-MM-DD') : null;
              const fechaFin = dates?.[1] ? dates[1].format('YYYY-MM-DD') : null;
              cargarEstadisticasFallas(fechaInicio, fechaFin);
            }}
            format="DD/MM/YYYY"
            placeholder={['Fecha inicio', 'Fecha fin']}
            style={{ width: 280 }}
            allowClear
          />
          <Button 
            type="link" 
            onClick={() => {
              setFechasEstadisticas([null, null]);
              cargarEstadisticasFallas(null, null);
            }}
            style={{ padding: 0 }}
          >
            🔄 Restablecer
          </Button>
        </div>

        {loadingEstadisticas ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Typography.Text>Cargando estadísticas...</Typography.Text>
          </div>
        ) : (
          <Tabs
            defaultActiveKey="1"
            items={[
              // Tab 1: Resumen General
              {
                key: '1',
                label: (
                  <span>
                    <WarningOutlined /> Resumen General
                  </span>
                ),
                children: (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                          <Statistic
                            title="Total de Fallas"
                            value={estadisticasFallas.resumen?.total_fallas || 0}
                            prefix="🔥"
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                          <Statistic
                            title="Productos Afectados"
                            value={estadisticasFallas.resumen?.productos_diferentes || 0}
                            prefix="📦"
                            valueStyle={{ color: '#fa8c16' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                          <Statistic
                            title="Clientes Afectados"
                            value={estadisticasFallas.resumen?.clientes_afectados || 0}
                            prefix="👥"
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Card>
                          <Statistic
                            title="Monto Total Devuelto"
                            value={estadisticasFallas.resumen?.monto_total_devuelto || 0}
                            prefix="$"
                            precision={0}
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                      <Col xs={24} sm={12}>
                        <Card title="Tipos de Incidencias">
                          <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div>
                              <div style={{ marginBottom: 8 }}>
                                <Text strong>Devoluciones: {estadisticasFallas.resumen?.total_devoluciones || 0}</Text>
                              </div>
                              <Progress 
                                percent={
                                  estadisticasFallas.resumen?.total_fallas 
                                    ? Number(((estadisticasFallas.resumen?.total_devoluciones || 0) / estadisticasFallas.resumen?.total_fallas * 100).toFixed(1))
                                    : 0
                                } 
                                strokeColor="#f5222d"
                              />
                            </div>
                            <div>
                              <div style={{ marginBottom: 8 }}>
                                <Text strong>Reemplazos: {estadisticasFallas.resumen?.total_reemplazos || 0}</Text>
                              </div>
                              <Progress 
                                percent={
                                  estadisticasFallas.resumen?.total_fallas 
                                    ? Number(((estadisticasFallas.resumen?.total_reemplazos || 0) / estadisticasFallas.resumen?.total_fallas * 100).toFixed(1))
                                    : 0
                                } 
                                strokeColor="#fa8c16"
                              />
                            </div>
                          </Space>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card title="Promedio de Devolución">
                          <Statistic
                            value={estadisticasFallas.resumen?.monto_promedio_devuelto || 0}
                            prefix="$"
                            precision={0}
                            suffix="por incidente"
                            valueStyle={{ fontSize: 24 }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              // Tab 2: Productos que Más Fallaron
              {
                key: '2',
                label: (
                  <span>
                    <MobileOutlined /> Top Productos
                  </span>
                ),
                children: (
                  <Table
                    dataSource={estadisticasFallas.productosMasFallaron || []}
                    rowKey="producto_id"
                    size="small"
                    pagination={{ pageSize: 10 }}
                    columns={[
                      {
                        title: '#',
                        key: 'index',
                        width: 50,
                        render: (_, __, index) => (
                          <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'default'}>
                            {index + 1}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Producto',
                        dataIndex: 'producto_nombre',
                        key: 'producto',
                        render: (nombre) => <Text strong>{nombre}</Text>,
                      },
                      {
                        title: 'Marca',
                        dataIndex: 'marca',
                        key: 'marca',
                        width: 120,
                      },
                      {
                        title: 'Tipo',
                        dataIndex: 'tipo',
                        key: 'tipo',
                        width: 120,
                      },
                      {
                        title: 'Total Fallas',
                        dataIndex: 'total_fallas',
                        key: 'total',
                        width: 100,
                        align: 'center',
                        render: (val: any) => <Badge count={val} style={{ backgroundColor: '#ff4d4f' }} />,
                        sorter: (a: any, b: any) => a.total_fallas - b.total_fallas,
                      },
                      {
                        title: 'Devoluciones',
                        dataIndex: 'devoluciones',
                        key: 'dev',
                        width: 100,
                        align: 'center',
                      },
                      {
                        title: 'Reemplazos',
                        dataIndex: 'reemplazos',
                        key: 'rem',
                        width: 100,
                        align: 'center',
                      },
                      {
                        title: 'Monto Total',
                        dataIndex: 'total_monto_devuelto',
                        key: 'monto',
                        width: 120,
                        align: 'right',
                        render: (val) => (
                          <Text strong style={{ color: '#52c41a' }}>
                            ${Number(val || 0).toLocaleString('es-UY')}
                          </Text>
                        ),
                      },
                    ]}
                  />
                ),
              },
              // Tab 3: Sucursales con Más Fallas
              {
                key: '3',
                label: (
                  <span>
                    <ShopOutlined /> Por Sucursal
                  </span>
                ),
                children: (
                  <Table
                    dataSource={estadisticasFallas.sucursalesMasFallas || []}
                    rowKey="sucursal"
                    size="small"
                    pagination={false}
                    columns={[
                      {
                        title: 'Sucursal',
                        dataIndex: 'sucursal',
                        key: 'sucursal',
                        render: (suc) => (
                          <Tag color="blue" style={{ fontSize: 12 }}>
                            {suc.toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Total Fallas',
                        dataIndex: 'total_fallas',
                        key: 'total',
                        width: 120,
                        align: 'center',
                        render: (val: any) => <Badge count={val} style={{ backgroundColor: '#ff4d4f' }} />,
                        sorter: (a: any, b: any) => a.total_fallas - b.total_fallas,
                      },
                      {
                        title: 'Productos Diferentes',
                        dataIndex: 'productos_diferentes',
                        key: 'productos',
                        width: 150,
                        align: 'center',
                      },
                      {
                        title: 'Clientes Afectados',
                        dataIndex: 'clientes_afectados',
                        key: 'clientes',
                        width: 150,
                        align: 'center',
                      },
                      {
                        title: 'Monto Total Devuelto',
                        dataIndex: 'total_monto_devuelto',
                        key: 'monto',
                        width: 150,
                        align: 'right',
                        render: (val) => (
                          <Text strong style={{ color: '#52c41a' }}>
                            ${Number(val || 0).toLocaleString('es-UY')}
                          </Text>
                        ),
                      },
                    ]}
                  />
                ),
              },
              // Tab 4: Clientes con Más Fallas
              {
                key: '4',
                label: (
                  <span>
                    <ToolOutlined /> Clientes Afectados
                  </span>
                ),
                children: (
                  <Table
                    dataSource={estadisticasFallas.clientesMasFallas || []}
                    rowKey={(record: any) => `${record.cliente_id}-${record.sucursal}`}
                    size="small"
                    pagination={{ pageSize: 15 }}
                    columns={[
                      {
                        title: 'Cliente',
                        dataIndex: 'cliente_nombre',
                        key: 'cliente',
                        render: (nombre) => <Text strong>{nombre}</Text>,
                      },
                      {
                        title: 'Sucursal',
                        dataIndex: 'sucursal',
                        key: 'sucursal',
                        width: 100,
                        render: (suc) => (
                          <Tag color="blue" style={{ fontSize: 10 }}>
                            {suc.toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Total Fallas',
                        dataIndex: 'total_fallas',
                        key: 'total',
                        width: 100,
                        align: 'center',
                        render: (val: any) => <Badge count={val} style={{ backgroundColor: '#ff4d4f' }} />,
                        sorter: (a: any, b: any) => a.total_fallas - b.total_fallas,
                      },
                      {
                        title: 'Productos Diferentes',
                        dataIndex: 'productos_diferentes',
                        key: 'productos',
                        width: 150,
                        align: 'center',
                      },
                      {
                        title: 'Monto Total',
                        dataIndex: 'total_monto_devuelto',
                        key: 'monto',
                        width: 120,
                        align: 'right',
                        render: (val) => (
                          <Text strong style={{ color: '#52c41a' }}>
                            ${Number(val || 0).toLocaleString('es-UY')}
                          </Text>
                        ),
                      },
                      {
                        title: 'Última Falla',
                        dataIndex: 'ultima_falla',
                        key: 'fecha',
                        width: 110,
                        render: (fecha) => dayjs(fecha).format('DD/MM/YYYY'),
                      },
                    ]}
                  />
                ),
              },
              // Tab 5: Fallas por Cliente (Detallado)
              {
                key: '5',
                label: (
                  <span>
                    <SearchOutlined /> Detalle por Cliente
                  </span>
                ),
                children: (
                  <Table
                    dataSource={estadisticasFallas.fallasPorCliente || []}
                    rowKey={(record: any) => `${record.cliente_id}-${record.producto_id}`}
                    size="small"
                    pagination={{ pageSize: 20 }}
                    columns={[
                      {
                        title: 'Cliente',
                        dataIndex: 'cliente_nombre',
                        key: 'cliente',
                        width: 150,
                        render: (nombre) => <Text strong style={{ fontSize: 11 }}>{nombre}</Text>,
                      },
                      {
                        title: 'Producto',
                        dataIndex: 'producto_nombre',
                        key: 'producto',
                        width: 180,
                        render: (nombre) => <Text style={{ fontSize: 11 }}>{nombre}</Text>,
                      },
                      {
                        title: 'Marca',
                        dataIndex: 'marca',
                        key: 'marca',
                        width: 100,
                      },
                      {
                        title: 'Tipo',
                        dataIndex: 'tipo',
                        key: 'tipo',
                        width: 100,
                      },
                      {
                        title: 'Sucursal',
                        dataIndex: 'sucursal',
                        key: 'sucursal',
                        width: 90,
                        render: (suc) => (
                          <Tag color="blue" style={{ fontSize: 10 }}>
                            {suc.toUpperCase()}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Veces Fallado',
                        dataIndex: 'veces_fallado',
                        key: 'veces',
                        width: 100,
                        align: 'center',
                        render: (val: any) => <Badge count={val} style={{ backgroundColor: '#fa8c16' }} />,
                        sorter: (a: any, b: any) => a.veces_fallado - b.veces_fallado,
                      },
                      {
                        title: 'Última Falla',
                        dataIndex: 'ultima_falla',
                        key: 'fecha',
                        width: 100,
                        render: (fecha) => (
                          <Text style={{ fontSize: 11 }}>
                            {dayjs(fecha).format('DD/MM/YYYY')}
                          </Text>
                        ),
                      },
                      {
                        title: 'Monto Total',
                        dataIndex: 'monto_total',
                        key: 'monto',
                        width: 110,
                        align: 'right',
                        render: (val) => (
                          <Text strong style={{ color: '#52c41a', fontSize: 11 }}>
                            ${Number(val || 0).toLocaleString('es-UY')}
                          </Text>
                        ),
                      },
                    ]}
                  />
                ),
              },
              // Tab 6: Reportes Financieros y Contables
              {
                key: '6',
                label: (
                  <span>
                    <DollarOutlined /> Reportes Financieros
                  </span>
                ),
                children: (
                  <div>
                    <Alert
                      message="📊 Análisis Financiero y Contable de Fallas"
                      description="Impacto económico de las devoluciones y reemplazos en el negocio"
                      type="info"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />

                    {/* Métricas Financieras Clave */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                      <Col xs={24} sm={12} md={6}>
                        <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                          <Statistic
                            title={<span style={{ color: '#fff' }}>💰 Total Devuelto</span>}
                            value={estadisticasFallas.resumen?.monto_total_devuelto || 0}
                            prefix="$"
                            precision={0}
                            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none' }}>
                          <Statistic
                            title={<span style={{ color: '#fff' }}>📉 Promedio/Falla</span>}
                            value={estadisticasFallas.resumen?.monto_promedio_devuelto || 0}
                            prefix="$"
                            precision={0}
                            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: 'none' }}>
                          <Statistic
                            title={<span style={{ color: '#fff' }}>🔄 Total Reemplazos</span>}
                            value={estadisticasFallas.resumen?.total_reemplazos || 0}
                            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Card style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', border: 'none' }}>
                          <Statistic
                            title={<span style={{ color: '#fff' }}>📦 Total Devoluciones</span>}
                            value={estadisticasFallas.resumen?.total_devoluciones || 0}
                            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Divider orientation="left">📈 Análisis de Impacto Financiero por Producto</Divider>

                    {/* Top 5 Productos Más Costosos */}
                    <Card title="🏆 Top 5 Productos con Mayor Impacto Económico" style={{ marginBottom: 16 }}>
                      <Table
                        dataSource={(estadisticasFallas.productosMasFallaron || []).slice(0, 5)}
                        rowKey="producto_id"
                        size="small"
                        pagination={false}
                        columns={[
                          {
                            title: 'Ranking',
                            key: 'rank',
                            width: 80,
                            align: 'center',
                            render: (_, __, index) => {
                              const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#4facfe', '#fa709a'];
                              return (
                                <div style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  background: colors[index],
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold',
                                  fontSize: 18,
                                  color: '#fff',
                                  margin: '0 auto'
                                }}>
                                  {index + 1}
                                </div>
                              );
                            },
                          },
                          {
                            title: 'Producto',
                            dataIndex: 'producto_nombre',
                            key: 'producto',
                            render: (nombre, record: any) => (
                              <div>
                                <div><Text strong style={{ fontSize: 13 }}>{nombre}</Text></div>
                                <div><Text type="secondary" style={{ fontSize: 11 }}>{record.marca} - {record.tipo}</Text></div>
                              </div>
                            ),
                          },
                          {
                            title: 'Fallas Totales',
                            dataIndex: 'total_fallas',
                            key: 'fallas',
                            width: 120,
                            align: 'center',
                            render: (val) => <Badge count={val} style={{ backgroundColor: '#ff4d4f', fontSize: 14 }} />,
                          },
                          {
                            title: 'Impacto Económico',
                            dataIndex: 'total_monto_devuelto',
                            key: 'monto',
                            width: 180,
                            align: 'right',
                            render: (val, record: any) => {
                              const maxMonto = Math.max(...((estadisticasFallas.productosMasFallaron || []).slice(0, 5).map((p: any) => p.total_monto_devuelto || 0)));
                              const percent = maxMonto > 0 ? ((val || 0) / maxMonto * 100) : 0;
                              return (
                                <div>
                                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                                    ${Number(val || 0).toLocaleString('es-UY')}
                                  </Text>
                                  <Progress
                                    percent={Number(percent.toFixed(1))}
                                    strokeColor={{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                    }}
                                    size="small"
                                    style={{ marginTop: 4 }}
                                  />
                                </div>
                              );
                            },
                          },
                        ]}
                      />
                    </Card>

                    <Divider orientation="left">🏢 Análisis Contable por Sucursal</Divider>

                    {/* Comparativa Financiera por Sucursal */}
                    <Card title="💼 Impacto Financiero por Sucursal" style={{ marginBottom: 16 }}>
                      <Row gutter={[16, 16]}>
                        {(estadisticasFallas.sucursalesMasFallas || []).map((sucursal: any, index: number) => {
                          const maxMonto = Math.max(...((estadisticasFallas.sucursalesMasFallas || []).map((s: any) => s.total_monto_devuelto || 0)));
                          const percent = maxMonto > 0 ? ((sucursal.total_monto_devuelto || 0) / maxMonto * 100) : 0;
                          const colors = ['#667eea', '#f093fb', '#4facfe', '#fa709a', '#fee140', '#a8edea'];
                          
                          return (
                            <Col xs={24} sm={12} md={8} key={sucursal.sucursal}>
                              <Card 
                                style={{ 
                                  background: `linear-gradient(135deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
                                  border: 'none',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                              >
                                <div style={{ color: '#fff' }}>
                                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                                    🏪 {sucursal.sucursal.toUpperCase()}
                                  </div>
                                  <Divider style={{ margin: '12px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
                                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div>
                                      <Text style={{ color: '#fff', fontSize: 12 }}>Fallas Totales:</Text>
                                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>{sucursal.total_fallas}</div>
                                    </div>
                                    <div>
                                      <Text style={{ color: '#fff', fontSize: 12 }}>Monto Devuelto:</Text>
                                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                                        ${Number(sucursal.total_monto_devuelto || 0).toLocaleString('es-UY')}
                                      </div>
                                      <Progress
                                        percent={Number(percent.toFixed(1))}
                                        strokeColor="#fff"
                                        trailColor="rgba(255,255,255,0.3)"
                                        size="small"
                                        style={{ marginTop: 8 }}
                                      />
                                    </div>
                                    <Row gutter={8}>
                                      <Col span={12}>
                                        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
                                          <div style={{ fontSize: 12 }}>Productos</div>
                                          <div style={{ fontSize: 18, fontWeight: 'bold' }}>{sucursal.productos_diferentes}</div>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: 8 }}>
                                          <div style={{ fontSize: 12 }}>Clientes</div>
                                          <div style={{ fontSize: 18, fontWeight: 'bold' }}>{sucursal.clientes_afectados}</div>
                                        </div>
                                      </Col>
                                    </Row>
                                  </Space>
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card>

                    <Divider orientation="left">👥 Análisis de Clientes de Alto Impacto</Divider>

                    {/* Clientes con Mayor Impacto Financiero */}
                    <Card title="⚠️ Clientes con Mayor Costo en Fallas (Top 10)">
                      <Table
                        dataSource={(estadisticasFallas.clientesMasFallas || []).slice(0, 10)}
                        rowKey={(record: any) => `${record.cliente_id}-${record.sucursal}`}
                        size="small"
                        pagination={false}
                        columns={[
                          {
                            title: '#',
                            key: 'index',
                            width: 50,
                            align: 'center',
                            render: (_, __, index) => (
                              <Tag color={index < 3 ? 'red' : 'orange'} style={{ fontWeight: 'bold' }}>
                                {index + 1}
                              </Tag>
                            ),
                          },
                          {
                            title: 'Cliente',
                            dataIndex: 'cliente_nombre',
                            key: 'cliente',
                            render: (nombre, record: any) => (
                              <div>
                                <div><Text strong>{nombre}</Text></div>
                                <div>
                                  <Tag color="blue" style={{ fontSize: 10 }}>{record.sucursal.toUpperCase()}</Tag>
                                </div>
                              </div>
                            ),
                          },
                          {
                            title: 'Incidencias',
                            dataIndex: 'total_fallas',
                            key: 'fallas',
                            width: 100,
                            align: 'center',
                            render: (val) => <Badge count={val} style={{ backgroundColor: '#ff4d4f' }} />,
                          },
                          {
                            title: 'Productos Afectados',
                            dataIndex: 'productos_diferentes',
                            key: 'productos',
                            width: 140,
                            align: 'center',
                          },
                          {
                            title: 'Impacto Financiero',
                            dataIndex: 'total_monto_devuelto',
                            key: 'monto',
                            width: 200,
                            align: 'right',
                            render: (val) => {
                              const maxMonto = Math.max(...((estadisticasFallas.clientesMasFallas || []).slice(0, 10).map((c: any) => c.total_monto_devuelto || 0)));
                              const percent = maxMonto > 0 ? ((val || 0) / maxMonto * 100) : 0;
                              return (
                                <div>
                                  <Text strong style={{ color: '#f5222d', fontSize: 14 }}>
                                    ${Number(val || 0).toLocaleString('es-UY')}
                                  </Text>
                                  <Progress
                                    percent={Number(percent.toFixed(1))}
                                    strokeColor="#f5222d"
                                    size="small"
                                    style={{ marginTop: 4 }}
                                  />
                                </div>
                              );
                            },
                          },
                        ]}
                      />
                    </Card>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default Inventory;