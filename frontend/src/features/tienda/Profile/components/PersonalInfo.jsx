/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz (como Tarjetas, Modales o Botones).
Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */
import React from 'react';
import { FaIdCard, FaTimes } from "react-icons/fa";
import '../styles/PersonalInfo.css';

const getFormattedPhone = (phone) => {
  if (!phone) return "—";
  return String(phone).replace(/\D/g, '');
};

const cleanPhoneForInput = (value) => {
  if (!value) return '';
  const clean = String(value).replace(/\D/g, '');
  if (clean.startsWith('57') && clean.length > 10) {
    return clean.substring(2);
  }
  return clean;
};

const PersonalInfo = ({ isEditing, handleEditClick, handleSaveClick, handleChange, formData, errors = {}, setIsEditing }) => {
  const formatDocTypeLabel = (val) => {
    const map = {
      'Cédula de Ciudadanía': 'CC',
      'Cédula de Extranjería': 'CE',
      'Permiso Especial (PEP)': 'PEP',
      'Permiso Temporal (PPT)': 'PPT',
      'Pasaporte': 'Pasaporte',
      'NIT': 'NIT',
      'Tarjeta de Identidad': 'TI'
    };
    return map[val] || val;
  };

  // Función helper para limpiar campos con la X
  const handleClearField = (fieldName) => {
    handleChange({ 
      target: { 
        name: fieldName, 
        value: '' 
      } 
    });
  };

  return (
    <div className="gm-personal-info-card">
      <div className="gm-section-header">
        <div className="gm-section-title-wrapper">
          <FaIdCard color="#FFC107" size={20} />
          <h3 className="gm-section-title">Información Personal</h3>
        </div>
        {!isEditing && (
          <button onClick={handleEditClick} className="gm-edit-btn">
            Editar datos
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="gm-form-container">
          <div className="gm-form-grid">
            {/* Nombre */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Nombre Completo <span className="required">*</span>
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={`gm-form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Tu nombre completo"
                />
                {formData.name && (
                  <button
                    type="button"
                    className="gm-clear-input-btn"
                    onClick={() => handleClearField('name')}
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.name && <span className="gm-field-error">{errors.name}</span>}
            </div>

            {/* Documento (CC) */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Documento de Identidad <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', position: 'relative', width: '100%', alignItems: 'center' }}>
                <div style={{ flex: '0 0 95px' }}>
                  <select
                    name="documentType"
                    value={formData.documentType || 'Cédula de Ciudadanía'}
                    onChange={handleChange}
                    className={`gm-form-select ${errors.documentType ? 'error' : ''}`}
                    style={{ padding: '0 8px', fontSize: '0.85rem' }}
                  >
                    <option value="Cédula de Ciudadanía">CC</option>
                    <option value="Tarjeta de Identidad">TI</option>
                    <option value="Cédula de Extranjería">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Permiso Especial (PEP)">PEP</option>
                  </select>
                </div>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="documentNumber"
                    value={formData.documentNumber || ''}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 15);
                      handleChange({ target: { name: 'documentNumber', value: onlyNums } });
                    }}
                    className={`gm-form-input ${errors.documentNumber ? 'error' : ''}`}
                    placeholder="Número de documento"
                  />
                  {formData.documentNumber && (
                    <button
                      type="button"
                      className="gm-clear-input-btn"
                      onClick={() => handleClearField('documentNumber')}
                      tabIndex={-1}
                      style={{ zIndex: 10 }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              {(errors.documentNumber || errors.documentType) && (
                <span className="gm-field-error">{errors.documentNumber || errors.documentType}</span>
              )}
            </div>

            {/* Teléfono */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Teléfono <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', position: 'relative', width: '100%', alignItems: 'center' }}>
                <div style={{ flex: '0 0 95px' }}>
                  <select
                    name="countryCode"
                    value={formData.countryCode || '+57'}
                    onChange={handleChange}
                    className="gm-form-select"
                    style={{ padding: '0 8px', fontSize: '0.85rem' }}
                  >
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+52">🇲🇽 +52</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+56">🇨🇱 +56</option>
                    <option value="+51">🇵🇪 +51</option>
                    <option value="+58">🇻🇪 +58</option>
                    <option value="+507">🇵🇦 +507</option>
                  </select>
                </div>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="phone"
                    value={cleanPhoneForInput(formData.phone)}
                    onChange={handleChange}
                    className={`gm-form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="Número de celular"
                  />
                  {formData.phone && (
                    <button
                      type="button"
                      className="gm-clear-input-btn"
                      onClick={() => handleClearField('phone')}
                      tabIndex={-1}
                      style={{ zIndex: 10 }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              {errors.phone && <span className="gm-field-error">{errors.phone}</span>}
            </div>

            {/* Email (Cuenta) */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Correo Electrónico <span className="required">*</span>
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`gm-form-input ${errors.email ? 'error' : ''}`}
                  placeholder="ejemplo@correo.com"
                />
                {formData.email && (
                  <button
                    type="button"
                    className="gm-clear-input-btn"
                    onClick={() => handleClearField('email')}
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.email && <span className="gm-field-error">{errors.email}</span>}
            </div>

            {/* Ciudad */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Ciudad <span className="required">*</span>
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  className={`gm-form-input ${errors.city ? 'error' : ''}`}
                  placeholder="Tu ciudad"
                />
                {formData.city && (
                  <button
                    type="button"
                    className="gm-clear-input-btn"
                    onClick={() => handleClearField('city')}
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.city && <span className="gm-field-error">{errors.city}</span>}
            </div>

            {/* Dirección */}
            <div className="gm-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="gm-form-label">
                Dirección Completa <span className="required">*</span>
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className={`gm-form-input ${errors.address ? 'error' : ''}`}
                  placeholder="Calle, número, barrio o apartamento"
                />
                {formData.address && (
                  <button
                    type="button"
                    className="gm-clear-input-btn"
                    onClick={() => handleClearField('address')}
                    tabIndex={-1}
                    style={{ zIndex: 10 }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.address && <span className="gm-field-error">{errors.address}</span>}
            </div>
          </div>
          <div className="gm-form-actions">
            <button onClick={handleSaveClick} className="gm-save-btn">Guardar Cambios</button>
            <button onClick={() => setIsEditing(false)} className="gm-cancel-btn">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="gm-info-grid">
          <div className="gm-info-item">
            <label className="gm-info-label">Nombre completo</label>
            <div className="gm-info-value">{formData.name || "—"}</div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Documento</label>
            <div className="gm-info-value">
              {formData.documentNumber 
                ? `${formatDocTypeLabel(formData.documentType) || 'CC'} ${formData.documentNumber}` 
                : (formatDocTypeLabel(formData.documentType) || "—")}
            </div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Teléfono</label>
            <div className="gm-info-value">{getFormattedPhone(formData.phone) || "—"}</div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Correo Electrónico</label>
            <div className="gm-info-value">{formData.email || "—"}</div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Ciudad</label>
            <div className="gm-info-value">{formData.city || "—"}</div>
          </div>
          <div className="gm-info-item" style={{ gridColumn: '1 / -1' }}>
            <label className="gm-info-label">Dirección</label>
            <div className="gm-info-value">{formData.address || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;