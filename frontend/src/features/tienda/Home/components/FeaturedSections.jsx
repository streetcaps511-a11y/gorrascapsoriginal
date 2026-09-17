/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../styles/FeaturedSections.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductCard from './ProductCard';

const FeaturedSections = ({ 
  sections, 
  carouselIndices, 
  handleCarouselScroll, 
  openModal 
}) => {
  if (!Array.isArray(sections)) return null;

  return (
    <div className="gm-container">
      {sections.map((section) => {
        if (!section || !section.id) return null;
        const currentIndex = (carouselIndices && carouselIndices[section.id]) || 0;
        const sectionData = Array.isArray(section.data) ? section.data : [];
        if (sectionData.length === 0) return null;
        
        const maxIndex = Math.max(0, Math.ceil(sectionData.length / 4) - 1);

        return (
          <div key={section.id} className="gm-section">
            <div className="gm-section-header">
              <h2 className="gm-section-title">{section.title || 'Sección'}</h2>
              <Link to={section.link || '/'} className="gm-pill-btn">
                <span>Ver todos</span> <FaArrowRight size={13} />
              </Link>
            </div>
            <div className="gm-carousel">
              <button
                className="gm-arrow gm-arrow-left"
                onClick={() => handleCarouselScroll && handleCarouselScroll(section.id, "left")}
                disabled={currentIndex === 0}
                aria-label="Anterior"
                type="button"
              >
                <FaChevronLeft size={16} />
              </button>
              <div className="gm-carousel-inner">
                <div
                  className="gm-track"
                  style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                  }}
                >
                  {sectionData.map((p) => (
                    <div key={p.id} className="gm-slot">
                      <ProductCard
                        product={p}
                        badge={section.tag}
                        badgeType={section.badgeType}
                        openModal={openModal}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                className="gm-arrow gm-arrow-right"
                onClick={() => handleCarouselScroll && handleCarouselScroll(section.id, "right")}
                disabled={currentIndex >= maxIndex}
                aria-label="Siguiente"
                type="button"
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        );
      })}

      <div className="gm-section">
        <div className="gm-section-header">
          <h2 className="gm-section-title">Todos los productos</h2>
          <Link to="/productos" className="gm-pill-btn">
            <span>Ver todos</span> <FaArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSections;
