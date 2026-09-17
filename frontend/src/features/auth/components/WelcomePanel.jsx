/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import '../styles/WelcomePanel.css';

const WelcomePanel = () => {
  return (
    <div className="auth-panel-welcome">
      <div className="welcome-inner">
        <h1 className="welcome-header">Bienvenido a <span className="highlight-yellow">GM CAPS</span></h1>
        <p className="welcome-text">Inicia sesión para gestionar tus pedidos y acceder a promociones exclusivas.</p>
        <div className="welcome-badges">
          <span className="badge-item"><div className="badge-dot" /> Estilo & Calidad</span>
          <span className="badge-item"><div className="badge-dot" /> Envíos Seguros</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomePanel;
