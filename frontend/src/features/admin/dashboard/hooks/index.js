/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

export { useDashboardFilters } from './useDashboardFilters';
export { useDashboardData } from './useDashboardData';
export { 
  parseDate, 
  formatCurrency, 
  getMonthName,
  useSalesByPeriod,
  usePurchasesByPeriod,
  useTopProducts,
  useTopCustomers
} from './useChartData';
