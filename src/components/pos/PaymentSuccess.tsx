import React, { useEffect } from 'react';
import { Card, Button, Space, Typography, Result } from 'antd';
import { CheckCircleOutlined, PrinterOutlined, HomeOutlined, EyeOutlined } from '@ant-design/icons';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

interface PaymentSuccessProps {
  numeroVenta: string;
  cliente: string;
  total: number;
  metodoPago: string;
  fechaVencimiento?: string;
  onNuevaVenta: () => void;
  onGenerarPDF?: () => void;
  onVerDetalles?: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  numeroVenta,
  cliente,
  total,
  metodoPago,
  fechaVencimiento,
  onNuevaVenta,
  onGenerarPDF,
  onVerDetalles
}) => {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '500px' }}>
      {/* Confetti animation */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={200}
        recycle={false}
        gravity={0.3}
      />

      {/* Success Card */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2
        }}
      >
        <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Result
            status="success"
            icon={
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a' }} />
              </motion.div>
            }
            title={
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Title level={2} style={{ color: '#52c41a' }}>
                  ¡Venta Realizada con Éxito!
                </Title>
              </motion.div>
            }
            subTitle={
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Número de Venta:</Text>
                    <br />
                    <Title level={3} style={{ margin: '4px 0' }}>
                      {numeroVenta}
                    </Title>
                  </div>

                  <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">Cliente:</Text>
                        <br />
                        <Text strong style={{ fontSize: '16px' }}>{cliente}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Total:</Text>
                        <br />
                        <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                          ${total.toFixed(2)}
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">Método de Pago:</Text>
                        <br />
                        <Text strong>{metodoPago}</Text>
                      </div>
                      {fechaVencimiento && (
                        <div>
                          <Text type="secondary">Fecha de Vencimiento:</Text>
                          <br />
                          <Text strong>{fechaVencimiento}</Text>
                        </div>
                      )}
                    </Space>
                  </Card>
                </Space>
              </motion.div>
            }
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {onGenerarPDF && (
                <Button
                  type="primary"
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={onGenerarPDF}
                  block
                >
                  Generar PDF
                </Button>
              )}

              <Space style={{ width: '100%' }} size="middle">
                <Button
                  size="large"
                  icon={<HomeOutlined />}
                  onClick={onNuevaVenta}
                  style={{ flex: 1 }}
                >
                  Nueva Venta
                </Button>
                
                {onVerDetalles && (
                  <Button
                    size="large"
                    icon={<EyeOutlined />}
                    onClick={onVerDetalles}
                    style={{ flex: 1 }}
                  >
                    Ver Detalles
                  </Button>
                )}
              </Space>
            </Space>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

