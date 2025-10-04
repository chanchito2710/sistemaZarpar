// Tipos principales del Sistema Zarpar

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'seller' | 'cashier';
  branchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  documentNumber?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  userId: string;
  branchId: string;
  totalAmount: number;
  discount: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface Inventory {
  id: string;
  productId: string;
  branchId: string;
  quantity: number;
  minStock: number;
  updatedAt: string;
  product?: Product;
  branch?: Branch;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  branchId: string;
  userId: string;
  movementType: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reference?: string;
  createdAt: string;
  product?: Product;
  user?: User;
}

export interface CustomerAccount {
  id: string;
  customerId: string;
  balance: number;
  creditLimit: number;
  updatedAt: string;
  customer?: Customer;
}

export interface Return {
  id: string;
  saleId: string;
  userId: string;
  amount: number;
  reason?: string;
  createdAt: string;
  sale?: Sale;
  user?: User;
}

// Tipos para la UI
export interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  gradient: string;
}

export interface DashboardMetric {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Tipos para formularios
export interface LoginForm {
  email: string;
  password: string;
}

export interface ProductForm {
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  active: boolean;
}

export interface CustomerForm {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  documentNumber?: string;
}

export interface SaleForm {
  customerId?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'credit';
  discount: number;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para el store
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export interface AppState {
  currentBranch: Branch | null;
  branches: Branch[];
  setCurrentBranch: (branch: Branch) => void;
  setBranches: (branches: Branch[]) => void;
}