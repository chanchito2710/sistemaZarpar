import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Statistic,
  InputNumber,
  Switch,
  Divider,
  Typography,
  Badge,
  Popconfirm,
  Image,
  Alert
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,

  ShopOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { Product, ProductFormData, ProductCategory, PRODUCT_CATEGORIES, PRODUCT_BRANDS, sortProducts, getProductStock, getProductPrice, isLowStock, isOutOfStock, getTotalStock } from '../../types/products';
import { BRANCHES, getBranchOptions } from '../../data/branches';

const { Header, Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProductTableData extends Product {
  key: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  // Cargar productos desde localStorage al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar productos cuando cambien los filtros
  useEffect(() => {
    filterProducts();
  }, [products, searchText, selectedCategory, selectedBrand, selectedStatus]);

  const loadProducts = () => {
    try {
      const savedProducts = localStorage.getItem('zarpar_products');
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(sortProducts(parsedProducts));
      } else {
        // Datos de ejemplo si no hay productos guardados
        const mockProducts = generateMockProducts();
        setProducts(sortProducts(mockProducts));
        localStorage.setItem('zarpar_products', JSON.stringify(mockProducts));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Error al cargar los productos');
    }
  };

  const saveProducts = (newProducts: Product[]) => {
    try {
      localStorage.setItem('zarpar_products', JSON.stringify(newProducts));
      setProducts(sortProducts(newProducts));
    } catch (error) {
      console.error('Error saving products:', error);
      message.error('Error al guardar los productos');
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchText.toLowerCase()) ||
        product.model.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtro por marca
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Filtro por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    setFilteredProducts(filtered);
  };

  const generateMockProducts = (): Product[] => {
    const currentDate = new Date().toISOString();
    return [
      {
        id: '1',
        name: 'Display iPhone 12',
        brand: 'iPhone',
        model: 'iPhone 12',
        category: 'Display',
        description: 'Display original para iPhone 12, calidad premium',
        sku: 'DIS-IP12-001',
        images: [{
          id: '1',
          url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2012%20display%20screen%20replacement%20part%20professional%20product%20photo&image_size=square',
          alt: 'Display iPhone 12',
          isPrimary: true
        }],

        prices: BRANCHES.map(branch => ({ branchId: branch.id, price: 150 + Math.floor(Math.random() * 10) - 5 })),
        stock: BRANCHES.map(branch => ({ branchId: branch.id, quantity: Math.floor(Math.random() * 50) + 10, minStock: 5 })),
        status: 'active',
        isNew: true,
        tags: ['premium', 'original'],
        createdAt: currentDate,
        updatedAt: currentDate,
        createdBy: 'admin',
        updatedBy: 'admin'
      },
      {
        id: '2',
        name: 'Batería Samsung A54',
        brand: 'Samsung',
        model: 'Galaxy A54',
        category: 'Baterías',
        description: 'Batería de alta capacidad para Samsung Galaxy A54',
        sku: 'BAT-SA54-001',
        images: [{
          id: '2',
          url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Samsung%20Galaxy%20A54%20battery%20replacement%20part%20professional%20product%20photo&image_size=square',
          alt: 'Batería Samsung A54',
          isPrimary: true
        }],

        prices: BRANCHES.map(branch => ({ branchId: branch.id, price: 45 + Math.floor(Math.random() * 6) - 3 })),
        stock: BRANCHES.map(branch => ({ branchId: branch.id, quantity: Math.floor(Math.random() * 30) + 5, minStock: 3 })),
        status: 'active',
        tags: ['alta-capacidad'],
        createdAt: currentDate,
        updatedAt: currentDate,
        createdBy: 'admin',
        updatedBy: 'admin'
      }
    ];
  };

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => isLowStock(p)).length;
    const outOfStockProducts = products.filter(p => isOutOfStock(p)).length;
    const totalValue = products.reduce((sum, p) => sum + (getTotalStock(p) * getProductPrice(p, BRANCHES[0].id)), 0);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    };
  }, [products]);

  const columns: ColumnsType<ProductTableData> = [
    {
      title: 'Producto',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.brand} - {record.model}
          </div>
          {record.sku && (
            <div style={{ fontSize: '11px', color: '#999' }}>SKU: {record.sku}</div>
          )}
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (category: ProductCategory) => (
        <Tag color="blue">{category}</Tag>
      ),
    },

    {
      title: 'Stock Total',
      key: 'totalStock',
      width: 100,
      render: (_, record) => {
        const totalStock = getTotalStock(record);
        const isLow = isLowStock(record);
        const isOut = isOutOfStock(record);
        
        let color = 'green';
        if (isOut) color = 'red';
        else if (isLow) color = 'orange';
        
        return <Tag color={color}>{totalStock}</Tag>;
      },
      sorter: (a, b) => getTotalStock(a) - getTotalStock(b),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const isActive = status === 'active';
        return (
          <Tag 
            color={isActive ? 'green' : 'red'} 
            icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar este producto?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => handleDelete(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okType="danger"
            >
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();

    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Preparar datos para el formulario
    const stockByBranch: { [key: string]: number } = {};
    const pricesByBranch: { [key: string]: number } = {};
    
    BRANCHES.forEach(branch => {
      stockByBranch[branch.id] = getProductStock(product, branch.id);
      pricesByBranch[branch.id] = getProductPrice(product, branch.id);
    });
    
    form.setFieldsValue({
      ...product,
      stock: stockByBranch,
      prices: pricesByBranch
    });
    

    
    setIsModalVisible(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    saveProducts(newProducts);
    message.success('Producto eliminado correctamente');
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const currentDate = new Date().toISOString();
      const productId = editingProduct?.id || Date.now().toString();
      
      // Procesar stock y precios por sucursal
      const stock = BRANCHES.map(branch => ({
        branchId: branch.id,
        quantity: values.stock?.[branch.id] || 0,
        minStock: 5
      }));
      
      const prices = BRANCHES.map(branch => ({
        branchId: branch.id,
        price: values.prices?.[branch.id] || 0
      }));
      
      const images: any[] = [];
      
      const productData: Product = {
        id: productId,
        name: values.name,
        brand: values.brand,
        model: values.model,
        category: values.category,
        description: values.description,
        sku: values.sku,
        images,
        basePrice: 0,
        baseCost: 0,
        prices,
        stock,
        status: values.status,
        tags: values.tags || [],
        specifications: values.specifications || {},
        supplier: values.supplier,
        weight: values.weight,
        warranty: values.warranty,
        createdAt: editingProduct?.createdAt || currentDate,
        updatedAt: currentDate,
        createdBy: editingProduct?.createdBy || 'admin',
        updatedBy: 'admin'
      };
      
      let newProducts;
      if (editingProduct) {
        newProducts = products.map(p => p.id === productId ? productData : p);
      } else {
        newProducts = [...products, productData];
      }
      
      saveProducts(newProducts);
      setIsModalVisible(false);
      message.success(editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);

  };



  const tableData: ProductTableData[] = filteredProducts.map(product => ({
    ...product,
    key: product.id
  }));

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>Gestión de Productos</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={loadProducts}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}
        >
          Actualizar
        </Button>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        {/* Estadísticas */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Productos"
                value={stats.totalProducts}
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Productos Activos"
                value={stats.activeProducts}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Stock Bajo"
                value={stats.lowStockProducts}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

        </Row>

        {/* Alertas */}
        {stats.outOfStockProducts > 0 && (
          <Alert
            message={`Tienes ${stats.outOfStockProducts} productos sin stock`}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {stats.lowStockProducts > 0 && (
          <Alert
            message={`Tienes ${stats.lowStockProducts} productos con stock bajo`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Filtros y tabla */}
        <Card>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Buscar productos..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Categoría"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
              >
                <Option value="all">Todas</Option>
                {PRODUCT_CATEGORIES.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Marca"
                value={selectedBrand}
                onChange={setSelectedBrand}
                style={{ width: '100%' }}
              >
                <Option value="all">Todas</Option>
                {PRODUCT_BRANDS.map(brand => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Select
                placeholder="Estado"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: '100%' }}
              >
                <Option value="all">Todos</Option>
                <Option value="active">Activos</Option>
                <Option value="inactive">Inactivos</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Nuevo Producto
              </Button>
            </Col>
          </Row>
          
          <Table
            columns={columns}
            dataSource={tableData}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
            }}
            scroll={{ x: 1200 }}
            loading={loading}
          />
        </Card>

        {/* Modal para agregar/editar producto */}
        <Modal
          title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={900}
          okText={editingProduct ? 'Actualizar' : 'Crear'}
          cancelText="Cancelar"
          confirmLoading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            name="productForm"
          >


            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Nombre del Producto"
                  rules={[{ required: true, message: 'Por favor ingresa el nombre del producto' }]}
                >
                  <Input placeholder="Ej: Display iPhone 12" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quality"
                  label="Calidad"
                >
                  <Select placeholder="Selecciona la calidad">
                    <Option value="JK">JK</Option>
                    <Option value="incell ZY">incell ZY</Option>
                    <Option value="Original">Original</Option>
                    <Option value="Oled">Oled</Option>
                    <Option value="incell">incell</Option>
                    <Option value="otro">otro</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="brand"
                  label="Marca"
                  rules={[{ required: true, message: 'Por favor selecciona una marca' }]}
                >
                  <Select placeholder="Selecciona una marca">
                    {PRODUCT_BRANDS.map(brand => (
                      <Option key={brand} value={brand}>{brand}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="model"
                  label="Modelo"
                  rules={[{ required: true, message: 'Por favor ingresa el modelo' }]}
                >
                  <Input placeholder="Ej: iPhone 12" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="category"
                  label="Categoría"
                  rules={[{ required: true, message: 'Por favor selecciona una categoría' }]}
                >
                  <Select placeholder="Selecciona una categoría">
                    {PRODUCT_CATEGORIES.map(category => (
                      <Option key={category} value={category}>{category}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Descripción"
            >
              <TextArea rows={3} placeholder="Descripción del producto..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Estado"
                  rules={[{ required: true, message: 'Por favor selecciona el estado' }]}
                >
                  <Select placeholder="Selecciona el estado">
                    <Option value="active">Activo</Option>
                    <Option value="inactive">Inactivo</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider>Stock por Sucursal</Divider>
            
            <Row gutter={16}>
              {BRANCHES.map(branch => (
                <Col key={branch.id} span={8}>
                  <Form.Item
                    name={['stock', branch.id]}
                    label={branch.name}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="0"
                      min={0}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>

            <Divider>Precios por Sucursal</Divider>
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Form.Item
                  name="basePriceForBranches"
                  label="Precio Base para Sucursales"
                  rules={[{ required: false }, { type: 'number', min: 0.01, message: 'El precio base debe ser mayor a 0' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    prefix="$"
                    placeholder="Ingresa precio base"
                    min={0}
                    precision={2}
                    onChange={(value) => {
                      if (value && value > 0) {
                        const pricesUpdate: any = {};
                        BRANCHES.forEach(branch => {
                          pricesUpdate[branch.id] = value;
                        });
                        form.setFieldsValue({ prices: pricesUpdate });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <div style={{ padding: '8px 0', color: '#666' }}>
                  <Text type="secondary">Este precio se aplicará automáticamente a todas las sucursales, pero puedes modificar cada una individualmente.</Text>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              {BRANCHES.map(branch => (
                <Col key={branch.id} span={8}>
                  <Form.Item
                    name={['prices', branch.id]}
                    label={branch.name}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="$"
                      placeholder="Precio individual"
                      min={0}
                      precision={2}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
        </Modal>

        {/* Modal para ver detalles del producto */}
        <Modal
          title="Detalles del Producto"
          open={isViewModalVisible}
          onCancel={() => setIsViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModalVisible(false)}>
              Cerrar
            </Button>
          ]}
          width={800}
        >
          {viewingProduct && (
            <div>
              <Row gutter={16}>
                <Col span={8}>
                  <Image
                    src={viewingProduct.images?.[0]?.url || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder%20icon&image_size=square'}
                    alt={viewingProduct.name}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Col>
                <Col span={16}>
                  <Title level={3}>{viewingProduct.name}</Title>
                  <Text strong>Marca: </Text><Text>{viewingProduct.brand}</Text><br />
                  <Text strong>Modelo: </Text><Text>{viewingProduct.model}</Text><br />
                  <Text strong>Categoría: </Text><Tag color="blue">{viewingProduct.category}</Tag><br />
                  <Text strong>SKU: </Text><Text>{viewingProduct.sku}</Text><br />

                  <Text strong>Estado: </Text>
                  <Tag color={viewingProduct.status === 'active' ? 'green' : 'red'}>
                    {viewingProduct.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Tag>
                </Col>
              </Row>
              
              {viewingProduct.description && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Descripción:</Text>
                  <p>{viewingProduct.description}</p>
                </div>
              )}
              
              <Divider>Stock por Sucursal</Divider>
              <Row gutter={16}>
                {BRANCHES.map(branch => {
                  const stock = getProductStock(viewingProduct, branch.id);
                  return (
                    <Col key={branch.id} span={8}>
                      <Card size="small">
                        <Statistic
                          title={branch.name}
                          value={stock}
                          suffix="unidades"
                          valueStyle={{ 
                            color: stock === 0 ? '#ff4d4f' : stock < 10 ? '#faad14' : '#52c41a' 
                          }}
                        />
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default Products;