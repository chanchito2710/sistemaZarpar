/**
 * Página de Sueldos - Sistema Manual Simplificado
 * Reemplaza el sistema automático de comisiones
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Input,
  Select,
  message,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import {
  PlusCircleOutlined,
  SearchOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { sueldosService, vendedoresService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import * as XLSX from 'xlsx';
dayjs.locale('es');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface Sueldo {
  id: number;
  vendedor_id: number;
  sucursal: string;
  monto: number;
  fecha: string;
  notas: string | null;
  usuario_registro: string;
  created_at: string;
  vendedor_nombre: string;
  vendedor_apellido: string;
}

interface Vendedor {
  id: number;
  nombre: string;
  apellido: string;
  sucursal: string;
}

const Payroll: React.FC = () => {
  const { usuario } = useAuth();
  const [form] = Form.useForm();
  
  // Estados
  const [sueldos, setSueldos] = useState<Sueldo[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [sucursalFiltro, setSucursalFiltro] = useState<string>('todas');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  
  const esAdmin = usuario?.esAdmin || false;
  const sucursalUsuario = usuario?.sucursal || '';
  
  /**
   * Cargar sucursales (solo admin)
   */
  const cargarSucursales = async () => {
    if (!esAdmin) return;
    
    try {
      const response = await fetch('http://localhost:3456/api/sucursales');
      const data = await response.json();
      setSucursales(data.data || []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };
  
  /**
   * Cargar vendedores
   */
  const cargarVendedores = async () => {
    try {
      const data = await vendedoresService.obtenerTodos();
      
      // Si es usuario normal, filtrar solo vendedores de su sucursal
      const vendedoresFiltrados = esAdmin 
        ? data 
        : data.filter(v => v.sucursal?.toLowerCase() === sucursalUsuario?.toLowerCase());
      
      setVendedores(vendedoresFiltrados);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
      message.error('Error al cargar vendedores');
    }
  };
  
  /**
   * Cargar sueldos con filtros
   */
  const cargarSueldos = async () => {
    setLoading(true);
    try {
      const filtros = {
        fecha_desde: dateRange[0].format('YYYY-MM-DD'),
        fecha_hasta: dateRange[1].format('YYYY-MM-DD')
      };
      
      const data = await sueldosService.obtenerSueldos(filtros);
      
      // Filtrar por sucursal
      let sueldosFiltrados = data;
      
      if (!esAdmin) {
        // Usuario normal: solo su sucursal
        sueldosFiltrados = data.filter(s => s.sucursal.toLowerCase() === sucursalUsuario.toLowerCase());
      } else if (sucursalFiltro !== 'todas') {
        // Admin con filtro específico
        sueldosFiltrados = data.filter(s => s.sucursal.toLowerCase() === sucursalFiltro.toLowerCase());
      }
      
      setSueldos(sueldosFiltrados);
    } catch (error) {
      console.error('Error al cargar sueldos:', error);
      message.error('Error al cargar sueldos');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Exportar a Excel
   */
  const exportarExcel = () => {
    try {
      // Preparar datos para Excel
      const datosExcel = sueldos.map(s => ({
        'Fecha': dayjs(s.fecha).format('DD/MM/YYYY'),
        'Sucursal': s.sucursal.toUpperCase(),
        'Comisionista': s.comisionista,
        'Monto': s.monto,
        'Notas': s.notas || '-'
      }));
      
      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      
      // Crear libro
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Comisiones');
      
      // Nombre del archivo
      const sucursalNombre = esAdmin 
        ? (sucursalFiltro === 'todas' ? 'TODAS' : sucursalFiltro.toUpperCase())
        : sucursalUsuario.toUpperCase();
      const fechaInicio = dateRange[0].format('DD-MM-YYYY');
      const fechaFin = dateRange[1].format('DD-MM-YYYY');
      const nombreArchivo = `Comisiones_${sucursalNombre}_${fechaInicio}_al_${fechaFin}.xlsx`;
      
      // Descargar
      XLSX.writeFile(wb, nombreArchivo);
      message.success('✅ Excel exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      message.error('❌ Error al exportar Excel');
    }
  };
  
  /**
   * Abrir modal para crear sueldo
   */
  const handleCrearSueldo = () => {
    form.resetFields();
    
    // Si es usuario normal, preseleccionar su vendedor
    if (!esAdmin && vendedores.length === 1) {
      form.setFieldsValue({ vendedor_id: vendedores[0].id });
    }
    
    // Establecer fecha de hoy por defecto
    form.setFieldsValue({ fecha: dayjs() });
    
    setModalVisible(true);
  };
  
  /**
   * Guardar nuevo sueldo
   */
  const handleGuardarSueldo = async () => {
    try {
      const values = await form.validateFields();
      
      await sueldosService.crearSueldo({
        vendedor_id: values.vendedor_id,
        monto: values.monto,
        fecha: values.fecha.format('YYYY-MM-DD'),
        notas: values.notas || null
      });
      
      message.success('✅ Comisión registrada exitosamente');
      setModalVisible(false);
      form.resetFields();
      cargarSueldos();
    } catch (error: any) {
      console.error('Error al guardar sueldo:', error);
      message.error(error.response?.data?.message || 'Error al guardar sueldo');
    }
  };
  
  /**
   * Calcular totales
   */
  const calcularTotales = () => {
    const total = sueldos.reduce((sum, s) => sum + Number(s.monto), 0);
    const cantidad = sueldos.length;
    return { total, cantidad };
  };
  
  const { total, cantidad } = calcularTotales();
  
  /**
   * Columnas de la tabla
   */
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 120,
      render: (fecha: string) => (
        <Text>{dayjs(fecha).format('DD/MM/YYYY')}</Text>
      ),
      sorter: (a: Sueldo, b: Sueldo) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix()
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="blue">{sucursal.toUpperCase()}</Tag>
      ),
      filters: esAdmin 
        ? Array.from(new Set(sueldos.map(s => s.sucursal))).map(suc => ({
            text: suc.toUpperCase(),
            value: suc
          }))
        : undefined,
      onFilter: (value: string | number | boolean, record: Sueldo) => record.sucursal === value,
    },
    {
      title: 'Comisionista',
      key: 'comisionista',
      width: 200,
      render: (record: Sueldo) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.vendedor_nombre} {record.vendedor_apellido}</Text>
        </Space>
      ),
      sorter: (a: Sueldo, b: Sueldo) => 
        `${a.vendedor_nombre} ${a.vendedor_apellido}`.localeCompare(`${b.vendedor_nombre} ${b.vendedor_apellido}`)
    },
    {
      title: 'Monto $',
      dataIndex: 'monto',
      key: 'monto',
      width: 130,
      render: (monto: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
          ${monto.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a: Sueldo, b: Sueldo) => a.monto - b.monto
    },
    {
      title: 'Notas',
      dataIndex: 'notas',
      key: 'notas',
      ellipsis: true,
      render: (notas: string | null) => (
        <Text type="secondary">{notas || '-'}</Text>
      )
    }
  ];
  
  /**
   * Efectos
   */
  useEffect(() => {
    cargarVendedores();
    cargarSucursales();
  }, []);
  
  useEffect(() => {
    if (vendedores.length > 0) {
      cargarSueldos();
    }
  }, [vendedores, dateRange, sucursalFiltro]);
  
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>
            <DollarOutlined style={{ marginRight: '12px', color: '#52c41a' }} />
            Comisiones
          </Title>
          <Text type="secondary">
            {esAdmin ? 'Gestión de comisiones de todos los comisionistas' : `Comisiones de ${sucursalUsuario.toUpperCase()}`}
          </Text>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            size="large"
            icon={<PlusCircleOutlined />}
            onClick={handleCrearSueldo}
            style={{
              height: '60px',
              fontSize: '18px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}
          >
            Registrar Comisión
          </Button>
        </Col>
      </Row>
      
      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pagado"
              value={total}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Registros"
              value={cantidad}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Promedio"
              value={cantidad > 0 ? total / cantidad : 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Período</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                  }
                }}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Filtros y Exportar (Admin) */}
      {esAdmin && (
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} md={12}>
            <Card size="small">
              <Space style={{ width: '100%' }}>
                <FilterOutlined style={{ color: '#1890ff' }} />
                <Text strong>Filtrar por Sucursal:</Text>
                <Select
                  value={sucursalFiltro}
                  onChange={setSucursalFiltro}
                  style={{ width: 200 }}
                >
                  <Option value="todas">📍 Todas las Sucursales</Option>
                  {sucursales.map((s: any) => (
                    <Option key={s.sucursal} value={s.sucursal}>
                      {s.sucursal.toUpperCase()}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={exportarExcel}
              disabled={sueldos.length === 0}
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                height: '48px'
              }}
            >
              Exportar Excel
            </Button>
          </Col>
        </Row>
      )}
      
      {/* Tabla */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <Text strong>Historial de Comisiones</Text>
          </Space>
        }
        extra={
          <Button
            icon={<SearchOutlined />}
            onClick={cargarSueldos}
          >
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sueldos}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`
          }}
          scroll={{ x: 800 }}
        />
      </Card>
      
      {/* Modal para crear sueldo */}
      <Modal
        title={
          <Space>
            <PlusCircleOutlined style={{ color: '#52c41a' }} />
            <Text strong>Registrar Nueva Comisión</Text>
          </Space>
        }
        open={modalVisible}
        onOk={handleGuardarSueldo}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="💾 Guardar"
        cancelText="❌ Cancelar"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            label="Comisionista"
            name="vendedor_id"
            rules={[{ required: true, message: 'Selecciona un comisionista' }]}
          >
            <Select
              placeholder="Selecciona un comisionista"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {vendedores.map(v => (
                <Option key={v.id} value={v.id}>
                  {v.nombre} {v.apellido} - {v.sucursal.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Monto"
            name="monto"
            rules={[
              { required: true, message: 'Ingresa el monto' },
              { type: 'number', min: 1, message: 'El monto debe ser mayor a 0' }
            ]}
          >
            <InputNumber
              placeholder="0.00"
              prefix="$"
              style={{ width: '100%' }}
              min={0}
              step={100}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            label="Fecha"
            name="fecha"
            rules={[{ required: true, message: 'Selecciona la fecha' }]}
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Selecciona la fecha"
            />
          </Form.Item>
          
          <Form.Item
            label="Notas (Opcional)"
            name="notas"
          >
            <TextArea
              rows={3}
              placeholder="Agrega notas adicionales (opcional)"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payroll;
