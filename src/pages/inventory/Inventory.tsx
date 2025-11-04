import React, { useState, useMemo, useEffect } from 'react';
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
import { productosService } from '../../services/api';
import './Inventory.css';

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
  const [selectedSucursal, setSelectedSucursal] = useState<string>('pando'); // Por defecto Pando
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transferQuantity, setTransferQuantity] = useState(0);
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

  // Datos de inventario desde la BD
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  
  // Estados para marcas y modelos dinámicos
  const [marcasDisponibles, setMarcasDisponibles] = useState<string[]>([]);
  const [modelosDisponibles, setModelosDisponibles] = useState<string[]>([]);

  // Cargar sucursales disponibles
  const cargarSucursales = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3456/api'}/sucursales`);
      const data = await response.json();
      if (data.success && data.data) {
        const nombresSucursales = data.data.map((s: any) => s.sucursal);
        setSucursales(nombresSucursales);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  // Cargar filtros dinámicos (marcas y modelos)
  const cargarFiltros = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';
      const url = new URL(`${API_URL}/productos/filtros`);
      
      // Filtrar por sucursal si está seleccionada
      if (selectedSucursal && selectedSucursal !== 'all') {
        url.searchParams.append('sucursal', selectedSucursal);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setMarcasDisponibles(data.data.marcas || []);
        setModelosDisponibles(data.data.modelos || []);
      }
    } catch (error) {
      console.error('Error al cargar filtros:', error);
    }
  };

  // Cargar inventario desde la API
  const cargarInventario = async () => {
    try {
      setLoading(true);
      // Pasar filtro de sucursal al API
      const filtros: any = {};
      if (selectedSucursal && selectedSucursal !== 'all') {
        filtros.sucursal = selectedSucursal;
      }
      
      const datos = await productosService.obtenerInventario(filtros);
      
      // Transformar datos de la API al formato del componente
      const datosTransformados = datos.map((item: any, index: number) => ({
        key: `${item.producto_id}-${item.sucursal}`,
        sucursal: item.sucursal,
        marca: item.marca || 'Sin marca',
        modelo: item.modelo || 'Sin modelo',
        producto: item.producto,
        stock: item.stock || 0,
        recibidos: item.recibidos || 0,
        categoria: item.modelo || 'Sin categoría' // Usar tipo/modelo como categoría
      }));
      
      setInventoryData(datosTransformados);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      message.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar sucursales al montar el componente
  useEffect(() => {
    cargarSucursales();
  }, []);

  // Recargar inventario y filtros cuando cambia la sucursal seleccionada
  useEffect(() => {
    cargarInventario();
    cargarFiltros();
  }, [selectedSucursal]);

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
      <Card 
        className="hover-lift" 
        style={{ 
          marginBottom: 16,
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Fila de Filtros */}
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={24} md={12} lg={6}>
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  gap: 8
                }}>
                  <ShopOutlined style={{ fontSize: 16, color: '#10b981' }} />
                  <Text strong style={{ fontSize: 13, color: '#374151' }}>
                    Sucursal
                  </Text>
                </div>
                <Select
                  value={selectedSucursal}
                  onChange={setSelectedSucursal}
                  style={{ width: '100%' }}
                  size="large"
                  onWheel={(e) => e.stopPropagation()}
                  showSearch
                  optionFilterProp="children"
                  placeholder="Seleccionar sucursal"
                  dropdownStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                  suffixIcon={
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      🏢
                    </div>
                  }
                  style={{
                    width: '100%',
                  }}
                  className="custom-select-sucursal"
                >
                  <Option value="all">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ 
                        fontSize: 18,
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}>
                        🌐
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Todas las Sucursales</span>
                    </div>
                  </Option>
                  {sucursales.map((sucursal) => (
                    <Option key={sucursal} value={sucursal}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ 
                          fontSize: 18,
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}>
                          🏪
                        </span>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>
                          {sucursal.charAt(0).toUpperCase() + sucursal.slice(1)}
                        </span>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            <Col 
              xs={searchExpanded ? 24 : 6} 
              sm={searchExpanded ? 24 : 4} 
              md={searchExpanded ? 12 : 2} 
              lg={searchExpanded ? 7 : 1} 
              style={{ transition: 'all 0.3s ease' }}
            >
              {!searchExpanded ? (
                <Tooltip title="Buscar productos">
                  <Button
                    type="primary"
                    icon={<SearchOutlined style={{ fontSize: 18 }} />}
                    onClick={() => setSearchExpanded(true)}
                    size="large"
                    block
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  />
                </Tooltip>
              ) : (
                <Input
                  autoFocus
                  placeholder="🔍 Buscar producto, marca o modelo..."
                  prefix={<SearchOutlined style={{ color: '#3b82f6' }} />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  onBlur={() => {
                    if (!searchText) {
                      setSearchExpanded(false);
                    }
                  }}
                  onClear={() => {
                    setSearchText('');
                    setSearchExpanded(false);
                  }}
                  style={{
                    borderRadius: '12px',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    height: '48px',
                    animation: 'expandSearch 0.3s ease-out'
                  }}
                />
              )}
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 8 : 10} 
              md={searchExpanded ? 6 : 5} 
              lg={searchExpanded ? 4 : 5}
            >
              <div>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  color: '#6b7280',
                  fontSize: 13
                }}>
                  🏷️ Marca
                </Text>
                <Select
                  placeholder="Marca"
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  style={{ width: '100%' }}
                  size="large"
                  variant="filled"
                  onWheel={(e) => e.stopPropagation()}
                  suffixIcon={<FilterOutlined style={{ color: '#9ca3af' }} />}
                >
                  <Option value="all">
                    <span style={{ fontWeight: 500 }}>✨ Todas</span>
                  </Option>
                  {marcasDisponibles.map(marca => (
                    <Option key={marca} value={marca}>
                      📱 {marca}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 8 : 10} 
              md={searchExpanded ? 6 : 5} 
              lg={searchExpanded ? 4 : 5}
            >
              <div>
                <Text strong style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  color: '#6b7280',
                  fontSize: 13
                }}>
                  📦 Producto
                </Text>
                <Select
                  placeholder="Modelo"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{ width: '100%' }}
                  size="large"
                  variant="filled"
                  onWheel={(e) => e.stopPropagation()}
                  suffixIcon={<FilterOutlined style={{ color: '#9ca3af' }} />}
                >
                  <Option value="all">
                    <span style={{ fontWeight: 500 }}>✨ Todos</span>
                  </Option>
                  {modelosDisponibles.map(modelo => (
                    <Option key={modelo} value={modelo}>
                      📦 {modelo}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 4 : 5} 
              md={searchExpanded ? 3 : 4} 
              lg={searchExpanded ? 2 : 3}
            >
              <Button 
                type="primary" 
                danger
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText('');
                  setSelectedBrand('all');
                  setSelectedCategory('all');
                  setSelectedSucursal('pando');
                  setSearchExpanded(false);
                }}
                block
                size="large"
                style={{
                  borderRadius: '8px',
                  height: '48px',
                  fontWeight: 600,
                  marginTop: 24
                }}
              >
                Limpiar
              </Button>
            </Col>
            
            <Col 
              xs={12} 
              sm={searchExpanded ? 4 : 5} 
              md={searchExpanded ? 3 : 4} 
              lg={searchExpanded ? 2 : 3}
            >
              <Button 
                type="default" 
                icon={<FilePdfOutlined />}
                onClick={generatePDF}
                size="large"
                style={{ 
                  width: '100%',
                  borderColor: '#722ed1',
                  color: '#722ed1',
                  borderRadius: '8px',
                  height: '48px',
                  fontWeight: 600,
                  marginTop: 24
                }}
              >
                PDF
              </Button>
            </Col>
          </Row>
        </Space>
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
          loading={loading}
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