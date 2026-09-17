/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

/**
 * StatusFilter - Componente para filtrar por estados dinámicos
 */
const StatusFilter = React.memo(function StatusFilter({ filterStatus, onFilterSelect, statuses = [] }) {
  const [open, setOpen] = useState(false);
  
  // Asegurar que 'Todos' esté al principio y capitalizar
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  const options = ['Todos', ...statuses.filter(s => s !== 'Todos')];

  return (
    <div className="status-filter-wrapper">
      <button
        onClick={() => setOpen(!open)}
        className="status-filter-trigger"
      >
        <span className="current-status">{capitalize(filterStatus)}</span>
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          className={`arrow-icon ${open ? 'open' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="filter-overlay-backdrop" onClick={() => setOpen(false)} />
          <div className="status-filter-dropdown">
            {options.map(status => (
              <button
                key={status}
                className={`filter-option-item ${filterStatus === status ? 'active' : ''}`}
                onClick={() => { 
                  onFilterSelect(status); 
                  setOpen(false); 
                }}
              >
                {capitalize(status)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default StatusFilter;
