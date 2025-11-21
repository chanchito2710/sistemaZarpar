/**
 * Página de Gestión de Personal - SOLO ADMINISTRADORES
 * Permite crear vendedores, gerentes, administradores y sucursales
 * Incluye creación automática de tablas clientes_[sucursal]
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Tabs,
  Modal,
  Form,
  App,
  Popconfirm,
  Alert,
  Spin,
  Badge,
  Divider,
  Typography
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  CrownOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  HomeFilled,
  HomeOutlined,
  DollarOutlined,
  HistoryOutlined,
  SyncOutlined,
  StopOutlined,
  PercentageOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { comisionesService, vendedoresService, descuentosService } from '../../services/api';
import './StaffSellers.css';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:3456/api');

/**
 * Interfaz para Vendedor
 */
interface Vendedor {
  id: number;
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono?: string;
  email: string;
  activo: boolean;
  cobra_comisiones: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para Sucursal
 */
interface Sucursal {
  sucursal: string;
  total_vendedores: number;
  es_principal?: boolean;
}

/**
 * Interfaz para formulario de vendedor
 */
interface VendedorFormData {
  nombre: string;
  cargo: string;
  sucursal: string;
  telefono?: string;
  email: string;
  password: string;
}

/**
 * Interfaz para formulario de sucursal
 */
interface SucursalFormData {
  nombre: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
}

/**
 * UTILIDADES PARA NOMBRES DE SUCURSALES
 */

/**
 * Normalizar nombre de sucursal: quita espacios, convierte a minúsculas
 * "Rio Negro" → "rionegro"
 * "Cerro Largo" → "cerrolargo"
 */
const normalizarNombreSucursal = (nombre: string): string => {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ''); // Quitar todos los espacios
};

/**
 * Formatear nombre de sucursal para mostrar: capitaliza cada palabra
 * "rionegro" → "Rio Negro"
 * "cerrolargo" → "Cerro Largo"
 */
const formatearNombreSucursal = (nombre: string): string => {
  const normalizado = nombre.toLowerCase().trim();
  
  // Lista de sucursales conocidas con espacios
  const sucursalesConEspacios: { [key: string]: string } = {
    'rionegro': 'Rio Negro',
    'cerrolargo': 'Cerro Largo',
    'treintaytres': 'Treinta Y Tres',
    'floresdalsur': 'Flores Dal Sur',
    // Agregar más según necesites
  };
  
  // Si está en la lista, usar el formato conocido
  if (sucursalesConEspacios[normalizado]) {
    return sucursalesConEspacios[normalizado];
  }
  
  // Si no, capitalizar la primera letra
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1);
};

const StaffSellers: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { message: messageApi } = App.useApp();

  // Estados para vendedores
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedoresLoading, setVendedoresLoading] = useState(false);
  const [vendedorSearchText, setVendedorSearchText] = useState('');
  const [vendedorModalVisible, setVendedorModalVisible] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [vendedorForm] = Form.useForm();

  // Estados para sucursales
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalesLoading, setSucursalesLoading] = useState(false);
  const [sucursalModalVisible, setSucursalModalVisible] = useState(false);
  const [sucursalForm] = Form.useForm();

  // Filtros
  const [selectedSucursalFilter, setSelectedSucursalFilter] = useState<string | undefined>(undefined);
  const [selectedCargoFilter, setSelectedCargoFilter] = useState<string | undefined>(undefined);

  // Estados para comisiones
  const [configuracionComisiones, setConfiguracionComisiones] = useState<any[]>([]);
  const [comisionesLoading, setComisionesLoading] = useState(false);
  const [editandoComision, setEditandoComision] = useState<any>(null);
  const [modalComisionVisible, setModalComisionVisible] = useState(false);
  const [comisionForm] = Form.useForm();
  
  // Estados para comisiones por vendedor
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState<number | null>(null);
  const [comisionesVendedor, setComisionesVendedor] = useState<any[]>([]);
  const [modalComisionVendedor, setModalComisionVendedor] = useState(false);
  const [comisionVendedorEditando, setComisionVendedorEditando] = useState<any>(null);
  const [comisionVendedorForm] = Form.useForm();

  // Estados para descuentos
  const [configuracionDescuentos, setConfiguracionDescuentos] = useState<any[]>([]);
  const [descuentosLoading, setDescuentosLoading] = useState(false);

  // Estados para gestión de usuarios
  const [usuarios, setUsuarios] = useState<Vendedor[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [modalCambiarPassword, setModalCambiarPassword] = useState(false);
  const [usuarioEditandoPassword, setUsuarioEditandoPassword] = useState<Vendedor | null>(null);
  const [passwordForm] = Form.useForm();

  /**
   * Verificar que el usuario sea administrador
   */
  useEffect(() => {
    // Verificar que el usuario esté cargado y sea administrador
    if (!usuario) {
      return; // Esperar a que se cargue el usuario
    }
    
    if (!usuario.esAdmin && usuario.email !== 'admin@zarparuy.com') {
      messageApi.error('⛔ Acceso denegado. Solo administradores pueden acceder a esta página.');
      navigate('/');
    }
  }, [usuario, navigate, messageApi]);

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    cargarVendedores();
    cargarSucursales();
    cargarComisiones();
    cargarDescuentos();
    cargarUsuarios();
  }, []);

  /**
   * Cargar configuración de comisiones
   */
  const cargarComisiones = async () => {
    try {
      setComisionesLoading(true);
      const config = await comisionesService.obtenerConfiguracion();
      setConfiguracionComisiones(config);
    } catch (error) {
      console.error('Error al cargar comisiones:', error);
      messageApi.error('Error al cargar configuración de comisiones');
    } finally {
      setComisionesLoading(false);
    }
  };

  /**
   * Cargar comisiones de un vendedor específico
   */
  const cargarComisionesVendedor = async (vendedor_id: number) => {
    try {
      setComisionesLoading(true);
      const comisiones = await comisionesService.obtenerComisionesVendedor(vendedor_id);
      setComisionesVendedor(comisiones);
    } catch (error) {
      console.error('Error al cargar comisiones del vendedor:', error);
      messageApi.error('Error al cargar comisiones del vendedor');
    } finally {
      setComisionesLoading(false);
    }
  };

  /**
   * Cargar configuración de descuentos
   */
  const cargarDescuentos = async () => {
    try {
      setDescuentosLoading(true);
      const config = await descuentosService.obtenerConfiguracion();
      setConfiguracionDescuentos(config);
    } catch (error) {
      console.error('Error al cargar descuentos:', error);
      messageApi.error('Error al cargar configuración de descuentos');
    } finally {
      setDescuentosLoading(false);
    }
  };

  /**
   * Alternar estado de descuento de una sucursal
   */
  const handleToggleDescuento = async (sucursal: string, habilitado: boolean) => {
    try {
      await descuentosService.actualizarConfiguracion(sucursal, habilitado);
      messageApi.success(`Descuento ${habilitado ? 'habilitado' : 'deshabilitado'} para ${sucursal.toUpperCase()}`);
      // Recargar configuración
      await cargarDescuentos();
    } catch (error) {
      console.error('Error al actualizar descuento:', error);
      messageApi.error('Error al actualizar configuración de descuento');
    }
  };

  /**
   * Habilitar descuento una sola vez
   */
  const handleHabilitarUnaVez = async (sucursal: string) => {
    try {
      console.log(`🎯 [DEBUG] Habilitando descuento UNA VEZ para ${sucursal}`);
      console.log(`📡 [DEBUG] Llamando a API: POST /descuentos/${sucursal}/una-vez`);
      
      const response = await descuentosService.habilitarUnaVez(sucursal);
      
      console.log(`✅ [DEBUG] Respuesta del servidor:`, response);
      
      messageApi.success({
        content: `🎯 Descuento habilitado UNA VEZ para ${sucursal.toUpperCase()}. Se deshabilitará automáticamente después del primer uso.`,
        duration: 4
      });
      
      // Recargar configuración
      console.log(`🔄 [DEBUG] Recargando configuración de descuentos...`);
      await cargarDescuentos();
      console.log(`✅ [DEBUG] Configuración recargada`);
      
    } catch (error: any) {
      console.error('❌ [DEBUG] Error al habilitar descuento una vez:', error);
      console.error('❌ [DEBUG] Error completo:', JSON.stringify(error, null, 2));
      console.error('❌ [DEBUG] Response data:', error.response?.data);
      console.error('❌ [DEBUG] Response status:', error.response?.status);
      
      messageApi.error({
        content: `Error: ${error.response?.data?.message || error.message || 'Error desconocido'}`,
        duration: 5
      });
    }
  };

  /**
   * Cancelar descuento de "una vez" (manual o después de uso)
   */
  const handleCancelarUnaVez = async (sucursal: string) => {
    try {
      console.log(`🔄 Cancelando descuento UNA VEZ para ${sucursal}`);
      await descuentosService.desactivarUnaVez(sucursal);
      
      messageApi.info(`Descuento de uso único cancelado para ${sucursal.toUpperCase()}`);
      
      // Recargar configuración
      await cargarDescuentos();
    } catch (error) {
      console.error('Error al cancelar descuento una vez:', error);
      messageApi.error('Error al cancelar descuento de uso único');
    }
  };

  /**
   * Manejar selección de vendedor
   */
  const handleSeleccionarVendedor = async (vendedor_id: number | null) => {
    setVendedorSeleccionado(vendedor_id);
    if (vendedor_id) {
      await cargarComisionesVendedor(vendedor_id);
    } else {
      setComisionesVendedor([]);
    }
  };

  /**
   * Guardar comisión personalizada de un vendedor
   */
  const handleGuardarComisionVendedor = async () => {
    if (!vendedorSeleccionado) return;

    try {
      const values = await comisionVendedorForm.validateFields();
      await comisionesService.establecerComisionPersonalizada(
        vendedorSeleccionado,
        values.tipo_producto,
        values.monto_comision
      );
      
      messageApi.success('Comisión personalizada guardada correctamente');
      setModalComisionVendedor(false);
      comisionVendedorForm.resetFields();
      
      // Recargar comisiones del vendedor
      await cargarComisionesVendedor(vendedorSeleccionado);
    } catch (error) {
      messageApi.error('Error al guardar comisión personalizada');
    }
  };

  /**
   * Eliminar comisión personalizada (volver a usar global)
   */
  const handleEliminarComisionVendedor = async (tipo_producto: string) => {
    if (!vendedorSeleccionado) return;

    try {
      await comisionesService.eliminarComisionPersonalizada(vendedorSeleccionado, tipo_producto);
      messageApi.success('Comisión personalizada eliminada. Ahora usará la comisión global.');
      
      // Recargar comisiones del vendedor
      await cargarComisionesVendedor(vendedorSeleccionado);
    } catch (error) {
      messageApi.error('Error al eliminar comisión personalizada');
    }
  };

  /**
   * Cargar todos los vendedores
   */
  const cargarVendedores = async () => {
    try {
      console.log('🔄 Cargando vendedores...');
      setVendedoresLoading(true);
      const response = await axios.get(`${API_URL}/vendedores`);
      
      console.log('📥 Respuesta recibida:', response.data);
      
      if (response.data.success) {
        console.log('✅ Total vendedores:', response.data.data.length);
        console.log('📋 Vendedores:', response.data.data.map((v: Vendedor) => ({
          id: v.id,
          nombre: v.nombre,
          cargo: v.cargo,
          sucursal: v.sucursal,
          email: v.email
        })));
        
        setVendedores(response.data.data);
        messageApi.success(`✅ ${response.data.data.length} vendedores cargados`);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar vendedores:', error);
      messageApi.error('Error al cargar vendedores');
    } finally {
      setVendedoresLoading(false);
    }
  };

  /**
   * Cargar usuarios del sistema (solo usuarios de login)
   */
  const cargarUsuarios = async () => {
    try {
      setUsuariosLoading(true);
      const response = await axios.get(`${API_URL}/vendedores`);
      
      if (response.data.success) {
        // Filtrar SOLO los usuarios que se usan para login:
        // 1. admin@zarparuy.com (Administrador)
        // 2. sucursal@zarparuy.com (Usuarios de sucursales)
        const usuariosLogin = response.data.data.filter((vendedor: Vendedor) => {
          const email = vendedor.email.toLowerCase();
          
          // Caso 1: Es el administrador
          if (email === 'admin@zarparuy.com') {
            return true;
          }
          
          // Caso 2: Es un usuario de sucursal (formato: sucursal@zarparuy.com)
          // Verificar que el email coincide con el patrón: [sucursal]@zarparuy.com
          if (email.endsWith('@zarparuy.com')) {
            const sucursalDelEmail = email.split('@')[0]; // Ej: "pando" de "pando@zarparuy.com"
            const sucursalDelVendedor = vendedor.sucursal.toLowerCase().replace(/\s+/g, ''); // Normalizar
            
            // Verificar que el email coincide con la sucursal
            // Ej: pando@zarparuy.com debe estar en sucursal "pando"
            return sucursalDelEmail === sucursalDelVendedor;
          }
          
          return false;
        });
        
        console.log(`📋 Usuarios de login encontrados: ${usuariosLogin.length}`);
        setUsuarios(usuariosLogin);
      }
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      messageApi.error('Error al cargar usuarios');
    } finally {
      setUsuariosLoading(false);
    }
  };

  /**
   * Abrir modal para cambiar contraseña
   */
  const abrirModalCambiarPassword = (usuario: Vendedor) => {
    setUsuarioEditandoPassword(usuario);
    setModalCambiarPassword(true);
    passwordForm.resetFields();
  };

  /**
   * Cambiar contraseña de un usuario
   */
  const cambiarPassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      if (!usuarioEditandoPassword) return;

      // Obtener token JWT del localStorage
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${API_URL}/vendedores/${usuarioEditandoPassword.id}/password`,
        { password: values.password },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        messageApi.success('✅ Contraseña actualizada exitosamente');
        setModalCambiarPassword(false);
        passwordForm.resetFields();
        setUsuarioEditandoPassword(null);
      }
    } catch (error: any) {
      console.error('❌ Error al cambiar contraseña:', error);
      messageApi.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  /**
   * Cargar sucursales
   */
  const cargarSucursales = async () => {
    try {
      setSucursalesLoading(true);
      const response = await axios.get(`${API_URL}/sucursales`);
      
      if (response.data.success) {
        setSucursales(response.data.data);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar sucursales:', error);
      messageApi.error('Error al cargar sucursales');
    } finally {
      setSucursalesLoading(false);
    }
  };

  /**
   * Crear o actualizar vendedor
   */
  const handleVendedorSubmit = async () => {
    try {
      const values = await vendedorForm.validateFields();
      
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      console.log('📤 Enviando datos:', values);

      if (editingVendedor) {
        // Actualizar vendedor existente
        const response = await axios.put(
          `${API_URL}/vendedores/${editingVendedor.id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('✅ Respuesta actualización:', response.data);
        messageApi.success('✅ Vendedor actualizado exitosamente');
      } else {
        // Crear nuevo vendedor
        const response = await axios.post(
          `${API_URL}/vendedores`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('✅ Respuesta creación:', response.data);
        messageApi.success('✅ Vendedor creado exitosamente');
      }

      // Cerrar modal y limpiar
      setVendedorModalVisible(false);
      vendedorForm.resetFields();
      setEditingVendedor(null);
      
      // Limpiar TODOS los filtros
      setVendedorSearchText('');
      setSelectedSucursalFilter(undefined);
      setSelectedCargoFilter(undefined);
      
      // Esperar un momento y recargar
      setTimeout(async () => {
        console.log('🔄 Recargando vendedores...');
        await cargarVendedores();
        await cargarSucursales();
        console.log('✅ Recarga completada');
      }, 500);

    } catch (error: any) {
      console.error('❌ Error al guardar vendedor:', error);
      console.error('❌ Detalles:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Error al guardar vendedor';
      messageApi.error(errorMsg);
    }
  };

  /**
   * Eliminar vendedor
   */
  const handleEliminarVendedor = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      const response = await axios.delete(`${API_URL}/vendedores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Verificar si fue eliminado permanentemente o solo desactivado
      if (response.data.data?.eliminado_permanentemente) {
        messageApi.success({
          content: '🗑️ Vendedor eliminado permanentemente de la base de datos',
          duration: 5
        });
      } else if (response.data.data?.desactivado) {
        messageApi.warning({
          content: response.data.message || '⚠️ El vendedor tiene datos relacionados y fue desactivado en vez de eliminarse',
          duration: 8
        });
      } else {
        messageApi.success('✅ Vendedor eliminado exitosamente');
      }

      await cargarVendedores();
      await cargarSucursales();
    } catch (error: any) {
      console.error('❌ Error al eliminar vendedor:', error);
      const errorMsg = error.response?.data?.message || 'Error al eliminar vendedor';
      messageApi.error(errorMsg);
    }
  };

  /**
   * Crear nueva sucursal
   */
  const handleSucursalSubmit = async () => {
    try {
      const values = await sucursalForm.validateFields();
      
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      // ⭐ NORMALIZAR el nombre antes de enviar (quitar espacios, minúsculas)
      const nombreOriginal = values.nombre; // "Rio Negro"
      const nombreNormalizado = normalizarNombreSucursal(nombreOriginal); // "rionegro"
      
      const datosParaEnviar = {
        ...values,
        nombre: nombreNormalizado // Enviar normalizado al backend
      };

      console.log('📤 Creando nueva sucursal:');
      console.log('  - Nombre ingresado:', nombreOriginal);
      console.log('  - Nombre normalizado:', nombreNormalizado);
      console.log('  - Datos a enviar:', datosParaEnviar);

      const response = await axios.post(
        `${API_URL}/sucursales`,
        datosParaEnviar,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const nuevaSucursal = response.data.data.nombre; // "rionegro" (del backend)
        const nombreFormateado = formatearNombreSucursal(nuevaSucursal); // "Rio Negro"
        
        messageApi.success(
          `✅ Sucursal "${nombreFormateado}" creada exitosamente con tabla de clientes`,
          5
        );
        
        console.log('✅ Sucursal creada:', response.data.data);

        // Cerrar modal y limpiar formulario
        setSucursalModalVisible(false);
        sucursalForm.resetFields();
        
        // Recargar sucursales
        await cargarSucursales();
        
        // Seleccionar automáticamente la nueva sucursal en el formulario de vendedor
        vendedorForm.setFieldsValue({ sucursal: nuevaSucursal });
        
        console.log(`✅ Sucursal "${nombreFormateado}" (${nuevaSucursal}) seleccionada automáticamente en el formulario`);
      }
    } catch (error: any) {
      console.error('❌ Error al crear sucursal:', error);
      const errorMsg = error.response?.data?.message || 'Error al crear sucursal';
      messageApi.error(errorMsg);
    }
  };

  /**
   * Eliminar sucursal PERMANENTEMENTE
   */
  const handleEliminarSucursal = async (nombreSucursal: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      console.log(`🗑️ Eliminando sucursal: ${nombreSucursal}`);

      const response = await axios.delete(
        `${API_URL}/sucursales/${nombreSucursal}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        
        // Mostrar mensaje con detalles completos de lo que se eliminó
        messageApi.success({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>
                🗑️ Sucursal "{nombreSucursal.toUpperCase()}" eliminada PERMANENTEMENTE
              </div>
              <div style={{ fontSize: '12px' }}>
                <strong>Datos eliminados:</strong><br />
                • 👥 Vendedores: {data.vendedores_eliminados}<br />
                • 💰 Ventas: {data.ventas_eliminadas}<br />
                • 👤 Clientes: {data.clientes_eliminados} (tabla {data.tabla_clientes_eliminada ? 'ELIMINADA' : 'no existía'})<br />
                • 📦 Productos: {data.productos_eliminados}<br />
                • 🔄 Transferencias: {data.transferencias_eliminadas}<br />
                <br />
                <strong style={{ color: '#ff4d4f' }}>⚠️ Eliminación total completada</strong>
              </div>
            </div>
          ),
          duration: 10
        });

        // Recargar sucursales y vendedores
        await cargarSucursales();
        await cargarVendedores();
      }
    } catch (error: any) {
      console.error('❌ Error al eliminar sucursal:', error);
      const errorMsg = error.response?.data?.message || 'Error al eliminar sucursal';
      messageApi.error(errorMsg, 6);
    }
  };

  /**
   * Establecer sucursal como principal (Casa Central)
   */
  const handleEstablecerCasaPrincipal = async (nombreSucursal: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        messageApi.error('No hay sesión activa');
        return;
      }

      console.log(`🏠 Estableciendo ${nombreSucursal} como casa principal...`);

      const response = await axios.put(
        `${API_URL}/sucursales/${nombreSucursal}/principal`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        
        if (data.era_principal) {
          messageApi.info({
            content: `ℹ️ "${nombreSucursal.toUpperCase()}" ya es la Casa Principal`,
            duration: 3
          });
        } else {
          messageApi.success({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  🏠 Casa Principal Actualizada
                </div>
                <div style={{ fontSize: '12px' }}>
                  {data.sucursal_anterior && (
                    <>📍 Anterior: {data.sucursal_anterior.toUpperCase()}<br /></>
                  )}
                  🏠 Nueva: {data.sucursal_nueva.toUpperCase()}
                </div>
              </div>
            ),
            duration: 5
          });
        }

        // Recargar sucursales para actualizar el estilo visual
        await cargarSucursales();
      }
    } catch (error: any) {
      console.error('❌ Error al establecer casa principal:', error);
      const errorMsg = error.response?.data?.message || 'Error al establecer casa principal';
      messageApi.error(errorMsg, 5);
    }
  };

  /**
   * Abrir modal para nuevo vendedor
   */
  const handleNuevoVendedor = () => {
    setEditingVendedor(null);
    vendedorForm.resetFields();
    setVendedorModalVisible(true);
  };

  /**
   * Abrir modal para editar vendedor
   */
  const handleEditarVendedor = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor);
    vendedorForm.setFieldsValue({
      nombre: vendedor.nombre,
      cargo: vendedor.cargo,
      sucursal: vendedor.sucursal,
      telefono: vendedor.telefono,
      email: vendedor.email,
    });
    setVendedorModalVisible(true);
  };

  /**
   * Obtener texto del cargo
   */
  const getCargoTexto = (cargo: string): string => {
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('admin')) return 'Administrador';
    if (cargoLower.includes('gerente')) return 'Gerente';
    if (cargoLower.includes('vendedor')) return 'Vendedor';
    return cargo;
  };

  /**
   * Obtener color del cargo
   */
  const getCargoColor = (cargo: string): string => {
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('admin')) return 'red';
    if (cargoLower.includes('gerente')) return 'gold';
    if (cargoLower.includes('vendedor')) return 'blue';
    return 'default';
  };

  /**
   * Obtener icono del cargo
   */
  const getCargoIcono = (cargo: string): React.ReactNode => {
    const cargoLower = cargo.toLowerCase();
    if (cargoLower.includes('admin')) return <CrownOutlined />;
    if (cargoLower.includes('gerente')) return <SafetyOutlined />;
    if (cargoLower.includes('vendedor')) return <UserOutlined />;
    return <UserOutlined />;
  };

  /**
   * Filtrar vendedores
   */
  const vendedoresFiltrados = vendedores.filter((vendedor) => {
    const matchesSearch = 
      vendedor.nombre.toLowerCase().includes(vendedorSearchText.toLowerCase()) ||
      vendedor.email.toLowerCase().includes(vendedorSearchText.toLowerCase());
    
    const matchesSucursal = !selectedSucursalFilter || vendedor.sucursal === selectedSucursalFilter;
    const matchesCargo = !selectedCargoFilter || vendedor.cargo.toLowerCase().includes(selectedCargoFilter.toLowerCase());

    return matchesSearch && matchesSucursal && matchesCargo;
  });

  /**
   * Columnas de la tabla de vendedores
   */
  const columnasVendedores: ColumnsType<Vendedor> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (nombre: string) => <Text strong>{nombre}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <Text copyable>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      render: (cargo: string) => (
        <Tag color={getCargoColor(cargo)} icon={getCargoIcono(cargo)}>
          {getCargoTexto(cargo)}
        </Tag>
      ),
    },
    {
      title: 'Sucursal',
      dataIndex: 'sucursal',
      key: 'sucursal',
      render: (sucursal: string) => (
        <Tag color="green">
          <ShopOutlined /> {formatearNombreSucursal(sucursal)}
        </Tag>
      ),
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      render: (telefono?: string) => 
        telefono ? (
          <Space>
            <PhoneOutlined />
            {telefono}
          </Space>
        ) : <Text type="secondary">-</Text>
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo: boolean) => (
        <Tag color={activo ? 'success' : 'error'} icon={activo ? <CheckCircleOutlined /> : <WarningOutlined />}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditarVendedor(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title={
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
                ⚠️ ¡ELIMINAR PERMANENTEMENTE!
              </span>
            }
            description={
              <div style={{ maxWidth: '350px' }}>
                <p style={{ margin: '8px 0', fontWeight: 'bold' }}>
                  ¿Estás seguro de eliminar a <strong>"{record.nombre}"</strong>?
                </p>
                <Alert
                  message="ADVERTENCIA: Esta acción es IRREVERSIBLE"
                  description="El vendedor será BORRADO PERMANENTEMENTE de la base de datos y NO se podrá recuperar."
                  type="error"
                  showIcon
                  style={{ marginTop: 8 }}
                />
              </div>
            }
            onConfirm={() => handleEliminarVendedor(record.id)}
            okText="🗑️ SÍ, ELIMINAR PERMANENTEMENTE"
            cancelText="❌ Cancelar"
            okButtonProps={{ 
              danger: true,
              size: 'large',
              style: { fontWeight: 'bold' }
            }}
            cancelButtonProps={{
              size: 'large'
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /**
   * Estadísticas
   */
  const totalVendedores = vendedores.length;
  const totalAdministradores = vendedores.filter(v => v.cargo.toLowerCase().includes('admin')).length;
  const totalGerentes = vendedores.filter(v => v.cargo.toLowerCase().includes('gerente')).length;
  const totalSucursales = sucursales.length;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Título Simple */}
      <Paragraph 
        style={{
          marginBottom: 24,
          textAlign: 'center',
          fontSize: '18px',
          color: '#000',
          fontWeight: 'normal'
        }}
      >
        Gestión de personal y sucursales
      </Paragraph>

      {/* Estadísticas */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="Total Vendedores"
              value={totalVendedores}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="Administradores"
              value={totalAdministradores}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="Gerentes"
              value={totalGerentes}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="Sucursales"
              value={totalSucursales}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Estilos para separadores y tabs elegantes */}
      <style>
        {`
          /* Ocultar la franja azul predeterminada de Ant Design */
          .ant-tabs-ink-bar {
            display: none !important;
          }

          /* Separador elegante con efecto hundido entre tabs */
          .ant-tabs-nav-list .ant-tabs-tab:not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 2px;
            height: 24px;
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(0, 0, 0, 0.08) 10%,
              rgba(0, 0, 0, 0.12) 50%,
              rgba(0, 0, 0, 0.08) 90%,
              transparent
            );
            box-shadow: 
              1px 0 0 rgba(255, 255, 255, 0.5),
              -1px 0 0 rgba(0, 0, 0, 0.05);
            border-radius: 2px;
            transition: all 0.3s ease;
          }

          /* Efecto hover en el separador */
          .ant-tabs-nav-list .ant-tabs-tab:not(:last-child):hover::after {
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(102, 126, 234, 0.2) 10%,
              rgba(102, 126, 234, 0.3) 50%,
              rgba(102, 126, 234, 0.2) 90%,
              transparent
            );
            box-shadow: 
              1px 0 0 rgba(102, 126, 234, 0.3),
              -1px 0 0 rgba(102, 126, 234, 0.1);
          }

          /* Espaciado extra para los tabs */
          .ant-tabs-nav-list .ant-tabs-tab {
            padding: 0 24px !important;
            border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Tab Activo: Sombra elegante y profesional en todo el botón */
          .ant-tabs-nav-list .ant-tabs-tab-active {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%) !important;
            box-shadow: 
              0 4px 12px rgba(102, 126, 234, 0.15),
              0 2px 6px rgba(102, 126, 234, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(102, 126, 234, 0.05) !important;
            transform: translateY(-1px);
            border: 1px solid rgba(102, 126, 234, 0.1);
          }

          /* Color del texto del tab activo */
          .ant-tabs-nav-list .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #667eea !important;
            font-weight: 600 !important;
          }

          /* Hover en tab no activo */
          .ant-tabs-nav-list .ant-tabs-tab:not(.ant-tabs-tab-active):hover {
            background: rgba(102, 126, 234, 0.04);
            box-shadow: 
              0 2px 8px rgba(102, 126, 234, 0.08),
              0 1px 4px rgba(0, 0, 0, 0.04);
            transform: translateY(-0.5px);
          }

          /* Animación del separador en tab activo */
          .ant-tabs-nav-list .ant-tabs-tab-active::after {
            background: linear-gradient(
              to bottom,
              transparent,
              rgba(102, 126, 234, 0.3) 10%,
              rgba(102, 126, 234, 0.4) 50%,
              rgba(102, 126, 234, 0.3) 90%,
              transparent
            );
          }

          /* Badge dentro del tab activo */
          .ant-tabs-tab-active .ant-badge .ant-badge-count {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
          }
        `}
      </style>

      {/* Tabs */}
      <Tabs 
        defaultActiveKey="vendedores" 
        size="large"
        items={[
          {
            key: 'vendedores',
            label: (
              <span>
                <TeamOutlined />
                Vendedores
                <Badge count={totalVendedores} style={{ marginLeft: 8 }} />
              </span>
            ),
            children: (
              <>
                {/* Filtros y búsqueda */}
                <Card style={{ marginBottom: 12 }} styles={{ body: { padding: '16px' } }}>
                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={8}>
                      <Input
                        placeholder="Buscar por nombre o email..."
                        prefix={<SearchOutlined />}
                        value={vendedorSearchText}
                        onChange={(e) => setVendedorSearchText(e.target.value)}
                        allowClear
                        size="large"
                      />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                      <Select
                        placeholder="Filtrar por sucursal"
                        style={{ width: '100%' }}
                        allowClear
                        value={selectedSucursalFilter}
                        onChange={setSelectedSucursalFilter}
                        size="large"
                      >
                        {sucursales.map((s) => (
                          <Option key={s.sucursal} value={s.sucursal}>
                            {formatearNombreSucursal(s.sucursal)} ({s.total_vendedores})
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                      <Select
                        placeholder="Filtrar por cargo"
                        style={{ width: '100%' }}
                        allowClear
                        value={selectedCargoFilter}
                        onChange={setSelectedCargoFilter}
                        size="large"
                      >
                        <Option value="admin">Administrador</Option>
                        <Option value="gerente">Gerente</Option>
                        <Option value="vendedor">Vendedor</Option>
                      </Select>
                    </Col>
                    <Col xs={24} md={6}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNuevoVendedor}
                        block
                        size="large"
                      >
                        Nombre de Usuario
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Tabla */}
                <Card styles={{ body: { padding: '16px' } }}>
                  <Spin spinning={vendedoresLoading}>
                    <Table
                      columns={columnasVendedores}
                      dataSource={vendedoresFiltrados}
                      rowKey="id"
                      size="small"
                      pagination={{
                        pageSize: 8,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} vendedores`,
                      }}
                      scroll={{ x: 1200 }}
                    />
                  </Spin>
                </Card>
              </>
            ),
          },
          {
            key: 'sucursales',
            label: (
              <span>
                <ShopOutlined />
                Sucursales
                <Badge count={totalSucursales} style={{ marginLeft: 8 }} />
              </span>
            ),
            children: (
              <>
                <Card style={{ marginBottom: 12 }} styles={{ body: { padding: '16px' } }}>
                  <Row gutter={12} justify="end">
                    <Col>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setSucursalModalVisible(true)}
                        size="large"
                      >
                        Nueva Sucursal
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* TABLA DE SUCURSALES - COMPLETAMENTE REDISEÑADA */}
                      <Card styles={{ body: { padding: '16px' } }}>
                  <Spin spinning={sucursalesLoading}>
                    <Table
                      dataSource={sucursales}
                      rowKey="sucursal"
                      size="small"
                      pagination={{
                        pageSize: 8,
                        showSizeChanger: true,
                        showTotal: (total) => `Total: ${total} sucursales`,
                      }}
                      rowClassName={(record) => 
                        record.es_principal ? 'sucursal-principal-row' : ''
                      }
                      scroll={{ x: 1000 }}
                    >
                      {/* Columna: Sucursal */}
                      <Table.Column
                        title="Sucursal"
                        dataIndex="sucursal"
                        key="sucursal"
                        width={200}
                        render={(sucursal: string, record: Sucursal) => (
                          <Space>
                            {record.es_principal ? (
                              <HomeFilled style={{ fontSize: 20, color: '#f39c12' }} />
                            ) : (
                              <ShopOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                            )}
                            <Text strong style={{ fontSize: 16 }}>
                              {formatearNombreSucursal(sucursal)}
                            </Text>
                            {record.es_principal && (
                              <Tag 
                                icon={<HomeFilled />} 
                                color="orange" 
                                style={{ 
                                  fontWeight: 'bold',
                                  marginLeft: 8
                                }}
                              >
                                CASA PRINCIPAL
                              </Tag>
                            )}
                          </Space>
                        )}
                      />

                      {/* Columna: Tabla de Clientes */}
                      <Table.Column
                        title="Tabla de Clientes"
                        dataIndex="sucursal"
                        key="tabla"
                        width={180}
                        render={(sucursal: string) => (
                          <Text code>clientes_{sucursal}</Text>
                        )}
                      />

                      {/* Columna: Vendedores */}
                      <Table.Column
                        title="Vendedores"
                        dataIndex="total_vendedores"
                        key="vendedores"
                        width={120}
                        align="center"
                        render={(total: number) => (
                          <Space>
                            <TeamOutlined style={{ color: '#1890ff' }} />
                            <Text>{total}</Text>
                          </Space>
                        )}
                      />

                      {/* Columna: Estado */}
                      <Table.Column
                        title="Estado"
                        key="estado"
                        width={100}
                        align="center"
                        render={() => (
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            Activa
                          </Tag>
                        )}
                      />

                      {/* Columna: Acciones */}
                      <Table.Column
                        title="Acciones"
                        key="acciones"
                        width={300}
                        render={(_, record: Sucursal) => (
                          <Space size="middle">
                            {/* Botón Casa Principal */}
                            {record.es_principal ? (
                              <Tag 
                                icon={<HomeFilled />} 
                                color="gold"
                                style={{ 
                                  padding: '4px 12px',
                                  fontSize: 13,
                                  fontWeight: 'bold'
                                }}
                              >
                                Es Casa Principal
                              </Tag>
                            ) : (
                              <Button
                                type="default"
                                icon={<HomeOutlined />}
                                onClick={() => handleEstablecerCasaPrincipal(record.sucursal)}
                                style={{ 
                                  borderColor: '#f39c12',
                                  color: '#f39c12'
                                }}
                              >
                                Hacer Principal
                              </Button>
                            )}

                            {/* Botón Eliminar */}
                            <Popconfirm
                              title={
                                <div style={{ maxWidth: 450 }}>
                                  <div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: 16 }}>
                                    🚨 ¡ELIMINAR SUCURSAL COMPLETA Y PERMANENTEMENTE!
                                  </div>
                                  <div style={{ marginTop: 12, fontSize: 14 }}>
                                    ¿Estás ABSOLUTAMENTE SEGURO de eliminar la sucursal "<strong style={{ color: '#ff4d4f' }}>{formatearNombreSucursal(record.sucursal)}</strong>"?
                                  </div>
                                </div>
                              }
                              description={
                                <div style={{ maxWidth: 450 }}>
                                  <Alert
                                    message="⛔ ADVERTENCIA: ELIMINACIÓN TOTAL E IRREVERSIBLE"
                                    description={
                                      <div style={{ fontSize: 12 }}>
                                        Se eliminarán <strong style={{ color: '#ff4d4f' }}>PERMANENTEMENTE</strong> de la base de datos:
                                        <br /><br />
                                        • 👥 <strong>TODOS los vendedores</strong> ({record.total_vendedores} vendedor(es))
                                        <br />• 💰 <strong>TODAS las ventas</strong> realizadas en esta sucursal
                                        <br />• 👤 <strong>TODOS los clientes</strong> (tabla completa clientes_{record.sucursal})
                                        <br />• 📦 <strong>TODOS los productos</strong> asignados
                                        <br />• 🔄 <strong>TODAS las transferencias</strong> relacionadas
                                        <br />• 💵 <strong>TODAS las comisiones</strong> de vendedores
                                        <br />• 💸 <strong>TODO el historial de caja</strong>
                                        <br />
                                        <br /><strong style={{ color: '#ff4d4f', fontSize: 14 }}>⚠️ NO HAY VUELTA ATRÁS ⚠️</strong>
                                        <br />Esta acción <strong>DESTRUIRÁ</strong> toda la información de la sucursal.
                                      </div>
                                    }
                                    type="error"
                                    showIcon
                                    style={{ marginTop: 12, marginBottom: 12 }}
                                  />
                                </div>
                              }
                              onConfirm={() => handleEliminarSucursal(record.sucursal)}
                              okText="⚠️ SÍ, ELIMINAR TODO PERMANENTEMENTE"
                              cancelText="❌ NO, Cancelar"
                              okButtonProps={{
                                danger: true
                              }}
                            >
                              <Button 
                                danger 
                                icon={<DeleteOutlined />}
                              >
                                Eliminar
                              </Button>
                            </Popconfirm>
                              </Space>
                        )}
                          />
                    </Table>
                  </Spin>
                        </Card>

                {/* Estilos inline para la fila de casa principal */}
                <style>
                  {`
                    .sucursal-principal-row {
                      background: linear-gradient(135deg, #fff9e6 0%, #fffaf0 100%) !important;
                    }
                    .sucursal-principal-row:hover {
                      background: linear-gradient(135deg, #fff4d6 0%, #fff9e6 100%) !important;
                    }
                    .sucursal-principal-row td {
                      border-color: #ffd666 !important;
                    }
                  `}
                </style>
              </>
            ),
          },
          {
            key: 'comisiones',
            label: (
              <Space>
                <DollarOutlined />
                <span>Comisiones</span>
              </Space>
            ),
            children: (
              <>
                {/* Selector de Vendedor */}
                <Card style={{ marginBottom: 12 }} styles={{ body: { padding: '16px' } }}>
                    <Row gutter={[12, 12]}>
                      <Col xs={24} sm={16} md={18}>
                        <Select
                          placeholder="Selecciona un vendedor"
                          style={{ width: '100%' }}
                          size="large"
                          allowClear
                          value={vendedorSeleccionado}
                          onChange={handleSeleccionarVendedor}
                          showSearch
                          filterOption={(input, option) => {
                            const label = option?.children?.toString() || '';
                            return label.toLowerCase().includes(input.toLowerCase());
                          }}
                        >
                          {vendedores.map(v => (
                            <Option key={v.id} value={v.id}>
                              <Space>
                                <UserOutlined />
                                {v.nombre} - {v.sucursal.toUpperCase()}
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      <Col xs={24} sm={8} md={6}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            if (!vendedorSeleccionado) {
                              messageApi.warning('Selecciona un vendedor primero');
                              return;
                            }
                            setComisionVendedorEditando(null);
                            comisionVendedorForm.resetFields();
                            setModalComisionVendedor(true);
                          }}
                          disabled={!vendedorSeleccionado}
                          block
                          size="large"
                        >
                          Nueva Comisión
                        </Button>
                      </Col>
                    </Row>
                </Card>

                {/* Tabla de Comisiones del Vendedor */}
                {vendedorSeleccionado && (
                  <Card
                    title={
                      <Space>
                        <DollarOutlined />
                        <span>Comisiones del Vendedor</span>
                        <Tag color="blue">
                          {vendedores.find(v => v.id === vendedorSeleccionado)?.nombre}
                        </Tag>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          🟢 = Personalizada | ⚪ = Global
                        </Text>
                        <Divider type="vertical" />
                        <Popconfirm
                          title={
                            vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones
                              ? "⚠️ Desactivar Comisiones"
                              : "✅ Activar Comisiones"
                          }
                          description={
                            vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones
                              ? "Este vendedor dejará de cobrar comisiones en TODAS sus ventas."
                              : "Este vendedor volverá a cobrar comisiones según la configuración."
                          }
                          onConfirm={async () => {
                            const vendedor = vendedores.find(v => v.id === vendedorSeleccionado);
                            if (!vendedor) return;
                            
                            try {
                              await vendedoresService.actualizarEstadoComisiones(
                                vendedor.id, 
                                !vendedor.cobra_comisiones
                              );
                              messageApi.success(
                                vendedor.cobra_comisiones 
                                  ? '❌ Comisiones desactivadas' 
                                  : '✅ Comisiones activadas'
                              );
                              cargarVendedores();
                            } catch (error) {
                              messageApi.error('Error al actualizar estado de comisiones');
                            }
                          }}
                          okText={
                            vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones
                              ? "Sí, desactivar"
                              : "Sí, activar"
                          }
                          cancelText="Cancelar"
                          okButtonProps={{
                            danger: vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones,
                          }}
                        >
                          <Button
                            type={
                              vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones
                                ? "primary"
                                : "default"
                            }
                            danger={!vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones}
                            icon={
                              vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones
                                ? <CheckCircleOutlined />
                                : <StopOutlined />
                            }
                            size="small"
                          >
                            {vendedores.find(v => v.id === vendedorSeleccionado)?.cobra_comisiones
                              ? "✅ Con Comisión"
                              : "❌ Sin Comisión"}
                          </Button>
                        </Popconfirm>
                      </Space>
                    }
                    styles={{ body: { padding: '16px' } }}
                  >
                    <Spin spinning={comisionesLoading}>
                      <Table
                        dataSource={comisionesVendedor}
                        rowKey="tipo"
                        size="small"
                        pagination={false}
                        columns={[
                          {
                            title: 'TIPO',
                            dataIndex: 'tipo',
                            key: 'tipo',
                            render: (tipo: string, record: any) => (
                              <Space>
                                {record.tiene_personalizada ? (
                                  <Tag color="green" style={{ fontSize: 12 }}>🟢 {tipo}</Tag>
                                ) : (
                                  <Tag color="default" style={{ fontSize: 12 }}>⚪ {tipo}</Tag>
                                )}
                              </Space>
                            ),
                          },
                          {
                            title: 'COMISIÓN GLOBAL',
                            dataIndex: 'monto_global',
                            key: 'monto_global',
                            render: (monto: number) => (
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                ${Number(monto).toFixed(2)}
                              </Text>
                            ),
                          },
                          {
                            title: 'COMISIÓN PERSONALIZADA',
                            dataIndex: 'monto_personalizado',
                            key: 'monto_personalizado',
                            render: (monto: number | null) => (
                              monto ? (
                                <Text strong style={{ fontSize: 14, color: '#52c41a' }}>
                                  ${Number(monto).toFixed(2)}
                                </Text>
                              ) : (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  No configurada
                                </Text>
                              )
                            ),
                          },
                          {
                            title: 'COMISIÓN ACTIVA',
                            dataIndex: 'monto_activo',
                            key: 'monto_activo',
                            render: (monto: number, record: any) => (
                              <Tag color={record.tiene_personalizada ? 'green' : 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                                ${Number(monto).toFixed(2)}
                              </Tag>
                            ),
                          },
                          {
                            title: 'ACCIONES',
                            key: 'acciones',
                            render: (_: any, record: any) => (
                              <Space>
                                {record.tiene_personalizada ? (
                                  <>
                                    <Button
                                      type="primary"
                                      icon={<EditOutlined />}
                                      size="small"
                                      onClick={() => {
                                        setComisionVendedorEditando(record);
                                        comisionVendedorForm.setFieldsValue({
                                          tipo_producto: record.tipo,
                                          monto_comision: record.monto_personalizado,
                                        });
                                        setModalComisionVendedor(true);
                                      }}
                                    >
                                      Editar
                                    </Button>
                                    <Popconfirm
                                      title="Eliminar Comisión Personalizada"
                                      description="¿Volver a usar la comisión global?"
                                      onConfirm={() => handleEliminarComisionVendedor(record.tipo)}
                                      okText="Sí, volver a global"
                                      cancelText="Cancelar"
                                    >
                                      <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                      >
                                        Eliminar
                                      </Button>
                                    </Popconfirm>
                                  </>
                                ) : (
                                  <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    size="small"
                                    onClick={() => {
                                      setComisionVendedorEditando(null);
                                      comisionVendedorForm.setFieldsValue({
                                        tipo_producto: record.tipo,
                                        monto_comision: record.monto_global,
                                      });
                                      setModalComisionVendedor(true);
                                    }}
                                  >
                                    Personalizar
                                  </Button>
                                )}
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </Spin>
                  </Card>
                )}

                {/* Mensaje cuando no hay vendedor seleccionado */}
                {!vendedorSeleccionado && (
                  <Card styles={{ body: { padding: '60px 20px', textAlign: 'center' } }}>
                    <Space direction="vertical" size="large">
                      <UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                      <div>
                        <Title level={4} style={{ margin: 0, color: '#8c8c8c' }}>
                          Selecciona un vendedor
                        </Title>
                        <Text type="secondary">
                          Elige un vendedor del selector de arriba para ver y editar sus comisiones
                        </Text>
                      </div>
                    </Space>
                  </Card>
                )}
              </>
            ),
          },
          // ⭐ Tab "Descuentos" - Todos pueden ver, pero cada uno ve su sucursal (admin ve todas)
          {
            key: 'descuentos',
            label: (
              <Space>
                <PercentageOutlined />
                <span>Descuentos</span>
              </Space>
            ),
            children: (
              <>
                <Alert
                  message="💡 Control de Descuentos por Sucursal"
                  description={
                    esAdministrador 
                      ? "Habilita o deshabilita la posibilidad de aplicar descuentos en el POS para cada sucursal. Los cambios se actualizan en tiempo real."
                      : "Gestiona los descuentos disponibles para tu sucursal. El descuento 'una vez' te permite aplicar un descuento único que se desactiva automáticamente después del primer uso."
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card>
                  <Spin spinning={descuentosLoading}>
                    <Table
                      dataSource={
                        // ✅ Si NO es admin, filtrar solo SU sucursal
                        esAdministrador 
                          ? configuracionDescuentos 
                          : configuracionDescuentos.filter(config => 
                              config.sucursal.toLowerCase() === (usuario?.email?.split('@')[0].toLowerCase() || '')
                            )
                      }
                      rowKey="id"
                      size="middle"
                      pagination={false}
                      columns={[
                        {
                          title: 'SUCURSAL',
                          dataIndex: 'sucursal',
                          key: 'sucursal',
                          render: (text: string) => (
                            <Space>
                              <ShopOutlined />
                              <Text strong>{text.toUpperCase()}</Text>
                            </Space>
                          ),
                        },
                        {
                          title: 'ESTADO',
                          dataIndex: 'descuento_habilitado',
                          key: 'estado',
                          align: 'center',
                          render: (habilitado: number) => (
                            <Tag
                              color={habilitado ? 'success' : 'default'}
                              icon={habilitado ? <CheckCircleOutlined /> : <StopOutlined />}
                            >
                              {habilitado ? 'HABILITADO' : 'DESHABILITADO'}
                            </Tag>
                          ),
                        },
                        {
                          title: 'ÚLTIMA ACTUALIZACIÓN',
                          dataIndex: 'updated_at',
                          key: 'updated_at',
                          render: (text: string) => {
                            const fecha = new Date(text);
                            return (
                              <Text type="secondary">
                                {fecha.toLocaleDateString('es-UY')} {fecha.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            );
                          },
                        },
                        {
                          title: 'ACTUALIZADO POR',
                          dataIndex: 'updated_by',
                          key: 'updated_by',
                          render: (text: string) => (
                            <Text type="secondary">{text || '-'}</Text>
                          ),
                        },
                        {
                          title: 'ACCIÓN',
                          key: 'accion',
                          align: 'center',
                          render: (_: any, record: any) => {
                            const estaUnaVezActivo = record.una_vez_activo === 1;
                            
                            return (
                              <Space direction="vertical" size={4}>
                                {/* Botón Habilitar/Deshabilitar normal */}
                            <Popconfirm
                              title={record.descuento_habilitado ? '¿Deshabilitar descuento?' : '¿Habilitar descuento?'}
                              description={
                                record.descuento_habilitado
                                  ? `Los usuarios de ${record.sucursal.toUpperCase()} ya NO podrán aplicar descuentos`
                                  : `Los usuarios de ${record.sucursal.toUpperCase()} podrán aplicar descuentos`
                              }
                              onConfirm={() => handleToggleDescuento(record.sucursal, !record.descuento_habilitado)}
                              okText="Sí, confirmar"
                              cancelText="Cancelar"
                            >
                              <Button
                                type={record.descuento_habilitado ? 'default' : 'primary'}
                                size="small"
                                icon={record.descuento_habilitado ? <StopOutlined /> : <CheckCircleOutlined />}
                                    style={{ width: '100%' }}
                              >
                                {record.descuento_habilitado ? 'Deshabilitar' : 'Habilitar'}
                              </Button>
                            </Popconfirm>
                                
                                {/* Botón Habilitar Una Vez o Cancelar */}
                                {estaUnaVezActivo ? (
                                  <Popconfirm
                                    title="❌ ¿Cancelar uso único?"
                                    description={`El descuento de ${record.sucursal.toUpperCase()} dejará de estar activo para el próximo uso.`}
                                    onConfirm={() => handleCancelarUnaVez(record.sucursal)}
                                    okText="Sí, cancelar"
                                    cancelText="No"
                                  >
                                    <Button
                                      size="small"
                                      type="dashed"
                                      danger
                                      icon={<StopOutlined />}
                                      className="btn-una-vez-activo"
                                      style={{ width: '100%' }}
                                    >
                                      Cancelar uso único
                                    </Button>
                                  </Popconfirm>
                                ) : (
                                  <Popconfirm
                                    title="🎯 ¿Habilitar descuento UNA VEZ?"
                                    description={`El descuento para ${record.sucursal.toUpperCase()} se habilitará solo para la próxima venta y se desactivará automáticamente.`}
                                    onConfirm={() => handleHabilitarUnaVez(record.sucursal)}
                                    okText="Sí, habilitar una vez"
                                    cancelText="Cancelar"
                                  >
                                    <Button
                                      size="small"
                                      type="dashed"
                                      icon={<ThunderboltOutlined />}
                                      style={{
                                        width: '100%',
                                        borderColor: '#faad14',
                                        color: '#faad14',
                                      }}
                                    >
                                      Habilitar 1 vez
                                    </Button>
                                  </Popconfirm>
                                )}
                              </Space>
                            );
                          },
                        },
                      ]}
                    />
                  </Spin>
                </Card>
              </>
            ),
          },
          {
            key: 'usuarios',
            label: (
              <Space>
                <LockOutlined />
                <span>Gestión de Usuarios</span>
                <Badge count={usuarios.length} style={{ marginLeft: 8 }} />
              </Space>
            ),
            children: (
              <>
                <Alert
                  message="🔐 Gestión de Usuarios de Login"
                  description={
                    <div>
                      <p style={{ marginBottom: 8 }}>
                        Aquí solo se muestran los <strong>usuarios que se usan para iniciar sesión</strong> en el sistema:
                      </p>
                      <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                        <li><strong>admin@zarparuy.com</strong> → Administrador (acceso a todo)</li>
                        <li><strong>sucursal@zarparuy.com</strong> → Usuarios de cada sucursal (Ej: pando@zarparuy.com, maldonado@zarparuy.com, etc.)</li>
                      </ul>
                      <p style={{ marginTop: 8, marginBottom: 0 }}>
                        ⚠️ <strong>Importante:</strong> Al cambiar una contraseña aquí, el usuario deberá usar la nueva contraseña en su próximo login.
                      </p>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Card styles={{ body: { padding: '16px' } }}>
                  <Spin spinning={usuariosLoading}>
                    <Table
                      dataSource={usuarios}
                      rowKey="id"
                      size="small"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total: ${total} usuarios`,
                      }}
                      scroll={{ x: 1200 }}
                    >
                      {/* Columna: Usuario */}
                      <Table.Column
                        title="Usuario"
                        dataIndex="nombre"
                        key="nombre"
                        width={200}
                        render={(nombre: string, record: Vendedor) => (
                          <Space direction="vertical" size={0}>
                            <Text strong>{nombre}</Text>
                            {record.email === 'admin@zarparuy.com' && (
                              <Tag icon={<CrownOutlined />} color="gold" style={{ fontSize: 10 }}>
                                Administrador
                              </Tag>
                            )}
                          </Space>
                        )}
                      />

                      {/* Columna: Email */}
                      <Table.Column
                        title="Email"
                        dataIndex="email"
                        key="email"
                        width={250}
                        render={(email: string) => (
                          <Space>
                            <MailOutlined style={{ color: '#1890ff' }} />
                            <Text copyable>{email}</Text>
                          </Space>
                        )}
                      />

                      {/* Columna: Sucursal */}
                      <Table.Column
                        title="Sucursal"
                        dataIndex="sucursal"
                        key="sucursal"
                        width={150}
                        render={(sucursal: string) => (
                          <Tag color={sucursal === 'Administracion' ? 'gold' : 'blue'}>
                            {formatearNombreSucursal(sucursal)}
                          </Tag>
                        )}
                      />

                      {/* Columna: Cargo */}
                      <Table.Column
                        title="Cargo"
                        dataIndex="cargo"
                        key="cargo"
                        width={150}
                      />

                      {/* Columna: Estado */}
                      <Table.Column
                        title="Estado"
                        dataIndex="activo"
                        key="activo"
                        width={100}
                        render={(activo: boolean) => (
                          <Tag icon={activo ? <CheckCircleOutlined /> : <StopOutlined />} color={activo ? 'success' : 'error'}>
                            {activo ? 'Activo' : 'Inactivo'}
                          </Tag>
                        )}
                      />

                      {/* Columna: Acciones */}
                      <Table.Column
                        title="Acciones"
                        key="acciones"
                        width={200}
                        render={(_: any, record: Vendedor) => (
                          <Button
                            type="primary"
                            icon={<LockOutlined />}
                            onClick={() => abrirModalCambiarPassword(record)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                            }}
                          >
                            Cambiar Contraseña
                          </Button>
                        )}
                      />
                    </Table>
                  </Spin>
                </Card>
              </>
            ),
          },
        ].filter(Boolean)} // Filtrar tabs nulos (para condicionales)
      />

      {/* Modal: Editar Comisión */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Editar Comisión - {editandoComision?.tipo}
          </Space>
        }
        open={modalComisionVisible}
        onOk={async () => {
          try {
            const values = await comisionForm.validateFields();
            await comisionesService.actualizarComision(
              editandoComision.id,
              values.monto_comision
            );
            messageApi.success('Comisión actualizada correctamente');
            setModalComisionVisible(false);
            comisionForm.resetFields();
            // Recargar configuración
            const config = await comisionesService.obtenerConfiguracion();
            setConfiguracionComisiones(config);
          } catch (error) {
            messageApi.error('Error al actualizar comisión');
          }
        }}
        onCancel={() => {
          setModalComisionVisible(false);
          comisionForm.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Divider />
        <Form form={comisionForm} layout="vertical">
          <Form.Item
            name="monto_comision"
            label="Monto de Comisión"
            rules={[
              { required: true, message: 'Por favor ingresa el monto' },
              {
                type: 'number',
                min: 0,
                message: 'El monto debe ser mayor o igual a 0',
              },
            ]}
          >
            <Input
              prefix={<DollarOutlined />}
              type="number"
              placeholder="Ej: 150.00"
              size="large"
              step="0.01"
              min="0"
            />
          </Form.Item>
          <Alert
            message="Este cambio se aplicará a todas las ventas futuras"
            type="warning"
            showIcon
          />
        </Form>
      </Modal>

      {/* Modal: Editar Comisión de Vendedor */}
      <Modal
        title={
          <Space>
            {comisionVendedorEditando ? <EditOutlined /> : <PlusOutlined />}
            {comisionVendedorEditando ? 'Editar Comisión Personalizada' : 'Nueva Comisión Personalizada'}
          </Space>
        }
        open={modalComisionVendedor}
        onOk={handleGuardarComisionVendedor}
        onCancel={() => {
          setModalComisionVendedor(false);
          comisionVendedorForm.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Divider />
        <Alert
          message="💡 Comisión Personalizada"
          description="Esta comisión solo aplicará a este vendedor. Si la eliminas, el vendedor volverá a usar la comisión global."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={comisionVendedorForm} layout="vertical">
          <Form.Item
            name="tipo_producto"
            label="Tipo de Producto"
            rules={[{ required: true, message: 'Por favor selecciona el tipo' }]}
          >
            <Select
              placeholder="Selecciona el tipo de producto"
              size="large"
              disabled={comisionVendedorEditando !== null}
            >
              {configuracionComisiones.map(c => (
                <Option key={c.tipo} value={c.tipo}>
                  <Space>
                    <Tag color="blue">{c.tipo}</Tag>
                    <Text type="secondary">Global: ${Number(c.monto_comision).toFixed(2)}</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="monto_comision"
            label="Monto de Comisión Personalizada"
            rules={[
              { required: true, message: 'Por favor ingresa el monto' },
              {
                type: 'number',
                min: 0,
                message: 'El monto debe ser mayor o igual a 0',
              },
            ]}
          >
            <Input
              prefix={<DollarOutlined />}
              type="number"
              placeholder="Ej: 200.00"
              size="large"
              step="0.01"
              min="0"
            />
          </Form.Item>

          <Alert
            message="⚠️ Esta comisión solo aplica a este vendedor"
            description="El vendedor ganará este monto en lugar de la comisión global cuando venda este tipo de producto."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>

      {/* Modal: Crear/Editar Vendedor */}
      <Modal
        title={
          <Space>
            {editingVendedor ? <EditOutlined /> : <PlusOutlined />}
            {editingVendedor ? 'Editar Personal' : 'Nombre de Usuario'}
          </Space>
        }
        open={vendedorModalVisible}
        onOk={handleVendedorSubmit}
        onCancel={() => {
          setVendedorModalVisible(false);
          vendedorForm.resetFields();
        }}
        okText="Guardar"
        cancelText="Cancelar"
        width={600}
      >
        <Divider />
        <Form form={vendedorForm} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingresa el nombre completo' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ej: Juan Pérez" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cargo"
                label="Cargo"
                rules={[{ required: true, message: 'Por favor selecciona el cargo' }]}
              >
                <Select placeholder="Selecciona el cargo" size="large">
                  <Option value="Administrador">
                    <CrownOutlined /> Administrador
                  </Option>
                  <Option value="Gerente">
                    <SafetyOutlined /> Gerente
                  </Option>
                  <Option value="Vendedor">
                    <UserOutlined /> Vendedor
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sucursal"
                label="Sucursal"
                rules={[{ required: true, message: 'Por favor selecciona o crea una sucursal' }]}
              >
                <Select
                  placeholder="Selecciona sucursal"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          // NO cerrar el modal de vendedor, solo abrir el de sucursal
                          setSucursalModalVisible(true);
                        }}
                        block
                      >
                        Crear Nueva Sucursal
                      </Button>
                    </>
                  )}
                >
                  {sucursales.map((s) => (
                    <Option key={s.sucursal} value={s.sucursal}>
                      {formatearNombreSucursal(s.sucursal)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor ingresa el email' },
              { type: 'email', message: 'Por favor ingresa un email válido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Ej: juan@zarparuy.com" size="large" />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono (Opcional)"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Ej: 099-123-456" size="large" />
          </Form.Item>

          {!editingVendedor && (
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Por favor ingresa una contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" size="large" />
            </Form.Item>
          )}

          {editingVendedor && (
            <Alert
              message="Nota: Para cambiar la contraseña, el usuario debe contactar al administrador."
              type="info"
              showIcon
            />
          )}
        </Form>
      </Modal>

      {/* Modal: Nueva Sucursal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            Nueva Sucursal
          </Space>
        }
        open={sucursalModalVisible}
        onOk={handleSucursalSubmit}
        onCancel={() => {
          setSucursalModalVisible(false);
          sucursalForm.resetFields();
        }}
        okText="Crear Sucursal"
        cancelText="Cancelar"
        width={500}
      >
        <Alert
          message="🔔 Creación Automática de Tabla"
          description="Al crear esta sucursal, se creará automáticamente una tabla 'clientes_[nombre]' en la base de datos para gestionar los clientes de esta sucursal."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Divider />
        <Form form={sucursalForm} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre de la Sucursal"
            rules={[
              { required: true, message: 'Por favor ingresa el nombre' },
              { pattern: /^[a-záéíóúñ\s]+$/i, message: 'Solo letras y espacios' },
            ]}
            extra="Puedes usar espacios (Ej: Rio Negro, Cerro Largo). Se guardará automáticamente sin espacios en la base de datos."
          >
            <Input
              prefix={<ShopOutlined />}
              placeholder="Ej: Rio Negro"
              size="large"
            />
          </Form.Item>

          <Form.Item name="direccion" label="Dirección (Opcional)">
            <Input placeholder="Ej: Av. Principal 123" size="large" />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono (Opcional)">
            <Input prefix={<PhoneOutlined />} placeholder="Ej: 099-123-456" size="large" />
          </Form.Item>

          <Form.Item name="ciudad" label="Ciudad (Opcional)">
            <Input placeholder="Ej: Montevideo" size="large" />
          </Form.Item>

          <Alert
            message="📋 Vista Previa"
            description={
              <div>
                <Text>
                  Nombre ingresado: <Text strong>{sucursalForm.getFieldValue('nombre') || 'nombre'}</Text>
                </Text>
                <br />
                <Text>
                  Tabla en BD: <Text code>clientes_{normalizarNombreSucursal(sucursalForm.getFieldValue('nombre') || 'nombre')}</Text>
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  (Ejemplo: "Rio Negro" se guardará como "rionegro" y se mostrará como "Rio Negro")
                </Text>
              </div>
            }
            type="info"
            showIcon
          />
        </Form>
      </Modal>

      {/* Modal: Cambiar Contraseña */}
      <Modal
        title={
          <Space>
            <LockOutlined />
            <span>Cambiar Contraseña</span>
          </Space>
        }
        open={modalCambiarPassword}
        onOk={cambiarPassword}
        onCancel={() => {
          setModalCambiarPassword(false);
          passwordForm.resetFields();
          setUsuarioEditandoPassword(null);
        }}
        okText="Cambiar Contraseña"
        cancelText="Cancelar"
        width={500}
      >
        <Alert
          message="🔐 Cambio de Contraseña"
          description={
            <div>
              <Text>Usuario: <Text strong>{usuarioEditandoPassword?.nombre}</Text></Text>
              <br />
              <Text>Email: <Text code copyable>{usuarioEditandoPassword?.email}</Text></Text>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="password"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa la nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Ingresa la nueva contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Contraseña"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirma la nueva contraseña"
              size="large"
            />
          </Form.Item>

          <Alert
            message="⚠️ Importante"
            description="El usuario deberá usar esta nueva contraseña en su próximo inicio de sesión."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>
    </div>
  );
};

export default StaffSellers;

