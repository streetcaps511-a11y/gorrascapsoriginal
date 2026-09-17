/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../styles/CategoryCard.css';
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category, imgUrl }) => {
  const isCamiseta = category.Nombre?.toLowerCase() === "camisetas";
  
  return (
    <Link
      to={`/categorias/${encodeURIComponent(category.Nombre)}`}
      className={`categoria-card ${isCamiseta ? "camisetas-card" : ""}`}
    >
      {imgUrl && (
        <img
          src={imgUrl}
          alt={category.Nombre}
          className="categoria-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="categoria-name-container">
        <div className="categoria-name-content">
          <h3 className="categoria-name">{category.Nombre}</h3>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
