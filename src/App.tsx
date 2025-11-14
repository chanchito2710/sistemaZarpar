import React from 'react';
import { ConfigProvider, App as AntApp } from 'antd';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { zarparTheme } from './utils/theme';
import { AuthProvider } from './contexts/AuthContext';
import { CajaProvider } from './contexts/CajaContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import POS from './pages/pos/POS';
import Cart from './pages/pos/Cart';
import Products from './pages/products/Products';
import ProductPrices from './pages/products/ProductPrices';
import Inventory from './pages/inventory/Inventory';
import InventoryLog from './pages/inventory/InventoryLog';
import Movements from './pages/inventory/Movements';
import Returns from './pages/sales/Returns';
import Sales from './pages/sales/Sales';
import Comprobante from './pages/sales/Comprobante';
import GlobalSales from './pages/GlobalSales';
import MoneyTransfer from './pages/finance/MoneyTransfer';
import Expenses from './pages/finance/Expenses';
import Payroll from './pages/finance/Payroll';
import Cash from './pages/finance/Cash';
import Transfer from './pages/inventory/Transfer';
import ReceiveTransfers from './pages/inventory/ReceiveTransfers';
import Customers from './pages/customers/Customers';
import CustomerAccounts from './pages/customers/Accounts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DatabaseManager from './pages/admin/DatabaseManager';
import ProtectedDatabaseRoute from './components/ProtectedDatabaseRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import StaffSellers from './pages/staff/StaffSellers';
import esES from 'antd/locale/es_ES';
import 'dayjs/locale/es';

function App() {
  return (
    <ConfigProvider theme={zarparTheme} locale={esES}>
      <AntApp>
        <AuthProvider>
          <CajaProvider>
          <Router>
            <Routes>
              {/* Ruta de login (sin layout) */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas con layout */}
              <Route path="/" element={<MainLayout />}>
                {/* Dashboard - Acceso para todos */}
                <Route index element={<Dashboard />} />
                
                {/* ==================== MÓDULO DE VENTAS ==================== */}
                <Route path="pos" element={<POS />} />
                <Route path="pos/cart" element={<Cart />} />
                <Route path="sales" element={<Sales />} />
                <Route path="sales/returns" element={<Returns />} />
                <Route path="comprobante/:id" element={<Comprobante />} />
                <Route path="global-sales" element={<GlobalSales />} />
                
                {/* ==================== MÓDULO DE INVENTARIO ==================== */}
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/log" element={<InventoryLog />} />
                <Route path="inventory/movements" element={<Movements />} />
                
                {/* Solo Admin: Transferencias de Inventario */}
                <Route path="inventory/transfer" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Transfer />
                  </ProtectedRoute>
                } />
                <Route path="inventory/receive" element={<ReceiveTransfers />} />
                
                {/* ==================== MÓDULO DE PRODUCTOS ==================== */}
                {/* Solo Admin: Gestión de Productos */}
                <Route path="products" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Products />
                  </ProtectedRoute>
                } />
                
                {/* Todos: Ver lista de precios */}
                <Route path="products/prices" element={<ProductPrices />} />
                
                {/* ==================== MÓDULO DE CLIENTES ==================== */}
                <Route path="customers" element={<Customers />} />
                <Route path="customers/accounts" element={<CustomerAccounts />} />
                
                {/* ==================== MÓDULO DE FINANZAS ==================== */}
                <Route path="finance/cash" element={<Cash />} />
                <Route path="finance/expenses" element={<Expenses />} />
                <Route path="finance/payroll" element={<Payroll />} />
                <Route path="finance/money-transfer" element={<MoneyTransfer />} />
                
                {/* ==================== MÓDULO DE ADMINISTRACIÓN ==================== */}
                {/* Solo Admin: Base de Datos */}
                <Route path="admin/database" element={
                  <ProtectedRoute requireAdmin={true} requirePermisos={['gestionarBaseDatos']}>
                    <DatabaseManager />
                  </ProtectedRoute>
                } />
                
                {/* ==================== MÓDULO DE PERSONAL ==================== */}
                {/* Solo Admin: Gestión de Vendedores */}
                <Route path="staff/sellers" element={
                  <ProtectedRoute requireAdmin={true}>
                    <StaffSellers />
                  </ProtectedRoute>
                } />
                
                {/* ==================== RUTAS ADICIONALES ==================== */}
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Ruta 404 dentro del layout */}
                <Route path="*" element={
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <h1>404 - Página no encontrada</h1>
                    <p>La ruta que buscas no existe.</p>
                  </div>
                } />
              </Route>
            </Routes>
          </Router>
          </CajaProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
