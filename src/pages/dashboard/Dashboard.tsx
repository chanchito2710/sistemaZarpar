import React from 'react';
import { Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import ModuleCard from '../../components/ModuleCard';
import { moduleInfo } from '../../utils/menuItems';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  // Configuración del grid de módulos (4x4 = 16 módulos)
  const dashboardModules = [
    // Fila 1
    [
      moduleInfo.pos,
      moduleInfo.returns,
      moduleInfo.transfer,
      moduleInfo.money,
    ],
    // Fila 2
    [
      moduleInfo.inventory,
      moduleInfo.expenses,
      moduleInfo.payroll,
      moduleInfo.inventoryLog,
    ],
    // Fila 3
    [
      moduleInfo.sales,
      moduleInfo.accounts,
      moduleInfo.banks,
      moduleInfo.cash,
    ],
    // Fila 4
    [
      moduleInfo.products,
      moduleInfo.customers,
      moduleInfo.sellers,
      moduleInfo.priceList,
    ],
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Header del Dashboard */}
      <div style={{ marginBottom: '16px' }}>
        <Title level={2} style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '22px' }}>
          Bienvenido al Sistema Zarpar
        </Title>
        <Text style={{ fontSize: '13px', color: '#6b7280' }}>
          Gestiona tu negocio de manera integral desde un solo lugar
        </Text>
      </div>

      {/* Grid de módulos */}
      <div style={{ marginBottom: '16px' }}>
        <Title level={3} style={{ margin: '0 0 12px 0', color: '#1f2937', fontSize: '18px' }}>
          Módulos del Sistema
        </Title>
        
        <Row gutter={[12, 12]} style={{ marginBottom: '12px' }}>
          {dashboardModules.map((row, rowIndex) => (
            row.map((module, colIndex) => (
              module ? (
                <Col 
                  xs={12} 
                  sm={12} 
                  md={6} 
                  lg={6} 
                  xl={6}
                  key={`${rowIndex}-${colIndex}`}
                >
                  <ModuleCard
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    gradient={module.gradient}
                    color={module.color}
                    path={module.path}
                    onClick={() => handleModuleClick(module.path)}
                  />
                </Col>
              ) : (
                <Col 
                  xs={0} 
                  sm={0} 
                  md={6} 
                  lg={6} 
                  xl={6}
                  key={`empty-${rowIndex}-${colIndex}`}
                >
                </Col>
              )
            ))
          )).flat()}
        </Row>
      </div>

    </div>
  );
};

export default Dashboard;