import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  InputNumber,
  Space,
  message,
  Statistic,
  Row,
  Col,
  Modal,
  Typography,
  Tag,
  Tooltip
} from 'antd';
import {
  ShoppingCartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DeleteOutlined,
  ReloadOutlined,
  WarningOutlined,
  ShopOutlined,
  LineChartOutlined,
  ToolOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ProductoAnalisis {
  id: number;
  nombre: string;
  marca: string;
  tipo: string;
  calidad: string;
  codigo_barras: string;
  stock_total: number;
  ventas_30_dias: number;
  fallas_total: number;
  stock_minimo: number;
  nota?: number; // Cantidad a pedir (editable)
}

const OrderAnalysis: React.FC = () => {
  const [productos, setProductos] = useState<ProductoAnalisis[]>([]);
  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState<{ [key: number]: number }>({});
  const [messageApi, contextHolder] = message.useMessage();

  // Cargar productos al montar
  useEffect(() => {
    cargarProductos();
    cargarNotasDesdeLocalStorage();
  }, []);

  // Guardar notas en localStorage cada vez que cambien
  useEffect(() => {
    if (Object.keys(notas).length > 0) {
      localStorage.setItem('pedidos_notas', JSON.stringify(notas));
    }
  }, [notas]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.hostname !== 'localhost' 
          ? '/api' 
          : 'http://localhost:3456/api');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/pedidos/analisis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setProductos(data.data);
        messageApi.success(`✅ ${data.data.length} productos cargados`);
      } else {
        messageApi.error('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      messageApi.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const cargarNotasDesdeLocalStorage = () => {
    const notasGuardadas = localStorage.getItem('pedidos_notas');
    if (notasGuardadas) {
      setNotas(JSON.parse(notasGuardadas));
    }
  };

  const handleNotaChange = (productoId: number, value: number | null) => {
    if (value === null || value === 0) {
      // Eliminar nota si es 0 o null
      const newNotas = { ...notas };
      delete newNotas[productoId];
      setNotas(newNotas);
    } else {
      setNotas({
        ...notas,
        [productoId]: value
      });
    }
  };

  const borrarTodasLasNotas = () => {
    Modal.confirm({
      title: '⚠️ ¿Borrar todas las notas?',
      content: (
        <div>
          <p>Esta acción <strong>eliminará permanentemente</strong> todas las cantidades que has ingresado en la columna de notas.</p>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>⚠️ Esta acción NO se puede deshacer.</p>
        </div>
      ),
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      okText: '🗑️ Sí, borrar todas',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setNotas({});
        localStorage.removeItem('pedidos_notas');
        messageApi.success('✅ Todas las notas han sido borradas');
      }
    });
  };

  const productosConNotas = productos.filter(p => notas[p.id] && notas[p.id] > 0);

  const exportarExcel = () => {
    if (productosConNotas.length === 0) {
      messageApi.warning('No hay productos con notas para exportar');
      return;
    }

    const datosExcel = productosConNotas.map((p, index) => ({
      '#': index + 1,
      'Producto': p.nombre,
      'Marca': p.marca,
      'Tipo': p.tipo,
      'Calidad': p.calidad,
      'Stock Total': p.stock_total,
      'Ventas (30d)': p.ventas_30_dias,
      'Fallas': p.fallas_total,
      'CANTIDAD A PEDIR': notas[p.id]
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedido a Proveedor');

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 35 }, // Producto
      { wch: 15 }, // Marca
      { wch: 15 }, // Tipo
      { wch: 12 }, // Calidad
      { wch: 12 }, // Stock Total
      { wch: 12 }, // Ventas
      { wch: 10 }, // Fallas
      { wch: 18 }, // Cantidad a pedir
    ];
    worksheet['!cols'] = columnWidths;

    const nombreArchivo = `Pedido_Proveedor_${dayjs().format('DD-MM-YYYY')}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
    
    messageApi.success(`✅ Excel exportado: ${productosConNotas.length} productos`);
  };

  const exportarPDF = () => {
    if (productosConNotas.length === 0) {
      messageApi.warning('No hay productos con notas para exportar');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PEDIDO A PROVEEDOR', doc.internal.pageSize.width / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 25;
    doc.text(`Fecha: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, yPos);
    yPos += 5;
    doc.text(`Total de productos: ${productosConNotas.length}`, 14, yPos);
    yPos += 5;
    doc.text(`Total de unidades: ${Object.values(notas).reduce((sum, val) => sum + val, 0)}`, 14, yPos);
    yPos += 10;

    // Tabla
    const tablaDatos = productosConNotas.map((p, index) => [
      index + 1,
      p.nombre.substring(0, 30),
      p.marca,
      p.tipo,
      p.calidad,
      p.stock_total,
      p.ventas_30_dias,
      p.fallas_total,
      notas[p.id]
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Producto', 'Marca', 'Tipo', 'Calidad', 'Stock', 'Ventas', 'Fallas', 'PEDIR']],
      body: tablaDatos,
      theme: 'striped',
      headStyles: { 
        fillColor: [59, 130, 246], 
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: { 
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 15, halign: 'center' },
        8: { cellWidth: 18, halign: 'center', fillColor: [255, 247, 205], fontStyle: 'bold' }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || yPos;
    doc.setFontSize(8);
    doc.text(
      `Generado: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
      14,
      doc.internal.pageSize.height - 10
    );

    doc.save(`Pedido_Proveedor_${dayjs().format('DD-MM-YYYY')}.pdf`);
    messageApi.success(`✅ PDF exportado: ${productosConNotas.length} productos`);
  };

  const columns: ColumnsType<ProductoAnalisis> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Producto',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Código: {record.codigo_barras || 'N/A'}
          </Text>
        </div>
      )
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Calidad',
      dataIndex: 'calidad',
      key: 'calidad',
      width: 100,
      render: (text) => <Tag color="green">{text}</Tag>
    },
    {
      title: 'Stock Total',
      dataIndex: 'stock_total',
      key: 'stock_total',
      width: 100,
      align: 'center',
      render: (value, record) => {
        const esBajo = record.stock_minimo > 0 && value < record.stock_minimo;
        return (
          <Tooltip title={esBajo ? `⚠️ Bajo stock mínimo (${record.stock_minimo})` : ''}>
            <Tag color={esBajo ? 'red' : value === 0 ? 'default' : 'cyan'}>
              <ShopOutlined /> {value}
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.stock_total - b.stock_total
    },
    {
      title: 'Ventas (30d)',
      dataIndex: 'ventas_30_dias',
      key: 'ventas_30_dias',
      width: 110,
      align: 'center',
      render: (value) => (
        <Tag color={value > 0 ? 'orange' : 'default'}>
          <LineChartOutlined /> {value}
        </Tag>
      ),
      sorter: (a, b) => a.ventas_30_dias - b.ventas_30_dias
    },
    {
      title: 'Fallas',
      dataIndex: 'fallas_total',
      key: 'fallas_total',
      width: 80,
      align: 'center',
      render: (value) => (
        <Tag color={value > 0 ? 'red' : 'default'}>
          <ToolOutlined /> {value}
        </Tag>
      ),
      sorter: (a, b) => a.fallas_total - b.fallas_total
    },
    {
      title: <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>📝 NOTAS (Cantidad a Pedir)</span>,
      key: 'nota',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={9999}
          value={notas[record.id] || null}
          onChange={(value) => handleNotaChange(record.id, value)}
          placeholder="0"
          style={{ 
            width: '100%',
            fontWeight: notas[record.id] ? 'bold' : 'normal'
          }}
          suffix="unidades"
        />
      ),
      fixed: 'right'
    }
  ];

  const totalUnidadesAPedir = Object.values(notas).reduce((sum, val) => sum + val, 0);

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}

      {/* Header */}
      <Card 
        style={{ 
          marginBottom: 24, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
      >
        <Row align="middle" gutter={16}>
          <Col flex="auto">
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                <ShoppingCartOutlined /> Análisis de Pedidos a Proveedores
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                Analiza el stock, ventas y fallas para determinar qué productos pedir
              </Text>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={cargarProductos}
              loading={loading}
              size="large"
              style={{ 
                background: 'white', 
                color: '#667eea',
                fontWeight: 'bold'
              }}
            >
              Actualizar
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Productos"
              value={productos.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Productos con Notas"
              value={productosConNotas.length}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Unidades a Pedir"
              value={totalUnidadesAPedir}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Stock Total Actual"
              value={productos.reduce((sum, p) => sum + p.stock_total, 0)}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Acciones */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={exportarExcel}
            disabled={productosConNotas.length === 0}
            size="large"
            style={{
              background: '#52c41a',
              borderColor: '#52c41a'
            }}
          >
            Exportar Excel
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={exportarPDF}
            disabled={productosConNotas.length === 0}
            size="large"
            style={{
              background: '#ff4d4f',
              borderColor: '#ff4d4f'
            }}
          >
            Exportar PDF
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={borrarTodasLasNotas}
            disabled={Object.keys(notas).length === 0}
            size="large"
          >
            Borrar Todas las Notas
          </Button>
          <Text type="secondary" style={{ marginLeft: 16 }}>
            ℹ️ Solo se exportarán los productos con notas
          </Text>
        </Space>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={productos}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 50,
            showTotal: (total) => `Total: ${total} productos`,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100', '200'],
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default OrderAnalysis;

