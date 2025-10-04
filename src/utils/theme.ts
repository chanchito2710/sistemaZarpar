import { ThemeConfig } from 'antd';
import { blue, green, red, orange, purple, cyan, magenta, gold } from '@ant-design/colors';

// Configuración del tema personalizado para Sistema Zarpar
export const zarparTheme: ThemeConfig = {
  token: {
    // Colores primarios
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Colores de fondo
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorBgSpotlight: '#ffffff',
    
    // Bordes y líneas
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    
    // Texto
    colorText: '#000000d9',
    colorTextSecondary: '#00000073',
    colorTextTertiary: '#00000040',
    colorTextQuaternary: '#00000026',
    
    // Tipografía
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    
    // Espaciado
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    
    // Bordes redondeados
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Sombras
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 1px 4px rgba(0, 0, 0, 0.12)',
    
    // Altura de controles
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    controlHeightXS: 24,
    
    // Línea de altura
    lineHeight: 1.5714285714285714,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    
    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    // Configuración de Button
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 16,
      fontWeight: 500,
    },
    
    // Configuración de Card
    Card: {
      borderRadius: 12,
      paddingLG: 24,
      headerBg: '#fafafa',
    },
    
    // Configuración de Menu
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 48,
      itemPaddingInline: 16,
      iconSize: 20,
      fontSize: 15,
    },
    
    // Configuración de Layout
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
      bodyBg: '#f0f2f5',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    
    // Configuración de Table
    Table: {
      borderRadius: 8,
      headerBg: '#fafafa',
      headerSplitColor: '#f0f0f0',
      rowHoverBg: '#f5f5f5',
    },
    
    // Configuración de Input
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 12,
    },
    
    // Configuración de Select
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    
    // Configuración de Modal
    Modal: {
      borderRadius: 12,
      headerBg: '#fafafa',
    },
    
    // Configuración de Drawer
    Drawer: {
      borderRadius: 0,
    },
    
    // Configuración de Notification
    Notification: {
      borderRadius: 8,
    },
    
    // Configuración de Message
    Message: {
      borderRadius: 8,
    },
  },
};

// Colores para los iconos del dashboard
export const moduleColors = {
  pos: {
    color: blue[5],
    gradient: `linear-gradient(135deg, ${blue[4]} 0%, ${blue[6]} 100%)`,
  },
  returns: {
    color: orange[5],
    gradient: `linear-gradient(135deg, ${orange[4]} 0%, ${orange[6]} 100%)`,
  },
  transfer: {
    color: purple[5],
    gradient: `linear-gradient(135deg, ${purple[4]} 0%, ${purple[6]} 100%)`,
  },
  money: {
    color: green[5],
    gradient: `linear-gradient(135deg, ${green[4]} 0%, ${green[6]} 100%)`,
  },
  inventory: {
    color: cyan[5],
    gradient: `linear-gradient(135deg, ${cyan[4]} 0%, ${cyan[6]} 100%)`,
  },
  expenses: {
    color: red[5],
    gradient: `linear-gradient(135deg, ${red[4]} 0%, ${red[6]} 100%)`,
  },
  payroll: {
    color: magenta[5],
    gradient: `linear-gradient(135deg, ${magenta[4]} 0%, ${magenta[6]} 100%)`,
  },
  sales: {
    color: gold[5],
    gradient: `linear-gradient(135deg, ${gold[4]} 0%, ${gold[6]} 100%)`,
  },
  customers: {
    color: blue[6],
    gradient: `linear-gradient(135deg, ${blue[5]} 0%, ${blue[7]} 100%)`,
  },
  products: {
    color: green[6],
    gradient: `linear-gradient(135deg, ${green[5]} 0%, ${green[7]} 100%)`,
  },
  reports: {
    color: purple[6],
    gradient: `linear-gradient(135deg, ${purple[5]} 0%, ${purple[7]} 100%)`,
  },
  settings: {
    color: '#666666',
    gradient: 'linear-gradient(135deg, #666666 0%, #999999 100%)',
  },
};

// Breakpoints para diseño responsivo
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// Utilidades para responsive design
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,
  largeDesktop: `@media (min-width: ${breakpoints.xl}px)`,
};