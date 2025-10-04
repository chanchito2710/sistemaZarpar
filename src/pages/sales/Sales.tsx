import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Space, Statistic, Row, Col, DatePicker, Select, Input, Modal, Tabs, Progress, Typography } from 'antd';
import { SearchOutlined, FileExcelOutlined, FilePdfOutlined, BarChartOutlined, EyeOutlined, DollarOutlined, ShoppingCartOutlined, TrophyOutlined, BranchesOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

interface ProductSale {
  id: string;
  productName: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
  branch: string;
  customer: string;
}

interface ProductReport {
  productName: string;
  category: string;
  brand: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  notes?: string;
  branches: {
    [key: string]: {
      quantity: number;
      revenue: number;
    };
  };
  stockMaldonado: number;
  stockPando: number;
  stockMelo: number;
  stockPaysandu: number;
  stockSalto: number;
  stockRivera: number;
}

import { BRANCHES, getBranchOptions } from '../../data/branches';

const branches = BRANCHES.map(branch => branch.name);

// Datos mock realistas de ventas de los últimos 3 meses
const mockSalesData: ProductSale[] = [
  // Noviembre 2023
  { id: 'S001', productName: 'Pantalla iPhone 12', category: 'Pantallas', brand: 'Apple', price: 15000, quantity: 2, total: 30000, date: '2023-11-05', branch: 'Maldonado', customer: 'Juan Pérez' },
  { id: 'S002', productName: 'Batería Samsung A54', category: 'Baterías', brand: 'Samsung', price: 3500, quantity: 1, total: 3500, date: '2023-11-08', branch: 'Pando', customer: 'María García' },
  { id: 'S003', productName: 'Carcasa iPhone 13', category: 'Carcasas', brand: 'Apple', price: 2500, quantity: 3, total: 7500, date: '2023-11-12', branch: 'Melo', customer: 'Carlos López' },
  { id: 'S004', productName: 'Pantalla Xiaomi Redmi Note 11', category: 'Pantallas', brand: 'Xiaomi', price: 8000, quantity: 1, total: 8000, date: '2023-11-15', branch: 'Paysandú', customer: 'Ana Martínez' },
  { id: 'S005', productName: 'Batería iPhone 11', category: 'Baterías', brand: 'Apple', price: 4500, quantity: 2, total: 9000, date: '2023-11-18', branch: 'Salto', customer: 'Luis Rodríguez' },
  { id: 'S006', productName: 'Cargador Samsung', category: 'Accesorios', brand: 'Samsung', price: 1200, quantity: 5, total: 6000, date: '2023-11-22', branch: 'Rivera', customer: 'Elena Fernández' },
  { id: 'S007', productName: 'Pantalla Samsung A32', category: 'Pantallas', brand: 'Samsung', price: 12000, quantity: 1, total: 12000, date: '2023-11-25', branch: 'Maldonado', customer: 'Roberto Silva' },
  { id: 'S008', productName: 'Auriculares Bluetooth', category: 'Accesorios', brand: 'Generic', price: 2800, quantity: 2, total: 5600, date: '2023-11-28', branch: 'Pando', customer: 'Sofia Morales' },
  
  // Diciembre 2023
  { id: 'S009', productName: 'Pantalla iPhone 12', category: 'Pantallas', brand: 'Apple', price: 15000, quantity: 3, total: 45000, date: '2023-12-02', branch: 'Melo', customer: 'Diego Castro' },
  { id: 'S010', productName: 'Batería Motorola G8', category: 'Baterías', brand: 'Motorola', price: 3200, quantity: 1, total: 3200, date: '2023-12-05', branch: 'Paysandú', customer: 'Valentina Ruiz' },
  { id: 'S011', productName: 'Carcasa Samsung A54', category: 'Carcasas', brand: 'Samsung', price: 1800, quantity: 4, total: 7200, date: '2023-12-08', branch: 'Salto', customer: 'Mateo Vega' },
  { id: 'S012', productName: 'Pantalla Xiaomi Redmi Note 11', category: 'Pantallas', brand: 'Xiaomi', price: 8000, quantity: 2, total: 16000, date: '2023-12-12', branch: 'Rivera', customer: 'Isabella Torres' },
  { id: 'S013', productName: 'Batería iPhone 11', category: 'Baterías', brand: 'Apple', price: 4500, quantity: 1, total: 4500, date: '2023-12-15', branch: 'Maldonado', customer: 'Sebastián Herrera' },
  { id: 'S014', productName: 'Protector de Pantalla', category: 'Accesorios', brand: 'Generic', price: 800, quantity: 8, total: 6400, date: '2023-12-18', branch: 'Pando', customer: 'Camila Jiménez' },
  { id: 'S015', productName: 'Pantalla Samsung A32', category: 'Pantallas', brand: 'Samsung', price: 12000, quantity: 2, total: 24000, date: '2023-12-22', branch: 'Melo', customer: 'Nicolás Mendoza' },
  { id: 'S016', productName: 'Cargador iPhone', category: 'Accesorios', brand: 'Apple', price: 1500, quantity: 3, total: 4500, date: '2023-12-28', branch: 'Paysandú', customer: 'Lucía Paredes' },
  
  // Enero 2024
  { id: 'S017', productName: 'Pantalla iPhone 13', category: 'Pantallas', brand: 'Apple', price: 18000, quantity: 1, total: 18000, date: '2024-01-03', branch: 'Salto', customer: 'Andrés Romero' },
  { id: 'S018', productName: 'Batería Samsung A54', category: 'Baterías', brand: 'Samsung', price: 3500, quantity: 2, total: 7000, date: '2024-01-08', branch: 'Rivera', customer: 'Gabriela Soto' },
  { id: 'S019', productName: 'Carcasa Xiaomi', category: 'Carcasas', brand: 'Xiaomi', price: 2200, quantity: 2, total: 4400, date: '2024-01-12', branch: 'Maldonado', customer: 'Fernando Aguilar' },
  { id: 'S020', productName: 'Pantalla Motorola G8', category: 'Pantallas', brand: 'Motorola', price: 9500, quantity: 1, total: 9500, date: '2024-01-15', branch: 'Pando', customer: 'Valeria Cruz' },
  { id: 'S021', productName: 'Batería iPhone 12', category: 'Baterías', brand: 'Apple', price: 5000, quantity: 1, total: 5000, date: '2024-01-18', branch: 'Melo', customer: 'Joaquín Vargas' },
  { id: 'S022', productName: 'Auriculares Samsung', category: 'Accesorios', brand: 'Samsung', price: 3200, quantity: 2, total: 6400, date: '2024-01-22', branch: 'Paysandú', customer: 'Martina Flores' },
  { id: 'S023', productName: 'Pantalla iPhone 12', category: 'Pantallas', brand: 'Apple', price: 15000, quantity: 2, total: 30000, date: '2024-01-25', branch: 'Salto', customer: 'Emilio Ramos' },
  { id: 'S024', productName: 'Cargador Inalámbrico', category: 'Accesorios', brand: 'Generic', price: 2500, quantity: 1, total: 2500, date: '2024-01-28', branch: 'Rivera', customer: 'Renata Ortiz' }
];

type SortOption = 'none' | 'brand-asc' | 'brand-desc' | 'product-asc' | 'product-desc';

const Sales: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ProductReport | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productNotes, setProductNotes] = useState<{ [key: string]: string }>({});
  const [sortOption, setSortOption] = useState<SortOption>('none');

  // Filtrar datos según los filtros seleccionados
  const filteredData = useMemo(() => {
    let filtered = mockSalesData;

    // Filtro por rango de fechas
    if (selectedDateRange && selectedDateRange.length === 2) {
      const [startDate, endDate] = selectedDateRange;
      filtered = filtered.filter(sale => {
        const saleDate = dayjs(sale.date);
        return saleDate.isAfter(startDate.startOf('day')) && saleDate.isBefore(endDate.endOf('day'));
      });
    }

    // Filtro por sucursal
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(sale => sale.branch.toLowerCase() === selectedBranch.toLowerCase());
    }

    // Filtro por producto
    if (searchProduct) {
      filtered = filtered.filter(sale => 
        sale.productName.toLowerCase().includes(searchProduct.toLowerCase()) ||
        sale.category.toLowerCase().includes(searchProduct.toLowerCase()) ||
        sale.brand.toLowerCase().includes(searchProduct.toLowerCase())
      );
    }

    return filtered;
  }, [selectedDateRange, selectedBranch, searchProduct]);



  // Generar reporte de productos con ordenamiento
  const productReports = useMemo(() => {
    const reports: { [key: string]: ProductReport } = {};

    // Datos de stock realistas por producto y sucursal
    const stockData: { [key: string]: { [key: string]: number } } = {
      'Pantalla iPhone 12': { Maldonado: 15, Pando: 8, Melo: 12, Paysandú: 6, Salto: 10, Rivera: 4 },
      'Batería Samsung A54': { Maldonado: 25, Pando: 18, Melo: 22, Paysandú: 15, Salto: 20, Rivera: 12 },
      'Carcasa iPhone 13': { Maldonado: 30, Pando: 25, Melo: 28, Paysandú: 20, Salto: 24, Rivera: 18 },
      'Pantalla Xiaomi Redmi Note 11': { Maldonado: 12, Pando: 9, Melo: 14, Paysandú: 7, Salto: 11, Rivera: 5 },
      'Batería iPhone 11': { Maldonado: 20, Pando: 15, Melo: 18, Paysandú: 12, Salto: 16, Rivera: 10 },
      'Cargador Samsung': { Maldonado: 40, Pando: 35, Melo: 38, Paysandú: 30, Salto: 33, Rivera: 25 },
      'Pantalla Samsung A32': { Maldonado: 8, Pando: 6, Melo: 10, Paysandú: 4, Salto: 7, Rivera: 3 },
      'Auriculares Bluetooth': { Maldonado: 22, Pando: 18, Melo: 25, Paysandú: 16, Salto: 20, Rivera: 14 },
      'Batería Motorola G8': { Maldonado: 18, Pando: 14, Melo: 16, Paysandú: 10, Salto: 13, Rivera: 8 },
      'Carcasa Samsung A54': { Maldonado: 35, Pando: 28, Melo: 32, Paysandú: 24, Salto: 29, Rivera: 20 },
      'Protector de Pantalla': { Maldonado: 50, Pando: 45, Melo: 48, Paysandú: 40, Salto: 42, Rivera: 35 },
      'Cargador iPhone': { Maldonado: 28, Pando: 22, Melo: 26, Paysandú: 18, Salto: 24, Rivera: 16 },
      'Pantalla iPhone 13': { Maldonado: 10, Pando: 7, Melo: 9, Paysandú: 5, Salto: 8, Rivera: 4 },
      'Carcasa Xiaomi': { Maldonado: 32, Pando: 26, Melo: 30, Paysandú: 22, Salto: 27, Rivera: 19 },
      'Pantalla Motorola G8': { Maldonado: 14, Pando: 10, Melo: 12, Paysandú: 8, Salto: 11, Rivera: 6 },
      'Batería iPhone 12': { Maldonado: 16, Pando: 12, Melo: 15, Paysandú: 9, Salto: 13, Rivera: 7 },
      'Auriculares Samsung': { Maldonado: 24, Pando: 19, Melo: 22, Paysandú: 16, Salto: 20, Rivera: 13 },
      'Cargador Inalámbrico': { Maldonado: 18, Pando: 14, Melo: 17, Paysandú: 11, Salto: 15, Rivera: 9 }
    };

    filteredData.forEach(sale => {
      if (!reports[sale.productName]) {
        const productStock = stockData[sale.productName] || BRANCHES.reduce((acc, branch) => ({ ...acc, [branch.name]: 0 }), {} as Record<string, number>);
        
        reports[sale.productName] = {
          productName: sale.productName,
          category: sale.category,
          brand: sale.brand,
          totalQuantity: 0,
          totalRevenue: 0,
          averagePrice: 0,
          branches: {},
          stockMaldonado: productStock.Maldonado,
          stockPando: productStock.Pando,
          stockMelo: productStock.Melo,
          stockPaysandu: productStock.Paysandú,
          stockSalto: productStock.Salto,
          stockRivera: productStock.Rivera
        };
      }

      const report = reports[sale.productName];
      report.totalQuantity += sale.quantity;
      report.totalRevenue += sale.total;

      if (!report.branches[sale.branch]) {
        report.branches[sale.branch] = { quantity: 0, revenue: 0 };
      }
      report.branches[sale.branch].quantity += sale.quantity;
      report.branches[sale.branch].revenue += sale.total;
    });

    // Calcular precio promedio
    Object.values(reports).forEach(report => {
      report.averagePrice = report.totalQuantity > 0 ? report.totalRevenue / report.totalQuantity : 0;
    });

    let sortedReports = Object.values(reports);
    
    // Aplicar ordenamiento según la opción seleccionada
    switch (sortOption) {
      case 'brand-asc':
        sortedReports.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case 'brand-desc':
        sortedReports.sort((a, b) => b.brand.localeCompare(a.brand));
        break;
      case 'product-asc':
        sortedReports.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'product-desc':
        sortedReports.sort((a, b) => b.productName.localeCompare(a.productName));
        break;
      default:
        // Ordenamiento por defecto: por ingresos totales (descendente)
        sortedReports.sort((a, b) => b.totalRevenue - a.totalRevenue);
        break;
    }

    return sortedReports;
  }, [filteredData, sortOption]);

  // Estadísticas generales
  const statistics = useMemo(() => {
    const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.total, 0);
    const totalQuantity = filteredData.reduce((sum, sale) => sum + sale.quantity, 0);
    const uniqueProducts = new Set(filteredData.map(sale => sale.productName)).size;
    
    const branchSales = branches.reduce((acc, branch) => {
      acc[branch] = filteredData
        .filter(sale => sale.branch === branch)
        .reduce((sum, sale) => sum + sale.total, 0);
      return acc;
    }, {} as { [key: string]: number });

    const topBranch = Object.entries(branchSales)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalRevenue,
      totalQuantity,
      uniqueProducts,
      topBranch: topBranch ? { name: topBranch[0], revenue: topBranch[1] } : null,
      branchSales
    };
  }, [filteredData]);

  // Columnas para la tabla de productos
  const productColumns: ColumnsType<ProductReport> = [
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.brand} - {record.category}</div>
        </div>
      ),
    },

    {
      title: 'Cantidad Total',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    },
    {
      title: 'Notas',
      key: 'notes',
      width: 200,
      render: (_, record) => (
        <Input
          placeholder="Agregar nota..."
          value={productNotes[record.productName] || ''}
          onChange={(e) => setProductNotes(prev => ({
            ...prev,
            [record.productName]: e.target.value
          }))}
          size="small"
          className="border-gray-300"
        />
      ),
    },
    ...branches.map(branch => ({
      title: branch,
      key: branch,
      width: 100,
      align: 'center' as const,
      render: (_: any, record: ProductReport) => {
        const branchData = record.branches[branch];
        const soldQuantity = branchData ? branchData.quantity : 0;
        const stockKey = `stock${branch}` as keyof ProductReport;
        const stockQuantity = record[stockKey] as number || 0;
        
        return (
          <div className="text-center">
            <div className="font-medium text-gray-900">{soldQuantity}</div>
            <div className="text-xs text-red-500 bg-white px-2 py-1 rounded border border-red-200">Stock: {stockQuantity}</div>
          </div>
        );
      },
    })),
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          className="text-blue-600 hover:text-blue-800"
          onClick={() => {
            setSelectedProduct(record);
            setIsModalVisible(true);
          }}
        />
      ),
    },
    {
      title: 'Precio Promedio',
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      width: 150,
      render: (value: number) => `$${Math.round(value).toLocaleString()}`,
    },
    {
      title: 'Ingresos Totales',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 150,
      render: (value: number) => `$${value.toLocaleString()}`,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
  ];

  const handleExportExcel = () => {
    console.log('Exportar a Excel');
  };

  const handleExportPDF = () => {
    console.log('Exportar a PDF');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Reportes de Ventas</h1>
        <p className="text-gray-600">Análisis detallado de ventas por producto y sucursal</p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rango de fechas
            </label>
            <RangePicker 
              onChange={setSelectedDateRange}
              className="w-64"
              placeholder={['Fecha inicio', 'Fecha fin']}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sucursal
            </label>
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              className="w-48"
            >
              <Option value="all">Todas las sucursales</Option>
              {branches.map(branch => (
                <Option key={branch.toLowerCase()} value={branch.toLowerCase()}>
                  {branch}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar producto
            </label>
            <Input
              placeholder="Buscar por producto, marca o categoría"
              prefix={<SearchOutlined />}
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-64"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <Select
              value={sortOption}
              onChange={setSortOption}
              className="w-48"
              placeholder="Seleccionar ordenamiento"
            >
              <Option value="none">Por defecto (Ingresos)</Option>
              <Option value="brand-asc">Marca (A-Z)</Option>
              <Option value="brand-desc">Marca (Z-A)</Option>
              <Option value="product-asc">Producto (A-Z)</Option>
              <Option value="product-desc">Producto (Z-A)</Option>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExportExcel}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Excel
            </Button>
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={handleExportPDF}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Estadísticas generales */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={statistics.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${value?.toLocaleString()}`}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Productos Vendidos"
              value={statistics.totalQuantity}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Productos Únicos"
              value={statistics.uniqueProducts}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mejor Sucursal"
              value={statistics.topBranch?.revenue || 0}
              prefix={<TrophyOutlined />}
              formatter={(value) => `$${value?.toLocaleString()}`}
              suffix={statistics.topBranch ? ` (${statistics.topBranch.name})` : ''}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Ventas por sucursal */}
      <Card className="mb-6" title="Ventas por Sucursal">
        <Row gutter={16}>
          {branches.map(branch => {
            const branchRevenue = statistics.branchSales[branch] || 0;
            const percentage = statistics.totalRevenue > 0 
              ? (branchRevenue / statistics.totalRevenue) * 100 
              : 0;
            
            return (
              <Col xs={24} sm={12} lg={4} key={branch} className="mb-4">
                <div className="text-center">
                  <div className="font-medium text-gray-800 mb-2">{branch}</div>
                  <Progress 
                    type="circle" 
                    percent={Math.round(percentage)} 
                    format={() => `$${branchRevenue.toLocaleString()}`}
                    size={80}
                  />
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* Tabla de productos */}
      <Card title={`Reporte de Productos (${productReports.length} productos)`}>
        <Table
          columns={productColumns}
          dataSource={productReports}
          rowKey="productName"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} productos`,
          }}
          scroll={{ x: 1200 }}
          className="overflow-x-auto"
        />
      </Card>

      {/* Modal de detalles del producto */}
      <Modal
        title={`Detalle: ${selectedProduct?.productName}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProduct && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Resumen" key="1">
              <Row gutter={16} className="mb-4">
                <Col span={8}>
                  <Statistic
                    title="Cantidad Total Vendida"
                    value={selectedProduct.totalQuantity}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Ingresos Totales"
                    value={selectedProduct.totalRevenue}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `$${value?.toLocaleString()}`}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Precio Promedio"
                    value={Math.round(selectedProduct.averagePrice)}
                    prefix={<DollarOutlined />}
                    formatter={(value) => `$${value?.toLocaleString()}`}
                  />
                </Col>
              </Row>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Información del Producto</h4>
                <p><strong>Marca:</strong> {selectedProduct.brand}</p>
                <p><strong>Categoría:</strong> {selectedProduct.category}</p>
              </div>
            </TabPane>
            <TabPane tab="Por Sucursal" key="2">
              <div className="space-y-4">
                {branches.map(branch => {
                  const branchData = selectedProduct.branches[branch];
                  const percentage = selectedProduct.totalQuantity > 0 
                    ? (branchData?.quantity || 0) / selectedProduct.totalQuantity * 100 
                    : 0;
                  
                  return (
                    <div key={branch} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{branch}</div>
                        <div className="text-sm text-gray-600">
                          {branchData?.quantity || 0} unidades - $
                          {(branchData?.revenue || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="w-32">
                        <Progress percent={Math.round(percentage)} size="small" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default Sales;