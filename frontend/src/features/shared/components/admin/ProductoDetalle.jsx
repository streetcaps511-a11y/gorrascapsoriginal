/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../../styles/ProductoDetalle.css';
// ProductoDetalle.jsx
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
    if (producto.stock > 0) return 'stock-low';
    return 'stock-out';
  };

  return (
    <div className="producto-detalle-container">
      {/* Título */}
      <h1 className="producto-detalle-title">
        {producto.nombre}
      </h1>

      {/* Categoría */}
      <div className="producto-detalle-category">
        Categoría: {producto.categoria}
      </div>

      {/* Carrusel de Imágenes */}
      <div className="carousel-container">
        {/* Botones de navegación */}
        <button
          onClick={anteriorImagen}
          className="carousel-btn prev"
        >
          &lt;
        </button>

        <button
          onClick={siguienteImagen}
          className="carousel-btn next"
        >
          &gt;
        </button>

        {/* Imagen actual */}
        <img
          src={producto.imagenes[imagenActual]}
          alt={`${producto.nombre} - Imagen ${imagenActual + 1}`}
          className="carousel-image"
        />

        {/* Indicadores de puntos */}
        <div className="carousel-indicators">
          {producto.imagenes.map((_, index) => (
            <div
              key={index}
              onClick={() => setImagenActual(index)}
              className={`indicator-dot ${index === imagenActual ? 'active' : 'inactive'}`}
            />
          ))}
        </div>
      </div>

      {/* Colores disponibles */}
      {producto.colores && producto.colores.length > 0 && (
        <div className="colors-section">
          <span className="colors-label-detail">Colores:</span>
          {producto.colores.map((color, index) => (
            <span
              key={index}
              className="color-option"
              style={{ background: color }}
              title={`Color ${index + 1}`}
              onClick={() => console.log(`Seleccionado color: ${color}`)}
            ></span>
          ))}
        </div>
      )}

      {/* Precios */}
      <div className="prices-section">
        <div className="price-current">
          ${producto.precio.toLocaleString()}
        </div>
        <div className="price-original">
          ${producto.originalPrice.toLocaleString()}
        </div>
        {producto.tags && producto.tags.some(tag => tag.startsWith('-')) && (
          <div className="discount-tag">
            {producto.tags.find(tag => tag.startsWith('-'))} de descuento
          </div>
        )}
      </div>

      {/* Botón Agregar al Carrito */}
      <button className="btn-add-to-cart">
        🛒 Agregar al Carrito
      </button>

      {/* Stock */}
      <div className={`stock-info ${getStockClass()}`}>
        {producto.stock > 0
          ? `${producto.stock} unidades disponibles`
          : 'Producto agotado'}
      </div>
    </div>
  );
};

export default ProductoDetalle;
