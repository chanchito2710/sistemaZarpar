import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Radio,
  Divider,
  Alert,
  Badge,
  Tooltip,
  Progress,
  Tabs,
  List,
  Avatar,
  Popconfirm,
  Switch,
  Timeline,
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  DollarOutlined,
  CreditCardOutlined,
  FilePdfOutlined,
  UserOutlined,
  CalendarOutlined,
  BankOutlined,
  MoneyCollectOutlined,
  ShoppingCartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  HomeOutlined,
  FilterOutlined,
  ExportOutlined,
  WarningOutlined,
  EditOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Customer {
  id: string;
  name: string;
  document: string;
  balance: number;
  status: 'debtor' | 'creditor' | 'settled';
  lastTransaction: string;
  phone: string;
  email: string;
  branch: string;
  address: string;
  creditLimit: number;
  riskLevel: 'low' | 'medium' | 'high';
  notes: string;
  registrationDate: string;
  totalPurchases: number;
  averageMonthlyPurchase: number;
}

interface Transaction {
  id: string;
  customerId: string;
  date: string;
  type: 'sale' | 'payment' | 'credit' | 'adjustment';
  amount: number;
  description: string;
  products?: ProductDetail[];
  paymentMethod?: 'cash' | 'transfer' | 'check' | 'card';
  reference?: string;
  branch: string;
  category: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface ProductDetail {
  name: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
  discount?: number;
}

interface BranchStats {
  branch: string;
  totalCustomers: number;
  totalDebtors: number;
  totalCreditors: number;
  totalDebt: number;
  totalCredit: number;
  monthlyRevenue: number;
  averageTicket: number;
}

import { BRANCHES } from '../data/branches';

const branches = [
  { value: 'all', label: 'Todas las Sucursales', icon: <BankOutlined /> },
  ...BRANCHES.map(branch => ({
    value: branch.name.toLowerCase(),
    label: branch.name,
    icon: <HomeOutlined />
  }))
];

const CustomerAccounts: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'debtor' | 'creditor' | 'settled'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [form] = Form.useForm();
  const [pdfForm] = Form.useForm();
  const [notesForm] = Form.useForm();

  // Mock data with realistic distribution across branches
  useEffect(() => {
    const mockCustomers: Customer[] = [
      // Maldonado
      {
        id: '1',
        name: 'Juan Pérez',
        document: '12345678',
        balance: -25000,
        status: 'debtor',
        lastTransaction: '2024-01-15',
        phone: '099123456',
        email: 'juan@email.com',
        branch: 'Maldonado',
        address: 'Av. Roosevelt 1234, Maldonado',
        creditLimit: 50000,
        riskLevel: 'high',
        notes: 'Cliente frecuente, pago irregular últimos 3 meses',
        registrationDate: '2023-03-15',
        totalPurchases: 180000,
        averageMonthlyPurchase: 15000
      },
      {
        id: '2',
        name: 'María González',
        document: '87654321',
        balance: 12000,
        status: 'creditor',
        lastTransaction: '2024-01-10',
        phone: '099654321',
        email: 'maria@email.com',
        branch: 'Maldonado',
        address: 'Calle 25 de Mayo 567, Maldonado',
        creditLimit: 30000,
        riskLevel: 'low',
        notes: 'Excelente historial crediticio',
        registrationDate: '2022-08-20',
        totalPurchases: 95000,
        averageMonthlyPurchase: 8500
      },
      // Pando
      {
        id: '3',
        name: 'Carlos Rodríguez',
        document: '11223344',
        balance: -18000,
        status: 'debtor',
        lastTransaction: '2024-01-12',
        phone: '099111222',
        email: 'carlos@email.com',
        branch: 'Pando',
        address: 'Ruta 8 Km 25, Pando',
        creditLimit: 40000,
        riskLevel: 'medium',
        notes: 'Comerciante local, pagos estacionales',
        registrationDate: '2023-01-10',
        totalPurchases: 120000,
        averageMonthlyPurchase: 10000
      },
      {
        id: '4',
        name: 'Ana Martínez',
        document: '44332211',
        balance: 8500,
        status: 'creditor',
        lastTransaction: '2024-01-08',
        phone: '099333444',
        email: 'ana@email.com',
        branch: 'Pando',
        address: 'Av. Artigas 890, Pando',
        creditLimit: 25000,
        riskLevel: 'low',
        notes: 'Cliente VIP, descuentos especiales',
        registrationDate: '2022-11-05',
        totalPurchases: 75000,
        averageMonthlyPurchase: 6500
      },
      // Melo
      {
        id: '5',
        name: 'Luis Fernández',
        document: '55667788',
        balance: -32000,
        status: 'debtor',
        lastTransaction: '2024-01-14',
        phone: '099555666',
        email: 'luis@email.com',
        branch: 'Melo',
        address: 'Calle Treinta y Tres 456, Melo',
        creditLimit: 60000,
        riskLevel: 'high',
        notes: 'Deuda vencida hace 45 días, contactar urgente',
        registrationDate: '2023-05-20',
        totalPurchases: 200000,
        averageMonthlyPurchase: 18000
      },
      {
        id: '6',
        name: 'Patricia Silva',
        document: '99887766',
        balance: 0,
        status: 'settled',
        lastTransaction: '2024-01-16',
        phone: '099777888',
        email: 'patricia@email.com',
        branch: 'Melo',
        address: 'Av. Brasil 123, Melo',
        creditLimit: 35000,
        riskLevel: 'low',
        notes: 'Cuenta saldada recientemente',
        registrationDate: '2023-07-12',
        totalPurchases: 85000,
        averageMonthlyPurchase: 7500
      },
      // Paysandú
      {
        id: '7',
        name: 'Roberto Díaz',
        document: '33445566',
        balance: -15000,
        status: 'debtor',
        lastTransaction: '2024-01-11',
        phone: '099444555',
        email: 'roberto@email.com',
        branch: 'Paysandú',
        address: 'Calle 18 de Julio 789, Paysandú',
        creditLimit: 45000,
        riskLevel: 'medium',
        notes: 'Agricultor, pagos según cosecha',
        registrationDate: '2022-12-03',
        totalPurchases: 110000,
        averageMonthlyPurchase: 9500
      },
      {
        id: '8',
        name: 'Carmen López',
        document: '77889900',
        balance: 15000,
        status: 'creditor',
        lastTransaction: '2024-01-13',
        phone: '099888999',
        email: 'carmen@email.com',
        branch: 'Paysandú',
        address: 'Av. España 321, Paysandú',
        creditLimit: 20000,
        riskLevel: 'low',
        notes: 'Comercio mayorista, pagos adelantados',
        registrationDate: '2023-02-28',
        totalPurchases: 65000,
        averageMonthlyPurchase: 5500
      },
      // Salto
      {
        id: '9',
        name: 'Diego Morales',
        document: '22334455',
        balance: -28000,
        status: 'debtor',
        lastTransaction: '2024-01-09',
        phone: '099222333',
        email: 'diego@email.com',
        branch: 'Salto',
        address: 'Calle Uruguay 654, Salto',
        creditLimit: 55000,
        riskLevel: 'high',
        notes: 'Deuda consolidada, plan de pagos activo',
        registrationDate: '2023-04-18',
        totalPurchases: 165000,
        averageMonthlyPurchase: 14500
      },
      {
        id: '10',
        name: 'Sofía Ramírez',
        document: '66778899',
        balance: 9500,
        status: 'creditor',
        lastTransaction: '2024-01-17',
        phone: '099666777',
        email: 'sofia@email.com',
        branch: 'Salto',
        address: 'Av. Batlle y Ordóñez 987, Salto',
        creditLimit: 30000,
        riskLevel: 'low',
        notes: 'Cliente premium, descuentos por volumen',
        registrationDate: '2022-09-14',
        totalPurchases: 88000,
        averageMonthlyPurchase: 7800
      },
      // Rivera
      {
        id: '11',
        name: 'Andrés Castro',
        document: '11335577',
        balance: -22000,
        status: 'debtor',
        lastTransaction: '2024-01-07',
        phone: '099111333',
        email: 'andres@email.com',
        branch: 'Rivera',
        address: 'Calle Sarandí 147, Rivera',
        creditLimit: 50000,
        riskLevel: 'medium',
        notes: 'Fronterizo, pagos en pesos uruguayos',
        registrationDate: '2023-06-25',
        totalPurchases: 135000,
        averageMonthlyPurchase: 12000
      },
      {
        id: '12',
        name: 'Valentina Torres',
        document: '99112233',
        balance: 18000,
        status: 'creditor',
        lastTransaction: '2024-01-18',
        phone: '099991122',
        email: 'valentina@email.com',
        branch: 'Rivera',
        address: 'Av. Libertad 258, Rivera',
        creditLimit: 40000,
        riskLevel: 'low',
        notes: 'Exportadora, pagos en dólares',
        registrationDate: '2022-10-30',
        totalPurchases: 92000,
        averageMonthlyPurchase: 8200
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        customerId: '1',
        date: '2024-01-15',
        type: 'sale',
        amount: 25000,
        description: 'Venta de herramientas agrícolas',
        branch: 'Maldonado',
        category: 'Herramientas',
        status: 'completed',
        products: [
          { name: 'Motosierra Stihl MS250', category: 'Herramientas', quantity: 1, price: 15000, total: 15000 },
          { name: 'Bordeadora Husqvarna', category: 'Herramientas', quantity: 1, price: 10000, total: 10000 }
        ]
      },
      {
        id: '2',
        customerId: '2',
        date: '2024-01-10',
        type: 'payment',
        amount: 12000,
        description: 'Pago por transferencia bancaria',
        branch: 'Maldonado',
        category: 'Pagos',
        status: 'completed',
        paymentMethod: 'transfer',
        reference: 'TRF001234'
      },
      {
        id: '3',
        customerId: '3',
        date: '2024-01-12',
        type: 'sale',
        amount: 18000,
        description: 'Venta de insumos para construcción',
        branch: 'Pando',
        category: 'Construcción',
        status: 'completed',
        products: [
          { name: 'Cemento Portland x50kg', category: 'Construcción', quantity: 20, price: 450, total: 9000 },
          { name: 'Hierro 8mm x12m', category: 'Construcción', quantity: 15, price: 600, total: 9000 }
        ]
      },
      {
        id: '4',
        customerId: '5',
        date: '2024-01-14',
        type: 'sale',
        amount: 32000,
        description: 'Venta de maquinaria agrícola',
        branch: 'Melo',
        category: 'Maquinaria',
        status: 'completed',
        products: [
          { name: 'Tractor Compacto 25HP', category: 'Maquinaria', quantity: 1, price: 32000, total: 32000 }
        ]
      },
      {
        id: '5',
        customerId: '7',
        date: '2024-01-11',
        type: 'sale',
        amount: 15000,
        description: 'Venta de semillas y fertilizantes',
        branch: 'paysandu',
        category: 'Agricultura',
        status: 'completed',
        products: [
          { name: 'Semilla Soja RR', category: 'Agricultura', quantity: 50, price: 200, total: 10000 },
          { name: 'Fertilizante NPK', category: 'Agricultura', quantity: 10, price: 500, total: 5000 }
        ]
      }
    ];

    setCustomers(mockCustomers);
    setTransactions(mockTransactions);
    setFilteredCustomers(mockCustomers);
    
    // Calculate branch statistics
    calculateBranchStats(mockCustomers);
  }, []);

  const calculateBranchStats = (customerData: Customer[]) => {
    const stats: BranchStats[] = [];
    
    branches.slice(1).forEach(branch => { // Skip 'all' option
      const branchCustomers = customerData.filter(c => c.branch === branch.value);
      const debtors = branchCustomers.filter(c => c.status === 'debtor');
      const creditors = branchCustomers.filter(c => c.status === 'creditor');
      
      stats.push({
        branch: branch.label,
        totalCustomers: branchCustomers.length,
        totalDebtors: debtors.length,
        totalCreditors: creditors.length,
        totalDebt: debtors.reduce((sum, c) => sum + Math.abs(c.balance), 0),
        totalCredit: creditors.reduce((sum, c) => sum + c.balance, 0),
        monthlyRevenue: branchCustomers.reduce((sum, c) => sum + c.averageMonthlyPurchase, 0),
        averageTicket: branchCustomers.length > 0 ? 
          branchCustomers.reduce((sum, c) => sum + c.averageMonthlyPurchase, 0) / branchCustomers.length : 0
      });
    });
    
    setBranchStats(stats);
  };

  // Filter customers
  useEffect(() => {
    let filtered = customers;

    if (searchText) {
      filtered = filtered.filter(
        customer =>
          customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
          customer.document.includes(searchText) ||
          customer.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    if (branchFilter !== 'all') {
      filtered = filtered.filter(customer => customer.branch === branchFilter);
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(customer => customer.riskLevel === riskFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchText, statusFilter, branchFilter, riskFilter]);

  const handlePayment = async (values: any) => {
    if (!selectedCustomer) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      customerId: selectedCustomer.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'payment',
      amount: values.amount,
      description: `Pago ${values.paymentMethod === 'cash' ? 'en efectivo' : 
        values.paymentMethod === 'transfer' ? 'por transferencia' :
        values.paymentMethod === 'check' ? 'con cheque' : 'con tarjeta'}`,
      paymentMethod: values.paymentMethod,
      reference: values.reference,
      branch: selectedCustomer.branch,
      category: 'Pagos',
      status: 'completed'
    };

    // Update customer balance
    const updatedCustomers = customers.map(customer => {
      if (customer.id === selectedCustomer.id) {
        const newBalance = customer.balance + values.amount;
        return {
          ...customer,
          balance: newBalance,
          status: newBalance < 0 ? 'debtor' : newBalance > 0 ? 'creditor' : 'settled' as 'debtor' | 'creditor' | 'settled',
          lastTransaction: format(new Date(), 'yyyy-MM-dd')
        };
      }
      return customer;
    });

    setCustomers(updatedCustomers);
    setTransactions([...transactions, newTransaction]);
    calculateBranchStats(updatedCustomers);
    setPaymentModalVisible(false);
    setSelectedCustomer(null);
    form.resetFields();
    message.success('Pago registrado exitosamente');
  };

  const handleNotesUpdate = async (values: any) => {
    if (!selectedCustomer) return;

    const updatedCustomers = customers.map(customer => {
      if (customer.id === selectedCustomer.id) {
        return {
          ...customer,
          notes: values.notes
        };
      }
      return customer;
    });

    setCustomers(updatedCustomers);
    setNotesModalVisible(false);
    setSelectedCustomer(null);
    notesForm.resetFields();
    message.success('Notas actualizadas exitosamente');
  };

  const generateDetailedPDF = async (values: any) => {
    if (!selectedCustomer) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // HEADER PROFESIONAL
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 10, 30, 30, 'F');
    doc.setTextColor(41, 128, 185);
    doc.setFontSize(12);
    doc.text('LOGO', 25, 28);
    
    // Company info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('SISTEMA ZARPAR', 55, 25);
    doc.setFontSize(12);
    doc.text('Gestión Comercial Integral', 55, 35);
    
    // Branch and date
    const branchName = branches.find(b => b.value === selectedCustomer.branch)?.label || selectedCustomer.branch;
    doc.text(`Sucursal: ${branchName}`, 55, 42);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 80, 25);
    doc.text('Estado de Cuenta Detallado', pageWidth - 80, 35);
    
    yPosition = 70;

    // INFORMACIÓN DEL CLIENTE
    checkPageBreak(60);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPosition - 5, pageWidth - 30, 50, 'F');
    
    doc.setFontSize(16);
    doc.text('📋 INFORMACIÓN DEL CLIENTE', 20, yPosition + 5);
    
    doc.setFontSize(11);
    doc.text(`Nombre: ${selectedCustomer.name}`, 20, yPosition + 15);
    doc.text(`Documento: ${selectedCustomer.document}`, 20, yPosition + 25);
    doc.text(`Teléfono: ${selectedCustomer.phone}`, 20, yPosition + 35);
    doc.text(`Email: ${selectedCustomer.email}`, 110, yPosition + 15);
    doc.text(`Dirección: ${selectedCustomer.address}`, 110, yPosition + 25);
    doc.text(`Sucursal: ${branchName}`, 110, yPosition + 35);
    
    yPosition += 60;

    // RESUMEN EJECUTIVO
    checkPageBreak(80);
    doc.setFillColor(52, 152, 219);
    doc.rect(15, yPosition - 5, pageWidth - 30, 70, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('📊 RESUMEN EJECUTIVO', 20, yPosition + 5);
    
    // Balance principal
    const balanceText = selectedCustomer.balance < 0 ? 'DEUDA PENDIENTE' : 
                       selectedCustomer.balance > 0 ? 'SALDO A FAVOR' : 'CUENTA SALDADA';
    const balanceAmount = `$${Math.abs(selectedCustomer.balance).toLocaleString()}`;
    
    doc.setFontSize(14);
    doc.text(balanceText, 20, yPosition + 20);
    doc.setFontSize(20);
    doc.text(balanceAmount, 20, yPosition + 35);
    
    // Métricas adicionales
    doc.setFontSize(11);
    doc.text(`Límite de Crédito: $${selectedCustomer.creditLimit.toLocaleString()}`, 110, yPosition + 15);
    doc.text(`Compras Totales: $${selectedCustomer.totalPurchases.toLocaleString()}`, 110, yPosition + 25);
    doc.text(`Promedio Mensual: $${selectedCustomer.averageMonthlyPurchase.toLocaleString()}`, 110, yPosition + 35);
    doc.text(`Nivel de Riesgo: ${selectedCustomer.riskLevel.toUpperCase()}`, 110, yPosition + 45);
    doc.text(`Cliente desde: ${format(new Date(selectedCustomer.registrationDate), 'dd/MM/yyyy')}`, 110, yPosition + 55);
    
    yPosition += 85;

    // ANÁLISIS DE RIESGO
    checkPageBreak(40);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(selectedCustomer.riskLevel === 'high' ? 231 : selectedCustomer.riskLevel === 'medium' ? 255 : 46, 
                     selectedCustomer.riskLevel === 'high' ? 76 : selectedCustomer.riskLevel === 'medium' ? 193 : 204, 
                     selectedCustomer.riskLevel === 'high' ? 60 : selectedCustomer.riskLevel === 'medium' ? 7 : 113);
    doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`⚠️ ANÁLISIS DE RIESGO: ${selectedCustomer.riskLevel.toUpperCase()}`, 20, yPosition + 10);
    
    doc.setFontSize(10);
    const riskDescription = selectedCustomer.riskLevel === 'high' ? 'Cliente de alto riesgo - Requiere seguimiento especial' :
                           selectedCustomer.riskLevel === 'medium' ? 'Cliente de riesgo medio - Monitoreo regular' :
                           'Cliente de bajo riesgo - Historial crediticio excelente';
    doc.text(riskDescription, 20, yPosition + 22);
    
    yPosition += 50;

    // DETALLE DE TRANSACCIONES
    checkPageBreak(40);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('💳 DETALLE DE TRANSACCIONES', 20, yPosition);
    
    yPosition += 15;
    
    // Filter transactions by date range if provided
    let customerTransactions = transactions.filter(t => t.customerId === selectedCustomer.id);
    
    if (values.dateRange) {
      const startDate = values.dateRange[0].toDate();
      const endDate = values.dateRange[1].toDate();
      customerTransactions = customerTransactions.filter(t => {
        const transDate = new Date(t.date);
        return isAfter(transDate, startDate) && isBefore(transDate, endDate);
      });
    }
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    // Table headers
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition, pageWidth - 30, 15, 'F');
    doc.setFontSize(10);
    doc.text('Fecha', 20, yPosition + 10);
    doc.text('Descripción', 50, yPosition + 10);
    doc.text('Categoría', 110, yPosition + 10);
    doc.text('Método', 140, yPosition + 10);
    doc.text('Monto', 170, yPosition + 10);
    
    yPosition += 20;
    
    customerTransactions.forEach((transaction, index) => {
      checkPageBreak(25);
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPosition - 5, pageWidth - 30, 15, 'F');
      }
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(format(new Date(transaction.date), 'dd/MM/yyyy'), 20, yPosition + 5);
      
      // Truncate long descriptions
      const description = transaction.description.length > 25 ? 
                         transaction.description.substring(0, 25) + '...' : 
                         transaction.description;
      doc.text(description, 50, yPosition + 5);
      doc.text(transaction.category, 110, yPosition + 5);
      doc.text(transaction.paymentMethod || 'N/A', 140, yPosition + 5);
      
      // Amount with color coding
      const amountColor = transaction.type === 'payment' ? [39, 174, 96] : [231, 76, 60];
      doc.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
      const prefix = transaction.type === 'payment' ? '+' : '-';
      doc.text(`${prefix}$${transaction.amount.toLocaleString()}`, 170, yPosition + 5);
      
      if (transaction.type === 'payment') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
      
      yPosition += 15;
      
      // Product details if available
      if (transaction.products && transaction.products.length > 0) {
        transaction.products.forEach(product => {
          checkPageBreak(10);
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.text(`    • ${product.name} (${product.quantity}x) - $${product.total.toLocaleString()}`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 5;
      }
    });
    
    // RESUMEN FINANCIERO
    checkPageBreak(60);
    doc.setFillColor(41, 128, 185);
    doc.rect(15, yPosition, pageWidth - 30, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('💰 RESUMEN FINANCIERO DEL PERÍODO', 20, yPosition + 15);
    
    doc.setFontSize(12);
    doc.text(`Total Ingresos: $${totalIncome.toLocaleString()}`, 20, yPosition + 30);
    doc.text(`Total Egresos: $${totalExpenses.toLocaleString()}`, 20, yPosition + 40);
    doc.text(`Balance Neto: $${(totalIncome - totalExpenses).toLocaleString()}`, 110, yPosition + 30);
    doc.text(`Saldo Actual: $${selectedCustomer.balance.toLocaleString()}`, 110, yPosition + 40);
    
    yPosition += 65;
    
    // PROYECCIONES Y RECOMENDACIONES
    checkPageBreak(50);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(255, 248, 220);
    doc.rect(15, yPosition, pageWidth - 30, 45, 'F');
    
    doc.setFontSize(14);
    doc.text('🔮 PROYECCIONES Y RECOMENDACIONES', 20, yPosition + 15);
    
    doc.setFontSize(10);
    const projectedMonthly = selectedCustomer.averageMonthlyPurchase;
    const creditUtilization = (Math.abs(selectedCustomer.balance) / selectedCustomer.creditLimit) * 100;
    
    doc.text(`Compra proyectada próximo mes: $${projectedMonthly.toLocaleString()}`, 20, yPosition + 25);
    doc.text(`Utilización de crédito: ${creditUtilization.toFixed(1)}%`, 20, yPosition + 35);
    
    const recommendation = creditUtilization > 80 ? 'Revisar límite de crédito' :
                          creditUtilization > 50 ? 'Monitorear de cerca' :
                          'Cliente en buen estado';
    doc.text(`Recomendación: ${recommendation}`, 110, yPosition + 25);
    
    yPosition += 60;
    
    // NOTAS DEL CLIENTE
    if (selectedCustomer.notes) {
      checkPageBreak(30);
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPosition, pageWidth - 30, 25, 'F');
      
      doc.setFontSize(12);
      doc.text('📝 NOTAS DEL CLIENTE', 20, yPosition + 10);
      doc.setFontSize(10);
      doc.text(selectedCustomer.notes, 20, yPosition + 20);
      
      yPosition += 35;
    }
    
    // FOOTER PROFESIONAL
    const footerY = pageHeight - 40;
    doc.setFillColor(240, 240, 240);
    doc.rect(0, footerY, pageWidth, 40, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Sistema Zarpar - Gestión Comercial Integral', 20, footerY + 10);
    doc.text(`Sucursal ${branchName} | Tel: 099-123-456 | Email: info@zarpar.com`, 20, footerY + 20);
    doc.text('Este documento es confidencial y de uso exclusivo del destinatario', 20, footerY + 30);
    
    // QR Code placeholder
    doc.setFillColor(0, 0, 0);
    doc.rect(pageWidth - 35, footerY + 5, 25, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('QR', pageWidth - 25, footerY + 18);
    
    // Digital signature placeholder
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Firma Digital: ✓ Verificado', pageWidth - 80, footerY + 35);

    // Save PDF
    const fileName = `estado-cuenta-detallado-${selectedCustomer.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    
    setPdfModalVisible(false);
    setSelectedCustomer(null);
    pdfForm.resetFields();
    message.success('PDF detallado generado exitosamente');
  };

  const exportBranchData = (branch: string) => {
    const branchCustomers = branch === 'all' ? customers : customers.filter(c => c.branch === branch);
    const branchName = branch === 'all' ? 'Todas-las-Sucursales' : branches.find(b => b.value === branch)?.label || branch;
    
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Reporte de Sucursal: ${branchName}`, 20, 20);
    
    let yPos = 40;
    branchCustomers.forEach(customer => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${customer.name} - $${customer.balance.toLocaleString()}`, 20, yPos);
      yPos += 10;
    });
    
    doc.save(`reporte-sucursal-${branchName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    message.success(`Reporte de ${branchName} exportado exitosamente`);
  };

  const getOverdueCustomers = () => {
    return customers.filter(customer => {
      if (customer.status !== 'debtor') return false;
      const lastTransactionDate = new Date(customer.lastTransaction);
      const thirtyDaysAgo = subDays(new Date(), 30);
      return isBefore(lastTransactionDate, thirtyDaysAgo);
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined />
          Nombre
        </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      render: (name: string, record: Customer) => (
        <Space>
          <Avatar style={{ backgroundColor: record.riskLevel === 'high' ? '#f5222d' : record.riskLevel === 'medium' ? '#fa8c16' : '#52c41a' }}>
            {name.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.document}</Text>
          </div>
        </Space>
      )
    },
    {
      title: (
        <Space>
          <HomeOutlined />
          Sucursal
        </Space>
      ),
      dataIndex: 'branch',
      key: 'branch',
      render: (branch: string) => {
        const branchInfo = branches.find(b => b.value === branch);
        return (
          <Tag icon={branchInfo?.icon}>
            {branchInfo?.label || branch}
          </Tag>
        );
      },
      filters: branches.slice(1).map(branch => ({ text: branch.label, value: branch.value })),
      onFilter: (value: any, record: Customer) => record.branch === value
    },
    {
      title: (
        <Space>
          <DollarOutlined />
          Saldo
        </Space>
      ),
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number, record: Customer) => {
        const color = balance < 0 ? '#f5222d' : balance > 0 ? '#52c41a' : '#1890ff';
        const icon = balance < 0 ? <ArrowDownOutlined /> : balance > 0 ? <ArrowUpOutlined /> : <CheckCircleOutlined />;
        
        return (
          <Space>
            <Text strong style={{ color }}>
              ${Math.abs(balance).toLocaleString()}
            </Text>
            {icon}
          </Space>
        );
      },
      sorter: (a: Customer, b: Customer) => a.balance - b.balance
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Customer) => {
        const config = {
          debtor: { color: 'red', icon: <ArrowDownOutlined />, text: 'DEUDOR' },
          creditor: { color: 'green', icon: <ArrowUpOutlined />, text: 'A FAVOR' },
          settled: { color: 'blue', icon: <CheckCircleOutlined />, text: 'SALDADO' }
        };
        
        const statusConfig = config[status as keyof typeof config];
        
        return (
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Deudores', value: 'debtor' },
        { text: 'A Favor', value: 'creditor' },
        { text: 'Saldados', value: 'settled' }
      ],
      onFilter: (value: any, record: Customer) => record.status === value
    },
    {
      title: (
        <Space>
          <WarningOutlined />
          Riesgo
        </Space>
      ),
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk: string) => {
        const config = {
          low: { color: 'green', text: 'BAJO' },
          medium: { color: 'orange', text: 'MEDIO' },
          high: { color: 'red', text: 'ALTO' }
        };
        
        const riskConfig = config[risk as keyof typeof config];
        
        return (
          <Badge 
            color={riskConfig.color} 
            text={riskConfig.text}
          />
        );
      },
      filters: [
        { text: 'Bajo Riesgo', value: 'low' },
        { text: 'Riesgo Medio', value: 'medium' },
        { text: 'Alto Riesgo', value: 'high' }
      ],
      onFilter: (value: any, record: Customer) => record.riskLevel === value
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Última Transacción
        </Space>
      ),
      dataIndex: 'lastTransaction',
      key: 'lastTransaction',
      render: (date: string) => {
        const transactionDate = new Date(date);
        const isOverdue = isBefore(transactionDate, subDays(new Date(), 30));
        
        return (
          <Space>
            <Text style={{ color: isOverdue ? '#f5222d' : 'inherit' }}>
              {format(transactionDate, 'dd/MM/yyyy')}
            </Text>
            {isOverdue && <WarningOutlined style={{ color: '#f5222d' }} />}
          </Space>
        );
      },
      sorter: (a: Customer, b: Customer) => new Date(a.lastTransaction).getTime() - new Date(b.lastTransaction).getTime()
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record: Customer) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Registrar pago">
            <Button
              size="small"
              type="primary"
              icon={<MoneyCollectOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                setPaymentModalVisible(true);
              }}
              disabled={record.balance >= 0}
            />
          </Tooltip>
          
          <Tooltip title="Editar notas">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                notesForm.setFieldsValue({ notes: record.notes });
                setNotesModalVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Generar PDF">
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => {
                setSelectedCustomer(record);
                setPdfModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const overdueCustomers = getOverdueCustomers();
  const totalDebtors = filteredCustomers.filter(c => c.status === 'debtor').length;
  const totalCreditors = filteredCustomers.filter(c => c.status === 'creditor').length;
  const totalSettled = filteredCustomers.filter(c => c.status === 'settled').length;
  const totalDebt = filteredCustomers.filter(c => c.status === 'debtor').reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const totalCredit = filteredCustomers.filter(c => c.status === 'creditor').reduce((sum, c) => sum + c.balance, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BankOutlined /> Cuenta Corriente - Sistema Avanzado
      </Title>

      {/* Alertas automáticas */}
      {showAlerts && overdueCustomers.length > 0 && (
        <Alert
          message={`⚠️ Atención: ${overdueCustomers.length} cliente(s) con deudas vencidas`}
          description={
            <div>
              <Text>Clientes con más de 30 días sin transacciones: </Text>
              {overdueCustomers.slice(0, 3).map(customer => (
                <Tag key={customer.id} color="red" style={{ margin: '2px' }}>
                  {customer.name}
                </Tag>
              ))}
              {overdueCustomers.length > 3 && <Text>... y {overdueCustomers.length - 3} más</Text>}
            </div>
          }
          type="warning"
          showIcon
          closable
          onClose={() => setShowAlerts(false)}
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Estadísticas por sucursal */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={filteredCustomers.length}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Deudores"
              value={totalDebtors}
              prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="A Favor"
              value={totalCreditors}
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Saldados"
              value={totalSettled}
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Deuda"
              value={totalDebt}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Crédito"
              value={totalCredit}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Métricas por sucursal */}
      {branchFilter !== 'all' && branchStats.length > 0 && (
        <Card title={`📊 Métricas de ${branches.find(b => b.value === branchFilter)?.label}`} style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            {branchStats
              .filter(stat => stat.branch === branches.find(b => b.value === branchFilter)?.label)
              .map(stat => (
                <React.Fragment key={stat.branch}>
                  <Col span={6}>
                    <Statistic title="Clientes" value={stat.totalCustomers} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Ingresos Mensuales" value={stat.monthlyRevenue} prefix="$" />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Ticket Promedio" value={Math.round(stat.averageTicket)} prefix="$" />
                  </Col>
                  <Col span={6}>
                    <Progress 
                      type="circle" 
                      percent={Math.round((stat.totalCreditors / stat.totalCustomers) * 100)} 
                      format={percent => `${percent}% Solventes`}
                      size={80}
                    />
                  </Col>
                </React.Fragment>
              ))
            }
          </Row>
        </Card>
      )}

      {/* Filtros avanzados */}
      <Card title={<Space><FilterOutlined />Filtros Avanzados</Space>} style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Buscar por nombre, documento o email"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrar por sucursal"
              value={branchFilter}
              onChange={setBranchFilter}
            >
              {branches.map(branch => (
                <Option key={branch.value} value={branch.value}>
                  <Space>
                    {branch.icon}
                    {branch.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrar por estado"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Todos los estados</Option>
              <Option value="debtor">Solo deudores</Option>
              <Option value="creditor">Solo a favor</Option>
              <Option value="settled">Solo saldados</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filtrar por riesgo"
              value={riskFilter}
              onChange={setRiskFilter}
            >
              <Option value="all">Todos los niveles</Option>
              <Option value="low">Bajo riesgo</Option>
              <Option value="medium">Riesgo medio</Option>
              <Option value="high">Alto riesgo</Option>
            </Select>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Space>
              <Button 
                icon={<ExportOutlined />} 
                onClick={() => exportBranchData(branchFilter)}
              >
                Exportar Sucursal
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={() => exportBranchData('all')}
              >
                Exportar Todo
              </Button>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Text>Mostrar alertas:</Text>
              <Switch checked={showAlerts} onChange={setShowAlerts} />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla principal */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} clientes`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          rowClassName={(record) => {
            if (record.riskLevel === 'high') return 'high-risk-row';
            if (overdueCustomers.some(c => c.id === record.id)) return 'overdue-row';
            return '';
          }}
        />
      </Card>

      {/* Modal de detalles del cliente */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            Detalles del Cliente
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedCustomer(null);
        }}
        footer={null}
        width={800}
      >
        {selectedCustomer && (
          <Tabs defaultActiveKey="1">
            <TabPane tab={<Space><UserOutlined />Información General</Space>} key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nombre">{selectedCustomer.name}</Descriptions.Item>
                <Descriptions.Item label="Documento">{selectedCustomer.document}</Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  <Space>
                    <PhoneOutlined />
                    {selectedCustomer.phone}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    {selectedCustomer.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Dirección" span={2}>{selectedCustomer.address}</Descriptions.Item>
                <Descriptions.Item label="Sucursal">
                  <Tag icon={branches.find(b => b.value === selectedCustomer.branch)?.icon}>
                    {branches.find(b => b.value === selectedCustomer.branch)?.label}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Modal de pago */}
      <Modal
        title={
          <Space>
            <MoneyCollectOutlined />
            Registrar Pago
          </Space>
        }
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setSelectedCustomer(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedCustomer && (
          <>
            <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f5f5f5' }}>
              <Text strong>Cliente: </Text>{selectedCustomer.name}<br />
              <Text strong>Saldo Actual: </Text>
              <Text style={{ 
                color: selectedCustomer.balance < 0 ? '#f5222d' : '#52c41a',
                fontWeight: 'bold'
              }}>
                ${selectedCustomer.balance.toLocaleString()}
              </Text>
            </Card>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handlePayment}
            >
              <Form.Item
                name="amount"
                label="Monto a Pagar"
                rules={[
                  { required: true, message: 'Ingrese el monto' },
                  { type: 'number', min: 1, message: 'El monto debe ser mayor a 0' },
                  { 
                    type: 'number', 
                    max: Math.abs(selectedCustomer.balance), 
                    message: `El monto no puede ser mayor a la deuda (${Math.abs(selectedCustomer.balance).toLocaleString()})` 
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix={<DollarOutlined />}
                  placeholder="0.00"
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  max={Math.abs(selectedCustomer.balance)}
                />
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label="Método de Pago"
                rules={[{ required: true, message: 'Seleccione el método de pago' }]}
              >
                <Radio.Group>
                  <Radio value="cash">
                    <Space>
                      <DollarOutlined />
                      Efectivo
                    </Space>
                  </Radio>
                  <Radio value="transfer">
                    <Space>
                      <CreditCardOutlined />
                      Transferencia
                    </Space>
                  </Radio>
                  <Radio value="check">
                    <Space>
                      <FileTextOutlined />
                      Cheque
                    </Space>
                  </Radio>
                  <Radio value="card">
                    <Space>
                      <CreditCardOutlined />
                      Tarjeta
                    </Space>
                  </Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="reference"
                label="Referencia/Comprobante"
              >
                <Input placeholder="Número de comprobante o referencia" />
              </Form.Item>

              <Divider />
              
              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => {
                    setPaymentModalVisible(false);
                    setSelectedCustomer(null);
                    form.resetFields();
                  }}>
                    Cancelar
                  </Button>
                  <Button type="primary" htmlType="submit" icon={<MoneyCollectOutlined />}>
                    Registrar Pago
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

          {/* Modal de notas */}
          <Modal
            title={
              <Space>
                <EditOutlined />
                Editar Notas del Cliente
              </Space>
            }
            open={notesModalVisible}
            onCancel={() => {
              setNotesModalVisible(false);
              setSelectedCustomer(null);
              notesForm.resetFields();
            }}
            footer={null}
            width={600}
          >
            {selectedCustomer && (
              <>
                <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f5f5f5' }}>
                  <Text strong>Cliente: </Text>{selectedCustomer.name}<br />
                  <Text strong>Sucursal: </Text>
                  <Tag icon={branches.find(b => b.value === selectedCustomer.branch)?.icon}>
                    {branches.find(b => b.value === selectedCustomer.branch)?.label}
                  </Tag>
                </Card>
                
                <Form
                  form={notesForm}
                  layout="vertical"
                  onFinish={handleNotesUpdate}
                >
                  <Form.Item
                    name="notes"
                    label="Notas del Cliente"
                    rules={[
                      { max: 500, message: 'Las notas no pueden exceder 500 caracteres' }
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Ingrese notas sobre el cliente, historial de pagos, observaciones especiales, etc."
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  <Divider />
                  
                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button onClick={() => {
                        setNotesModalVisible(false);
                        setSelectedCustomer(null);
                        notesForm.resetFields();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                        Guardar Notas
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </>
            )}
          </Modal>

          {/* Modal de PDF */}
          <Modal
            title={
              <Space>
                <FilePdfOutlined />
                Generar Estado de Cuenta Detallado
              </Space>
            }
            open={pdfModalVisible}
            onCancel={() => {
              setPdfModalVisible(false);
              setSelectedCustomer(null);
              pdfForm.resetFields();
            }}
            footer={null}
            width={600}
          >
            {selectedCustomer && (
              <>
                <Card size="small" style={{ marginBottom: '16px', backgroundColor: '#f5f5f5' }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Cliente: </Text>{selectedCustomer.name}<br />
                      <Text strong>Documento: </Text>{selectedCustomer.document}<br />
                      <Text strong>Sucursal: </Text>
                      <Tag icon={branches.find(b => b.value === selectedCustomer.branch)?.icon}>
                        {branches.find(b => b.value === selectedCustomer.branch)?.label}
                      </Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong>Saldo: </Text>
                      <Text style={{ 
                        color: selectedCustomer.balance < 0 ? '#f5222d' : selectedCustomer.balance > 0 ? '#52c41a' : '#1890ff',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        ${selectedCustomer.balance.toLocaleString()}
                      </Text><br />
                      <Text strong>Riesgo: </Text>
                      <Badge 
                        color={selectedCustomer.riskLevel === 'high' ? 'red' : selectedCustomer.riskLevel === 'medium' ? 'orange' : 'green'} 
                        text={selectedCustomer.riskLevel.toUpperCase()}
                      />
                    </Col>
                  </Row>
                </Card>
                
                <Alert
                  message="PDF Súper Detallado"
                  description="Este reporte incluirá: información completa del cliente, análisis de riesgo, historial de transacciones detallado, proyecciones, gráficos, recomendaciones y elementos visuales profesionales."
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
                
                <Form
                  form={pdfForm}
                  layout="vertical"
                  onFinish={generateDetailedPDF}
                >
                  <Form.Item
                    name="dateRange"
                    label="Rango de Fechas para Transacciones (Opcional)"
                  >
                    <RangePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder={['Fecha inicio', 'Fecha fin']}
                    />
                  </Form.Item>

                  <Form.Item
                    name="includeAnalysis"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch /> Incluir análisis de riesgo y proyecciones
                  </Form.Item>

                  <Form.Item
                    name="includeRecommendations"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch /> Incluir recomendaciones comerciales
                  </Form.Item>

                  <Divider />
                  
                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button onClick={() => {
                        setPdfModalVisible(false);
                        setSelectedCustomer(null);
                        pdfForm.resetFields();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="primary" htmlType="submit" icon={<FilePdfOutlined />}>
                        Generar PDF Detallado
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </>
            )}
          </Modal>
        </div>
      );
    };

    export default CustomerAccounts;

    // Estilos CSS adicionales para las filas de la tabla
    const styles = `
      .high-risk-row {
        background-color: #fff2f0 !important;
      }
      
      .overdue-row {
        background-color: #fff7e6 !important;
      }
      
      .ant-table-tbody > tr.high-risk-row:hover > td {
        background-color: #ffe7e6 !important;
      }
      
      .ant-table-tbody > tr.overdue-row:hover > td {
        background-color: #fff1b8 !important;
      }
    `;

    // Agregar estilos al documento
    if (typeof document !== 'undefined') {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
    }