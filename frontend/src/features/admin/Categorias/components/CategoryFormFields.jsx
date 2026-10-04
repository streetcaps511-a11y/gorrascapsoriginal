/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz para el formulario de categorías.
Extraído de Categorias.jsx para seguir el mismo patrón que UserFormFields y RoleFormFields. */

import React, { useRef } from 'react';
import { FaImage } from 'react-icons/fa';

const isValidUrl = (url) => {
  if (!url) return true;
  if (String(url).startsWith('data:image/')) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const CategoryFormFields = ({
  modalMode,
  formData,
  handleInputChange,
  errors,
  category, // datos de la categoría en modo view
}) => {
  const imgInputRef = useRef(null);
  const isReadOnly = modalMode === 'view';

  const handleImageFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange('imagenUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderField = (label, fieldName, type = 'text') => {
    const isError = isReadOnly ? false : (errors[fieldName] || false);
    const value = isReadOnly ? (category?.[fieldName] || 'N/A') : (formData[fieldName] || '');

    return (
      <div className="form-field">
        <label className={`form-field__label ${isReadOnly ? 'readonly-field' : 'form-field__label--required'}`}>
          {label}:
        </label>
        {type === 'textarea' ? (
          <textarea
            name={fieldName}
            value={value}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field__textarea ${isReadOnly ? 'readonly-field' : ''} ${isError ? 'form-field__textarea--error' : ''}`}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
          />
        ) : fieldName === 'imagenUrl' && !isReadOnly ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              name={fieldName}
              type={type}
              value={value}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`form-field__input ${isError || (value && !isValidUrl(value)) ? 'form-field__input--error' : ''}`}
              placeholder={`Ingrese ${label.toLowerCase()}...`}
              style={{ flex: 1 }}
            />
            <label
              style={{ margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFC300', opacity: 0.85, width: '34px', height: '34px', border: '1px solid #334155', borderRadius: '6px', flexShrink: 0, backgroundColor: 'transparent', transition: 'all 0.2s' }}
              title="Subir imagen desde el computador"
            >
              <FaImage size={15} />
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImageFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <input
            name={fieldName}
            type={type}
            value={value}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field__input ${isReadOnly ? 'readonly-field' : ''} ${fieldName === 'imagenUrl' ? 'form-field__input--sm' : ''} ${isError || (fieldName === 'imagenUrl' && value && !isValidUrl(value)) ? 'form-field__input--error' : ''}`}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
          />
        )}

        {fieldName === 'imagenUrl' && value && value !== 'N/A' && !isValidUrl(value) && !isReadOnly && (
          <div className="form-field__error form-field__error--visible">
            <span className="form-field__error-icon">●</span> URL inválida
          </div>
        )}

        {fieldName === 'imagenUrl' && value && value !== 'N/A' && (
          <div className="image-preview" style={{ marginTop: '15px', height: '180px', display: 'flex', justifyContent: 'center', backgroundColor: '#0f172a', borderRadius: '8px', padding: '10px', border: '1px solid #1e293b' }}>
            <img src={value} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
          </div>
        )}

        {!isReadOnly && (
          <div className={`form-field__error ${isError ? 'form-field__error--visible' : ''}`}>
            {isError && (
              <>
                <span className="form-field__error-icon">●</span>
                {isError}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-content__body">
      {renderField('Nombre', 'nombre')}
      {renderField('Descripción', 'descripcion', 'textarea')}
      {renderField('URL de Imagen', 'imagenUrl')}
    </div>
  );
};

export default CategoryFormFields;
