/* === PÁGINA PRINCIPAL ===
Este componente es la interfaz visual principal de la ruta.
Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */
import '../style/AdminDashboard.css';
import React, { useCallback, useState, useEffect } from "react";
import { FaSyncAlt } from "react-icons/fa";

// Hooks
import {
  useDashboardData,
  useSalesByPeriod,
  usePurchasesByPeriod,
  useTopProducts,
  useTopCustomers,
  getMonthName
} from '../hooks';

// Componentes
import { 
  SalesChart, 
  PurchasesChart, 
  ComparisonChart,
  ComparisonSummary,
  TopProductsList, 
  FrequentCustomersList
} from '../components';

/**
Página principal del dashboard del admin
Conectada a API, con filtros de fecha que persisten al navegar
*/
const AdminDashboard = () => {
  // Filtros que persisten usando sessionStorage
  const [viewMode, setViewMode] = useState(() => sessionStorage.getItem('dashboard_viewMode') || "mes");
  const [selectedWeek, setSelectedWeek] = useState(() => sessionStorage.getItem('dashboard_week') || "1");
  const [selectedMonth, setSelectedMonth] = useState(() => sessionStorage.getItem('dashboard_month') || (new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(() => sessionStorage.getItem('dashboard_year') || new Date().getFullYear().toString());
  const [comparar, setComparar] = useState(() => sessionStorage.getItem('dashboard_comparar') === 'true');

  // Guardar filtros en sessionStorage cuando cambien
  useEffect(() => {
    sessionStorage.setItem('dashboard_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    sessionStorage.setItem('dashboard_week', selectedWeek);
  }, [selectedWeek]);

  useEffect(() => {
    sessionStorage.setItem('dashboard_month', selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    sessionStorage.setItem('dashboard_year', selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    sessionStorage.setItem('dashboard_comparar', comparar.toString());
  }, [comparar]);

  // Datos del dashboard desde API
  const { ventas, compras, stats: _stats, refresh } = useDashboardData();

  // Datos procesados para gráficos (con filtros de período)
  const salesData = useSalesByPeriod(ventas, viewMode, selectedYear, selectedMonth, selectedWeek);
  const purchasesData = usePurchasesByPeriod(compras, viewMode, selectedYear, selectedMonth, selectedWeek);

  // Listas calculadas dinámicamente (con filtros de período)
  const topProducts = useTopProducts(ventas, "", viewMode, selectedYear, selectedMonth, selectedWeek);
  const frequentCustomers = useTopCustomers(ventas, "", viewMode, selectedYear, selectedMonth, selectedWeek);

  // Handler para botón de refresh
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="dashboard-container">
      
      {/* HEADER CON FILTROS */}
      <div className="header-top">
        <h1 className="dashboard-label">Panel de Dashboard</h1>
        
        <div className="filters-row">
          {/* View Mode Toggle Buttons */}
          <div className="view-mode-toggles">
            <button 
              className={`view-mode-btn ${viewMode === 'semana' ? 'active' : ''}`}
              onClick={() => setViewMode('semana')}
            >
              Semana
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'mes' ? 'active' : ''}`}
              onClick={() => setViewMode('mes')}
            >
              Mes
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'ano' ? 'active' : ''}`}
              onClick={() => setViewMode('ano')}
            >
              Año
            </button>
          </div>

          {/* Selector de Semana condicional */}
          {viewMode === 'semana' && (
            <select
              className="slim-input"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              title="Seleccionar semana"
            >
              <option value="1">Semana 1 (Días 1-7)</option>
              <option value="2">Semana 2 (Días 8-14)</option>
              <option value="3">Semana 3 (Días 15-21)</option>
              <option value="4">Semana 4 (Días 22-28)</option>
              <option value="5">Semana 5 (Restante)</option>
            </select>
          )}

          {/* Selector de Mes condicional */}
          {(viewMode === 'semana' || viewMode === 'mes') && (
            <select
              className="slim-input slim-input-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              title="Seleccionar mes"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          )}

          {/* Selector de Año */}
          <input
            type="number"
            className="slim-input slim-input-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Año"
            title="Filtrar por año"
          />

          {/* Botón de Comparar */}
          <button 
            className={`compare-toggle-btn ${comparar ? 'active' : ''}`} 
            onClick={() => setComparar(!comparar)}
            title="Comparar Ventas vs Compras"
          >
            Comparar
          </button>

          {/* Botón de actualizar */}
          <button className="reset-button" onClick={handleRefresh} title="Actualizar datos">
            <FaSyncAlt size={12} />
          </button>
        </div>
      </div>

      {/* SECCIÓN DE GRÁFICOS */}
      <div className="dashboard-content-row">
        {comparar ? (
          <>
            <ComparisonChart salesData={salesData} purchasesData={purchasesData} />
            <ComparisonSummary salesData={salesData} purchasesData={purchasesData} />
          </>
        ) : (
          <>
            <SalesChart data={salesData} />
            <PurchasesChart data={purchasesData} />
          </>
        )}
      </div>

      {/* SECCIÓN DE LISTAS */}
      <div className="dashboard-content-row">
        <TopProductsList products={topProducts} />
        <FrequentCustomersList customers={frequentCustomers} />
      </div>

    </div>
  );
};

export default AdminDashboard;