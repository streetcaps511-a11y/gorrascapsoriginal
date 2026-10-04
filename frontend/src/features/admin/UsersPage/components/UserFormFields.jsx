import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';

const UserFormFields = ({
  editingUser,
  formData,
  handleInputChange,
  errors,
  isAdministrador,
  availableRoles = [],
  isReadOnly = false,
  users = []
}) => {
  const isEditingAdmin = editingUser && isAdministrador(editingUser);

  const renderField = (label, fieldName, type = 'text', options = []) => {
    const isError = errors[fieldName];
    const value = formData[fieldName] || '';
    const isSelectField = ['tipoDocumento', 'rol'].includes(fieldName);

    // Campo de Rol para Administrador (solo lectura)
    if (isSelectField && fieldName === 'rol' && isEditingAdmin) {
      return (
        <div className="form-field">
          <label className="form-label">{label}: <span className="required">*</span></label>
          <div className="admin-badge-field">
            <FaShieldAlt size={14} />
            Administrador (sistema)
          </div>
          <input type="hidden" name="rol" value="1" />
          <div className="field-error" style={{ height: '10px' }}></div>
        </div>
      );
    }

    // Opciones para selects
    let fieldOptions = options;
    if (isSelectField && fieldName === 'rol') {
      const hasAdmin = (users || []).some(u => isAdministrador(u) && u.id !== editingUser?.id);
      fieldOptions = availableRoles
        .filter(r => {
          const isAdminRole = (r.id === 1 || r.id === "1" || (r.name || r.Nombre || "").toLowerCase() === 'administrador');
          if (isAdminRole) {
            if (hasAdmin) return false;
            return editingUser && isAdministrador(editingUser);
          }
          return true;
        })
        .map(r => ({
          value: r.id,
          label: (r.name || r.Nombre || "").charAt(0).toUpperCase() + (r.name || r.Nombre || "").slice(1).toLowerCase()
        }));
    }

    // Campo de solo lectura
    if (isReadOnly) {
      if (isSelectField) {
        const selectedOption = fieldOptions.find(option => String(option.value) === String(value));
        const displayValue = selectedOption ? selectedOption.label : value || 'N/A';
        return (
          <div className="form-field">
            <label className="form-label readonly-field">{label}:</label>
            <div className="form-field__readonly">{displayValue}</div>
          </div>
        );
      }
      return (
        <div className="form-field">
          <label className="form-label readonly-field">{label}:</label>
          <div className="form-field__readonly">{value || 'N/A'}</div>
        </div>
      );
    }

    // ✅ CAMPO DE TELÉFONO CON MÁSCARA +57 PEQUEÑA Y FORMATO AUTOMÁTICO
    if (fieldName === 'contacto') {
      // Formatear número con espacios: 3XX XXX XXXX
      const formatPhone = (num) => {
        const clean = num.replace(/\D/g, '').slice(0, 10);
        if (clean.length <= 3) return clean;
        if (clean.length <= 6) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
        return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
      };

      const formattedValue = formatPhone(value);

      return (
        <div className="form-field">
          <label className={`form-label ${isError ? 'label-error' : ''}`}>
            {label}: <span className="required">*</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              padding: '0 6px',
              height: '30px',
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
            }}>
              +57
            </div>
            <input
              type="text"
              name={fieldName}
              value={formattedValue}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                handleInputChange(fieldName, raw);
              }}
              placeholder="3XX XXX XXXX"
              className={`form-input ${isError ? 'has-error' : ''}`}
              style={{
                borderRadius: '0 6px 6px 0',
                borderLeft: '1px solid #334155',
                flex: 1,
              }}
            />
          </div>
          <div className="field-error">{isError}</div>
        </div>
      );
    }

    // ✅ CAMPO EDITABLE NORMAL (input o select)
    return (
      <div className="form-field">
        <label className={`form-label ${isReadOnly ? 'readonly-field' : ''} ${isError ? 'label-error' : ''}`}>
          {label}:{!isReadOnly && <span className="required">*</span>}
        </label>
        {isSelectField ? (
          <select
            name={fieldName}
            disabled={isReadOnly || (fieldName === 'rol' && isEditingAdmin)}
            value={fieldName === 'rol' && isEditingAdmin ? (value || '1') : value}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-select ${isError ? 'has-error' : ''} ${(isReadOnly || (fieldName === 'rol' && isEditingAdmin)) ? 'disabled-field' : ''} ${isReadOnly ? 'readonly-field' : ''}`}
          >
            <option value="" disabled hidden>Seleccionar...</option>
            {fieldOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={fieldName}
            value={value}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            onChange={(e) => {
              if (isReadOnly) return;
              let val = e.target.value;
              if (fieldName === 'numeroDocumento') {
                val = val.replace(/[^0-9]/g, '').slice(0, 15);
              }
              handleInputChange(fieldName, val);
            }}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
            className={`form-input ${isError ? 'has-error' : ''} ${isReadOnly ? 'disabled-field readonly-field' : ''}`}
          />
        )}
        <div className="field-error">{isError}</div>
      </div>
    );
  };

  return (
    <div className="user-form">
      <div className="form-body">
        {/* Fila 1: Tipo documento | N° documento */}
        <div className="form-row">
          <div className="col">
            {renderField('Tipo documento', 'tipoDocumento', 'select', [
              { value: 'Cédula de Ciudadanía', label: 'CC' },
              { value: 'Cédula de Extranjería', label: 'CE' },
              { value: 'Permiso Especial (PEP)', label: 'PEP' },
              { value: 'Permiso Temporal (PPT)', label: 'PPT' },
              { value: 'Pasaporte', label: 'Pasaporte' }
            ])}
          </div>
          <div className="col">
            {renderField('N° documento', 'numeroDocumento', 'text')}
          </div>
        </div>

        {/* Fila 2: Nombre completo | Email en paralelo */}
        <div className="form-row">
          <div className="col">
            {renderField('Nombre completo', 'nombreCompleto', 'text')}
          </div>
          <div className="col">
            {renderField('Email', 'email', 'text')}
          </div>
        </div>

        {/* Fila 4: Teléfono | Rol */}
        <div className="form-row">
          <div className="col">
            {renderField('Teléfono', 'contacto', 'text')}
          </div>
          <div className="col">
            {renderField('Rol', 'rol', 'select')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormFields;