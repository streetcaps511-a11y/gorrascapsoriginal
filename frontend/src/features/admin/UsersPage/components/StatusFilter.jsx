/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

const StatusFilter = ({ filterStatus, onFilterSelect, statuses = [] }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="status-filter-container">
      <button
        onClick={() => setOpen(!open)}
        className="status-filter-btn"
      >
        <span>{filterStatus}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`filter-arrow ${open ? 'open' : ''}`}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="filter-overlay" />
          <div className="filter-dropdown">
            {['Todos', ...statuses].map((status, index) => {
              // 🛡️ Asegurar que el label sea un string y el key sea único
              let statusLabel = 'Estado';
              let statusKey = index;

              if (typeof status === 'string') {
                statusLabel = status;
                statusKey = status;
              } else if (status && typeof status === 'object') {
                statusLabel = status.nombre || status.Nombre || status.Estado || status.estado || `Estado ${index}`;
                statusKey = status.id || status.IdEstado || index;
              }

              return (
                <button 
                  key={String(statusKey)} 
                  onClick={() => { onFilterSelect(statusLabel); setOpen(false); }}
                  className={`filter-option ${filterStatus === statusLabel ? 'active' : ''}`}
                >
                  {String(statusLabel)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusFilter;
