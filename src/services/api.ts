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

  /**
   * Crear un nuevo vendedor
   * @param vendedorData - Datos del vendedor a crear
   */
  crear: async (vendedorData: Partial<Vendedor> & { password: string }): Promise<Vendedor> => {
    try {
      const response: AxiosResponse<ApiResponse<Vendedor>> = await apiClient.post(
        '/vendedores',
        vendedorData
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos del vendedor creado');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al crear vendedor:', error);
      throw error;
    }
  },

  /**
   * Actualizar un vendedor existente
   * @param id - ID del vendedor
   * @param vendedorData - Datos del vendedor a actualizar
   */
  actualizar: async (
    id: number,
    vendedorData: Partial<Vendedor>
  ): Promise<Vendedor> => {
    try {
      const response: AxiosResponse<ApiResponse<Vendedor>> = await apiClient.put(
        `/vendedores/${id}`,
        vendedorData
      );
      if (!response.data.data) {
        throw new Error('No se recibieron datos del vendedor actualizado');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      throw error;
    }
  },

  /**
   * Eliminar (desactivar) un vendedor
   * @param id - ID del vendedor
   */
  eliminar: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/vendedores/${id}`);
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
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

// ============================================================
// SERVICIOS DE VENTAS
// ============================================================

/**
 * Interfaces para Ventas
 */
export interface Venta {
  id: number;
  numero_venta: string;
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  vendedor_id: number;
  vendedor_nombre: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'cuenta_corriente';
  estado_pago: 'pagado' | 'pendiente' | 'parcial';
  saldo_pendiente: number;
  fecha_venta: string;
  fecha_vencimiento?: string;
  observaciones?: string;
  total_productos?: number; // Agregado por JOIN
}

export interface VentaDetalle {
  id?: number;
  venta_id?: number;
  producto_id: number;
  producto_nombre: string;
  producto_marca?: string;
  producto_codigo?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CrearVentaInput {
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  vendedor_id: number;
  vendedor_nombre: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'cuenta_corriente';
  productos: VentaDetalle[];
  observaciones?: string;
  fecha_vencimiento?: string;
}

export interface MovimientoCuentaCorriente {
  id: number;
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  tipo: 'venta' | 'pago' | 'ajuste';
  debe: number;
  haber: number;
  saldo: number;
  venta_id?: number;
  pago_id?: number;
  descripcion?: string;
  fecha_movimiento: string;
}

export interface ResumenCuentaCorriente {
  total_debe: number;
  total_haber: number;
  saldo_actual: number;
}

export interface PagoCuentaCorriente {
  sucursal: string;
  cliente_id: number;
  cliente_nombre: string;
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia';
  comprobante?: string;
  observaciones?: string;
}

export interface ReporteVentas {
  periodo: {
    desde: string;
    hasta: string;
  };
  resumen: {
    total_ventas: number;
    total_vendido: number;
    total_descuentos: number;
    promedio_venta: number;
  };
  metodos_pago: Array<{
    metodo_pago: string;
    cantidad: number;
    total: number;
  }>;
  ventas_por_dia: Array<{
    fecha: string;
    cantidad: number;
    total: number;
  }>;
  top_productos: Array<{
    producto_nombre: string;
    producto_marca?: string;
    cantidad_vendida: number;
    total_vendido: number;
  }>;
  top_clientes: Array<{
    cliente_id: number;
    cliente_nombre: string;
    total_compras: number;
    total_gastado: number;
  }>;
}

/**
 * Servicios de Ventas
 */
export const ventasService = {
  /**
   * Crear una nueva venta
   */
  crear: async (venta: CrearVentaInput): Promise<any> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/ventas', venta);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas por sucursal con filtros opcionales
   */
  obtenerPorSucursal: async (
    sucursal: string,
    filtros?: {
      fecha_inicio?: string;
      fecha_fin?: string;
      cliente_id?: number;
      metodo_pago?: string;
      estado_pago?: string;
    }
  ): Promise<Venta[]> => {
    try {
      const params = new URLSearchParams();
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = `/ventas/sucursal/${sucursal}${params.toString() ? `?${params.toString()}` : ''}`;
      const response: AxiosResponse<ApiResponse<Venta[]>> = await apiClient.get(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle completo de una venta
   */
  obtenerDetalle: async (id: number): Promise<Venta & { productos: VentaDetalle[] }> => {
    try {
      const response: AxiosResponse<ApiResponse<Venta & { productos: VentaDetalle[] }>> = 
        await apiClient.get(`/ventas/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      throw error;
    }
  },

  /**
   * Obtener ventas de un cliente específico
   */
  obtenerPorCliente: async (sucursal: string, clienteId: number): Promise<Venta[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Venta[]>> = 
        await apiClient.get(`/ventas/cliente/${sucursal}/${clienteId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener ventas del cliente:', error);
      throw error;
    }
  },

  /**
   * Obtener reportes de ventas por rango de fechas
   */
  obtenerReportes: async (
    sucursal: string,
    fechaInicio: string,
    fechaFin: string
  ): Promise<ReporteVentas> => {
    try {
      const response: AxiosResponse<ApiResponse<ReporteVentas>> = 
        await apiClient.get(`/ventas/reportes/${sucursal}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  },
};

/**
 * Servicios de Cuenta Corriente
 */
export const cuentaCorrienteService = {
  /**
   * Obtener estado de cuenta de un cliente
   */
  obtenerEstadoCuenta: async (sucursal: string, clienteId: number): Promise<{
    movimientos: MovimientoCuentaCorriente[];
    resumen: ResumenCuentaCorriente;
  }> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = 
        await apiClient.get(`/ventas/cuenta-corriente/${sucursal}/${clienteId}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error al obtener estado de cuenta:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los clientes con saldo en cuenta corriente
   */
  obtenerClientesConSaldo: async (sucursal: string): Promise<any[]> => {
    try {
      const response: AxiosResponse<ApiResponse<any[]>> = 
        await apiClient.get(`/ventas/clientes-cuenta-corriente/${sucursal}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener clientes con saldo:', error);
      throw error;
    }
  },

  /**
   * Registrar un pago en cuenta corriente
   */
  registrarPago: async (pago: PagoCuentaCorriente): Promise<any> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = 
        await apiClient.post('/ventas/pago-cuenta-corriente', pago);
      return response.data.data;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw error;
    }
  },
};

export default apiClient;


