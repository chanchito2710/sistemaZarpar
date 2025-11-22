/**
 * 🗄️ GESTOR DE BACKUPS
 * Componente para gestión completa de backups manuales y automáticos
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  List,
  Modal,
  Input,
  Form,
  App,
  Tag,
  Space,
  Row,
  Col,
  Statistic,
  Alert,
  Badge,
  Tooltip,
  Spin,
} from 'antd';
import {
  DatabaseOutlined,
  ReloadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { backupsService } from '../../services/api';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { TextArea } = Input;

interface Backup {
  filename: string;
  tipo: 'automatico' | 'manual';
  nombre_personalizado: string | null;
  nota: string | null;
  tamano_bytes: number;
  tamano_formateado: string;
  creado_por_email: string;
  created_at: string;
  edad_dias: number;
  esUltimoBackup: boolean;
}

interface Estadisticas {
  total_backups: number;
  tamano_total: string;
  ultimo_backup: string;
  automaticos: number;
  manuales: number;
  tamano_bd_actual: string;
  proximo_backup_automatico: string;
}

const BackupsManager: React.FC = () => {
  const { message, modal } = App.useApp();
  
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Cargar backups y estadísticas al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  /**
   * Cargar backups y estadísticas
   */
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [backupsData, statsData] = await Promise.all([
        backupsService.listar(),
        backupsService.obtenerEstadisticas()
      ]);

      setBackups(backupsData.data || []);
      setStats(statsData.data || null);
    } catch (error) {
      message.error('Error al cargar datos de backups');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear backup manual
   */
  const handleCrearBackup = async (values: any) => {
    try {
      setLoading(true);
      await backupsService.crearManual({
        nombre: values.nombre?.trim() || undefined,
        nota: values.nota?.trim() || undefined
      });

      message.success('✅ Backup creado exitosamente');
      setBackupModalVisible(false);
      form.resetFields();
      cargarDatos();
    } catch (error: any) {
      message.error(error.error || 'Error al crear backup');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restaurar backup
   */
  const handleRestaurar = (backup: Backup) => {
    modal.confirm({
      title: '⚠️ ADVERTENCIA CRÍTICA',
      icon: <InfoCircleOutlined style={{ color: '#ff4d4f' }} />,
      width: 600,
      content: (
        <div>
          <Alert
            message="ESTA ACCIÓN SOBRESCRIBIRÁ TODOS LOS DATOS ACTUALES"
            description={
              <div>
                <p><strong>Vas a restaurar la base de datos a:</strong></p>
                <ul>
                  <li><strong>Fecha:</strong> {moment(backup.created_at).format('DD/MM/YYYY - HH:mm:ss')}</li>
                  {backup.nombre_personalizado && (
                    <li><strong>Nombre:</strong> {backup.nombre_personalizado}</li>
                  )}
                  {backup.nota && (
                    <li><strong>Nota:</strong> {backup.nota}</li>
                  )}
                </ul>
                <p style={{ color: '#ff4d4f', fontWeight: 'bold', marginTop: 16 }}>
                  ⚠️ TODOS los datos posteriores a esta fecha SE PERDERÁN.
                </p>
                <p style={{ marginTop: 8 }}>
                  Se recomienda hacer un backup manual antes de restaurar.
                </p>
              </div>
            }
            type="error"
            showIcon
          />
        </div>
      ),
      okText: 'SÍ, RESTAURAR',
      okButtonProps: { danger: true, size: 'large' },
      cancelText: 'Cancelar',
      cancelButtonProps: { size: 'large' },
      onOk: async () => {
        try {
          setLoading(true);
          await backupsService.restaurar(backup.filename);
          message.success('✅ Base de datos restaurada exitosamente');
          
          // Recargar la página después de 2 segundos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error: any) {
          message.error(error.error || 'Error al restaurar backup');
          setLoading(false);
        }
      }
    });
  };

  /**
   * Descargar backup
   */
  const handleDescargar = async (backup: Backup) => {
    try {
      message.loading('Descargando backup...');
      await backupsService.descargar(backup.filename);
      message.success('✅ Backup descargado exitosamente');
    } catch (error) {
      message.error('Error al descargar backup');
    }
  };

  /**
   * Eliminar backup
   */
  const handleEliminar = (backup: Backup) => {
    if (backup.esUltimoBackup) {
      message.warning('No puedes eliminar el último backup disponible');
      return;
    }

    modal.confirm({
      title: '🗑️ Eliminar Backup',
      content: `¿Estás seguro de eliminar el backup "${backup.nombre_personalizado || backup.filename}"?`,
      okText: 'Sí, eliminar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await backupsService.eliminar(backup.filename);
          message.success('Backup eliminado exitosamente');
          cargarDatos();
        } catch (error: any) {
          message.error(error.error || 'Error al eliminar backup');
        }
      }
    });
  };

  return (
    <Spin spinning={loading} tip="Procesando...">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        
        {/* ESTADÍSTICAS */}
        <Card title={<span><InfoCircleOutlined /> Estadísticas</span>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tamaño Base de Datos"
                value={stats?.tamano_bd_actual || '0 MB'}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Total Backups"
                value={stats?.total_backups || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Último Backup"
                value={stats?.ultimo_backup ? moment(stats.ultimo_backup).fromNow() : 'N/A'}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Próximo Automático"
                value={stats?.proximo_backup_automatico ? moment(stats.proximo_backup_automatico).format('HH:mm') : 'N/A'}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Alert
                message="ℹ️ Información"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Los backups se guardan por <strong>7 días máximo</strong></li>
                    <li>Los backups automáticos se ejecutan <strong>diariamente a las 3:00 AM</strong></li>
                    <li>Espacio utilizado: <strong>{stats?.tamano_total || '0 MB'}</strong></li>
                    <li>Backups automáticos: <strong>{stats?.automaticos || 0}</strong> | Manuales: <strong>{stats?.manuales || 0}</strong></li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </Card>

        {/* ACCIONES DE EMERGENCIA */}
        <Card title={<span>🚨 Acciones de Emergencia</span>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Button
                type="primary"
                size="large"
                block
                icon={<DatabaseOutlined />}
                onClick={() => setBackupModalVisible(true)}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  height: 60,
                  fontSize: 18,
                  fontWeight: 'bold'
                }}
              >
                ⚫ BACKUP DEL SISTEMA
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                size="large"
                block
                icon={<ReloadOutlined />}
                onClick={cargarDatos}
                style={{ height: 60, fontSize: 16 }}
              >
                🔄 Actualizar Lista
              </Button>
            </Col>
          </Row>
        </Card>

        {/* LISTA DE BACKUPS */}
        <Card 
          title={<span><FileTextOutlined /> Backups Disponibles (Últimos 7 días)</span>}
          extra={
            <Tag color="blue">
              {backups.length} {backups.length === 1 ? 'backup' : 'backups'}
            </Tag>
          }
        >
          {backups.length === 0 ? (
            <Alert
              message="No hay backups disponibles"
              description="Crea tu primer backup haciendo click en el botón verde."
              type="warning"
              showIcon
            />
          ) : (
            <List
              dataSource={backups}
              renderItem={(backup) => (
                <List.Item
                  actions={[
                    <Tooltip title="Restaurar este backup">
                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={() => handleRestaurar(backup)}
                      >
                        Restaurar
                      </Button>
                    </Tooltip>,
                    <Tooltip title="Descargar archivo SQL">
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => handleDescargar(backup)}
                      >
                        Descargar
                      </Button>
                    </Tooltip>,
                    <Tooltip title={backup.esUltimoBackup ? 'No puedes eliminar el último backup' : 'Eliminar backup'}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleEliminar(backup)}
                        disabled={backup.esUltimoBackup}
                      >
                        Eliminar
                      </Button>
                    </Tooltip>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        status={backup.tipo === 'automatico' ? 'processing' : 'success'}
                        dot
                      >
                        {backup.tipo === 'automatico' ? (
                          <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        ) : (
                          <UserOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                        )}
                      </Badge>
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {backup.nombre_personalizado || backup.filename}
                        </span>
                        <Tag color={backup.tipo === 'automatico' ? 'blue' : 'green'}>
                          {backup.tipo === 'automatico' ? '🤖 Automático' : '👤 Manual'}
                        </Tag>
                        {backup.esUltimoBackup && (
                          <Tag color="gold">⭐ Más Reciente</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div style={{ fontSize: 13 }}>
                        <div style={{ marginBottom: 4 }}>
                          📅 <strong>{moment(backup.created_at).format('DD/MM/YYYY - HH:mm:ss')}</strong>
                          {' '}
                          <span style={{ color: '#888' }}>
                            ({moment(backup.created_at).fromNow()})
                          </span>
                          {' | '}
                          💾 <strong>{backup.tamano_formateado}</strong>
                          {backup.tipo === 'manual' && backup.creado_por_email && (
                            <>
                              {' | '}
                              👤 {backup.creado_por_email}
                            </>
                          )}
                        </div>
                        {backup.nota && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: 8,
                              backgroundColor: '#f5f5f5',
                              borderRadius: 4,
                              borderLeft: '3px solid #1890ff'
                            }}
                          >
                            <Text type="secondary">
                              📝 <em>{backup.nota}</em>
                            </Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* MODAL CREAR BACKUP MANUAL */}
        <Modal
          title={<span style={{ fontSize: 18 }}>⚫ Crear Backup Manual del Sistema</span>}
          open={backupModalVisible}
          onCancel={() => {
            setBackupModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCrearBackup}
          >
            <Form.Item
              label={<span style={{ fontWeight: 'bold' }}>📝 Nombre del Backup (opcional)</span>}
              name="nombre"
            >
              <Input
                placeholder="Ej: Antes de actualizar precios"
                maxLength={255}
                showCount
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 'bold' }}>📋 Nota o Descripción (opcional)</span>}
              name="nota"
            >
              <TextArea
                placeholder="Ej: Backup preventivo antes de modificar estructura de productos"
                rows={4}
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Alert
              message="ℹ️ Información"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>El backup incluirá <strong>TODA la base de datos</strong></li>
                  <li>Se guardará por <strong>7 días máximo</strong></li>
                  <li>Los backups más antiguos se eliminarán automáticamente</li>
                  <li>Tiempo estimado: 10-30 segundos</li>
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setBackupModalVisible(false);
                  form.resetFields();
                }}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<DatabaseOutlined />}
                  style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a'
                  }}
                >
                  ⚫ Crear Backup
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Spin>
  );
};

export default BackupsManager;

