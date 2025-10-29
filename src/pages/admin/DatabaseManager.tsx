import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  Input,
  Modal,
  Form,
  App,
  Tooltip,
  Tag,
  Typography,
  Descriptions,
  Row,
  Col,
  Statistic,
  Badge,
  Drawer,
  Popconfirm,
} from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { CreateTableModal, AddColumnModal } from './TableSchemaManager';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';

interface TableInfo {
  name: string;
  recordCount?: number;
}

interface ColumnInfo {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: any;
  Extra: string;
}

interface TableStructure {
  tableName: string;
  columns: ColumnInfo[];
  recordCount: number;
}

const DatabaseManager: React.FC = () => {
  const { message } = App.useApp();
  
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableStructure, setTableStructure] = useState<TableStructure | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isStructureDrawerVisible, setIsStructureDrawerVisible] = useState(false);
  const [isCreateTableModalVisible, setIsCreateTableModalVisible] = useState(false);
  const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  
  const [form] = Form.useForm();

  // Cargar lista de tablas al montar
  useEffect(() => {
    loadTables();
  }, []);

  // Cargar registros cuando cambie la tabla o paginación
  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [selectedTable, pagination.current, pagination.pageSize, searchText]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/database/tables`);
      if (response.data.success) {
        setTables(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedTable(response.data.data[0]);
        }
      }
    } catch (error) {
      message.error('Error al cargar las tablas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableStructure = async (tableName: string) => {
    try {
      const response = await axios.get(`${API_URL}/database/tables/${tableName}/structure`);
      if (response.data.success) {
        setTableStructure(response.data.data);
      }
    } catch (error) {
      message.error('Error al cargar la estructura de la tabla');
      console.error(error);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;

    try {
      setLoading(true);
      await loadTableStructure(selectedTable);
      
      const response = await axios.get(`${API_URL}/database/tables/${selectedTable}/records`, {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText,
        },
      });

      if (response.data.success) {
        setRecords(response.data.data);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      message.error('Error al cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (value: string) => {
    setSelectedTable(value);
    setPagination({ ...pagination, current: 1 });
    setSearchText('');
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleEdit = (record: any) => {
    setCurrentRecord(record);
    
    // Formatear fechas para inputs de tipo date
    const formattedRecord = { ...record };
    if (tableStructure) {
      tableStructure.columns.forEach(col => {
        if ((col.Type.includes('date') || col.Type.includes('timestamp')) && formattedRecord[col.Field]) {
          const date = new Date(formattedRecord[col.Field]);
          if (!isNaN(date.getTime())) {
            // Formatear como yyyy-MM-dd
            formattedRecord[col.Field] = date.toISOString().split('T')[0];
          }
        }
      });
    }
    
    form.setFieldsValue(formattedRecord);
    setIsEditModalVisible(true);
  };

  const handleCreate = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(
        `${API_URL}/database/tables/${selectedTable}/records/${id}`
      );
      
      if (response.data.success) {
        message.success(response.data.message);
        loadTableData();
      }
    } catch (error) {
      message.error('Error al eliminar el registro');
      console.error(error);
    }
  };

  const handleDeleteTable = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/database/tables/${selectedTable}`
      );
      
      if (response.data.success) {
        message.success(response.data.message);
        loadTables();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Error al eliminar la tabla';
      message.error(errorMsg);
    }
  };

  const handleDeleteColumn = async (columnName: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/database/tables/${selectedTable}/columns/${columnName}`
      );
      
      if (response.data.success) {
        message.success(response.data.message);
        loadTableData();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Error al eliminar la columna';
      message.error(errorMsg);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Limpiar campos que no se deben enviar
      const cleanedValues = { ...values };
      delete cleanedValues.id;
      delete cleanedValues.created_at;
      delete cleanedValues.updated_at;
      
      const response = await axios.put(
        `${API_URL}/database/tables/${selectedTable}/records/${currentRecord.id}`,
        cleanedValues
      );

      if (response.data.success) {
        message.success('Registro actualizado exitosamente');
        setIsEditModalVisible(false);
        // Forzar recarga con un pequeño delay
        setTimeout(() => {
          loadTableData();
        }, 100);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Error al actualizar el registro';
      message.error(errorMsg);
      console.error('Error completo:', error.response?.data);
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Limpiar campos que no se deben enviar
      const cleanedValues = { ...values };
      delete cleanedValues.id;
      delete cleanedValues.created_at;
      delete cleanedValues.updated_at;
      
      const response = await axios.post(
        `${API_URL}/database/tables/${selectedTable}/records`,
        cleanedValues
      );

      if (response.data.success) {
        message.success('Registro creado exitosamente');
        setIsCreateModalVisible(false);
        // Forzar recarga con un pequeño delay
        setTimeout(() => {
          loadTableData();
        }, 100);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Error al crear el registro';
      message.error(errorMsg);
      console.error('Error completo:', error.response?.data);
    }
  };

  const renderFormFields = (columns: ColumnInfo[], isEdit: boolean = false) => {
    return columns
      .filter(col => col.Field !== 'id' && !col.Extra.includes('auto_increment'))
      .filter(col => !['created_at', 'updated_at'].includes(col.Field))
      .map(col => {
        const isRequired = col.Null === 'NO' && !col.Default && col.Field !== 'activo';
        const isReadOnly = isEdit && col.Key === 'PRI';

        return (
          <Form.Item
            key={col.Field}
            label={col.Field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            name={col.Field}
            rules={[
              {
                required: isRequired,
                message: `${col.Field} es requerido`,
              },
            ]}
          >
            {col.Type.includes('text') ? (
              <TextArea rows={3} disabled={isReadOnly} placeholder={`Ingrese ${col.Field}`} />
            ) : col.Type.includes('date') || col.Type.includes('timestamp') ? (
              <Input type="date" disabled={isReadOnly} />
            ) : col.Type.includes('tinyint') && col.Field === 'activo' ? (
              <Select disabled={isReadOnly} placeholder="Seleccione estado">
                <Option value={1}>Activo</Option>
                <Option value={0}>Inactivo</Option>
              </Select>
            ) : col.Type.includes('int') ? (
              <Input type="number" disabled={isReadOnly} placeholder={`Ingrese ${col.Field}`} />
            ) : (
              <Input disabled={isReadOnly} placeholder={`Ingrese ${col.Field}`} />
            )}
          </Form.Item>
        );
      });
  };

  // Generar columnas dinámicas para la tabla
  const tableColumns = tableStructure?.columns.map(col => ({
    title: col.Field,
    dataIndex: col.Field,
    key: col.Field,
    ellipsis: true,
    render: (text: any) => {
      if (col.Field === 'activo') {
        return text === 1 || text === true ? (
          <Badge status="success" text="Activo" />
        ) : (
          <Badge status="default" text="Inactivo" />
        );
      }
      if (col.Type.includes('date') || col.Type.includes('timestamp')) {
        return text ? new Date(text).toLocaleString() : '-';
      }
      if (col.Type.includes('text') && text && text.length > 50) {
        return <Tooltip title={text}>{text.substring(0, 50)}...</Tooltip>;
      }
      return text || '-';
    },
  })) || [];

  // Agregar columna de acciones
  (tableColumns as any).push({
    title: 'Acciones',
    key: 'actions',
    fixed: 'right',
    width: 150,
    render: (_: any, record: any) => (
      <Space size="small">
        <Tooltip title="Editar">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Eliminar">
          <Popconfirm
            title="⚠️ ELIMINAR PERMANENTEMENTE"
            description="Esta acción NO se puede deshacer. El registro se borrará para siempre."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  });

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
          <DatabaseOutlined style={{ marginRight: '12px' }} />
          Administrador de Base de Datos
        </Title>
        <Text style={{ fontSize: '16px', color: '#6b7280' }}>
          Visualiza y gestiona las tablas de tu base de datos
        </Text>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total de Tablas"
              value={tables.length}
              prefix={<TableOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Registros en Tabla Actual"
              value={tableStructure?.recordCount || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Columnas"
              value={tableStructure?.columns.length || 0}
              prefix={<InfoCircleOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controles */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>Seleccionar Tabla</Text>
                <Select
                  style={{ width: '100%' }}
                  value={selectedTable}
                  onChange={handleTableChange}
                  loading={loading}
                  suffixIcon={<TableOutlined />}
                >
                  {tables.map(table => (
                    <Option key={table} value={table}>
                      {table}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>Buscar</Text>
                <Input
                  placeholder="Buscar en todos los campos..."
                  prefix={<SearchOutlined />}
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchText}
                  allowClear
                />
              </Space>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  icon={<InfoCircleOutlined />}
                  onClick={() => setIsStructureDrawerVisible(true)}
                >
                  Ver Estructura
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadTableData}
                  loading={loading}
                >
                  Refrescar
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Nuevo Registro
                </Button>
              </Space>
            </Col>
          </Row>

          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  icon={<ColumnHeightOutlined />}
                  onClick={() => setIsAddColumnModalVisible(true)}
                  type="dashed"
                >
                  Agregar Columna
                </Button>
                <Button
                  icon={<PlusCircleOutlined />}
                  onClick={() => setIsCreateTableModalVisible(true)}
                  type="dashed"
                >
                  Crear Tabla Nueva
                </Button>
                <Popconfirm
                  title="¿Estás seguro de eliminar esta tabla?"
                  description="Esta acción no se puede deshacer. Se perderán todos los datos."
                  onConfirm={handleDeleteTable}
                  okText="Sí, eliminar"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                  >
                    Eliminar Tabla
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Tabla de datos */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Table
          columns={tableColumns}
          dataSource={records}
          rowKey={(record) => `${selectedTable}-${record.id}-${record.updated_at || Date.now()}`}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal de Edición */}
      <Modal
        title={`Editar Registro - ${selectedTable}`}
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          {tableStructure && renderFormFields(tableStructure.columns, true)}
        </Form>
      </Modal>

      {/* Modal de Creación */}
      <Modal
        title={`Nuevo Registro - ${selectedTable}`}
        open={isCreateModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalVisible(false)}
        width={600}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          {tableStructure && renderFormFields(tableStructure.columns, false)}
        </Form>
      </Modal>

      {/* Drawer de Estructura */}
      <Drawer
        title={`Estructura de ${selectedTable}`}
        placement="right"
        onClose={() => setIsStructureDrawerVisible(false)}
        open={isStructureDrawerVisible}
        width={600}
      >
        {tableStructure && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Statistic
                title="Total de Registros"
                value={tableStructure.recordCount}
                prefix={<DatabaseOutlined />}
              />
            </Card>

            <div>
              <Title level={4}>Columnas</Title>
              {tableStructure.columns.map(col => (
                <Card key={col.Field} size="small" style={{ marginBottom: '8px' }}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Campo">
                      <Text strong>{col.Field}</Text>
                      {col.Key === 'PRI' && (
                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                          PRIMARY KEY
                        </Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tipo">{col.Type}</Descriptions.Item>
                    <Descriptions.Item label="Nulo">
                      {col.Null === 'YES' ? (
                        <Tag color="orange">Nullable</Tag>
                      ) : (
                        <Tag color="red">NOT NULL</Tag>
                      )}
                    </Descriptions.Item>
                    {col.Default && (
                      <Descriptions.Item label="Default">{col.Default}</Descriptions.Item>
                    )}
                    {col.Extra && (
                      <Descriptions.Item label="Extra">{col.Extra}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Acciones">
                      {!['id', 'created_at', 'updated_at'].includes(col.Field) && (
                        <Popconfirm
                          title={`¿Eliminar columna ${col.Field}?`}
                          description="Esta acción no se puede deshacer"
                          onConfirm={() => handleDeleteColumn(col.Field)}
                          okText="Sí, eliminar"
                          cancelText="No"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                          >
                            Eliminar
                          </Button>
                        </Popconfirm>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))}
            </div>
          </Space>
        )}
      </Drawer>

      {/* Modal para Crear Tabla */}
      <CreateTableModal
        visible={isCreateTableModalVisible}
        onCancel={() => setIsCreateTableModalVisible(false)}
        onSuccess={() => {
          loadTables();
          setIsCreateTableModalVisible(false);
        }}
      />

      {/* Modal para Agregar Columna */}
      <AddColumnModal
        visible={isAddColumnModalVisible}
        onCancel={() => setIsAddColumnModalVisible(false)}
        onSuccess={() => {
          loadTableData();
          setIsAddColumnModalVisible(false);
        }}
        tableName={selectedTable}
        existingColumns={tableStructure?.columns.map(col => col.Field) || []}
      />
    </div>
  );
};

export default DatabaseManager;

