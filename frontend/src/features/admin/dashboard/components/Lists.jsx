/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Componente de controles de paginación interno (Versión simplificada para cabecera)
 */
const PaginationControls = ({ currentPage, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-header-controls">
      <button 
        className="pagination-arrow-button" 
        onClick={onPrev} 
        disabled={currentPage === 1}
        title="Anterior"
      >
        <FaChevronLeft size={10} />
      </button>
      <span className="pagination-info-slim">{currentPage}/{totalPages}</span>
      <button 
        className="pagination-arrow-button" 
        onClick={onNext} 
        disabled={currentPage === totalPages}
        title="Siguiente"
      >
        <FaChevronRight size={10} />
      </button>
    </div>
  );
};

/**
 * Lista de productos top (más vendidos)
 */
export const TopProductsList = ({ products = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Resetear página al cambiar los datos (filtros)
  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="chart-visual-box" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="chart-header-dark" style={{ margin: 0 }}>Productos más vendidos</h3>
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPrev={handlePrev} 
            onNext={handleNext} 
          />
        </div>
        {currentItems.length > 0 ? (
          currentItems.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="item-name">{p.nombre}</span>
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '600' }}>{p.cantidad} ventas</span>
            </div>
          ))
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No hay productos disponibles</p>
        )}
      </div>
    </div>
  );
};

/**
 * Lista de clientes frecuentes
 */
export const FrequentCustomersList = ({ customers = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Resetear página al cambiar los datos (filtros)
  useEffect(() => {
    setCurrentPage(1);
  }, [customers]);

  const totalItems = customers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (customers || []).slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="chart-visual-box" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="chart-header-dark" style={{ margin: 0 }}>Clientes recurrentes</h3>
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPrev={handlePrev} 
            onNext={handleNext} 
          />
        </div>
        {currentItems.length > 0 ? (
          currentItems.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="item-name">{c.Nombre || c.nombre || 'Sin nombre'}</span>
              <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>{c.cantidad} compras</span>
            </div>
          ))
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No hay clientes disponibles</p>
        )}
      </div>
    </div>
  );
};

export default { TopProductsList, FrequentCustomersList };
