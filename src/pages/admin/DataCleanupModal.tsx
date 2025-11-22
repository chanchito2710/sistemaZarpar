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

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');

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
  movimientosInventario: boolean;
  transferencias: boolean;
  devoluciones: boolean;
  gastos: boolean;
  reportesEstadisticas: boolean;
}

const DataCleanupModal: React.FC<DataCleanupModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('todas');
  const [sucursales, setSucursales] = useState<string[]>([]);
  
  // Estados para Borrado Maestro
  const [modalBorradoMaestro1Visible, setModalBorradoMaestro1Visible] = useState(false);
  const [modalBorradoMaestro2Visible, setModalBorradoMaestro2Visible] = useState(false);
  const [confirmTextBorradoMaestro, setConfirmTextBorradoMaestro] = useState('');
  const [loadingBorradoMaestro, setLoadingBorradoMaestro] = useState(false);
  
  const [opciones, setOpciones] = useState<CleanupOptions>({
    ventas: false,
    cuentaCorriente: false,
    clientes: false,
    movimientosCaja: false,
    comisiones: false,
    productos: false,
    movimientosInventario: false,
    transferencias: false,
    devoluciones: false,
    gastos: false,
    reportesEstadisticas: false,
  });

  useEffect(() => {
    if (visible) {
      cargarSucursales();
      resetModal();
    }
  }, [visible]);

  const resetModal = () => {
    setSucursalSeleccionada('todas');
    setOpciones({
      ventas: false,
      cuentaCorriente: false,
      clientes: false,
      movimientosCaja: false,
      comisiones: false,
      productos: false,
      movimientosInventario: false,
      transferencias: false,
      devoluciones: false,
      gastos: false,
      reportesEstadisticas: false,
    });
  };

  const cargarSucursales = async () => {
    try {
      const response = await axios.get(`${API_URL}/database/tables`);
      // El backend devuelve { success: true, data: ['tabla1', 'tabla2'] }
      const tables = response.data.data || [];
      
      // Extraer sucursales de las tablas clientes_*
      // tables es un array de strings, no de objetos
      const sucursalesUnicas = tables
        .filter((tableName: string) => tableName.startsWith('clientes_'))
        .map((tableName: string) => tableName.replace('clientes_', ''))
        .sort();
      
      setSucursales(sucursalesUnicas);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      antMessage.error('Error al cargar lista de sucursales');
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

  // ========================================
  // FUNCIONES DE BORRADO MAESTRO
  // ========================================
  
  const handleAbrirPrimeraAdvertencia = () => {
    setModalBorradoMaestro1Visible(true);
  };

  const handleContinuarSegundaAdvertencia = () => {
    setModalBorradoMaestro1Visible(false);
    setModalBorradoMaestro2Visible(true);
    setConfirmTextBorradoMaestro('');
  };

  const handleEjecutarBorradoMaestro = async () => {
    setLoadingBorradoMaestro(true);
    
    try {
      const response = await axios.post(`${API_URL}/database/borrado-maestro`);
      
      antMessage.success({
        content: `🔥 ${response.data.message}`,
        duration: 5,
        style: { marginTop: '20vh' },
      });
      
      // Cerrar todos los modales
      setModalBorradoMaestro2Visible(false);
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Error al ejecutar borrado maestro:', error);
      antMessage.error({
        content: error.response?.data?.message || 'Error crítico durante el borrado maestro',
        duration: 5,
      });
    } finally {
      setLoadingBorradoMaestro(false);
    }
  };

  const puedeEjecutarBorradoMaestro = () => {
    return confirmTextBorradoMaestro === 'BORRADO TOTAL';
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
              <Tag color="red">⚠️ ELIMINA TODOS LOS PRODUCTOS DE LA BASE DE DATOS</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.movimientosInventario}
            onChange={() => handleCheckOption('movimientosInventario')}
          >
            <Space>
              <Text strong>Movimientos de Inventario</Text>
              <Tag color="cyan">Elimina historial de cambios de stock</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.transferencias}
            onChange={() => handleCheckOption('transferencias')}
          >
            <Space>
              <Text strong>Transferencias</Text>
              <Tag color="blue">Elimina transferencias entre sucursales</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.devoluciones}
            onChange={() => handleCheckOption('devoluciones')}
          >
            <Space>
              <Text strong>Devoluciones y Reemplazos</Text>
              <Tag color="orange">Elimina registros de devoluciones/reemplazos</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.gastos}
            onChange={() => handleCheckOption('gastos')}
          >
            <Space>
              <Text strong>Gastos</Text>
              <Tag color="magenta">Elimina registros de gastos</Tag>
            </Space>
          </Checkbox>
        </Card>

        <Card size="small">
          <Checkbox
            checked={opciones.reportesEstadisticas}
            onChange={() => handleCheckOption('reportesEstadisticas')}
          >
            <Space>
              <Text strong>Reportes y Estadísticas</Text>
              <Tag color="red">⚠️ Limpia datos de Ventas Globales (/inventory/log)</Tag>
            </Space>
          </Checkbox>
        </Card>
      </Space>

      {/* BORRADO MAESTRO */}
      <Divider>Opción Avanzada</Divider>
      
      <Card
        style={{
          background: 'linear-gradient(135deg, #ff4d4f 0%, #a8071a 100%)',
          border: '3px solid #ff7875',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)',
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ textAlign: 'center' }}>
            <WarningOutlined
              style={{
                fontSize: '48px',
                color: '#fff',
                marginBottom: '12px',
                display: 'block',
              }}
            />
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              🔥 BORRADO MAESTRO
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}>
              Elimina TODOS los datos de prueba de TODO el sistema
            </Text>
          </div>

          <Alert
            message="⚠️ ATENCIÓN: BORRA ABSOLUTAMENTE TODO"
            description={
              <div style={{ fontSize: '12px' }}>
                Esta opción eliminará:
                <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px' }}>
                  <li>✗ Todos los clientes de TODAS las sucursales</li>
                  <li>✗ Todas las ventas y detalles</li>
                  <li>✗ Todas las devoluciones y reemplazos</li>
                  <li>✗ Todas las transferencias de mercadería</li>
                  <li>✗ Todo el historial de envíos de dinero</li>
                  <li>✗ Todo el stock (lo pone en 0)</li>
                  <li>✗ Todo el stock de fallas (lo pone en 0)</li>
                  <li>✗ Todo el historial de movimientos de inventario</li>
                  <li>✗ Todos los gastos registrados</li>
                  <li>✗ Todas las comisiones pagadas</li>
                  <li>✗ Toda la cuenta corriente (movimientos y pagos)</li>
                  <li>✗ Toda la caja (la deja en $0 y borra historial)</li>
                </ul>
              </div>
            }
            type="error"
            showIcon
            style={{ marginTop: '12px' }}
          />

          <Button
            type="primary"
            danger
            size="large"
            block
            onClick={handleAbrirPrimeraAdvertencia}
            icon={<DeleteOutlined />}
            style={{
              height: '56px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: '#fff',
              color: '#ff4d4f',
              border: '2px solid #ff4d4f',
            }}
          >
            🔥 EJECUTAR BORRADO MAESTRO
          </Button>
        </Space>
      </Card>
    </Space>
  );

  return (
    <>
    <Modal
      title={
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          <span style={{ color: '#000', fontWeight: 500 }}>Limpieza de Datos de Prueba</span>
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
          <Button
            type="primary"
            danger
            onClick={handleLimpiar}
            loading={loading}
            disabled={!puedeAvanzar()}
            icon={<DeleteOutlined />}
          >
            🗑️ ELIMINAR DATOS
          </Button>
        </Space>
      }
    >
      {renderStep1()}
    </Modal>

    {/* MODAL 1: PRIMERA ADVERTENCIA */}
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            🔥 ADVERTENCIA CRÍTICA #1
          </span>
        </Space>
      }
      open={modalBorradoMaestro1Visible}
      onCancel={() => setModalBorradoMaestro1Visible(false)}
      width={650}
      footer={
        <Space>
          <Button onClick={() => setModalBorradoMaestro1Visible(false)} size="large">
            ❌ Cancelar - Regresar
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleContinuarSegundaAdvertencia}
            size="large"
            style={{ fontWeight: 'bold' }}
          >
            ⚠️ Entiendo los riesgos - Continuar
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="⚠️ ESTA ACCIÓN ES IRREVERSIBLE"
          description="Una vez ejecutado el BORRADO MAESTRO, NO HABRÁ FORMA de recuperar los datos. Asegúrate de haber hecho un BACKUP completo de la base de datos antes de continuar."
          type="error"
          showIcon
          style={{ fontSize: '14px' }}
        />

        <Card style={{ background: '#fff7e6', border: '2px solid #ffa940' }}>
          <Title level={5} style={{ color: '#d46b08', marginTop: 0 }}>
            📋 Se eliminarán PERMANENTEMENTE:
          </Title>
          <ul style={{ fontSize: '13px', lineHeight: '1.8' }}>
            <li><Text strong>Clientes:</Text> Todos los clientes de TODAS las sucursales</li>
            <li><Text strong>Ventas:</Text> Todas las ventas, detalles y resúmenes diarios</li>
            <li><Text strong>Devoluciones:</Text> Todas las devoluciones y reemplazos</li>
            <li><Text strong>Transferencias:</Text> Todo el historial de transferencias de mercadería</li>
            <li><Text strong>Envíos de Dinero:</Text> Todo el historial de envíos entre sucursales</li>
            <li><Text strong>Stock:</Text> Se resetea a 0 en todas las sucursales</li>
            <li><Text strong>Stock de Fallas:</Text> Se resetea a 0 en todas las sucursales</li>
            <li><Text strong>Historial de Inventario:</Text> Todos los movimientos de stock</li>
            <li><Text strong>Gastos:</Text> Todos los registros de gastos</li>
            <li><Text strong>Comisiones:</Text> Todas las comisiones pagadas y remanentes</li>
            <li><Text strong>Cuenta Corriente:</Text> Todos los movimientos y pagos</li>
            <li><Text strong>Caja:</Text> Se resetea a $0 y se borra el historial</li>
          </ul>
        </Card>

        <Alert
          message="🔒 ¿Estás 100% seguro?"
          description="Si tienes alguna duda, cancela AHORA y haz un backup. Esta es tu última oportunidad antes de la confirmación final."
          type="warning"
          showIcon
        />
      </Space>
    </Modal>

    {/* MODAL 2: SEGUNDA ADVERTENCIA Y CONFIRMACIÓN FINAL */}
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: '#a8071a', fontSize: '24px' }} />
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#a8071a' }}>
            🔥 CONFIRMACIÓN FINAL #2 - BORRADO MAESTRO
          </span>
        </Space>
      }
      open={modalBorradoMaestro2Visible}
      onCancel={() => {
        setModalBorradoMaestro2Visible(false);
        setConfirmTextBorradoMaestro('');
      }}
      width={600}
      footer={
        <Space>
          <Button
            onClick={() => {
              setModalBorradoMaestro2Visible(false);
              setConfirmTextBorradoMaestro('');
            }}
            size="large"
          >
            ❌ Cancelar
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleEjecutarBorradoMaestro}
            loading={loadingBorradoMaestro}
            disabled={!puedeEjecutarBorradoMaestro()}
            size="large"
            icon={<DeleteOutlined />}
            style={{
              fontWeight: 'bold',
              background: '#ff4d4f',
              borderColor: '#ff4d4f',
            }}
          >
            🔥 EJECUTAR BORRADO MAESTRO
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="⚠️ ÚLTIMA ADVERTENCIA - NO HAY VUELTA ATRÁS"
          description="Estás a punto de ELIMINAR TODOS LOS DATOS de la base de datos. Esta acción es IRREVERSIBLE y NO SE PUEDE DESHACER bajo ninguna circunstancia."
          type="error"
          showIcon
          style={{ fontSize: '14px' }}
        />

        <Card
          style={{
            background: '#fff1f0',
            border: '2px solid #ff4d4f',
            textAlign: 'center',
          }}
        >
          <WarningOutlined
            style={{ fontSize: '64px', color: '#ff4d4f', marginBottom: '16px' }}
          />
          <Title level={3} style={{ color: '#ff4d4f', marginTop: 0, marginBottom: '8px' }}>
            ELIMINACIÓN TOTAL
          </Title>
          <Text style={{ fontSize: '14px', color: '#595959' }}>
            Se borrarán <Text strong style={{ color: '#ff4d4f' }}>TODOS los datos</Text> de:
          </Text>
          <div style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.8' }}>
            <Tag color="red">Clientes</Tag>
            <Tag color="red">Ventas</Tag>
            <Tag color="red">Devoluciones</Tag>
            <Tag color="red">Transferencias</Tag>
            <Tag color="red">Envíos</Tag>
            <Tag color="red">Stock</Tag>
            <Tag color="red">Gastos</Tag>
            <Tag color="red">Comisiones</Tag>
            <Tag color="red">Cuenta Corriente</Tag>
            <Tag color="red">Caja</Tag>
          </div>
        </Card>

        <Alert
          message="🔑 Confirmación Requerida"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                Para confirmar el BORRADO MAESTRO, escribe exactamente:{' '}
                <Text code strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                  BORRADO TOTAL
                </Text>
              </Text>
              <Input
                placeholder="Escribe: BORRADO TOTAL"
                value={confirmTextBorradoMaestro}
                onChange={(e) => setConfirmTextBorradoMaestro(e.target.value)}
                size="large"
                style={{ marginTop: '12px', fontSize: '15px' }}
                autoFocus
              />
              {confirmTextBorradoMaestro && confirmTextBorradoMaestro !== 'BORRADO TOTAL' && (
                <Text type="danger" style={{ fontSize: '12px' }}>
                  ❌ Texto incorrecto. Debe ser exactamente: BORRADO TOTAL
                </Text>
              )}
              {puedeEjecutarBorradoMaestro() && (
                <Text type="success" style={{ fontSize: '12px' }}>
                  ✅ Confirmación correcta. Puedes proceder.
                </Text>
              )}
            </Space>
          }
          type="error"
          showIcon
        />
      </Space>
    </Modal>
  </>
  );
};

export default DataCleanupModal;




