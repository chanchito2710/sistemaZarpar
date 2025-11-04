/**
 * Página de Transferencias de Inventario
 * Conectada con BD real - Sistema ZARPAR
 * Flujo: Casa Central (Dinámico) → Sucursales
 * Sucursal Principal identificada por es_stock_principal = 1 en BD
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  InputNumber, 
  message, 
  Card, 
  Typography, 
  Space, 
  Input, 
  Button, 
  Modal,
  DatePicker,
  Spin,
  Tag,
  Tooltip,
  Alert,
  List,
  Checkbox,
  Tabs,
  Select,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  SendOutlined, 
  ReloadOutlined,
  WarningOutlined,
  HistoryOutlined,
  PrinterOutlined,
  FilterOutlined,
  SwapOutlined,
  MinusOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { 
  productosService, 
  transferenciasService,
  vendedoresService,
  type ProductoCompleto,
  type VentasPorProducto
} from '../../services/api';
import './Transfer.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

/**
 * ===================================
 * INTERFACES
 * ===================================
 */

interface ProductoTransfer extends ProductoCompleto {
  sucursales?: {
    [sucursal: string]: {
      stock: number;
      ventas?: number;
      stock_en_transito?: number;
    };
  };
}

interface PendingTransfers {
  [productId: string]: {
    [sucursal: string]: number;
  };
}

/**
 * ===================================
 * HELPER: Formatear nombre sucursal
 * ===================================
 */
const formatearNombreSucursal = (nombre: string): string => {
  // Validar que nombre existe y es string
  if (!nombre || typeof nombre !== 'string') {
    return 'Sin nombre';
  }
  
  const normalizado = nombre.toLowerCase().trim();
  const sucursalesConEspacios: { [key: string]: string } = {
    'rionegro': 'Rio Negro',
    'cerrolargo': 'Cerro Largo',
    'treintaytres': 'Treinta Y Tres',
  };
  
  if (sucursalesConEspacios[normalizado]) {
    return sucursalesConEspacios[normalizado];
  }
  
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
};

/**
 * ===================================
 * COMPONENTE PRINCIPAL
 * ===================================
 */
const Transfer: React.FC = () => {
  // Estados principales
  const [productos, setProductos] = useState<ProductoTransfer[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [sucursalPrincipal, setSucursalPrincipal] = useState<string>(''); // 🆕 DINÁMICO
  const [loading, setLoading] = useState(false);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Estados de transferencias
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfers>({});
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  // Estados del modal de confirmación
  const [modalTransfers, setModalTransfers] = useState<PendingTransfers>({});
  const [selectedTransfers, setSelectedTransfers] = useState<{
    [key: string]: boolean; // key = "productoId-sucursal"
  }>({});
  
  // Estados de ventas
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);
  const [ventasPorSucursal, setVentasPorSucursal] = useState<{
    [sucursal: string]: VentasPorProducto[];
  }>({});
  
  // Estados del historial
  const [activeTab, setActiveTab] = useState<'transfers' | 'history'>('transfers');
  const [historial, setHistorial] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historialFechaDesde, setHistorialFechaDesde] = useState<Dayjs | null>(dayjs().subtract(30, 'days'));
  const [historialFechaHasta, setHistorialFechaHasta] = useState<Dayjs | null>(dayjs());
  const [historialSucursal, setHistorialSucursal] = useState<string>('todas');
  
  /**
   * ===================================
   * CARGAR SUCURSAL PRINCIPAL DINÁMICA
   * ===================================
   */
  const cargarSucursalPrincipal = async () => {
    try {
      const sucursal = await productosService.obtenerSucursalPrincipal();
      setSucursalPrincipal(sucursal);
      console.log(`✅ Sucursal principal identificada: ${sucursal}`);
    } catch (error) {
      console.error('Error al cargar sucursal principal:', error);
      message.error('Error al identificar sucursal principal');
    }
  };

  /**
   * ===================================
   * CARGAR SUCURSALES
   * ===================================
   */
  const cargarSucursales = async () => {
    try {
      const data = await vendedoresService.obtenerSucursales();
      
      // Filtrar y ordenar con sucursal principal primero (DINÁMICO)
      const sucursalesFiltradas = data
        .filter(s => s && typeof s === 'string') // Validar que es string
        .sort((a, b) => {
          const sucursalA = a.toLowerCase();
          const sucursalB = b.toLowerCase();
          
          // Sucursal principal siempre primero (dinámico)
          if (sucursalPrincipal && sucursalA === sucursalPrincipal.toLowerCase()) return -1;
          if (sucursalPrincipal && sucursalB === sucursalPrincipal.toLowerCase()) return 1;
          return a.localeCompare(b);
        });
      
      setSucursales(sucursalesFiltradas);
      console.log(`✅ ${sucursalesFiltradas.length} sucursales cargadas`, sucursalesFiltradas);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    }
  };

  /**
   * ===================================
   * CARGAR PRODUCTOS CON STOCK
   * ===================================
   */
  const cargarProductos = async () => {
    setLoading(true);
    try {
      // Cargar TODOS los productos con TODAS las sucursales
      const data = await productosService.obtenerConSucursales();
      
      if (!data || !Array.isArray(data)) {
        console.warn('No se recibieron productos o formato inválido');
        setProductos([]);
        return;
      }
      
      // Transformar a formato con sucursales como objeto (key: sucursal, value: {stock, ventas})
      const productosConSucursales: ProductoTransfer[] = data.map(producto => {
        const sucursalesData: any = {};
        
        // Agregar datos de cada sucursal
        if (producto.sucursales && Array.isArray(producto.sucursales)) {
          producto.sucursales.forEach(suc => {
            if (suc && suc.sucursal) {
              const stockEnTransito = suc.stock_en_transito || 0;
              sucursalesData[suc.sucursal] = {
                stock: suc.stock || 0,
                ventas: 0, // Se llenará con cargarVentas
                stock_en_transito: stockEnTransito
              };
              
              // Log para debugging si hay stock en tránsito
              if (stockEnTransito > 0) {
                console.log(`📦 ${producto.nombre} tiene ${stockEnTransito} unidades en tránsito hacia ${suc.sucursal}`);
              }
            }
          });
        }
        
        return {
          ...producto,
          sucursales: sucursalesData
        };
      });
      
      setProductos(productosConSucursales);
      console.log(`✅ ${productosConSucursales.length} productos cargados con todas sus sucursales`, productosConSucursales);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      message.error('Error al cargar productos');
      setProductos([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * ===================================
   * CARGAR VENTAS POR RANGO DE FECHAS
   * ===================================
   */
  const cargarVentas = async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    
    setLoadingVentas(true);
    try {
      const desde = dateRange[0].format('YYYY-MM-DD');
      const hasta = dateRange[1].format('YYYY-MM-DD');
      
      const ventasTemp: { [sucursal: string]: VentasPorProducto[] } = {};
      
      // Cargar ventas para cada sucursal (excepto sucursal principal)
      for (const sucursal of sucursales) {
        // Validar que sucursal tiene valor y no es sucursal principal
        if (!sucursal || typeof sucursal !== 'string') continue;
        if (sucursalPrincipal && sucursal.toLowerCase() === sucursalPrincipal.toLowerCase()) continue;
        
        try {
          const resultado = await transferenciasService.obtenerVentas(
            sucursal,
            desde,
            hasta
          );
          ventasTemp[sucursal] = resultado.ventas_por_producto || [];
        } catch (error) {
          console.error(`Error al cargar ventas de ${sucursal}:`, error);
          ventasTemp[sucursal] = [];
        }
      }
      
      setVentasPorSucursal(ventasTemp);
      
      // Contar total de ventas
      let totalVentas = 0;
      Object.values(ventasTemp).forEach(ventas => {
        totalVentas += ventas.reduce((sum, v) => sum + (v.cantidad_vendida || 0), 0);
      });
      
      console.log(`✅ Ventas cargadas:`, {
        sucursales: Object.keys(ventasTemp).length,
        totalVentas,
        detalleVentas: ventasTemp
      });
      
      // Actualizar productos con ventas
      setProductos(prevProductos => {
        return prevProductos.map(producto => {
          const sucursalesActualizadas = { ...producto.sucursales };
          
          Object.keys(sucursalesActualizadas).forEach(sucursalKey => {
            const ventasDeEstaSucursal = ventasTemp[sucursalKey] || [];
            const ventaProducto = ventasDeEstaSucursal.find(
              v => v.producto_id === producto.id
            );
            
            if (sucursalesActualizadas[sucursalKey]) {
              sucursalesActualizadas[sucursalKey].ventas = ventaProducto?.cantidad_vendida || 0;
            }
          });
          
          return {
            ...producto,
            sucursales: sucursalesActualizadas
          };
        });
      });
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      message.error('Error al cargar ventas');
    } finally {
      setLoadingVentas(false);
    }
  };

  /**
   * ===================================
   * CARGAR HISTORIAL DE TRANSFERENCIAS
   * ===================================
   */
  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token en localStorage:', token ? 'Existe' : 'No existe');
      console.log('🔑 Token completo:', token);
      console.log('🔑 Token length:', token?.length);
      
      const params = new URLSearchParams();
      
      if (historialFechaDesde) {
        params.append('fecha_desde', historialFechaDesde.format('YYYY-MM-DD'));
      }
      if (historialFechaHasta) {
        params.append('fecha_hasta', historialFechaHasta.format('YYYY-MM-DD'));
      }
      if (historialSucursal && historialSucursal !== 'todas') {
        params.append('sucursal_destino', historialSucursal);
      }
      
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3456/api'}/productos/historial-transferencias?${params.toString()}`;
      console.log('📡 URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || 'Error al cargar historial');
      }
      
      const data = await response.json();
      console.log('✅ Historial cargado:', data.data?.length || 0, 'registros');
      setHistorial(data.data || []);
      
    } catch (error) {
      console.error('Error al cargar historial:', error);
      message.error('Error al cargar historial de transferencias');
    } finally {
      setLoadingHistorial(false);
    }
  };

  /**
   * ===================================
   * EFFECTS
   * ===================================
   */
  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Cargar sucursal principal PRIMERO (dinámico)
      await cargarSucursalPrincipal();
      // 2. Cargar sucursales y productos
      await cargarSucursales();
      await cargarProductos();
    };
    cargarDatos();
  }, []);

  // Cargar ventas cuando se carguen productos, sucursales o cambie el rango
  useEffect(() => {
    if (productos.length > 0 && sucursales.length > 0 && dateRange[0] && dateRange[1]) {
      cargarVentas();
    }
  }, [productos.length, sucursales.length, dateRange]);
  
  // Effect para cargar historial cuando se cambia de tab o filtros
  useEffect(() => {
    if (activeTab === 'history') {
      cargarHistorial();
    }
  }, [activeTab, historialFechaDesde, historialFechaHasta, historialSucursal]);

  /**
   * ===================================
   * INPUT DE TRANSFERENCIA
   * ===================================
   */
  const TransferInput: React.FC<{ 
    productoId: number; 
    sucursal: string; 
    stockPrincipal: number;
  }> = ({ productoId, sucursal, stockPrincipal }) => {
    const [inputValue, setInputValue] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const pendingAmount = pendingTransfers[productoId]?.[sucursal] || 0;
    const ventasProducto = productos.find(p => p.id === productoId);
    const ventas = ventasProducto?.sucursales?.[sucursal]?.ventas || 0;
    
    // Sugerir cantidad basada en ventas
    const cantidadSugerida = ventas > 0 ? ventas : null;
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEditing(true);
      if (pendingAmount > 0) {
        setInputValue(pendingAmount);
      } else if (cantidadSugerida) {
        setInputValue(cantidadSugerida);
      }
      setTimeout(() => e.target.select(), 0);
    };
    
    const handleBlur = async () => {
      setIsEditing(false);
      const finalValue = inputValue || 0;
      const valorAnterior = pendingAmount;
      
      if (finalValue === valorAnterior) {
        // Sin cambios
        setInputValue(null);
        return;
      }
      
      if (finalValue === 0 && valorAnterior > 0) {
        // Cancelar transferencia: devolver a principal
        try {
          await productosService.ajustarTransferencia(
            productoId,
            sucursal,
            valorAnterior,
            0
          );
          
          // Remover de pendientes
          setPendingTransfers(prev => {
            const newState = { ...prev };
            if (newState[productoId]) {
              delete newState[productoId][sucursal];
              if (Object.keys(newState[productoId]).length === 0) {
                delete newState[productoId];
              }
            }
            return newState;
          });
          
          // Recargar productos para ver cambios
          await cargarProductos();
          message.success(`Transferencia cancelada. Stock devuelto a ${formatearNombreSucursal(sucursalPrincipal)}`);
        } catch (error: any) {
          console.error('Error al cancelar transferencia:', error);
          message.error(error.response?.data?.message || 'Error al cancelar transferencia');
        }
      } else if (finalValue > 0) {
        // Validar stock
        if (finalValue > stockPrincipal) {
          message.error(`Stock insuficiente en ${formatearNombreSucursal(sucursalPrincipal)}. Disponible: ${stockPrincipal}`);
          setInputValue(null);
          return;
        }
        
        try {
          if (valorAnterior === 0) {
            // Nueva transferencia
            await productosService.prepararTransferencia(
              productoId,
              sucursal,
              finalValue
            );
            message.success(`${finalValue} unidades preparadas para ${formatearNombreSucursal(sucursal)}`);
          } else {
            // Ajustar transferencia existente
            await productosService.ajustarTransferencia(
              productoId,
              sucursal,
              valorAnterior,
              finalValue
            );
            const diferencia = finalValue - valorAnterior;
            if (diferencia > 0) {
              message.success(`+${diferencia} unidades agregadas`);
            } else {
              message.success(`${Math.abs(diferencia)} unidades devueltas a ${formatearNombreSucursal(sucursalPrincipal)}`);
            }
          }
          
          // Actualizar pendientes
          setPendingTransfers(prev => ({
            ...prev,
            [productoId]: {
              ...prev[productoId],
              [sucursal]: finalValue
            }
          }));
          
          // Recargar productos para ver cambios en stock principal y en_transito
          await cargarProductos();
          
        } catch (error: any) {
          console.error('Error al preparar/ajustar transferencia:', error);
          message.error(error.response?.data?.message || 'Error al procesar transferencia');
        }
      }
      
      setInputValue(null);
    };

    const handleChange = (value: number | null) => {
      setInputValue(value);
    };

    const displayValue = isEditing || inputValue !== null 
      ? inputValue 
      : (pendingAmount > 0 ? pendingAmount : null);
    
    const hasPending = pendingAmount > 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <InputNumber
          size="small"
          min={0}
          max={stockPrincipal}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPressEnter={handleBlur}
          placeholder={cantidadSugerida ? `${cantidadSugerida}` : '0'}
          style={{
            width: '70px',
            textAlign: 'center',
            color: hasPending ? '#fa8c16' : undefined,
            fontWeight: hasPending ? 'bold' : undefined
          }}
          disabled={stockPrincipal === 0}
        />
      </div>
    );
  };

  /**
   * ===================================
   * OBTENER TOTAL PENDIENTE
   * ===================================
   */
  const getTotalPendingTransfers = () => {
    let total = 0;
    Object.values(pendingTransfers).forEach(productTransfers => {
      Object.values(productTransfers).forEach(amount => {
        total += amount;
      });
    });
    return total;
  };

  /**
   * ===================================
   * CONFIRMAR Y ENVIAR
   * ===================================
   */
  const handleEnviarClick = () => {
    const totalPending = getTotalPendingTransfers();
    console.log('🔍 DEBUG handleEnviarClick:');
    console.log('Total pending:', totalPending);
    console.log('pendingTransfers:', JSON.stringify(pendingTransfers, null, 2));
    
    if (totalPending > 0) {
      // Inicializar estado del modal con copias de pendingTransfers
      setModalTransfers(JSON.parse(JSON.stringify(pendingTransfers)));
      
      // ❌ NO seleccionar por defecto - el usuario debe hacerlo manualmente
      const selections: { [key: string]: boolean } = {};
      Object.entries(pendingTransfers).forEach(([productoId, sucursales]) => {
        Object.keys(sucursales).forEach(sucursal => {
          const cantidad = sucursales[sucursal];
          console.log(`Producto ${productoId} -> Sucursal ${sucursal}: ${cantidad} unidades`);
          selections[`${productoId}-${sucursal}`] = false; // ⚠️ Cambiado a false
        });
      });
      setSelectedTransfers(selections);
      
      setIsConfirmModalVisible(true);
    } else {
      message.info('No hay transferencias pendientes');
    }
  };

  const handleEnviarConfirmado = async () => {
    setEnviando(true);
    try {
      // Agrupar por sucursal SOLO las transferencias seleccionadas
      const transferencias: {
        [sucursal: string]: {
          producto_id: number;
          cantidad: number;
          ventas_periodo: number;
          fecha_inicio: string;
          fecha_fin: string;
        }[];
      } = {};
      
      Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
        Object.entries(sucursales).forEach(([sucursal, cantidad]) => {
          const key = `${productoId}-${sucursal}`;
          
          // ✅ Solo incluir si está seleccionado y tiene cantidad > 0
          if (selectedTransfers[key] && cantidad > 0) {
            if (!transferencias[sucursal]) {
              transferencias[sucursal] = [];
            }
            
            const producto = productos.find(p => p.id === Number(productoId));
            const ventas = producto?.sucursales?.[sucursal]?.ventas || 0;
            
            transferencias[sucursal].push({
              producto_id: Number(productoId),
              cantidad,
              ventas_periodo: ventas,
              fecha_inicio: dateRange[0]!.format('YYYY-MM-DD'),
              fecha_fin: dateRange[1]!.format('YYYY-MM-DD')
            });
          }
        });
      });
      
      // Validar que hay algo para enviar
      if (Object.keys(transferencias).length === 0) {
        message.warning('No hay transferencias seleccionadas para enviar');
        setEnviando(false);
        return;
      }
      
      // Validar stock insuficiente
      let hayStockInsuficiente = false;
      Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
        Object.entries(sucursales).forEach(([sucursal, cantidad]) => {
          const key = `${productoId}-${sucursal}`;
          if (selectedTransfers[key]) {
            const producto = productos.find(p => p.id === Number(productoId));
            const stockPrincipal = producto?.sucursales?.[sucursalPrincipal]?.stock || 0;
            if (cantidad > stockPrincipal) {
              hayStockInsuficiente = true;
              message.error(`Stock insuficiente para ${producto?.nombre || 'producto'}. Disponible: ${stockPrincipal}, Solicitado: ${cantidad}`);
            }
          }
        });
      });
      
      if (hayStockInsuficiente) {
        setEnviando(false);
        return;
      }
      
      // Preparar array de transferencias para confirmar
      const transferenciasAConfirmar: { producto_id: number; sucursal: string; cantidad: number }[] = [];
      
      for (const [sucursal, prods] of Object.entries(transferencias)) {
        prods.forEach(prod => {
          transferenciasAConfirmar.push({
            producto_id: prod.producto_id,
            sucursal,
            cantidad: prod.cantidad
          });
        });
      }
      
      // Confirmar transferencias (stock_en_transito → stock real)
      await productosService.confirmarTransferencia(transferenciasAConfirmar);
      
      // 🔄 RECARGAR PRODUCTOS DESDE LA BASE DE DATOS para actualizar stock_en_transito
      await cargarProductos();
      
      // Mostrar resultados
      Modal.success({
        title: '✅ Transferencias Confirmadas',
        content: (
          <div>
            <p style={{ marginBottom: 12 }}>
              <strong>{transferenciasAConfirmar.length}</strong> transferencias confirmadas exitosamente.
            </p>
            <List
              size="small"
              dataSource={transferenciasAConfirmar}
              renderItem={item => {
                const producto = productos.find(p => p.id === item.producto_id);
                return (
                  <List.Item>
                    ✅ {producto?.nombre || 'Producto'} → {formatearNombreSucursal(item.sucursal)}: <strong>{item.cantidad}</strong> unidades
                  </List.Item>
                );
              }}
            />
            <Alert
              message="Stock actualizado"
              description="El stock en tránsito se ha sumado al stock real de cada sucursal y los avisos 'En camino' han sido eliminados."
              type="success"
              showIcon
              style={{ marginTop: 12 }}
            />
          </div>
        ),
        width: 600
      });
      
      // Limpiar SOLO las transferencias confirmadas de pendingTransfers
      const newPending = { ...pendingTransfers };
      Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
        Object.keys(sucursales).forEach(sucursal => {
          const key = `${productoId}-${sucursal}`;
          if (selectedTransfers[key]) {
            // Remover esta transferencia
            if (newPending[productoId]) {
              delete newPending[productoId][sucursal];
              // Si el producto no tiene más sucursales, eliminarlo completamente
              if (Object.keys(newPending[productoId]).length === 0) {
                delete newPending[productoId];
              }
            }
          }
        });
      });
      
      setPendingTransfers(newPending);
      setIsConfirmModalVisible(false);
      await cargarProductos();
      
    } catch (error: any) {
      console.error('Error al enviar transferencias:', error);
      message.error('Error al enviar transferencias');
    } finally {
      setEnviando(false);
    }
  };

  /**
   * ===================================
   * FILTRAR PRODUCTOS
   * ===================================
   */
  const filteredProducts = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    producto.marca?.toLowerCase().includes(searchText.toLowerCase()) ||
    producto.tipo?.toLowerCase().includes(searchText.toLowerCase())
  );

  /**
   * ===================================
   * COLUMNAS DE LA TABLA
   * ===================================
   */
  const columns = useMemo(() => [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      fixed: 'left' as const,
      width: 200,
      render: (nombre: string, record: ProductoTransfer) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{nombre}</div>
          {record.marca && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.marca}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      fixed: 'left' as const,
      width: 120,
      render: (tipo: string) => tipo ? <Tag color="blue">{tipo}</Tag> : '-'
    },
    // Columna Sucursal Principal (Casa Central) - Siempre primero (DINÁMICO) - FIJA AL HACER SCROLL
    {
      title: () => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>{formatearNombreSucursal(sucursalPrincipal)}</div>
          <div style={{ fontSize: '11px', color: '#52c41a' }}>Casa Central</div>
        </div>
      ),
      key: sucursalPrincipal || 'principal',
      fixed: 'left' as const,
      width: 150,
      render: (record: ProductoTransfer) => {
        const stockPrincipal = record.sucursales?.[sucursalPrincipal]?.stock || 0;
        return (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Tooltip title="Stock disponible en Casa Central">
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                color: stockPrincipal < 10 ? '#ff4d4f' : '#52c41a',
                backgroundColor: stockPrincipal < 10 ? '#fff1f0' : '#f6ffed',
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${stockPrincipal < 10 ? '#ffccc7' : '#b7eb8f'}`,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '14px' }}>📦</span>
                <span>Stock: {stockPrincipal}</span>
              </div>
            </Tooltip>
          </div>
        );
      }
    },
    // Columnas dinámicas para cada sucursal (excepto principal)
    ...sucursales
      .filter(suc => suc && typeof suc === 'string' && sucursalPrincipal && suc.toLowerCase() !== sucursalPrincipal.toLowerCase())
      .map(suc => ({
        title: formatearNombreSucursal(suc),
        key: suc,
        width: 140,
        render: (record: ProductoTransfer) => {
          const stockActual = record.sucursales?.[suc]?.stock || 0;
          const ventas = record.sucursales?.[suc]?.ventas || 0;
          const stockEnTransito = record.sucursales?.[suc]?.stock_en_transito || 0;
          const stockPrincipal = record.sucursales?.[sucursalPrincipal]?.stock || 0;
          
          // Log de debugging para stock en tránsito
          if (stockEnTransito > 0) {
            console.log(`🚚 RENDER: ${record.nombre} -> ${suc} tiene ${stockEnTransito} en tránsito`);
          }
          
          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '4px',
              width: '100%'
            }}>
              {/* Stock actual */}
              <Tooltip title="Stock disponible en esta sucursal">
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  color: '#1890ff',
                  backgroundColor: '#e6f7ff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #91d5ff',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '14px' }}>📦</span>
                  <span>Stock: {stockActual}</span>
                </div>
              </Tooltip>
              
              {/* Ventas del período - SIEMPRE visible */}
              <Tooltip title={ventas > 0 ? "Vendidas en el período seleccionado" : "No hay ventas en el período seleccionado"}>
                <div style={{ 
                  color: ventas > 0 ? '#ff4d4f' : '#999', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  backgroundColor: ventas > 0 ? '#fff1f0' : '#fafafa',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: ventas > 0 ? '1px solid #ffccc7' : '1px solid #d9d9d9',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '13px' }}>{ventas > 0 ? '📉' : '📊'}</span>
                  <span>{ventas > 0 ? `Vendido: ${ventas}` : 'Sin ventas'}</span>
                </div>
              </Tooltip>
              
              {/* Stock en tránsito */}
              {stockEnTransito > 0 && (
                <Tooltip title="Stock en tránsito (pendiente de confirmar)">
                  <div style={{
                    fontSize: '11px',
                    color: '#8B4513',
                    fontWeight: 'bold',
                    backgroundColor: '#FFF8DC',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #D2691E',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '13px' }}>🚚</span>
                    <span>En camino: {stockEnTransito}</span>
                  </div>
                </Tooltip>
              )}
              
              {/* Input de transferencia */}
              <TransferInput
                productoId={record.id}
                sucursal={suc}
                stockPrincipal={stockPrincipal}
              />
            </div>
          );
        }
      }))
  ], [sucursales, sucursalPrincipal, pendingTransfers]);

  /**
   * ===================================
   * COLUMNAS DEL HISTORIAL
   * ===================================
   */
  const columnasHistorial = [
    {
      title: 'Fecha',
      dataIndex: 'fecha_envio',
      key: 'fecha_envio',
      width: 180,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      sorter: (a: any, b: any) => dayjs(a.fecha_envio).valueOf() - dayjs(b.fecha_envio).valueOf(),
    },
    {
      title: 'Producto',
      dataIndex: 'producto_nombre',
      key: 'producto_nombre',
      width: 250,
    },
    {
      title: 'Origen',
      dataIndex: 'sucursal_origen',
      key: 'sucursal_origen',
      width: 150,
      render: (sucursal: string) => (
        <Tag color="blue">{sucursal.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Destino',
      dataIndex: 'sucursal_destino',
      key: 'sucursal_destino',
      width: 150,
      render: (sucursal: string) => (
        <Tag color="green">{sucursal.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'cantidad',
      key: 'cantidad',
      width: 120,
      align: 'center' as const,
      render: (cantidad: number) => (
        <Badge count={cantidad} showZero color="#52c41a" />
      ),
    },
    {
      title: 'Usuario',
      dataIndex: 'usuario_email',
      key: 'usuario_email',
      width: 200,
    },
  ];

  /**
   * ===================================
   * FUNCIÓN DE IMPRESIÓN
   * ===================================
   */
  const handleImprimir = () => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      message.error('No se pudo abrir la ventana de impresión');
      return;
    }
    
    const fechaReporte = dayjs().format('DD/MM/YYYY HH:mm');
    const rangoFechas = `${historialFechaDesde?.format('DD/MM/YYYY')} - ${historialFechaHasta?.format('DD/MM/YYYY')}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Historial de Transferencias - Sistema ZARPAR</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1890ff;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #1890ff;
            }
            .info {
              margin: 20px 0;
              padding: 15px;
              background-color: #f0f2f5;
              border-radius: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #d9d9d9;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #1890ff;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #8c8c8c;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📦 Sistema ZARPAR</h1>
            <h2>Historial de Transferencias de Mercadería</h2>
          </div>
          
          <div class="info">
            <p><strong>Fecha del Reporte:</strong> ${fechaReporte}</p>
            <p><strong>Período:</strong> ${rangoFechas}</p>
            <p><strong>Sucursal:</strong> ${historialSucursal === 'todas' ? 'Todas las sucursales' : historialSucursal.toUpperCase()}</p>
            <p><strong>Total de Transferencias:</strong> ${historial.length}</p>
            <p><strong>Total de Unidades:</strong> ${historial.reduce((sum, h) => sum + h.cantidad, 0)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Cantidad</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              ${historial.map(h => `
                <tr>
                  <td>${dayjs(h.fecha_envio).format('DD/MM/YYYY HH:mm')}</td>
                  <td>${h.producto_nombre}</td>
                  <td>${h.sucursal_origen.toUpperCase()}</td>
                  <td>${h.sucursal_destino.toUpperCase()}</td>
                  <td style="text-align: center;">${h.cantidad}</td>
                  <td>${h.usuario_email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Sistema ZARPAR - Gestión de Inventario</p>
            <p>Documento generado automáticamente</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    
    ventanaImpresion.document.write(html);
    ventanaImpresion.document.close();
  };

  /**
   * ===================================
   * RENDER
   * ===================================
   */
  return (
    <div className="transfer-container">
      <Card>
        {/* Header */}
        <div className="transfer-header">
          <Title level={2}>📦 Gestión de Transferencias de Mercadería</Title>
        </div>
        
        {/* Tabs: Transferencias y Historial */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'transfers' | 'history')}
          items={[
            {
              key: 'transfers',
              label: (
                <span>
                  <SwapOutlined /> Transferencias
                </span>
              ),
              children: (
                <>
                  {/* Barra de búsqueda */}
                  <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Buscar producto..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        
        {/* Estadísticas */}
        <div className="transfer-stats">
          <div className="stats-container">
            <Space size="large">
              <Card size="small" className="stat-card">
                <div className="stat-number">{productos.length}</div>
                <div className="stat-label">Productos</div>
              </Card>
              
              <Card size="small" className="stat-card">
                <div className="stat-number">
                  {productos.reduce((sum, p) => 
                    sum + (p.sucursales?.[sucursalPrincipal]?.stock || 0), 0
                  )}
                </div>
                <div className="stat-label">Stock Casa Central</div>
              </Card>
              
              <Card size="small" className="stat-card">
                <div className="stat-number">{sucursales.length - 1}</div>
                <div className="stat-label">Sucursales</div>
              </Card>
            </Space>
            
            <Space>
              <Tooltip title="Recargar datos">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    cargarSucursales();
                    cargarProductos();
                  }}
                  loading={loading}
                >
                  Actualizar
                </Button>
              </Tooltip>
              
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                className="enviar-button"
                onClick={handleEnviarClick}
                disabled={getTotalPendingTransfers() === 0}
                style={{
                  backgroundColor: getTotalPendingTransfers() > 0 ? '#52c41a' : undefined,
                  borderColor: getTotalPendingTransfers() > 0 ? '#52c41a' : undefined,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  height: '48px',
                  minWidth: '200px',
                  boxShadow: getTotalPendingTransfers() > 0 ? '0 4px 12px rgba(82, 196, 26, 0.4)' : undefined
                }}
              >
                {getTotalPendingTransfers() > 0 
                  ? `📦 Enviar Stock (${getTotalPendingTransfers()} unidades)`
                  : '📦 Enviar Stock'
                }
              </Button>
            </Space>
          </div>
        </div>

        {/* Alerta de ventas */}
        {loadingVentas && (
          <Alert
            message="Cargando ventas..."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Alerta de transferencias pendientes */}
        {getTotalPendingTransfers() > 0 && (
          <Alert
            message="⚠️ Tienes transferencias pendientes"
            description={
              <div>
                <p style={{ marginBottom: 8 }}>
                  Has seleccionado <strong>{getTotalPendingTransfers()} unidades</strong> para transferir 
                  en <strong>{Object.keys(pendingTransfers).length} productos</strong>.
                </p>
                <p style={{ marginBottom: 0, fontWeight: 'bold', color: '#fa8c16' }}>
                  ⚠️ IMPORTANTE: Estas cantidades AÚN NO se han descontado de la base de datos. 
                  Presiona el botón "📦 Enviar Stock" para confirmar y realizar la transferencia.
                </p>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            closable
          />
        )}

        {/* Tabla */}
        <Spin spinning={loading} tip="Cargando productos...">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`
            }}
            className="transfer-table"
          />
        </Spin>
                </>
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined /> Historial
                  {historial.length > 0 && (
                    <Badge
                      count={historial.length}
                      style={{ marginLeft: 8 }}
                      overflowCount={999}
                    />
                  )}
                </span>
              ),
              children: (
                <>
                  {/* Filtros del historial */}
                  <div style={{ marginBottom: 24 }}>
                    <Space size="large" wrap>
                      <div>
                        <Text strong style={{ marginRight: 8 }}>
                          <FilterOutlined /> Filtros:
                        </Text>
                      </div>
                      
                      <div>
                        <Text style={{ marginRight: 8 }}>Período:</Text>
                        <RangePicker
                          value={[historialFechaDesde, historialFechaHasta]}
                          onChange={(dates) => {
                            setHistorialFechaDesde(dates?.[0] || null);
                            setHistorialFechaHasta(dates?.[1] || null);
                          }}
                          format="DD/MM/YYYY"
                          placeholder={['Desde', 'Hasta']}
                        />
                      </div>
                      
                      <div>
                        <Text style={{ marginRight: 8 }}>Sucursal:</Text>
                        <Select
                          value={historialSucursal}
                          onChange={setHistorialSucursal}
                          style={{ width: 180 }}
                          options={[
                            { label: 'Todas las sucursales', value: 'todas' },
                            ...sucursales
                              .filter(s => s.toLowerCase() !== sucursalPrincipal.toLowerCase())
                              .map(s => ({ label: s.toUpperCase(), value: s }))
                          ]}
                        />
                      </div>
                      
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={cargarHistorial}
                        loading={loadingHistorial}
                      >
                        Actualizar
                      </Button>
                      
                      <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={handleImprimir}
                        disabled={historial.length === 0}
                      >
                        Imprimir Reporte
                      </Button>
                    </Space>
                  </div>
                  
                  {/* Estadísticas del historial */}
                  <div style={{ marginBottom: 24 }}>
                    <Space size="large">
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                            {historial.length}
                          </div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Transferencias
                          </div>
                        </div>
                      </Card>
                      
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                            {historial.reduce((sum, h) => sum + h.cantidad, 0)}
                          </div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Unidades Totales
                          </div>
                        </div>
                      </Card>
                      
                      <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                            {new Set(historial.map(h => h.producto_id)).size}
                          </div>
                          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                            Productos Diferentes
                          </div>
                        </div>
                      </Card>
                    </Space>
                  </div>
                  
                  {/* Tabla del historial */}
                  <Table
                    columns={columnasHistorial}
                    dataSource={historial}
                    rowKey="id"
                    loading={loadingHistorial}
                    scroll={{ x: 1200 }}
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`,
                    }}
                    locale={{
                      emptyText: 'No hay transferencias registradas en este período'
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
      
      {/* Modal de confirmación */}
      <Modal
        title={
          <Space>
            <SendOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ⚠️ Confirmar Transferencias de Stock
            </span>
          </Space>
        }
        open={isConfirmModalVisible}
        onOk={handleEnviarConfirmado}
        onCancel={() => {
          setIsConfirmModalVisible(false);
          message.info('Transferencia cancelada. No se realizaron cambios.');
        }}
        okText="📦 Enviar"
        cancelText="❌ Cancelar"
        okButtonProps={{ 
          danger: false, 
          size: 'large',
          style: { 
            fontWeight: 'bold',
            backgroundColor: '#52c41a',
            borderColor: '#52c41a'
          }
        }}
        cancelButtonProps={{ 
          size: 'large',
          style: { fontWeight: 'bold' }
        }}
        width={700}
        confirmLoading={enviando}
        closable={!enviando}
        maskClosable={false}
      >
        <Alert
          message="⚠️ IMPORTANTE: ¿Qué va a pasar?"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>
                <strong>Al confirmar esta acción:</strong>
              </p>
              <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>✅ Se <strong>RESTARÁ</strong> el stock de <strong>{formatearNombreSucursal(sucursalPrincipal)} (Casa Central)</strong></li>
                <li>📦 El stock quedará <strong>EN TRÁNSITO</strong> hacia las sucursales</li>
                <li>❌ <strong>NO se sumará</strong> al stock de las sucursales destino todavía</li>
                <li>✉️ Las sucursales deberán <strong>CONFIRMAR LA RECEPCIÓN</strong> para que se agregue a su stock</li>
              </ol>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {/* Resumen de stock a descontar de sucursal principal */}
        <Card 
          size="small" 
          style={{ 
            marginBottom: 16, 
            backgroundColor: '#fff7e6',
            border: '2px solid #faad14'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ fontSize: '16px' }}>
              📊 Stock a descontar de {formatearNombreSucursal(sucursalPrincipal)}:
            </Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Total de productos seleccionados:</Text>
              <Text strong style={{ fontSize: '18px', color: '#fa8c16' }}>
                {(() => {
                  let count = 0;
                  Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
                    Object.keys(sucursales).forEach(sucursal => {
                      const key = `${productoId}-${sucursal}`;
                      if (selectedTransfers[key]) count++;
                    });
                  });
                  return count;
                })()}
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Total de unidades:</Text>
              <Text strong style={{ fontSize: '18px', color: '#fa8c16' }}>
                {(() => {
                  let total = 0;
                  Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
                    Object.entries(sucursales).forEach(([sucursal, cantidad]) => {
                      const key = `${productoId}-${sucursal}`;
                      if (selectedTransfers[key]) {
                        total += cantidad;
                      }
                    });
                  });
                  return total;
                })()}
              </Text>
            </div>
          </Space>
        </Card>

        {/* ⚠️ ALERTA IMPORTANTE: Seleccionar sucursales */}
        <Alert
          message="⚠️ ¡ATENCIÓN! Debes seleccionar las sucursales"
          description="Por defecto NINGUNA sucursal está seleccionada. Marca las casillas ✅ de las sucursales a las que deseas enviar stock."
          type="warning"
          showIcon
          style={{ 
            marginBottom: 16,
            border: '2px solid #faad14',
            backgroundColor: '#fffbe6'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Title level={5} style={{ margin: 0, color: '#fa8c16' }}>
            ⚠️ Selecciona las sucursales que recibirán el stock:
          </Title>
          <Space>
            <Button
              size="small"
              onClick={() => {
                const newSelections: { [key: string]: boolean } = {};
                Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
                  Object.keys(sucursales).forEach(sucursal => {
                    newSelections[`${productoId}-${sucursal}`] = true;
                  });
                });
                setSelectedTransfers(newSelections);
              }}
            >
              ✅ Seleccionar Todo
            </Button>
            <Button
              size="small"
              onClick={() => {
                setSelectedTransfers({});
              }}
            >
              ❌ Deseleccionar Todo
            </Button>
          </Space>
        </div>
        
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {(() => {
              const transferenciasAgrupadas: {
                [sucursal: string]: {
                  producto_id: number;
                  producto_nombre: string;
                  cantidad: number;
                  stock_principal: number;
                }[];
              } = {};
              
              console.log('🔍 DEBUG modalTransfers en render:', JSON.stringify(modalTransfers, null, 2));
              
              Object.entries(modalTransfers).forEach(([productoId, sucursales]) => {
                console.log(`📦 Producto ${productoId}:`, sucursales);
                Object.entries(sucursales).forEach(([sucursal, cantidad]) => {
                  console.log(`  → Sucursal ${sucursal}: ${cantidad} unidades`);
                  
                  if (!transferenciasAgrupadas[sucursal]) {
                    transferenciasAgrupadas[sucursal] = [];
                  }
                  
                  const producto = productos.find(p => p.id === Number(productoId));
                  const stockPrincipal = producto?.sucursales?.[sucursalPrincipal]?.stock || 0;
                  
                  transferenciasAgrupadas[sucursal].push({
                    producto_id: Number(productoId),
                    producto_nombre: producto?.nombre || 'Desconocido',
                    cantidad,
                    stock_principal: stockPrincipal
                  });
              });
            });
            
            return Object.entries(transferenciasAgrupadas).map(([sucursal, items]) => (
              <Card 
                key={sucursal} 
                size="small" 
                style={{ 
                  marginBottom: 12,
                  border: '1px solid #d9d9d9',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}
              >
                <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#1890ff' }}>
                  🏪 {formatearNombreSucursal(sucursal)}
                </Title>
                <List
                  size="small"
                  dataSource={items}
                  renderItem={item => {
                    const key = `${item.producto_id}-${sucursal}`;
                    const isSelected = selectedTransfers[key];
                    
                    return (
                      <List.Item 
                        style={{ 
                          padding: '12px 0',
                          opacity: isSelected ? 1 : 0.5,
                          transition: 'all 0.3s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                          {/* Checkbox - MUY LLAMATIVO */}
                          <div style={{
                            padding: '4px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? '#f6ffed' : '#fff7e6',
                            border: isSelected ? '3px solid #52c41a' : '3px solid #faad14',
                            boxShadow: isSelected ? '0 0 10px rgba(82, 196, 26, 0.5)' : '0 0 10px rgba(250, 173, 20, 0.5)',
                            animation: isSelected ? 'none' : 'pulse 2s infinite'
                          }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              setSelectedTransfers(prev => ({
                                ...prev,
                                [key]: e.target.checked
                              }));
                            }}
                              style={{
                                transform: 'scale(1.5)'
                              }}
                          />
                          </div>
                          
                          {/* Info del producto */}
                          <div style={{ flex: 1 }}>
                            <Text strong={isSelected}>{item.producto_nombre}</Text>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              Stock disponible: <strong>{item.stock_principal}</strong>
                              {' → '}
                              Quedará: <strong style={{ 
                                color: item.stock_principal - (modalTransfers[item.producto_id]?.[sucursal] || 0) < 0 ? '#ff4d4f' : '#52c41a' 
                              }}>
                                {item.stock_principal - (modalTransfers[item.producto_id]?.[sucursal] || 0)}
                              </strong>
                            </div>
                          </div>
                          
                          {/* Selector de cantidad con botones + y - */}
                          <div style={{ textAlign: 'right' }}>
                            {(() => {
                              const currentValue = modalTransfers[item.producto_id]?.[sucursal] || 0;
                              const maxValue = item.stock_principal;
                              
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Botón - */}
                                  <Button
                                    type="primary"
                                    danger
                                    shape="circle"
                                    icon={<MinusOutlined />}
                                    size="large"
                                    disabled={!isSelected || currentValue <= 0}
                                    onClick={() => {
                                      const newValue = Math.max(0, currentValue - 1);
                                  setModalTransfers(prev => ({
                                    ...prev,
                                    [item.producto_id]: {
                                      ...prev[item.producto_id],
                                          [sucursal]: newValue
                                    }
                                  }));
                                    }}
                                    style={{
                                      boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)',
                                      transition: 'all 0.3s'
                                    }}
                                  />
                                  
                                  {/* Display de cantidad */}
                                  <div style={{
                                    minWidth: '80px',
                                    padding: '8px 16px',
                                    backgroundColor: isSelected ? '#f6ffed' : '#f5f5f5',
                                    border: isSelected ? '2px solid #52c41a' : '2px solid #d9d9d9',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    color: isSelected ? '#52c41a' : '#8c8c8c',
                                    boxShadow: isSelected ? '0 0 8px rgba(82, 196, 26, 0.3)' : 'none',
                                    transition: 'all 0.3s'
                                  }}>
                                    {currentValue}
                                    <span style={{ fontSize: '12px', marginLeft: '4px', fontWeight: 'normal' }}>
                                      unid
                                    </span>
                                  </div>
                                  
                                  {/* Botón + */}
                                  <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<PlusOutlined />}
                                    size="large"
                                    disabled={!isSelected || currentValue >= maxValue}
                                    onClick={() => {
                                      const newValue = Math.min(maxValue, currentValue + 1);
                                      setModalTransfers(prev => ({
                                        ...prev,
                                        [item.producto_id]: {
                                          ...prev[item.producto_id],
                                          [sucursal]: newValue
                                        }
                                      }));
                              }}
                              style={{ 
                                      boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                                      transition: 'all 0.3s'
                              }}
                                  />
                                </div>
                              );
                            })()}
                            
                            {/* Advertencia de stock insuficiente */}
                            {(() => {
                              const currentValue = modalTransfers[item.producto_id]?.[sucursal] || 0;
                              if (item.stock_principal < currentValue) {
                                return (
                              <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '4px' }}>
                                ⚠️ Stock insuficiente
                              </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
                <div style={{ 
                  marginTop: 8, 
                  paddingTop: 8, 
                  borderTop: '2px solid #1890ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text strong style={{ fontSize: '14px' }}>Total seleccionado para {formatearNombreSucursal(sucursal)}:</Text>
                  <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    {items.reduce((sum, i) => {
                      const key = `${i.producto_id}-${sucursal}`;
                      const cantidadActual = modalTransfers[i.producto_id]?.[sucursal] || 0;
                      return selectedTransfers[key] ? sum + cantidadActual : sum;
                    }, 0)} unidades
                  </Text>
                </div>
              </Card>
            ));
          })()}
        </div>
      </Modal>
    </div>
  );
};

export default Transfer;
