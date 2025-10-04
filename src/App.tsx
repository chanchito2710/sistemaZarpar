import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { zarparTheme } from './utils/theme';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import POS from './pages/pos/POS';
import Products from './pages/products/Products';
import PriceEditor from './pages/products/PriceEditor';

import Inventory from './pages/inventory/Inventory';
import InventoryLog from './pages/inventory/InventoryLog';
import Returns from './pages/sales/Returns';
import Sales from './pages/sales/Sales';
import MoneyTransfer from './pages/finance/MoneyTransfer';
import Expenses from './pages/finance/Expenses';
import Payroll from './pages/finance/Payroll';
import Banks from './pages/finance/Banks';
import Cash from './pages/finance/Cash';
import Transfer from './pages/inventory/Transfer';
import CustomerAccounts from './pages/CustomerAccounts';
import Customers from './pages/customers/Customers';
import Staff from './pages/staff/Staff';
import esES from 'antd/locale/es_ES';
import 'dayjs/locale/es';

function App() {
  return (
    <ConfigProvider theme={zarparTheme} locale={esES}>
      <Router>
        <Routes>
          {/* Ruta principal con layout */}
          <Route path="/" element={<MainLayout />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            
            {/* Módulo de Ventas */}
            <Route path="pos" element={<POS />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/returns" element={<Returns />} />
            
            {/* Módulo de Inventario */}
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/log" element={<InventoryLog />} />
            <Route path="inventory/movements" element={<PlaceholderPage title="Bitácora de Movimientos" />} />
            <Route path="inventory/transfer" element={<Transfer />} />
            
            {/* Módulo de Productos */}
            <Route path="products" element={<Products />} />
            <Route path="products/prices" element={<PriceEditor />} />

            
            {/* Módulo de Clientes */}
            <Route path="customers" element={<Customers />} />
            <Route path="customers/accounts" element={<CustomerAccounts />} />
            
            {/* Módulo de Finanzas */}
            <Route path="finance/cash" element={<Cash />} />
            <Route path="finance/banks" element={<Banks />} />
            <Route path="finance/expenses" element={<Expenses />} />
            <Route path="finance/payroll" element={<Payroll />} />
            <Route path="finance/money-transfer" element={<MoneyTransfer />} />
            
            {/* Módulo de Personal */}
            <Route path="staff/sellers" element={<Staff />} />
            

            
            {/* Rutas adicionales */}
            <Route path="profile" element={<PlaceholderPage title="Mi Perfil" />} />
            <Route path="settings" element={<PlaceholderPage title="Configuración" />} />
          </Route>
          
          {/* Ruta de login (sin layout) */}
          <Route path="/login" element={<PlaceholderPage title="Iniciar Sesión" />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
