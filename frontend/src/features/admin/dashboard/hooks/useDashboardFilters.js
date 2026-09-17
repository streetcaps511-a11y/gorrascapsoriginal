/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState } from 'react';

/**
 * Hook para manejar los filtros del dashboard
 * @returns {Object} Estado y setters de filtros
 */
export const useDashboardFilters = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const resetFilters = () => {
    setSelectedDay("");
    setSelectedMonth("");
    setSelectedYear(currentYear);
    setSearchTerm("");
    setProductSearch("");
    setCustomerSearch("");
  };

  return {
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    searchTerm,
    setSearchTerm,
    productSearch,
    setProductSearch,
    customerSearch,
    setCustomerSearch,
    resetFilters,
  };
};
