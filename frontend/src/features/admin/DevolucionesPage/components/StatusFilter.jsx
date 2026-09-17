/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

const StatusFilter = React.memo(function StatusFilter({ filterStatus, onFilterSelect, statuses = [] }) {
  const [open, setOpen] = useState(false);
  const allOptions = ['Todos', ...statuses];

  return (
    <div className="devoluciones-filter-wrapper">
      <button
        onClick={() => setOpen(!open)}
        className="devoluciones-status-filter-btn"
      >
        {filterStatus}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#FFC300' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="devoluciones-filter-overlay" />
          <div className="devoluciones-filter-dropdown">
            {allOptions.map((status, idx) => {
              const label = typeof status === 'object' ? (status.nombre || status.Nombre || status.Estado || 'Estado') : status;
              const key = typeof status === 'object' ? (status.id || idx) : status;
              const isActive = filterStatus === label;
              
              return (
                <button
                  key={String(key)}
                  onClick={() => { onFilterSelect(label); setOpen(false); }}
                  className={`devoluciones-filter-option ${isActive ? 'active' : ''}`}
                >
                  {String(label)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});

export default StatusFilter;
