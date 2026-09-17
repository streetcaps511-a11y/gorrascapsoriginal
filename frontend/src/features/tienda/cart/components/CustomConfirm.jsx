/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import '../styles/CustomConfirm.css';
import React from 'react';
import { FaTimes } from 'react-icons/fa';

// ✨ COMPONENTES DE ALERTA
const CustomConfirm = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  productName,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  icon
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease'
        }}
        onClick={onCancel}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#060b15',
        border: '1px solid rgba(255, 193, 7, 0.25)',
        borderRadius: '22px',
        padding: '32px 32px 28px 32px',
        maxWidth: '560px',
        width: '92%',
        minHeight: '300px',
        zIndex: 9999,
        boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
        animation: 'slideUp 0.4s ease'
      }}>
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#FFC107',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <FaTimes />
        </button>
        
        {icon && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '18px',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            marginLeft: 'auto',
            marginRight: 'auto',
            background: 'rgba(255, 193, 7, 0.12)',
            color: '#FFC107'
          }}>
            {React.createElement(icon, { size: 36 })}
          </div>
        )}

        <h3 style={{
          color: '#FFC107',
          margin: '0 0 16px 0',
          fontSize: '1.45rem',
          fontWeight: 'bold',
          textAlign: 'center',
          paddingRight: '20px'
        }}>
          {title}
        </h3>
        
        <p style={{
          color: '#E2E8F0',
          marginBottom: '10px',
          fontSize: '1rem',
          lineHeight: '1.8',
          textAlign: 'center',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {message}
        </p>

        {productName && (
          <div style={{
            margin: '15px 0 20px 0',
            textAlign: 'center'
          }}>
            <span style={{
              color: '#FFC107',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              display: 'inline',
              padding: '4px 8px',
              backgroundColor: 'rgba(255, 193, 7, 0.08)',
              borderRadius: '4px'
            }}>
              {productName}
            </span>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 5px',
              backgroundColor: 'transparent',
              border: '1px solid #666',
              borderRadius: '8px',
              color: '#CBD5E1',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
              minHeight: '40px'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#FFC107';
              e.target.style.color = '#FFC107';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#666';
              e.target.style.color = '#CBD5E1';
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 5px',
              backgroundColor: type === "warning" ? '#FFC107' : '#ff4d4d',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
              minHeight: '40px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = type === "warning" ? '#FFD700' : '#ff6b6b';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = type === "warning" ? '#FFC107' : '#ff4d4d';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      
    </>
  );
};

export default CustomConfirm;
