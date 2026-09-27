/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../styles/CustomConfirm.css';
import React from 'react';
import { FaTimes } from 'react-icons/fa';

// ✨ COMPONENTES DE ALERTA (Estilo armonizado con ConfirmDeleteModal de admin)
const CustomConfirm = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  productName,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="delete-modal-backdrop" 
      onClick={onCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="delete-modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0b1220',
          border: '1.5px solid #F5C81B',
          borderRadius: '16px',
          padding: '28px 24px',
          width: '90%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          margin: 'auto'
        }}
      >
        <h2 
          style={{
            color: '#F5C81B',
            fontSize: '20px',
            fontWeight: '800',
            margin: 0,
            lineHeight: '1.3',
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </h2>
        
        <div style={{ margin: 0, lineHeight: '1.6', textAlign: 'center' }}>
          <p style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '500', margin: 0, wordBreak: 'break-word' }}>
            {message}
          </p>
          {productName && (
            <p style={{ color: '#3b82f6', fontSize: '16px', fontWeight: '800', marginTop: '10px', wordBreak: 'break-word' }}>
              {productName}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginTop: '8px' }}>
          <button
            onClick={onCancel}
            type="button"
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              height: '42px',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
              backgroundColor: 'transparent',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = '#FFFFFF';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            type="button"
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              height: '42px',
              whiteSpace: 'nowrap',
              letterSpacing: '0.5px',
              backgroundColor: '#F5C81B',
              border: 'none',
              color: '#000000',
              boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD700';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 15px rgba(245, 200, 27, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#F5C81B';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 200, 27, 0.3)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirm;
