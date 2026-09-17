import React from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const AdminWelcome = () => {
  const { user } = useAuth();
  
  const nombre = user?.nombre || user?.Nombre || 'Usuario';
  const rol = user?.rol || user?.rolData?.nombre || 'Administrador';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 193, 7, 0.15)',
        borderRadius: '24px',
        padding: '40px 60px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        maxWidth: '560px',
        width: '100%',
        animation: 'fadeInUp 0.6s ease-out'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(255, 193, 7, 0.1)',
          marginBottom: '24px',
          border: '2px dashed #FFC107',
          animation: 'pulseWelcome 2s infinite'
        }}>
          <FaUserCircle size={52} color="#FFC107" />
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: '900',
          margin: '0 0 12px',
          background: 'linear-gradient(135deg, #FFF 0%, #FFC107 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          ¡Bienvenido, {nombre}!
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#94a3b8',
          margin: '0 0 24px',
          lineHeight: '1.5'
        }}>
          Has ingresado al panel de administración con el rol de <span style={{
            color: '#FFC107',
            fontWeight: '700',
            backgroundColor: 'rgba(255, 193, 7, 0.12)',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '15px'
          }}>{rol}</span>.
        </p>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: '0',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '20px',
          lineHeight: '1.6'
        }}>
          Por favor, selecciona cualquiera de los módulos disponibles en el menú lateral izquierdo para comenzar a gestionar el sistema.
        </p>
      </div>
      
      {/* Estilos inline para animaciones fluidas */}
      <style>{`
        @keyframes pulseWelcome {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.2); }
          50% { transform: scale(1.04); box-shadow: 0 0 20px 10px rgba(255, 193, 7, 0.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminWelcome;
