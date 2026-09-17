/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/ProductoDetalleTienda.css';
import React, { useState } from 'react';

const ProductoDetalle = ({ producto }) => {
  const [imagenActual, setImagenActual] = useState(0);

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % producto.imagenes.length);
  };

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + producto.imagenes.length) % producto.imagenes.length);
  };

  const getStockClass = () => {
    if (producto.stock > 10) return 'stock-high';
    if (producto.stock > 0) return 'stock-medium';
    return 'stock-low';
  };

  return (
    <div className="product-detail-container">
      {/* Título */}
      <h1 className="product-detail-title">
        {producto.nombre}
      </h1>

      {/* Categoría */}
      <div className="product-detail-category-wrapper">
        <div className="product-detail-category">
          Categoría: {producto.categoria}
        </div>
      </div>

      {/* Carrusel de Imágenes */}
      <div className="image-carousel">
        {/* Botones de navegación */}
        <button
          onClick={anteriorImagen}
          className="carousel-btn carousel-btn-prev"
          aria-label="Anterior"
        >
          &lt;
        </button>

        <button
          onClick={siguienteImagen}
          className="carousel-btn carousel-btn-next"
          aria-label="Siguiente"
        >
          &gt;
        </button>

        {/* Imagen actual */}
        <img
          src={producto.imagenes[imagenActual]}
          alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
          className="carousel-img"
        />

        {/* Indicadores de puntos */}
        <div className="carousel-indicators">
          {producto.imagenes.map((_, index) => (
            <div
              key={index}
              onClick={() => setImagenActual(index)}
              className={`indicator-dot ${index === imagenActual ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Colores disponibles */}
      {producto.colores && producto.colores.length > 0 && (
        <div className="detail-colors-section">
          <span className="detail-colors-label">Colores:</span>
          {producto.colores.map((color, index) => (
            <span
              key={index}
              className="detail-color-dot"
              style={{ background: color }}
              title={`Color ${index + 1}`}
              onClick={() => console.log(`Seleccionado color: ${color}`)}
            ></span>
          ))}
        </div>
      )}

      {/* Precios */}
      <div className="detail-pricing-section">
        <div className="detail-price-main">
          ${producto.precio.toLocaleString()}
        </div>
        <div className="detail-price-original">
          ${producto.originalPrice.toLocaleString()}
        </div>
        {producto.tags && producto.tags.some(tag => tag.startsWith('-')) && (
          <div className="detail-discount-tag">
            {producto.tags.find(tag => tag.startsWith('-'))} de descuento
          </div>
        )}
      </div>

      {/* Botón Agregar al Carrito */}
      <button className="detail-add-btn">
        🛒 Agregar al Carrito
      </button>

      {/* Stock */}
      <div className={`detail-stock-info ${getStockClass()}`}>
        {producto.stock > 0
          ? `${producto.stock} unidades disponibles`
          : 'Producto agotado'}
      </div>
    </div>
  );
};

export default ProductoDetalle;
