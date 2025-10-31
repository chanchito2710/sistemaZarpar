import React from 'react';
import { Card, Table, Button, InputNumber, Space, Typography, Popconfirm, Empty, Divider } from 'antd';
import { DeleteOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;

export interface ProductoCarrito {
  producto_id: number;
  nombre: string;
  codigo_barras?: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  stock_disponible: number;
}

interface POSCartProps {
  productos: ProductoCarrito[];
  onCantidadChange: (producto_id: number, cantidad: number) => void;
  onEliminar: (producto_id: number) => void;
  subtotal: number;
  descuento: number;
  total: number;
}

const POSCart: React.FC<POSCartProps> = ({
  productos,
  onCantidadChange,
  onEliminar,
  subtotal,
  descuento,
  total
}) => {
  const columns: ColumnsType<ProductoCarrito> = [
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text: string, record: ProductoCarrito) => (
        <div>
          <Text strong>{text}</Text>
          {record.codigo_barras && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.codigo_barras}
              </Text>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      align: 'right' as const,
      render: (precio: number) => (
        <Text>${precio.toFixed(2)}</Text>
      )
    },
    {
      title: 'Cantidad',
      key: 'cantidad',
      width: 150,
      render: (_: any, record: ProductoCarrito) => (
        <Space>
          <Button
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => onCantidadChange(record.producto_id, record.cantidad - 1)}
            disabled={record.cantidad <= 1}
          />
          <InputNumber
            size="small"
            min={1}
            max={record.stock_disponible}
            value={record.cantidad}
            onChange={(value) => onCantidadChange(record.producto_id, value || 1)}
            style={{ width: 60 }}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onCantidadChange(record.producto_id, record.cantidad + 1)}
            disabled={record.cantidad >= record.stock_disponible}
          />
        </Space>
      )
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: (subtotal: number) => (
        <Text strong>${subtotal.toFixed(2)}</Text>
      )
    },
    {
      title: '',
      key: 'acciones',
      width: 50,
      render: (_: any, record: ProductoCarrito) => (
        <Popconfirm
          title="¿Eliminar producto?"
          onConfirm={() => onEliminar(record.producto_id)}
          okText="Sí"
          cancelText="No"
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  if (productos.length === 0) {
    return (
      <Card>
        <Empty
          description="El carrito está vacío"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card title="🛒 Carrito de Compras">
      <Table
        columns={columns}
        dataSource={productos}
        rowKey="producto_id"
        pagination={false}
        size="small"
        scroll={{ x: 600 }}
      />

      <Divider />

      {/* Resumen de totales */}
      <div style={{ textAlign: 'right' }}>
        <Space direction="vertical" size="small" style={{ width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Subtotal:</Text>
            <Text style={{ fontSize: '16px' }}>${subtotal.toFixed(2)}</Text>
          </div>
          
          {descuento > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="danger">Descuento:</Text>
              <Text type="danger" style={{ fontSize: '16px' }}>
                -${descuento.toFixed(2)}
              </Text>
            </div>
          )}

          <Divider style={{ margin: '8px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>TOTAL:</Title>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
              ${total.toFixed(2)}
            </Title>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default POSCart;

