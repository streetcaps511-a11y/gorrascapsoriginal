/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React, { useEffect } from 'react';
import '../styles/Policies.css';

const QuienesSomos = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-container">
      <div className="policy-content-wrapper">
        <div className="policy-header">
          <h1 className="policy-title">Quiénes Somos</h1>
          <p className="policy-subtitle">Conoce la historia de Gorras Medellín Caps</p>
        </div>

        <p className="policy-intro-text">
          <strong>Gorras Medellín Caps</strong> es una empresa dedicada a la comercialización de gorras de alta calidad, nacida en el corazón de Medellín. Nuestra pasión por el estilo y los accesorios nos ha llevado a consolidarnos como una marca reconocida en el sector.
        </p>

        <div className="policy-timeline">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <h3 className="timeline-year">2019</h3>
            <p className="timeline-text">
              Fundación de la empresa con el objetivo de ofrecer al público una amplia variedad de modelos de gorras, priorizando siempre la calidad y el diseño.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <h3 className="timeline-year">2020</h3>
            <p className="timeline-text">
              Debido a los retos de la pandemia, nos transformamos. Optamos por operar exclusivamente de manera virtual a través de <strong>WhatsApp</strong>, gestionando todas nuestras ventas desde bodega para seguir llegando a nuestros clientes.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <h3 className="timeline-year">2021</h3>
            <p className="timeline-text">
              Con la reactivación económica, dimos un gran paso: abrimos nuestro <strong>primer punto físico</strong> en el barrio Alfonso López de Medellín. Esto nos permitió fortalecer la relación con nuestra comunidad y generar una mayor confianza.
            </p>
          </div>

          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <h3 className="timeline-year">2022</h3>
            <p className="timeline-text">
              Alcanzamos la formalización legal mediante nuestro registro en la <strong>Cámara de Comercio</strong>, consolidándonos como una marca seria y comprometida con el mercado local.
            </p>
          </div>
        </div>

        <p className="policy-footer-italic">
          Hoy, ubicados en la <strong>Calle 91a #67a-111, Medellín</strong>, seguimos trabajando para brindarte la mejor experiencia y los mejores productos.
        </p>
      </div>
    </div>
  );
};

export default QuienesSomos;
