/**
 * Página de Historial de Ventas
 * Muestra todas las ventas realizadas desde el POS con filtros dinámicos
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Tag,
  message,
  Spin,
  Modal,
  Descriptions,
  Typography,
  Alert
} from 'antd';
import {
  SearchOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DollarOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  BankOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { ventasService, type Venta, vendedoresService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Interfaz para sucursales
 */
interface Sucursal {
  sucursal: string;
}

/**
 * Componente principal
 */
const Sales: React.FC = () => {
  // ⭐ AUTENTICACIÓN: Obtener usuario actual
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = usuario?.sucursal || '';

  // Estados para filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  // ⭐ Si NO es admin, establecer automáticamente su sucursal
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>(
    esAdmin ? 'todas' : sucursalUsuario
  );
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('todos');
  const [estadoPagoSeleccionado, setEstadoPagoSeleccionado] = useState<string>('todos');
  const [soloConDescuentos, setSoloConDescuentos] = useState<boolean>(false);

  // Estados de datos
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  // Estado de modal de detalle
  const [modalVisible, setModalVisible] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  /**
   * ⭐ Actualizar sucursal cuando cambia el usuario
   * Si NO es admin, fijar su sucursal automáticamente
   */
  useEffect(() => {
    if (!esAdmin && sucursalUsuario) {
      setSucursalSeleccionada(sucursalUsuario);
    }
  }, [esAdmin, sucursalUsuario]);

  /**
   * Cargar sucursales al montar el componente
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Cargar ventas al montar el componente
   */
  useEffect(() => {
    cargarVentas();
  }, []);

  /**
   * Recargar ventas cuando cambia el filtro de descuentos
   */
  useEffect(() => {
    cargarVentas();
  }, [soloConDescuentos]);

  /**
   * Cargar sucursales desde la API
   */
  const cargarSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData.map((s: string) => ({ sucursal: s })));
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar ventas con los filtros aplicados
   */
  const cargarVentas = async () => {
    setLoading(true);
    try {
      const filtros: any = {};

      // Aplicar filtros
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtros.sucursal = sucursalSeleccionada;
      }

      if (fechaDesde) {
        filtros.fecha_desde = fechaDesde.format('YYYY-MM-DD');
      }

      if (fechaHasta) {
        filtros.fecha_hasta = fechaHasta.format('YYYY-MM-DD');
      }

      if (metodoPagoSeleccionado && metodoPagoSeleccionado !== 'todos') {
        filtros.metodo_pago = metodoPagoSeleccionado;
      }

      if (estadoPagoSeleccionado && estadoPagoSeleccionado !== 'todos') {
        filtros.estado_pago = estadoPagoSeleccionado;
      }

      if (soloConDescuentos) {
        filtros.con_descuento = 'true';
      }

      console.log('🔍 Filtros aplicados:', filtros);

      const ventasData = await ventasService.obtenerHistorial(filtros);
      
      console.log('✅ Ventas cargadas:', ventasData.length);
      setVentas(ventasData);

      if (ventasData.length === 0) {
        message.info('No se encontraron ventas con los filtros aplicados');
      } else {
        message.success(`${ventasData.length} ventas cargadas`);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      message.error('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cambio de rango de fechas
   */
  const handleRangeFechasChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setFechaDesde(dates[0]);
      setFechaHasta(dates[1]);
    } else {
      setFechaDesde(null);
      setFechaHasta(null);
    }
  };

  /**
   * Ver detalle de una venta
   */
  const verDetalleVenta = async (venta: Venta) => {
    try {
      const detalleCompleto = await ventasService.obtenerDetalle(venta.id);
      setVentaSeleccionada(detalleCompleto);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      message.error('Error al cargar el detalle de la venta');
    }
  };

  /**
   * ⭐ Exportar a Excel con datos filtrados
   */
  const exportarExcel = () => {
    try {
      if (ventas.length === 0) {
        message.warning('No hay datos para exportar');
        return;
      }

      // Preparar datos para Excel
      const datosExcel = ventas.map((venta, index) => ({
        '#': index + 1,
        'Número Venta': venta.numero_venta,
        'Fecha': dayjs(venta.fecha_venta).format('DD/MM/YYYY HH:mm'),
        'Sucursal': venta.sucursal.toUpperCase(),
        'Cliente': venta.cliente_nombre || 'Venta Rápida',
        'Método Pago': formatearMetodoPagoTexto(venta.metodo_pago),
        'Estado': venta.estado_pago?.toUpperCase() || 'COMPLETADO',
        'Subtotal': Number(venta.subtotal || 0).toFixed(2),
        'Descuento': Number(venta.descuento || 0).toFixed(2),
        'Total': Number(venta.total).toFixed(2),
        'Vendedor': venta.vendedor_nombre || 'N/A'
      }));

      // Agregar fila de totales
      datosExcel.push({
        '#': '',
        'Número Venta': '',
        'Fecha': '',
        'Sucursal': '',
        'Cliente': '',
        'Método Pago': 'TOTALES:',
        'Estado': '',
        'Subtotal': ventas.reduce((sum, v) => sum + Number(v.subtotal || 0), 0).toFixed(2),
        'Descuento': totalDescuentos.toFixed(2),
        'Total': totalIngresos.toFixed(2),
        'Vendedor': ''
      });

      // Crear libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 5 },   // #
        { wch: 18 },  // Número Venta
        { wch: 16 },  // Fecha
        { wch: 12 },  // Sucursal
        { wch: 25 },  // Cliente
        { wch: 15 },  // Método Pago
        { wch: 12 },  // Estado
        { wch: 10 },  // Subtotal
        { wch: 10 },  // Descuento
        { wch: 10 },  // Total
        { wch: 20 }   // Vendedor
      ];
      worksheet['!cols'] = columnWidths;

      // Generar nombre de archivo con filtros
      const filtrosTexto = [];
      if (fechaDesde && fechaHasta) {
        filtrosTexto.push(`${fechaDesde.format('DD-MM-YYYY')}_al_${fechaHasta.format('DD-MM-YYYY')}`);
      }
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtrosTexto.push(sucursalSeleccionada);
      }
      const nombreArchivo = `Ventas${filtrosTexto.length > 0 ? '_' + filtrosTexto.join('_') : ''}_${dayjs().format('DD-MM-YYYY')}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, nombreArchivo);
      
      message.success(`✅ Excel exportado: ${ventas.length} ventas`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      message.error('Error al exportar a Excel');
    }
  };

  /**
   * ⭐ Exportar a PDF con datos filtrados
   */
  const exportarPDF = () => {
    try {
      if (ventas.length === 0) {
        message.warning('No hay datos para exportar');
        return;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTORIAL DE VENTAS', doc.internal.pageSize.width / 2, 15, { align: 'center' });

      // Información de filtros
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let yPos = 25;

      if (fechaDesde && fechaHasta) {
        doc.text(`Período: ${fechaDesde.format('DD/MM/YYYY')} - ${fechaHasta.format('DD/MM/YYYY')}`, 14, yPos);
        yPos += 5;
      }

      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        doc.text(`Sucursal: ${sucursalSeleccionada.toUpperCase()}`, 14, yPos);
        yPos += 5;
      }

      if (metodoPagoSeleccionado && metodoPagoSeleccionado !== 'todos') {
        doc.text(`Método de Pago: ${formatearMetodoPagoTexto(metodoPagoSeleccionado)}`, 14, yPos);
        yPos += 5;
      }

      if (soloConDescuentos) {
        doc.text('🏷️ Solo ventas con descuentos', 14, yPos);
        yPos += 5;
      }

      // Tabla de ventas
      autoTable(doc, {
        startY: yPos + 5,
        head: [['#', 'N° Venta', 'Fecha', 'Sucursal', 'Cliente', 'Método', 'Subtotal', 'Desc.', 'Total']],
        body: ventas.map((venta, index) => [
          index + 1,
          venta.numero_venta,
          dayjs(venta.fecha_venta).format('DD/MM HH:mm'),
          venta.sucursal.substring(0, 3).toUpperCase(),
          (venta.cliente_nombre || 'Rápida').substring(0, 15),
          formatearMetodoPagoTexto(venta.metodo_pago).substring(0, 8),
          `$${Number(venta.subtotal || 0).toFixed(2)}`,
          `$${Number(venta.descuento || 0).toFixed(2)}`,
          `$${Number(venta.total).toFixed(2)}`
        ]),
        foot: [[
          '',
          '',
          '',
          '',
          '',
          'TOTALES:',
          `$${ventas.reduce((sum, v) => sum + Number(v.subtotal || 0), 0).toFixed(2)}`,
          `$${totalDescuentos.toFixed(2)}`,
          `$${totalIngresos.toFixed(2)}`
        ]],
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2
        },
        footStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontSize: 9,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'center', cellWidth: 22 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'left', cellWidth: 35 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'right', cellWidth: 20 },
          7: { halign: 'right', cellWidth: 18 },
          8: { halign: 'right', cellWidth: 22 }
        },
        didDrawPage: (data) => {
          // Footer de página
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            `Página ${doc.getCurrentPageInfo().pageNumber} - Generado el ${dayjs().format('DD/MM/YYYY HH:mm')}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      });

      // Resumen de estadísticas
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN:', 14, finalY);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Ventas: ${totalVentas}`, 14, finalY + 6);
      doc.text(`Ingresos Totales: $${totalIngresos.toFixed(2)}`, 14, finalY + 12);
      doc.text(`Descuentos Aplicados: $${totalDescuentos.toFixed(2)}`, 14, finalY + 18);
      doc.text(`Promedio por Venta: $${promedioVenta.toFixed(2)}`, 14, finalY + 24);

      // Generar nombre de archivo con filtros
      const filtrosTexto = [];
      if (fechaDesde && fechaHasta) {
        filtrosTexto.push(`${fechaDesde.format('DD-MM-YYYY')}_al_${fechaHasta.format('DD-MM-YYYY')}`);
      }
      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtrosTexto.push(sucursalSeleccionada);
      }
      const nombreArchivo = `Ventas${filtrosTexto.length > 0 ? '_' + filtrosTexto.join('_') : ''}_${dayjs().format('DD-MM-YYYY')}.pdf`;

      // Descargar PDF
      doc.save(nombreArchivo);
      
      message.success(`✅ PDF exportado: ${ventas.length} ventas`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      message.error('Error al exportar a PDF');
    }
  };

  /**
   * Función helper para formatear método de pago como texto
   */
  const formatearMetodoPagoTexto = (metodo: string): string => {
    const textos: Record<string, string> = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'cuenta_corriente': 'Cuenta Corriente',
      'tarjeta': 'Tarjeta'
    };
    return textos[metodo] || metodo;
  };

  /**
   * Calcular estadísticas
   */
  const totalVentas = ventas.length;
  const totalIngresos = ventas.reduce((sum, venta) => sum + Number(venta.total), 0);
  const totalDescuentos = ventas.reduce((sum, venta) => sum + Number(venta.descuento), 0);
  const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;

  // Contar ventas por método de pago
  const ventasPorMetodo = ventas.reduce((acc, venta) => {
    acc[venta.metodo_pago] = (acc[venta.metodo_pago] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  /**
   * Formatear método de pago para mostrar
   */
  const formatearMetodoPago = (metodo: string): React.ReactNode => {
    const estilos: Record<string, { color: string; text: string }> = {
      'efectivo': { color: 'green', text: 'Efectivo' },
      'transferencia': { color: 'blue', text: 'Transfer.' },
      'cuenta_corriente': { color: 'orange', text: 'C. Cte.' }
    };

    const estilo = estilos[metodo] || { color: 'default', text: metodo };

    return (
      <Tag color={estilo.color} style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
        {estilo.text}
      </Tag>
    );
  };

  /**
   * Formatear estado de pago para mostrar
   */
  const formatearEstadoPago = (estado: string): React.ReactNode => {
    const estilos: Record<string, { color: string; text: string }> = {
      'pagado': { color: 'success', text: '✅' },
      'pendiente': { color: 'warning', text: '⏳' },
      'parcial': { color: 'processing', text: '🔄' }
    };

    const estilo = estilos[estado] || { color: 'default', text: estado };

    return (
      <Tag color={estilo.color} style={{ fontSize: 11, padding: '2px 6px', margin: 0 }}>
        {estilo.text}
      </Tag>
    );
  };

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<Venta> = [
    {
      title: 'N° Venta',
      dataIndex: 'numero_venta',
      key: 'numero_venta',
      width: 130,
      render: (text: string) => <Text strong style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_venta',
      key: 'fecha_venta',
      width: 140,
      render: (fecha: string) => {
        const fechaFormateada = dayjs(fecha).format('DD/MM/YY HH:mm');
        return <Text style={{ fontSize: 12 }}>{fechaFormateada}</Text>;
      },
      sorter: (a, b) => dayjs(a.fecha_venta).unix() - dayjs(b.fecha_venta).unix(),
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 90,
      render: (sucursal: string) => (
        <Tag color="blue" style={{ fontSize: 11, padding: '0 4px' }}>
          {sucursal.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      width: 150,
      ellipsis: true,
      render: (nombre: string) => (
        <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: nombre }}>
          {nombre}
        </Text>
      ),
    },
    {
      title: 'Vendedor',
      dataIndex: 'vendedor_nombre',
      key: 'vendedor_nombre',
      width: 140,
      ellipsis: true,
      render: (nombre: string) => (
        <Text style={{ fontSize: 12 }} ellipsis={{ tooltip: nombre }}>
          {nombre}
        </Text>
      ),
    },
    {
      title: 'Método',
      dataIndex: 'metodo_pago',
      key: 'metodo_pago',
      width: 110,
      render: (metodo: string) => formatearMetodoPago(metodo),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_pago',
      key: 'estado_pago',
      width: 90,
      render: (estado: string) => formatearEstadoPago(estado),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 100,
      align: 'right',
      render: (total: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: 13 }}>
          ${Number(total).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => Number(a.total) - Number(b.total),
    },
    {
      title: '',
      key: 'acciones',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => verDetalleVenta(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>📊 Historial de Ventas</Title>
        <Text type="secondary">
          Consulta todas las ventas realizadas desde el punto de venta
        </Text>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            {/* Filtro de Fechas */}
            <Col xs={24} sm={12} lg={8}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                📅 Rango de Fechas
              </Text>
            <RangePicker 
                style={{ width: '100%' }}
                placeholder={['Fecha Desde', 'Fecha Hasta']}
                format="DD/MM/YYYY"
                value={[fechaDesde, fechaHasta]}
                onChange={handleRangeFechasChange}
              />
            </Col>

            {/* Filtro de Sucursal */}
            <Col xs={24} sm={12} lg={4}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                🏢 Sucursal
              </Text>
            <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar"
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                loading={loadingSucursales}
                disabled={!esAdmin} // ⭐ Usuario normal NO puede cambiar sucursal
              >
                {/* ⭐ Solo admin puede ver "Todas" */}
                {esAdmin && <Option value="todas">Todas las Sucursales</Option>}
                
                {/* ⭐ Usuario normal solo ve su sucursal */}
                {!esAdmin ? (
                  <Option value={sucursalUsuario}>
                    {sucursalUsuario.toUpperCase()}
                  </Option>
                ) : (
                  // ⭐ Admin ve todas las sucursales
                  sucursales.map(suc => (
                  <Option key={suc.sucursal} value={suc.sucursal}>
                    {suc.sucursal.toUpperCase()}
                </Option>
                  ))
                )}
            </Select>
            </Col>

            {/* Filtro de Método de Pago */}
            <Col xs={24} sm={12} lg={5}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                💳 Método de Pago
              </Text>
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar"
                value={metodoPagoSeleccionado}
                onChange={setMetodoPagoSeleccionado}
              >
                <Option value="todos">Todos</Option>
                <Option value="efectivo">Efectivo</Option>
                <Option value="transferencia">Transferencia</Option>
                <Option value="cuenta_corriente">Cuenta Corriente</Option>
              </Select>
            </Col>

            {/* Filtro de Estado */}
            <Col xs={24} sm={12} lg={4}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                ✅ Estado
              </Text>
            <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar"
                value={estadoPagoSeleccionado}
                onChange={setEstadoPagoSeleccionado}
              >
                <Option value="todos">Todos</Option>
                <Option value="pagado">Pagado</Option>
                <Option value="pendiente">Pendiente</Option>
                <Option value="parcial">Parcial</Option>
            </Select>
            </Col>

            {/* Botón Buscar */}
            <Col xs={24} sm={12} lg={3}>
              <Text strong style={{ display: 'block', marginBottom: 8, visibility: 'hidden' }}>
                -
              </Text>
            <Button 
                type="primary"
                icon={<SearchOutlined />}
                onClick={cargarVentas}
                loading={loading}
                style={{ width: '100%' }}
              >
                Buscar
            </Button>
            </Col>
          </Row>

          {/* Botones de Acción */}
          <Row gutter={[16, 16]}>
            <Col>
            <Button 
                icon={<ReloadOutlined />}
                onClick={cargarVentas}
                loading={loading}
              >
                Actualizar
              </Button>
            </Col>
            <Col>
              <Button 
                icon={<DollarOutlined />}
                type={soloConDescuentos ? 'primary' : 'default'}
                onClick={() => {
                  setSoloConDescuentos(!soloConDescuentos);
                }}
                style={{
                  background: soloConDescuentos ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : undefined,
                  borderColor: soloConDescuentos ? 'transparent' : undefined,
                  color: soloConDescuentos ? '#fff' : undefined,
                  fontWeight: soloConDescuentos ? 'bold' : 'normal'
                }}
              >
                {soloConDescuentos ? '💰 Mostrando con Descuentos' : '🏷️ Solo con Descuentos'}
              </Button>
            </Col>
            <Col>
              <Button 
                icon={<FileExcelOutlined />} 
                style={{ color: '#52c41a' }}
                onClick={exportarExcel}
                disabled={loading || ventas.length === 0}
              >
                Exportar Excel
              </Button>
            </Col>
            <Col>
              <Button 
                icon={<FilePdfOutlined />} 
                style={{ color: '#ff4d4f' }}
                onClick={exportarPDF}
                disabled={loading || ventas.length === 0}
              >
                Exportar PDF
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Ventas"
              value={totalVentas}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={totalIngresos}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Descuentos Aplicados"
              value={totalDescuentos}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Promedio por Venta"
              value={promedioVenta}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Resumen por Método de Pago */}
      {totalVentas > 0 && (
        <Card style={{ marginBottom: '24px' }} title="📊 Resumen por Método de Pago">
          <Row gutter={[16, 16]}>
            {Object.entries(ventasPorMetodo).map(([metodo, cantidad]) => (
              <Col key={metodo} xs={24} sm={8}>
                <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
                  {formatearMetodoPago(metodo)}
                  <div style={{ marginTop: '8px' }}>
                    <Text strong style={{ fontSize: 18 }}>{cantidad}</Text>
                    <Text type="secondary"> ventas</Text>
                  </div>
                </div>
              </Col>
            ))}
        </Row>
      </Card>
      )}

      {/* Tabla de Ventas */}
      <Card title={`Historial de Ventas (${totalVentas} registros)`}>
        {totalVentas === 0 && !loading && (
          <Alert
            message="No hay ventas para mostrar"
            description="No se encontraron ventas con los filtros aplicados. Intenta cambiar los filtros o realiza ventas desde el punto de venta."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Table
          columns={columns}
          dataSource={ventas}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ventas`,
          }}
        />
      </Card>

      {/* Modal de Detalle de Venta */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Detalle de Venta - {ventaSeleccionada?.numero_venta}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setVentaSeleccionada(null);
        }}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        {ventaSeleccionada && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Información General */}
            <Card title="Información General" size="small">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="N° Venta">
                  <Text strong>{ventaSeleccionada.numero_venta}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Fecha">
                  {dayjs(ventaSeleccionada.fecha_venta).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Sucursal">
                  {ventaSeleccionada.sucursal.toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Cliente">
                  {ventaSeleccionada.cliente_nombre}
                </Descriptions.Item>
                <Descriptions.Item label="Vendedor">
                  {ventaSeleccionada.vendedor_nombre}
                </Descriptions.Item>
                <Descriptions.Item label="Método de Pago">
                  {formatearMetodoPago(ventaSeleccionada.metodo_pago)}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  {formatearEstadoPago(ventaSeleccionada.estado_pago)}
                </Descriptions.Item>
                <Descriptions.Item label="Saldo Pendiente">
                  <Text type={Number(ventaSeleccionada.saldo_pendiente) > 0 ? 'danger' : 'success'}>
                    ${Number(ventaSeleccionada.saldo_pendiente).toFixed(2)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Productos */}
            {(ventaSeleccionada as any).productos && (ventaSeleccionada as any).productos.length > 0 && (
              <Card title="Productos" size="small">
                <Table
                  dataSource={(ventaSeleccionada as any).productos}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    {
                      title: 'PRODUCTO',
                      dataIndex: 'producto_nombre',
                      key: 'producto_nombre',
                      width: 200,
                      render: (nombre: string) => <Text strong>{nombre}</Text>
                    },
                    {
                      title: 'TIPO',
                      dataIndex: 'tipo',
                      key: 'tipo',
                      width: 100,
                      align: 'center',
                      render: (tipo: string) => (
                        tipo ? (
                          <Tag color="blue">{tipo}</Tag>
                        ) : (
                          <Text type="secondary">-</Text>
                        )
                      ),
                    },
                    {
                      title: 'CANTIDAD',
                      dataIndex: 'cantidad',
                      key: 'cantidad',
                      width: 100,
                      align: 'center',
                    },
                    {
                      title: 'PRECIO UNIT.',
                      dataIndex: 'precio_unitario',
                      key: 'precio_unitario',
                      width: 120,
                      align: 'right',
                      render: (precio: number) => (
                        <Text style={{ color: '#1890ff' }}>${Number(precio).toFixed(2)}</Text>
                      ),
                    },
                    {
                      title: 'SUBTOTAL',
                      dataIndex: 'subtotal',
                      key: 'subtotal',
                      width: 120,
                      align: 'right',
                      render: (subtotal: number) => (
                        <Text strong style={{ color: '#52c41a', fontSize: 14 }}>${Number(subtotal).toFixed(2)}</Text>
                      ),
                    },
                  ]}
                />
              </Card>
            )}

            {/* Totales */}
            <Card title="Totales" size="small">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Subtotal">
                  ${Number(ventaSeleccionada.subtotal).toFixed(2)}
                </Descriptions.Item>
                <Descriptions.Item label="Descuento">
                  <Text type="success">-${Number(ventaSeleccionada.descuento).toFixed(2)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    ${Number(ventaSeleccionada.total).toFixed(2)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Observaciones */}
            {ventaSeleccionada.observaciones && (
              <Alert
                message="Observaciones"
                description={ventaSeleccionada.observaciones}
                type="info"
                showIcon
              />
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
