// src/features/shared/components/admin/ConfirmModal.jsx
import React from 'react';
import '../../styles/ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Desea cancelar?',
  message = 'Se perderán los datos ingresados. ¿Está seguro de salir?',
  confirmText = 'Sí, Salir',
  cancelText = 'Continuar',
  type = 'warning' // 'warning' | 'danger' | 'info'
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="custom-modal-overlay" onClick={handleOverlayClick}>
      <div className={`custom-modal-content ${type}`}>
        <div className="custom-modal-body">
          <h3 className="custom-modal-title">{title}</h3>
          <p className="custom-modal-message">{message}</p>
        </div>
        <div className="custom-modal-footer">
          <button className="btn-custom-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-custom-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;