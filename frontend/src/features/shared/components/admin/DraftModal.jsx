/* === COMPONENTE REUTILIZABLE ===
   Modal General de Recuperación de Borradores en Panel Admin.
   Permite al usuario restaurar datos no guardados o empezar un registro desde cero. */

import React, { useEffect } from 'react';
import '../../styles/DraftModal.css';
import { FaHistory, FaTimes, FaUndo, FaTrashAlt } from 'react-icons/fa';

const DraftModal = ({
  isOpen,
  onClose,
  onRestore,
  onDiscard,
  entityName = 'registro',
  title = '¿Deseas continuar con el borrador?',
  customMessage,
  timestamp,
  extraInfo,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  const formattedTime = formatTimestamp(timestamp);

  const defaultMessage = `Tienes información guardada de un registro anterior de ${entityName} que no fue completado. ¿Deseas recuperar los datos para continuar donde lo dejaste o empezar desde cero?`;

  return (
    <div className="draft-modal-backdrop" onClick={onClose}>
      <div className="draft-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="draft-modal-close-btn"
          onClick={onClose}
          type="button"
          title="Cerrar ventana"
        >
          <FaTimes size={16} />
        </button>

        <div className="draft-modal-header">
          <div className="draft-modal-icon-badge">
            <FaHistory />
          </div>
          <div className="draft-modal-title-group">
            <h2 className="draft-modal-title">{title}</h2>
            <p className="draft-modal-subtitle">Borrador pendiente detectado</p>
          </div>
        </div>

        <div className="draft-modal-body">
          <p className="draft-modal-message">
            {customMessage || defaultMessage}
          </p>

          {(formattedTime || extraInfo) && (
            <div className="draft-modal-meta-box">
              {formattedTime && (
                <div className="draft-modal-meta-row">
                  <span>Última modificación:</span>
                  <span className="draft-modal-meta-value">{formattedTime}</span>
                </div>
              )}
              {extraInfo && (
                <div className="draft-modal-meta-row">
                  <span>Detalle:</span>
                  <span className="draft-modal-meta-value">{extraInfo}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="draft-modal-actions">
          <button
            type="button"
            className="draft-modal-btn draft-modal-btn-discard"
            onClick={onDiscard}
          >
            <FaTrashAlt size={13} />
            Empezar desde cero
          </button>

          <button
            type="button"
            className="draft-modal-btn draft-modal-btn-restore"
            onClick={onRestore}
          >
            <FaUndo size={13} />
            Restaurar borrador
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftModal;
