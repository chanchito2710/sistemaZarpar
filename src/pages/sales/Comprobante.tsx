/**
 * Página de Comprobante de Venta
 * Muestra el comprobante completo de una venta específica
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Divider, Spin, Space, Row, Col, Tag, message } from 'antd';
import {
  PrinterOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ventasService } from '../../services/api';
import type { Venta } from '../../services/api';

const { Title, Text } = Typography;

interface DetalleVenta {
  producto_id: number;
  nombre: string;
  marca?: string;
  tipo?: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

const Comprobante: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venta, setVenta] = useState<Venta | null>(null);
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarVenta(parseInt(id));
    }
  }, [id]);

  const cargarVenta = async (ventaId: number) => {
    try {
      setLoading(true);
      const datos = await ventasService.obtenerDetalle(ventaId);
      setVenta(datos);
      setDetalles(datos.productos || []);
    } catch (error) {
      console.error('Error al cargar venta:', error);
      message.error('Error al cargar el comprobante');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

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

  const metodoPagoTexto: Record<string, string> = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    cuenta_corriente: 'Cuenta Corriente',
    tarjeta: 'Tarjeta',
  };

  const imprimirComprobante = () => {
    if (!venta) return;

    const contenidoImpresion = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante - ${venta.numero_venta}</title>
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
              padding: 15px;
            }
            .header { text-align: center; margin-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header p { font-size: 11px; margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 5px 0;
              font-size: 11px;
            }
            .info-row strong { font-weight: bold; }
            .productos { margin: 10px 0; }
            .producto-item { margin: 8px 0; font-size: 11px; }
            .producto-item .nombre { font-weight: bold; }
            .producto-item .detalle { 
              display: flex; 
              justify-content: space-between;
              margin-top: 2px;
            }
            .totales { margin-top: 15px; }
            .total-item { 
              display: flex; 
              justify-content: space-between;
              margin: 5px 0;
              font-size: 12px;
            }
            .total-item.final { 
              font-size: 16px; 
              font-weight: bold; 
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 10px;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 0.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="comprobante">
            <div class="header">
              <h1>SISTEMA ZARPAR</h1>
              <p>Sucursal: ${venta.sucursal.toUpperCase()}</p>
              <p>Fecha: ${formatoFecha(venta.fecha_venta)}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="info-row">
              <strong>N° Venta:</strong>
              <span>${venta.numero_venta}</span>
            </div>
            <div class="info-row">
              <strong>Cliente:</strong>
              <span>${venta.cliente_nombre || 'Sin nombre'}</span>
            </div>
            <div class="info-row">
              <strong>Método de Pago:</strong>
              <span>${metodoPagoTexto[venta.metodo_pago] || venta.metodo_pago}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="productos">
              <strong style="font-size: 12px;">PRODUCTOS</strong>
              ${detalles.map(item => `
                <div class="producto-item">
                  <div class="nombre">${item.nombre}</div>
                  <div class="detalle">
                    <span>${item.cantidad} x $${item.precio.toFixed(2)}</span>
                    <strong>$${item.subtotal.toFixed(2)}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="totales">
              <div class="total-item">
                <span>Subtotal:</span>
                <strong>$${Number(venta.subtotal).toFixed(2)}</strong>
              </div>
              ${Number(venta.descuento) > 0 ? `
                <div class="total-item">
                  <span>Descuento:</span>
                  <strong style="color: #f5222d;">-$${Number(venta.descuento).toFixed(2)}</strong>
                </div>
              ` : ''}
              <div class="total-item final">
                <span>TOTAL:</span>
                <span>$${Number(venta.total).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>Sistema ZARPAR</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
    } else {
      message.error('No se pudo abrir la ventana de impresión. Verifica si los popups están bloqueados.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Cargando comprobante...</div>
      </div>
    );
  }

  if (!venta) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="secondary">No se encontró el comprobante</Text>
          <br />
          <Button 
            type="primary" 
            onClick={() => navigate('/')}
            style={{ marginTop: 16 }}
          >
            Volver al Inicio
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      {/* Botones de acción */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={imprimirComprobante}
        >
          Imprimir Comprobante
        </Button>
      </Space>

      {/* Comprobante */}
      <Card
        style={{
          maxWidth: 400,
          margin: '0 auto',
          border: '2px solid #000',
        }}
      >
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <CheckCircleOutlined
            style={{
              fontSize: 48,
              color: '#52c41a',
              marginBottom: 10,
              display: 'block',
            }}
          />
          <Title level={3} style={{ margin: 0 }}>SISTEMA ZARPAR</Title>
          <Text type="secondary" style={{ display: 'block', marginTop: 5 }}>
            Sucursal: {venta.sucursal.toUpperCase()}
          </Text>
          <Text type="secondary" style={{ display: 'block' }}>
            {formatoFecha(venta.fecha_venta)}
          </Text>
        </div>

        <Divider />

        {/* Información de la venta */}
        <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Text strong>N° Venta:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag color="blue">{venta.numero_venta}</Tag>
          </Col>

          <Col span={12}>
            <Text strong>Cliente:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Text>{venta.cliente_nombre || 'Sin nombre'}</Text>
          </Col>

          <Col span={12}>
            <Text strong>Método de Pago:</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag color="green">
              {metodoPagoTexto[venta.metodo_pago] || venta.metodo_pago}
            </Tag>
          </Col>
        </Row>

        <Divider />

        {/* Productos */}
        <Title level={5} style={{ marginBottom: 12 }}>Productos</Title>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {detalles.map((item, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>{item.nombre}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                  paddingLeft: 8,
                }}
              >
                <Text type="secondary">
                  {item.cantidad} x ${item.precio.toFixed(2)}
                </Text>
                <Text strong>${item.subtotal.toFixed(2)}</Text>
              </div>
            </div>
          ))}
        </Space>

        <Divider />

        {/* Totales */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>Subtotal:</Text>
            <Text strong>${Number(venta.subtotal).toFixed(2)}</Text>
          </div>
          {Number(venta.descuento) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Descuento:</Text>
              <Text strong style={{ color: '#f5222d' }}>
                -${Number(venta.descuento).toFixed(2)}
              </Text>
            </div>
          )}
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>TOTAL:</Title>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
              ${Number(venta.total).toFixed(2)}
            </Title>
          </div>
        </div>

        <Divider />

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">¡Gracias por su compra!</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>Sistema ZARPAR</Text>
        </div>
      </Card>
    </div>
  );
};

export default Comprobante;

