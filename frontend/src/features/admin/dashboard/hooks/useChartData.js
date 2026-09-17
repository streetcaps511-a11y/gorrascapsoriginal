/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useMemo } from 'react';

/**
 * Parsea fecha de forma robusta (soporta DD/MM/YYYY y ISO Strings)
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // 1. Si ya es un objeto Date
  if (dateStr instanceof Date) return dateStr;

  // 2. Intentar parseo directo (ISO Strings)
  const directDate = new Date(dateStr);
  if (!isNaN(directDate.getTime()) && dateStr.toString().includes('T')) return directDate;

  // 3. Fallback para formatos manuales con diferentes separadores (DD/MM/YYYY, DD-MM-YYYY)
  const parts = dateStr.split(/[/.-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    // Validar que el año sea razonable (ej: 2024)
    if (year > 100) {
      return new Date(year, month - 1, day);
    }
  }
  
  return directDate instanceof Date && !isNaN(directDate.getTime()) ? directDate : null;
};

/**
 * Formatea moneda en pesos colombianos
 */
export const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
};

/**
 * Obtiene nombre del mes abreviado
 */
export const getMonthName = (monthNumber) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || monthNumber;
};

/**
 * Helper para validar si una transacción pertenece al período seleccionado
 */
export const isTransactionInWindow = (t, viewMode, selectedYear, selectedMonth, selectedWeek) => {
  const d = parseDate(t.fechaOriginal || t.fecha || t.Fecha);
  if (!d) return false;

  const targetYear = selectedYear?.toString() || new Date().getFullYear().toString();
  const targetMonth = selectedMonth?.toString() || (new Date().getMonth() + 1).toString();
  const targetWeek = selectedWeek?.toString() || "1";

  if (d.getFullYear().toString() !== targetYear) return false;

  if (viewMode === 'ano') {
    return true;
  }

  // Si no es año, necesitamos validar el mes
  if ((d.getMonth() + 1).toString() !== targetMonth) return false;

  if (viewMode === 'mes') {
    return true;
  }

  // Si es semana, validamos el rango de días de la semana seleccionada
  const dayVal = d.getDate();
  let startDay = 1;
  let endDay = 7;
  if (targetWeek === "2") { startDay = 8; endDay = 14; }
  else if (targetWeek === "3") { startDay = 15; endDay = 21; }
  else if (targetWeek === "4") { startDay = 22; endDay = 28; }
  else if (targetWeek === "5") { startDay = 29; endDay = 31; }

  return dayVal >= startDay && dayVal <= endDay;
};

/**
 * Hook para calcular datos de ventas según el período seleccionado
 */
export const useSalesByPeriod = (ventas, viewMode = 'mes', selectedYear, selectedMonth = "", selectedWeek = "1") => {
  return useMemo(() => {
    const targetYear = selectedYear?.toString() || new Date().getFullYear().toString();
    const targetMonth = selectedMonth?.toString() || (new Date().getMonth() + 1).toString();
    const targetWeek = selectedWeek?.toString() || "1";

    if (viewMode === 'semana') {
      const dayMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 }; // 0=Dom, 1=Lun, ..., 6=Sab

      (ventas || []).forEach(v => {
        if (isTransactionInWindow(v, 'semana', targetYear, targetMonth, targetWeek)) {
          const d = parseDate(v.fechaOriginal || v.fecha || v.Fecha);
          const dayOfWeek = d.getDay();
          
          let monto = 0;
          const raw = v.total || v.Total || 0;
          if (typeof raw === 'number') monto = raw;
          else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;

          dayMap[dayOfWeek] = (dayMap[dayOfWeek] || 0) + monto;
        }
      });

      return [
        { label: "Lunes", total: dayMap[1] || 0 },
        { label: "Martes", total: dayMap[2] || 0 },
        { label: "Miércoles", total: dayMap[3] || 0 },
        { label: "Jueves", total: dayMap[4] || 0 },
        { label: "Viernes", total: dayMap[5] || 0 },
        { label: "Sábado", total: dayMap[6] || 0 },
        { label: "Domingo", total: dayMap[0] || 0 }
      ];

    } else if (viewMode === 'mes') {
      const weekMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      (ventas || []).forEach(v => {
        if (isTransactionInWindow(v, 'mes', targetYear, targetMonth, targetWeek)) {
          const d = parseDate(v.fechaOriginal || v.fecha || v.Fecha);
          const dayVal = d.getDate();
          let weekIndex = 1;
          if (dayVal >= 1 && dayVal <= 7) weekIndex = 1;
          else if (dayVal >= 8 && dayVal <= 14) weekIndex = 2;
          else if (dayVal >= 15 && dayVal <= 21) weekIndex = 3;
          else if (dayVal >= 22 && dayVal <= 28) weekIndex = 4;
          else if (dayVal >= 29) weekIndex = 5;

          let monto = 0;
          const raw = v.total || v.Total || 0;
          if (typeof raw === 'number') monto = raw;
          else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;

          weekMap[weekIndex] = (weekMap[weekIndex] || 0) + monto;
        }
      });

      const daysInMonth = new Date(parseInt(targetYear), parseInt(targetMonth), 0).getDate();
      const result = [
        { label: "Semana 1", total: weekMap[1] || 0 },
        { label: "Semana 2", total: weekMap[2] || 0 },
        { label: "Semana 3", total: weekMap[3] || 0 },
        { label: "Semana 4", total: weekMap[4] || 0 }
      ];

      if (daysInMonth > 28) {
        result.push({ label: "Restante", total: weekMap[5] || 0 });
      }

      return result;

    } else {
      // Año
      const monthMap = {};

      (ventas || []).forEach(v => {
        if (isTransactionInWindow(v, 'ano', targetYear, targetMonth, targetWeek)) {
          const d = parseDate(v.fechaOriginal || v.fecha || v.Fecha);
          const m = d.getMonth() + 1;

          let monto = 0;
          const raw = v.total || v.Total || 0;
          if (typeof raw === 'number') monto = raw;
          else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;

          monthMap[m] = (monthMap[m] || 0) + monto;
        }
      });

      return Array.from({ length: 12 }, (_, i) => ({
        label: getMonthName(i + 1),
        total: monthMap[i + 1] || 0
      }));
    }
  }, [ventas, viewMode, selectedYear, selectedMonth, selectedWeek]);
};

/**
 * Hook para calcular datos de compras según el período seleccionado
 */
export const usePurchasesByPeriod = (compras, viewMode = 'mes', selectedYear, selectedMonth = "", selectedWeek = "1") => {
  return useMemo(() => {
    const targetYear = selectedYear?.toString() || new Date().getFullYear().toString();
    const targetMonth = selectedMonth?.toString() || (new Date().getMonth() + 1).toString();
    const targetWeek = selectedWeek?.toString() || "1";

    if (viewMode === 'semana') {
      const dayMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 };

      (compras || []).forEach(c => {
        if (isTransactionInWindow(c, 'semana', targetYear, targetMonth, targetWeek)) {
          const d = parseDate(c.Fecha || c.fecha);
          const dayOfWeek = d.getDay();
          
          let monto = 0;
          const raw = c.total || c.Total || 0;
          if (typeof raw === 'number') monto = raw;
          else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;

          dayMap[dayOfWeek] = (dayMap[dayOfWeek] || 0) + monto;
        }
      });

      return [
        { label: "Lunes", total: dayMap[1] || 0 },
        { label: "Martes", total: dayMap[2] || 0 },
        { label: "Miércoles", total: dayMap[3] || 0 },
        { label: "Jueves", total: dayMap[4] || 0 },
        { label: "Viernes", total: dayMap[5] || 0 },
        { label: "Sábado", total: dayMap[6] || 0 },
        { label: "Domingo", total: dayMap[0] || 0 }
      ];

    } else if (viewMode === 'mes') {
      const weekMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      (compras || []).forEach(c => {
        if (isTransactionInWindow(c, 'mes', targetYear, targetMonth, targetWeek)) {
          const d = parseDate(c.Fecha || c.fecha);
          const dayVal = d.getDate();
          let weekIndex = 1;
          if (dayVal >= 1 && dayVal <= 7) weekIndex = 1;
          else if (dayVal >= 8 && dayVal <= 14) weekIndex = 2;
          else if (dayVal >= 15 && dayVal <= 21) weekIndex = 3;
          else if (dayVal >= 22 && dayVal <= 28) weekIndex = 4;
          else if (dayVal >= 29) weekIndex = 5;

          let monto = 0;
          const raw = c.total || c.Total || 0;
          if (typeof raw === 'number') monto = raw;
          else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;

          weekMap[weekIndex] = (weekMap[weekIndex] || 0) + monto;
        }
      });

      const daysInMonth = new Date(parseInt(targetYear), parseInt(targetMonth), 0).getDate();
      const result = [
        { label: "Semana 1", total: weekMap[1] || 0 },
        { label: "Semana 2", total: weekMap[2] || 0 },
        { label: "Semana 3", total: weekMap[3] || 0 },
        { label: "Semana 4", total: weekMap[4] || 0 }
      ];

      if (daysInMonth > 28) {
        result.push({ label: "Restante", total: weekMap[5] || 0 });
      }

      return result;

    } else {
      const monthMap = {};

      (compras || []).forEach(c => {
        if (isTransactionInWindow(c, 'ano', targetYear, targetMonth, targetWeek)) {
          const d = parseDate(c.Fecha || c.fecha);
          const m = d.getMonth() + 1;

          let monto = 0;
          const raw = c.total || c.Total || 0;
          if (typeof raw === 'number') monto = raw;
          else monto = parseFloat(String(raw).replace(/[^0-9.-]/g, '')) || 0;

          monthMap[m] = (monthMap[m] || 0) + monto;
        }
      });

      return Array.from({ length: 12 }, (_, i) => ({
        label: getMonthName(i + 1),
        total: monthMap[i + 1] || 0
      }));
    }
  }, [compras, viewMode, selectedYear, selectedMonth, selectedWeek]);
};

/**
 * Hook para obtener productos top filtrados por período
 */
export const useTopProducts = (ventas, productSearch, viewMode, selectedYear, selectedMonth, selectedWeek) => {
  return useMemo(() => {
    const pSales = {};
    const targetYear = selectedYear?.toString() || new Date().getFullYear().toString();
    const targetMonth = selectedMonth?.toString() || (new Date().getMonth() + 1).toString();
    const targetWeek = selectedWeek?.toString() || "1";

    (ventas || []).forEach(v => {
      if (isTransactionInWindow(v, viewMode, targetYear, targetMonth, targetWeek)) {
        const arrayDetalles = v.productos || v.detalles || v.Detalles;
        if (arrayDetalles && Array.isArray(arrayDetalles)) {
          arrayDetalles.forEach(det => {
            const nombre = det.nombre || det.producto?.nombre || det.NombreProducto || det.nombreProducto || "Producto";
            const cant = Number(det.cantidad || det.Cantidad || 1);
            if (nombre && nombre !== "Producto") {
              pSales[nombre] = (pSales[nombre] || 0) + cant;
            }
          });
        }
      }
    });

    return Object.entries(pSales)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .filter(p => p.nombre.toLowerCase().includes((productSearch || "").toLowerCase()))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 24);
  }, [ventas, productSearch, viewMode, selectedYear, selectedMonth, selectedWeek]);
};

/**
 * Hook para obtener clientes frecuentes filtrados por período
 */
export const useTopCustomers = (ventas, customerSearch, viewMode, selectedYear, selectedMonth, selectedWeek) => {
  return useMemo(() => {
    const cSales = {};
    const targetYear = selectedYear?.toString() || new Date().getFullYear().toString();
    const targetMonth = selectedMonth?.toString() || (new Date().getMonth() + 1).toString();
    const targetWeek = selectedWeek?.toString() || "1";

    (ventas || []).forEach(v => {
      if (isTransactionInWindow(v, viewMode, targetYear, targetMonth, targetWeek)) {
        const nombre = v.cliente?.nombre || v.clienteData?.nombreCompleto || v.clienteData?.Nombre || 
                       v.cliente || v.Cliente || v.usuario || v.Usuario || 
                       "Cliente Anónimo";
        
        if (nombre && typeof nombre === 'string' && nombre !== "Cliente Anónimo") {
          cSales[nombre] = (cSales[nombre] || 0) + 1;
        }
      }
    });

    return Object.entries(cSales)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .filter(c => c.nombre.toLowerCase().includes((customerSearch || "").toLowerCase()))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 24);
  }, [ventas, customerSearch, viewMode, selectedYear, selectedMonth, selectedWeek]);
};
