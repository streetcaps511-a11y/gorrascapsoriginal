/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import '../../styles/CustomPagination.css';

/**
 * Shared Pagination Component
 * High-end Minimalist Black & Gold Aesthetic
 * BEM-style design system
 */
const CustomPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  showingStart, 
  endIndex, 
  itemsName = 'ítems' 
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="pagination">
       <span>Mostrando {showingStart}–{endIndex} de {totalItems} {itemsName}</span>
      
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ‹ Anterior
        </button>

        <span className="pagination-info">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="pagination-btn"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
