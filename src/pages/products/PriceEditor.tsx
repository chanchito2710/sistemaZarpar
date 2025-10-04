import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  InputNumber,
  Space,
  Typography,
  notification,
  Modal,
  Select,
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import {
  SaveOutlined,
  UndoOutlined,
  FilePdfOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;
const { Option } = Select;

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  isNew?: boolean;
  basePrice: number;
  prices: {
    [branchId: string]: number;
  };
}

interface Branch {
  id: string;
  name: string;
  location: string;
}

const PriceEditor: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [originalPrices, setOriginalPrices] = useState<Product[]>([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // Función de ordenamiento personalizada reutilizable
  const getCategoryOrder = (category: string): number => {
    const categoryOrder = {
      'Display': 1,
      'Baterías': 2,
      'Baterias': 2, // Variante sin tilde
      'Tapas': 3,
      'tapas': 3, // Variante en minúscula
      'Flex': 4,
      'flex': 4, // Variante en minúscula
      'Placa Carga': 5,
      'placa carga': 5, // Variante en minúscula
      'Herramientas': 6,
      'herramientas': 6 // Variante en minúscula
    };
    return categoryOrder[category as keyof typeof categoryOrder] || 999;
  };

  const sortProducts = (productsToSort: Product[]): Product[] => {
    return [...productsToSort].sort((a, b) => {
      // Primero por marca (alfabéticamente)
      if (a.brand !== b.brand) {
        return a.brand.localeCompare(b.brand);
      }
      
      // Luego por categoría (orden específico)
      const categoryOrderA = getCategoryOrder(a.category);
      const categoryOrderB = getCategoryOrder(b.category);
      if (categoryOrderA !== categoryOrderB) {
        return categoryOrderA - categoryOrderB;
      }
      
      // Finalmente por modelo (alfabéticamente)
      return a.model.localeCompare(b.model);
    });
  };

  // Datos de ejemplo
  const mockBranches: Branch[] = [
    { id: 'maldonado', name: 'Maldonado', location: 'Maldonado Centro' },
    { id: 'pando', name: 'Pando', location: 'Pando Centro' },
    { id: 'melo', name: 'Melo', location: 'Melo Centro' },
    { id: 'paysandu', name: 'Paysandú', location: 'Paysandú Centro' },
    { id: 'salto', name: 'Salto', location: 'Salto Centro' },
    { id: 'rivera', name: 'Rivera', location: 'Rivera Centro' }
  ];

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Display iPhone 12',
      brand: 'Apple',
      model: 'iPhone 12',
      category: 'Display',
      isNew: true,
      basePrice: 150,
      prices: {
        maldonado: 150,
        pando: 145,
        melo: 148,
        paysandu: 152,
        salto: 149,
        rivera: 151
      }
    },
    {
      id: '2',
      name: 'Display Samsung A54',
      brand: 'Samsung',
      model: 'Galaxy A54',
      category: 'Display',
      basePrice: 80,
      prices: {
        maldonado: 80,
        pando: 78,
        melo: 82,
        paysandu: 85,
        salto: 79,
        rivera: 83
      }
    },
    {
      id: '3',
      name: 'Display Xiaomi Redmi Note 12',
      brand: 'Xiaomi',
      model: 'Redmi Note 12',
      category: 'Display',
      isNew: true,
      basePrice: 60,
      prices: {
        maldonado: 60,
        pando: 58,
        melo: 62,
        paysandu: 65,
        salto: 59,
        rivera: 63
      }
    },
    {
      id: '4',
      name: 'Batería iPhone 13',
      brand: 'Apple',
      model: 'iPhone 13',
      category: 'Baterías',
      basePrice: 45,
      prices: {
        maldonado: 45,
        pando: 43,
        melo: 47,
        paysandu: 48,
        salto: 44,
        rivera: 46
      }
    },
    {
      id: '5',
      name: 'Batería Samsung S23',
      brand: 'Samsung',
      model: 'Galaxy S23',
      category: 'Baterías',
      basePrice: 35,
      prices: {
        maldonado: 35,
        pando: 33,
        melo: 37,
        paysandu: 38,
        salto: 34,
        rivera: 36
      }
    },
    {
      id: '6',
      name: 'Placa Carga iPhone 14',
      brand: 'Apple',
      model: 'iPhone 14',
      category: 'Placa Carga',
      isNew: true,
      basePrice: 30,
      prices: {
        maldonado: 30,
        pando: 28,
        melo: 32,
        paysandu: 33,
        salto: 29,
        rivera: 31
      }
    }
  ];

  useEffect(() => {
    // Cargar datos desde localStorage o usar datos de ejemplo
    const savedProducts = localStorage.getItem('priceEditor_products');
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
      setOriginalPrices(JSON.parse(JSON.stringify(parsedProducts)));
    } else {
      setProducts(mockProducts);
      setOriginalPrices(JSON.parse(JSON.stringify(mockProducts)));
    }
    setBranches(mockBranches);
  }, []);

  const handlePriceChange = (productId: string, branchId: string, value: number | null) => {
    if (value === null) return;
    
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            prices: {
              ...product.prices,
              [branchId]: value
            }
          };
        }
        return product;
      });
      
      // Verificar si hay cambios
      const hasChanges = JSON.stringify(updatedProducts) !== JSON.stringify(originalPrices);
      setHasChanges(hasChanges);
      
      return updatedProducts;
    });
  };

  const handleBasePriceChange = (productId: string, value: number | null) => {
    if (value === null) return;
    
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.id === productId) {
          // Actualizar precio base y todos los precios de sucursales
          const updatedPrices: { [branchId: string]: number } = {};
          branches.forEach(branch => {
            updatedPrices[branch.id] = value;
          });
          
          return {
            ...product,
            basePrice: value,
            prices: updatedPrices
          };
        }
        return product;
      });
      
      // Verificar si hay cambios
      const hasChanges = JSON.stringify(updatedProducts) !== JSON.stringify(originalPrices);
      setHasChanges(hasChanges);
      
      return updatedProducts;
    });
  };

  const handleSaveChanges = () => {
    try {
      localStorage.setItem('priceEditor_products', JSON.stringify(products));
      setOriginalPrices(JSON.parse(JSON.stringify(products)));
      setHasChanges(false);
      notification.success({
        message: 'Cambios Guardados',
        description: 'Los precios han sido actualizados correctamente.',
        placement: 'topRight'
      });
    } catch (error) {
      notification.error({
        message: 'Error al Guardar',
        description: 'No se pudieron guardar los cambios. Intente nuevamente.',
        placement: 'topRight'
      });
    }
  };

  const handleResetPrices = () => {
    Modal.confirm({
      title: '¿Restablecer Precios?',
      content: 'Esta acción restaurará todos los precios a su estado original. ¿Desea continuar?',
      okText: 'Sí, Restablecer',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: () => {
        setProducts(JSON.parse(JSON.stringify(originalPrices)));
        setHasChanges(false);
        notification.info({
          message: 'Precios Restablecidos',
          description: 'Los precios han sido restaurados a su estado original.',
          placement: 'topRight'
        });
      }
    });
  };

  const generatePDF = () => {
    if (!selectedBranch) {
      notification.warning({
        message: 'Seleccione una Sucursal',
        description: 'Debe seleccionar una sucursal para generar la lista de precios.',
        placement: 'topRight'
      });
      return;
    }

    const branch = branches.find(b => b.id === selectedBranch);
    if (!branch) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // === ENCABEZADO PROFESIONAL ===
    // Fondo del encabezado
    doc.setFillColor(220, 20, 60); // Crimson red
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo y título principal (centrado)
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255); // Blanco
    doc.setFont('helvetica', 'bold');
    doc.text('ZARPAR IMPORTACIONES', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('CATÁLOGO DE PRECIOS', pageWidth / 2, 30, { align: 'center' });
    
    // Información de la sucursal y fecha
    doc.setFillColor(245, 245, 245); // Gris claro
    doc.rect(0, 45, pageWidth, 25, 'F');
    
    doc.setTextColor(60, 60, 60); // Gris oscuro
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`SUCURSAL: ${branch.name.toUpperCase()}`, margin, 58);
    doc.text(`UBICACIÓN: ${branch.location}`, margin, 65);
    
    const currentDate = new Date().toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`FECHA: ${currentDate.toUpperCase()}`, pageWidth - margin, 58, { align: 'right' });
    doc.text(`PÁGINA 1`, pageWidth - margin, 65, { align: 'right' });
    
    // Ordenar productos usando la función reutilizable
    const sortedProducts = sortProducts(products);
    
    // === ENCABEZADOS DE TABLA PROFESIONALES ===
    let yPosition = 85;
    
    // Fondo de encabezados
    doc.setFillColor(52, 73, 94); // Azul oscuro profesional
    doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 15, 'F');
    
    // Texto de encabezados
    doc.setTextColor(255, 255, 255); // Blanco
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTO', margin + 5, yPosition + 5);
    doc.text('MARCA', margin + 65, yPosition + 5);
    doc.text('MODELO', margin + 105, yPosition + 5);
    doc.text('PRECIO', pageWidth - margin - 5, yPosition + 5, { align: 'right' });
    
    yPosition += 20;
    
    // === PRODUCTOS CON ALTERNANCIA DE COLORES ===
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let currentBrand = '';
    let rowIndex = 0;
    
    sortedProducts.forEach((product, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 30;
        
        // Repetir encabezados en nueva página
        doc.setFillColor(52, 73, 94);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCTO', margin + 5, yPosition + 5);
        doc.text('MARCA', margin + 65, yPosition + 5);
        doc.text('MODELO', margin + 105, yPosition + 5);
        doc.text('PRECIO', pageWidth - margin - 5, yPosition + 5, { align: 'right' });
        yPosition += 20;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
      }
      
      // Separador por marca
      if (product.brand !== currentBrand) {
        if (currentBrand !== '') {
          yPosition += 5;
        }
        currentBrand = product.brand;
        
        // Línea separadora de marca
        doc.setDrawColor(220, 20, 60);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += 3;
      }
      
      // Alternancia de colores en filas
      if (rowIndex % 2 === 0) {
        doc.setFillColor(249, 249, 249); // Gris muy claro
        doc.rect(margin, yPosition - 3, pageWidth - (margin * 2), 12, 'F');
      }
      
      const price = product.prices[selectedBranch] || 0;
      const formattedPrice = `$${price.toLocaleString('es-UY', { minimumFractionDigits: 2 })}`;
      
      // Destacar productos nuevos
      if (product.isNew) {
        // Fondo especial para productos nuevos
        doc.setFillColor(255, 240, 240); // Rosa muy claro
        doc.rect(margin, yPosition - 3, pageWidth - (margin * 2), 12, 'F');
        
        // Badge "NUEVO"
        doc.setFillColor(220, 20, 60);
        doc.rect(margin + 2, yPosition - 1, 20, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('NUEVO', margin + 12, yPosition + 3, { align: 'center' });
        
        // Texto del producto en rojo
        doc.setTextColor(220, 20, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(product.name, margin + 25, yPosition + 3);
        doc.text(product.brand, margin + 65, yPosition + 3);
        doc.text(product.model, margin + 105, yPosition + 3);
        doc.text(formattedPrice, pageWidth - margin - 5, yPosition + 3, { align: 'right' });
      } else {
        // Productos normales
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(product.name, margin + 5, yPosition + 3);
        doc.text(product.brand, margin + 65, yPosition + 3);
        doc.text(product.model, margin + 105, yPosition + 3);
        doc.setFont('helvetica', 'bold');
        doc.text(formattedPrice, pageWidth - margin - 5, yPosition + 3, { align: 'right' });
      }
      
      yPosition += 12;
      rowIndex++;
    });
    
    // === PIE DE PÁGINA PROFESIONAL ===
    const footerY = pageHeight - 25;
    
    // Línea separadora
    doc.setDrawColor(220, 20, 60);
    doc.setLineWidth(1);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    // Información del pie
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('ZARPAR IMPORTACIONES', margin, footerY);
    doc.text('Catálogo de Precios Oficial', margin, footerY + 7);
    doc.text(`Total de productos: ${sortedProducts.length}`, margin, footerY + 14);
    
    doc.text(`Generado: ${new Date().toLocaleString('es-UY')}`, pageWidth - margin, footerY, { align: 'right' });
    doc.text('Precios sujetos a cambios sin previo aviso', pageWidth - margin, footerY + 7, { align: 'right' });
    doc.text('www.zarparimportaciones.com', pageWidth - margin, footerY + 14, { align: 'right' });
    
    // Guardar PDF con nombre más descriptivo
    const fileName = `Catalogo_Precios_${branch.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    setShowPdfModal(false);
    notification.success({
      message: 'Catálogo Generado Exitosamente',
      description: `Catálogo de precios profesional para ${branch.name} generado correctamente.`,
      placement: 'topRight',
      duration: 4
    });
  };

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.brand} - {record.model}
          </div>
          {record.isNew && (
            <Tag color="#dc143c" style={{ marginTop: 4, fontSize: '10px' }}>
              NUEVO
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Precio Base',
      key: 'basePrice',
      width: 120,
      render: (record: Product) => (
        <InputNumber
          value={record.basePrice}
          min={0}
          precision={2}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          onChange={(value) => handleBasePriceChange(record.id, value)}
          style={{ width: '100%', backgroundColor: '#f0f8ff', borderColor: '#1890ff' }}
        />
      )
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      width: 120
    },
    ...branches.map(branch => ({
      title: branch.name,
      key: branch.id,
      width: 100,
      render: (record: Product) => (
        <InputNumber
          value={record.prices[branch.id] || 0}
          min={0}
          precision={2}
          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          onChange={(value) => handlePriceChange(record.id, branch.id, value)}
          style={{ width: '100%' }}
        />
      )
    }))
  ];

  const totalProducts = products.length;
  const newProducts = products.filter(p => p.isNew).length;
  const averagePrice = products.reduce((sum, product) => {
    const prices = Object.values(product.prices);
    const avgProductPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    return sum + avgProductPrice;
  }, 0) / totalProducts;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <DollarOutlined /> Edición de Precios
        </Title>
        <Text type="secondary">
          Gestiona los precios de productos por sucursal
        </Text>
      </div>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Total Productos"
              value={totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Productos Nuevos"
              value={newProducts}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#dc143c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Precio Promedio"
              value={averagePrice}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `$${value}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Botones de acción */}
      <Card style={{ marginBottom: '24px' }}>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveChanges}
            disabled={!hasChanges}
          >
            Guardar Cambios
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={handleResetPrices}
            disabled={!hasChanges}
          >
            Restablecer Precios
          </Button>
          <Button
            type="default"
            icon={<FilePdfOutlined />}
            onClick={() => setShowPdfModal(true)}
            style={{ backgroundColor: '#dc143c', borderColor: '#dc143c', color: 'white' }}
          >
            Generar Lista de Precios
          </Button>
        </Space>
        {hasChanges && (
          <div style={{ marginTop: '8px' }}>
            <Text type="warning" style={{ fontSize: '12px' }}>
              ⚠️ Hay cambios sin guardar
            </Text>
          </div>
        )}
      </Card>

      {/* Tabla de precios */}
      <Card title="Precios por Sucursal">
        <Table
          columns={columns}
          dataSource={sortProducts(products)}
          rowKey="id"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`
          }}
        />
      </Card>

      {/* Modal para selección de sucursal */}
      <Modal
        title="Generar Lista de Precios"
        open={showPdfModal}
        onOk={generatePDF}
        onCancel={() => setShowPdfModal(false)}
        okText="Generar PDF"
        cancelText="Cancelar"
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>Seleccione la sucursal para generar la lista de precios:</Text>
        </div>
        <Select
          style={{ width: '100%' }}
          placeholder="Seleccionar sucursal"
          value={selectedBranch}
          onChange={setSelectedBranch}
        >
          {branches.map(branch => (
            <Option key={branch.id} value={branch.id}>
              {branch.name} - {branch.location}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default PriceEditor;