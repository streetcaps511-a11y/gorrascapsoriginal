import React from 'react';

const ConfirmCloseModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar cierre",
  message = "Tienes cambios sin guardar. ¿Deseas descartar los cambios y cerrar?",
  confirmText = "Descartar",
  cancelText = "Cancelar",
  loading = false,
  variant = "warning" // warning | info | save
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (variant === 'warning') return '⚠️';
    if (variant === 'save') return '💾';
    return 'ℹ️';
  };

  const getConfirmColor = () => {
    if (variant === 'warning') return '#ef4444';
    if (variant === 'save') return '#F5C81B';
    return '#3b82f6';
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '24px' }}>{getIcon()}</span>
          <h3 style={{
            color: '#f1f5f9',
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            {title}
          </h3>
        </div>

        <p style={{
          color: '#94a3b8',
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '0 0 24px 0'
        }}>
          {message}
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#e2e8f0',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: getConfirmColor(),
              border: 'none',
              color: variant === 'save' ? '#0f172a' : '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ConfirmCloseModal;