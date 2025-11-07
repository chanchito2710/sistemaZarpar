/**
 * Modal de Limpieza de Datos de Prueba
 * Sistema para limpiar datos de desarrollo antes de ir a producción
 * CON MÚLTIPLES CONFIRMACIONES DE SEGURIDAD
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Checkbox,
  Alert,
  Space,
  Typography,
  Divider,
  Select,
  Input,
  Button,
  Card,
  Row,
  Col,
  Tag,
  Statistic,
  message as antMessage,
} from 'antd';
import {
  DeleteOutlined,
  WarningOutlined,
  SafetyOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';

interface DataCleanupModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface CleanupOptions {
  ventas: boolean;
  cuentaCorriente: boolean;
  clientes: boolean;
  movimientosCaja: boolean;
  comisiones: boolean;
  productos: boolean;
}

const DataCleanupModal: React.FC<DataCleanupModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [step, setStep] = useState(1); // Paso actual del wizard
  const [loading, setLoading] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('todas');
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState('');
  
  const [opciones, setOpciones] = useState<CleanupOptions>({
    ventas: false,
    cuentaCorriente: false,
    clientes: false,
    movimientosCaja: false,
    comisiones: false,
    productos: false,
  });

  useEffect(() => {
    if (visible) {
      cargarSucursales();
      resetModal();
    }
  }, [visible]);

  const resetModal = () => {
    setStep(1);
    setSucursalSeleccionada('todas');
    setConfirmText('');
    setOpciones({
      ventas: false,
      cuentaCorriente: false,
      clientes: false,
      movimientosCaja: false,
      comisiones: false,
      productos: false,
    });
  };

  const cargarSucursales = async () => {
    try {
      const response = await axios.get(`${API_URL}/database/tables`);
      const tables = response.data;
      
      // Extraer sucursales de las tablas clientes_*
      const sucursalesUnicas = tables
        .filter((t: any) => t.name.startsWith('clientes_'))
        .map((t: any) => t.name.replace('clientes_', ''))
        .sort();
      
      setSucursales(sucursalesUnicas);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const handleCheckOption = (key: keyof CleanupOptions) => {
    setOpciones(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLimpiar = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/database/cleanup`, {
        sucursal: sucursalSeleccionada,
        opciones,
      });
      
      antMessage.success(`🗑️ ${response.data.message}`);
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Error al limpiar datos:', error);
      antMessage.error(error.response?.data?.message || 'Error al limpiar los datos');
    } finally {
      setLoading(false);
    }
  };

  const puedeAvanzar = () => {
    const algunaOpcionSeleccionada = Object.values(opciones).some(v => v);
    return algunaOpcionSeleccionada;
  };

  const puedeConfirmar = () => {
    return confirmText === 'ELIMINAR DATOS';
  };

  const renderStep1 = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="⚠️ ADVERTENCIA: Acción Irreversible"
        description="Estás a punto de eliminar datos de la base de datos. Esta acción NO SE PUEDE DESHACER. Asegúrate de haber hecho un backup antes de continuar."
        type="error"
        showIcon
      />

      <div>
        <Text strong style={{ display: 'block', marginBottom: '8px' }}>
          Selecciona la Sucursal:
        </Text>
        <Select
          value={sucursalSeleccionada}
          onChange={setSucursalSeleccionada}
          style={{ width: '100%' }}
          size="large"
        >
          <Option value="todas">
            🌍 TODAS LAS SUCURSALES
          </Option>
          {sucursales.map(suc => (
            <Option key={suc} value={suc}>
              📍 {suc.toUpperCase()}
            </Option>
          ))}
        </Select>
      </div>

      <Divider>Selecciona qué datos borrar</Divider>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Card size="small">
          <Checkbox
            checked={opciones.ventas}
            onChange={() => handleCheckOption('ventas')}
          >
            <Space>
              <Text strong>Ventas</Text>
              <Tag color="red">Elimina todas las ventas registradas</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.cuentaCorriente}
            onChange={() => handleCheckOption('cuentaCorriente')}
          >
            <Space>
              <Text strong>Cuenta Corriente</Text>
              <Tag color="orange">Elimina cuentas corrientes, movimientos y pagos</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.clientes}
            onChange={() => handleCheckOption('clientes')}
          >
            <Space>
              <Text strong>Clientes</Text>
              <Tag color="volcano">Elimina TODOS los clientes</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.movimientosCaja}
            onChange={() => handleCheckOption('movimientosCaja')}
          >
            <Space>
              <Text strong>Movimientos de Caja</Text>
              <Tag color="gold">Resetea cajas a $0 y elimina movimientos</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.comisiones}
            onChange={() => handleCheckOption('comisiones')}
          >
            <Space>
              <Text strong>Comisiones</Text>
              <Tag color="purple">Elimina registros de comisiones y remanentes</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.productos}
            onChange={() => handleCheckOption('productos')}
          >
            <Space>
              <Text strong>Productos</Text>
              <Tag color="red">⚠️ RESETEA STOCK A 0 (NO elimina productos)</Tag>
            </Space>
          </Checkbox>
        </Card>
      </Space>
    </Space>
  );

  const renderStep2 = () => (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="🔍 Resumen de Limpieza"
        description="Revisa cuidadosamente qué se va a eliminar:"
        type="warning"
        showIcon
      />

      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Text strong>Sucursal:</Text>
            <Tag color="blue" style={{ marginLeft: '8px', fontSize: '14px' }}>
              {sucursalSeleccionada === 'todas' 
                ? '🌍 TODAS LAS SUCURSALES' 
                : `📍 ${sucursalSeleccionada.toUpperCase()}`
              }
            </Tag>
          </Col>

          <Col span={24}>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong style={{ display: 'block', marginBottom: '12px' }}>
              Se eliminarán:
            </Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              {opciones.ventas && <Tag color="red">✓ Ventas</Tag>}
              {opciones.cuentaCorriente && <Tag color="orange">✓ Cuenta Corriente</Tag>}
              {opciones.clientes && <Tag color="volcano">✓ Clientes</Tag>}
              {opciones.movimientosCaja && <Tag color="gold">✓ Movimientos de Caja</Tag>}
              {opciones.comisiones && <Tag color="purple">✓ Comisiones</Tag>}
              {opciones.productos && <Tag color="red">✓ Stock de Productos (reset a 0)</Tag>}
            </Space>
          </Col>
        </Row>
      </Card>

      <Alert
        message="⚠️ Confirmación Final Requerida"
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              Para confirmar, escribe exactamente:{' '}
              <Text code strong style={{ fontSize: '14px' }}>
                ELIMINAR DATOS
              </Text>
            </Text>
            <Input
              placeholder="Escribe: ELIMINAR DATOS"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              size="large"
              style={{ marginTop: '8px' }}
              autoFocus
            />
          </Space>
        }
        type="error"
        showIcon
      />
    </Space>
  );

  return (
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          <span>Limpieza de Datos de Prueba</span>
          <Tag color="red">PELIGRO</Tag>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={
        <Space>
          <Button onClick={onCancel}>
            Cancelar
          </Button>
          {step === 1 && (
            <Button
              type="primary"
              onClick={() => setStep(2)}
              disabled={!puedeAvanzar()}
            >
              Continuar →
            </Button>
          )}
          {step === 2 && (
            <>
              <Button onClick={() => setStep(1)}>
                ← Atrás
              </Button>
              <Button
                type="primary"
                danger
                onClick={handleLimpiar}
                loading={loading}
                disabled={!puedeConfirmar()}
                icon={<DeleteOutlined />}
              >
                🗑️ ELIMINAR DATOS
              </Button>
            </>
          )}
        </Space>
      }
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </Modal>
  );
};

export default DataCleanupModal;




