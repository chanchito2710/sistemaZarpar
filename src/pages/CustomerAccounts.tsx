/**
 * ===================================================================
 * PÁGINA DE CUENTAS CORRIENTES - SISTEMA ZARPAR
 * ===================================================================
 * 
 * Funcionalidades:
 * - Lista de clientes con cuenta corriente y saldos reales desde BD
 * - Sistema de permisos:
 *   · Administrador: Puede cambiar entre sucursales
 *   · Vendedores: Solo ven su sucursal (sin selector)
 * - Registrar pagos (totales o parciales)
 * - Permitir saldos a favor (cliente paga de más)
 * - Ver detalle de movimientos de cada cliente
 * - Exportar reportes
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Radio,
  Divider,
  Alert,
  Tooltip,
  Spin,
  Badge,
  Descriptions,
  Timeline
} from 'antd';
import {
  SearchOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FilePdfOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HomeOutlined,
  FilterOutlined,
  ExportOutlined,
  WarningOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import {
  cuentaCorrienteService,
  ventasService,
  vendedoresService,
  type ResumenCuentaCorriente,
  type MovimientoCuentaCorriente
} from '../services/api';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * ===================================================================
 * COMPONENTE PRINCIPAL
 * ===================================================================
 */
const CustomerAccounts: React.FC = () => {
  const { usuario } = useAuth();

  // ===== ESTADOS =====
  const [loading, setLoading] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  
  // Datos de clientes con cuenta corriente
  const [clientesCuentaCorriente, setClientesCuentaCorriente] = useState<ResumenCuentaCorriente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<ResumenCuentaCorriente[]>([]);
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'deudores' | 'aFavor' | 'saldados'>('todos');
  
  // Modales
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ResumenCuentaCorriente | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoCuentaCorriente[]>([]);
  
  // Formularios
  const [formPago] = Form.useForm();

  /**
   * ===================================================================
   * CARGAR SUCURSALES DISPONIBLES (DINÁMICO)
   * ===================================================================
   */
  const cargarSucursales = async () => {
    try {
      setLoadingSucursales(true);
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar las sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * ===================================================================
   * EFECTO INICIAL: Cargar sucursales al montar el componente
   * ===================================================================
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * ===================================================================
   * EFECTO: Detectar sucursal del usuario cuando se cargan las sucursales
   * ===================================================================
   */
  useEffect(() => {
    if (usuario && usuario.email && sucursales.length > 0) {
      // Si es administrador, default a primera sucursal
      if (usuario.email === 'admin@zarparuy.com') {
        setSucursalSeleccionada(sucursales[0]); // Primera sucursal disponible
      } else {
        // Extraer sucursal del email del vendedor
        const emailPrefix = usuario.email.split('@')[0].toLowerCase();
        const sucursalUsuario = sucursales.find(s => emailPrefix === s);
        if (sucursalUsuario) {
          setSucursalSeleccionada(sucursalUsuario);
        }
      }
    }
  }, [usuario, sucursales]);

  /**
   * ===================================================================
   * EFECTO: Cargar datos cuando cambia la sucursal
   * ===================================================================
   */
  useEffect(() => {
    if (sucursalSeleccionada) {
      cargarClientesCuentaCorriente();
    }
  }, [sucursalSeleccionada]);

  /**
   * ===================================================================
   * CARGAR CLIENTES CON CUENTA CORRIENTE
   * ===================================================================
   */
  const cargarClientesCuentaCorriente = async () => {
    try {
      setLoading(true);
      const data = await cuentaCorrienteService.obtenerClientesConSaldo(sucursalSeleccionada);
      setClientesCuentaCorriente(data);
      setClientesFiltrados(data);
    } catch (error) {
      console.error('Error al cargar cuenta corriente:', error);
      message.error('Error al cargar los datos de cuenta corriente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ===================================================================
   * FILTRAR CLIENTES
   * ===================================================================
   */
  useEffect(() => {
    let filtrados = clientesCuentaCorriente;

    // Filtro por búsqueda
    if (busqueda) {
      filtrados = filtrados.filter(cliente =>
        cliente.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtrados = filtrados.filter(cliente => {
        const saldo = parseFloat(cliente.saldo_actual);
        if (filtroEstado === 'deudores') return saldo > 0;
        if (filtroEstado === 'aFavor') return saldo < 0;
        if (filtroEstado === 'saldados') return saldo === 0;
        return true;
      });
    }

    setClientesFiltrados(filtrados);
  }, [clientesCuentaCorriente, busqueda, filtroEstado]);

  /**
   * ===================================================================
   * VER DETALLE DE MOVIMIENTOS
   * ===================================================================
   */
  const verDetalle = async (cliente: ResumenCuentaCorriente) => {
    try {
      setLoading(true);
      setClienteSeleccionado(cliente);
      const response = await cuentaCorrienteService.obtenerEstadoCuenta(
        sucursalSeleccionada,
        cliente.cliente_id
      );
      setMovimientos(response.movimientos);
      setModalDetalleVisible(true);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      message.error('Error al cargar el detalle');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ===================================================================
   * ABRIR MODAL DE PAGO
   * ===================================================================
   */
  const abrirModalPago = (cliente: ResumenCuentaCorriente) => {
    setClienteSeleccionado(cliente);
    formPago.resetFields();
    setModalPagoVisible(true);
  };

  /**
   * ===================================================================
   * REGISTRAR PAGO
   * ===================================================================
   */
  const handleRegistrarPago = async (values: any) => {
    if (!clienteSeleccionado) return;

    try {
      setLoading(true);

      await cuentaCorrienteService.registrarPago({
        sucursal: sucursalSeleccionada,
        cliente_id: clienteSeleccionado.cliente_id,
        cliente_nombre: clienteSeleccionado.cliente_nombre,
        monto: values.monto,
        metodo_pago: values.metodo_pago,
        comprobante: values.comprobante || '',
        observaciones: values.observaciones || ''
      });

      message.success('✅ Pago registrado exitosamente');
      setModalPagoVisible(false);
      setClienteSeleccionado(null);
      formPago.resetFields();
      
      // Recargar datos
      await cargarClientesCuentaCorriente();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      message.error(error?.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ===================================================================
   * GENERAR PDF DEL ESTADO DE CUENTA
   * ===================================================================
   */
  const generarPDFEstadoCuenta = async (cliente: ResumenCuentaCorriente) => {
    try {
      setLoading(true);

      // Obtener movimientos del cliente
      const response = await cuentaCorrienteService.obtenerEstadoCuenta(
        sucursalSeleccionada,
        cliente.cliente_id
      );
      const movimientosCliente = response.movimientos;

      // Crear PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // ===== HEADER =====
      doc.setFillColor(52, 73, 94); // Azul oscuro profesional
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Logo placeholder (puedes agregar un logo real aquí)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 8, 25, 25, 3, 3, 'F');
      doc.setTextColor(52, 73, 94);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ZARPAR', margin + 12.5, 21, { align: 'center' });

      // Título
    doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ESTADO DE CUENTA CORRIENTE', margin + 35, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sucursal: ${sucursalSeleccionada.charAt(0).toUpperCase() + sucursalSeleccionada.slice(1)}`, margin + 35, 28);
      doc.text(`Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - margin - 50, 28);

      let yPos = 50;

      // ===== INFORMACIÓN DEL CLIENTE =====
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, yPos, contentWidth, 30, 2, 2, 'F');
      
      doc.setTextColor(52, 73, 94);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL CLIENTE', margin + 5, yPos + 8);
    
    doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre:`, margin + 5, yPos + 16);
      doc.setFont('helvetica', 'bold');
      doc.text(cliente.cliente_nombre, margin + 25, yPos + 16);

      doc.setFont('helvetica', 'normal');
      doc.text(`ID Cliente:`, margin + 5, yPos + 23);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cliente.cliente_id}`, margin + 25, yPos + 23);

      yPos += 38;

      // ===== RESUMEN FINANCIERO =====
      const saldoNum = parseFloat(cliente.saldo_actual);
      const colorSaldo = saldoNum > 0 ? [231, 76, 60] : saldoNum < 0 ? [46, 204, 113] : [52, 152, 219];
      
      doc.setFillColor(colorSaldo[0], colorSaldo[1], colorSaldo[2]);
      doc.roundedRect(margin, yPos, contentWidth, 25, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN FINANCIERO', margin + 5, yPos + 8);

    doc.setFontSize(10);
      doc.text(`Total Debe: $${parseFloat(cliente.total_debe).toFixed(2)}`, margin + 5, yPos + 16);
      doc.text(`Total Haber: $${parseFloat(cliente.total_haber).toFixed(2)}`, margin + contentWidth / 3, yPos + 16);

      doc.setFontSize(14);
      const estadoTexto = saldoNum > 0 ? 'SALDO DEUDOR' : saldoNum < 0 ? 'SALDO A FAVOR' : 'CUENTA SALDADA';
      doc.text(`${estadoTexto}: $${Math.abs(saldoNum).toFixed(2)}`, margin + 5, yPos + 23);

      yPos += 33;

      // ===== DETALLE DE MOVIMIENTOS =====
      doc.setTextColor(52, 73, 94);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE MOVIMIENTOS', margin, yPos);

      yPos += 8;

      // Preparar datos para la tabla
      const tableData = movimientosCliente.map(mov => {
        const esPago = mov.tipo === 'pago';
        const fechaFormateada = esPago 
          ? dayjs(mov.fecha_movimiento).format('DD/MM/YYYY')
          : dayjs(mov.fecha_movimiento).format('DD/MM/YYYY HH:mm');
        
        // Convertir a números con validación defensiva
        const debeNum = Number(mov.debe) || 0;
        const haberNum = Number(mov.haber) || 0;
        const saldoNum = Number(mov.saldo) || 0;
        
        const debe = debeNum > 0 ? `$${debeNum.toFixed(2)}` : '-';
        const haber = haberNum > 0 ? `$${haberNum.toFixed(2)}` : '-';
        
        return [
          fechaFormateada,
          mov.descripcion,
          debe,
          haber,
          `$${saldoNum.toFixed(2)}`
        ];
      });

      // Generar tabla con autoTable
      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Descripción', 'Debe', 'Haber', 'Saldo']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [52, 73, 94]
        },
        columnStyles: {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 70, halign: 'left' },
          2: { cellWidth: 25, halign: 'right', textColor: [231, 76, 60] },
          3: { cellWidth: 25, halign: 'right', textColor: [46, 204, 113] },
          4: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin },
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        }
      });

      // ===== FOOTER =====
      const footerY = pageHeight - 25;
      doc.setFillColor(245, 245, 245);
      doc.rect(0, footerY, pageWidth, 25, 'F');

    doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema Zarpar - Gestión Comercial', margin, footerY + 8);
      doc.text(`Sucursal ${sucursalSeleccionada.charAt(0).toUpperCase() + sucursalSeleccionada.slice(1)} | Tel: 099-123-456 | info@zarparuy.com`, margin, footerY + 14);
      doc.text('Este documento es de carácter informativo y no constituye un comprobante fiscal', margin, footerY + 20);

      doc.setFont('helvetica', 'bold');
      doc.text(`Página 1`, pageWidth - margin - 20, footerY + 14);

      // Guardar PDF
      const nombreArchivo = `estado-cuenta-${cliente.cliente_nombre.replace(/\s+/g, '-')}-${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(nombreArchivo);

      message.success('✅ PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      message.error('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ===================================================================
   * VERIFICAR SI ES ADMINISTRADOR
   * ===================================================================
   */
  const esAdministrador = () => {
    return usuario?.email === 'admin@zarparuy.com';
  };

  /**
   * ===================================================================
   * CALCULAR ESTADÍSTICAS
   * ===================================================================
   */
  const calcularEstadisticas = () => {
    const totalDeudores = clientesFiltrados.filter(c => parseFloat(c.saldo_actual) > 0).length;
    const totalAFavor = clientesFiltrados.filter(c => parseFloat(c.saldo_actual) < 0).length;
    const totalSaldados = clientesFiltrados.filter(c => parseFloat(c.saldo_actual) === 0).length;
    
    const totalDeuda = clientesFiltrados
      .filter(c => parseFloat(c.saldo_actual) > 0)
      .reduce((sum, c) => sum + parseFloat(c.saldo_actual), 0);
    
    const totalCredito = clientesFiltrados
      .filter(c => parseFloat(c.saldo_actual) < 0)
      .reduce((sum, c) => sum + Math.abs(parseFloat(c.saldo_actual)), 0);

    return { totalDeudores, totalAFavor, totalSaldados, totalDeuda, totalCredito };
  };

  const estadisticas = calcularEstadisticas();

  /**
   * ===================================================================
   * COLUMNAS DE LA TABLA
   * ===================================================================
   */
  const columns = [
    {
      title: <Space><UserOutlined />Cliente</Space>,
      dataIndex: 'cliente_nombre',
      key: 'cliente_nombre',
      render: (nombre: string, record: ResumenCuentaCorriente) => (
          <div>
          <Text strong>{nombre}</Text>
            <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            ID: {record.cliente_id}
          </Text>
          </div>
      ),
      sorter: (a: ResumenCuentaCorriente, b: ResumenCuentaCorriente) => 
        a.cliente_nombre.localeCompare(b.cliente_nombre)
    },
    {
      title: <Space><DollarOutlined />Total Debe</Space>,
      dataIndex: 'total_debe',
      key: 'total_debe',
      render: (debe: string) => (
        <Text type="danger" strong>${parseFloat(debe).toFixed(2)}</Text>
      ),
      sorter: (a: ResumenCuentaCorriente, b: ResumenCuentaCorriente) => 
        parseFloat(a.total_debe) - parseFloat(b.total_debe)
    },
    {
      title: <Space><DollarOutlined />Total Haber</Space>,
      dataIndex: 'total_haber',
      key: 'total_haber',
      render: (haber: string) => (
        <Text type="success" strong>${parseFloat(haber).toFixed(2)}</Text>
      ),
      sorter: (a: ResumenCuentaCorriente, b: ResumenCuentaCorriente) => 
        parseFloat(a.total_haber) - parseFloat(b.total_haber)
    },
    {
      title: <Space><BankOutlined />Saldo Actual</Space>,
      dataIndex: 'saldo_actual',
      key: 'saldo_actual',
      render: (saldo: string) => {
        const saldoNum = parseFloat(saldo);
        const esDeudor = saldoNum > 0;
        const esAFavor = saldoNum < 0;
        const esSaldado = saldoNum === 0;
        
        return (
          <Space>
            <Text 
              strong 
              style={{ 
                fontSize: 16,
                color: esDeudor ? '#ff4d4f' : esAFavor ? '#52c41a' : '#1890ff'
              }}
            >
              ${Math.abs(saldoNum).toFixed(2)}
            </Text>
            {esDeudor && <ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
            {esAFavor && <ArrowUpOutlined style={{ color: '#52c41a' }} />}
            {esSaldado && <CheckCircleOutlined style={{ color: '#1890ff' }} />}
          </Space>
        );
      },
      sorter: (a: ResumenCuentaCorriente, b: ResumenCuentaCorriente) => 
        parseFloat(a.saldo_actual) - parseFloat(b.saldo_actual)
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_: any, record: ResumenCuentaCorriente) => {
        const saldoNum = parseFloat(record.saldo_actual);
        const esDeudor = saldoNum > 0;
        const esAFavor = saldoNum < 0;
        const esSaldado = saldoNum === 0;

        if (esDeudor) {
          return <Tag color="red" icon={<ArrowDownOutlined />}>DEUDOR</Tag>;
        }
        if (esAFavor) {
          return <Tag color="green" icon={<ArrowUpOutlined />}>A FAVOR</Tag>;
        }
        return <Tag color="blue" icon={<CheckCircleOutlined />}>SALDADO</Tag>;
      },
      filters: [
        { text: 'Deudores', value: 'deudor' },
        { text: 'A Favor', value: 'aFavor' },
        { text: 'Saldados', value: 'saldado' }
      ],
      onFilter: (value: any, record: ResumenCuentaCorriente) => {
        const saldoNum = parseFloat(record.saldo_actual);
        if (value === 'deudor') return saldoNum > 0;
        if (value === 'aFavor') return saldoNum < 0;
        if (value === 'saldado') return saldoNum === 0;
        return true;
      }
    },
    {
      title: <Space><CalendarOutlined />Última Transacción</Space>,
      dataIndex: 'ultimo_movimiento',
      key: 'ultimo_movimiento',
      render: (fecha: string) => (
        <Text>{dayjs(fecha).format('DD/MM/YYYY HH:mm')}</Text>
      ),
      sorter: (a: ResumenCuentaCorriente, b: ResumenCuentaCorriente) => 
        new Date(a.ultimo_movimiento).getTime() - new Date(b.ultimo_movimiento).getTime()
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, record: ResumenCuentaCorriente) => {
        const saldoNum = parseFloat(record.saldo_actual);
        const tieneDeuda = saldoNum > 0;
        
        return (
          <Space>
            <Tooltip title="Ver detalle de movimientos">
            <Button
              size="small"
              icon={<EyeOutlined />}
                onClick={() => verDetalle(record)}
            />
          </Tooltip>
          
            <Tooltip title={tieneDeuda ? "Registrar pago" : "Cliente sin deudas"}>
            <Button
              size="small"
              type="primary"
              icon={<MoneyCollectOutlined />}
                onClick={() => abrirModalPago(record)}
                disabled={!tieneDeuda}
            />
          </Tooltip>
          
            <Tooltip title="Generar PDF del estado de cuenta">
            <Button
              size="small"
              icon={<FilePdfOutlined />}
                onClick={() => generarPDFEstadoCuenta(record)}
            />
          </Tooltip>
        </Space>
        );
      }
    }
  ];

  /**
   * ===================================================================
   * RENDER
   * ===================================================================
   */
  return (
    <div style={{ padding: '24px' }}>
      {/* ===== ENCABEZADO ===== */}
      <Title level={2}>
        <BankOutlined /> Cuentas Corrientes
      </Title>

      {/* ===== SELECTOR DE SUCURSAL (Solo Admin) ===== */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <HomeOutlined />
              <Text strong>Sucursal:</Text>
              {esAdministrador() ? (
                <Select
                  value={sucursalSeleccionada}
                  onChange={setSucursalSeleccionada}
                  style={{ width: 200 }}
                >
                  {sucursales.map(suc => (
                    <Option key={suc} value={suc}>
                      {suc.charAt(0).toUpperCase() + suc.slice(1)}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Tag color="blue" icon={<HomeOutlined />}>
                  {sucursalSeleccionada.charAt(0).toUpperCase() + sucursalSeleccionada.slice(1)}
                </Tag>
              )}
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={cargarClientesCuentaCorriente}
              loading={loading}
            >
              Actualizar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* ===== ESTADÍSTICAS ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={clientesFiltrados.length}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Deudores"
              value={estadisticas.totalDeudores}
              prefix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="A Favor"
              value={estadisticas.totalAFavor}
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Saldados"
              value={estadisticas.totalSaldados}
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Deuda"
              value={estadisticas.totalDeuda}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Crédito"
              value={estadisticas.totalCredito}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== FILTROS ===== */}
      <Card title={<Space><FilterOutlined />Filtros</Space>} style={{ marginBottom: 24 }}>
          <Row gutter={16}>
          <Col span={12}>
            <Input
              placeholder="Buscar por nombre del cliente"
              prefix={<SearchOutlined />}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrar por estado"
              value={filtroEstado}
              onChange={setFiltroEstado}
            >
              <Option value="todos">Todos los estados</Option>
              <Option value="deudores">Solo deudores</Option>
              <Option value="aFavor">Solo a favor</Option>
              <Option value="saldados">Solo saldados</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ===== TABLA DE CLIENTES ===== */}
      <Card>
        <Spin spinning={loading}>
        <Table
          columns={columns}
            dataSource={clientesFiltrados}
            rowKey="cliente_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} clientes`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
        />
        </Spin>
      </Card>

      {/* ===== MODAL DE PAGO ===== */}
      <Modal
        title={
          <Space>
            <MoneyCollectOutlined />
            Registrar Pago
          </Space>
        }
        open={modalPagoVisible}
        onCancel={() => {
          setModalPagoVisible(false);
          setClienteSeleccionado(null);
          formPago.resetFields();
        }}
        footer={null}
        width={600}
      >
        {clienteSeleccionado && (
          <>
            <Alert
              message="Información del Cliente"
              description={
                <div>
                  <Text strong>Nombre: </Text>{clienteSeleccionado.cliente_nombre}<br />
              <Text strong>Saldo Actual: </Text>
              <Text style={{ 
                    color: '#ff4d4f',
                    fontWeight: 'bold',
                    fontSize: 16
              }}>
                    ${parseFloat(clienteSeleccionado.saldo_actual).toFixed(2)}
              </Text>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Alert
              message="💡 Información sobre Pagos"
              description={
                <div>
                  <Text>• <strong>Pago Total:</strong> Ingresa el saldo completo para saldar la deuda.</Text><br />
                  <Text>• <strong>Pago Parcial:</strong> Ingresa un monto menor al saldo.</Text><br />
                  <Text>• <strong>Saldo a Favor:</strong> Puedes ingresar un monto mayor al saldo, y el excedente quedará a favor del cliente.</Text>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Form
              form={formPago}
              layout="vertical"
              onFinish={handleRegistrarPago}
            >
              <Form.Item
                name="monto"
                label="Monto a Pagar"
                rules={[
                  { required: true, message: 'Ingrese el monto a pagar' },
                  { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  placeholder="0.00"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                name="metodo_pago"
                label="Método de Pago"
                rules={[{ required: true, message: 'Seleccione el método de pago' }]}
              >
                <Radio.Group>
                  <Radio value="efectivo">
                    <Space>
                      <DollarOutlined />
                      Efectivo
                    </Space>
                  </Radio>
                  <Radio value="transferencia">
                    <Space>
                      <CreditCardOutlined />
                      Transferencia
                    </Space>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="comprobante"
                label="Número de Comprobante (Opcional)"
              >
                <Input placeholder="Ej: REC-001, TRF-12345" />
              </Form.Item>

                  <Form.Item
                name="observaciones"
                label="Observaciones (Opcional)"
                  >
                    <TextArea
                  rows={3} 
                  placeholder="Notas adicionales sobre el pago" 
                  maxLength={200}
                      showCount
                    />
                  </Form.Item>

                  <Divider />
                  
                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button onClick={() => {
                    setModalPagoVisible(false);
                    setClienteSeleccionado(null);
                    formPago.resetFields();
                      }}>
                        Cancelar
                      </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<MoneyCollectOutlined />}
                    loading={loading}
                  >
                    Registrar Pago
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </>
            )}
          </Modal>

      {/* ===== MODAL DE DETALLE DE MOVIMIENTOS ===== */}
          <Modal
            title={
              <Space>
            <EyeOutlined />
            Detalle de Cuenta Corriente
              </Space>
            }
        open={modalDetalleVisible}
            onCancel={() => {
          setModalDetalleVisible(false);
          setClienteSeleccionado(null);
          setMovimientos([]);
            }}
            footer={null}
        width={900}
      >
        {clienteSeleccionado && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Cliente">{clienteSeleccionado.cliente_nombre}</Descriptions.Item>
              <Descriptions.Item label="ID Cliente">{clienteSeleccionado.cliente_id}</Descriptions.Item>
              <Descriptions.Item label="Total Debe">
                <Text type="danger" strong>${parseFloat(clienteSeleccionado.total_debe).toFixed(2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Haber">
                <Text type="success" strong>${parseFloat(clienteSeleccionado.total_haber).toFixed(2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Saldo Actual" span={2}>
                <Text 
                  strong 
                  style={{ 
                    fontSize: 18,
                    color: parseFloat(clienteSeleccionado.saldo_actual) > 0 ? '#ff4d4f' : '#52c41a'
                  }}
                >
                  ${Math.abs(parseFloat(clienteSeleccionado.saldo_actual)).toFixed(2)}
                  {parseFloat(clienteSeleccionado.saldo_actual) > 0 ? ' (Deuda)' : ' (A Favor)'}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Historial de Movimientos</Title>
            <Timeline>
              {movimientos.map((mov, index) => (
                <Timeline.Item
                  key={index}
                  color={mov.tipo === 'venta' ? 'red' : mov.tipo === 'pago' ? 'green' : 'blue'}
                  dot={
                    mov.tipo === 'venta' ? <ArrowDownOutlined /> :
                    mov.tipo === 'pago' ? <ArrowUpOutlined /> :
                    <ClockCircleOutlined />
                  }
                >
                  <Card size="small" style={{ marginBottom: 8 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                        <Text strong>{mov.descripcion}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(mov.fecha_movimiento).format('DD/MM/YYYY HH:mm')}
                        </Text>
                    </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        {mov.debe > 0 && (
                          <Text type="danger" strong style={{ fontSize: 16 }}>
                            Debe: ${mov.debe.toFixed(2)}
                          </Text>
                        )}
                        {mov.haber > 0 && (
                          <Text type="success" strong style={{ fontSize: 16 }}>
                            Haber: ${mov.haber.toFixed(2)}
                          </Text>
                        )}
                        <br />
                        <Text type="secondary">
                          Saldo: ${mov.saldo.toFixed(2)}
                        </Text>
                    </Col>
                  </Row>
                </Card>
                </Timeline.Item>
              ))}
            </Timeline>
                
            {movimientos.length === 0 && (
                <Alert
                message="Sin movimientos"
                description="No se encontraron movimientos para este cliente."
                  type="info"
                  showIcon
              />
            )}
              </>
            )}
          </Modal>
        </div>
      );
    };

    export default CustomerAccounts;
