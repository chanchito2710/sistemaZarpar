import React, { useState, useMemo } from 'react';
import {
  Card,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Badge,
  Tooltip,
  Modal,
  InputNumber,
  message
} from 'antd';
import {
  InboxOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  ShopOutlined,
  MobileOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRANCHES } from '../../data/branches';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

const { Title, Text } = Typography;
const { Option } = Select;

interface InventoryItem {
  key: string;
  sucursal: string;
  marca: string;
  modelo: string;
  producto: string;
  stock: number;
  recibidos: number;
  categoria: string;
}

const Inventory: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [sortedInfo, setSortedInfo] = useState<any>({});

  // Datos de ejemplo realistas
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([
    // Maldonado
    { key: '1', sucursal: 'Maldonado', marca: 'iPhone', modelo: '14', producto: 'Pantalla iPhone 14', stock: 15, recibidos: 5, categoria: 'Pantallas' },
    { key: '2', sucursal: 'Maldonado', marca: 'iPhone', modelo: '13', producto: 'Pantalla iPhone 13', stock: 8, recibidos: 3, categoria: 'Pantallas' },
    { key: '3', sucursal: 'Maldonado', marca: 'Samsung', modelo: 'A54', producto: 'Pantalla Samsung A54', stock: 12, recibidos: 0, categoria: 'Pantallas' },
    { key: '4', sucursal: 'Maldonado', marca: 'iPhone', modelo: '14', producto: 'Batería iPhone 14', stock: 20, recibidos: 8, categoria: 'Baterías' },
    { key: '5', sucursal: 'Maldonado', marca: 'Xiaomi', modelo: 'Redmi Note 12', producto: 'Carcasa Xiaomi Redmi Note 12', stock: 25, recibidos: 0, categoria: 'Carcasas' },
    
    // Montevideo
    { key: '6', sucursal: 'Montevideo', marca: 'iPhone', modelo: '15', producto: 'Pantalla iPhone 15', stock: 30, recibidos: 10, categoria: 'Pantallas' },
    { key: '7', sucursal: 'Montevideo', marca: 'Samsung', modelo: 'S23', producto: 'Pantalla Samsung S23', stock: 18, recibidos: 5, categoria: 'Pantallas' },
    { key: '8', sucursal: 'Montevideo', marca: 'Huawei', modelo: 'P40', producto: 'Batería Huawei P40', stock: 15, recibidos: 0, categoria: 'Baterías' },
    { key: '9', sucursal: 'Montevideo', marca: 'iPhone', modelo: '13 Pro', producto: 'Flex iPhone 13 Pro', stock: 10, recibidos: 4, categoria: 'Flex' },
    { key: '10', sucursal: 'Montevideo', marca: 'Samsung', modelo: 'A34', producto: 'Cargador Samsung A34', stock: 22, recibidos: 0, categoria: 'Cargadores' },
    
    // Punta del Este
    { key: '11', sucursal: 'Punta del Este', marca: 'iPhone', modelo: '12', producto: 'Pantalla iPhone 12', stock: 6, recibidos: 8, categoria: 'Pantallas' },
    { key: '12', sucursal: 'Punta del Este', marca: 'Xiaomi', modelo: 'Mi 11', producto: 'Batería Xiaomi Mi 11', stock: 14, recibidos: 2, categoria: 'Baterías' },
    { key: '13', sucursal: 'Punta del Este', marca: 'TCL', modelo: '20 Pro', producto: 'Pantalla TCL 20 Pro', stock: 5, recibidos: 0, categoria: 'Pantallas' },
    { key: '14', sucursal: 'Punta del Este', marca: 'ZTE', modelo: 'Blade A7', producto: 'Carcasa ZTE Blade A7', stock: 18, recibidos: 3, categoria: 'Carcasas' },
    { key: '15', sucursal: 'Punta del Este', marca: 'iPhone', modelo: '11', producto: 'Herramientas Reparación', stock: 50, recibidos: 0, categoria: 'Herramientas' },
    
    // Más productos distribuidos
    { key: '16', sucursal: 'Maldonado', marca: 'Samsung', modelo: 'A14', producto: 'Hidrogel Samsung A14', stock: 35, recibidos: 15, categoria: 'Hidrogel' },
    { key: '17', sucursal: 'Casa Matriz', marca: 'iPhone', modelo: '14 Pro', producto: 'Tapa Trasera iPhone 14 Pro', stock: 8, recibidos: 0, categoria: 'Tapa Trasera' },
    { key: '18', sucursal: 'Tacuarembó', marca: 'Xiaomi', modelo: 'Poco X5', producto: 'Pin de Carga Xiaomi Poco X5', stock: 12, recibidos: 6, categoria: 'Pin de Carga' },
    { key: '19', sucursal: 'Maldonado', marca: 'Huawei', modelo: 'Y9', producto: 'Flex Huawei Y9', stock: 7, recibidos: 0, categoria: 'Flex' },
    { key: '20', sucursal: 'Casa Matriz', marca: 'Samsung', modelo: 'S22', producto: 'Batería Samsung S22', stock: 16, recibidos: 4, categoria: 'Baterías' }
  ]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return inventoryData.filter(item => {
      const matchesSearch = searchText === '' || 
        item.producto.toLowerCase().includes(searchText.toLowerCase()) ||
        item.marca.toLowerCase().includes(searchText.toLowerCase()) ||
        item.modelo.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesBrand = selectedBrand === 'all' || item.marca === selectedBrand;
      const matchesCategory = selectedCategory === 'all' || item.categoria === selectedCategory;
      
      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [inventoryData, searchText, selectedBrand, selectedCategory]);

  // Calcular totales de recibidos
  const totalRecibidos = inventoryData.reduce((sum, item) => sum + item.recibidos, 0);
  const recibidosPorSucursal = inventoryData.reduce((acc, item) => {
    acc[item.sucursal] = (acc[item.sucursal] || 0) + item.recibidos;
    return acc;
  }, {} as Record<string, number>);

  // Función para transferir de recibidos a stock
  const handleTransfer = () => {
    if (!selectedItem || transferQuantity <= 0 || transferQuantity > selectedItem.recibidos) {
      message.error('Cantidad inválida');
      return;
    }

    setInventoryData(prev => prev.map(item => {
      if (item.key === selectedItem.key) {
        return {
          ...item,
          stock: item.stock + transferQuantity,
          recibidos: item.recibidos - transferQuantity
        };
      }
      return item;
    }));

    message.success(`${transferQuantity} unidades transferidas a stock`);
    setTransferModalVisible(false);
    setSelectedItem(null);
    setTransferQuantity(0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Aplicar ordenamiento si existe
    let dataForPDF = [...filteredData];
    if (sortedInfo.columnKey && sortedInfo.order) {
      dataForPDF.sort((a, b) => {
        const aValue = a[sortedInfo.columnKey as keyof InventoryItem];
        const bValue = b[sortedInfo.columnKey as keyof InventoryItem];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortedInfo.order === 'ascend' ? comparison : -comparison;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          const comparison = aValue - bValue;
          return sortedInfo.order === 'ascend' ? comparison : -comparison;
        }
        return 0;
      });
    }
    
    // Configurar fuente y título
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Inventario Zarpar - Reporte Completo', 20, 25);
    
    // Fecha de generación
    doc.setFontSize(12);
    doc.setTextColor(100);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generado el: ${currentDate}`, 20, 35);
    
    // Resumen
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Resumen:', 20, 50);
    doc.setFontSize(11);
    doc.text(`Total de productos: ${dataForPDF.length}`, 25, 58);
    doc.text(`Stock total: ${dataForPDF.reduce((sum, item) => sum + item.stock, 0)}`, 25, 65);
    doc.text(`Productos recibidos: ${dataForPDF.reduce((sum, item) => sum + item.recibidos, 0)}`, 25, 72);
    
    // Preparar datos para la tabla
    const tableData = dataForPDF.map(item => [
      item.sucursal,
      item.marca,
      item.modelo,
      item.producto,
      item.stock.toString(),
      item.recibidos.toString()
    ]);
    
    // Configurar tabla
    autoTable(doc, {
      head: [['Sucursal', 'Marca', 'Modelo', 'Producto', 'Stock', 'Recibidos']],
      body: tableData,
      startY: 85,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [114, 46, 209], // Color morado
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Sucursal
        1: { cellWidth: 25 }, // Marca
        2: { cellWidth: 30 }, // Modelo
        3: { cellWidth: 40 }, // Producto
        4: { cellWidth: 20, halign: 'center' }, // Stock
        5: { cellWidth: 25, halign: 'center' } // Recibidos
      },
      margin: { left: 20, right: 20 }
    });
    
    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Sistema Zarpar`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Guardar PDF
    doc.save(`inventario-zarpar-${new Date().toISOString().split('T')[0]}.pdf`);
    message.success('PDF generado exitosamente');
  };

  const columns = [
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      width: 120,
      render: (sucursal: string) => (
        <Tag color="blue" icon={<ShopOutlined />}>
          {sucursal}
        </Tag>
      ),
      filters: BRANCHES.map(branch => ({ text: branch.name, value: branch.name })),
      onFilter: (value: any, record: InventoryItem) => record.sucursal === value
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 100,
      render: (marca: string) => {
        const brandColors: Record<string, string> = {
          'iPhone': '#007AFF',
          'Samsung': '#1428A0',
          'Xiaomi': '#FF6900',
          'Huawei': '#FF0000',
          'TCL': '#0066CC',
          'ZTE': '#00A651'
        };
        return (
          <Tag color={brandColors[marca] || 'default'} icon={<MobileOutlined />}>
            {marca}
          </Tag>
        );
      },
      sorter: (a: InventoryItem, b: InventoryItem) => a.marca.localeCompare(b.marca)
    },
    {
      title: 'Modelo',
      dataIndex: 'modelo',
      key: 'modelo',
      width: 120,
      render: (modelo: string) => (
        <Text strong style={{ color: '#1f2937' }}>{modelo}</Text>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'producto',
      key: 'producto',
      width: 200,
      render: (producto: string, record: InventoryItem) => {
        const categoryIcons: Record<string, React.ReactNode> = {
          'Pantallas': <MobileOutlined style={{ color: '#1890ff' }} />,
          'Baterías': <ThunderboltOutlined style={{ color: '#52c41a' }} />,
          'Carcasas': <InboxOutlined style={{ color: '#722ed1' }} />,
          'Herramientas': <ToolOutlined style={{ color: '#fa8c16' }} />,
          'Flex': <ArrowRightOutlined style={{ color: '#eb2f96' }} />,
          'Cargadores': <PlusOutlined style={{ color: '#13c2c2' }} />,
          'Hidrogel': <FilterOutlined style={{ color: '#faad14' }} />,
          'Tapa Trasera': <InboxOutlined style={{ color: '#f5222d' }} />,
          'Pin de Carga': <PlusOutlined style={{ color: '#a0d911' }} />
        };
        return (
          <Space>
            {categoryIcons[record.categoria] || <InboxOutlined />}
            <Text>{producto}</Text>
          </Space>
        );
      },
      sorter: (a: InventoryItem, b: InventoryItem) => a.producto.localeCompare(b.producto)
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => {
        const color = stock < 10 ? 'red' : stock < 20 ? 'orange' : 'green';
        return (
          <Badge 
            count={stock} 
            style={{ backgroundColor: color }}
            overflowCount={999}
          />
        );
      },
      sorter: (a: InventoryItem, b: InventoryItem) => a.stock - b.stock
    },
    {
      title: 'Recibidos',
      dataIndex: 'recibidos',
      key: 'recibidos',
      width: 100,
      render: (recibidos: number, record: InventoryItem) => (
        <Space>
          <Badge 
            count={recibidos} 
            style={{ backgroundColor: recibidos > 0 ? '#1890ff' : '#d9d9d9' }}
            overflowCount={999}
          />
          {recibidos > 0 && (
            <Tooltip title="Transferir a Stock">
              <Button 
                type="link" 
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  setSelectedItem(record);
                  setTransferQuantity(recibidos);
                  setTransferModalVisible(true);
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
      sorter: (a: InventoryItem, b: InventoryItem) => a.recibidos - b.recibidos
    }
  ];

  return (
    <div className="fade-in">
      {/* Header con información de recibidos */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <InboxOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          Inventario Zarpar
        </Title>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} sm={8}>
            <Card size="small" className="hover-lift">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>{totalRecibidos}</Title>
                <Text type="secondary">Total Recibidos</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={16}>
            <Card size="small" className="hover-lift">
              <Text strong>Recibidos por Sucursal: </Text>
              <Space wrap>
                {Object.entries(recibidosPorSucursal).map(([sucursal, cantidad]) => (
                  <Tag key={sucursal} color="processing">
                    {sucursal}: {cantidad}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Párrafo explicativo */}
      <Card className="hover-lift" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
          <strong>Gestión de Inventario:</strong> Esta sección permite controlar el stock y los productos recibidos en todas las sucursales. 
          Los <strong>productos recibidos</strong> son mercaderías enviadas a cada sucursal que requieren confirmación antes de ser agregadas al stock oficial. 
          Utilice los filtros para localizar productos específicos por marca o categoría, y transfiera los productos recibidos al stock una vez verificados.
        </Text>
      </Card>

      {/* Filtros y búsqueda */}
      <Card className="hover-lift" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Buscar producto, marca o modelo..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={5}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, color: '#1890ff' }}>Marca</Text>
              <Select
                placeholder="Marca"
                value={selectedBrand}
                onChange={setSelectedBrand}
                style={{ width: '100%' }}
              >
                <Option value="all">Todas</Option>
                <Option value="iPhone">iPhone</Option>
                <Option value="Samsung">Samsung</Option>
                <Option value="Xiaomi">Xiaomi</Option>
                <Option value="Huawei">Huawei</Option>
                <Option value="TCL">TCL</Option>
                <Option value="ZTE">ZTE</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={5}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, color: '#1890ff' }}>Producto</Text>
              <Select
                placeholder="Categoría"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
              >
              <Option value="all">Todas</Option>
              <Option value="Pantallas">Pantallas</Option>
              <Option value="Baterías">Baterías</Option>
              <Option value="Carcasas">Carcasas</Option>
              <Option value="Herramientas">Herramientas</Option>
              <Option value="Flex">Flex</Option>
              <Option value="Cargadores">Cargadores</Option>
              <Option value="Hidrogel">Hidrogel</Option>
              <Option value="Tapa Trasera">Tapa Trasera</Option>
              <Option value="Pin de Carga">Pin de Carga</Option>
            </Select>
            </div>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="primary" 
              icon={<FilterOutlined />}
              onClick={() => {
                setSearchText('');
                setSelectedBrand('all');
                setSelectedCategory('all');
              }}
              style={{ width: '100%' }}
            >
              Limpiar Filtros
            </Button>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="default" 
              icon={<FilePdfOutlined />}
              onClick={generatePDF}
              style={{ 
                width: '100%',
                borderColor: '#722ed1',
                color: '#722ed1'
              }}
            >
              Imprimir PDF
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla principal */}
      <Card 
        title={`Inventario (${filteredData.length} productos)`}
        className="hover-lift"
        extra={
          <Space>
            <Text type="secondary">
              Stock Total: {filteredData.reduce((sum, item) => sum + item.stock, 0)}
            </Text>
            <Text type="secondary">
              Recibidos: {filteredData.reduce((sum, item) => sum + item.recibidos, 0)}
            </Text>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={filteredData}
          pagination={{ 
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`
          }}
          scroll={{ x: 800 }}
          size="middle"
          onChange={(pagination, filters, sorter) => {
            setSortedInfo(sorter);
          }}
        />
      </Card>

      {/* Modal para transferir de recibidos a stock */}
      <Modal
        title="Transferir a Stock"
        open={transferModalVisible}
        onOk={handleTransfer}
        onCancel={() => {
          setTransferModalVisible(false);
          setSelectedItem(null);
          setTransferQuantity(0);
        }}
        okText="Transferir"
        cancelText="Cancelar"
      >
        {selectedItem && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text><strong>Producto:</strong> {selectedItem.producto}</Text>
            <Text><strong>Sucursal:</strong> {selectedItem.sucursal}</Text>
            <Text><strong>Recibidos disponibles:</strong> {selectedItem.recibidos}</Text>
            <div>
              <Text>Cantidad a transferir:</Text>
              <InputNumber
                min={1}
                max={selectedItem.recibidos}
                value={transferQuantity}
                onChange={(value) => setTransferQuantity(value || 0)}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;