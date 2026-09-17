/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../styles/HomeHero.css';
import React from 'react';

const HomeHero = () => {
  return (
    <section className="gm-hero">
      <div className="gm-hero-bg" />
      <div className="gm-hero-fade-top" />
      <div className="gm-hero-fade-bottom" />
      <div className="gm-hero-inner">
        <h1 className="gm-hero-title">Gorras Medellín</h1>
        <p className="gm-hero-sub">
          Estilo premium a tu alcance.
        </p>
      </div>
    </section>
  );
};

export default HomeHero;
