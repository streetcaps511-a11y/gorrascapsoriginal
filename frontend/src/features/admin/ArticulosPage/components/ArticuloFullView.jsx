import React from 'react';
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaBox,
  FaTag,
  FaInfoCircle,
  FaSave,
  FaEdit
} from 'react-icons/fa';

export const ArticuloFullView = ({
  mode = 'create', // 'create' | 'edit' | 'view'
  formData,
  errors = {},
  availableProducts = [],
  handleInputChange,
  handleSelectProduct,
  agregarCampo,
  actualizarCampo,
  eliminarCampo,
  onBack,
  onSave,
  onEditMode,
  saving = false
}) => {
  const isView = mode === 'view';

  // Sugerencias rápidas de campos para agilizar la creación
  const presets = [
    'Color',
    'Material',
    'Broche',
    'Visera',
    'Estilo / Corte',
    'Edición',
    'Talla'
  ];

  // ✅ CORRECCIÓN: Protegemos el .find() por si availableProducts no es array
  const safeProducts = Array.isArray(availableProducts) ? availableProducts : [];
  const selectedProduct = safeProducts.find(
    (p) => String(p.id || p.IdProducto) === String(formData.idProducto)
  );

  return (
    <div className="articulos-fullview">
      {/* ── BARRA SUPERIOR DE ACCIONES Y TÍTULO ── */}
      <div className="articulos-fullview__header">
        <div className="articulos-fullview__header-left">
          <button
            type="button"
            onClick={onBack}
            className="articulos-fullview__btn-back"
            title="Volver al listado"
          >
            <FaArrowLeft size={12} />
            <span>Volver a Artículos</span>
          </button>
          <div className="articulos-fullview__title-group">
            <h1>
              {mode === 'create'
                ? 'Registrar Nuevo Artículo'
                : mode === 'edit'
                ? `Editar Artículo: ${formData.nombre || '#' + formData.id}`
                : `Detalle del Artículo: ${formData.nombre || '#' + formData.id}`}
            </h1>
            <p>
              {mode === 'create'
                ? 'Vincula un producto del catálogo/compras y define sus especificaciones únicas'
                : mode === 'edit'
                ? 'Modifica los atributos, estado o campos personalizados del artículo'
                : 'Consulta la configuración y variantes activas de este artículo'}
            </p>
          </div>
        </div>

        <div className="articulos-fullview__header-actions">
          {isView ? (
            <>
              {onEditMode && (
                <button
                  type="button"
                  onClick={onEditMode}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FaEdit size={12} />
                  <span>Editar Artículo</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSave}
                className="btn-primary"
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FaSave size={13} />
                <span>{saving ? 'Guardando...' : mode === 'create' ? 'Guardar Artículo' : 'Guardar Cambios'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 1: VINCULAR PRODUCTO (SELECT DE COMPRAS/CATÁLOGO) ── */}
      <div className="articulos-card">
        <div className="articulos-card__header">
          <div>
            <h2 className="articulos-card__title">
              <FaBox size={14} />
              <span>1. Producto Vinculado (Compras / Catálogo)</span>
            </h2>
            <p className="articulos-card__subtitle">
              Mapea el producto del inventario para heredar su información y control en ventas
            </p>
          </div>
          {formData.idProducto && (
            <span
              style={{
                fontSize: '11px',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              Producto Vinculado
            </span>
          )}
        </div>

        <div className="articulos-product-selector">
          <div className="articulos-field-group">
            <label className="articulos-field-label articulos-field-label--required">
              Seleccionar Producto:
            </label>
            {isView ? (
              <div className="articulos-input" style={{ opacity: 0.9, background: '#080c14' }}>
                {selectedProduct?.nombre || formData.productoNombre || 'Artículo General (Sin vincular a producto específico)'}
              </div>
            ) : (
              <select
                className={`articulos-input ${errors.idProducto ? 'articulos-input--error' : ''}`}
                value={formData.idProducto || ''}
                onChange={(e) => {
                  const prodId = e.target.value;
                  // ✅ CORRECCIÓN: Protegemos el .find() dentro del onChange
                  const found = safeProducts.find(
                    (p) => String(p.id || p.IdProducto) === String(prodId)
                  );
                  handleSelectProduct(found || null);
                }}
              >
                <option value="">-- Seleccionar producto de compras/catálogo --</option>
                {/* ✅ CORRECCIÓN: Protegemos el .map() */}
                {safeProducts.map((p) => (
                  <option key={p.id || p.IdProducto} value={p.id || p.IdProducto}>
                    {p.nombre || p.Nombre} {p.categoria ? `(${p.categoria})` : ''} - Stock: {p.stock ?? 0}
                  </option>
                ))}
              </select>
            )}
            {errors.idProducto && <span className="articulos-error-text">{errors.idProducto}</span>}
          </div>

          {selectedProduct && (
            <div className="articulos-product-badge">
              <div className="articulos-product-badge__info">
                <img
                  src={selectedProduct.imagen || (selectedProduct.imagenes && selectedProduct.imagenes[0]) || 'https://placehold.co/40x40/162032/F5C81B?text=P'}
                  alt={selectedProduct.nombre}
                  style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #334155' }}
                />
                <div>
                  <div className="articulos-product-badge__name">{selectedProduct.nombre}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Categoría: <span style={{ color: '#fff' }}>{selectedProduct.categoria || 'General'}</span> | Precio Venta:{' '}
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                      ${Number(selectedProduct.precioVenta || 0).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="articulos-product-badge__meta">
                Stock Catálogo: {selectedProduct.stock ?? 0} uds
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 2: INFORMACIÓN GENERAL DEL ARTÍCULO ── */}
      <div className="articulos-card">
        <div className="articulos-card__header">
          <div>
            <h2 className="articulos-card__title">
              <FaTag size={14} />
              <span>2. Información General del Artículo</span>
            </h2>
            <p className="articulos-card__subtitle">
              Nombre identificador único, stock disponible y estado operativo
            </p>
          </div>
        </div>

        <div className="articulos-grid-3">
          {/* Nombre del Artículo */}
          <div className="articulos-field-group">
            <label className="articulos-field-label articulos-field-label--required">
              Nombre del Artículo:
            </label>
            {isView ? (
              <div className="articulos-input" style={{ opacity: 0.9, background: '#080c14', fontWeight: '700' }}>
                {formData.nombre || '-'}
              </div>
            ) : (
              <input
                type="text"
                className={`articulos-input ${errors.nombre ? 'articulos-input--error' : ''}`}
                value={formData.nombre || ''}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Ej: Gorra LA Dodgers Edición Negra, Camiseta..."
                maxLength={60}
              />
            )}
            {errors.nombre && <span className="articulos-error-text">{errors.nombre}</span>}
          </div>

          {/* Cantidad / Stock */}
          <div className="articulos-field-group">
            <label className="articulos-field-label">
              Cantidad / Stock Disponible:
            </label>
            {isView ? (
              <div className="articulos-input" style={{ opacity: 0.9, background: '#080c14', color: '#10b981', fontWeight: '700' }}>
                {formData.cantidad ?? 0} uds
              </div>
            ) : (
              <input
                type="number"
                min="0"
                className={`articulos-input ${errors.cantidad ? 'articulos-input--error' : ''}`}
                value={formData.cantidad ?? 0}
                onChange={(e) => handleInputChange('cantidad', e.target.value)}
                placeholder="0"
              />
            )}
            {errors.cantidad && <span className="articulos-error-text">{errors.cantidad}</span>}
          </div>

          {/* Estado General */}
          <div className="articulos-field-group">
            <label className="articulos-field-label">
              Estado del Artículo:
            </label>
            {isView ? (
              <div style={{ paddingTop: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: formData.isActive ? '#10b981' : '#ef4444',
                    background: formData.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${formData.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}
                >
                  {formData.isActive ? <FaCheck size={10} /> : <FaTimes size={10} />}
                  <span>{formData.isActive ? 'Activo' : 'Inactivo'}</span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleInputChange('isActive', !formData.isActive)}
                className={`articulos-field-item__status-toggle ${
                  formData.isActive
                    ? 'articulos-field-item__status-toggle--active'
                    : 'articulos-field-item__status-toggle--inactive'
                }`}
                style={{ height: '36px' }}
              >
                {formData.isActive ? <FaCheck size={11} /> : <FaTimes size={11} />}
                <span>{formData.isActive ? 'Artículo Activo' : 'Artículo Inactivo'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 3: CAMPOS DINÁMICOS ÚNICOS CON ESTADO ── */}
      <div className="articulos-card">
        <div className="articulos-card__header">
          <div>
            <h2 className="articulos-card__title">
              <FaTag size={14} />
              <span>3. Campos y Especificaciones del Artículo (Personalización Dinámica)</span>
            </h2>
            <p className="articulos-card__subtitle">
              Agrega los campos que llevará el artículo. Deben ser únicos y cuentan con estado individual.
            </p>
          </div>
          {!isView && (
            <button
              type="button"
              onClick={() => agregarCampo()}
              className="articulos-btn-add"
            >
              <FaPlus size={10} />
              <span>+ Agregar Campo</span>
            </button>
          )}
        </div>

        {/* Barra de atajos/sugerencias rápidas */}
        {!isView && (
          <div className="articulos-presets-bar">
            <span className="articulos-presets-label">Sugerencias rápidas:</span>
            {presets.map((p) => {
              const alreadyExists = (formData.campos || []).some(
                (c) => (c.nombre || '').trim().toLowerCase() === p.toLowerCase()
              );
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => agregarCampo(p)}
                  disabled={alreadyExists}
                  className="articulos-preset-chip"
                  style={{
                    opacity: alreadyExists ? 0.4 : 1,
                    cursor: alreadyExists ? 'not-allowed' : 'pointer'
                  }}
                  title={alreadyExists ? 'Este campo ya fue agregado' : `Agregar campo ${p}`}
                >
                  + {p}
                </button>
              );
            })}
          </div>
        )}

        {/* Lista de campos dinámicos */}
        <div className="articulos-dynamic-panel">
          {(!formData.campos || formData.campos.length === 0) ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed #1e293b',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '13px'
              }}
            >
              No se han agregado campos personalizados a este artículo.{' '}
              {!isView && 'Haz clic en "+ Agregar Campo" o selecciona una sugerencia rápida.'}
            </div>
          ) : (
            <div className="articulos-fields-list">
              {/* Cabecera de columnas para los campos en edición */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isView ? '24px 1fr 1fr 120px' : '24px 1.2fr 1.5fr 120px 40px',
                  gap: '10px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#94a3b8',
                  textTransform: 'uppercase'
                }}
              >
                <span>#</span>
                <span>Nombre del Campo (Único)</span>
                <span>Valor / Detalle</span>
                <span style={{ textAlign: 'center' }}>Estado</span>
                {!isView && <span></span>}
              </div>

              {formData.campos.map((campo, idx) => {
                const isDuplicate =
                  !isView &&
                  formData.campos.some(
                    (other, oIdx) =>
                      oIdx !== idx &&
                      (other.nombre || '').trim().toLowerCase() ===
                        (campo.nombre || '').trim().toLowerCase() &&
                      (campo.nombre || '').trim() !== ''
                  );

                return (
                  <div
                    key={campo.id || idx}
                    className={`articulos-field-item ${isDuplicate ? 'articulos-field-item--error' : ''}`}
                    style={isView ? { gridTemplateColumns: '24px 1fr 1fr 120px' } : undefined}
                  >
                    <span className="articulos-field-item__idx">{idx + 1}</span>

                    {/* Nombre del campo */}
                    <div>
                      {isView ? (
                        <div style={{ fontWeight: '700', color: '#F5C81B', fontSize: '13px' }}>
                          {campo.nombre || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`articulos-input ${isDuplicate ? 'articulos-input--error' : ''}`}
                          value={campo.nombre || ''}
                          onChange={(e) => actualizarCampo(idx, 'nombre', e.target.value)}
                          placeholder="Ej: Material, Visera, Broche..."
                        />
                      )}
                      {isDuplicate && (
                        <span className="articulos-error-text" style={{ fontSize: '10px' }}>
                          ¡Campo duplicado! Debe ser único.
                        </span>
                      )}
                    </div>

                    {/* Valor o descripción del campo */}
                    <div>
                      {isView ? (
                        <div style={{ color: '#fff', fontSize: '13px' }}>
                          {campo.valor || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          className="articulos-input"
                          value={campo.valor || ''}
                          onChange={(e) => actualizarCampo(idx, 'valor', e.target.value)}
                          placeholder="Ej: Algodón 100%, Plana, Metálico..."
                        />
                      )}
                    </div>

                    {/* Estado del campo */}
                    <div>
                      <button
                        type="button"
                        disabled={isView}
                        onClick={() => actualizarCampo(idx, 'estado', !campo.estado)}
                        className={`articulos-field-item__status-toggle ${
                          campo.estado
                            ? 'articulos-field-item__status-toggle--active'
                            : 'articulos-field-item__status-toggle--inactive'
                        }`}
                        style={{ width: '100%' }}
                      >
                        {campo.estado ? <FaCheck size={10} /> : <FaTimes size={10} />}
                        <span>{campo.estado ? 'Activo' : 'Inactivo'}</span>
                      </button>
                    </div>

                    {/* Botón eliminar campo */}
                    {!isView && (
                      <div>
                        <button
                          type="button"
                          onClick={() => eliminarCampo(idx)}
                          className="articulos-btn-remove"
                          title="Eliminar este campo"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─ SECCIÓN 4: PREVISUALIZACIÓN DE IMPACTO EN VENTAS ── */}
      <div className="articulos-card">
        <div className="articulos-preview-box">
          <div className="articulos-preview-box__title">
            <FaInfoCircle size={13} />
            <span>Previsualización de Comportamiento en el Módulo de Ventas</span>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
            Al vender el producto <strong>"{selectedProduct?.nombre || formData.nombre || 'este producto'}"</strong>:
          </p>
          <div className="articulos-preview-box__badge-group">
            {selectedProduct?.categoria?.toUpperCase()?.includes('GORRA') ? (
              <div className="articulos-preview-pill" style={{ borderColor: 'rgba(245, 200, 27, 0.4)' }}>
                <span className="articulos-preview-pill__key">Comportamiento:</span>
                <span>Es una Gorra tradicional → En ventas saldrá la opción <strong>"Talla"</strong> (Ajustable, 7, 7 1/4...).</span>
              </div>
            ) : formData.campos && formData.campos.filter((c) => c.estado).length > 0 ? (
              <>
                <div className="articulos-preview-pill" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  <span className="articulos-preview-pill__key">Comportamiento:</span>
                  <span>En ventas <strong>NO saldrá "Talla"</strong>, sino los campos configurados:</span>
                </div>
                {formData.campos
                  .filter((c) => c.estado)
                  .map((c, i) => (
                    <div key={i} className="articulos-preview-pill">
                      <span className="articulos-preview-pill__key">{c.nombre}:</span>
                      <span>{c.valor || 'Opciones'}</span>
                    </div>
                  ))}
              </>
            ) : (
              <div className="articulos-preview-pill">
                <span className="articulos-preview-pill__key">Artículo sin variantes específicas:</span>
                <span>En ventas se seleccionará directamente por unidad.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticuloFullView;