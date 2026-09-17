/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/DateRangeFilter.css';
import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const DateRangeFilter = ({
  selectedMonth,
  selectedYear,
  handleMonthChange,
  handleYearChange,
  isCompact = false,
}) => {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 5; y <= currentYear + 1; y++) {
    years.push(y);
  }

  return (
    <div className="date-range-filter-container">
      <FaCalendarAlt color="#F5C81B" size={14} />

      <select
        value={selectedMonth}
        onChange={(e) => handleMonthChange(Number(e.target.value))}
        className={`date-range-filter-select ${isCompact ? 'compact' : 'normal'}`}
      >
        {months.map((m, i) => (
          <option key={i} value={i + 1}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        className={`date-range-filter-select ${isCompact ? 'compact' : 'normal'}`}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateRangeFilter;
