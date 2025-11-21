/**
 * Página de Listas de Precios por Sucursal
 * Genera PDFs elegantes con precios de productos
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  Spin,
  message,
  Empty,
  Divider,
  Alert
} from 'antd';
import {
  FileTextOutlined,
  FilePdfOutlined,
  ShopOutlined,
  DollarOutlined,
  BarcodeOutlined,
  ReloadOutlined,
  LockOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { productosService, vendedoresService, type ProductoCompleto } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Componente Principal
 */
const ProductPrices: React.FC = () => {
  // Contexto de autenticación
  const { usuario } = useAuth();
  
  // Verificar si es administrador
  const esAdmin = usuario?.email?.toLowerCase() === 'admin@zarparuy.com';
  
  // Obtener sucursal del usuario (si no es admin)
  const obtenerSucursalUsuario = (): string => {
    if (esAdmin || !usuario?.email) return '';
    
    const email = usuario.email.toLowerCase();
    // Extraer sucursal del email (ej: "pando@zarparuy.com" -> "pando")
    const sucursal = email.split('@')[0];
    return sucursal;
  };
  
  // Estados
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [productos, setProductos] = useState<ProductoCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  /**
   * Cargar sucursales al montar
   */
  useEffect(() => {
    cargarSucursales();
  }, []);

  /**
   * Cargar productos cuando cambia la sucursal
   */
  useEffect(() => {
    if (sucursalSeleccionada) {
      cargarProductos();
    }
  }, [sucursalSeleccionada]);

  /**
   * Cargar sucursales desde la API
   */
  const cargarSucursales = async () => {
    setLoadingSucursales(true);
    try {
      // Si NO es admin, solo cargar su propia sucursal
      if (!esAdmin) {
        const sucursalUsuario = obtenerSucursalUsuario();
        if (sucursalUsuario) {
          setSucursales([sucursalUsuario]);
          setSucursalSeleccionada(sucursalUsuario);
        } else {
          message.error('No se pudo determinar la sucursal del usuario');
        }
        return;
      }
      
      // Si ES admin, cargar todas las sucursales
      const sucursalesData = await vendedoresService.obtenerSucursales();
      setSucursales(sucursalesData);
      
      // Seleccionar la primera sucursal por defecto
      if (sucursalesData.length > 0) {
        setSucursalSeleccionada(sucursalesData[0]);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
      message.error('Error al cargar sucursales');
    } finally {
      setLoadingSucursales(false);
    }
  };

  /**
   * Función para ordenar productos por tipo prioritario, luego por marca, luego por nombre
   * ✅ Agrupa productos por tipo: Display → Batería → Flex → Placa Carga → Botón → Antena → Otros
   */
  const ordenarProductosPorTipo = (productos: ProductoCompleto[]): ProductoCompleto[] => {
    return productos.sort((a, b) => {
      const tipoA = (a.tipo || '').toLowerCase().trim();
      const tipoB = (b.tipo || '').toLowerCase().trim();
      const marcaA = (a.marca || '').toLowerCase().trim();
      const marcaB = (b.marca || '').toLowerCase().trim();
      
      // ✅ Definir prioridades de tipo (COMPLETO)
      const obtenerPrioridad = (tipo: string): number => {
        // Display - Prioridad 1
        if (tipo.includes('display')) return 1;
        
        // Batería - Prioridad 2
        if (tipo.includes('bateria') || tipo.includes('batería')) return 2;
        
        // Flex - Prioridad 3
        if (tipo.includes('flex')) return 3;
        
        // Placa Carga - Prioridad 4
        if (tipo.includes('placa') && tipo.includes('carga')) return 4;
        if (tipo === 'placa carga') return 4;
        
        // Botón - Prioridad 5
        if (tipo.includes('boton') || tipo.includes('botón')) return 5;
        
        // Antena - Prioridad 6
        if (tipo.includes('antena')) return 6;
        
        // Tapa - Prioridad 7
        if (tipo.includes('tapa')) return 7;
        
        // Cámara - Prioridad 8
        if (tipo.includes('camara') || tipo.includes('cámara')) return 8;
        
        // Conector - Prioridad 9
        if (tipo.includes('conector')) return 9;
        
        // Otros - Prioridad 999 (al final)
        return 999;
      };
      
      const prioridadA = obtenerPrioridad(tipoA);
      const prioridadB = obtenerPrioridad(tipoB);
      
      // 1. Primero ordenar por prioridad de tipo
      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }
      
      // 2. Luego ordenar por marca (dentro del mismo tipo)
      if (marcaA !== marcaB) {
        return marcaA.localeCompare(marcaB, 'es');
      }
      
      // 3. Finalmente ordenar por nombre (dentro de la misma marca)
      return (a.nombre || '').localeCompare(b.nombre || '', 'es');
    });
  };

  /**
   * Cargar productos con precios de la sucursal seleccionada
   */
  const cargarProductos = async () => {
    if (!sucursalSeleccionada) return;
    
    setLoading(true);
    try {
      console.log(`🔄 Cargando productos para sucursal: ${sucursalSeleccionada}`);
      const response = await productosService.obtenerPorSucursal(sucursalSeleccionada);
      console.log(`📦 Total productos recibidos de API: ${response.length}`);
      
      // Filtrar solo productos activos con precio > 0
      const productosConPrecio = response.filter(p => 
        p.activo && p.precio && p.precio > 0
      );
      console.log(`💰 Productos con precio > 0: ${productosConPrecio.length}`);
      
      // Mostrar algunos ejemplos de precios
      if (productosConPrecio.length > 0) {
        console.log('📊 Ejemplos de productos con precio:', 
          productosConPrecio.slice(0, 3).map(p => ({
            nombre: p.nombre,
            precio: p.precio,
            sucursal: sucursalSeleccionada
          }))
        );
      }
      
      // Ordenar productos por tipo prioritario
      const productosOrdenados = ordenarProductosPorTipo(productosConPrecio);
      setProductos(productosOrdenados);
      
      if (productosOrdenados.length === 0) {
        message.info('No hay productos con precio asignado en esta sucursal');
      } else {
        message.success(`✅ ${productosOrdenados.length} productos cargados con precios`);
      }
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      message.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generar PDF con la lista de precios
   */
  const generarPDF = () => {
    if (productos.length === 0) {
      message.warning('No hay productos para generar PDF');
      return;
    }

    console.log(`📄 Generando PDF con ${productos.length} productos`);
    console.log(`🏪 Sucursal: ${sucursalSeleccionada}`);
    console.log('📊 Primeros 3 productos:', productos.slice(0, 3).map(p => ({
      nombre: p.nombre,
      precio: p.precio
    })));

    setGeneratingPDF(true);
    
    try {
      // Crear documento PDF
      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString('es-UY');
      
      // Configuración de colores
      const colorPrimario: [number, number, number] = [59, 130, 246]; // Azul
      const colorSecundario: [number, number, number] = [100, 116, 139]; // Gris
      
      // ENCABEZADO
      doc.setFillColor(...colorPrimario);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Logo/Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ZARPAR', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Lista de Precios', 105, 30, { align: 'center' });
      
      // Información de la sucursal
      doc.setFontSize(10);
      doc.setTextColor(...colorSecundario);
      doc.setFont('helvetica', 'bold');
      doc.text(`Sucursal: ${sucursalSeleccionada.toUpperCase()}`, 14, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaActual}`, 14, 56);
      doc.text(`Total de productos: ${productos.length}`, 14, 62);
      
      // Línea divisoria
      doc.setDrawColor(...colorPrimario);
      doc.setLineWidth(0.5);
      doc.line(14, 68, 196, 68);
      
      // TABLA DE PRODUCTOS
      const datosTabla = productos.map((producto, index) => [
        index + 1,
        producto.codigo_barras || '-',
        producto.nombre,
        producto.marca || '-',
        producto.tipo || '-',
        `$ ${Number(producto.precio).toLocaleString('es-UY', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [['#', 'Código', 'Producto', 'Marca', 'Tipo', 'Precio']],
        body: datosTabla,
        theme: 'striped',
        headStyles: {
          fillColor: colorPrimario as unknown as [number, number, number],
          textColor: [255, 255, 255] as [number, number, number],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50] as [number, number, number]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 }, // #
          1: { halign: 'center', cellWidth: 25 }, // Código
          2: { halign: 'left', cellWidth: 60 }, // Producto
          3: { halign: 'left', cellWidth: 30 }, // Marca
          4: { halign: 'left', cellWidth: 25 }, // Tipo
          5: { halign: 'right', cellWidth: 30, fontStyle: 'bold' } // Precio
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Pie de página
          const pageCount = doc.getNumberOfPages();
          const pageHeight = doc.internal.pageSize.height;
          
          doc.setFontSize(8);
          doc.setTextColor(...colorSecundario);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            105,
            pageHeight - 10,
            { align: 'center' }
          );
          
          doc.text(
            'Sistema Zarpar - Gestión Comercial',
            105,
            pageHeight - 5,
            { align: 'center' }
          );
        }
      });
      
      // Guardar PDF
      const nombreArchivo = `Lista_Precios_${sucursalSeleccionada}_${fechaActual.replace(/\//g, '-')}.pdf`;
      doc.save(nombreArchivo);
      
      console.log(`✅ PDF generado: ${nombreArchivo}`);
      console.log(`📄 Contiene ${productos.length} productos con precios reales de ${sucursalSeleccionada.toUpperCase()}`);
      message.success(`✅ PDF generado: ${productos.length} productos de ${sucursalSeleccionada.toUpperCase()}`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      message.error('Error al generar el PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  /**
   * Columnas de la tabla
   */
  const columns: ColumnsType<ProductoCompleto> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_: any, __: ProductoCompleto, index: number) => (
        <Text strong>{index + 1}</Text>
      )
    },
    {
      title: 'Código de Barras',
      dataIndex: 'codigo_barras',
      key: 'codigo_barras',
      width: 140,
      render: (codigo: string) => (
        codigo ? (
          <Space>
            <BarcodeOutlined style={{ color: '#3b82f6' }} />
            <Text code>{codigo}</Text>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    },
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true,
      render: (nombre: string) => <Text strong>{nombre}</Text>
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 150,
      render: (marca: string) => marca || <Text type="secondary">-</Text>
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 150,
      render: (tipo: string) => (
        tipo ? (
          <Tag color="blue">{tipo}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    },
    {
      title: 'Precio',
      dataIndex: 'precio',
      key: 'precio',
      width: 120,
      align: 'right',
      render: (precio: number) => (
        <Text strong style={{ color: '#10b981', fontSize: 15 }}>
          ${Number(precio).toLocaleString('es-UY', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}
        </Text>
      ),
      sorter: (a, b) => a.precio - b.precio
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <Space direction="vertical" size="small">
          <FileTextOutlined style={{ fontSize: 48, color: '#3b82f6' }} />
          <Title level={2} style={{ margin: 0 }}>
            Listas de Precios
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Gestión y generación de listas de precios por sucursal
          </Text>
        </Space>
      </div>

      {/* Controles */}
      <Card 
        style={{ 
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {/* Alert para usuarios normales */}
        {!esAdmin && (
          <Alert
            message="🔒 Acceso Restringido"
            description={`Solo puedes ver y generar precios de tu sucursal asignada: ${obtenerSucursalUsuario().toUpperCase()}`}
            type="info"
            showIcon
            icon={<LockOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Space 
          direction="horizontal" 
          size="large" 
          style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}
        >
          {/* Selector de Sucursal */}
          <Space direction="vertical" size="small">
            <Text strong style={{ fontSize: 13 }}>
              <ShopOutlined /> {esAdmin ? 'Seleccionar Sucursal' : 'Tu Sucursal'}
            </Text>
            <Select
              value={sucursalSeleccionada}
              onChange={setSucursalSeleccionada}
              style={{ width: 250 }}
              size="large"
              loading={loadingSucursales}
              placeholder="Seleccione una sucursal"
              disabled={!esAdmin} // ✅ Deshabilitar si NO es admin
            >
              {sucursales.map((sucursal) => (
                <Option key={sucursal} value={sucursal}>
                  {sucursal.toUpperCase()}
                </Option>
              ))}
            </Select>
          </Space>

          {/* Botones de acción */}
          <Space size="middle">
            <Button
              icon={<ReloadOutlined />}
              onClick={cargarProductos}
              loading={loading}
              size="large"
            >
              Recargar
            </Button>
            <Button
              type="primary"
              icon={<FilePdfOutlined />}
              onClick={generarPDF}
              loading={generatingPDF}
              disabled={productos.length === 0}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              Generar PDF
            </Button>
          </Space>
        </Space>

        <Divider style={{ margin: '16px 0' }} />

        {/* Información de la sucursal */}
        {sucursalSeleccionada && (
          <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>SUCURSAL</Text>
              <div>
                <Text strong style={{ fontSize: 16, color: '#3b82f6' }}>
                  {sucursalSeleccionada.toUpperCase()}
                </Text>
              </div>
            </div>
            <Divider type="vertical" style={{ height: 40 }} />
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>PRODUCTOS</Text>
              <div>
                <Text strong style={{ fontSize: 16, color: '#10b981' }}>
                  {productos.length}
                </Text>
              </div>
            </div>
          </Space>
        )}
      </Card>

      {/* Tabla de Productos */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Cargando productos...</Text>
            </div>
          </div>
        ) : productos.length === 0 ? (
          <Empty
            description={
              sucursalSeleccionada 
                ? "No hay productos con precio asignado" 
                : "Seleccione una sucursal para ver los productos"
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={productos}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} productos`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            scroll={{ x: 1000 }}
            size="middle"
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    </div>
  );
};

export default ProductPrices;

