/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import '../styles/OfertasHero.css';

const OfertasHero = () => {
  return (
    <div className="gm-hero">
      <div className="gm-hero-bg" />
      <div className="gm-hero-fade-top" />
      <div className="gm-hero-fade-bottom" />
      <div className="gm-hero-inner">
        <h1 className="gm-hero-title">Explora Nuestras Ofertas</h1>
      </div>
    </div>
  );
};

export default OfertasHero;
