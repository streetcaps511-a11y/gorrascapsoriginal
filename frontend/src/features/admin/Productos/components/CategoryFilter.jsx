/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';

const CategoryFilter = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="category-filter-container">
      <button
        onClick={() => setOpen(!open)}
        className="category-filter-btn"
      >
        {value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} className="category-filter-overlay" />
          <div className="category-filter-dropdown yellow-scrollbar">
            {options.map(cat => (
              <button
                key={cat}
                onClick={() => { onChange(cat); setOpen(false); }}
                className="category-filter-option"
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryFilter;
