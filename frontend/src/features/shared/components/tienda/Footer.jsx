/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/Footer.css';
// src/components/Footer.jsx
import React from 'react';
import { 
  FaInstagram, 
  FaWhatsapp, 
  FaFacebook,
  FaTiktok,
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaChevronRight 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className="shop-footer">
      <div className="footer-container">
        
        {/* Columna 1: Logo e Info */}
        <div className="footer-column">
          <div style={{ marginBottom: '10px' }}>
            <Link to="/">
              <img 
                src="/logo.png" 
                style={{ height: '45px', maxWidth: '150px', objectFit: 'contain' }} 
                alt="Logo GM CAPS" 
              />
            </Link>
          </div>
          <p className="footer-text">
            Tu tienda de confianza para las mejores gorras. Calidad y estilo en cada producto.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="footer-column">
          <h4 className="footer-title">Enlaces Rápidos</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/quienes-somos" className="footer-link">
              <FaChevronRight size={10} color="#FFC107" /> Quiénes Somos
            </Link>
            <Link to="/politicas-envio" className="footer-link">
              <FaChevronRight size={10} color="#FFC107" /> Políticas de Envío
            </Link>
            <Link to="/politica-devoluciones" className="footer-link">
              <FaChevronRight size={10} color="#FFC107" /> Políticas de Cambios y Devoluciones
            </Link>
          </div>
        </div>

        {/* Columna 3: Contacto */}
        <div className="footer-column">
          <h4 className="footer-title">Contacto</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="footer-contact-item">
              <FaMapMarkerAlt color="#FFC107" size={16} />
              <span>Alfonzo López - Medellin</span>
            </div>
            <div className="footer-contact-item">
              <FaPhoneAlt color="#FFC107" size={14} />
              <span>+57 300 6158180</span>
            </div>
            <div className="footer-contact-item">
              <FaEnvelope color="#FFC107" size={14} />
              <a href="mailto:duvann1991@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                duvann1991@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Columna 4: Síguenos */}
        <div className="footer-column">
          <h4 className="footer-title">Síguenos</h4>
          <div className="footer-social-list">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon-box facebook"
            >
              <FaFacebook size={18} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon-box instagram"
            >
              <FaInstagram size={18} />
            </a>
            <a 
              href="https://tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon-box tiktok"
            >
              <FaTiktok size={18} />
            </a>
            <a 
              href="https://wa.me/573006158180" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon-box whatsapp"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
          <p className="footer-text" style={{ fontSize: '0.85rem' }}>
            Contáctanos para consultas y pedidos especiales
          </p>
        </div>

      </div>

      {/* Línea Divisoria Inferior */}
      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 GM CAPS. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
