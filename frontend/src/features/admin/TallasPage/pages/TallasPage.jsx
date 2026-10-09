import React from 'react';

const TallasPage = () => {
  return (
    <div style={{ padding: '24px 32px', color: '#fff', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#FFC107', margin: 0, letterSpacing: '0.5px' }}>
          Tallas
        </h1>
      </div>
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px dashed rgba(255, 193, 7, 0.25)',
        borderRadius: '12px',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <p style={{ fontSize: '16px', margin: 0, fontWeight: '600' }}>Módulo de Tallas</p>
      </div>
    </div>
  );
};

export default TallasPage;
