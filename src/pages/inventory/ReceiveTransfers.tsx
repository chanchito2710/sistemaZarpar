/**
 * Página de Recepción de Transferencias
 * Para que las sucursales confirmen la mercadería recibida
 * Sistema ZARPAR
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  InputNumber,
  message,
  Typography,
  Space,
  Tag,
  Alert,
  List,
  Descriptions,
  Spin,
  Input,
  Badge,
  Empty,
  Tooltip
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  InboxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  transferenciasService,
  type Transferencia,
  type TransferenciaDetalle
} from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * ===================================
 * HELPER: Formatear nombre sucursal
 * ===================================
 */
const formatearNombreSucursal = (nombre: string): string => {
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
 * INTERFACE LOCAL
 * ===================================
 */
interface ProductoRecepcion extends TransferenciaDetalle {
  cantidad_a_recibir: number;
}

/**
 * ===================================
 * COMPONENTE PRINCIPAL
 * ===================================
 */
const ReceiveTransfers: React.FC = () => {
  // Estados principales
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  
  // Modal de detalle
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [transferenciaSeleccionada, setTransferenciaSeleccionada] = useState<
    (Transferencia & { productos: ProductoRecepcion[] }) | null
  >(null);
  
  // Notas de recepción
  const [notasRecepcion, setNotasRecepcion] = useState('');

  /**
   * ===================================
   * CARGAR TRANSFERENCIAS EN TRÁNSITO
   * ===================================
   */
  const cargarTransferencias = async () => {
    setLoading(true);
    try {
      // Obtener usuario actual
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const sucursal = usuario.sucursal?.toLowerCase();
      
      // Si es admin, mostrar todas las en tránsito
      // Si es sucursal, solo las de esa sucursal
      const data = await transferenciasService.obtener({
        estado: 'en_transito',
        sucursal: sucursal !== 'administracion' ? sucursal : undefined
      });
      
      setTransferencias(data);
      console.log(`✅ ${data.length} transferencias en tránsito`);
    } catch (error) {
      console.error('Error al cargar transferencias:', error);
      message.error('Error al cargar transferencias pendientes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ===================================
   * VER DETALLE
   * ===================================
   */
  const verDetalle = async (transferencia: Transferencia) => {
    try {
      const detalle = await transferenciasService.obtenerDetalle(transferencia.id);
      
      // Inicializar cantidades a recibir con las cantidades enviadas
      const productosConRecepcion: ProductoRecepcion[] = detalle.productos.map(p => ({
        ...p,
        cantidad_a_recibir: p.cantidad_enviada
      }));
      
      setTransferenciaSeleccionada({
        ...detalle,
        productos: productosConRecepcion
      });
      setNotasRecepcion('');
      setModalDetalleVisible(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      message.error('Error al cargar detalle de la transferencia');
    }
  };

  /**
   * ===================================
   * ACTUALIZAR CANTIDAD A RECIBIR
   * ===================================
   */
  const actualizarCantidadRecibida = (productoId: number, cantidad: number | null) => {
    if (!transferenciaSeleccionada) return;
    
    setTransferenciaSeleccionada({
      ...transferenciaSeleccionada,
      productos: transferenciaSeleccionada.productos.map(p =>
        p.producto_id === productoId
          ? { ...p, cantidad_a_recibir: cantidad || 0 }
          : p
      )
    });
  };

  /**
   * ===================================
   * CONFIRMAR RECEPCIÓN
   * ===================================
   */
  const confirmarRecepcion = async () => {
    if (!transferenciaSeleccionada) return;
    
    setConfirmando(true);
    try {
      // Validar que todas las cantidades estén ingresadas
      const hayInvalidos = transferenciaSeleccionada.productos.some(
        p => p.cantidad_a_recibir < 0
      );
      
      if (hayInvalidos) {
        message.error('Las cantidades no pueden ser negativas');
        return;
      }
      
      // Detectar diferencias
      const diferencias = transferenciaSeleccionada.productos.filter(
        p => p.cantidad_a_recibir !== p.cantidad_enviada
      );
      
      // Si hay diferencias, mostrar confirmación extra
      if (diferencias.length > 0 && !notasRecepcion.trim()) {
        Modal.confirm({
          title: '⚠️ Diferencias Detectadas',
          content: (
            <div>
              <Alert
                message="Se detectaron diferencias entre lo enviado y lo recibido"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <List
                size="small"
                dataSource={diferencias}
                renderItem={item => (
                  <List.Item>
                    <Text strong>{item.producto_nombre}:</Text>
                    <Text> Enviado: {item.cantidad_enviada}</Text>
                    <Text> → Recibido: {item.cantidad_a_recibir}</Text>
                    <Text type={item.cantidad_a_recibir < item.cantidad_enviada ? 'danger' : 'warning'}>
                      ({item.cantidad_a_recibir - item.cantidad_enviada > 0 ? '+' : ''}
                      {item.cantidad_a_recibir - item.cantidad_enviada})
                    </Text>
                  </List.Item>
                )}
              />
              <Alert
                message="Por favor agrega notas explicando las diferencias"
                type="info"
                style={{ marginTop: 16 }}
              />
            </div>
          ),
          okText: 'Cancelar y Agregar Notas',
          cancelText: 'Continuar sin Notas',
          okButtonProps: { type: 'default' },
          cancelButtonProps: { danger: true },
          onCancel: () => enviarConfirmacion()
        });
        return;
      }
      
      await enviarConfirmacion();
      
    } catch (error: any) {
      console.error('Error al confirmar recepción:', error);
      message.error(error.response?.data?.message || 'Error al confirmar recepción');
    } finally {
      setConfirmando(false);
    }
  };

  /**
   * ===================================
   * ENVIAR CONFIRMACIÓN A API
   * ===================================
   */
  const enviarConfirmacion = async () => {
    if (!transferenciaSeleccionada) return;
    
    try {
      const resultado = await transferenciasService.confirmarRecepcion(
        transferenciaSeleccionada.id,
        {
          productos: transferenciaSeleccionada.productos.map(p => ({
            producto_id: p.producto_id,
            cantidad_recibida: p.cantidad_a_recibir
          })),
          notas_recepcion: notasRecepcion.trim() || undefined
        }
      );
      
      // Mostrar resultado
      const diferencias = resultado.diferencias || [];
      
      if (diferencias.length > 0) {
        Modal.warning({
          title: '⚠️ Recepción Confirmada con Diferencias',
          content: (
            <div>
              <Alert
                message="Stock actualizado correctamente"
                description="Se detectaron las siguientes diferencias:"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <List
                size="small"
                dataSource={diferencias}
                renderItem={item => <List.Item>{item}</List.Item>}
              />
            </div>
          ),
          width: 500
        });
      } else {
        message.success('✅ Recepción confirmada exitosamente');
      }
      
      // Cerrar modal y recargar
      setModalDetalleVisible(false);
      setTransferenciaSeleccionada(null);
      await cargarTransferencias();
      
    } catch (error: any) {
      throw error;
    }
  };

  /**
   * ===================================
   * EFFECT: Cargar al montar
   * ===================================
   */
  useEffect(() => {
    cargarTransferencias();
  }, []);

  /**
   * ===================================
   * COLUMNAS DE LA TABLA
   * ===================================
   */
  const columns = [
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
      width: 150,
      render: (codigo: string) => (
        <Text strong style={{ color: '#1890ff' }}>{codigo}</Text>
      )
    },
    {
      title: 'Origen',
      dataIndex: 'sucursal_origen',
      key: 'sucursal_origen',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="green">{formatearNombreSucursal(sucursal)}</Tag>
      )
    },
    {
      title: 'Destino',
      dataIndex: 'sucursal_destino',
      key: 'sucursal_destino',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="blue">{formatearNombreSucursal(sucursal)}</Tag>
      )
    },
    {
      title: 'Fecha Envío',
      dataIndex: 'fecha_envio',
      key: 'fecha_envio',
      width: 150,
      render: (fecha: string) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Productos',
      dataIndex: 'total_productos',
      key: 'total_productos',
      width: 100,
      align: 'center' as const,
      render: (total: number) => <Badge count={total} showZero color="#52c41a" />
    },
    {
      title: 'Unidades',
      dataIndex: 'total_unidades',
      key: 'total_unidades',
      width: 100,
      align: 'center' as const,
      render: (total: number) => (
        <Text strong style={{ fontSize: '16px' }}>{total}</Text>
      )
    },
    {
      title: 'Días en Tránsito',
      dataIndex: 'dias_en_transito',
      key: 'dias_en_transito',
      width: 130,
      align: 'center' as const,
      render: (dias: number) => (
        <Tag color={dias > 3 ? 'red' : dias > 1 ? 'orange' : 'green'}>
          {dias} {dias === 1 ? 'día' : 'días'}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Transferencia) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => verDetalle(record)}
          size="small"
        >
          Ver Detalle
        </Button>
      )
    }
  ];

  /**
   * ===================================
   * RENDER
   * ===================================
   */
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 24
        }}>
          <Title level={2} style={{ margin: 0 }}>
            📦 Recibir Transferencias
          </Title>
          
          <Space>
            <Tooltip title="Actualizar lista">
              <Button
                icon={<ReloadOutlined />}
                onClick={cargarTransferencias}
                loading={loading}
              >
                Actualizar
              </Button>
            </Tooltip>
            
            <Badge count={transferencias.length} showZero>
              <Tag color="processing" style={{ padding: '4px 12px', fontSize: '14px' }}>
                En Tránsito
              </Tag>
            </Badge>
          </Space>
        </div>

        {/* Alerta informativa */}
        <Alert
          message="¿Cómo funciona?"
          description="Cuando Casa Central envía mercadería, aparece aquí. Verifica la mercadería física, ingresa las cantidades recibidas y confirma. El stock se actualizará automáticamente en tu sucursal."
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />

        {/* Tabla */}
        <Spin spinning={loading} tip="Cargando transferencias...">
          {transferencias.length === 0 && !loading ? (
            <Empty
              image={<InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
              description={
                <span>
                  No hay transferencias pendientes de recibir
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Las transferencias aparecerán aquí cuando Casa Central las envíe
                  </Text>
                </span>
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={transferencias}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} transferencias`
              }}
            />
          )}
        </Spin>
      </Card>

      {/* Modal de Detalle y Confirmación */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Confirmar Recepción</span>
            {transferenciaSeleccionada && (
              <Tag color="blue">{transferenciaSeleccionada.codigo}</Tag>
            )}
          </Space>
        }
        open={modalDetalleVisible}
        onCancel={() => {
          setModalDetalleVisible(false);
          setTransferenciaSeleccionada(null);
        }}
        width={900}
        footer={[
          <Button
            key="cancelar"
            onClick={() => setModalDetalleVisible(false)}
            icon={<CloseCircleOutlined />}
          >
            Cancelar
          </Button>,
          <Button
            key="confirmar"
            type="primary"
            onClick={confirmarRecepcion}
            loading={confirmando}
            icon={<CheckCircleOutlined />}
          >
            Confirmar Recepción
          </Button>
        ]}
      >
        {transferenciaSeleccionada && (
          <Spin spinning={confirmando} tip="Confirmando recepción...">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Información General */}
              <Card size="small" title="📋 Información de la Transferencia">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Código">
                    {transferenciaSeleccionada.codigo}
                  </Descriptions.Item>
                  <Descriptions.Item label="Estado">
                    <Tag color="processing">En Tránsito</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Origen">
                    {formatearNombreSucursal(transferenciaSeleccionada.sucursal_origen)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Destino">
                    {formatearNombreSucursal(transferenciaSeleccionada.sucursal_destino)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Fecha Envío">
                    {dayjs(transferenciaSeleccionada.fecha_envio).format('DD/MM/YYYY HH:mm')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Enviado por">
                    {transferenciaSeleccionada.usuario_envio}
                  </Descriptions.Item>
                </Descriptions>
                
                {transferenciaSeleccionada.notas_envio && (
                  <Alert
                    message="Notas de Envío"
                    description={transferenciaSeleccionada.notas_envio}
                    type="info"
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
              </Card>

              {/* Productos */}
              <Card 
                size="small" 
                title={
                  <Space>
                    <span>📦 Productos Enviados</span>
                    <Badge count={transferenciaSeleccionada.productos.length} />
                  </Space>
                }
              >
                <Alert
                  message="⚠️ Verifica las cantidades recibidas"
                  description="Cuenta la mercadería física y ajusta las cantidades si hay diferencias. Si todo está correcto, confirma directamente."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <List
                  dataSource={transferenciaSeleccionada.productos}
                  renderItem={item => {
                    const diferencia = item.cantidad_a_recibir - item.cantidad_enviada;
                    const hayDiferencia = diferencia !== 0;
                    
                    return (
                      <List.Item
                        style={{
                          background: hayDiferencia ? '#fff7e6' : 'transparent',
                          padding: '12px',
                          marginBottom: '8px',
                          border: hayDiferencia ? '1px solid #ffa940' : '1px solid #f0f0f0',
                          borderRadius: '4px'
                        }}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{item.producto_nombre}</Text>
                              <Tag color="blue">{item.producto_marca}</Tag>
                              <Tag>{item.producto_tipo}</Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size="small">
                              <Space>
                                <Text type="secondary">Enviado:</Text>
                                <Text strong>{item.cantidad_enviada} unidades</Text>
                              </Space>
                              {item.ventas_periodo > 0 && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  (Basado en {item.ventas_periodo} ventas del período)
                                </Text>
                              )}
                            </Space>
                          }
                        />
                        
                        <Space direction="vertical" align="end">
                          <Text type="secondary">Cantidad Recibida:</Text>
                          <InputNumber
                            min={0}
                            value={item.cantidad_a_recibir}
                            onChange={(value) => actualizarCantidadRecibida(item.producto_id, value)}
                            style={{ width: 100 }}
                            size="large"
                          />
                          {hayDiferencia && (
                            <Tag color={diferencia < 0 ? 'red' : 'orange'}>
                              {diferencia > 0 ? '+' : ''}{diferencia}
                              {Math.abs(diferencia) === 1 ? ' unidad' : ' unidades'}
                            </Tag>
                          )}
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              </Card>

              {/* Notas de Recepción */}
              <Card size="small" title="📝 Notas de Recepción (Opcional)">
                <TextArea
                  rows={3}
                  placeholder="Ej: Faltaron 2 unidades de Pantalla iPhone 14. Caja llegó abierta."
                  value={notasRecepcion}
                  onChange={(e) => setNotasRecepcion(e.target.value)}
                  maxLength={500}
                  showCount
                />
                {transferenciaSeleccionada.productos.some(
                  p => p.cantidad_a_recibir !== p.cantidad_enviada
                ) && (
                  <Alert
                    message="Se detectaron diferencias"
                    description="Es recomendable agregar notas explicando las diferencias encontradas."
                    type="warning"
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
              </Card>

              {/* Resumen Final */}
              <Card size="small" title="📊 Resumen">
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="Total Productos">
                    {transferenciaSeleccionada.productos.length}
                  </Descriptions.Item>
                  <Descriptions.Item label="Unidades Enviadas">
                    {transferenciaSeleccionada.productos.reduce(
                      (sum, p) => sum + p.cantidad_enviada, 0
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Unidades a Recibir">
                    <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                      {transferenciaSeleccionada.productos.reduce(
                        (sum, p) => sum + p.cantidad_a_recibir, 0
                      )}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Diferencia">
                    {(() => {
                      const diff = transferenciaSeleccionada.productos.reduce(
                        (sum, p) => sum + (p.cantidad_a_recibir - p.cantidad_enviada), 0
                      );
                      return (
                        <Text strong style={{ 
                          color: diff === 0 ? '#52c41a' : diff < 0 ? '#ff4d4f' : '#fa8c16',
                          fontSize: '16px'
                        }}>
                          {diff > 0 ? '+' : ''}{diff}
                        </Text>
                      );
                    })()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </Spin>
        )}
      </Modal>
    </div>
  );
};

export default ReceiveTransfers;














