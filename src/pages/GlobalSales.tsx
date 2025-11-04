/**
 * Página de Ventas Globales - Historial Diario
 * Muestra el resumen de ventas por día con filtros por fecha y sucursal
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Select,
  Tag,
  message,
  Spin,
  Statistic,
  Typography,
  Empty,
  Tooltip
} from 'antd';
import {
  ReloadOutlined,
  CalendarOutlined,
  ShopOutlined,
  DollarOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { ventasService, vendedoresService } from '../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Interfaces
 */
interface VentaDiaria {
  fecha: string;
  total_ventas: number;
  total_ingresos: number;
  por_sucursal: Array<{
    sucursal: string;
    cantidad: number;
    total: number;
  }>;
  por_metodo_pago: Array<{
    metodo_pago: string;
    cantidad: number;
    total: number;
  }>;
}

/**
 * Componente Principal
 */
const GlobalSales: React.FC = () => {
  // Estados para filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('todas');

  // Estados de datos
  const [ventasDiarias, setVentasDiarias] = useState<VentaDiaria[]>([]);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  /**
   * Cargar sucursales al montar
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Cargar ventas globales al montar
   */
  useEffect(() => {
    cargarVentasGlobales();
  }, []);

  /**
   * Cargar sucursales desde la API
   */
  const cargarSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Cargar ventas globales con filtros
   */
  const cargarVentasGlobales = async () => {
    setLoading(true);
    try {
      const filtros: any = {};

      if (sucursalSeleccionada && sucursalSeleccionada !== 'todas') {
        filtros.sucursal = sucursalSeleccionada;
      }

      if (fechaDesde) {
        filtros.fecha_desde = fechaDesde.format('YYYY-MM-DD');
      }

      if (fechaHasta) {
        filtros.fecha_hasta = fechaHasta.format('YYYY-MM-DD');
      }

      const ventas = await ventasService.obtenerVentasGlobales(filtros);
      setVentasDiarias(ventas);

      if (ventas.length === 0) {
        message.info('No se encontraron ventas con los filtros aplicados');
      }
    } catch (error) {
      console.error('Error al cargar ventas globales:', error);
      message.error('Error al cargar el historial de ventas globales');
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
   * Calcular totales
   */
  const totalVentasGlobal = ventasDiarias.reduce((sum, v) => sum + v.total_ventas, 0);
  const totalIngresosGlobal = ventasDiarias.reduce((sum, v) => sum + v.total_ingresos, 0);
  const promedioVentas = ventasDiarias.length > 0 ? totalIngresosGlobal / ventasDiarias.length : 0;

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<VentaDiaria> = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      width: 120,
      render: (fecha: string) => (
        <Text strong>{dayjs(fecha).format('DD/MM/YYYY')}</Text>
      ),
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
    },
    {
      title: 'Total Ventas',
      dataIndex: 'total_ventas',
      key: 'total_ventas',
      width: 100,
      align: 'center',
      render: (total: number) => (
        <Tag color="blue" style={{ fontSize: 13 }}>
          {total} ventas
        </Tag>
      ),
      sorter: (a, b) => a.total_ventas - b.total_ventas,
    },
    {
      title: 'Ingresos Totales',
      dataIndex: 'total_ingresos',
      key: 'total_ingresos',
      width: 150,
      align: 'right',
      render: (total: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
          ${Number(total).toLocaleString('es-UY', { minimumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a, b) => a.total_ingresos - b.total_ingresos,
    },
    {
      title: 'Por Sucursal',
      dataIndex: 'por_sucursal',
      key: 'por_sucursal',
      width: 250,
      render: (sucursales: Array<{ sucursal: string; cantidad: number; total: number }>) => (
        <Space wrap size={[4, 4]}>
          {sucursales.map((s, index) => (
            <Tooltip
              key={index}
              title={`${s.cantidad} ventas - $${Number(s.total).toFixed(2)}`}
            >
              <Tag color="blue" style={{ fontSize: 11 }}>
                {s.sucursal.toUpperCase()}
              </Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: 'Por Método de Pago',
      dataIndex: 'por_metodo_pago',
      key: 'por_metodo_pago',
      width: 200,
      render: (metodos: Array<{ metodo_pago: string; cantidad: number; total: number }>) => (
        <Space wrap size={[4, 4]}>
          {metodos.map((m, index) => (
            <Tooltip
              key={index}
              title={`${m.cantidad} ventas - $${Number(m.total).toFixed(2)}`}
            >
              <Tag color="green" style={{ fontSize: 11 }}>
                {m.metodo_pago.replace('_', ' ').toUpperCase()}
              </Tag>
            </Tooltip>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <BarChartOutlined /> Ventas Globales
        </Title>
        <Text type="secondary">
          Historial de ventas por día con resumen de todas las sucursales
        </Text>
      </div>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div>
                <CalendarOutlined /> <Text strong>Rango de Fechas</Text>
              </div>
              <RangePicker
                value={[fechaDesde, fechaHasta]}
                onChange={handleRangeFechasChange}
                format="DD/MM/YYYY"
                style={{ width: '100%', marginTop: 8 }}
                placeholder={['Fecha desde', 'Fecha hasta']}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div>
                <ShopOutlined /> <Text strong>Sucursal</Text>
              </div>
              <Select
                value={sucursalSeleccionada}
                onChange={setSucursalSeleccionada}
                style={{ width: '100%', marginTop: 8 }}
                loading={loadingSucursales}
              >
                <Option value="todas">Todas las Sucursales</Option>
                {sucursales.map((sucursal) => (
                  <Option key={sucursal} value={sucursal}>
                    {sucursal.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Space>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={cargarVentasGlobales}
                  loading={loading}
                >
                  Buscar
                </Button>
                <Button icon={<FileExcelOutlined />} style={{ color: '#52c41a' }}>
                  Excel
                </Button>
                <Button icon={<FilePdfOutlined />} style={{ color: '#ff4d4f' }}>
                  PDF
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Ventas"
              value={totalVentasGlobal}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={totalIngresosGlobal}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Promedio por Día"
              value={promedioVentas}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de Ventas Diarias */}
      <Card title={`Historial de Ventas Diarias (${ventasDiarias.length} días)`}>
        {!loading && ventasDiarias.length === 0 ? (
          <Empty description="No hay datos de ventas diarias" />
        ) : (
          <Table
            columns={columns}
            dataSource={ventasDiarias}
            rowKey="fecha"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} días`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};

export default GlobalSales;


