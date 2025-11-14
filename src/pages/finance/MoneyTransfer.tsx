import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  InputNumber,
  Input,
  message,
  Modal,
  Space,
  Tag,
  Divider,
  Table,
  Select,
  DatePicker,
  Statistic,
  Spin,
  Empty
} from 'antd';
import {
  DollarOutlined,
  SendOutlined,
  BankOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  SwapOutlined,
  ArrowRightOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs, { Dayjs } from 'dayjs';
import './MoneyTransfer.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// URL de la API - detecta automáticamente el entorno
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');

// Interfaces TypeScript
interface Caja {
  sucursal: string;
  monto_actual: number;
  created_at: string;
  updated_at: string;
}

interface Movimiento {
  id: number;
  sucursal: string;
  tipo_movimiento: string;
  monto: number;
  monto_anterior: number;
  monto_nuevo: number;
  concepto: string;
  usuario_email: string;
  created_at: string;
}

const MoneyTransfer: React.FC = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.esAdmin || false;

  const [cajas, setCajas] = useState<Caja[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loadingCajas, setLoadingCajas] = useState(false);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [loadingTransferencia, setLoadingTransferencia] = useState(false);

  // Estados para transferencia
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [sucursalOrigen, setSucursalOrigen] = useState<string>('');
  const [monto, setMonto] = useState<number>(0);
  const [concepto, setConcepto] = useState<string>('');

  // Estados para filtros
  const [fechaFiltro, setFechaFiltro] = useState<[Dayjs, Dayjs] | null>(null);
  const [sucursalFiltro, setSucursalFiltro] = useState<string>('todas');

  // Cargar cajas (Backend ya filtra según rol)
  const cargarCajas = async () => {
    setLoadingCajas(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/caja`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Filtrar "administrador" / "administracion" por si acaso
        const cajasReales = (data.data || []).filter((c: Caja) => 
          c.sucursal.toLowerCase() !== 'administrador' && 
          c.sucursal.toLowerCase() !== 'administracion'
        );
        setCajas(cajasReales);
        
        // Si NO es admin y tiene una sola caja, establecerla como origen por defecto
        if (!esAdmin && cajasReales.length === 1) {
          setSucursalOrigen(cajasReales[0].sucursal);
        }
      } else {
        message.error('Error al cargar cajas');
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error);
      message.error('Error de conexión al cargar cajas');
    } finally {
      setLoadingCajas(false);
    }
  };

  // Cargar movimientos (historial de transferencias)
  const cargarMovimientos = async () => {
    setLoadingMovimientos(true);
    try {
      const token = localStorage.getItem('token');
      
      let url = `${API_URL}/caja/movimientos/historial?tipo_movimiento=todos`;
      
      if (sucursalFiltro && sucursalFiltro !== 'todas') {
        url += `&sucursal=${sucursalFiltro}`;
      }
      
      if (fechaFiltro) {
        const [inicio, fin] = fechaFiltro;
        url += `&fecha_desde=${inicio.format('YYYY-MM-DD')}&fecha_hasta=${fin.format('YYYY-MM-DD')}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo envíos
        const soloEnvios = (data.data || []).filter((m: Movimiento) => 
          m.tipo_movimiento === 'envio'
        );
        setMovimientos(soloEnvios);
      } else {
        message.error('Error al cargar historial');
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      message.error('Error de conexión al cargar historial');
    } finally {
      setLoadingMovimientos(false);
    }
  };

  // Realizar envío de dinero
  const realizarTransferencia = async () => {
    if (!sucursalOrigen) {
      message.error('Debes seleccionar sucursal de origen');
      return;
    }

    if (monto <= 0) {
      message.error('El monto debe ser mayor a 0');
      return;
    }

    setLoadingTransferencia(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/caja/envio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sucursal: sucursalOrigen,
          monto,
          concepto: concepto.trim() || `Envío de $${monto}`,
          usuario_id: usuario?.id || null,
          usuario_email: usuario?.email || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        message.success('Envío realizado exitosamente');
        setModalVisible(false);
        setSuccessModalVisible(true);
        
        // Limpiar form
        setSucursalOrigen('');
        setMonto(0);
        setConcepto('');
        
        // Recargar datos
        cargarCajas();
        cargarMovimientos();
      } else {
        message.error(data.message || 'Error al realizar envío');
      }
    } catch (error) {
      console.error('Error al realizar envío:', error);
      message.error('Error de conexión');
    } finally {
      setLoadingTransferencia(false);
    }
  };

  // Cargar inicial
  useEffect(() => {
    cargarCajas();
    cargarMovimientos();
  }, []);

  // Recargar movimientos al cambiar filtros
  useEffect(() => {
    cargarMovimientos();
  }, [fechaFiltro, sucursalFiltro]);

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Columnas de la tabla de historial
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm'),
      sorter: (a: Movimiento, b: Movimiento) => 
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_movimiento',
      key: 'tipo_movimiento',
      width: 150,
      render: (tipo: string) => {
        if (tipo === 'transferencia_salida') {
          return <Tag color="orange" icon={<ArrowRightOutlined />}>SALIDA</Tag>;
        } else if (tipo === 'transferencia_entrada') {
          return <Tag color="green" icon={<ArrowRightOutlined />}>ENTRADA</Tag>;
        }
        return <Tag>{tipo}</Tag>;
      },
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      render: (suc: string) => <Tag color="blue">{suc.toUpperCase()}</Tag>,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      align: 'right' as const,
      render: (monto: number) => (
        <Text strong style={{ color: monto >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {formatCurrency(monto)}
        </Text>
      ),
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
      ellipsis: true,
    },
    {
      title: 'Usuario',
      dataIndex: 'usuario_email',
      key: 'usuario_email',
      width: 180,
      ellipsis: true,
    },
  ];

  return (
    <div className="money-transfer-container">
      <div className="money-transfer-header">
        <Title level={2}>
          <SendOutlined /> Envíos de Dinero
        </Title>
        <Text type="secondary">
          {esAdmin 
            ? 'Realiza envíos de efectivo desde todas las sucursales'
            : `Realiza envíos de efectivo desde ${cajas[0]?.sucursal?.toUpperCase() || 'tu sucursal'}`
          }
        </Text>
      </div>

      {/* Saldos de Cajas */}
      <Card 
        title={
          <>
            <BankOutlined /> {esAdmin ? 'Saldos por Sucursal' : 'Saldo de tu Caja'}
          </>
        }
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={() => setModalVisible(true)}
            size="large"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Nuevo Envío
          </Button>
        }
      >
        {loadingCajas ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : esAdmin ? (
          // ADMIN: Mostrar todas las cajas en grid
          <Row gutter={[16, 16]}>
            {cajas.map((caja) => (
              <Col xs={24} sm={12} md={8} lg={6} key={caja.sucursal}>
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    borderRadius: 8
                  }}
                >
                  <Statistic
                    title={<Text strong>{caja.sucursal.toUpperCase()}</Text>}
                    value={caja.monto_actual}
                    precision={2}
                    prefix="$"
                    valueStyle={{ color: '#3f8600', fontSize: 20 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          // USUARIO NORMAL: Mostrar solo su caja, destacada
          cajas.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '24px 0'
            }}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  width: '100%',
                  maxWidth: 500
                }}
                bodyStyle={{ padding: 32 }}
              >
                <Statistic
                  title={
                    <Text strong style={{ color: 'white', fontSize: 18 }}>
                      {cajas[0].sucursal.toUpperCase()}
                    </Text>
                  }
                  value={cajas[0].monto_actual}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: 'white', fontSize: 48, fontWeight: 700 }}
                  suffix={
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                      disponible
                    </Text>
                  }
                />
              </Card>
            </div>
          ) : (
            <Empty description="No hay datos de caja disponibles" />
          )
        )}
      </Card>

      {/* Historial de Envíos */}
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            <span>{esAdmin ? 'Historial de Envíos' : 'Mis Envíos'}</span>
          </Space>
        }
        extra={
          <Space>
            {/* Solo admin puede filtrar por sucursal */}
            {esAdmin && (
              <Select
                value={sucursalFiltro}
                onChange={setSucursalFiltro}
                style={{ width: 150 }}
                placeholder="Sucursal"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="todas">Todas</Option>
                {cajas.map((c) => (
                  <Option key={c.sucursal} value={c.sucursal}>
                    {c.sucursal.toUpperCase()}
                  </Option>
                ))}
              </Select>
            )}
            <RangePicker
              value={fechaFiltro}
              onChange={(dates) => setFechaFiltro(dates as [Dayjs, Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Desde', 'Hasta']}
            />
          </Space>
        }
      >
        <Table
          dataSource={movimientos}
          columns={columns}
          loading={loadingMovimientos}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} envíos`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No hay envíos registrados"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      {/* Modal de Nuevo Envío */}
      <Modal
        title={<><SendOutlined /> Nuevo Envío de Dinero</>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Sucursal Origen:</Text>
            <Select
              value={sucursalOrigen}
              onChange={setSucursalOrigen}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Selecciona la sucursal de origen"
              size="large"
              disabled={!esAdmin} // Usuario normal no puede cambiar su sucursal
            >
              {cajas.map((c) => (
                <Option key={c.sucursal} value={c.sucursal}>
                  {c.sucursal.toUpperCase()} - {formatCurrency(c.monto_actual)}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Monto a Enviar:</Text>
            <InputNumber
              value={monto}
              onChange={(val) => setMonto(val || 0)}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="0.00"
              min={0}
              max={
                sucursalOrigen
                  ? cajas.find((c) => c.sucursal === sucursalOrigen)?.monto_actual || 0
                  : undefined
              }
              prefix="$"
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
            />
            {sucursalOrigen && (
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                Disponible: {formatCurrency(
                  cajas.find((c) => c.sucursal === sucursalOrigen)?.monto_actual || 0
                )}
              </Text>
            )}
          </div>

          <div>
            <Text strong>Concepto <Text type="secondary">(opcional)</Text>:</Text>
            <Input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              style={{ width: '100%', marginTop: 8 }}
              placeholder="Ej: Envío para gastos operativos (opcional)"
              size="large"
              maxLength={255}
            />
          </div>

          <Divider />

          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={loadingTransferencia}
            onClick={realizarTransferencia}
            style={{ width: '100%' }}
            size="large"
            disabled={!sucursalOrigen || monto <= 0}
          >
            {loadingTransferencia ? 'Procesando...' : 'Realizar Envío'}
          </Button>
        </Space>
      </Modal>

      {/* Modal de Éxito */}
      <Modal
        open={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={null}
        centered
        closable={false}
        maskClosable={true}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <CheckCircleOutlined
            style={{
              fontSize: 72,
              color: '#52c41a',
              marginBottom: 16
            }}
          />
          <Title level={3}>¡Envío Exitoso!</Title>
          <Text type="secondary">El envío se realizó correctamente</Text>
        </div>
      </Modal>
    </div>
  );
};

export default MoneyTransfer;
