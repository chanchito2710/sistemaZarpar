/**
 * Servicio de API para comunicación con el backend
 * Maneja todas las peticiones HTTP a la API de ZARPAR
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3456/api';

/**
 * Instancia configurada de axios
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token de autenticación a las peticiones
 */
apiClient.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe el token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar respuestas y errores
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 (No autorizado), redirigir al login
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o no autorizado. Redirigiendo al login...');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    console.error('Error en la petición API:', error);
    return Promise.reject(error);
  }
);

/**
 * Interfaces para las respuestas de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

/**
 * Interfaces para los modelos de datos
 */
export interface Vendedor {
  id: number;
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono?: string;
  email?: string;
  fecha_ingreso?: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  nombre_fantasia?: string;
  rut?: string;
  direccion?: string;
  email?: string;
  razon_social?: string;
  telefono?: string;
  vendedor_id?: number;
  vendedor_nombre?: string;
  vendedor_cargo?: string;
  fecha_registro: string;
  activo: boolean;
}

export interface ClienteInput {
  nombre: string;
  apellido: string;
  nombre_fantasia?: string;
  rut?: string;
  direccion?: string;
  email?: string;
  razon_social?: string;
  telefono?: string;
  vendedor_id?: number;
}

/**
 * Servicios de Vendedores
 */
export const vendedoresService = {
  /**
   * Obtener todos los vendedores activos
   */
  obtenerTodos: async (): Promise<Vendedor[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Vendedor[]>> = await apiClient.get('/vendedores');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      throw error;
    }
  },

  /**
   * Obtener vendedores por sucursal
   * @param sucursal - Nombre de la sucursal (ej: 'pando', 'maldonado')
   */
  obtenerPorSucursal: async (sucursal: string): Promise<Vendedor[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Vendedor[]>> = await apiClient.get(
        `/vendedores/sucursal/${sucursal.toLowerCase()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error al obtener vendedores de ${sucursal}:`, error);
      throw error;
    }
  },

  /**
   * Obtener un vendedor por ID
   * @param id - ID del vendedor
   */
  obtenerPorId: async (id: number): Promise<Vendedor | null> => {
    try {
      const response: AxiosResponse<ApiResponse<Vendedor>> = await apiClient.get(
        `/vendedores/${id}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error al obtener vendedor ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todas las sucursales únicas de la base de datos
   * Excluye 'Administrador' y 'Administracion'
   */
  obtenerSucursales: async (): Promise<string[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Vendedor[]>> = await apiClient.get('/vendedores');
      const vendedores = response.data.data || [];
      
      // Extraer sucursales únicas y filtrar 'Administrador' y variantes
      const sucursalesUnicas = Array.from(
        new Set(
          vendedores
            .map(v => v.sucursal)
            .filter(s => {
              if (!s) return false;
              const sucursalLower = s.toLowerCase().trim();
              // Excluir 'administrador' y 'administracion'
              return sucursalLower !== 'administrador' && 
                     sucursalLower !== 'administracion' &&
                     sucursalLower !== 'admin';
            })
        )
      );
      
      return sucursalesUnicas.sort();
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
      throw error;
    }
  },
};

/**
 * Servicios de Clientes
 */
export const clientesService = {
  /**
   * Obtener clientes por sucursal
   * @param sucursal - Nombre de la sucursal (ej: 'pando', 'maldonado')
   */
  obtenerPorSucursal: async (sucursal: string): Promise<Cliente[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Cliente[]>> = await apiClient.get(
        `/clientes/sucursal/${sucursal.toLowerCase()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error al obtener clientes de ${sucursal}:`, error);
      throw error;
    }
  },

  /**
   * Obtener un cliente por ID
   * @param sucursal - Nombre de la sucursal
   * @param id - ID del cliente
   */
  obtenerPorId: async (sucursal: string, id: number): Promise<Cliente | null> => {
    try {
      const response: AxiosResponse<ApiResponse<Cliente>> = await apiClient.get(
        `/clientes/sucursal/${sucursal.toLowerCase()}/${id}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error al obtener cliente ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo cliente
   * @param sucursal - Nombre de la sucursal
   * @param clienteData - Datos del cliente a crear
   */
  crear: async (sucursal: string, clienteData: ClienteInput): Promise<Cliente> => {
    try {
      const response: AxiosResponse<ApiResponse<Cliente>> = await apiClient.post(
        `/clientes/sucursal/${sucursal.toLowerCase()}`,
        clienteData
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos del cliente creado');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  /**
   * Actualizar un cliente existente
   * @param sucursal - Nombre de la sucursal
   * @param id - ID del cliente
   * @param clienteData - Datos del cliente a actualizar
   */
  actualizar: async (
    sucursal: string,
    id: number,
    clienteData: Partial<ClienteInput>
  ): Promise<Cliente> => {
    try {
      const response: AxiosResponse<ApiResponse<Cliente>> = await apiClient.put(
        `/clientes/sucursal/${sucursal.toLowerCase()}/${id}`,
        clienteData
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos del cliente actualizado');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  /**
   * Buscar clientes
   * @param sucursal - Nombre de la sucursal
   * @param termino - Término de búsqueda
   */
  buscar: async (sucursal: string, termino: string): Promise<Cliente[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Cliente[]>> = await apiClient.get(
        `/clientes/sucursal/${sucursal.toLowerCase()}/buscar`,
        {
          params: { q: termino },
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw error;
    }
  },
};

/**
 * Interfaces para Database Manager
 */
export interface TableStructure {
  tableName: string;
  columns: ColumnInfo[];
  recordCount: number;
}

export interface ColumnInfo {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: any;
  Extra: string;
}

export interface RecordsResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Servicios de Database Manager
 */
export const databaseService = {
  /**
   * Obtener lista de todas las tablas
   */
  obtenerTablas: async (): Promise<string[]> => {
    try {
      const response: AxiosResponse<ApiResponse<string[]>> = await apiClient.get('/database/tables');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener tablas:', error);
      throw error;
    }
  },

  /**
   * Obtener estructura de una tabla
   * @param tableName - Nombre de la tabla
   */
  obtenerEstructura: async (tableName: string): Promise<TableStructure> => {
    try {
      const response: AxiosResponse<ApiResponse<TableStructure>> = await apiClient.get(
        `/database/tables/${tableName}/structure`
      );
      return response.data.data!;
    } catch (error) {
      console.error(`Error al obtener estructura de ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Obtener registros de una tabla con paginación
   * @param tableName - Nombre de la tabla
   * @param page - Número de página
   * @param limit - Registros por página
   * @param search - Término de búsqueda
   */
  obtenerRegistros: async (
    tableName: string,
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ): Promise<RecordsResponse> => {
    try {
      const response: AxiosResponse<RecordsResponse> = await apiClient.get(
        `/database/tables/${tableName}/records`,
        {
          params: { page, limit, search },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error al obtener registros de ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar un registro
   * @param tableName - Nombre de la tabla
   * @param id - ID del registro
   * @param data - Datos a actualizar
   */
  actualizarRegistro: async (
    tableName: string,
    id: number,
    data: any
  ): Promise<any> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(
        `/database/tables/${tableName}/records/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo registro
   * @param tableName - Nombre de la tabla
   * @param data - Datos del nuevo registro
   */
  crearRegistro: async (tableName: string, data: any): Promise<any> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(
        `/database/tables/${tableName}/records`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al crear registro:', error);
      throw error;
    }
  },

  /**
   * Eliminar un registro
   * @param tableName - Nombre de la tabla
   * @param id - ID del registro
   */
  eliminarRegistro: async (tableName: string, id: number): Promise<boolean> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await apiClient.delete(
        `/database/tables/${tableName}/records/${id}`
      );
      return response.data.success;
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      throw error;
    }
  },
};

/**
 * Interfaces para Productos
 */
export interface Producto {
  id: number;
  nombre: string;
  marca?: string;
  tipo?: string;
  calidad?: string;
  codigo_barras?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductoSucursal {
  sucursal: string;
  stock: number;
  precio: number;
  stock_minimo: number;
  es_stock_principal: boolean;
  activo: boolean;
  updated_at: string;
}

export interface ProductoCompleto extends Producto {
  stock?: number;
  precio?: number;
  stock_minimo?: number;
  es_stock_principal?: boolean;
  tiene_stock_bajo?: boolean;
  sucursales?: ProductoSucursal[];
}

export interface ProductoInput {
  nombre: string;
  marca?: string;
  tipo?: string;
  calidad?: string;
  codigo_barras?: string;
}

export interface ProductoSucursalInput {
  stock: number;
  precio: number;
  stock_minimo?: number;
}

/**
 * Servicios de Productos
 */
export const productosService = {
  /**
   * Obtener todos los productos (sin información de sucursal)
   */
  obtenerTodos: async (): Promise<Producto[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Producto[]>> = await apiClient.get('/productos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  /**
   * Obtener productos de una sucursal con stock y precio
   * @param sucursal - Nombre de la sucursal
   */
  obtenerPorSucursal: async (sucursal: string): Promise<ProductoCompleto[]> => {
    try {
      const response: AxiosResponse<ApiResponse<ProductoCompleto[]>> = await apiClient.get(
        `/productos/sucursal/${sucursal.toLowerCase()}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error al obtener productos de ${sucursal}:`, error);
      throw error;
    }
  },

  /**
   * Obtener un producto específico con información de todas las sucursales
   * @param id - ID del producto
   */
  obtenerPorId: async (id: number): Promise<ProductoCompleto | null> => {
    try {
      const response: AxiosResponse<ApiResponse<ProductoCompleto>> = await apiClient.get(
        `/productos/${id}`
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto
   * @param productoData - Datos del producto
   */
  crear: async (productoData: ProductoInput): Promise<Producto> => {
    try {
      const response: AxiosResponse<ApiResponse<Producto>> = await apiClient.post(
        '/productos',
        productoData
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos del producto creado');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  },

  /**
   * Actualizar información básica de un producto
   * @param id - ID del producto
   * @param productoData - Datos a actualizar
   */
  actualizar: async (id: number, productoData: Partial<ProductoInput>): Promise<Producto> => {
    try {
      const response: AxiosResponse<ApiResponse<Producto>> = await apiClient.put(
        `/productos/${id}`,
        productoData
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos del producto actualizado');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  },

  /**
   * Actualizar stock y precio de un producto en una sucursal
   * @param id - ID del producto
   * @param sucursal - Nombre de la sucursal
   * @param data - Stock y precio a actualizar
   */
  actualizarSucursal: async (
    id: number,
    sucursal: string,
    data: Partial<ProductoSucursalInput>
  ): Promise<ProductoSucursal> => {
    try {
      const response: AxiosResponse<ApiResponse<ProductoSucursal>> = await apiClient.put(
        `/productos/${id}/sucursal/${sucursal.toLowerCase()}`,
        data
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos actualizados');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar stock/precio:', error);
      throw error;
    }
  },

  /**
   * Buscar productos
   * @param termino - Término de búsqueda
   * @param sucursal - Sucursal opcional para filtrar
   */
  buscar: async (termino: string, sucursal?: string): Promise<ProductoCompleto[]> => {
    try {
      const params: any = { q: termino };
      if (sucursal) {
        params.sucursal = sucursal.toLowerCase();
      }

      const response: AxiosResponse<ApiResponse<ProductoCompleto[]>> = await apiClient.get(
        '/productos/buscar',
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías (marcas, tipos o calidades) para los selectores
   * @param tipo - 'marca', 'tipo' o 'calidad'
   */
  obtenerCategorias: async (tipo: 'marca' | 'tipo' | 'calidad'): Promise<string[]> => {
    try {
      const response: AxiosResponse<ApiResponse<string[]>> = await apiClient.get(
        `/productos/categorias/${tipo}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error al obtener ${tipo}s:`, error);
      throw error;
    }
  },

  /**
   * Agregar nueva categoría (marca, tipo o calidad)
   * @param tipo - 'marca', 'tipo' o 'calidad'
   * @param valor - Valor de la categoría
   */
  agregarCategoria: async (tipo: 'marca' | 'tipo' | 'calidad', valor: string): Promise<void> => {
    try {
      await apiClient.post('/productos/categorias', { tipo, valor });
    } catch (error) {
      console.error(`Error al agregar ${tipo}:`, error);
      throw error;
    }
  },
};

/**
 * Servicio de health check
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.get('/health');
    return response.data.success;
  } catch (error) {
    console.error('Error en health check:', error);
    return false;
  }
};

export default apiClient;


