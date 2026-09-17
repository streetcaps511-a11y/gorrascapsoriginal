/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

const StatusFilter = ({ filterStatus, onFilterSelect, statuses = ['Activo', 'Inactivo'] }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="status-filter-container" style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="status-filter-btn"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#000000',
          border: '1px solid #FFC300',
          color: '#FFC300',
          borderRadius: '6px',
          fontSize: '13px',
          cursor: 'pointer',
          minWidth: '110px',
          justifyContent: 'space-between',
          fontWeight: '600',
          height: '36px'
        }}
        type="button"
      >
        <span>{filterStatus}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: '#000000',
            border: '1px solid #FFC300',
            borderRadius: '4px',
            padding: '4px 0',
            minWidth: '110px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(245, 200, 27, 0.2)'
          }}>
            {['Todos', ...statuses].map(status => (
              <button 
                key={status} 
                onClick={() => { onFilterSelect(status); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#FFC300',
                  fontSize: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: filterStatus === status ? '700' : '400'
                }}
                type="button"
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
