/* === COMPONENTE REUTILIZABLE ===
Pieza modular de interfaz (como Tarjetas, Modales o Botones).
Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */
import React, { useState, useEffect, useRef } from 'react';
import ConfirmModal from '../../../shared/components/admin/ConfirmModal';

const RenderField = ({
  label,
  fieldName,
  type = "text",
  options = [],
  required = false,
  value,
  error,
  onChange,
  isViewMode = false,
  autoFocus = false,
  disabled = false,
  onBlur = null,
  onKeyDown = null,
  availableStatuses = [],
  autoComplete = "on",
  id = null,
  placeholder = ""
}) => {
  const inputId = id || `field-${fieldName}`;

  if (isViewMode) {
    let displayValue = value || "N/A";
    if (fieldName === 'isActive') {
      displayValue = value ? (availableStatuses[0] || 'Activo') : (availableStatuses[1] || 'Inactivo');
    } else if (type === 'select') {
      const selectedOption = options.find(opt =>
        String(opt.value || opt) === String(value)
      );
      if (selectedOption) {
        displayValue = selectedOption.label || selectedOption;
      }
    }
    return (
      <div className="form-field">
        <label className="form-label readonly-field" style={{ textTransform: 'none' }}>
          {label}:
        </label>
        <div className={`form-input readonly-field disabled-field ${fieldName === 'isActive' ? (value ? 'active' : 'inactive') : ''}`}
          style={{
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            background: '#0f172a',
            border: '1px solid #1e293b'
          }}>
          {displayValue}
        </div>
      </div>
    );
  }

  if (type === "select") {
    const selectId = `field-${fieldName}-select`;
    return (
      <div className="form-field">
        <label className="form-label" style={{ textTransform: 'none' }}>
          {label}:{required && <span className="required">*</span>}
        </label>
        <div className="select-wrapper">
          <select
            id={selectId}
            autoFocus={autoFocus}
            name={fieldName}
            value={value || ""}
            onChange={onChange}
            className={`form-select ${error ? 'has-error' : ''}`}
            disabled={disabled}
          >
            <option value="" disabled hidden>Seleccionar...</option>
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="field-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="form-field">
      <label className="form-label" style={{ textTransform: 'none' }}>
        {label}:{required && <span className="required">*</span>}
      </label>
      <input
        id={inputId}
        autoFocus={autoFocus}
        type={type}
        name={fieldName}
        autoComplete={autoComplete}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`form-input ${error ? 'has-error' : ''}`}
        disabled={disabled}
        placeholder={placeholder}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

const ProveedorFormFields = ({
  modalMode,
  formData,
  handleFieldChange,
  handleBlur,
  errors,
  availableStatuses = [],
  onCancel // ← Prop para manejar el cierre
}) => {
  const isViewMode = modalMode === 'view';
  const { supplierType } = formData;
  const isJuridica = supplierType?.toLowerCase() === 'persona jurídica';

  // 🔒 Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialDataRef = useRef(JSON.stringify(formData));

  // Detectar cambios en el formulario
  useEffect(() => {
    if (modalMode !== 'view') {
      const currentData = JSON.stringify(formData);
      const changed = currentData !== initialDataRef.current;
      setHasChanges(changed);
    }
  }, [formData, modalMode]);

  // Manejar intento de cierre
  const handleTryCancel = () => {
    if (hasChanges && modalMode !== 'view') {
      setShowConfirmModal(true);
    } else {
      if (onCancel) onCancel();
    }
  };

  // Confirmar salida (pierde los cambios)
  const handleConfirmExit = () => {
    setShowConfirmModal(false);
    if (onCancel) onCancel();
  };

  // Cancelar salida (mantiene los datos)
  const handleCancelExit = () => {
    setShowConfirmModal(false);
  };

  const commonFieldProps = {
    onChange: handleFieldChange,
    onBlur: handleBlur,
    isViewMode,
    availableStatuses
  };

  return (
    <>
      <div className={`proveedor-form ${isViewMode ? 'view-mode' : ''}`}>
        <div className="form-body">
          {isJuridica ? (
            <>
              <div className="form-row">
                <div className="col">
                  <RenderField
                    {...commonFieldProps}
                    label="Tipo de persona"
                    fieldName="supplierType"
                    type="select"
                    required={true}
                    value={formData.supplierType}
                    error={errors.supplierType}
                    autoFocus={true}
                    options={["Persona jurídica", "Persona natural"]}
                  />
                </div>
                <div className="col">
                  <RenderField
                    {...commonFieldProps}
                    label="NIT"
                    fieldName="documentNumber"
                    type="text"
                    required={true}
                    value={formData.documentNumber}
                    error={errors.documentNumber}
                    autoComplete="off"
                    placeholder="Ej: 900123456-7"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="col">
                  <RenderField
                    {...commonFieldProps}
                    label="Encargado"
                    fieldName="contactName"
                    type="text"
                    required={true}
                    value={formData.contactName}
                    error={errors.contactName}
                    autoComplete="name"
                    placeholder="Ej: María González"
                  />
                </div>
                <div className="col">
                  <RenderField
                    {...commonFieldProps}
                    label="Empresa"
                    fieldName="companyName"
                    type="text"
                    required={true}
                    value={formData.companyName}
                    error={errors.companyName}
                    autoComplete="organization"
                    placeholder="Ej: Gorras SAS"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="col">
                  <RenderField
                    {...commonFieldProps}
                    label="Tipo de persona"
                    fieldName="supplierType"
                    type="select"
                    required={true}
                    value={formData.supplierType}
                    error={errors.supplierType}
                    autoFocus={true}
                    options={["Persona jurídica", "Persona natural"]}
                  />
                </div>
                <div className="col">
                  <RenderField
                    {...commonFieldProps}
                    label="Nombre completo"
                    fieldName="contactName"
                    type="text"
                    required={true}
                    value={formData.contactName}
                    error={errors.contactName}
                    autoComplete="name"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="col" style={{ flex: '0 0 45%' }}>
                  <RenderField
                    {...commonFieldProps}
                    label="Tipo documento"
                    fieldName="documentType"
                    type="select"
                    required={true}
                    value={formData.documentType}
                    error={errors.documentType}
                    options={[
                      { value: "Cédula de ciudadanía", label: "CC" },
                      { value: "Cédula de extranjería", label: "CE" },
                      { value: "Permiso especial (PEP)", label: "PEP" },
                      { value: "Permiso temporal (PPT)", label: "PPT" },
                      { value: "Pasaporte", label: "Pasaporte" }
                    ]}
                  />
                </div>
                <div className="col" style={{ flex: 1 }}>
                  <RenderField
                    {...commonFieldProps}
                    label="Documento"
                    fieldName="documentNumber"
                    type="text"
                    required={true}
                    value={formData.documentNumber}
                    error={errors.documentNumber}
                    autoComplete="off"
                    placeholder="Ej: 1234567890"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email solo */}
          <div className="form-row">
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="Email"
                fieldName="email"
                type="text"
                inputMode="email"
                required={true}
                value={formData.email}
                error={errors.email}
                autoComplete="email"
                placeholder="Ej: contacto@empresa.com"
              />
            </div>
          </div>

          {/* Teléfono + Ciudad en la misma fila */}
          <div className="form-row">
            <div className="col" style={{ flex: 1 }}>
              {isViewMode ? (
                <div className="form-field">
                  <label className="form-label readonly-field" style={{ textTransform: 'none' }}>
                    Teléfono:
                  </label>
                  <div className="form-input readonly-field disabled-field"
                    style={{
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      color: '#ffffff'
                    }}>
                    {formData.phone || 'N/A'}
                  </div>
                </div>
              ) : (
                <RenderField
                  {...commonFieldProps}
                  label="Teléfono"
                  fieldName="phone"
                  type="tel"
                  required={true}
                  value={formData.phone}
                  error={errors.phone}
                  autoComplete="tel"
                  placeholder="Ej: +57 300 123 4567"
                />
              )}
            </div>
            <div className="col" style={{ flex: 1 }}>
              <RenderField
                {...commonFieldProps}
                label="Ciudad"
                fieldName="city"
                type="text"
                required={true}
                value={formData.city}
                error={errors.city}
                placeholder="Ej: Medellín"
              />
            </div>
          </div>

          {/* Dirección sola */}
          <div className="form-row">
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="Dirección"
                fieldName="address"
                type="text"
                required={true}
                value={formData.address}
                error={errors.address}
                autoComplete="street-address"
                placeholder="Ej: Calle 10 # 20-30, Barrio Centro"
              />
            </div>
          </div>
        </div>
      </div>

      {/*  Modal de Confirmación al Cancelar */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        title="¿Desea cancelar?"
        message="Se perderán los datos del proveedor ingresados. ¿Está seguro de salir sin guardar?"
        confirmText="Sí, Salir"
        cancelText="Continuar"
        type="warning"
      />
    </>
  );
};

export default ProveedorFormFields;