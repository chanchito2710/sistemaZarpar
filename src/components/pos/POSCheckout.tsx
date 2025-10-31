/**
 * Componente de Checkout para POS
 * Permite procesar pagos con 3 métodos: Efectivo, Transferencia, Cuenta Corriente
 * Incluye observaciones opcionales e impresión de comprobante
 */

import React, { useState, useRef } from 'react';
import {
  Modal,
  Row,
  Col,
  Card,
  Radio,
  Input,
  Button,
  message,
  Divider,
  Space,
  Typography,
  Spin
} from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  CreditCardOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { ventasService, type CrearVentaInput, type VentaDetalle } from '../../services/api';
import { useReactToPrint } from 'react-to-print';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Interfaz para los props del componente
 */
interface POSCheckoutProps {
  visible: boolean;
  onClose: () => void;
  onVentaCompletada?: (venta: any) => void; // Nueva prop para pasar la venta completada
  carrito: Array<{
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    stock_disponible?: number;
    marca?: string;
    codigo?: string;
  }>;
  subtotal: number;
  descuento: number;
  total: number;
  sucursal: string;
  clienteId: number;
  clienteNombre: string;
  vendedorId: number;
  vendedorNombre: string;
}

/**
 * Interfaz para los datos de la venta completada
 */
interface VentaCompletada {
  id: number;
  numero_venta: string;
  metodo_pago: string;
  total: number;
  estado_pago: string;
  fecha: string;
}

/**
 * Componente POSCheckout
 */
const POSCheckout: React.FC<POSCheckoutProps> = ({
  visible,
  onClose,
  onVentaCompletada,
  carrito,
  subtotal,
  descuento,
  total,
  sucursal,
  clienteId,
  clienteNombre,
  vendedorId,
  vendedorNombre
}) => {
  // Estados
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'cuenta_corriente'>('efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState<VentaCompletada | null>(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);

  // Ref para impresión
  const comprobanteRef = useRef<HTMLDivElement>(null);

  /**
   * Configuración para impresión
   */
  const handlePrint = useReactToPrint({
    content: () => comprobanteRef.current,
    documentTitle: `Comprobante-${ventaCompletada?.numero_venta}`,
    onAfterPrint: () => {
      message.success('✅ Comprobante impreso exitosamente');
    }
  });

  /**
   * Procesar la venta
   */
  const procesarVenta = async () => {
    try {
      setProcesando(true);

      // Preparar productos para la API
      const productos: VentaDetalle[] = carrito.map(item => ({
        producto_id: item.producto_id,
        producto_nombre: item.nombre,
        producto_marca: item.marca,
        producto_codigo: item.codigo,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.subtotal
      }));

      // Preparar datos de la venta
      const ventaData: CrearVentaInput = {
        sucursal,
        cliente_id: clienteId,
        cliente_nombre: clienteNombre,
        vendedor_id: vendedorId,
        vendedor_nombre: vendedorNombre,
        subtotal,
        descuento,
        total,
        metodo_pago: metodoPago,
        productos,
        observaciones: observaciones || undefined
      };

      // Crear venta en la API
      const resultado = await ventasService.crear(ventaData);

      message.success(`✅ Venta procesada exitosamente - ${resultado.numero_venta}`);

      // Si se proporcionó callback, pasar los datos completos de la venta
      if (onVentaCompletada) {
        onVentaCompletada(resultado);
        onClose(); // Cerrar el modal de checkout
      } else {
        // Fallback: mostrar comprobante en modal (comportamiento anterior)
        setVentaCompletada({
          id: resultado.id,
          numero_venta: resultado.numero_venta,
          metodo_pago: metodoPago,
          total,
          estado_pago: resultado.estado_pago,
          fecha: new Date().toISOString()
        });
        setMostrarComprobante(true);
      }

    } catch (error) {
      console.error('Error al procesar venta:', error);
      message.error('❌ Error al procesar la venta. Por favor intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  /**
   * Cerrar y resetear modal
   */
  const cerrarModal = () => {
    setMetodoPago('efectivo');
    setObservaciones('');
    setVentaCompletada(null);
    setMostrarComprobante(false);
    onClose();
  };

  /**
   * Imprimir y cerrar
   */
  const imprimirYCerrar = () => {
    if (handlePrint) {
      handlePrint();
    }
    setTimeout(() => {
      cerrarModal();
    }, 500);
  };

  return (
    <>
      {/* Modal de Checkout */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DollarOutlined style={{ fontSize: 24, marginRight: 12, color: '#1890ff' }} />
            <span>Procesar Pago</span>
          </div>
        }
        open={visible}
        onCancel={cerrarModal}
        footer={null}
        width={700}
        destroyOnClose
      >
        {!mostrarComprobante ? (
          <Spin spinning={procesando} tip="Procesando venta...">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Resumen de la Venta */}
              <Card size="small" style={{ background: '#f0f8ff' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">Cliente:</Text>
                    <div><Text strong>{clienteNombre}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Sucursal:</Text>
                    <div><Text strong>{sucursal.toUpperCase()}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Vendedor:</Text>
                    <div><Text strong>{vendedorNombre}</Text></div>
                  </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">Subtotal:</Text>
                    <div><Text>${subtotal.toFixed(2)}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Descuento:</Text>
                    <div><Text type="success">-${descuento.toFixed(2)}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">Total:</Text>
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        ${total.toFixed(2)}
                      </Title>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Selección de Método de Pago */}
              <Card title="Método de Pago" size="small">
                <Radio.Group
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* Efectivo */}
                    <Card 
                      hoverable
                      style={{
                        border: metodoPago === 'efectivo' ? '2px solid #52c41a' : '1px solid #d9d9d9',
                        background: metodoPago === 'efectivo' ? '#f6ffed' : 'white'
                      }}
                    >
                      <Radio value="efectivo">
                        <Space>
                          <DollarOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                          <div>
                            <Text strong>Efectivo</Text>
                            <div><Text type="secondary" style={{ fontSize: 12 }}>Pago inmediato en efectivo</Text></div>
                          </div>
                        </Space>
                      </Radio>
                    </Card>

                    {/* Transferencia Bancaria */}
                    <Card 
                      hoverable
                      style={{
                        border: metodoPago === 'transferencia' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        background: metodoPago === 'transferencia' ? '#f0f8ff' : 'white'
                      }}
                    >
                      <Radio value="transferencia">
                        <Space>
                          <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                          <div>
                            <Text strong>Transferencia Bancaria</Text>
                            <div><Text type="secondary" style={{ fontSize: 12 }}>Pago mediante transferencia bancaria</Text></div>
                          </div>
                        </Space>
                      </Radio>
                    </Card>

                    {/* Cuenta Corriente */}
                    <Card 
                      hoverable
                      style={{
                        border: metodoPago === 'cuenta_corriente' ? '2px solid #fa8c16' : '1px solid #d9d9d9',
                        background: metodoPago === 'cuenta_corriente' ? '#fff7e6' : 'white'
                      }}
                    >
                      <Radio value="cuenta_corriente">
                        <Space>
                          <CreditCardOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                          <div>
                            <Text strong>Cuenta Corriente</Text>
                            <div><Text type="secondary" style={{ fontSize: 12 }}>Pago a crédito</Text></div>
                          </div>
                        </Space>
                      </Radio>
                    </Card>
                  </Space>
                </Radio.Group>
              </Card>

              {/* Observaciones */}
              <Card title="Observaciones (Opcional)" size="small">
                <TextArea
                  rows={3}
                  placeholder="Ingresa observaciones adicionales sobre la venta..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  maxLength={500}
                  showCount
                />
              </Card>

              {/* Botones de Acción */}
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    block
                    size="large"
                    onClick={cerrarModal}
                    disabled={procesando}
                    icon={<CloseCircleOutlined />}
                  >
                    Cancelar
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={procesarVenta}
                    loading={procesando}
                    icon={<CheckCircleOutlined />}
                  >
                    Confirmar Venta
                  </Button>
                </Col>
              </Row>
            </Space>
          </Spin>
        ) : (
          /* Comprobante de Venta Completada */
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="¡Venta Procesada Exitosamente!"
              description={`Número de Venta: ${ventaCompletada?.numero_venta}`}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />

            <Card>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">Estado:</Text>
                  <div>
                    <Text strong style={{ color: '#52c41a' }}>
                      {ventaCompletada?.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Total:</Text>
                  <div>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                      ${ventaCompletada?.total.toFixed(2)}
                    </Title>
                  </div>
                </Col>
              </Row>
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Button
                  block
                  size="large"
                  onClick={cerrarModal}
                >
                  Finalizar
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={imprimirYCerrar}
                >
                  Imprimir Comprobante
                </Button>
              </Col>
            </Row>
          </Space>
        )}
      </Modal>

      {/* Comprobante para Imprimir (oculto) */}
      {ventaCompletada && (
        <div style={{ display: 'none' }}>
          <div ref={comprobanteRef} style={{ padding: '20px', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>SISTEMA ZARPAR</h2>
              <h3 style={{ margin: 0 }}>COMPROBANTE DE VENTA</h3>
              <p style={{ margin: '5px 0' }}>Sucursal: {sucursal.toUpperCase()}</p>
            </div>

            <hr />

            <div style={{ marginBottom: '15px' }}>
              <p><strong>Número de Venta:</strong> {ventaCompletada.numero_venta}</p>
              <p><strong>Fecha:</strong> {new Date().toLocaleString('es-UY')}</p>
              <p><strong>Cliente:</strong> {clienteNombre}</p>
              <p><strong>Vendedor:</strong> {vendedorNombre}</p>
            </div>

            <hr />

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid black', textAlign: 'left' }}>Producto</th>
                  <th style={{ borderBottom: '1px solid black', textAlign: 'center' }}>Cant.</th>
                  <th style={{ borderBottom: '1px solid black', textAlign: 'right' }}>Precio</th>
                  <th style={{ borderBottom: '1px solid black', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>${item.precio.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />

            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
              <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
              {descuento > 0 && <p><strong>Descuento:</strong> -${descuento.toFixed(2)}</p>}
              <h3 style={{ margin: '10px 0' }}><strong>TOTAL:</strong> ${total.toFixed(2)}</h3>
            </div>

            <hr />

            <div style={{ marginBottom: '15px' }}>
              <p><strong>Método de Pago:</strong> {
                metodoPago === 'efectivo' ? 'Efectivo' :
                metodoPago === 'transferencia' ? 'Transferencia Bancaria' :
                'Cuenta Corriente'
              }</p>
              <p><strong>Estado:</strong> {
                ventaCompletada.estado_pago === 'pagado' ? 'PAGADO' : 'PENDIENTE'
              }</p>
            </div>

            {observaciones && (
              <>
                <hr />
                <div>
                  <p><strong>Observaciones:</strong></p>
                  <p>{observaciones}</p>
                </div>
              </>
            )}

            <hr />

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p>¡Gracias por su compra!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POSCheckout;
