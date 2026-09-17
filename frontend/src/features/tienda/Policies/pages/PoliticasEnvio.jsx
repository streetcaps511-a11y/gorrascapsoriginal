/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React, { useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaBoxOpen, FaTruck } from 'react-icons/fa';
import '../styles/Policies.css';

const PoliticasEnvio = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-container">
      <div className="policy-content-wrapper">
        <div className="policy-header">
          <h1 className="policy-title">Políticas de Envío 📦</h1>
          <p className="policy-subtitle">Información importante sobre tu pedido</p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaMapMarkerAlt className="policy-card-icon" />
            <h3 className="policy-card-title">Cobertura Nacional</h3>
          </div>
          <p className="policy-card-text">
            Realizamos envíos a nivel nacional en todo el territorio de <strong>Colombia</strong>.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaClock className="policy-card-icon" />
            <h3 className="policy-card-title">Tiempos de Entrega</h3>
          </div>
          <p className="policy-card-text">
            El tiempo estimado de entrega oscila entre <strong>2 y 5 días hábiles</strong>, dependiendo de la ciudad de destino.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaBoxOpen className="policy-card-icon" />
            <h3 className="policy-card-title">Procesamiento de Pedidos</h3>
          </div>
          <p className="policy-card-text">
            Procesamos todos los pedidos en un plazo máximo de <strong>24 horas</strong> después de confirmar el pago correspondiente.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <FaTruck className="policy-card-icon" />
            <h3 className="policy-card-title">Transportadoras Confiables</h3>
          </div>
          <p className="policy-card-text">
            Trabajamos con las transportadoras más fiables del país para garantizar que tu producto llegue en <strong>perfecto estado</strong>.
          </p>
        </div>

        <p className="policy-bottom-text">
          El costo de envío es variable y se calcula automáticamente al momento de realizar la compra.
        </p>
      </div>
    </div>
  );
};

export default PoliticasEnvio;
