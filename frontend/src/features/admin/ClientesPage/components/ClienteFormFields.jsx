/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';

export const ClienteFormFields = ({ modalState, formData, handleInputChange, errors, firstInputRef }) => {
  const isReadOnly = modalState.mode === 'view';
  

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

  const renderField = (label, value) => (
    <div className="form-field">
      <label className="form-field-label">{label}:</label>
      <div className="form-field-display">
        {value || 'N/A'}
      </div>
    </div>
  );

  if (isReadOnly) {
    const cliente = modalState.cliente;
    return (
      <div className="clientes-form-grid" style={{ gap: '10px' }}>
        <div className="clientes-form-row">
          <div className="clientes-form-col">{renderField('Tipo documento', formatDocTypeLabel(cliente?.tipoDocumento))}</div>
          <div className="clientes-form-col">{renderField(cliente?.tipoDocumento === 'NIT' ? 'Número' : 'Número documento', cliente?.numeroDocumento)}</div>
        </div>
        <div>{renderField(cliente?.tipoDocumento === 'NIT' ? 'Nombre de la empresa' : 'Nombre completo', cliente?.nombreCompleto)}</div>
        <div>{renderField('Email', cliente?.email)}</div>
        <div className="clientes-form-row">
          <div className="clientes-form-col">{renderField('Ciudad', cliente?.ciudad)}</div>
          <div className="clientes-form-col">{renderField('Teléfono', cliente?.telefono)}</div>
        </div>
        <div>{renderField('Dirección', cliente?.direccion)}</div>
      </div>
    );
  }

  const renderEditableField = (label, fieldName, type = "text", options = []) => {
    const isError = errors[fieldName];
    
    if (type === 'select') {
      let fieldOptions = options;
      if (fieldName === 'documentType') {
        fieldOptions = [
          { value: 'Cédula de Ciudadanía', label: 'CC' },
          { value: 'Cédula de Extranjería', label: 'CE' },
          { value: 'Permiso Especial (PEP)', label: 'PEP' },
          { value: 'Permiso Temporal (PPT)', label: 'PPT' },
          { value: 'Pasaporte', label: 'Pasaporte' },
        ];
      }
      return (
        <div>
          <label className="form-field-label">{label}: <span style={{ color: "#ef4444" }}>*</span></label>
          <select
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field-input ${isError ? 'has-error' : ''}`}
          >
            <option value="" disabled hidden>Seleccionar...</option>
            {fieldOptions.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
          {isError && <div className="form-field-error-text">{isError}</div>}
        </div>
      );
    }
    return (
      <div>
        <label className="form-field-label">{label}: <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          ref={fieldName === 'documentNumber' ? firstInputRef : null}
          type={type}
          value={formData[fieldName] || ''}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          maxLength={fieldName === 'documentNumber' ? (formData.documentType === 'NIT' ? 10 : (formData.documentType === 'Pasaporte' ? 20 : 15)) : undefined}
          className={`form-field-input ${isError ? 'has-error' : ''}`}
        />
        {isError && <div className="form-field-error-text">{isError}</div>}
      </div>
    );
  };

  return (
    <div className="clientes-form-grid">
      <div className="clientes-form-row">
        <div className="clientes-form-col">{renderEditableField('Tipo documento', 'documentType', 'select')}</div>
        <div className="clientes-form-col">{renderEditableField(formData.documentType === 'NIT' ? 'Número' : 'N° documento', 'documentNumber', 'text')}</div>
      </div>
      <div>{renderEditableField(formData.documentType === 'NIT' ? 'Nombre de la empresa' : 'Nombre completo', 'fullName', 'text')}</div>
      <div>{renderEditableField('Email', 'email', 'text')}</div>
      <div className="clientes-form-row">
        <div className="clientes-form-col">{renderEditableField('Ciudad', 'city', 'text')}</div>
        <div className="clientes-form-col">
          <label className="form-field-label">Teléfono: <span style={{ color: "#ef4444" }}>*</span></label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: '0 0 90px' }}>
              <select
                value={formData.countryCode || '+57'}
                onChange={(e) => handleInputChange('countryCode', e.target.value)}
                className="form-field-input"
                style={{ width: '100%' }}
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
                <option value="+55">🇧🇷 +55</option>
                <option value="+593">🇪🇨 +593</option>
                <option value="+591">🇧🇴 +591</option>
                <option value="+598">🇺🇾 +598</option>
                <option value="+595">🇵🇾 +595</option>
                <option value="+506">🇨🇷 +506</option>
                <option value="+502">🇬🇹 +502</option>
                <option value="+504">🇭🇳 +504</option>
                <option value="+503">🇸🇻 +503</option>
                <option value="+505">🇳🇮 +505</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`form-field-input ${errors.phone ? 'has-error' : ''}`}
                placeholder="Número"
              />
            </div>
          </div>
          {errors.phone && <div className="form-field-error-text">{errors.phone}</div>}
        </div>
      </div>
      <div>{renderEditableField('Dirección', 'address', 'text')}</div>

    </div>
  );
};
