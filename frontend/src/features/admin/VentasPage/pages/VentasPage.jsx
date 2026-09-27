/* === PÁGINA PRINCIPAL === */
import "../style/index.css";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  FaArrowLeft, FaPlus, FaTrash, FaTimes, FaImage, FaUser,
  FaBoxOpen, FaCamera, FaExclamationTriangle, FaFilePdf,
} from "react-icons/fa";
import {
  Alert, EntityTable, SearchInput, DateInputWithCalendar,
  StatusPill, SearchSelect, DraftModal
} from "../../../shared/services";
import CustomPagination from "../../../shared/components/admin/CustomPagination";
import StatusFilter from "../components/StatusFilter";
import ProductoForm from "../components/ProductoForm";
import { useVentasLogic } from "../hooks/useVentasLogic";

const AdminExpandedImageModal = ({ src, onClose }) => {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setPosition({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  };
  return (
    <div className="gm-zoom-overlay-admin" onClick={onClose} style={{ zIndex: 100050, position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      {/* Botón X flotante siempre visible y nunca cortado */}
      <button 
        onClick={onClose} 
        title="Cerrar vista previa"
        style={{ 
          position: "fixed", 
          top: "24px", 
          right: "24px", 
          width: "42px", 
          height: "42px", 
          backgroundColor: "#FFC300", 
          color: "#000", 
          borderRadius: "50%", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer", 
          zIndex: 100060, 
          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
          transition: "transform 0.15s ease" 
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <FaTimes size={20} />
      </button>
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          position: "relative", 
          maxWidth: "90vw", 
          maxHeight: "90vh", 
          borderRadius: "14px", 
          overflow: "hidden", 
          border: "2px solid rgba(255, 195, 0, 0.4)", 
          backgroundColor: "#000", 
          boxShadow: "0 10px 40px rgba(0,0,0,0.8)" 
        }}
      >
        <div onMouseMove={handleMouseMove} onClick={() => setZoomed(!zoomed)} style={{ overflow: "hidden", cursor: zoomed ? "zoom-out" : "zoom-in", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <img src={src} className="gm-zoom-img-admin" alt="zoom" style={{ maxHeight: "85vh", maxWidth: "85vw", display: "block", objectFit: "contain", transition: zoomed ? "none" : "transform 0.2s ease", transformOrigin: `${position.x}% ${position.y}%`, transform: zoomed ? "scale(2.2)" : "scale(1)" }} />
        </div>
      </div>
    </div>
  );
};

const VentasPage = () => {
  const {
    availableStatuses, availableSizes, availableCustomers, availableProducts,
    searchTerm, setSearchTerm, filterStatus, setFilterStatus, currentPage, setCurrentPage,
    loading, alert, setAlert, modoVista, ventaViendo,
    approveModal, setApproveModal, rejectModal, setRejectModal,
    partialPaymentModal, setPartialPaymentModal, annulModal, setAnnulModal,
    sendConfirmModal, setSendConfirmModal, rejectionReason, setRejectionReason,
    errors, nuevaVenta, filtered, paginatedVentas, totalPages,
    mostrarLista, mostrarFormulario, mostrarDetalle,
    agregarProducto, actualizarProducto, eliminarProducto, calcularTotal,
    handleImageUpload, handleImage2Upload, handleCreateVenta,
    updateVentaStatus, handlePartialPayment, handleEnviarVenta, requiresReceipt,
    showDraftModal, draftMeta, handleRegisterClick, restoreDraft, discardDraft, closeDraftModal,
  } = useVentasLogic();

  const columns = [
    { header: "No. Venta", field: "noVenta", render: (item) => <span className="sale-id-text">{item.noVenta || item.id}</span> },
    { header: "Cliente", field: "cliente", render: (item) => <span className="client-name-text">{typeof item.cliente === "object" ? item.cliente?.nombre : item.cliente}</span> },
    { header: "Fecha", field: "fecha", render: (item) => <span className="sale-date-text">{item.fecha}</span> },
    { header: "Total", field: "total", render: (item) => <span className="sale-total-text">${Number(item.total).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> },
    { header: "Tipo", field: "tipoEntrega", render: (item) => <span className={`delivery-type-pill ${item.tipoEntrega}`}>{item.tipoEntrega === "recoger" ? "🏪 Local" : "🚚 Envío"}</span> },
    { header: "Envío", field: "statusenvio", render: (item) => {
      const isCompleted = String(item.estado || "").toLowerCase().includes("completad");
      const isRejected = String(item.estado || "").toLowerCase().includes("rechaz");
      let est = isRejected ? "Cancelado" : isCompleted ? (item.statusenvio || (item.tipoEntrega === 'recoger' ? 'Preparando' : 'Por enviar')) : "En espera";
      return <StatusPill status={est} />;
    }},
    { header: "Estado", field: "estado", render: (item) => <StatusPill status={item.estado} /> },
  ];

  const [imgModal, setImgModal] = useState({ open: false, src: "" });
  const openImage = (src) => setImgModal({ open: true, src });
  const [confirmCompleteModal, setConfirmCompleteModal] = useState({ isOpen: false, venta: null, cliente: "", monto1: 0, monto2: 0, total: 0 });
  const [removeEvidencia2Modal, setRemoveEvidencia2Modal] = useState(false);
  const [confirmRejectModal, setConfirmRejectModal] = useState({ isOpen: false, venta: null, cliente: "", motivo: "", evidencia: null });
  const [confirmCancelPartialModal, setConfirmCancelPartialModal] = useState(false);
  const [rejectionEvidence, setRejectionEvidence] = useState(null);
  const [motivoError, setMotivoError] = useState(false);
  const [confirmAbortRejectModal, setConfirmAbortRejectModal] = useState(false);

  const getClienteNombre = (venta) => {
    if (!venta) return "Cliente";
    if (typeof venta.cliente === "object" && venta.cliente !== null) return venta.cliente.nombre || venta.cliente.name || "Cliente";
    return venta.cliente || venta.nombreCliente || "Cliente";
  };

  const formatCOP = (val) => Math.round(Number(val) || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatCOPInputString = (val) => { const d = String(val || "").replace(/\D/g, ""); return d ? parseInt(d, 10).toLocaleString("es-CO") : ""; };
  const parseCOPInput = (val) => { if (!val) return 0; return parseInt(String(val).replace(/\D/g, ""), 10) || 0; };

  const groupedProductsViendo = React.useMemo(() => {
    const rawProducts = ventaViendo?.productos || ventaViendo?.detalles;
    if (!rawProducts) return [];
    const grouped = [];
    rawProducts.forEach((p) => {
      const pId = p.id || p.idProducto;
      const pNombre = p.nombre || p.nombreProducto || p.producto?.nombre;
      const existing = grouped.find((item) => item.id === pId && item.nombre === pNombre);
      if (existing) existing.variantes.push({ talla: p.talla, cantidad: p.cantidad, _tempKey: Math.random() });
      else grouped.push({ ...p, id: pId, nombre: pNombre, variantes: [{ talla: p.talla, cantidad: p.cantidad, _tempKey: Math.random() }] });
    });
    return grouped;
  }, [ventaViendo?.productos, ventaViendo?.detalles]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll(".yellow-scrollbar").forEach((w) => (w.scrollTop = 0));
  }, [modoVista, ventaViendo]);

  const [detailSearch, setDetailSearch] = useState("");

  const handleExportPDF = () => {
    if (!ventaViendo) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const saleId = ventaViendo.noVenta || ventaViendo.id;
    const rawItems = ventaViendo.productos || ventaViendo.detalles || [];
    const groupedItems = rawItems.reduce((acc, p) => {
      const price = typeof p.precio === "string" ? parseFloat(p.precio.replace(/[^0-9.]/g, "")) : p.precio;
      const subtotal = typeof p.subtotal === "string" ? parseFloat(p.subtotal.replace(/[^0-9.]/g, "")) : p.subtotal || (price * (parseInt(p.cantidad) || 0));
      const pNombre = p.nombre || p.nombreProducto || p.producto?.nombre;
      const existing = acc.find((item) => item.name === pNombre);
      if (existing) { existing.quantity += (parseInt(p.cantidad) || 0); if (!existing.sizes.includes(p.talla)) existing.sizes.push(p.talla); existing.subtotal += subtotal; }
      else acc.push({ name: pNombre, sizes: [p.talla], quantity: parseInt(p.cantidad) || 0, price, subtotal });
      return acc;
    }, []);
    const total = typeof ventaViendo.total === "string" ? parseFloat(ventaViendo.total.replace(/[^0-9.]/g, "")) : ventaViendo.total || 0;
    const cliente = ventaViendo.cliente;
    let customerName = typeof cliente === "object" ? cliente?.nombre : cliente;
    let customerDoc = typeof cliente === "object" ? cliente?.num_documento : "N/A";
    let customerEmail = typeof cliente === "object" ? cliente?.correo : "N/A";
    let customerPhone = typeof cliente === "object" ? cliente?.telefono : "N/A";
    const idBusqueda = ventaViendo.idCliente;
    const foundCust = (availableCustomers || []).find(c => (idBusqueda && String(c.id) === String(idBusqueda)) || (customerName && String(c.nombre).toLowerCase() === String(customerName).toLowerCase()));
    if (foundCust) {
      if (!customerName || customerName === "Desconocido") customerName = foundCust.nombre;
      if (!customerDoc || customerDoc === "N/A") customerDoc = foundCust.num_documento;
      if (!customerEmail || customerEmail === "S/C" || customerEmail === "N/A") customerEmail = foundCust.correo;
      if (!customerPhone || customerPhone === "N/A") customerPhone = foundCust.telefono;
    }
    const customerAddress = ventaViendo.direccionEnvio || "Recogida en local";
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Gorras medellín", 20, 25);
    doc.setFontSize(14);
    doc.text(`NUMERO PED: ${saleId}`, 190, 25, { align: 'right' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Datos del cliente:", 20, 50);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    const drawLine = (label, value, x, y) => { doc.setFont('helvetica', 'bold'); doc.text(label, x, y); doc.setFont('helvetica', 'normal'); doc.text(String(value), x + doc.getTextWidth(label), y); };
    const shippingNote = ventaViendo.tipoEntrega === 'recoger' ? 'Recogida en local' : 'Consultar con el vendedor';
    drawLine("Fecha: ", ventaViendo.fecha || '', 20, 57);
    drawLine("Nombre: ", customerName, 20, 62);
    drawLine("Documento: ", customerDoc, 20, 67);
    drawLine("Email: ", customerEmail, 20, 72);
    drawLine("Teléfono: ", customerPhone, 20, 77);
    drawLine("Dirección: ", customerAddress, 20, 82);
    drawLine("Método de Pago: ", ventaViendo.metodoPago || 'N/A', 20, 87);
    if (shippingNote !== 'Consultar con el vendedor') drawLine("Envío: ", shippingNote, 20, 92);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Total del pedido:", 190, 52, { align: 'right' });
    doc.setFontSize(22);
    doc.text(`$${total.toLocaleString()}`, 190, 63, { align: 'right' });
    const tableTop = 105;
    doc.setFillColor(0, 0, 0);
    doc.rect(15, tableTop, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Item", 20, tableTop + 5.5);
    doc.text("Producto", 32, tableTop + 5.5);
    doc.text("Talla", 95, tableTop + 5.5);
    doc.text("Cantidad", 120, tableTop + 5.5);
    doc.text("Precio", 145, tableTop + 5.5);
    doc.text("Total", 175, tableTop + 5.5);
    let yPosItems = tableTop + 14;
    doc.setTextColor(0, 0, 0);
    const cols = [15, 28, 90, 115, 140, 168, 195];
    let currentPageTableTop = tableTop;
    groupedItems.forEach((item, idx) => {
      if (yPosItems > 260) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        const pageTableBottom = yPosItems - 8 + 2.5;
        doc.line(15, pageTableBottom, 195, pageTableBottom);
        cols.forEach(colX => { if (colX === 15 || colX === 195) doc.line(colX, currentPageTableTop, colX, pageTableBottom); else doc.line(colX, currentPageTableTop + 8, colX, pageTableBottom); });
        doc.addPage();
        currentPageTableTop = 10;
        doc.setFillColor(0, 0, 0);
        doc.rect(15, 10, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Item", 20, 15.5);
        doc.text("Producto", 32, 15.5);
        doc.text("Talla", 95, 15.5);
        doc.text("Cantidad", 120, 15.5);
        doc.text("Precio", 145, 15.5);
        doc.text("Total", 175, 15.5);
        doc.setTextColor(0, 0, 0);
        yPosItems = 24;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(String(idx + 1), 20, yPosItems);
      const displayName = item.name.length > 30 ? item.name.substring(0, 30) + "..." : item.name;
      doc.text(displayName, 32, yPosItems);
      doc.text(item.sizes.join(", "), 95, yPosItems);
      doc.text(String(item.quantity), 120, yPosItems);
      doc.text(`$${Number(item.price).toLocaleString("es-CO")}`, 145, yPosItems);
      doc.text(`$${Number(item.subtotal).toLocaleString("es-CO")}`, 175, yPosItems);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(15, yPosItems + 2.5, 195, yPosItems + 2.5);
      yPosItems += 8;
    });
    const tableBottom = yPosItems - 8 + 2.5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    cols.forEach(colX => { if (colX === 15 || colX === 195) doc.line(colX, currentPageTableTop, colX, tableBottom); else doc.line(colX, currentPageTableTop + 8, colX, tableBottom); });
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("GORRAS MEDELLÍN - Tu estilo, nuestra pasión", 105, pageHeight - 18, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Alfonzo López - Medellin | WhatsApp: +57 300 6158180", 105, pageHeight - 13, { align: "center" });
    doc.text("Email: duvann1991@gmail.com | Instagram: @gorrasmedellin", 105, pageHeight - 8, { align: "center" });
    doc.save(`Venta_${saleId}_GM_CAPS.pdf`);
  };

  return (
    <div className="ventas-page-wrapper">
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert((prev) => ({ ...prev, show: false }))} />}

      {/* MODAL PAGO INCOMPLETO */}
      {partialPaymentModal.isOpen && (() => {
        const m1Num = parseCOPInput(partialPaymentModal.montoRecibido);
        const m2Num = parseCOPInput(partialPaymentModal.montoNuevo);
        const totalVentaNum = Math.round(Number(partialPaymentModal.venta?.total || 0));
        const totalRecibidoNum = m1Num + m2Num;
        const saldoRestanteNum = Math.max(0, totalVentaNum - totalRecibidoNum);
        const diferenciaNum = totalVentaNum - totalRecibidoNum;
        const isExactMatch = totalRecibidoNum === totalVentaNum && totalVentaNum > 0;
        const clienteNombre = typeof partialPaymentModal.venta?.cliente === "object" ? (partialPaymentModal.venta?.cliente?.nombre || partialPaymentModal.venta?.cliente?.name || "Cliente") : (partialPaymentModal.venta?.cliente || partialPaymentModal.venta?.nombreCliente || "Cliente");
        const handleMonto1Change = (val) => {
          const d = String(val || "").replace(/\D/g, "");
          const num = parseInt(d, 10) || 0;
          if (num > totalVentaNum) return;
          setPartialPaymentModal((prev) => ({ ...prev, montoRecibido: formatCOPInputString(d) }));
        };
        const handleMonto2Change = (val) => {
          const d = String(val || "").replace(/\D/g, "");
          const num = parseInt(d, 10) || 0;
          const maxMonto2 = Math.max(0, totalVentaNum - m1Num);
          if (num > maxMonto2) return;
          setPartialPaymentModal((prev) => ({ ...prev, montoNuevo: formatCOPInputString(d) }));
        };
        return (
          <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
            <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "24px", maxWidth: "460px", width: "90%", textAlign: "center" }}>
              <h3 style={{ color: "#FFC300", fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Informar Pago Incompleto</h3>
              <p style={{ color: "#fff", marginBottom: "10px", fontSize: "12px" }}>La venta <strong>#{partialPaymentModal.venta?.id}</strong> es por un total de <strong style={{ color: "#FFC300" }}>${formatCOP(totalVentaNum)}</strong>.<br />Ingrese cuánto dinero recibió realmente.</p>
              <p style={{ color: "#94a3b8", fontSize: "10px", marginBottom: "12px" }}>📧 {isExactMatch ? "Se enviará confirmación de pago completado." : "Se informará el pago incompleto."}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                <div>
                  <label style={{ display: "block", color: "#FFC300", fontSize: "11px", fontWeight: "bold", marginBottom: "4px", textAlign: "left" }}>1ra consignación <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" inputMode="numeric" value={partialPaymentModal.montoRecibido} onChange={(e) => handleMonto1Change(e.target.value)} placeholder="Ej: 340.000" disabled={loading} style={{ width: "100%", padding: "8px 10px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", color: "#FFC300", fontSize: "11px", fontWeight: "bold", marginBottom: "4px", textAlign: "left" }}>2da consignación</label>
                  <input type="text" inputMode="numeric" value={partialPaymentModal.montoNuevo} onChange={(e) => handleMonto2Change(e.target.value)} placeholder="Ej: 20.000" disabled={loading} style={{ width: "100%", padding: "8px 10px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", marginBottom: "10px", background: "rgba(255, 195, 0, 0.05)", borderRadius: "6px", border: "1px solid rgba(255, 195, 0, 0.15)" }}>
                <div><span style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase" }}>Recibido</span><br /><span style={{ fontSize: "13px", color: "#fff", fontWeight: "800" }}>${formatCOP(totalRecibidoNum)}</span></div>
                <div style={{ textAlign: "right" }}><span style={{ fontSize: "9px", color: "#94a3b8", textTransform: "uppercase" }}>Saldo</span><br /><span style={{ fontSize: "13px", fontWeight: "800", color: saldoRestanteNum <= 0 ? "#10b981" : "#ef4444" }}>${formatCOP(saldoRestanteNum)}</span></div>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: "8px", marginBottom: "12px", fontSize: "11px", backgroundColor: isExactMatch ? "rgba(16, 185, 129, 0.12)" : totalRecibidoNum > totalVentaNum ? "rgba(239, 68, 68, 0.15)" : totalRecibidoNum === 0 ? "rgba(255, 195, 0, 0.08)" : "rgba(245, 158, 11, 0.12)", border: `1px solid ${isExactMatch ? "#10b981" : totalRecibidoNum > totalVentaNum ? "#ef4444" : totalRecibidoNum === 0 ? "rgba(255, 195, 0, 0.25)" : "#f59e0b"}`, color: isExactMatch ? "#10b981" : totalRecibidoNum > totalVentaNum ? "#ef4444" : totalRecibidoNum === 0 ? "#FFC300" : "#fbbf24" }}>
                {isExactMatch ? "✅ Monto exacto. Listo para completar." : totalRecibidoNum > totalVentaNum ? `⚠️ Excede por $${formatCOP(totalRecibidoNum - totalVentaNum)}.` : totalRecibidoNum > 0 ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span>⚠️ Faltan ${formatCOP(diferenciaNum)}</span>{diferenciaNum > 0 && m2Num === 0 && <button type="button" onClick={() => setPartialPaymentModal((prev) => ({ ...prev, montoNuevo: formatCOPInputString(diferenciaNum) }))} style={{ background: "#FFC300", color: "#000", border: "none", borderRadius: "6px", padding: "3px 6px", fontSize: "9px", fontWeight: "800", cursor: "pointer" }}>Autocompletar</button>}</div> : "ℹ️ Ingrese el monto de la 1ra consignación."}
              </div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", color: "#FFC300", fontSize: "11px", fontWeight: "800", marginBottom: "6px", textAlign: "left" }}>Segundo comprobante</label>
                {partialPaymentModal.evidencia2 ? (
                  <div style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: "#080e1a",
                    border: "1.5px solid #FFC300",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                  }}>
                    <div style={{ flex: 1, textAlign: "left", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ color: "#FFC300", fontSize: "12px", fontWeight: "800" }}>2do Comprobante</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px", lineHeight: "1.3" }}>Comprobante de la 2da consignación.</span>
                      <button
                        type="button"
                        onClick={() => openImage(partialPaymentModal.evidencia2)}
                        style={{
                          marginTop: "4px",
                          alignSelf: "flex-start",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "rgba(255, 195, 0, 0.12)",
                          border: "1px solid rgba(255, 195, 0, 0.35)",
                          color: "#FFC300",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        🔍 Clic para ampliar
                      </button>
                    </div>
                    <div style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: "#000",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.6)",
                      flexShrink: 0,
                      width: "160px",
                      height: "160px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <img
                        src={partialPaymentModal.evidencia2}
                        alt="Comprobante 2"
                        onClick={() => openImage(partialPaymentModal.evidencia2)}
                        style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", cursor: "zoom-in" }}
                      />
                      <button
                        type="button"
                        onClick={() => setRemoveEvidencia2Modal(true)}
                        title="Eliminar comprobante"
                        style={{ position: "absolute", top: "6px", right: "6px", width: "26px", height: "26px", background: "rgba(239, 68, 68, 0.95)", border: "none", borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
                      >
                        <FaTimes size={12} />
                      </button>
                      <div
                        onClick={() => openImage(partialPaymentModal.evidencia2)}
                        style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "4px 6px", fontSize: "9px", color: "#FFC300", fontWeight: "700", cursor: "zoom-in", textAlign: "center" }}
                      >
                        🔍 Ampliar
                      </div>
                    </div>
                  </div>
                ) : (
                  <label style={{ backgroundColor: "rgba(255, 195, 0, 0.04)", border: "1.5px dashed #FFC300", color: "#FFC300", width: "100%", minHeight: "75px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: "12px", fontWeight: "800", fontSize: "11px", gap: "6px", boxSizing: "border-box", transition: "all 0.2s ease" }}>
                    <FaCamera size={20} />
                    <span>Subir segundo comprobante</span>
                    <input type="file" accept="image/*" onChange={handleImage2Upload} className="display-none" />
                  </label>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => {
                    const hasContent = Boolean(
                      partialPaymentModal.montoRecibido?.trim() ||
                      partialPaymentModal.montoNuevo?.trim() ||
                      partialPaymentModal.evidencia2
                    );
                    if (hasContent) {
                      setConfirmCancelPartialModal(true);
                    } else {
                      setPartialPaymentModal({ isOpen: false, venta: null, montoRecibido: "", montoNuevo: "", evidencia2: null });
                    }
                  }}
                  disabled={loading}
                  style={{ flex: 1, padding: "11px 14px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}
                >
                  Cancelar
                </button>
                <button onClick={() => setConfirmCompleteModal({ isOpen: true, venta: partialPaymentModal.venta, cliente: clienteNombre, monto1: m1Num, monto2: m2Num, total: totalVentaNum })} disabled={loading || !isExactMatch} style={{ flex: 1, padding: "11px 20px", background: !isExactMatch ? "#1e293b" : "#FFC300", color: !isExactMatch ? "#64748b" : "#000", border: "none", fontWeight: "800", borderRadius: "10px", cursor: !isExactMatch ? "not-allowed" : "pointer", fontSize: "13px" }}>{loading ? "Procesando..." : "Completar Venta"}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL CONFIRMAR COMPLETAR */}
      {confirmCompleteModal.isOpen && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10006 }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "24px", maxWidth: "380px", width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}></div>
            <h3 style={{ color: "#FFC300", fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>¿Completar Venta?</h3>
            <p style={{ color: "#fff", fontSize: "13px", marginBottom: "14px" }}>¿Completar venta de <strong style={{ color: "#FFC300" }}>{confirmCompleteModal.cliente}</strong> (Venta #<strong>{confirmCompleteModal.venta?.id}</strong>)?</p>
            <div style={{ backgroundColor: "rgba(255, 195, 0, 0.08)", border: "1px solid rgba(255, 195, 0, 0.25)", borderRadius: "10px", padding: "10px", marginBottom: "16px", fontSize: "13px", fontWeight: "700" }}>Total: <span style={{ color: "#FFC300" }}>${formatCOP(confirmCompleteModal.total)}</span></div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setConfirmCompleteModal({ isOpen: false, venta: null, cliente: "", monto1: 0, monto2: 0, total: 0 })} disabled={loading} style={{ flex: 1, padding: "11px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>Cancelar</button>
              <button onClick={async () => { await handlePartialPayment(confirmCompleteModal.monto1, confirmCompleteModal.monto2, partialPaymentModal.evidencia2); setConfirmCompleteModal({ isOpen: false, venta: null, cliente: "", monto1: 0, monto2: 0, total: 0 }); }} disabled={loading} style={{ flex: 1, padding: "11px", background: "#FFC300", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{loading ? "Procesando..." : "Sí, Completar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUITAR COMPROBANTE */}
      {removeEvidencia2Modal && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10005 }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "20px", maxWidth: "360px", width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚠️</div>
            <h3 style={{ color: "#FFC300", fontSize: "16px", fontWeight: "800", marginBottom: "10px" }}>¿Quitar comprobante?</h3>
            <p style={{ color: "#e2e8f0", fontSize: "12px", marginBottom: "16px" }}>¿Eliminar la imagen del segundo comprobante?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setRemoveEvidencia2Modal(false)} style={{ flex: 1, padding: "10px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>Cancelar</button>
              <button onClick={() => { setPartialPaymentModal((p) => ({ ...p, evidencia2: null })); setRemoveEvidencia2Modal(false); }} style={{ flex: 1, padding: "10px", background: "#FFC300", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}>Sí, quitar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR PAGO INCOMPLETO */}
      {confirmCancelPartialModal && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10008 }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "24px", maxWidth: "380px", width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚠️</div>
            <h3 style={{ color: "#FFC300", fontSize: "17px", fontWeight: "800", marginBottom: "10px" }}>¿Cancelar Registro?</h3>
            <p style={{ color: "#fff", fontSize: "12px", marginBottom: "16px" }}>¿Salir y cancelar el registro de pago de <strong style={{ color: "#FFC300" }}>{getClienteNombre(partialPaymentModal.venta)}</strong>?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setConfirmCancelPartialModal(false)} style={{ flex: 1, padding: "10px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>Continuar</button>
              <button onClick={() => { setConfirmCancelPartialModal(false); setPartialPaymentModal({ isOpen: false, venta: null, montoRecibido: "", montoNuevo: "", evidencia2: null }); setAlert({ show: true, message: "📋 Registro cancelado correctamente", type: "success" }); }} style={{ flex: 1, padding: "10px", background: "#FFC300", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}>Sí, Salir</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACEPTAR VENTA */}
      {approveModal.isOpen && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "90%", textAlign: "center" }}>
            <h3 style={{ color: "#FFC300", fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>Aceptar Venta</h3>
            <p style={{ color: "#fff", fontSize: "14px", marginBottom: "16px" }}>¿Confirmar pago y aceptar la venta <strong style={{ color: "#FFC300" }}>#{approveModal.venta?.noVenta || approveModal.venta?.id}</strong> de <strong style={{ color: "#FFC300" }}>{getClienteNombre(approveModal.venta)}</strong>?</p>
            {approveModal.venta?.total && <div style={{ backgroundColor: "rgba(255, 195, 0, 0.08)", border: "1px solid rgba(255, 195, 0, 0.25)", borderRadius: "10px", padding: "10px", marginBottom: "16px", fontSize: "14px", fontWeight: "700" }}>Total: <span style={{ color: "#FFC300" }}>${formatCOP(approveModal.venta.total)}</span></div>}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setApproveModal({ isOpen: false, venta: null })} disabled={loading} style={{ flex: 1, padding: "11px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>Cancelar</button>
              <button onClick={() => updateVentaStatus(availableStatuses[1], "", null, approveModal.venta?.id)} disabled={loading} style={{ flex: 1, padding: "11px", background: "#FFC300", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{loading ? "Confirmando..." : "Sí, Aceptar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECHAZAR VENTA */}
      {rejectModal.isOpen && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10006 }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "24px", maxWidth: "420px", width: "90%", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <h3 style={{ color: "#FFC300", fontSize: "18px", fontWeight: "800", marginBottom: "12px" }}>Rechazar Venta</h3>
            <p style={{ color: "#fff", fontSize: "13px", marginBottom: "6px" }}>¿Rechazar venta de <strong style={{ color: "#FFC300" }}>{getClienteNombre(rejectModal.venta)}</strong> (Venta #<strong>{rejectModal.venta?.noVenta || rejectModal.venta?.id}</strong>)?</p>
            <p style={{ color: "#94a3b8", fontSize: "10px", marginBottom: "14px" }}>📧 Se notificará al cliente por correo.</p>
            
            {/* 1. Comprobante pequeño ENCIMA del campo motivo */}
            <div style={{ marginBottom: "14px", textAlign: "left" }}>
              <label style={{ display: "block", color: "#FFC300", fontSize: "11px", fontWeight: "bold", marginBottom: "5px" }}>
                Comprobante o imagen <span style={{ color: "#94a3b8", fontWeight: "normal", fontSize: "10px" }}>(opcional)</span>
              </label>
              {rejectionEvidence ? (
                <div style={{ 
                  padding: "6px 12px", 
                  borderRadius: "10px", 
                  backgroundColor: "#080e1a", 
                  border: "1.5px solid #FFC300", 
                  boxShadow: "0 2px 10px rgba(255, 195, 0, 0.15)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  gap: "10px"
                }}>
                  <div 
                    onClick={() => openImage(rejectionEvidence)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "zoom-in", flex: 1, minWidth: 0 }}
                  >
                    <img 
                      src={rejectionEvidence} 
                      alt="Evidencia rechazo" 
                      style={{ width: "42px", height: "42px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255, 195, 0, 0.4)" }} 
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "11px", color: "#fff", fontWeight: "700" }}>Imagen adjunta</span>
                      <span style={{ fontSize: "9px", color: "#FFC300", fontWeight: "600" }}>🔍 Clic para ampliar</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setRejectionEvidence(null)} 
                    title="Eliminar imagen" 
                    style={{ 
                      width: "24px", 
                      height: "24px", 
                      background: "rgba(239, 68, 68, 0.9)", 
                      border: "none", 
                      borderRadius: "50%", 
                      color: "#fff", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      cursor: "pointer",
                      flexShrink: 0
                    }}
                  >
                    <FaTimes size={11} />
                  </button>
                </div>
              ) : (
                <label style={{ 
                  backgroundColor: "rgba(255, 195, 0, 0.04)", 
                  border: "1px dashed rgba(255, 195, 0, 0.4)", 
                  color: "#FFC300", 
                  width: "100%", 
                  padding: "8px 12px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  cursor: "pointer", 
                  borderRadius: "8px", 
                  fontWeight: "700", 
                  fontSize: "11px", 
                  boxSizing: "border-box", 
                  transition: "all 0.2s" 
                }}>
                  <FaCamera size={13} />
                  <span>Adjuntar comprobante o foto (opcional)</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setRejectionEvidence(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="display-none" 
                  />
                </label>
              )}
            </div>

            {/* 2. Campo motivo */}
            <div style={{ marginBottom: "16px", textAlign: "left" }}>
              <label style={{ display: "block", color: "#FFC300", fontSize: "11px", fontWeight: "bold", marginBottom: "5px" }}>
                Motivo <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) setMotivoError(false);
                }}
                placeholder="Ej: Comprobante inválido, no se recibió el dinero..."
                disabled={loading}
                style={{ 
                  width: "100%", 
                  padding: "10px 12px", 
                  background: "#0f172a", 
                  border: motivoError ? "1.5px solid #ef4444" : "1px solid #1e293b", 
                  borderRadius: "8px", 
                  color: "#fff", 
                  minHeight: "80px", 
                  outline: "none", 
                  fontSize: "12px", 
                  boxSizing: "border-box" 
                }}
              />
              {motivoError && (
                <span style={{ color: "#ef4444", fontSize: "11px", fontWeight: "600", marginTop: "5px", display: "block", textAlign: "left" }}>
                  Debe poner el motivo
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                type="button"
                onClick={() => {
                  // Si tiene contenido escrito o imagen, preguntar si desea cancelar
                  if (rejectionReason.trim() || rejectionEvidence) {
                    setConfirmAbortRejectModal(true);
                  } else {
                    setRejectModal({ isOpen: false, venta: null });
                    setRejectionReason("");
                    setRejectionEvidence(null);
                    setMotivoError(false);
                  }
                }} 
                disabled={loading} 
                style={{ flex: 1, padding: "11px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  // VALIDACIÓN: Solo abrir confirmación si hay contenido escrito en motivo
                  if (!rejectionReason.trim()) {
                    setMotivoError(true);
                    return;
                  }
                  setMotivoError(false);
                  setConfirmRejectModal({
                    isOpen: true,
                    venta: rejectModal.venta,
                    cliente: getClienteNombre(rejectModal.venta),
                    motivo: rejectionReason.trim(),
                    evidencia: rejectionEvidence,
                  });
                }}
                disabled={loading}
                style={{ flex: 1, padding: "11px", background: "#ef4444", border: "none", color: "#fff", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}
              >
                Rechazar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR SI DESEA CANCELAR (CUANDO TIENE CONTENIDO ESCRITO) */}
      {confirmAbortRejectModal && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10008 }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "24px", maxWidth: "380px", width: "90%", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚠️</div>
            <h3 style={{ color: "#FFC300", fontSize: "18px", fontWeight: "800", marginBottom: "10px" }}>¿Desea cancelar?</h3>
            <p style={{ color: "#fff", fontSize: "13px", marginBottom: "16px" }}>Se perderán los datos y el motivo ingresado. ¿Está seguro de salir sin rechazar la venta?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setConfirmAbortRejectModal(false)} style={{ flex: 1, padding: "10px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>Continuar</button>
              <button 
                onClick={() => {
                  setConfirmAbortRejectModal(false);
                  setRejectModal({ isOpen: false, venta: null });
                  setRejectionReason("");
                  setRejectionEvidence(null);
                  setMotivoError(false);
                }} 
                style={{ flex: 1, padding: "10px", background: "#FFC300", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR RECHAZO */}
      {confirmRejectModal.isOpen && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10007 }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #ef4444", borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 10px 30px rgba(239, 68, 68, 0.25)" }}>
            <div style={{ fontSize: "30px", marginBottom: "8px" }}>⚠️</div>
            <h3 style={{ color: "#ef4444", fontSize: "18px", fontWeight: "800", marginBottom: "10px" }}>¿Confirmar Rechazo?</h3>
            <p style={{ color: "#fff", fontSize: "13px", marginBottom: "12px" }}>¿Está seguro de rechazar la venta de <strong style={{ color: "#FFC300" }}>{confirmRejectModal.cliente}</strong> (Venta #<strong>{confirmRejectModal.venta?.noVenta || confirmRejectModal.venta?.id}</strong>)?</p>
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px", textAlign: "left" }}>
              <span style={{ color: "#ef4444", fontWeight: "700" }}>Motivo:</span> <span style={{ color: "#fff" }}>{confirmRejectModal.motivo}</span>
            </div>
            {confirmRejectModal.evidencia && (
              <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>Comprobante adjunto:</span>
                <div 
                  onClick={() => openImage(confirmRejectModal.evidencia)}
                  style={{ 
                    padding: "6px",
                    borderRadius: "12px", 
                    backgroundColor: "#080e1a", 
                    border: "1.5px solid #FFC300", 
                    boxShadow: "0 4px 16px rgba(255, 195, 0, 0.25)",
                    cursor: "zoom-in",
                    display: "inline-flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "transform 0.15s ease"
                  }}
                  title="Clic para ampliar"
                >
                  <img 
                    src={confirmRejectModal.evidencia} 
                    alt="Comprobante" 
                    style={{ maxHeight: "85px", maxWidth: "150px", borderRadius: "8px", display: "block", objectFit: "contain" }} 
                  />
                  <span style={{ fontSize: "9px", color: "#FFC300", fontWeight: "700", marginTop: "4px" }}>🔍 Clic para ampliar</span>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={() => setConfirmRejectModal({ isOpen: false, venta: null, cliente: "", motivo: "", evidencia: null })} disabled={loading} style={{ flex: 1, padding: "11px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "12px" }}>Volver</button>
              <button
                onClick={() => {
                  updateVentaStatus(availableStatuses[2], confirmRejectModal.motivo, confirmRejectModal.evidencia, confirmRejectModal.venta?.id);
                  setConfirmRejectModal({ isOpen: false, venta: null, cliente: "", motivo: "", evidencia: null });
                  setRejectModal({ isOpen: false, venta: null });
                  setRejectionReason("");
                  setRejectionEvidence(null);
                  setMotivoError(false);
                }}
                disabled={loading}
                style={{ flex: 1, padding: "11px", background: "#ef4444", border: "none", color: "#fff", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "12px" }}
              >
                {loading ? "Rechazando..." : "Sí, Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ANULAR VENTA */}
      {annulModal.isOpen && (
        <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #F5C81B", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "90%", textAlign: "center" }}>
            <h3 style={{ color: "#F5C81B", fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>Anular Venta</h3>
            <p style={{ color: "#fff", fontSize: "14px", marginBottom: "16px" }}>¿Anular venta <strong style={{ color: "#FFC300" }}>#{annulModal.venta?.noVenta || annulModal.venta?.id}</strong> de <strong style={{ color: "#FFC300" }}>{getClienteNombre(annulModal.venta)}</strong>?</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setAnnulModal({ isOpen: false, venta: null })} disabled={loading} style={{ flex: 1, padding: "11px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>Cancelar</button>
              <button onClick={() => updateVentaStatus("Anulada")} disabled={loading} style={{ flex: 1, padding: "11px", background: "#F5C81B", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{loading ? "Anulando..." : "Anular"}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ENVÍO / ENTREGA (AMARILLO) */}
      {sendConfirmModal.isOpen && (() => {
        const target = sendConfirmModal.targetStatus || 'Enviado';
        const v = sendConfirmModal.venta;
        const clienteNom = getClienteNombre(v);
        const totalVenta = v?.total ? formatCOP(v.total) : "0";
        const metodoEntregaTexto = v?.tipoEntrega === 'recoger' ? '🏪 Recogida en local' : '🚚 Envío a domicilio';
        const cantProductos = v?.productos?.length || v?.detalles?.length || 0;
        let title = "Confirmar Envío";
        let statusName = "Enviado";
        let questionText = "¿Marcar pedido ";
        let questionEnd = " como ";
        if (target === 'Por entregar') { title = "Confirmar Preparación"; statusName = "Por entregar"; questionText = "¿Pedido "; questionEnd = " listo para entregar?"; }
        else if (target === 'Entregado') { title = "Confirmar Entrega"; statusName = "Entregado"; questionText = "¿Pedido "; questionEnd = " entregado?"; }
        return (
          <div className="gm-zoom-overlay-admin" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10006 }}>
            <div style={{ backgroundColor: "#0b1220", border: "1.5px solid #FFC300", borderRadius: "16px", padding: "26px 24px", maxWidth: "440px", width: "90%", textAlign: "center", boxShadow: "0 10px 25px -5px rgba(255, 195, 0, 0.15)" }}>
              <h3 style={{ color: "#FFC300", fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>{title}</h3>
              <p style={{ color: "#fff", fontSize: "14px", marginBottom: "16px" }}>{questionText}<strong style={{ color: "#FFC300" }}>#{v?.noVenta || v?.id}</strong>{questionEnd}{target !== 'Por entregar' && target !== 'Entregado' && <span style={{ color: "#FFC300", fontWeight: "800" }}>{statusName}</span>}</p>

              {/* Información detallada de la venta */}
              <div style={{
                backgroundColor: "rgba(255, 195, 0, 0.05)",
                border: "1px solid rgba(255, 195, 0, 0.22)",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                textAlign: "left",
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 195, 0, 0.12)", paddingBottom: "6px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>Cliente:</span>
                  <span style={{ color: "#fff", fontWeight: "700" }}>{clienteNom}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 195, 0, 0.12)", paddingBottom: "6px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>Total venta:</span>
                  <span style={{ color: "#FFC300", fontWeight: "800", fontSize: "13px" }}>${totalVenta}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 195, 0, 0.12)", paddingBottom: "6px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>Método de entrega:</span>
                  <span style={{ color: "#fff", fontWeight: "600" }}>{metodoEntregaTexto}</span>
                </div>
                {v?.tipoEntrega !== "recoger" && v?.direccionEnvio && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", borderBottom: "1px solid rgba(255, 195, 0, 0.12)", paddingBottom: "6px" }}>
                    <span style={{ color: "#94a3b8", fontSize: "11px", flexShrink: 0 }}>Dirección:</span>
                    <span style={{ color: "#38bdf8", fontWeight: "600", textAlign: "right", wordBreak: "break-word" }}>{v.direccionEnvio}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: cantProductos > 0 ? "1px solid rgba(255, 195, 0, 0.12)" : "none", paddingBottom: cantProductos > 0 ? "6px" : "0" }}>
                  <span style={{ color: "#94a3b8", fontSize: "11px" }}>Método de pago:</span>
                  <span style={{ color: "#fff", fontWeight: "600" }}>{v?.metodoPago || "N/A"}</span>
                </div>
                {cantProductos > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#94a3b8", fontSize: "11px" }}>Productos:</span>
                    <span style={{ color: "#cbd5e1", fontWeight: "600" }}>{cantProductos} {cantProductos === 1 ? "ítem" : "ítems"}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => setSendConfirmModal({ isOpen: false, venta: null, targetStatus: null })} style={{ flex: 1, padding: "11px", background: "transparent", border: "1.5px solid rgba(255, 255, 255, 0.2)", color: "#fff", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>Cancelar</button>
                <button onClick={() => { handleEnviarVenta(sendConfirmModal.venta, target); setSendConfirmModal({ isOpen: false, venta: null, targetStatus: null }); }} style={{ flex: 1, padding: "11px", background: "#FFC300", border: "none", color: "#000", fontWeight: "800", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>{loading ? "Procesando..." : "Confirmar"}</button>
              </div>
            </div>
          </div>
        );
      })()}

      {imgModal.open && <AdminExpandedImageModal src={imgModal.src} onClose={() => setImgModal({ open: false, src: "" })} />}

      {/* ✅ MODAL GENERAL DE CONFIRMACIÓN DE BORRADOR */}
      <DraftModal
        isOpen={showDraftModal}
        onClose={closeDraftModal}
        onRestore={restoreDraft}
        onDiscard={discardDraft}
        entityName="venta"
        timestamp={draftMeta?.timestamp}
        extraInfo={draftMeta?.extraInfo}
      />

      <div className="ventas-container">
        <div className="ventas-header">
          <div className="ventas-header-top">
            <div className="header-title-block">
              {(modoVista === "formulario" || modoVista === "detalle") && <button onClick={mostrarLista} className="view-btn-back"><FaArrowLeft size={16} /></button>}
              <div>
                <h1 className="ventas-title">{modoVista === "lista" && "Ventas"}{modoVista === "formulario" && "Registrar Venta"}{modoVista === "detalle" && "Detalles Venta"}</h1>
                <p className="ventas-subtitle">{modoVista === "lista" && "Gestión de ventas"}{modoVista === "formulario" && "Ingrese los datos de la venta"}{modoVista === "detalle" && "Revisión de venta"}</p>
              </div>
            </div>
            {modoVista === "lista" && <button onClick={handleRegisterClick} className="ventas-btn-add">Registrar Venta</button>}
            {modoVista === "detalle" && <button onClick={handleExportPDF} className="compras-btn-pdf" style={{ backgroundColor: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '0 15px', height: '40px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaFilePdf size={14} /> Descargar PDF</button>}
            {modoVista === "formulario" && <button onClick={handleCreateVenta} className="ventas-btn-submit" disabled={loading}>{loading ? "Guardando..." : "Guardar Venta"}</button>}
          </div>
          {modoVista === "lista" && (
            <div className="ventas-controls" style={{ display: "flex", alignItems: "center", marginTop: "5px", marginBottom: "2px" }}>
              <div style={{ flex: 1, marginRight: "20px" }}><SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por cliente o número de venta..." onClear={() => setSearchTerm("")} fullWidth={true} /></div>
              <div className="ventas-filter-container"><StatusFilter filterStatus={filterStatus} statuses={availableStatuses} onFilterSelect={(s) => { setFilterStatus(s); setCurrentPage(1); }} /></div>
            </div>
          )}
        </div>

        {modoVista === "lista" ? (
          <div className="ventas-table-container">
            <div className="ventas-table-wrapper yellow-scrollbar">
              <EntityTable entities={paginatedVentas} columns={columns} loading={loading} onView={mostrarDetalle} onApprove={(v) => setApproveModal({ isOpen: true, venta: v })} onReject={(v) => { setMotivoError(false); setRejectionEvidence(null); setRejectionReason(""); setRejectModal({ isOpen: true, venta: v }); }} onAnular={(v) => setAnnulModal({ isOpen: true, venta: v })} onPartialPago={(v) => setPartialPaymentModal({ isOpen: true, venta: v, montoRecibido: v.montoPagado ? formatCOPInputString(v.montoPagado) : "", montoNuevo: "", evidencia2: v.evidencia2 || null })} onEnviar={(v, targetStatus) => setSendConfirmModal({ isOpen: true, venta: v, targetStatus })} moduleType="ventas" />
            </div>
            <CustomPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filtered.length} showingStart={filtered.length > 0 ? (currentPage - 1) * 7 + 1 : 0} endIndex={Math.min(currentPage * 7, filtered.length)} itemsName="ventas" />
          </div>
        ) : modoVista === "formulario" ? (
          <div className="ventas-form-wrapper yellow-scrollbar">
            <div className="sales-top-row">
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}><FaUser size={14} /> Datos de venta</div>
                <div className="form-data-grid">
                  <div className="form-field-group full-width" style={{ marginBottom: "8px" }}>
                    <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800" }}>Cliente : <span className="required">*</span></label>
                    <SearchSelect options={availableCustomers} selectedItem={availableCustomers.find((c) => String(c.id) === String(nuevaVenta.idCliente))} onSelect={(client) => { const id = client?.id || ""; actualizarProducto(-1, "idCliente", id); if (client?.direccion) actualizarProducto(-1, "direccionEnvio", client.direccion); }} placeholder="Buscar por nombre, documento o correo..." error={errors.idCliente} filterFn={(c, term) => { const t = term.toLowerCase(); return (c.nombre || "").toLowerCase().includes(t) || (c.num_documento || "").toLowerCase().includes(t) || (c.correo || "").toLowerCase().includes(t); }} renderOption={(c) => (<div style={{ display: "flex", flexDirection: "column", gap: "2px" }}><span style={{ fontWeight: 700, color: "#fff", fontSize: "14px" }}>{c.nombre || "Sin nombre"}</span><span style={{ fontSize: "11px", color: "#94a3b8" }}>Doc: {c.num_documento || "N/A"} • {c.correo || "S/C"}</span></div>)} />
                  </div>
                  <div className="form-data-grid three-columns">
                    <div className="form-field-group">
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800" }}>Método de pago : <span className="required">*</span></label>
                      <select value={nuevaVenta.metodoPago || ""} onChange={(e) => actualizarProducto(-1, "metodoPago", e.target.value)} className={`form-input-main ${errors.metodoPago ? "has-error" : ""}`}><option value="" disabled hidden>Seleccionar...</option>{["Efectivo", "Bancolombia", "Nequi", "Bold"].map((m) => (<option key={m} value={m}>{m}</option>))}</select>
                    </div>
                    <div className="form-field-group">
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800" }}>Tipo de entrega : <span className="required">*</span></label>
                      <select value={nuevaVenta.tipoEntrega || ""} onChange={(e) => actualizarProducto(-1, "tipoEntrega", e.target.value)} className={`form-input-main ${errors.tipoEntrega ? "has-error" : ""}`}><option value="" disabled hidden>Seleccionar...</option><option value="envio"> Envío a domicilio</option><option value="recoger">🏪 Recoger en local</option></select>
                    </div>
                    <div className="form-field-group">
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800" }}>Fecha : <span className="required">*</span></label>
                      <DateInputWithCalendar value={nuevaVenta.fecha} onChange={(d) => actualizarProducto(-1, "fecha", d)} className={`ventas-date-input ${errors.fecha ? "has-error" : ""}`} />
                      {errors.fecha && typeof errors.fecha === 'string' && <div className="error-text" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.fecha}</div>}
                    </div>
                  </div>
                  {nuevaVenta.tipoEntrega === "envio" && (
                    <div className="form-field-group full-width">
                      <label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800" }}>Dirección de envío : <span className="required">*</span></label>
                      <input type="text" value={nuevaVenta.direccionEnvio || ""} onChange={(e) => actualizarProducto(-1, "direccionEnvio", e.target.value)} placeholder="Calle 123 # 45-67..." className={`form-input-main ${errors.direccionEnvio ? "has-error" : ""}`} />
                    </div>
                  )}
                </div>
              </div>
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}><FaCamera size={14} /> Comprobante de pago{requiresReceipt(nuevaVenta.metodoPago) && <span className="required"> *</span>}</div>
                <div className={`evidence-dropzone ${errors.evidencia ? "has-error" : ""}`}>
                  {nuevaVenta.evidencia ? (<><img src={nuevaVenta.evidencia} alt="Comprobante" className="evidence-preview-img" /><button onClick={() => actualizarProducto(-1, "evidencia", null)} className="btn-remove-evidence"><FaTrash size={12} /></button></>) : (
                    <div className="evidence-empty-v">
                      <FaImage size={48} color="#334155" className="mb-10" />
                      <p className="evidence-desc" style={{ marginTop: "15px" }}>{requiresReceipt(nuevaVenta.metodoPago) ? "Ingrese el formato de la imagen aquí" : "No se requiere comprobante"}</p>
                      {requiresReceipt(nuevaVenta.metodoPago) && <label className="btn-select-evidence">SELECCIONAR ARCHIVO<input type="file" accept="image/*" onChange={handleImageUpload} className="display-none" /></label>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="venta-form-card full-width-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "20px" }}>
                <div className="section-title" style={{ marginBottom: 0, color: "#8F9DB1", fontWeight: "800" }}><FaBoxOpen size={14} /> Productos</div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px" }}>
                  <button onClick={agregarProducto} className="btn-add-row-yellow"><FaPlus size={10} /> AGREGAR</button>
                  <div className="total-summary" style={{ marginTop: 0 }}><span className="total-label" style={{ fontSize: "12px" }}>Subtotal:</span><span className="total-value" style={{ fontSize: "18px", color: "#F5C81B" }}>${calcularTotal().toLocaleString("es-CO")}</span></div>
                </div>
              </div>
              <div className="products-table-header" style={{ gridTemplateColumns: "22px 1fr 110px 110px 40px", gap: "12px" }}>
                <span className="header-label">#</span>
                <span className="header-label">Producto / Variantes</span>
                <span className="header-label" style={{ textAlign: "center" }}>Precio</span>
                <span className="header-label" style={{ textAlign: "center", color: "#00f2ff" }}>Subtotal</span>
                <span></span>
              </div>
              <div className="products-list-scroll">
                {nuevaVenta.productos.map((p, i) => (<ProductoForm key={p._tempKey} producto={p} index={i} onChange={actualizarProducto} onRemove={eliminarProducto} isFirst={i === 0} availableProducts={availableProducts} availableSizes={availableSizes} errors={errors} />))}
              </div>
            </div>
          </div>
        ) : (
          <div className="ventas-detail-wrapper yellow-scrollbar">
            <div className="sales-top-row">
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}><FaUser size={14} /> Datos de venta</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>No. de venta</label><div className="product-input disabled important">{ventaViendo?.noVenta || ventaViendo?.id}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Cliente</label><div className="product-input disabled">{typeof ventaViendo?.cliente === "object" ? ventaViendo?.cliente?.nombre : ventaViendo?.cliente}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Método de pago</label><div className="product-input disabled">{ventaViendo?.metodoPago}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Método de entrega</label><div className="product-input disabled">{ventaViendo?.tipoEntrega === "recoger" ? "🏪 Recogida local" : "🚚 Domicilio"}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Fecha</label><div className="product-input disabled">{ventaViendo?.fecha}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Total</label><div className="product-input disabled success" style={{ fontWeight: 800 }}>${Number(ventaViendo?.total || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Estado Envío</label><div className="product-input disabled" style={{ color: "#38bdf8", fontWeight: "800" }}>{ventaViendo?.statusenvio || (ventaViendo?.tipoEntrega === 'recoger' ? "Preparando" : "Por enviar")}</div></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}><label className="form-label" style={{ color: "#8F9DB1", fontWeight: "800", fontSize: "0.85rem" }}>Dirección de envío</label><div className="product-input disabled address-highlight" style={{ textAlign: "left", padding: "10px 16px" }}>{ventaViendo?.direccionEnvio || "N/A"}</div></div>
              </div>
              <div className="venta-form-card">
                <div className="section-title" style={{ color: "#8F9DB1" }}><FaCamera size={14} /> Comprobante(s) de pago</div>
                {ventaViendo?.estado === "Pago Incompleto" && <div className="partial-balance-banner"><FaExclamationTriangle /><span>FALTAN ${formatCOP(ventaViendo.total - (ventaViendo.montoPagado || 0))}</span></div>}
                <div className="gm-receipt-container-premium-admin multiple">
                  {ventaViendo?.evidencia && <div className="gm-receipt-wrapper-premium-admin" onClick={() => openImage(ventaViendo.evidencia)}><img src={ventaViendo.evidencia} alt="Comprobante 1" className="gm-receipt-img-premium-admin" /><div className="gm-receipt-overlay-premium-admin">Pago 1</div></div>}
                  {ventaViendo?.evidencia2 && <div className="gm-receipt-wrapper-premium-admin" onClick={() => openImage(ventaViendo.evidencia2)}><img src={ventaViendo.evidencia2} alt="Comprobante 2" className="gm-receipt-img-premium-admin" /><div className="gm-receipt-overlay-premium-admin">Pago 2</div></div>}
                  {!ventaViendo?.evidencia && !ventaViendo?.evidencia2 && <div className="evidence-empty-v-admin"><FaCamera size={32} style={{ marginBottom: "10px", opacity: 0.3 }} /><span>Sin comprobantes</span></div>}
                </div>
              </div>
            </div>
            <div className="venta-form-card full-width-card" style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <div className="section-title" style={{ marginBottom: 0, color: "#8F9DB1", fontWeight: "800" }}><FaBoxOpen size={14} /> Productos adquiridos</div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><span style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>ESTADO:</span><StatusPill status={ventaViendo?.estado} /></div>
                  <div style={{ width: "250px" }}><SearchInput value={detailSearch} onChange={setDetailSearch} placeholder="Buscar producto..." onClear={() => setDetailSearch("")} /></div>
                </div>
              </div>
              <div className="products-table-header products-table-header-view" style={{ gridTemplateColumns: "40px 1fr 140px 140px", gap: "12px" }}>
                <span className="header-label" style={{ textAlign: "center" }}>#</span>
                <span className="header-label">PRODUCTO / TALLAS</span>
                <span className="header-label" style={{ textAlign: "center" }}>PRECIO UNI.</span>
                <span className="header-label important" style={{ textAlign: "center", color: "#FFC107" }}>SUBTOTAL</span>
              </div>
              <div className="products-list-scroll">
                {(groupedProductsViendo || []).filter((p) => p.nombre?.toLowerCase().includes(detailSearch.toLowerCase())).map((p, i) => (<ProductoForm key={i} index={i} producto={p} isViewMode={true} />))}
              </div>
              <div className="detail-footer-actions" style={{ marginTop: "10px", borderTop: "none" }}>
                {(ventaViendo?.estado === availableStatuses[2] || ventaViendo?.estado?.toLowerCase().includes("rechaz")) && <div className="status-motivo-banner"><span className="motivo-label">MOTIVO DE RECHAZO:</span><p className="motivo-text">{ventaViendo?.motivoRechazo || "No especificado."}</p></div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VentasPage;