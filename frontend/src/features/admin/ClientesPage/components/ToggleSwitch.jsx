/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';

export const ToggleSwitch = ({ value, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!value)}
      className={`toggle-switch-container ${value ? 'active' : 'inactive'}`}
    >
      <div className="toggle-switch-thumb" />
    </div>
  );
};
