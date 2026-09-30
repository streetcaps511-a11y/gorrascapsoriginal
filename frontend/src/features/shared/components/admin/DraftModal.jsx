/* === COMPONENTE REUTILIZABLE ===
   Modal General de Recuperación de Borradores en Panel Admin.
   Pequeño modal que pregunta si continuar con el borrador o comenzar nuevo. */

import React, { useEffect } from 'react';
import '../../styles/DraftModal.css';
import { FaHistory, FaTimes } from 'react-icons/fa';

const DraftModal = ({
  isOpen,
  onClose,
  onRestore,
  onDiscard,
  entityName = 'registro',
  customMessage,
  timestamp,
  extraInfo,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
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
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return null; }
  };

  const formattedTime = formatTimestamp(timestamp);

  return (
    <div className="draft-modal-backdrop" onClick={onClose}>
      <div className="draft-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="draft-modal-close-btn" onClick={onClose} type="button">
          <FaTimes size={13} />
        </button>

        <div className="draft-modal-header">
          <FaHistory size={13} />
          <span>Borrador guardado</span>
        </div>

        <p className="draft-modal-message">
          {customMessage || `Tienes un ${entityName} sin completar.`}
          {(formattedTime || extraInfo) && (
            <span className="draft-modal-meta">
              {formattedTime && ` · ${formattedTime}`}
              {extraInfo && ` · ${extraInfo}`}
            </span>
          )}
        </p>

        <div className="draft-modal-actions">
          <button type="button" className="draft-modal-btn draft-modal-btn-discard" onClick={onDiscard}>
            Comenzar nuevo
          </button>
          <button type="button" className="draft-modal-btn draft-modal-btn-restore" onClick={onRestore}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftModal;
