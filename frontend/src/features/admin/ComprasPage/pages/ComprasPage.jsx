/* === PÁGINA PRINCIPAL ===
   Este componente es la interfaz visual principal del módulo de Compras.
   Muestra el listado de compras con filtros, barra de búsqueda (SearchInput) y paginación.
   Utiliza un Hook (useComprasLogic) para encapsular la lógica del negocio.
   Delega la renderización de las sub-vistas a componentes hijos especializados para mantener el código compacto:
   - CompraForm: Formulario para registrar o editar una compra.
   - CompraDetail: Ficha de vista de detalles de una compra seleccionada.
   - CompraModals: Diálogos de confirmación para completar o anular una compra. */

import '../style/index.css';
import '../../../shared/styles/ConfirmDeleteModal.css';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useLocation } from 'react-router-dom';
import {
  Alert, EntityTable, SearchInput, CustomPagination,
  StatusPill
} from '../../../shared/services';
import StatusFilter from '../components/StatusFilter';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';
import { useComprasLogic } from '../hooks/useComprasLogic';

// Componentes locales refacturados
import CompraModals from '../components/CompraModals';
import CompraForm from '../components/CompraForm';
import CompraDetail from '../components/CompraDetail';

const ComprasPage = () => {
  const location = useLocation();
  const [detalleSearch, setDetalleSearch] = useState('');
  
  const { modoVista, searchTerm, setSearchTerm, filterStatus, setFilterStatus, currentPage, setCurrentPage, itemsPerPage, alert, setAlert, errors, compraViendo, compraEditando, completarModal, setCompletarModal, annulModal, setAnnulModal, handleAnularCompra, nuevaCompra, setNuevaCompra, availableStatuses, availablePaymentMethods, availableSizes, proveedoresActivos, mostrarLista, mostrarFormulario, mostrarDetalle, agregarProducto, actualizarProducto, eliminarProducto, calcularTotal, handleSubmit, handleCompletarCompra, confirmCompletarCompra, filtered, loading, actionLoading, actionLoadingText, availableProducts, isLoadingProducts, handleInputChange, handleDateChange } = useComprasLogic(location);

  const columns = [
    { 
      header: 'N° Factura', 
      field: 'nfactura', 
      width: '160px', 
      render: (item) => <span style={{ fontWeight: '600' }}>{item.nfactura || item.numCompra || '-'}</span> 
    },
    { 
      header: 'Proveedor',
      field: 'proveedor', 
      width: '200px', 
      render: (item) => <span style={{ fontWeight: '600' }}>{item.proveedor}</span> 
    },
    { 
      header: 'Fecha',    
      field: 'fecha',     
      width: '100px', 
      render: (item) => <span>{item.fecha}</span> 
    },
    { 
      header: 'Total',    
      field: 'total',     
      width: '120px', 
      render: (item) => <span style={{ color: '#10B981', fontWeight: '700', fontSize: '14px' }}>${Number(item.total).toLocaleString('es-CO')}</span> 
    },
    { 
      header: 'Estado',   
      field: 'estado',    
      width: '110px', 
      render: (item) => <StatusPill status={item.estado} /> 
    }
  ];

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const exportCompraToPDF = (compra) => {
    if (!compra) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    const displayedNum = compra.nfactura || compra.numCompra || '-';

    // Header - Left aligned Name, Right aligned Number
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("Gorras medellín", 20, 25);
    
    doc.setFontSize(14);
    doc.text(`NUMERO COMP: ${displayedNum}`, 190, 25, { align: 'right' });

    // Purchase Data (Left)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("Datos de la compra:", 20, 50);
    
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    
    const drawLine = (label, value, x, y) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, x, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), x + labelWidth, y);
    };

    drawLine("Fecha Compra: ", compra.fecha || '', 20, 57);
    if (compra.fechaRegistro && compra.fechaRegistro !== '-') {
      drawLine("Fecha Registro: ", compra.fechaRegistro, 20, 62);
      drawLine("Proveedor: ", toTitleCase(String(compra.proveedor || '-')), 20, 67);
      drawLine("Método de Pago: ", compra.metodo || 'N/A', 20, 72);
    } else {
      drawLine("Proveedor: ", toTitleCase(String(compra.proveedor || '-')), 20, 62);
      drawLine("Método de Pago: ", compra.metodo || 'N/A', 20, 67);
    }

    // TOTAL FRONT OF PURCHASE DATA (Right side)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Total compra:", 190, 52, { align: 'right' });
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text(`$${Number(compra.total || 0).toLocaleString('es-CO')}`, 190, 63, { align: 'right' });

    // Table Header - Black background
    const tableTop = 80;
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

    const flatProducts = [];
    (compra.productos || []).forEach(p => {
      const vars = p.variantes && p.variantes.length > 0
        ? p.variantes
        : [{ talla: p.talla || '-', cantidad: p.cantidad || 0 }];
      
      vars.forEach(v => {
        flatProducts.push({
          nombre: p.nombre,
          talla: v.talla || '-',
          cantidad: parseInt(v.cantidad) || 0,
          precioCompra: p.precioCompra
        });
      });
    });

    const mergedProducts = flatProducts.reduce((acc, p) => {
      const existing = acc.find(item => item.nombre === p.nombre && item.talla === p.talla);
      if (existing) {
        existing.cantidad += p.cantidad;
      } else {
        acc.push({
          nombre: p.nombre,
          talla: p.talla,
          cantidad: p.cantidad,
          precioCompra: p.precioCompra
        });
      }
      return acc;
    }, []).sort((a, b) => a.nombre.localeCompare(b.nombre));

    // Table Rows
    let yPosItems = tableTop + 14;
    doc.setTextColor(0, 0, 0);
    const cols = [15, 28, 90, 115, 140, 168, 195];
    let currentPageTableTop = tableTop;

    mergedProducts.forEach((item, idx) => {
      if (yPosItems > 260) {
        // Draw the bottom line and vertical lines of the table for the current page before adding a new page
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        const pageTableBottom = yPosItems - 8 + 2.5;
        doc.line(15, pageTableBottom, 195, pageTableBottom);

        cols.forEach(colX => {
          if (colX === 15 || colX === 195) {
            doc.line(colX, currentPageTableTop, colX, pageTableBottom);
          } else {
            doc.line(colX, currentPageTableTop + 8, colX, pageTableBottom);
          }
        });

        doc.addPage();
        currentPageTableTop = 10;
        
        // Draw header on new page
        doc.setFillColor(0, 0, 0); 
        doc.rect(15, 10, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Item", 20, 10 + 5.5);
        doc.text("Producto", 32, 10 + 5.5);
        doc.text("Talla", 95, 10 + 5.5);
        doc.text("Cantidad", 120, 10 + 5.5);
        doc.text("Precio", 145, 10 + 5.5);
        doc.text("Total", 175, 10 + 5.5);
        
        doc.setTextColor(0, 0, 0);
        yPosItems = 10 + 14;
      }
      
      const price = parseFloat(item.precioCompra || 0);
      const qty = parseInt(item.cantidad) || 0;
      const subtotal = price * qty;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(String(idx + 1), 20, yPosItems);
      
      const displayName = toTitleCase(String(item.nombre || '')).length > 30 
        ? toTitleCase(String(item.nombre || '')).substring(0, 30) + "..." 
        : toTitleCase(String(item.nombre || ''));
      doc.text(displayName, 32, yPosItems);
      doc.text(String(item.talla || '-'), 95, yPosItems);
      doc.text(String(qty), 120, yPosItems);
      doc.text(`$${price.toLocaleString("es-CO")}`, 145, yPosItems);
      doc.text(`$${subtotal.toLocaleString("es-CO")}`, 175, yPosItems);
      
      // Draw thin gray horizontal line under each row
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(15, yPosItems + 2.5, 195, yPosItems + 2.5);
      
      yPosItems += 8;
    });

    const tableBottom = yPosItems - 8 + 2.5;

    // Draw final page vertical lines
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    cols.forEach(colX => {
      if (colX === 15 || colX === 195) {
        doc.line(colX, currentPageTableTop, colX, tableBottom);
      } else {
        doc.line(colX, currentPageTableTop + 8, colX, tableBottom);
      }
    });

    // FOOTER CORPORATIVO
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "GORRAS MEDELLÍN - Tu estilo, nuestra pasión",
      105,
      pageHeight - 18,
      { align: "center" },
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Alfonzo López - Medellin | WhatsApp: +57 300 6158180",
      105,
      pageHeight - 13,
      { align: "center" },
    );
    doc.text(
      "Email: duvann1991@gmail.com | Instagram: @gorrasmedellin",
      105,
      pageHeight - 8,
      { align: "center" },
    );

    doc.save(`Compra_${displayedNum}_GM_CAPS.pdf`);
  };

  return (
    <>
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="compras-container">
        <div className="compras-header">
          <div className="compras-header-top">
            <div className="compras-header-left">
              {modoVista !== "lista" && (
                <button onClick={mostrarLista} className="compras-btn-back">
                  <FaArrowLeft size={16} />
                </button>
              )}
              <div>
                <h1 className="compras-title">
                  {modoVista === "formulario" && (compraEditando ? "Editar Compra" : "Registrar Compra")}
                  {modoVista === "detalle" && "Detalle de Compra"}
                  {modoVista === "lista" && "Compras"}
                </h1>
                <p className="compras-subtitle">Gestiona y haz seguimiento de tus órdenes</p>
              </div>
            </div>

            {modoVista === "detalle" && (
              <button
                onClick={() => exportCompraToPDF(compraViendo)}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  padding: '0 15px',
                  height: '40px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FaFilePdf size={14} /> Descargar PDF
              </button>
            )}
            {modoVista === "lista" && (
              <button onClick={() => mostrarFormulario()} className="compras-btn-register">
                Registrar Compra
              </button>
            )}
            {modoVista === "formulario" && (
              <button 
                onClick={handleSubmit} 
                className={`compras-btn-submit ${actionLoading ? 'loading' : ''}`}
                disabled={actionLoading}
              >
                {actionLoading ? actionLoadingText : (compraEditando ? 'Actualizar Compra' : 'Registrar Compra')}
              </button>
            )}
          </div>

          {modoVista === "lista" && (
            <div className="compras-search-bar">
              <div className="devoluciones-search-wrapper">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar proveedor..."
                  onClear={() => setSearchTerm('')}
                  fullWidth={true}
                />
              </div>
              <div className="compras-filters">
                <StatusFilter 
                  filterStatus={filterStatus} 
                  onFilterSelect={setFilterStatus} 
                  statuses={availableStatuses}
                />
              </div>
            </div>
          )}
        </div>

        {modoVista === "lista" ? (
          <div className="compras-main-content">
            <div style={{ flex: '0 0 auto' }}>
              <EntityTable
                entities={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                columns={columns}
                onView={mostrarDetalle}
                onComplete={handleCompletarCompra}
                onAnular={v => setAnnulModal({ isOpen: true, compra: v })}
                moduleType="compras"
                loading={loading}
                className="compras-entity-table"
              />
            </div>

            <CustomPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / itemsPerPage) || 1}
              onPageChange={setCurrentPage}
              totalItems={filtered.length}
              showingStart={filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              endIndex={Math.min(currentPage * itemsPerPage, filtered.length)}
              itemsName="compras"
            />
          </div>
        ) : modoVista === "formulario" ? (
          <CompraForm
            nuevaCompra={nuevaCompra}
            setNuevaCompra={setNuevaCompra}
            errors={errors}
            proveedoresActivos={proveedoresActivos}
            availablePaymentMethods={availablePaymentMethods}
            availableSizes={availableSizes}
            availableProducts={availableProducts}
            isLoadingProducts={isLoadingProducts}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            calcularTotal={calcularTotal}
            agregarProducto={agregarProducto}
            actualizarProducto={actualizarProducto}
            eliminarProducto={eliminarProducto}
            detalleSearch={detalleSearch}
            setDetalleSearch={setDetalleSearch}
          />
        ) : (
          <CompraDetail
            compraViendo={compraViendo}
            detalleSearch={detalleSearch}
            setDetalleSearch={setDetalleSearch}
          />
        )}
      </div>

      <CompraModals
        completarModal={completarModal}
        setCompletarModal={setCompletarModal}
        annulModal={annulModal}
        setAnnulModal={setAnnulModal}
        confirmCompletarCompra={confirmCompletarCompra}
        handleAnularCompra={handleAnularCompra}
        actionLoading={actionLoading}
      />
    </>
  );
};

export default ComprasPage;