/* === COMPONENTE REUTILIZABLE === 
    Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
    Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const getMonthName = (monthNumber) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || monthNumber;
};

const formatDashboardValue = (v) => {
  if (v === 0) return '$0';
  if (v >= 1000000) {
    const val = v / 1000000;
    return `$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (v >= 1000) {
    const val = v / 1000;
    return `$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}k`;
  }
  return `$${v}`;
};

/**
 * Componente para mostrar gráfico de ventas
 */
export const SalesChart = ({ data = [] }) => {
  const rawData = data || [];
  const maxVal = Math.max(...rawData.map(d => d.total), 0);
  const upperLimit = maxVal > 0 ? Math.ceil(maxVal * 1.15 / 100000) * 100000 : 1000000;
  const ticks = [0, upperLimit * 0.25, upperLimit * 0.5, upperLimit * 0.75, upperLimit];
  
  return (
    <div className="chart-visual-box">
      <h3 className="chart-header-dark">Ventas Registradas</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={rawData} margin={{ top: 20, right: 10, left: 5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#ffffff', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis 
            width={50}
            tick={{ fill: '#ffffff', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={formatDashboardValue}
            domain={[0, upperLimit]}
            ticks={ticks}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#030712', border: '1px solid white' }}
            formatter={(v) => [`$${Number(v).toLocaleString('es-CO')}`, 'Total']}
          />
          <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} minPointSize={3}>
            <LabelList 
              dataKey="total" 
              position="top" 
              fill="#ffffff" 
              fontSize={9} 
              fontWeight="bold"
              formatter={(v) => v > 0 ? formatDashboardValue(v) : ''} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Componente para mostrar gráfico de compras
 */
export const PurchasesChart = ({ data = [] }) => {
  const rawData = data || [];
  const maxVal = Math.max(...rawData.map(d => d.total), 0);
  const upperLimit = maxVal > 0 ? Math.ceil(maxVal * 1.15 / 100000) * 100000 : 1000000;
  const ticks = [0, upperLimit * 0.25, upperLimit * 0.5, upperLimit * 0.75, upperLimit];
  
  return (
    <div className="chart-visual-box">
      <h3 className="chart-header-dark">Compras Registradas</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={rawData} margin={{ top: 20, right: 10, left: 5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#ffffff', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis 
            width={50}
            tick={{ fill: '#ffffff', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={formatDashboardValue}
            domain={[0, upperLimit]}
            ticks={ticks}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#030712', border: '1px solid white' }}
            formatter={(v) => [`$${Number(v).toLocaleString('es-CO')}`, 'Total']}
          />
          <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} minPointSize={3}>
            <LabelList 
              dataKey="total" 
              position="top" 
              fill="#ffffff" 
              fontSize={9} 
              fontWeight="bold"
              formatter={(v) => v > 0 ? formatDashboardValue(v) : ''} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Componente para mostrar el gráfico unificado de comparación Ventas vs Compras
 */
export const ComparisonChart = ({ salesData = [], purchasesData = [] }) => {
  const chartData = salesData.map((s, idx) => {
    const p = purchasesData[idx] || { total: 0 };
    return {
      label: s.label,
      ventas: s.total,
      compras: p.total
    };
  });

  const maxVal = Math.max(...chartData.flatMap(d => [d.ventas, d.compras]), 0);
  const upperLimit = maxVal > 0 ? Math.ceil(maxVal * 1.15 / 100000) * 100000 : 1000000;
  const ticks = [0, upperLimit * 0.25, upperLimit * 0.5, upperLimit * 0.75, upperLimit];

  return (
    <div className="chart-visual-box comparison-box">
      <h3 className="chart-header-dark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Comparativa: Ventas vs Compras</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 'normal' }}>
          <span style={{ color: '#3b82f6', marginRight: '8px' }}>● Ventas</span>
          <span style={{ color: '#10b981' }}>● Compras</span>
        </span>
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 25, right: 10, left: 5, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#ffffff', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis 
            width={50}
            tick={{ fill: '#ffffff', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={formatDashboardValue}
            domain={[0, upperLimit]}
            ticks={ticks}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '8px' }}
            formatter={(v, name) => {
              const label = name === 'ventas' ? 'Ventas' : 'Compras';
              return [`$${Number(v).toLocaleString('es-CO')}`, label];
            }}
          />
          <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={14} minPointSize={3} />
          <Bar dataKey="compras" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} minPointSize={3} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Componente del panel lateral con el resumen de métricas y ganancias
 */
export const ComparisonSummary = ({ salesData = [], purchasesData = [] }) => {
  const totalSales = salesData.reduce((acc, curr) => acc + curr.total, 0);
  const totalPurchases = purchasesData.reduce((acc, curr) => acc + curr.total, 0);
  
  const netProfit = totalSales - totalPurchases;
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
  const roi = totalPurchases > 0 ? (netProfit / totalPurchases) * 100 : 0;

  const isPositive = netProfit >= 0;

  return (
    <div className="comparison-summary-card">
      <h3 className="chart-header-dark summary-title">Resumen Comparativo</h3>
      
      <div className="metric-row-premium">
        <span className="metric-label">Ingresos Totales (Ventas)</span>
        <span className="metric-val-blue">${totalSales.toLocaleString('es-CO')}</span>
      </div>

      <div className="metric-row-premium">
        <span className="metric-label">Costos Totales (Compras)</span>
        <span className="metric-val-green">${totalPurchases.toLocaleString('es-CO')}</span>
      </div>

      <div className="metric-row-premium main-profit">
        <span className="metric-label font-bold">Ganancia Neta</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span className={`metric-val-profit ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}${netProfit.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      <div className="percentage-grid">
        <div className="percentage-card-mini">
          <span className="p-card-label">Margen de Utilidad</span>
          <span className={`p-card-val ${isPositive ? 'positive' : 'negative'}`}>
            {profitMargin.toFixed(1)}%
          </span>
        </div>
        
        <div className="percentage-card-mini">
          <span className="p-card-label">Retorno (ROI)</span>
          <span className={`p-card-val ${isPositive ? 'positive' : 'negative'}`}>
            {roi.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
