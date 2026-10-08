/* === COMPONENTE REUTILIZABLE ===
   Pieza modular de interfaz (como Tarjetas, Modales o Botones).
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import "../style/ProductoItemForm.css";  // ← Un ".." = sube UN nivel

const ProductoItemForm = ({
  producto,
  index,
  availableProducts = [],
  availableSizes = [],
  onChange,
  onRemove,
  isViewMode = false,
  isFirst = false,
  errors = {},
  isLoadingProducts = false,
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const selectorRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowSelector(false);
      }
    };
    if (showSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSelector]);

  const totalCantidad = (producto.variantes || []).reduce(
    (sum, v) => sum + (parseInt(v.cantidad) || 0),
    0,
  );
  const subtotal = totalCantidad * parseFloat(producto.precioCompra || 0);

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === "" || String(num).toLowerCase() === "nan") return "";
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return "";
    const rounded = Math.floor(parsed);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // ===== MODO VISTA =====
  if (isViewMode) {
    return (
      <div className="producto-item-form">
        <div className="producto-item-form__grid--view">
          <div className="producto-item-form__read producto-item-form__read--number">
            {index + 1}.
          </div>
          <div>
            <div className="producto-item-form__read producto-item-form__read--bold">
              {producto.nombre || "-"}
            </div>
            {/* Variantes en modo vista */}
            <div className="producto-item-form__view-variants">
              {(producto.variantes || []).map((v, i) => (
                <div key={i} className="producto-item-form__view-variant">
                  <span className="producto-item-form__view-variant-talla">
                    {v.talla?.toLowerCase()}
                  </span>{" "}
                  x {v.cantidad}
                </div>
              ))}
              <div className="producto-item-form__subtotal-inline-mobile">
                <span className="producto-item-form__subtotal-label">SUBTOTAL:</span>
                <span className="producto-item-form__subtotal-value">${formatNumber(subtotal)}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="producto-item-form__read producto-item-form__input--price">
              ${formatNumber(producto.precioCompra)}
            </div>
          </div>
          <div>
            <div className="producto-item-form__read producto-item-form__input--sell">
              ${formatNumber(producto.precioVenta)}
            </div>
          </div>
          <div>
            <div className="producto-item-form__read">
              ${formatNumber(producto.precioMayorista6)}
            </div>
          </div>
          <div>
            <div className="producto-item-form__read">
              ${formatNumber(producto.precioMayorista80)}
            </div>
          </div>
        </div>
        
        {/* Subtotal */}
        <div className="producto-item-form__subtotal-container">
          <div className="producto-item-form__subtotal-wrapper">
            {/* El nombre del producto se ocultó por petición del usuario */}
            <div className="producto-item-form__subtotal-box">
              <span className="producto-item-form__subtotal-label">
                SUBTOTAL:
              </span>
              <span className="producto-item-form__subtotal-value">
                ${formatNumber(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MODO EDICIÓN =====
  return (
    <div className="producto-item-form">
      {/* FILA ÚNICA */}
      <div className="producto-item-form__grid">
        {/* Numeración */}
        <div className="producto-item-form__read producto-item-form__read--number">
          {index + 1}.
        </div>

        {/* Columna Producto y Variantes */}
        <div className="producto-item-form__product-column" ref={selectorRef}>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <div className="producto-item-form__input-wrapper">
              <input
                type="text"
                value={producto.nombre || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const matched = availableProducts.find(
                    p => (p.nombre || p.Nombre || "").trim().toLowerCase() === val.trim().toLowerCase()
                  );
                  if (matched) {
                    onChange(index, "id", matched.id || matched.IdProducto);
                    const pc = matched.precioCompra ?? matched.PrecioCompra ?? matched.precio_compra ?? "";
                    const pv = matched.precioVenta ?? matched.PrecioVenta ?? matched.precio_venta ?? "";
                    const pm6 = matched.precioMayorista6 ?? matched.PrecioMayorista6 ?? "";
                    const pm80 = matched.precioMayorista80 ?? matched.PrecioMayorista80 ?? "";
                    if (pc !== "" && !producto.precioCompra) onChange(index, "precioCompra", pc);
                    if (pv !== "" && !producto.precioVenta) onChange(index, "precioVenta", pv);
                    if (pm6 !== "" && !producto.precioMayorista6) onChange(index, "precioMayorista6", pm6);
                    if (pm80 !== "" && !producto.precioMayorista80) onChange(index, "precioMayorista80", pm80);
                  } else {
                    onChange(index, "id", "");
                  }
                  onChange(index, "nombre", val);
                }}
                placeholder="Escribir producto..."
                className={`producto-item-form__input ${
                  errors[`prod_${index}`] ? "producto-item-form__input--error" : ""
                }`}
                style={{ paddingRight: (producto.nombre || "").trim() ? "26px" : "6px" }}
              />
              {(producto.nombre || "").trim() && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(index, "id", "");
                    onChange(index, "nombre", "");
                  }}
                  className="producto-item-form__clear-btn"
                  title="Borrar texto"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSelector(!showSelector)}
              data-tooltip="Buscar en productos existentes"
              className={`producto-item-form__btn producto-item-form__btn--search ${
                showSelector ? "producto-item-form__btn--search--active" : ""
              }`}
            >
              <FaSearch size={13} />
            </button>
          </div>

          {/* SECCIÓN DE VARIANTES */}
          <div className="producto-item-form__variants-container yellow-scrollbar">
            <div className="producto-item-form__variants-wrapper">
              {(producto.variantes || []).map((v, vi) => (
                <div
                  key={v._tempKey || vi}
                  className="producto-item-form__variant"
                >
                  {/* Talla */}
                  <select
                    value={v.talla || ""}
                    onChange={(e) => {
                      const newVars = [...producto.variantes];
                      newVars[vi] = { ...newVars[vi], talla: e.target.value };
                      onChange(index, "variantes", newVars);
                    }}
                    className={`producto-item-form__variant-select ${
                      errors[`talla_${index}_${vi}`]
                        ? "producto-item-form__variant-select--error"
                        : ""
                    }`}
                  >
                    <option value="">Talla</option>
                    {availableSizes.map((s) => {
                      const sizeValue = s.value || s;
                      const isSelectedByOther = producto.variantes.some(
                        (otherV, otherI) =>
                          otherI !== vi && otherV.talla === sizeValue,
                      );
                      if (isSelectedByOther) return null;
                      return (
                        <option
                          key={sizeValue}
                          value={sizeValue}
                        >
                          {(() => {
                            const text = String(s.label || s).toLowerCase();
                            return text.charAt(0).toUpperCase() + text.slice(1);
                          })()}
                        </option>
                      );
                    })}
                  </select>

                  {/* Control de Cantidad */}
                  {(() => {
                    const hasQtyError = Boolean(
                      errors[`qty_${index}_${vi}`] ||
                      errors[`qty_${index}`] ||
                      errors[`producto_cantidad_${index}`]
                    );
                    return (
                      <div className={`producto-item-form__variant-qty ${hasQtyError ? 'producto-item-form__variant-qty--error' : ''}`}>
                        <button
                          type="button"
                          onClick={() => {
                            const newVars = [...producto.variantes];
                            const newQty = Math.max(
                              1,
                              (parseInt(newVars[vi].cantidad) || 0) - 1,
                            );
                            newVars[vi] = { ...newVars[vi], cantidad: newQty };
                            onChange(index, "variantes", newVars);
                          }}
                          className="producto-item-form__btn--minus"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={v.cantidad !== undefined && v.cantidad !== null ? v.cantidad : ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const newVars = [...producto.variantes];
                            newVars[vi] = {
                              ...newVars[vi],
                              cantidad: raw === '' ? '' : (parseInt(raw, 10) || 0),
                            };
                            onChange(index, "variantes", newVars);
                          }}
                          className={`producto-item-form__variant-qty-input ${hasQtyError ? 'producto-item-form__input--error' : ''}`}
                          placeholder="0"
                          title={hasQtyError ? "Cantidad requerida mayor a 0" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVars = [...producto.variantes];
                            const newQty =
                              (parseInt(newVars[vi].cantidad) || 0) + 1;
                            newVars[vi] = { ...newVars[vi], cantidad: newQty };
                            onChange(index, "variantes", newVars);
                          }}
                          className="producto-item-form__btn--plus"
                        >
                          +
                        </button>
                      </div>
                    );
                  })()}

                  {/* Eliminar Variante */}
                  {(producto.variantes || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newVars = producto.variantes.filter(
                          (_, i) => i !== vi,
                        );
                        onChange(index, "variantes", newVars);
                      }}
                      className="producto-item-form__btn--remove-variant"
                    >
                      <FaTimes size={9} />
                    </button>
                  )}
                </div>
              ))}

              {/* Botón Añadir Variante */}
              {(producto.variantes || []).length < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    const newVars = [
                      ...(producto.variantes || []),
                      { talla: "", cantidad: 1, _tempKey: Math.random() },
                    ];
                    onChange(index, "variantes", newVars);
                  }}
                  className="producto-item-form__btn producto-item-form__btn--add-variant"
                >
                  + Talla
                </button>
              )}
              <div className="producto-item-form__subtotal-inline-mobile">
                <span className="producto-item-form__subtotal-label">SUBTOTAL:</span>
                <span className="producto-item-form__subtotal-value">${formatNumber(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Selector de Productos */}
          {showSelector && (
            <div className="producto-item-form__selector yellow-scrollbar">
              {isLoadingProducts ? (
                <div className="producto-item-form__selector-loading">
                  Cargando...
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="producto-item-form__selector-empty">
                  No hay productos
                </div>
              ) : (() => {
                const filteredProducts = availableProducts.filter((p) =>
                  (p.nombre || p.Nombre || "")
                    .toLowerCase()
                    .includes((producto.nombre || "").toLowerCase())
                );

                if (filteredProducts.length === 0) {
                  return (
                    <div className="producto-item-form__selector-empty">
                      No se encontraron coincidencias
                    </div>
                  );
                }

                return filteredProducts.map((p, i) => (
                  <div
                    key={p.id || p.IdProducto || i}
                    className="producto-item-form__selector-item"
                    onClick={() => {
                      const selId = p.id || p.IdProducto;
                      const selNombre = p.nombre || p.Nombre;
                      
                      // Default to the first talla in tallasStock if available, otherwise default to "Ajustable"
                      let selTalla = "";
                      if (p.tallasStock && Array.isArray(p.tallasStock) && p.tallasStock.length > 0) {
                        selTalla = p.tallasStock[0].talla || p.tallasStock[0].Talla || "";
                      }
                      if (!selTalla) {
                        selTalla = p.talla || p.Talla || "Ajustable";
                      }

                      onChange(index, "id", selId);
                      onChange(index, "nombre", selNombre);
                      // Que no salga la cantidad por defecto porque va a comprar una diferente
                      onChange(index, "variantes", [
                        {
                          talla: selTalla,
                          cantidad: "",
                          _tempKey: Date.now(),
                        },
                      ]);
                      const pc = p.precioCompra ?? p.PrecioCompra ?? p.precio_compra ?? "";
                      const pv = p.precioVenta ?? p.PrecioVenta ?? p.precio_venta ?? "";
                      const pm6 = p.precioMayorista6 ?? p.PrecioMayorista6 ?? "";
                      const pm80 = p.precioMayorista80 ?? p.PrecioMayorista80 ?? "";

                      onChange(index, "precioCompra", pc !== "" && pc !== null && pc !== undefined ? pc : "");
                      onChange(index, "precioVenta", pv !== "" && pv !== null && pv !== undefined ? pv : "");
                      onChange(index, "precioMayorista6", pm6 !== "" && pm6 !== null && pm6 !== undefined ? pm6 : "");
                      onChange(index, "precioMayorista80", pm80 !== "" && pm80 !== null && pm80 !== undefined ? pm80 : "");

                      setShowSelector(false);
                    }}
                  >
                    <img
                      src={
                        (Array.isArray(p.imagenes) && p.imagenes[0]) ||
                        (Array.isArray(p.Imagenes) && p.Imagenes[0]) ||
                        "/images/placeholder-product.png"
                      }
                      alt={p.nombre || p.Nombre}
                      className="producto-item-form__selector-img"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-product.png";
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="producto-item-form__selector-name">
                        {p.nombre || p.Nombre}
                      </span>
                      {p.talla && (
                        <span className="producto-item-form__selector-talla">
                          Talla: {p.talla.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Precio Compra */}
        <input
          type="text"
          value={formatNumber(producto.precioCompra)}
          onChange={(e) => {
            let val = e.target.value
              .replace(/\./g, "")
              .replace(/,/g, ".")
              .replace(/[^0-9.]/g, "");
            const parts = val.split(".");
            if (parts.length > 2)
              val = parts[0] + "." + parts.slice(1).join("");
            onChange(index, "precioCompra", val);
          }}
          className={`producto-item-form__input producto-item-form__input--price ${
            errors[`price_${index}`] ? "producto-item-form__input--error" : ""
          }`}
          placeholder="0"
        />

        {/* Precio Venta */}
        <input
          type="text"
          value={formatNumber(producto.precioVenta)}
          onChange={(e) => {
            let val = e.target.value
              .replace(/\./g, "")
              .replace(/,/g, ".")
              .replace(/[^0-9.]/g, "");
            const parts = val.split(".");
            if (parts.length > 2)
              val = parts[0] + "." + parts.slice(1).join("");
            onChange(index, "precioVenta", val);
          }}
          className={`producto-item-form__input producto-item-form__input--sell ${
            errors[`sell_${index}`] ? "producto-item-form__input--error" : ""
          }`}
          placeholder="0"
        />

        {/* Precio +6 */}
        <input
          type="text"
          value={formatNumber(producto.precioMayorista6)}
          onChange={(e) => {
            let val = e.target.value
              .replace(/\./g, "")
              .replace(/,/g, ".")
              .replace(/[^0-9.]/g, "");
            const parts = val.split(".");
            if (parts.length > 2)
              val = parts[0] + "." + parts.slice(1).join("");
            onChange(index, "precioMayorista6", val);
          }}
          className="producto-item-form__input"
          placeholder="0"
        />

        {/* Precio +80 */}
        <input
          type="text"
          value={formatNumber(producto.precioMayorista80)}
          onChange={(e) => {
            let val = e.target.value
              .replace(/\./g, "")
              .replace(/,/g, ".")
              .replace(/[^0-9.]/g, "");
            const parts = val.split(".");
            if (parts.length > 2)
              val = parts[0] + "." + parts.slice(1).join("");
            onChange(index, "precioMayorista80", val);
          }}
          className="producto-item-form__input"
          placeholder="0"
        />

        {/* Eliminar / Limpiar */}
        <div style={{ display: "flex", alignItems: "center", paddingTop: "0px" }}>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="producto-item-form__btn producto-item-form__btn--delete"
            title={
              isFirst && producto.id === "" ? "Limpiar fila" : "Eliminar fila"
            }
          >
            <FaTrash size={13} />
          </button>
        </div>
      </div>
      
      {/* Subtotal */}
      <div className="producto-item-form__subtotal-container" style={{ marginTop: '-16px', paddingRight: '36px' }}>
        <div className="producto-item-form__subtotal-wrapper">
          {/* Nombre oculto */}
          <div className="producto-item-form__subtotal-box">
            <span className="producto-item-form__subtotal-label">
              SUBTOTAL:
            </span>
            <span className="producto-item-form__subtotal-value">
              ${formatNumber(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoItemForm;