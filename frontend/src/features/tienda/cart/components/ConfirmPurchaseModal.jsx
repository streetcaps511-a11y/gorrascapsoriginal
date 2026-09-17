/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaTimes } from 'react-icons/fa';

// ✨ MODAL DE CONFIRMACIÓN DE COMPRA
const ConfirmPurchaseModal = ({
  isOpen,
  onConfirm,
  onCancel,
  total,
  subtotal,
  tax,
  itemCount,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '15px'
    }}>
      <div style={{
        background: '#0f172a',
        color: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #FFC107',
        padding: '25px',
        position: 'relative'
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
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 193, 7, 0.1)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaTimes />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            fontSize: '40px',
            color: '#FFC107',
            marginBottom: '10px'
          }}>
            🛒
          </div>
          <h3 style={{
            color: '#FFC107',
            margin: '0 0 10px 0',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Confirmar Compra
          </h3>
          <p style={{
            color: '#CBD5E1',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '5px'
          }}>
            ¿Deseas finalizar la compra por un total de:
          </p>
          <div style={{
            color: '#FFC107',
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '15px 0'
          }}>
            ${total.toLocaleString()}
          </div>
          <p style={{
            color: '#94a3b8',
            fontSize: '12px',
            fontStyle: 'italic'
          }}>
            Se generará una factura con los detalles de tu compra
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 193, 7, 0.05)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Productos:</span>
            <span>{itemCount} items</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>IVA (19%):</span>
            <span>${tax.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px', borderTop: '1px solid rgba(255, 193, 7, 0.2)' }}>
            <strong>Total:</strong>
            <strong>${total.toLocaleString()}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid #666',
              borderRadius: '6px',
              color: '#CBD5E1',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
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
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#FFC107',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              opacity: isProcessing ? 0.7 : 1
            }}
            onMouseOver={(e) => !isProcessing && (e.target.style.backgroundColor = '#FFD700')}
            onMouseOut={(e) => !isProcessing && (e.target.style.backgroundColor = '#FFC107')}
          >
            {isProcessing ? 'Procesando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPurchaseModal;
