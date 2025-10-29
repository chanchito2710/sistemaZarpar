import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Table,
  Switch,
  message as antMessage,
  Popconfirm,
  InputNumber,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TableOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';

// Tipos de datos MySQL comunes
const DATA_TYPES = [
  'INT', 'BIGINT', 'TINYINT', 'SMALLINT', 'MEDIUMINT',
  'VARCHAR', 'CHAR', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR',
  'DECIMAL', 'FLOAT', 'DOUBLE',
  'BOOLEAN', 'TINYINT(1)',
  'ENUM', 'SET',
  'BLOB', 'MEDIUMBLOB', 'LONGBLOB',
  'JSON'
];

interface Column {
  name: string;
  type: string;
  length?: string;
  notNull: boolean;
  default?: string;
  primaryKey: boolean;
  autoIncrement: boolean;
}

interface TableSchemaManagerProps {
  onSuccess: () => void;
}

export const CreateTableModal: React.FC<TableSchemaManagerProps & { visible: boolean; onCancel: () => void }> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState<Column[]>([{
    name: 'id',
    type: 'INT',
    notNull: true,
    primaryKey: true,
    autoIncrement: true,
  }]);
  const [loading, setLoading] = useState(false);

  const addColumn = () => {
    setColumns([...columns, {
      name: '',
      type: 'VARCHAR',
      length: '255',
      notNull: false,
      primaryKey: false,
      autoIncrement: false,
    }]);
  };

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);
  };

  const updateColumn = (index: number, field: keyof Column, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await axios.post(`${API_URL}/database/tables`, {
        tableName: values.tableName,
        columns: columns,
      });

      if (response.data.success) {
        antMessage.success('Tabla creada exitosamente');
        form.resetFields();
        setColumns([{
          name: 'id',
          type: 'INT',
          notNull: true,
          primaryKey: true,
          autoIncrement: true,
        }]);
        onSuccess();
        onCancel();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Error al crear la tabla';
      antMessage.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const columnTableColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      width: 150,
      render: (value: string, record: Column, index: number) => (
        <Input
          value={value}
          onChange={(e) => updateColumn(index, 'name', e.target.value)}
          placeholder="nombre_columna"
        />
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      width: 150,
      render: (value: string, record: Column, index: number) => (
        <Select
          value={value}
          onChange={(val) => updateColumn(index, 'type', val)}
          style={{ width: '100%' }}
        >
          {DATA_TYPES.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Longitud',
      dataIndex: 'length',
      width: 100,
      render: (value: string, record: Column, index: number) => (
        ['VARCHAR', 'CHAR', 'INT', 'BIGINT', 'DECIMAL'].some(t => record.type.includes(t)) ? (
          <Input
            value={value}
            onChange={(e) => updateColumn(index, 'length', e.target.value)}
            placeholder="255"
          />
        ) : null
      ),
    },
    {
      title: 'NOT NULL',
      dataIndex: 'notNull',
      width: 100,
      render: (value: boolean, record: Column, index: number) => (
        <Switch
          checked={value}
          onChange={(checked) => updateColumn(index, 'notNull', checked)}
        />
      ),
    },
    {
      title: 'PK',
      dataIndex: 'primaryKey',
      width: 80,
      render: (value: boolean, record: Column, index: number) => (
        <Switch
          checked={value}
          onChange={(checked) => {
            // Solo puede haber una PK
            const newColumns = columns.map((col, i) => ({
              ...col,
              primaryKey: i === index ? checked : false
            }));
            setColumns(newColumns);
          }}
        />
      ),
    },
    {
      title: 'Auto Inc',
      dataIndex: 'autoIncrement',
      width: 100,
      render: (value: boolean, record: Column, index: number) => (
        <Switch
          checked={value}
          onChange={(checked) => updateColumn(index, 'autoIncrement', checked)}
          disabled={!['INT', 'BIGINT'].some(t => record.type.includes(t))}
        />
      ),
    },
    {
      title: 'Acciones',
      width: 80,
      render: (_: any, record: Column, index: number) => (
        index > 0 ? (
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => removeColumn(index)}
          />
        ) : null
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <TableOutlined />
          Crear Nueva Tabla
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={1000}
      confirmLoading={loading}
      okText="Crear Tabla"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nombre de la Tabla"
          name="tableName"
          rules={[
            { required: true, message: 'El nombre de la tabla es requerido' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Solo letras, números y guión bajo' },
          ]}
        >
          <Input placeholder="mi_nueva_tabla" />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Space style={{ marginBottom: 8 }}>
            <strong>Columnas:</strong>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addColumn}>
              Agregar Columna
            </Button>
          </Space>
        </div>

        <Table
          dataSource={columns}
          columns={columnTableColumns}
          pagination={false}
          size="small"
          rowKey={(record, index) => index?.toString() || '0'}
          scroll={{ x: 'max-content' }}
        />
      </Form>
    </Modal>
  );
};

interface AddColumnModalProps extends TableSchemaManagerProps {
  visible: boolean;
  onCancel: () => void;
  tableName: string;
  existingColumns: string[];
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  tableName,
  existingColumns,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [columnType, setColumnType] = useState('VARCHAR');

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await axios.post(`${API_URL}/database/tables/${tableName}/columns`, {
        columnName: values.columnName,
        columnType: values.columnType,
        length: values.length,
        notNull: values.notNull || false,
        defaultValue: values.defaultValue,
        afterColumn: values.afterColumn,
      });

      if (response.data.success) {
        antMessage.success('Columna agregada exitosamente');
        form.resetFields();
        onSuccess();
        onCancel();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Error al agregar la columna';
      antMessage.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const needsLength = ['VARCHAR', 'CHAR', 'INT', 'BIGINT', 'DECIMAL'].some(t => columnType.includes(t));

  return (
    <Modal
      title="Agregar Nueva Columna"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Agregar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nombre de la Columna"
          name="columnName"
          rules={[
            { required: true, message: 'El nombre es requerido' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Solo letras, números y guión bajo' },
          ]}
        >
          <Input placeholder="mi_columna" />
        </Form.Item>

        <Form.Item
          label="Tipo de Dato"
          name="columnType"
          initialValue="VARCHAR"
          rules={[{ required: true }]}
        >
          <Select onChange={setColumnType}>
            {DATA_TYPES.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>

        {needsLength && (
          <Form.Item
            label="Longitud"
            name="length"
            rules={[{ required: needsLength, message: 'La longitud es requerida' }]}
          >
            <Input placeholder="255" />
          </Form.Item>
        )}

        <Form.Item
          label="NOT NULL"
          name="notNull"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Valor Por Defecto"
          name="defaultValue"
        >
          <Input placeholder="NULL, CURRENT_TIMESTAMP, o un valor" />
        </Form.Item>

        <Form.Item
          label="Insertar Después de"
          name="afterColumn"
        >
          <Select allowClear placeholder="Al final de la tabla">
            {existingColumns.map(col => (
              <Option key={col} value={col}>{col}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default { CreateTableModal, AddColumnModal };

