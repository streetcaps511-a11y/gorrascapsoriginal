/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  const renderDetailField = (label, value, extraClass = '') => (
    <div className="detalle-field">
      <label className="detalle-label">{label}:</label>
      <div className={`detalle-display ${extraClass}`}>
        {value || 'N/A'}
      </div>
    </div>
  );

  const getStatusClass = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  const isAdministrador = (u) => {
    const rol = (u.rol || "").toLowerCase();
    const idRol = u.idRol || u.IdRol;
    return rol === "administrador" || idRol === 1 || idRol === "1";
  };

  return (
    <div className="detalle-usuario-container">
      <div className="detalle-section-group">
        {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
        <div className="detalle-section">
          <h3 className="detalle-section-title">Información Personal</h3>
          <div className="detalle-info-grid">
            {renderDetailField('Nombre completo', user.nombre || user.nombreCompleto)}
            {renderDetailField('Email', user.email)}
            {renderDetailField('Teléfono', user.telefono || user.contacto)}
          </div>
        </div>

        {/* SECCIÓN 2: IDENTIFICACIÓN Y ROL */}
        <div className="detalle-section">
          <h3 className="detalle-section-title">Identificación y Acceso</h3>
          <div className="detalle-info-grid">
            {renderDetailField('Tipo documento', user.tipoDocumento)}
            {renderDetailField('N° documento', user.numeroDocumento)}
            {renderDetailField('Rol', user.rol, isAdministrador(user) ? 'admin' : '')}
            {renderDetailField('Estado', user.isActive ? 'Activo' : 'Inactivo', getStatusClass(user.isActive))}
          </div>
        </div>
      </div>
      
      <div className="form-actions-detalle">
        <button onClick={onClose} className="btn-detalle-close">Cerrar</button>
      </div>
    </div>
  );
};

export default UserDetailsModal;
