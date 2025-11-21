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
    'Home',
    'dashboard',
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
        fontSize: 20,
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.3s ease',
      }}
      className="home-icon-button"
    >
      <HomeOutlined />
    </div>,
    undefined,
    undefined,
    {
      fontSize: '16px',
      fontWeight: 600,
      color: '#1a1a1a',
      padding: '16px 24px',
    }
  ),
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
    title: 'Comisiones',
    description: 'Gestión de comisiones',
    path: '/finance/payroll',
    color: moduleColors.payroll.color,
    gradient: moduleColors.payroll.gradient,
    icon: <TeamOutlined />,
  },
  inventoryLog: {
    title: 'Movimientos Ventas',
    description: 'Reportes Globales',
    path: '/inventory/log',
    color: moduleColors.inventory.color,
    gradient: moduleColors.inventory.gradient,
    icon: <HistoryOutlined />,
  },
  inventoryMovements: {
    title: 'Movimientos de Inventarios',
    description: 'Historial de cambios',
    path: '/inventory/movements',
    color: moduleColors.reports.color,
    gradient: moduleColors.reports.gradient,
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
  database: {
    title: 'Base de Datos',
    description: 'Administrar base de datos',
    path: '/admin/database',
    color: moduleColors.settings.color,
    gradient: moduleColors.settings.gradient,
    icon: <DashboardOutlined />,
  },
};