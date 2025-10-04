// Interfaces para el sistema de gestión de productos

export interface ProductStock {
  branchId: string;
  quantity: number;
  minStock?: number;
  maxStock?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductPrice {
  branchId: string;
  price: number;
  cost?: number;
  margin?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  description?: string;
  sku?: string;
  barcode?: string;
  images: ProductImage[];
  basePrice: number;
  baseCost?: number;
  prices: ProductPrice[];
  stock: ProductStock[];
  status: 'active' | 'inactive' | 'discontinued';
  isNew?: boolean;
  tags?: string[];
  specifications?: { [key: string]: string };
  supplier?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  warranty?: number; // meses
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type ProductCategory = 
  | 'Display'
  | 'Baterías'
  | 'Tapas'
  | 'Flex'
  | 'Placa Carga'
  | 'Herramientas'
  | 'Carcasa'
  | 'Tapa Trasera'
  | 'Hidrogel'
  | 'Pin de Carga';

export interface ProductFormData {
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  description?: string;
  sku?: string;
  barcode?: string;
  basePrice: number;
  baseCost?: number;
  status: 'active' | 'inactive';
  tags?: string[];
  specifications?: { [key: string]: string };
  supplier?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  warranty?: number;
  stock: { [branchId: string]: number };
  prices?: { [branchId: string]: number };
}

export interface ProductFilter {
  search?: string;
  category?: ProductCategory | 'all';
  brand?: string;
  status?: 'active' | 'inactive' | 'all';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  branchId?: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  categoriesCount: { [category: string]: number };
  brandsCount: { [brand: string]: number };
}

// Constantes para categorías y marcas
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Display',
  'Baterías',
  'Tapas',
  'Flex',
  'Placa Carga',
  'Herramientas',
  'Carcasa',
  'Tapa Trasera',
  'Hidrogel',
  'Pin de Carga'
];

export const PRODUCT_BRANDS = [
  'iPhone',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'TCL',
  'ZTE',
  'Motorola',
  'LG',
  'Sony',
  'OnePlus',
  'Oppo',
  'Vivo',
  'Realme',
  'Honor',
  'Nokia',
  'Alcatel',
  'Genérico'
];

// Función para obtener el orden de categorías
export const getCategoryOrder = (category: ProductCategory): number => {
  const categoryOrder: { [key in ProductCategory]: number } = {
    'Display': 1,
    'Baterías': 2,
    'Tapas': 3,
    'Flex': 4,
    'Placa Carga': 5,
    'Herramientas': 6,
    'Carcasa': 7,
    'Tapa Trasera': 8,
    'Hidrogel': 9,
    'Pin de Carga': 10
  };
  return categoryOrder[category] || 999;
};

// Función para ordenar productos
export const sortProducts = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => {
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

// Función para obtener el stock de un producto en una sucursal específica
export const getProductStock = (product: Product, branchId: string): number => {
  const stock = product.stock.find(s => s.branchId === branchId);
  return stock ? stock.quantity : 0;
};

// Función para obtener el precio de un producto en una sucursal específica
export const getProductPrice = (product: Product, branchId: string): number => {
  const price = product.prices.find(p => p.branchId === branchId);
  return price ? price.price : product.basePrice;
};

// Función para verificar si un producto tiene stock bajo
export const isLowStock = (product: Product, branchId?: string): boolean => {
  if (branchId) {
    const stock = product.stock.find(s => s.branchId === branchId);
    return stock ? (stock.quantity <= (stock.minStock || 5)) : true;
  }
  
  // Verificar si tiene stock bajo en alguna sucursal
  return product.stock.some(stock => stock.quantity <= (stock.minStock || 5));
};

// Función para verificar si un producto está sin stock
export const isOutOfStock = (product: Product, branchId?: string): boolean => {
  if (branchId) {
    const stock = product.stock.find(s => s.branchId === branchId);
    return stock ? stock.quantity === 0 : true;
  }
  
  // Verificar si está sin stock en todas las sucursales
  return product.stock.every(stock => stock.quantity === 0);
};

// Función para calcular el stock total de un producto
export const getTotalStock = (product: Product): number => {
  return product.stock.reduce((total, stock) => total + stock.quantity, 0);
};

// Función para calcular el valor total del inventario de un producto
export const getProductInventoryValue = (product: Product): number => {
  const totalStock = getTotalStock(product);
  return totalStock * (product.baseCost || product.basePrice);
};