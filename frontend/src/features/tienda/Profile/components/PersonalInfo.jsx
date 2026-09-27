/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz (como Tarjetas, Modales o Botones).
Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */
import React from 'react';
import { FaIdCard, FaTimes } from "react-icons/fa";
import '../styles/PersonalInfo.css';

// Placeholders dinámicos por código de país
const PHONE_PLACEHOLDERS = {
  '+57':  'Ej: 300 123 4567',
  '+1':   'Ej: 415 123 4567',
  '+34':  'Ej: 612 345 678',
  '+52':  'Ej: 55 1234 5678',
  '+54':  'Ej: 11 2345 6789',
  '+56':  'Ej: 9 1234 5678',
  '+51':  'Ej: 987 654 321',
  '+58':  'Ej: 414 123 4567',
  '+507': 'Ej: 6123 4567',
};

const PHONE_MAX_LENGTH = {
  '+57': 10, '+1': 10, '+34': 9, '+52': 10,
  '+54': 10, '+56': 9, '+51': 9, '+58': 10, '+507': 8,
};

// Función para formatear el teléfono según el país
const formatPhoneByCountry = (phone, countryCode) => {
  if (!phone) return '';
  
  // Limpiar solo números
  const clean = String(phone).replace(/\D/g, '');
  const code = (countryCode || '+57').replace('+', '');
  
  // Remover el código de país si está al inicio
  let number = clean;
  if (clean.startsWith(code)) {
    number = clean.substring(code.length);
  }
  
  // Aplicar formato según el país
  switch (countryCode) {
    case '+57': // Colombia: 300 123 4567
      if (number.length <= 3) return number;
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 10)}`;
      
    case '+52': // México: 55 1234 5678
      if (number.length <= 2) return number;
      if (number.length <= 6) return `${number.slice(0, 2)} ${number.slice(2)}`;
      return `${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6, 10)}`;
      
    case '+54': // Argentina: 11 2345 6789
      if (number.length <= 2) return number;
      if (number.length <= 6) return `${number.slice(0, 2)} ${number.slice(2)}`;
      return `${number.slice(0, 2)} ${number.slice(2, 6)} ${number.slice(6, 10)}`;
      
    case '+56': // Chile: 9 1234 5678
      if (number.length <= 1) return number;
      if (number.length <= 5) return `${number.slice(0, 1)} ${number.slice(1)}`;
      return `${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5, 9)}`;
      
    case '+34': // España: 612 345 678
      if (number.length <= 3) return number;
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 9)}`;
      
    case '+51': // Perú: 987 654 321
      if (number.length <= 3) return number;
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 9)}`;
      
    case '+58': // Venezuela: 414 123 4567
      if (number.length <= 3) return number;
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 10)}`;
      
    case '+1': // USA/Canadá: 415 123 4567
      if (number.length <= 3) return number;
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`;
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 10)}`;
      
    case '+507': // Panamá: 6123 4567
      if (number.length <= 4) return number;
      return `${number.slice(0, 4)} ${number.slice(4, 8)}`;
      
    default:
      return number;
  }
};

// Función para obtener solo números (para guardar en formData)
const getCleanPhone = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
};

const GENERO_LABELS = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  no_binario: 'No binario',
  prefiero_no_decir: 'Prefiero no decirlo',
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

  const handleClearField = (fieldName) => {
    handleChange({ target: { name: fieldName, value: '' } });
  };

  // Manejar cambio de teléfono con formato
  const handlePhoneChange = (e, countryCode) => {
    const inputValue = e.target.value;
    // Guardar solo números en formData
    const cleanNumber = getCleanPhone(inputValue);
    handleChange({ target: { name: 'phone', value: cleanNumber } });
  };

  // Manejar cambio de código de país
  const handleCountryCodeChange = (e) => {
    const newCode = e.target.value;
    handleChange({ target: { name: 'countryCode', value: newCode } });
  };

  const currentCode = formData.countryCode || '+57';
  const phonePlaceholder = PHONE_PLACEHOLDERS[currentCode] || 'Número de celular';
  const formattedPhone = formatPhoneByCountry(formData.phone, currentCode);

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
                  placeholder="Nombre y apellido"
                />
                {formData.name && (
                  <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('name')} tabIndex={-1}>
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.name && <span className="gm-field-error">{errors.name}</span>}
            </div>

            {/* Documento */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Documento de Identidad <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                <div style={{ flex: '0 0 90px' }}>
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
                    <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('documentNumber')} tabIndex={-1}>
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              {(errors.documentNumber || errors.documentType) && (
                <span className="gm-field-error">{errors.documentNumber || errors.documentType}</span>
              )}
            </div>

            {/* Teléfono con formato por país */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Teléfono <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                <div style={{ flex: '0 0 110px' }}>
                  <select
                    name="countryCode"
                    value={currentCode}
                    onChange={handleCountryCodeChange}
                    className="gm-form-select"
                    style={{ padding: '0 6px', fontSize: '0.82rem' }}
                  >
                    <option value="+57">🇨🇴 +57</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+52">🇽 +52</option>
                    <option value="+54">🇦🇷 +54</option>
                    <option value="+56">🇨 +56</option>
                    <option value="+51">🇵🇪 +51</option>
                    <option value="+58">🇻🇪 +58</option>
                    <option value="+507">🇵🇦 +507</option>
                  </select>
                </div>
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="phone"
                    value={formattedPhone}
                    onChange={(e) => handlePhoneChange(e, currentCode)}
                    className={`gm-form-input ${errors.phone ? 'error' : ''}`}
                    placeholder={phonePlaceholder}
                    maxLength={15}
                    inputMode="numeric"
                  />
                  {formData.phone && (
                    <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('phone')} tabIndex={-1}>
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
              {errors.phone && <span className="gm-field-error">{errors.phone}</span>}
            </div>

            {/* Correo */}
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
                  <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('email')} tabIndex={-1}>
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.email && <span className="gm-field-error">{errors.email}</span>}
            </div>

            {/* Género */}
            <div className="gm-form-group">
              <label className="gm-form-label">Género</label>
              <select
                name="genero"
                value={formData.genero || ''}
                onChange={handleChange}
                className="gm-form-select"
                style={{ width: '100%' }}
              >
                <option value="">Sin especificar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="no_binario">No binario</option>
                <option value="prefiero_no_decir">Prefiero no decirlo</option>
              </select>
            </div>

            {/* Fecha de nacimiento */}
            <div className="gm-form-group">
              <label className="gm-form-label">Fecha de Nacimiento</label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento || ''}
                  onChange={handleChange}
                  className="gm-form-input"
                  max={new Date().toISOString().split('T')[0]}
                  style={{ colorScheme: 'dark' }}
                />
                {formData.fechaNacimiento && (
                  <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('fechaNacimiento')} tabIndex={-1}>
                    <FaTimes />
                  </button>
                )}
              </div>
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
                  placeholder="Ej: Medellín"
                />
                {formData.city && (
                  <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('city')} tabIndex={-1}>
                    <FaTimes />
                  </button>
                )}
              </div>
              {errors.city && <span className="gm-field-error">{errors.city}</span>}
            </div>

            {/* Dirección */}
            <div className="gm-form-group">
              <label className="gm-form-label">
                Dirección <span className="required">*</span>
              </label>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className={`gm-form-input ${errors.address ? 'error' : ''}`}
                  placeholder="Calle, número, barrio, apto"
                />
                {formData.address && (
                  <button type="button" className="gm-clear-input-btn" onClick={() => handleClearField('address')} tabIndex={-1}>
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
            <div className="gm-info-value">
              {formData.phone ? `${currentCode} ${formatPhoneByCountry(formData.phone, currentCode)}` : "—"}
            </div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Correo Electrónico</label>
            <div className="gm-info-value">{formData.email || "—"}</div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Género</label>
            <div className="gm-info-value">{GENERO_LABELS[formData.genero] || "—"}</div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Fecha de Nacimiento</label>
            <div className="gm-info-value">
              {formData.fechaNacimiento
                ? new Date(formData.fechaNacimiento + 'T12:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
                : "—"}
            </div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Ciudad</label>
            <div className="gm-info-value">{formData.city || "—"}</div>
          </div>
          <div className="gm-info-item">
            <label className="gm-info-label">Dirección</label>
            <div className="gm-info-value">{formData.address || "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;