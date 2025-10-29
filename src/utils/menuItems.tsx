import React from 'react';
import {
  ShopOutlined,
  RollbackOutlined,
  SwapOutlined,
  SendOutlined,
  InboxOutlined,
  DollarOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LineChartOutlined,
  CreditCardOutlined,
  BankOutlined,
  CalculatorOutlined,
  GiftOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  HomeOutlined,
  DashboardOutlined,
  BuildOutlined,
} from '@ant-design/icons';
import { moduleColors } from './theme';
import type { MenuProps } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

// Función helper para crear elementos del menú con estilos personalizados
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  style?: React.CSSProperties
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
    style,
  } as MenuItem;
}

// Componente para iconos con gradiente
const GradientIcon: React.FC<{ 
  icon: React.ReactNode; 
  gradient: string; 
  color: string;
}> = ({ icon, gradient, color }) => (
  <div
    style={
      {
        width: 24,
        height: 24,
        borderRadius: 6,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 14,
        boxShadow: `0 2px 8px ${color}30`,
      }
    }
  >
    {icon}
  </div>
);

export const menuItems: MenuItem[] = [
  getItem(
    'Dashboard',
    'dashboard',
    <GradientIcon 
      icon={<DashboardOutlined />} 
      gradient={moduleColors.settings.gradient}
      color={moduleColors.settings.color}
    />
  ),
  
  // Sección de Ventas
  getItem('VENTAS', 'sales-group', null, [
    getItem(
      'Punto de Venta',
      'pos',
      <GradientIcon 
        icon={<ShopOutlined />} 
        gradient={moduleColors.pos.gradient}
        color={moduleColors.pos.color}
      />
    ),
    getItem(
      'Historial de Ventas',
      'sales',
      <GradientIcon 
        icon={<LineChartOutlined />} 
        gradient={moduleColors.sales.gradient}
        color={moduleColors.sales.color}
      />
    ),
    getItem(
      'Devoluciones',
      'returns',
      <GradientIcon 
        icon={<RollbackOutlined />} 
        gradient={moduleColors.returns.gradient}
        color={moduleColors.returns.color}
      />
    ),
  ], 'group'),

  // Sección de Inventario
  getItem('INVENTARIO', 'inventory-group', null, [
    getItem(
      'Stock',
      'inventory',
      <GradientIcon 
        icon={<InboxOutlined />} 
        gradient={moduleColors.inventory.gradient}
        color={moduleColors.inventory.color}
      />
    ),
    getItem(
      'Bitácora de Inventario',
      'inventory/log',
      <GradientIcon 
        icon={<HistoryOutlined />} 
        gradient={moduleColors.inventory.gradient}
        color={moduleColors.inventory.color}
      />
    ),
    getItem(
      'Transfer Mercadería',
      'inventory/transfer',
      <GradientIcon 
        icon={<SwapOutlined />} 
        gradient={moduleColors.transfer.gradient}
        color={moduleColors.transfer.color}
      />
    ),
  ], 'group'),

  // Sección de Productos
  getItem('PRODUCTOS', 'products-group', null, [
    getItem(
      'Catálogo de Productos',
      'products',
      <GradientIcon 
        icon={<GiftOutlined />} 
        gradient={moduleColors.products.gradient}
        color={moduleColors.products.color}
      />
    ),
    getItem(
      'Lista de Precios',
      'products/prices',
      <GradientIcon 
        icon={<UnorderedListOutlined />} 
        gradient={moduleColors.products.gradient}
        color={moduleColors.products.color}
      />
    ),

  ], 'group'),

  // Sección de Clientes
  getItem('CLIENTES', 'customers-group', null, [
    getItem(
      'Base de Clientes',
      'customers',
      <GradientIcon 
        icon={<UserOutlined />} 
        gradient={moduleColors.customers.gradient}
        color={moduleColors.customers.color}
      />
    ),
    getItem(
      'Cuentas Corrientes',
      'customers/accounts',
      <GradientIcon 
        icon={<CreditCardOutlined />} 
        gradient={moduleColors.customers.gradient}
        color={moduleColors.customers.color}
      />
    ),
  ], 'group'),

  // Sección de Finanzas
  getItem('FINANZAS', 'finance-group', null, [
    getItem(
      'Caja',
      'finance/cash',
      <GradientIcon 
        icon={<CalculatorOutlined />} 
        gradient={moduleColors.money.gradient}
        color={moduleColors.money.color}
      />
    ),
    getItem(
      'Bancos',
      'finance/banks',
      <GradientIcon 
        icon={<BankOutlined />} 
        gradient={moduleColors.money.gradient}
        color={moduleColors.money.color}
      />
    ),
    getItem(
      'Gastos',
      'finance/expenses',
      <GradientIcon 
        icon={<DollarOutlined />} 
        gradient={moduleColors.expenses.gradient}
        color={moduleColors.expenses.color}
      />
    ),
    getItem(
      'Sueldos',
      'finance/payroll',
      <GradientIcon 
        icon={<TeamOutlined />} 
        gradient={moduleColors.payroll.gradient}
        color={moduleColors.payroll.color}
      />
    ),
    getItem(
      'Envío de Dinero',
      'finance/money-transfer',
      <GradientIcon 
        icon={<SendOutlined />} 
        gradient={moduleColors.money.gradient}
        color={moduleColors.money.color}
      />
    ),
  ], 'group'),

  // Sección de Personal
  getItem('PERSONAL', 'staff-group', null, [
    getItem(
      'Gestionar',
      'staff/sellers',
      <GradientIcon 
        icon={<BuildOutlined />} 
        gradient={moduleColors.customers.gradient}
        color={moduleColors.customers.color}
      />
    ),
  ], 'group'),

  // Sección de Administración
  getItem('ADMINISTRACIÓN', 'admin-group', null, [
    getItem(
      'Base de Datos',
      'admin/database',
      <GradientIcon 
        icon={<DashboardOutlined />} 
        gradient={moduleColors.settings.gradient}
        color={moduleColors.settings.color}
      />
    ),
  ], 'group'),

];

// Mapeo de rutas para navegación
export const routeMap: Record<string, string> = {
  'dashboard': '/',
  'pos': '/pos',
  'sales': '/sales',
  'returns': '/sales/returns',
  'inventory': '/inventory',
  'inventory/log': '/inventory/log',
  'inventory/movements': '/inventory/movements',
  'inventory/transfer': '/inventory/transfer',
  'products': '/products',
  'products/prices': '/products/prices',

  'customers': '/customers',
  'customers/accounts': '/customers/accounts',
  'finance/cash': '/finance/cash',
  'finance/banks': '/finance/banks',
  'finance/expenses': '/finance/expenses',
  'finance/payroll': '/finance/payroll',
  'finance/money-transfer': '/finance/money-transfer',
  'staff/sellers': '/staff/sellers',
  'admin/database': '/admin/database',
};

// Información de los módulos para el dashboard
export const moduleInfo = {
  pos: {
    title: 'Punto de Venta',
    description: 'Procesar ventas y pagos',
    path: '/pos',
    color: moduleColors.pos.color,
    gradient: moduleColors.pos.gradient,
    icon: <ShopOutlined />,
  },
  returns: {
    title: 'Devoluciones',
    description: 'Gestionar devoluciones',
    path: '/sales/returns',
    color: moduleColors.returns.color,
    gradient: moduleColors.returns.gradient,
    icon: <RollbackOutlined />,
  },
  transfer: {
    title: 'Transfer Mercadería',
    description: 'Transferir entre sucursales',
    path: '/inventory/transfer',
    color: moduleColors.transfer.color,
    gradient: moduleColors.transfer.gradient,
    icon: <SwapOutlined />,
  },
  money: {
    title: 'Envío de Dinero',
    description: 'Transferencias de dinero',
    path: '/finance/money-transfer',
    color: moduleColors.money.color,
    gradient: moduleColors.money.gradient,
    icon: <SendOutlined />,
  },
  inventory: {
    title: 'Stock',
    description: 'Control de inventario',
    path: '/inventory',
    color: moduleColors.inventory.color,
    gradient: moduleColors.inventory.gradient,
    icon: <InboxOutlined />,
  },
  expenses: {
    title: 'Gastos',
    description: 'Control de gastos',
    path: '/finance/expenses',
    color: moduleColors.expenses.color,
    gradient: moduleColors.expenses.gradient,
    icon: <DollarOutlined />,
  },
  payroll: {
    title: 'Sueldos',
    description: 'Gestión de nómina',
    path: '/finance/payroll',
    color: moduleColors.payroll.color,
    gradient: moduleColors.payroll.gradient,
    icon: <TeamOutlined />,
  },
  inventoryLog: {
    title: 'Bitácora de Inventario',
    description: 'Historial de inventario',
    path: '/inventory/log',
    color: moduleColors.inventory.color,
    gradient: moduleColors.inventory.gradient,
    icon: <HistoryOutlined />,
  },
  movements: {
    title: 'Bitácora de Movimientos',
    description: 'Historial de movimientos',
    path: '/inventory/movements',
    color: moduleColors.inventory.color,
    gradient: moduleColors.inventory.gradient,
    icon: <SwapOutlined />,
  },
  sales: {
    title: 'Ventas',
    description: 'Historial de ventas',
    path: '/sales',
    color: moduleColors.sales.color,
    gradient: moduleColors.sales.gradient,
    icon: <LineChartOutlined />,
  },
  accounts: {
    title: 'Cuentas Corrientes',
    description: 'Créditos de clientes',
    path: '/customers/accounts',
    color: moduleColors.customers.color,
    gradient: moduleColors.customers.gradient,
    icon: <CreditCardOutlined />,
  },
  banks: {
    title: 'Bancos',
    description: 'Gestión bancaria',
    path: '/finance/banks',
    color: moduleColors.money.color,
    gradient: moduleColors.money.gradient,
    icon: <BankOutlined />,
  },
  cash: {
    title: 'Caja',
    description: 'Control de efectivo',
    path: '/finance/cash',
    color: moduleColors.money.color,
    gradient: moduleColors.money.gradient,
    icon: <CalculatorOutlined />,
  },
  products: {
    title: 'Productos',
    description: 'Catálogo de productos',
    path: '/products',
    color: moduleColors.products.color,
    gradient: moduleColors.products.gradient,
    icon: <GiftOutlined />,
  },
  customers: {
    title: 'Clientes',
    description: 'Base de clientes',
    path: '/customers',
    color: moduleColors.customers.color,
    gradient: moduleColors.customers.gradient,
    icon: <UserOutlined />,
  },
  sellers: {
    title: 'Gestionar',
    description: 'Gestión de personal',
    path: '/staff/sellers',
    color: moduleColors.customers.color,
    gradient: moduleColors.customers.gradient,
    icon: <BuildOutlined />,
  },

  priceList: {
    title: 'Lista de Precios',
    description: 'Listas de precios',
    path: '/products/prices',
    color: moduleColors.products.color,
    gradient: moduleColors.products.gradient,
    icon: <UnorderedListOutlined />,
  },
  branches: {
    title: 'Sucursales',
    description: 'Gestión de sucursales',
    path: '/branches',
    color: moduleColors.customers.color,
    gradient: moduleColors.customers.gradient,
    icon: <HomeOutlined />,
  },
  database: {
    title: 'Base de Datos',
    description: 'Administrar base de datos',
    path: '/admin/database',
    color: moduleColors.settings.color,
    gradient: moduleColors.settings.gradient,
    icon: <DashboardOutlined />,
  },
};