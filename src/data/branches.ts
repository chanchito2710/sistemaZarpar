// Configuración centralizada de sucursales y vendedores
import { Branch, User } from '../types';

// Definición de sucursales del sistema
export const BRANCHES: Branch[] = [
  {
    id: '1',
    name: 'Casa Matriz',
    address: 'Av. 18 de Julio 1234, Montevideo',
    phone: '2901-1234',
    active: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Maldonado',
    address: 'Av. Roosevelt 567, Maldonado',
    phone: '4222-5678',
    active: true,
    createdAt: '2023-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Paysandú',
    address: 'Calle 18 de Julio 789, Paysandú',
    phone: '4722-9012',
    active: true,
    createdAt: '2023-03-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Salto',
    address: 'Calle Uruguay 321, Salto',
    phone: '4733-3456',
    active: true,
    createdAt: '2023-04-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Rivera',
    address: 'Calle Sarandí 147, Rivera',
    phone: '4622-7890',
    active: true,
    createdAt: '2023-05-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Tacuarembó',
    address: 'Av. Flores 456, Tacuarembó',
    phone: '4632-1234',
    active: true,
    createdAt: '2023-06-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Pando',
    address: 'Calle Artigas 789, Pando',
    phone: '2292-5678',
    active: true,
    createdAt: '2023-07-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'Melo',
    address: 'Av. Batlle y Ordóñez 123, Melo',
    phone: '4642-9012',
    active: true,
    createdAt: '2023-08-01T00:00:00Z'
  }
];

// Definición de vendedores por sucursal
export const SELLERS: User[] = [
  // Casa Matriz
  {
    id: 'U001',
    email: 'ana.garcia@zarpar.com',
    name: 'Ana García',
    role: 'manager',
    branchId: '1',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 'U002',
    email: 'carlos.ruiz@zarpar.com',
    name: 'Carlos Ruiz',
    role: 'seller',
    branchId: '1',
    createdAt: '2023-01-20T00:00:00Z',
    updatedAt: '2023-01-20T00:00:00Z'
  },
  {
    id: 'U003',
    email: 'maria.lopez@zarpar.com',
    name: 'María López',
    role: 'cashier',
    branchId: '1',
    createdAt: '2023-01-25T00:00:00Z',
    updatedAt: '2023-01-25T00:00:00Z'
  },
  
  // Maldonado
  {
    id: 'U004',
    email: 'luis.rodriguez@zarpar.com',
    name: 'Luis Rodríguez',
    role: 'manager',
    branchId: '2',
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2023-02-10T00:00:00Z'
  },
  {
    id: 'U005',
    email: 'elena.fernandez@zarpar.com',
    name: 'Elena Fernández',
    role: 'seller',
    branchId: '2',
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z'
  },
  
  // Paysandú
  {
    id: 'U006',
    email: 'roberto.silva@zarpar.com',
    name: 'Roberto Silva',
    role: 'manager',
    branchId: '3',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z'
  },
  {
    id: 'U007',
    email: 'valentina.ruiz@zarpar.com',
    name: 'Valentina Ruiz',
    role: 'seller',
    branchId: '3',
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z'
  },
  
  // Salto
  {
    id: 'U008',
    email: 'mateo.vega@zarpar.com',
    name: 'Mateo Vega',
    role: 'manager',
    branchId: '4',
    createdAt: '2023-04-10T00:00:00Z',
    updatedAt: '2023-04-10T00:00:00Z'
  },
  {
    id: 'U009',
    email: 'isabella.torres@zarpar.com',
    name: 'Isabella Torres',
    role: 'seller',
    branchId: '4',
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2023-04-15T00:00:00Z'
  },
  
  // Rivera
  {
    id: 'U010',
    email: 'sebastian.herrera@zarpar.com',
    name: 'Sebastián Herrera',
    role: 'manager',
    branchId: '5',
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z'
  },
  {
    id: 'U011',
    email: 'lucia.paredes@zarpar.com',
    name: 'Lucía Paredes',
    role: 'seller',
    branchId: '5',
    createdAt: '2023-05-15T00:00:00Z',
    updatedAt: '2023-05-15T00:00:00Z'
  },
  
  // Tacuarembó
  {
    id: 'U012',
    email: 'andres.romero@zarpar.com',
    name: 'Andrés Romero',
    role: 'manager',
    branchId: '6',
    createdAt: '2023-06-10T00:00:00Z',
    updatedAt: '2023-06-10T00:00:00Z'
  },
  {
    id: 'U013',
    email: 'gabriela.soto@zarpar.com',
    name: 'Gabriela Soto',
    role: 'seller',
    branchId: '6',
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z'
  },
  
  // Pando
  {
    id: 'U014',
    email: 'fernando.aguilar@zarpar.com',
    name: 'Fernando Aguilar',
    role: 'manager',
    branchId: '7',
    createdAt: '2023-07-10T00:00:00Z',
    updatedAt: '2023-07-10T00:00:00Z'
  },
  {
    id: 'U015',
    email: 'martina.flores@zarpar.com',
    name: 'Martina Flores',
    role: 'seller',
    branchId: '7',
    createdAt: '2023-07-15T00:00:00Z',
    updatedAt: '2023-07-15T00:00:00Z'
  },
  
  // Melo
  {
    id: 'U016',
    email: 'emilio.ramos@zarpar.com',
    name: 'Emilio Ramos',
    role: 'manager',
    branchId: '8',
    createdAt: '2023-08-10T00:00:00Z',
    updatedAt: '2023-08-10T00:00:00Z'
  },
  {
    id: 'U017',
    email: 'renata.ortiz@zarpar.com',
    name: 'Renata Ortiz',
    role: 'seller',
    branchId: '8',
    createdAt: '2023-08-15T00:00:00Z',
    updatedAt: '2023-08-15T00:00:00Z'
  }
];

// Funciones utilitarias
export const getBranchById = (id: string): Branch | undefined => {
  return BRANCHES.find(branch => branch.id === id);
};

export const getBranchByName = (name: string): Branch | undefined => {
  return BRANCHES.find(branch => branch.name.toLowerCase() === name.toLowerCase());
};

export const getSellersByBranch = (branchId: string): User[] => {
  return SELLERS.filter(seller => seller.branchId === branchId);
};

export const getActiveBranches = (): Branch[] => {
  return BRANCHES.filter(branch => branch.active);
};

export const getAllSellers = (): User[] => {
  return SELLERS;
};

export const getSellerById = (id: string): User | undefined => {
  return SELLERS.find(seller => seller.id === id);
};

// Opciones para selects
export const getBranchOptions = () => {
  return BRANCHES.map(branch => ({
    value: branch.id,
    label: branch.name,
    disabled: !branch.active
  }));
};

export const getSellerOptions = (branchId?: string) => {
  const sellers = branchId ? getSellersByBranch(branchId) : SELLERS;
  return sellers.map(seller => ({
    value: seller.id,
    label: seller.name,
    role: seller.role
  }));
};