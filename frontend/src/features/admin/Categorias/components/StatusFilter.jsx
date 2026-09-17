/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

const StatusFilter = ({ filterStatus, onFilterChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="status-filter">
      <button
        className="btn-secondary"
        onClick={() => setOpen(!open)}
      >
        {filterStatus}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="modal-overlay" style={{ background: 'transparent' }} onClick={() => setOpen(false)} />
          <div className="status-filter__dropdown">
            {['Todos', 'Activo', 'Inactivo'].map(status => (
              <button
                key={status}
                className={`status-filter__option ${filterStatus === status ? 'status-filter__option--active' : ''}`}
                onClick={() => { 
                  onFilterChange(status); 
                  setOpen(false); 
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatusFilter;