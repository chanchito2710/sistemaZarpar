import React, { useEffect, useState } from 'react';
import { Modal, Button, Typography, Divider, Space, Row, Col } from 'antd';
import {
  LikeOutlined,
  PrinterOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Venta } from '../../services/api';
import './VentaExitosa.css';

const { Title, Text } = Typography;

interface VentaExitosaProps {
  visible: boolean;
  venta: Venta;
  carrito: Array<{
    producto_id: number;
    nombre: string;
    marca?: string;
    precio: number;
    cantidad: number;
    subtotal: number;
  }>;
  onClose: () => void;
}

const VentaExitosa: React.FC<VentaExitosaProps> = ({ visible, venta, carrito, onClose }) => {
  const navigate = useNavigate();
  const [animacionActiva, setAnimacionActiva] = useState(false);

  // 🛡️ Validación defensiva
  const ventaSafe = {
    ...venta,
    numero_venta: venta?.numero_venta || 'N/A',
    cliente_nombre: venta?.cliente_nombre || 'Sin nombre',
    sucursal: venta?.sucursal || 'N/A',
    subtotal: Number(venta?.subtotal) || 0,
    descuento: Number(venta?.descuento) || 0,
    total: Number(venta?.total) || 0,
    metodo_pago: venta?.metodo_pago || 'efectivo',
    fecha_venta: venta?.fecha_venta || new Date().toISOString(),
  };

  // Debug: verificar que el nombre del cliente esté presente
  if (!venta?.cliente_nombre) {
    console.warn('⚠️ VentaExitosa: cliente_nombre no está presente en venta', venta);
  }

  useEffect(() => {
    if (visible) {
      // Activar animación después de un delay
      setTimeout(() => {
        setAnimacionActiva(true);
      }, 200);
    } else {
      setAnimacionActiva(false);
    }
  }, [visible]);

  const formatoFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const metodoPagoTexto = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cuenta_corriente: 'Cuenta Corriente',
  };

  const imprimirComprobante = () => {
    const contenidoImpresion = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante - ${ventaSafe.numero_venta}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              padding: 20px; 
              background: white;
              color: black;
            }
            .comprobante { 
              max-width: 300px; 
              margin: 0 auto; 
              border: 2px solid #000;
              padding: 20px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              border-bottom: 2px dashed #000;
              padding-bottom: 15px;
            }
            h1 { font-size: 24px; margin-bottom: 5px; }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 8px 0;
              font-size: 13px;
            }
            .divider { 
              border-top: 1px dashed #000; 
              margin: 15px 0; 
            }
            .total { 
              font-size: 18px; 
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer { 
              text-align: center; 
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 15px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <h1>ZARPAR</h1>
              <p>Sucursal: ${ventaSafe.sucursal}</p>
            </div>
            
            <div class="info-row">
              <span><strong>Nº Venta:</strong></span>
              <span>${ventaSafe.numero_venta}</span>
            </div>
            
            <div class="info-row">
              <span><strong>Fecha:</strong></span>
              <span>${formatoFecha(ventaSafe.fecha_venta)}</span>
            </div>
            
            <div class="info-row">
              <span><strong>Cliente:</strong></span>
              <span>${ventaSafe.cliente_nombre}</span>
            </div>
            
            <div class="divider"></div>
            
            <div style="margin: 15px 0;">
              <strong>PRODUCTOS:</strong>
              ${carrito && carrito.length > 0 ? carrito.map(item => `
                <div style="margin: 10px 0; padding: 8px; border-bottom: 1px dashed #ccc;">
                  <div style="font-weight: bold; font-size: 13px;">${item.nombre}</div>
                  ${item.marca ? `<div style="font-size: 11px; color: #666;">${item.marca}</div>` : ''}
                  <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 12px;">
                    <span>${item.cantidad} x $${Number(item.precio || 0).toFixed(2)}</span>
                    <span><strong>$${Number(item.subtotal || 0).toFixed(2)}</strong></span>
                  </div>
                </div>
              `).join('') : '<div style="font-size: 12px; color: #666;">Sin productos</div>'}
            </div>
            
            <div class="divider"></div>
            
            <div class="info-row">
              <span>Subtotal:</span>
              <span>$${ventaSafe.subtotal.toFixed(2)}</span>
            </div>
            
            ${ventaSafe.descuento > 0 ? `
              <div class="info-row">
                <span>Descuento:</span>
                <span>-$${ventaSafe.descuento.toFixed(2)}</span>
              </div>
            ` : ''}
            
            <div class="info-row total">
              <span>TOTAL:</span>
              <span>$${ventaSafe.total.toFixed(2)}</span>
            </div>
            
            <div class="info-row" style="margin-top: 10px;">
              <span>Forma de Pago:</span>
              <span>${metodoPagoTexto[ventaSafe.metodo_pago as keyof typeof metodoPagoTexto]}</span>
            </div>
            
            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>www.zarparuy.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      setTimeout(() => {
        ventanaImpresion.print();
      }, 250);
    }
  };

  const handleFinalizar = () => {
    setAnimacionActiva(false);
    setTimeout(() => {
      onClose();
      navigate('/pos');
    }, 300);
  };

  return (
    <Modal
            open={visible}
            footer={null}
            closable={false}
            centered
            width="90%"
            style={{ maxWidth: '750px', maxHeight: '85vh' }}
            styles={{
              body: {
                padding: 0,
                overflow: 'auto',
                borderRadius: '16px',
                maxHeight: '85vh',
              }
            }}
      maskStyle={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      wrapClassName="venta-exitosa-modal"
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 20px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Animación del pulgar */}
        <div className={`thumbs-up-animation ${animacionActiva ? 'active' : ''}`}>
          <LikeOutlined />
        </div>

        {/* Título principal */}
        <Title
          level={2}
          style={{
            color: 'white',
            marginTop: '10px',
            marginBottom: '5px',
            fontSize: '22px',
            fontWeight: 700,
          }}
        >
          VENTA PROCESADA CON ÉXITO
        </Title>

        {/* Checkmark pequeño adicional */}
        <div style={{ marginTop: '8px' }}>
          <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
        </div>
      </div>

      {/* Contenido del modal */}
      <div style={{ padding: '15px 20px 15px 20px' }}>
        {/* Número de venta destacado */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '12px',
          }}
        >
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            Número de venta
          </Text>
          <div
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '30px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            {ventaSafe.numero_venta}
          </div>
        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Información de la venta */}
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text type="secondary" style={{ fontSize: '13px' }}>Cliente</Text>
            </Col>
            <Col>
              <Text strong style={{ fontSize: '15px' }}>{ventaSafe.cliente_nombre}</Text>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Text type="secondary" style={{ fontSize: '13px' }}>Fecha</Text>
            </Col>
            <Col>
              <Text strong style={{ fontSize: '14px' }}>{formatoFecha(ventaSafe.fecha_venta)}</Text>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Text type="secondary" style={{ fontSize: '13px' }}>Método de Pago</Text>
            </Col>
            <Col>
              <Text strong style={{ fontSize: '14px' }}>{metodoPagoTexto[ventaSafe.metodo_pago as keyof typeof metodoPagoTexto]}</Text>
            </Col>
          </Row>
        </Space>

        <Divider style={{ margin: '10px 0' }} />

        {/* Productos vendidos */}
        <div style={{ marginBottom: '10px' }}>
          <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Productos Vendidos
          </Text>
          <div
            style={{
              maxHeight: '180px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {carrito && carrito.length > 0 ? (
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {carrito.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#f5f5f5',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Row justify="space-between" align="top">
                      <Col span={16}>
                        <Text strong style={{ fontSize: '12px', display: 'block' }}>
                          {item.nombre}
                        </Text>
                        {item.marca && (
                          <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>
                            {item.marca}
                          </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          Cantidad: {item.cantidad}
                        </Text>
                      </Col>
                      <Col span={8} style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: '11px', display: 'block', color: '#888' }}>
                          ${Number(item.precio || 0).toFixed(2)} c/u
                        </Text>
                        <Text strong style={{ fontSize: '13px', color: '#52c41a' }}>
                          ${Number(item.subtotal || 0).toFixed(2)}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                No hay productos en esta venta
              </Text>
            )}
          </div>
        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Resumen de montos */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Row justify="space-between">
            <Col>
              <Text>Subtotal</Text>
            </Col>
            <Col>
              <Text>${ventaSafe.subtotal.toFixed(2)}</Text>
            </Col>
          </Row>

          {ventaSafe.descuento > 0 && (
            <Row justify="space-between">
              <Col>
                <Text>Descuento</Text>
              </Col>
              <Col>
                <Text type="danger">-${ventaSafe.descuento.toFixed(2)}</Text>
              </Col>
            </Row>
          )}

          <Divider style={{ margin: '10px 0' }} />

          <Row justify="space-between">
            <Col>
              <Text strong style={{ fontSize: '16px' }}>
                Total
              </Text>
            </Col>
            <Col>
              <Text
                strong
                style={{
                  fontSize: '20px',
                  color: '#52c41a',
                }}
              >
                ${ventaSafe.total.toFixed(2)}
              </Text>
            </Col>
          </Row>
        </Space>

        {/* Botones de acción */}
        <div style={{ marginTop: '12px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              icon={<PrinterOutlined />}
              onClick={imprimirComprobante}
              style={{
                height: '40px',
                fontSize: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              }}
            >
              Imprimir Comprobante
            </Button>

            <Button
              size="large"
              block
              icon={<CloseOutlined />}
              onClick={handleFinalizar}
              style={{
                height: '40px',
                fontSize: '14px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              Cerrar
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default VentaExitosa;
