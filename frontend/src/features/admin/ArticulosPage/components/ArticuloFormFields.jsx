import React from 'react';

export const ArticuloFormFields = ({
  modalMode,
  formData,
  errors = {},
  handleInputChange,
  selectedArticulo = null
}) => {
  const isReadOnly = modalMode === 'view';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
      {/* CAMPO: NOMBRE DEL ARTÍCULO */}
      <div className="form-field">
        <label className={`form-field__label ${isReadOnly ? 'readonly-field' : 'form-field__label--required'}`}>
          Nombre del Artículo:
        </label>
        {isReadOnly ? (
          <div className="form-field__readonly form-field__readonly--nombre">
            {selectedArticulo?.nombre || formData.nombre || '-'}
          </div>
        ) : (
          <input
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            className={`form-field__input ${errors.nombre ? 'form-field__input--error' : ''}`}
            placeholder="Ingrese el nombre del artículo..."
            maxLength={50}
            autoFocus={modalMode === 'create'}
          />
        )}
        {errors.nombre && !isReadOnly && (
          <div className="form-field__error form-field__error--visible">
            {errors.nombre}
          </div>
        )}
      </div>

      {/* CAMPO: CANTIDAD / STOCK */}
      <div className="form-field">
        <label className={`form-field__label ${isReadOnly ? 'readonly-field' : ''}`}>
          Cantidad / Stock:
        </label>
        {isReadOnly ? (
          <div className="form-field__readonly">
            {selectedArticulo?.cantidad ?? formData.cantidad ?? 0} uds
          </div>
        ) : (
          <input
            name="cantidad"
            type="number"
            min="0"
            value={formData.cantidad}
            onChange={(e) => handleInputChange('cantidad', e.target.value)}
            className={`form-field__input ${errors.cantidad ? 'form-field__input--error' : ''}`}
            placeholder="0"
          />
        )}
        {errors.cantidad && !isReadOnly && (
          <div className="form-field__error form-field__error--visible">
            {errors.cantidad}
          </div>
        )}
      </div>

      {/* CAMPO: ESTADO EN MODO VISTA */}
      {isReadOnly && (
        <div className="form-field">
          <label className="form-field__label readonly-field">
            Estado:
          </label>
          <div className="form-field__readonly">
            {selectedArticulo?.isActive ? 'Activo' : 'Inactivo'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticuloFormFields;
