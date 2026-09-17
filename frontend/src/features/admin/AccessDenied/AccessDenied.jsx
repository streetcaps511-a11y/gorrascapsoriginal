import './AccessDenied.css';
// src/pages/admin/AccessDenied.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px',
      maxWidth: '500px',
      margin: '0 auto',
    }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '25px',
        border: '2px solid rgba(239, 68, 68, 0.3)',
      }}>
        <FaLock size={36} color="#ef4444" />
      </div>
      
      <h1 style={{
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '15px',
        letterSpacing: '0.5px',
      }}>
        Acceso Restringido
      </h1>
      
      <p style={{
        color: '#94a3b8',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '35px',
        maxWidth: '400px',
      }}>
        No tienes los permisos necesarios para acceder a esta sección.
        Si crees que esto es un error, contacta al administrador del sistema.
      </p>
      
      <div style={{ 
        display: 'flex', 
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate('/admin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#F5C81B',
            color: '#000',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            minWidth: '180px',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e0b619';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F5C81B';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <FaArrowLeft size={14} />
          Volver al Dashboard
        </button>
        
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'transparent',
            color: '#F5C81B',
            border: '1px solid #F5C81B',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            minWidth: '180px',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(245, 200, 27, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <FaHome size={14} />
          Ir al Inicio
        </button>
      </div>
      
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '8px',
        borderLeft: '3px solid #F5C81B',
        maxWidth: '400px',
      }}>
        <p style={{
          color: '#cbd5e1',
          fontSize: '13px',
          margin: '0',
          textAlign: 'left',
        }}>
          <strong>Información:</strong> Esta página aparece cuando intentas acceder a una sección para la cual no tienes los permisos necesarios. Cada rol de usuario tiene permisos específicos asignados.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;

