import React, { useState } from 'react';
import { Table, InputNumber, message, Card, Typography, Space, Input, Button, Modal, DatePicker } from 'antd';
import { SearchOutlined, SendOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { BRANCHES } from '../../data/branches';
import './Transfer.css';

const { Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface Product {
  id: string;
  name: string;
  marca: string;
  categoria: string;
  casaCentral: number;
  paysandu: number;
  salto: number;
  rivera: number;
  tacuarembo: number;
  pando: number;
  melo: number;
}

interface TransferredAmounts {
  [productId: string]: {
    [branch: string]: number;
  };
}

interface PendingTransfers {
  [productId: string]: {
    [branch: string]: number;
  };
}

interface SalesData {
  [productId: string]: {
    [branch: string]: {
      [date: string]: number; // fecha en formato YYYY-MM-DD
    };
  };
}

const Transfer: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [transferredAmounts, setTransferredAmounts] = useState<TransferredAmounts>({});
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfers>({});
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs().subtract(7, 'days'), dayjs()]);
  const [salesData, setSalesData] = useState<SalesData>({});
  const [sortedInfo, setSortedInfo] = useState<any>({});

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Pantalla iPhone 14 Pro',
      marca: 'iPhone',
      categoria: 'Pantallas',
      casaCentral: 25,
      paysandu: 8,
      salto: 12,
      rivera: 5,
      tacuarembo: 3,
      pando: 7,
      melo: 4
    },
    {
      id: '2',
      name: 'Pantalla Samsung Galaxy S23',
      marca: 'Samsung',
      categoria: 'Pantallas',
      casaCentral: 30,
      paysandu: 10,
      salto: 15,
      rivera: 8,
      tacuarembo: 6,
      pando: 9,
      melo: 7
    },
    {
      id: '3',
      name: 'Carcasa iPhone 13',
      marca: 'iPhone',
      categoria: 'Carcasas',
      casaCentral: 100,
      paysandu: 25,
      salto: 30,
      rivera: 20,
      tacuarembo: 15,
      pando: 22,
      melo: 18
    },
    {
      id: '4',
      name: 'Pin de Carga USB-C',
      marca: 'Samsung',
      categoria: 'Pin de Carga',
      casaCentral: 75,
      paysandu: 20,
      salto: 25,
      rivera: 15,
      tacuarembo: 12,
      pando: 18,
      melo: 14
    },
    {
      id: '5',
      name: 'Flex iPhone 12',
      marca: 'iPhone',
      categoria: 'Flex',
      casaCentral: 40,
      paysandu: 12,
      salto: 15,
      rivera: 8,
      tacuarembo: 6,
      pando: 10,
      melo: 9
    },
    {
      id: '6',
      name: 'Batería Samsung A54',
      marca: 'Samsung',
      categoria: 'Baterías',
      casaCentral: 20,
      paysandu: 5,
      salto: 8,
      rivera: 4,
      tacuarembo: 3,
      pando: 6,
      melo: 2
    },
    {
      id: '7',
      name: 'Herramientas Reparación',
      marca: 'Genérico',
      categoria: 'Herramientas',
      casaCentral: 35,
      paysandu: 8,
      salto: 12,
      rivera: 6,
      tacuarembo: 5,
      pando: 9,
      melo: 7
    },
    {
      id: '8',
      name: 'Batería Xiaomi Redmi Note 12',
      marca: 'Xiaomi',
      categoria: 'Baterías',
      casaCentral: 60,
      paysandu: 15,
      salto: 20,
      rivera: 12,
      tacuarembo: 10,
      pando: 16,
      melo: 13
    }
  ]);

  // Función para generar datos simulados de ventas
  const generateSalesData = (): SalesData => {
    const salesData: SalesData = {};
    const branches = BRANCHES.filter(branch => branch.name !== 'Casa Matriz').map(branch => 
      branch.name.toLowerCase().replace(/\s+/g, '').replace(/ú/g, 'u').replace(/ó/g, 'o')
    );
    
    products.forEach(product => {
      salesData[product.id] = {};
      branches.forEach(branch => {
        salesData[product.id][branch] = {};
        
        // Generar ventas para los últimos 30 días
        for (let i = 0; i < 30; i++) {
          const date = dayjs().subtract(i, 'days').format('YYYY-MM-DD');
          // Generar ventas aleatorias (0-5 por día)
          const sales = Math.floor(Math.random() * 6);
          if (sales > 0) {
            salesData[product.id][branch][date] = sales;
          }
        }
      });
    });
    
    return salesData;
  };

  // Inicializar datos de ventas al cargar el componente
  React.useEffect(() => {
    setSalesData(generateSalesData());
  }, []);

  // Función para obtener ventas filtradas por rango de fechas
  const getSalesInDateRange = (productId: string, branch: string): number => {
    if (!salesData[productId] || !salesData[productId][branch] || !dateRange[0] || !dateRange[1]) {
      return 0;
    }
    
    let totalSales = 0;
    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    
    Object.entries(salesData[productId][branch]).forEach(([date, sales]) => {
      if (date >= startDate && date <= endDate) {
        totalSales += sales;
      }
    });
    
    return totalSales;
  };

  const handleTransfer = (productId: string, branch: string, newQuantity: number) => {
    // Validar que no sea negativo
    if (newQuantity < 0) {
      message.error('La cantidad no puede ser negativa');
      return;
    }

    // Encontrar el producto
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    const currentTransferred = transferredAmounts[productId]?.[branch] || 0;
    const difference = newQuantity - currentTransferred;
    
    // Si no hay diferencia, no hacer nada
    if (difference === 0) return;
    
    // Validar stock disponible en Casa Central
    if (difference > 0 && difference > product.casaCentral) {
      message.error(`Stock insuficiente en Casa Central. Disponible: ${product.casaCentral}`);
      return;
    }
    
    // Actualizar el stock
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...product,
      casaCentral: product.casaCentral - difference,
      [branch]: (product[branch as keyof Product] as number) + difference
    };
    setProducts(updatedProducts);
    
    // Actualizar las cantidades transferidas
    if (newQuantity === 0) {
      setTransferredAmounts(prev => {
        const newState = { ...prev };
        if (newState[productId]) {
          delete newState[productId][branch];
          if (Object.keys(newState[productId]).length === 0) {
            delete newState[productId];
          }
        }
        return newState;
      });
    } else {
      setTransferredAmounts(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [branch]: newQuantity
        }
      }));
    }
    
    if (difference > 0) {
      message.success(`Transferidas ${difference} unidades a ${branch}`);
    } else {
      message.success(`Devueltas ${Math.abs(difference)} unidades de ${branch} a Casa Central`);
    }
  };

  // Función para obtener el total de transferencias pendientes
  const getTotalPendingTransfers = () => {
    let total = 0;
    Object.values(pendingTransfers).forEach(productTransfers => {
      Object.values(productTransfers).forEach(amount => {
        total += amount;
      });
    });
    return total;
  };

  // Función para obtener el nombre de la sucursal
  const getBranchDisplayName = (branch: string) => {
    const foundBranch = BRANCHES.find(b => 
      b.name.toLowerCase().replace(/\s+/g, '').replace(/[áéíóúñ]/g, match => {
        const replacements: { [key: string]: string } = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
        return replacements[match] || match;
      }) === branch
    );
    return foundBranch ? foundBranch.name : branch;
  };

  // Función para confirmar transferencia a una sucursal específica
  const confirmTransfer = (productId: string, branch: string) => {
    const pendingAmount = pendingTransfers[productId]?.[branch];
    if (!pendingAmount) return;

    // Encontrar el producto
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    const product = products[productIndex];
    
    // Validar stock disponible en Casa Central
    if (pendingAmount > product.casaCentral) {
      message.error(`Stock insuficiente en Casa Central. Disponible: ${product.casaCentral}`);
      return;
    }
    
    // Actualizar el stock
    const updatedProducts = [...products];
    updatedProducts[productIndex] = {
      ...product,
      casaCentral: product.casaCentral - pendingAmount,
      [branch]: (product[branch as keyof Product] as number) + pendingAmount
    };
    setProducts(updatedProducts);
    
    // Actualizar las cantidades transferidas
    setTransferredAmounts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [branch]: (prev[productId]?.[branch] || 0) + pendingAmount
      }
    }));
    
    // Remover de transferencias pendientes
    setPendingTransfers(prev => {
      const newState = { ...prev };
      if (newState[productId]) {
        delete newState[productId][branch];
        if (Object.keys(newState[productId]).length === 0) {
          delete newState[productId];
        }
      }
      return newState;
    });
    
    message.success(`Transferidas ${pendingAmount} unidades a ${getBranchDisplayName(branch)}`);
    
    // Cerrar modal si no hay más transferencias pendientes
    if (getTotalPendingTransfers() - pendingAmount === 0) {
      setIsConfirmModalVisible(false);
    }
  };

  const handleEnviarClick = () => {
    const totalPending = getTotalPendingTransfers();
    if (totalPending > 0) {
      setIsConfirmModalVisible(true);
    } else {
      message.info('No hay transferencias pendientes');
    }
  };

  const TransferInput: React.FC<{ productId: string; branch: string; maxValue: number }> = ({ productId, branch, maxValue }) => {
    const [inputValue, setInputValue] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const transferredAmount = transferredAmounts[productId]?.[branch] || 0;
    const pendingAmount = pendingTransfers[productId]?.[branch] || 0;
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEditing(true);
      // Si hay un valor pendiente, mostrarlo en el input
      if (pendingAmount > 0) {
        setInputValue(pendingAmount);
      }
      // Seleccionar todo el texto al hacer focus
      setTimeout(() => {
        e.target.select();
      }, 0);
    };
    
    const handleBlur = () => {
      setIsEditing(false);
      const finalValue = inputValue || 0;
      
      // Guardar como transferencia pendiente en lugar de procesar automáticamente
      if (finalValue === 0) {
        setPendingTransfers(prev => {
          const newState = { ...prev };
          if (newState[productId]) {
            delete newState[productId][branch];
            if (Object.keys(newState[productId]).length === 0) {
              delete newState[productId];
            }
          }
          return newState;
        });
      } else {
        // Validar que no exceda el stock disponible
        const product = products.find(p => p.id === productId);
        if (product && finalValue > product.casaCentral) {
          message.error(`Stock insuficiente en Casa Central. Disponible: ${product.casaCentral}`);
          setInputValue(null);
          return;
        }
        
        setPendingTransfers(prev => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            [branch]: finalValue
          }
        }));
      }
      
      setInputValue(null);
    };

    const handleChange = (value: number | null) => {
      setInputValue(value);
    };

    // Determinar qué valor mostrar
    const displayValue = isEditing || inputValue !== null 
      ? inputValue 
      : (pendingAmount > 0 ? pendingAmount : (transferredAmount > 0 ? transferredAmount : null));
    
    const hasTransferred = transferredAmount > 0;
    const hasPending = pendingAmount > 0;

    return (
      <InputNumber
        size="small"
        min={0}
        max={maxValue + transferredAmount}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPressEnter={handleBlur}
        placeholder="0"
        style={{
          width: '60px',
          textAlign: 'center'
        }}
        styles={{
          input: {
            color: hasPending ? '#fa8c16' : (hasTransferred ? '#1890ff' : undefined),
            fontWeight: (hasPending || hasTransferred) ? 'bold' : undefined
          }
        }}
        disabled={maxValue === 0 && transferredAmount === 0}
      />
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.marca.toLowerCase().includes(searchText.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchText.toLowerCase())
  );

  // Función para manejar cambios en el ordenamiento
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  // Aplicar ordenamiento a los productos filtrados
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortedInfo.columnKey && sortedInfo.order) {
      const aValue = a[sortedInfo.columnKey as keyof Product];
      const bValue = b[sortedInfo.columnKey as keyof Product];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortedInfo.order === 'ascend' ? comparison : -comparison;
      }
    }
    return 0;
  });

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 200,
      align: 'left' as const,
      sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 120,
      sorter: (a: Product, b: Product) => {
        // Ordenar primero por categoría, luego por marca
        const categoryComparison = a.categoria.localeCompare(b.categoria);
        if (categoryComparison !== 0) return categoryComparison;
        return a.marca.localeCompare(b.marca);
      },
      sortOrder: sortedInfo.columnKey === 'marca' ? sortedInfo.order : null,
      render: (marca: string, record: Product) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{marca}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.categoria}</div>
        </div>
      ),
    },
    {
      title: 'Casa Central',
      dataIndex: 'casaCentral',
      key: 'casaCentral',
      width: 120,
      render: (stock: number) => (
        <span className={stock < 10 ? 'low-stock' : 'normal-stock'}>
          {stock}
        </span>
      )
    },
    {
      title: 'Paysandú',
      key: 'paysandu',
      width: 120,
      render: (record: Product) => {
        const salesInRange = getSalesInDateRange(record.id, 'paysandu');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>{record.paysandu}</span>
            {salesInRange > 0 && (
              <span style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                Vendido: {salesInRange}
              </span>
            )}
            <TransferInput productId={record.id} branch="paysandu" maxValue={record.casaCentral} />
          </div>
        );
      }
    },
    {
      title: 'Salto',
      key: 'salto',
      width: 120,
      render: (record: Product) => {
        const salesInRange = getSalesInDateRange(record.id, 'salto');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>{record.salto}</span>
            {salesInRange > 0 && (
              <span style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                Vendido: {salesInRange}
              </span>
            )}
            <TransferInput productId={record.id} branch="salto" maxValue={record.casaCentral} />
          </div>
        );
      }
    },
    {
      title: 'Rivera',
      key: 'rivera',
      width: 120,
      render: (record: Product) => {
        const salesInRange = getSalesInDateRange(record.id, 'rivera');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>{record.rivera}</span>
            {salesInRange > 0 && (
              <span style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                Vendido: {salesInRange}
              </span>
            )}
            <TransferInput productId={record.id} branch="rivera" maxValue={record.casaCentral} />
          </div>
        );
      }
    },
    {
      title: 'Tacuarembó',
      key: 'tacuarembo',
      width: 120,
      render: (record: Product) => {
        const salesInRange = getSalesInDateRange(record.id, 'tacuarembo');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>{record.tacuarembo}</span>
            {salesInRange > 0 && (
              <span style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                Vendido: {salesInRange}
              </span>
            )}
            <TransferInput productId={record.id} branch="tacuarembo" maxValue={record.casaCentral} />
          </div>
        );
      }
    },
    {
      title: 'Pando',
      key: 'pando',
      width: 120,
      render: (record: Product) => {
        const salesInRange = getSalesInDateRange(record.id, 'pando');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>{record.pando}</span>
            {salesInRange > 0 && (
              <span style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                Vendido: {salesInRange}
              </span>
            )}
            <TransferInput productId={record.id} branch="pando" maxValue={record.casaCentral} />
          </div>
        );
      }
    },
    {
      title: 'Melo',
      key: 'melo',
      width: 120,
      render: (record: Product) => {
        const salesInRange = getSalesInDateRange(record.id, 'melo');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span>{record.melo}</span>
            {salesInRange > 0 && (
              <span style={{ color: '#ff4d4f', fontSize: '12px', fontWeight: 'bold' }}>
                Vendido: {salesInRange}
              </span>
            )}
            <TransferInput productId={record.id} branch="melo" maxValue={record.casaCentral} />
          </div>
        );
      }
    }
  ];

  return (
    <div className="transfer-container">
      <Card>
        <div className="transfer-header">
          <Title level={2}>Transferencia de Mercadería</Title>
          <Search
            placeholder="Buscar producto..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        
        <div className="transfer-stats">
          <div className="stats-container">
            <Space size="large">
              <Card size="small" className="stat-card">
                <div className="stat-number">{products.length}</div>
                <div className="stat-label">Productos</div>
              </Card>
              <Card size="small" className="stat-card">
                <div className="stat-number">{products.reduce((sum, p) => sum + p.casaCentral, 0)}</div>
                <div className="stat-label">Stock Casa Central</div>
              </Card>
              <Card size="small" className="stat-card">
                <div className="stat-number">6</div>
                <div className="stat-label">Sucursales</div>
              </Card>
              <Card size="small" className="stat-card" style={{ minWidth: '200px' }}>
                <div className="stat-label" style={{ marginBottom: '8px' }}>Período de Ventas</div>
                <RangePicker
                  size="small"
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                  format="DD/MM/YYYY"
                  placeholder={['Desde', 'Hasta']}
                  style={{ width: '100%' }}
                />
              </Card>
            </Space>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              className="enviar-button"
              onClick={handleEnviarClick}
            >
              Enviar {getTotalPendingTransfers() > 0 && `(${getTotalPendingTransfers()})`}
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={sortedProducts}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`
          }}
          onChange={handleTableChange}
          className="transfer-table"
        />
      </Card>
      
      {/* Modal de confirmación de transferencias */}
      <Modal
        title="Confirmar Transferencias"
        open={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {(() => {
            // Agrupar por sucursal y calcular totales
            const branchTotals: { [branch: string]: number } = {};
            
            Object.entries(pendingTransfers).forEach(([productId, branches]) => {
              Object.entries(branches).forEach(([branch, amount]) => {
                if (!branchTotals[branch]) {
                  branchTotals[branch] = 0;
                }
                branchTotals[branch] += amount;
              });
            });
            
            return Object.entries(branchTotals).map(([branch, totalItems]) => (
              <Card key={branch} size="small" style={{ marginBottom: 12 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    <strong>{getBranchDisplayName(branch)}:</strong> {totalItems} items
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      // Confirmar todas las transferencias para esta sucursal
                      Object.entries(pendingTransfers).forEach(([productId, branches]) => {
                        if (branches[branch]) {
                          confirmTransfer(productId, branch);
                        }
                      });
                    }}
                  >
                    Confirmado
                  </Button>
                </div>
              </Card>
            ));
          })()}
        </div>
      </Modal>
    </div>
  );
};

export default Transfer;