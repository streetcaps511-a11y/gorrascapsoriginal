import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import '../style/StatsCards.css';

const StatsCard = ({ title, value, subValue, icon: Icon }) => (
  <div className="stats-card">
    <div className="stats-card-content">
      {/* Ícono con estilo fijo */}
      <div className="stats-card-icon-wrapper">
        {Icon && <Icon className="stats-card-icon" />}
      </div>
      
      <div className="stats-card-info">
        <p className="stats-card-title">{title}</p>
        {/* Valor con color fijo */}
        <h3 className="stats-card-value">{value}</h3>
        {subValue && <p className="stats-card-subvalue">{subValue}</p>}
      </div>
    </div>
    {/* Borde de acento con color fijo */}
    <div className="stats-card-accent" />
  </div>
);

const StatsCards = ({ stats }) => {
  const caja = stats?.caja || {};

  const cards = [
    {
      title: 'Ventas Totales',
      value: new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        maximumFractionDigits: 0 
      }).format(caja?.totalVentas || 0),
      icon: FaShoppingCart,
      subValue: 'Histórico total'
    },
    {
      title: 'Ventas de Hoy',
      value: new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        maximumFractionDigits: 0 
      }).format(caja?.ventasHoy || 0),
      icon: FaShoppingCart,
      subValue: 'Ventas del día actual'
    },
    {
      title: 'Ventas del Mes',
      value: new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        maximumFractionDigits: 0 
      }).format(caja?.ventasMes || 0),
      icon: FaShoppingCart,
      subValue: 'Mes actual'
    },
    {
      title: 'Ganancias del Mes',
      value: new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP', 
        maximumFractionDigits: 0 
      }).format(caja?.balanceMes || 0),
      icon: FaShoppingCart,
      subValue: 'Utilidad neta mensual'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatsCards;