/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';

const SearchInput = ({ 
  value = "", 
  onChange = () => {}, 
  placeholder = "Buscar...", 
  onClear = () => {},
  fullWidth = true,
  style = {},
  inputStyle = {}
}) => {
  return (
    <div style={{ 
      position: 'relative', 
      width: fullWidth ? '100%' : '400px',
      flexShrink: 0,
      flex: fullWidth ? 1 : 'none',
      ...style 
    }}>
      <input
        type="text"
        name="proveedores_search_filter"
        autoComplete="new-password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px 8px 36px',
          backgroundColor: '#0b1220',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          outline: 'none',
          transition: 'all 0.2s ease',
          paddingRight: value ? '32px' : '12px',
          cursor: 'text',
          height: '36px',
          boxSizing: 'border-box',
          ...inputStyle
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#F5C81B';
          e.target.style.backgroundColor = '#111827';
          e.target.style.boxShadow = '0 0 0 2px rgba(245, 200, 27, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#F5C81B';
          e.target.style.backgroundColor = '#0b1220';
          e.target.style.boxShadow = 'none';
        }}
      />
      
      {/* Ícono de búsqueda */}
      <div style={{
        position: 'absolute', 
        left: '12px',
        top: '50%', 
        transform: 'translateY(-50%)', 
        color: '#F5C81B',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      
      {/* Botón de limpiar */}
      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute', 
            right: '6px',
            top: '50%', 
            transform: 'translateY(-50%)',
            background: 'none', 
            border: 'none', 
            color: '#F5C81B', 
            cursor: 'pointer', 
            padding: '3px',
            borderRadius: '3px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'all 0.2s ease', 
            width: '18px',
            height: '18px'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.color = '#fff'; 
            e.currentTarget.style.backgroundColor = '#F5C81B'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.color = '#F5C81B'; 
            e.currentTarget.style.backgroundColor = 'transparent'; 
          }}
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
