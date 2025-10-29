import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Typography,
  InputNumber,
  notification,
  Modal,
  Space,
  Tag,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  DollarOutlined,
  SendOutlined,
  BankOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  UserOutlined
} from '@ant-design/icons';
import './MoneyTransfer.css';

const { Title, Text } = Typography;

// Interfaces TypeScript
interface Branch {
  id: string;
  name: string;
  balance: number;
  location: string;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  branchId?: string;
}

interface Transfer {
  id: string;
  fromBranch: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending';
}

import { BRANCHES } from '../../data/branches';

// Datos mock con balances
const mockBranches: Branch[] = BRANCHES.map(branch => ({
  id: branch.id,
  name: branch.name,
  balance: Math.floor(Math.random() * 100000) + 30000, // Balance aleatorio entre 30k y 130k
  location: branch.address.split(',')[1]?.trim() || branch.name
}));

const mockUser: User = {
  id: '1',
  name: 'Administrador Sistema',
  role: 'admin', // Cambiar a 'user' para probar vista de usuario normal
  branchId: '1' // Solo relevante si role es 'user'
};

const mockTransfers: Transfer[] = [
  {
    id: '1',
    fromBranch: 'Casa Matriz',
    amount: 15000,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '2',
    fromBranch: 'Maldonado',
    amount: 8500,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '3',
    fromBranch: 'Salto',
    amount: 12000,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'completed'
  }
];

const MoneyTransfer: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [user] = useState<User>(mockUser);
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);
  const [transferAmounts, setTransferAmounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<{ branch: string; amount: number } | null>(null);

  // Filtrar sucursales según el rol del usuario
  const visibleBranches = user.role === 'admin' 
    ? branches 
    : branches.filter(branch => branch.id === user.branchId);

  // Manejar cambio de monto
  const handleAmountChange = (branchId: string, value: number | null) => {
    setTransferAmounts(prev => ({
      ...prev,
      [branchId]: value || 0
    }));
  };

  // Validar monto
  const validateAmount = (branchId: string, amount: number): string | null => {
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return 'Sucursal no encontrada';
    if (amount <= 0) return 'El monto debe ser mayor a 0';
    if (amount > branch.balance) return 'Monto excede el saldo disponible';
    return null;
  };

  // Procesar envío de dinero
  const handleSendMoney = async (branchId: string) => {
    const amount = transferAmounts[branchId] || 0;
    const branch = branches.find(b => b.id === branchId);
    
    if (!branch) return;

    const validationError = validateAmount(branchId, amount);
    if (validationError) {
      notification.error({
        message: 'Error de validación',
        description: validationError,
        placement: 'topRight'
      });
      return;
    }

    setLoading(prev => ({ ...prev, [branchId]: true }));

    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Actualizar saldo de la sucursal
      setBranches(prev => prev.map(b => 
        b.id === branchId 
          ? { ...b, balance: b.balance - amount }
          : b
      ));

      // Agregar transferencia al historial
      const newTransfer: Transfer = {
        id: Date.now().toString(),
        fromBranch: branch.name,
        amount,
        timestamp: new Date(),
        status: 'completed'
      };
      setTransfers(prev => [newTransfer, ...prev]);

      // Limpiar monto
      setTransferAmounts(prev => ({ ...prev, [branchId]: 0 }));

      // Mostrar modal de éxito
      setLastTransfer({ branch: branch.name, amount });
      setSuccessModalVisible(true);

    } catch (error) {
      notification.error({
        message: 'Error al enviar dinero',
        description: 'Ocurrió un error durante el procesamiento',
        placement: 'topRight'
      });
    } finally {
      setLoading(prev => ({ ...prev, [branchId]: false }));
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="money-transfer-container">
      <div className="money-transfer-header">
        <Title level={2}>
          <BankOutlined /> Transferencia de Dinero
        </Title>
        <Text type="secondary">
          {user.role === 'admin' 
            ? 'Vista de Administrador - Todas las Sucursales'
            : `Vista de Usuario - ${visibleBranches[0]?.name || 'Su Sucursal'}`
          }
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Cards de Sucursales */}
        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            {visibleBranches.map(branch => {
              const amount = transferAmounts[branch.id] || 0;
              const isLoading = loading[branch.id] || false;
              const validationError = amount > 0 ? validateAmount(branch.id, amount) : null;
              
              return (
                <Col xs={24} md={12} key={branch.id}>
                  <Card
                    className="branch-card"
                    title={
                      <Space>
                        <BankOutlined />
                        <span>{branch.name}</span>
                        <Tag color="blue">{branch.location}</Tag>
                      </Space>
                    }
                    extra={
                      <Text strong className="balance-text">
                        {formatCurrency(branch.balance)}
                      </Text>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text type="secondary">Saldo Disponible:</Text>
                        <br />
                        <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                          {formatCurrency(branch.balance)}
                        </Text>
                      </div>
                      
                      <Divider style={{ margin: '12px 0' }} />
                      
                      <div>
                        <Text>Monto a Enviar:</Text>
                        <InputNumber
                          style={{ width: '100%', marginTop: '8px' }}
                          placeholder="Ingrese el monto"
                          value={amount || undefined}
                          onChange={(value) => handleAmountChange(branch.id, value)}
                          min={0}
                          max={branch.balance}
                          formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                          prefix={<DollarOutlined />}
                          status={validationError ? 'error' : undefined}
                        />
                        {validationError && (
                          <Text type="danger" style={{ fontSize: '12px' }}>
                            {validationError}
                          </Text>
                        )}
                      </div>
                      
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        loading={isLoading}
                        disabled={!amount || amount <= 0 || !!validationError}
                        onClick={() => handleSendMoney(branch.id)}
                        style={{ width: '100%', marginTop: '12px' }}
                        size="large"
                      >
                        {isLoading ? 'Enviando...' : 'Enviar Dinero'}
                      </Button>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Col>

        {/* Historial de Transferencias */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <span>Historial Reciente</span>
              </Space>
            }
            className="history-card"
          >
            <List
              dataSource={transfers.slice(0, 10)}
              renderItem={(transfer) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<SendOutlined />} 
                        style={{ backgroundColor: '#52c41a' }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{formatCurrency(transfer.amount)}</Text>
                        <Tag color="green">Completado</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">{transfer.fromBranch}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatDate(transfer.timestamp)}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal de Éxito */}
      <Modal
        open={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={null}
        centered
        className="success-modal"
        closable={false}
        maskClosable={true}
      >
        <div className="success-content">
          <div className="success-icon">
            <CheckCircleOutlined />
          </div>
          <Title level={3} className="success-title">
            ¡Dinero Enviado!
          </Title>
          {lastTransfer && (
            <div className="success-details">
              <Text className="success-amount">
                {formatCurrency(lastTransfer.amount)}
              </Text>
              <Text type="secondary">
                desde {lastTransfer.branch}
              </Text>
            </div>
          )}
          <div className="success-animation">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MoneyTransfer;