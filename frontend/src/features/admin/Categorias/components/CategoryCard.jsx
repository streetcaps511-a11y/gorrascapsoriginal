/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const CategoryCard = ({ 
  category, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const isActive = category.isActive;
  const finalImageUrl = category.imagenUrl || null;

  return (
    <div className="category-card">
      <div className="category-card__image" style={{ 
        backgroundImage: finalImageUrl ? `url(${finalImageUrl})` : 'none',
        backgroundColor: '#111'
      }}>
        {!finalImageUrl && (
          <div className="category-card__image-placeholder">
            <span className="category-card__image-placeholder-text">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="category-card__content">
        <div className="category-card__header">
          <h3 className="category-card__title">
            {category.nombre}
          </h3>
          <button
            onClick={onToggleStatus}
            className={`status-toggle ${!isActive ? 'status-toggle--inactive' : ''}`}
            title={isActive ? 'Click para desactivar' : 'Click para activar'}
          >
            <div className={`status-toggle__knob ${isActive ? 'status-toggle__knob--active' : ''}`} />
          </button>
        </div>

        <p className="category-card__description">
          {category.descripcion}
        </p>

        <div className="category-card__actions">
          <button
            onClick={onView}
            className="btn-action btn-action--view"
            title="Ver Detalles"
          >
            <FaEye size={14} />
          </button>

          <button
            onClick={onEdit}
            className="btn-action btn-action--edit"
            title="Editar"
          >
            <FaEdit size={14} />
          </button>

          <button
            onClick={onDelete}
            className="btn-action btn-action--delete"
            title="Eliminar"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;