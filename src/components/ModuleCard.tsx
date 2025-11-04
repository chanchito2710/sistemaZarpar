import React from 'react';
import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import './ModuleCard.css';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  color: string;
  path: string;
  onClick?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon,
  gradient,
  color,
  path,
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
    }
  };

  return (
    <Card
      className="module-card"
      hoverable
      onClick={handleClick}
      style={{
        borderRadius: '12px',
        border: 'none',
        boxShadow: `0 3px 12px ${color}20`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        overflow: 'hidden',
        height: '120px'
      }}
      styles={{
        body: {
          padding: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }
      }}
    >
      <div className="module-card-content">
        <div 
          className="module-card-icon"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '22px',
            marginBottom: '10px',
            boxShadow: `0 6px 16px ${color}30`,
            transition: 'transform 0.3s ease'
          }}
        >
          {icon}
        </div>
        
        <div className="module-card-text">
          <h3 
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '2px',
              lineHeight: '1.3'
            }}
          >
            {title}
          </h3>
          <p 
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#666',
              lineHeight: '1.4'
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ModuleCard;