import '../style/index.css';
import React, { useState, useRef, useEffect } from 'react';
import { EntityTable, Alert, SearchInput, UniversalModal, ConfirmDeleteModal, CustomPagination, StatusPill } from '../../../shared/services';
import ConfirmModal from '../../../shared/components/admin/ConfirmModal';
import { useClientesLogic } from '../hooks/useClientesLogic';
import { StatusFilter } from '../components/StatusFilter';
import { ClienteFormFields } from '../components/ClienteFormFields';
import {
  FaExclamationTriangle, FaEnvelope, FaTimesCircle, FaClock,
  FaCheck, FaTimes, FaHistory, FaBell, FaTrash, FaPowerOff
} from 'react-icons/fa';
import {
  getSolicitudesPendientes,
  getHistorialCorreos,
  approveDeactivation,
  rejectDeactivation,
  approveDeletion,
  rejectDeletion
} from '../services/clientesApi';

const columns = [
  { header: 'N° Documento', field: 'numeroDocumento', width: '140px' },
  { header: 'Nombre', field: 'nombreCompleto', width: '180px' },
  { header: 'Email', field: 'email', width: '230px' },
  { header: 'Teléfono', field: 'telefono', width: '130px' },
  {
    header: 'Estado',
    field: 'isActive',
    width: '120px',
    render: (item) => (
      <StatusPill status={item.isActive === true || item.isActive === 1 || item.isActive === 'true'} />
    )
  }
];

const ClientesPage = () => {
  const {
    searchTerm, setSearchTerm, filterStatus, alert, setAlert,
    modalState, formData, errors, deleteModal, firstInputRef, filtered, loading,
    currentPage, setCurrentPage, totalPages, paginatedClientes, showingStart, endIndex,
    handleFilterSelect, openModal, closeModal, handleInputChange, handleSave,
    openDeleteModal, closeDeleteModal, handleDelete, handleToggleStatus
  } = useClientesLogic();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showSolicitudesModal, setShowSolicitudesModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [historialCorreos, setHistorialCorreos] = useState([]);
  const [processingRequest, setProcessingRequest] = useState(null);
  const initialFormRef = useRef(null);

  useEffect(() => {
    if (modalState.isOpen && modalState.mode !== 'view') {
      initialFormRef.current = JSON.stringify(formData);
    } else {
      initialFormRef.current = null;
    }
  }, [modalState.isOpen, modalState.mode, formData]);

  // Cargar solicitudes y historial al montar
  useEffect(() => {
    loadSolicitudes();
    loadHistorial();
    const interval = setInterval(() => {
      loadSolicitudes();
      loadHistorial();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSolicitudes = async () => {
    try {
      const solicitudes = await getSolicitudesPendientes();
      setSolicitudesPendientes(solicitudes || []);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
    }
  };

  const loadHistorial = async () => {
    try {
      const historial = await getHistorialCorreos();
      setHistorialCorreos(historial || []);
    } catch (error) {
      console.error('Error loading historial:', error);
    }
  };

  const hasFormChanges = () => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(formData) !== initialFormRef.current;
  };

  const handleTryCancelModal = () => {
    if (hasFormChanges()) {
      setShowCancelConfirm(true);
    } else {
      closeModal();
    }
  };

  const handleConfirmExit = () => {
    setShowCancelConfirm(false);
    closeModal();
  };

  // ✅ Manejar aprobación de desactivación
  const handleApproveDeactivation = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const result = await approveDeactivation(requestId);
      if (result.success) {
        setAlert({ show: true, message: result.message, type: 'success' });
        loadSolicitudes();
        loadHistorial();
      }
    } catch (error) {
      setAlert({ show: true, message: 'Error al aprobar desactivación', type: 'error' });
    } finally {
      setProcessingRequest(null);
    }
  };

  // ✅ Manejar rechazo de desactivación
  const handleRejectDeactivation = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const result = await rejectDeactivation(requestId);
      if (result.success) {
        setAlert({ show: true, message: result.message, type: 'success' });
        loadSolicitudes();
      }
    } catch (error) {
      setAlert({ show: true, message: 'Error al rechazar desactivación', type: 'error' });
    } finally {
      setProcessingRequest(null);
    }
  };

  // ✅ Manejar aprobación de eliminación
  const handleApproveDeletion = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const result = await approveDeletion(requestId);
      if (result.success) {
        setAlert({ show: true, message: result.message, type: 'success' });
        loadSolicitudes();
        loadHistorial();
      }
    } catch (error) {
      setAlert({ show: true, message: 'Error al aprobar eliminación', type: 'error' });
    } finally {
      setProcessingRequest(null);
    }
  };

  // ✅ Manejar rechazo de eliminación
  const handleRejectDeletion = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const result = await rejectDeletion(requestId);
      if (result.success) {
        setAlert({ show: true, message: result.message, type: 'success' });
        loadSolicitudes();
      }
    } catch (error) {
      setAlert({ show: true, message: 'Error al rechazar eliminación', type: 'error' });
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <>
      {alert.show && (
        <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ show: false, message: '', type: 'success' })} />
      )}

      <div className="clientes-container">
        <div className="clientes-header">
          <div className="clientes-header-top">
            <div>
              <h1 className="clientes-title">Clientes</h1>
              <p className="clientes-subtitle">Gestión de clientes registrados</p>
            </div>
            <div className="clientes-actions" style={{ display: 'flex', gap: '10px' }}>
              {/* ✅ Botón de historial de correos */}
              <button
                onClick={() => setShowHistorialModal(true)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <FaHistory size={14} />
                <span>Historial de Correos</span>
                {historialCorreos.length > 0 && (
                  <span style={{
                    background: '#10B981',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {historialCorreos.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => openModal("create")}
                className="clientes-btn-register"
              >
                Registrar Cliente
              </button>
            </div>
          </div>
          <div className="clientes-search-bar">
            <div className="clientes-search-container">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por documento, nombre, email o ciudad..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} handleFilterSelect={handleFilterSelect} />
          </div>
        </div>

        {/* ✅ Icono de solicitudes pendientes (flotante) */}
        {solicitudesPendientes.length > 0 && (
          <button
            onClick={() => setShowSolicitudesModal(true)}
            style={{
              position: 'fixed',
              top: '80px',
              right: '20px',
              background: '#FFC107',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1000,
              boxShadow: '0 4px 16px rgba(255,193,7,0.4)',
              border: 'none',
              animation: 'pulse 2s infinite'
            }}
            title={`${solicitudesPendientes.length} solicitud(es) pendiente(s)`}
          >
            <FaBell size={24} color="#000" />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {solicitudesPendientes.length}
            </span>
          </button>
        )}

        <div className="clientes-main-content">
          <div className="clientes-table-wrapper">
            <EntityTable
              entities={paginatedClientes}
              columns={columns}
              onView={c => openModal('view', c)}
              onEdit={c => openModal('edit', c)}
              onDelete={openDeleteModal}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              showDeleteButton={true}
              loading={loading}
              moduleType="clientes"
              estadoField="isActive"
            />
          </div>
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            showingStart={showingStart}
            endIndex={endIndex}
            itemsName="clientes"
          />
        </div>
      </div>

      {/* MODAL DE SOLICITUDES PENDIENTES - Tema azul modesto */}
      {showSolicitudesModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowSolicitudesModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: '10px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(30,58,138,0.18)',
            border: '1px solid #bfdbfe'
          }} onClick={e => e.stopPropagation()}>
            {/* Header azul */}
            <div style={{
              background: '#1e3a8a',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaBell size={16} color="#93c5fd" />
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                    Solicitudes Pendientes
                  </h3>
                  <p style={{ margin: '2px 0 0 0', color: '#93c5fd', fontSize: '12px' }}>
                    {solicitudesPendientes.length} solicitud(es) esperando aprobación
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSolicitudesModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: '4px' }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '18px', overflowY: 'auto', maxHeight: 'calc(80vh - 130px)' }}>
              {solicitudesPendientes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 20px', color: '#6b7280' }}>
                  <FaCheck size={36} style={{ color: '#2563eb', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>No hay solicitudes pendientes</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {solicitudesPendientes.map((sol) => (
                    <div key={sol.id} style={{
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '14px',
                      background: '#f0f7ff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        {sol.tipo === 'eliminacion' ? (
                          <FaTrash size={14} color="#dc2626" />
                        ) : (
                          <FaPowerOff size={14} color="#2563eb" />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '14px', fontWeight: '600' }}>
                            {sol.tipo === 'eliminacion' ? 'Eliminación de Cuenta' : 'Desactivación de Cuenta'}
                          </h4>
                          <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                            Solicitado por: {sol.adminEmail}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        <div>
                          <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>CLIENTE</p>
                          <p style={{ margin: 0, color: '#1e3a8a', fontSize: '13px', fontWeight: '600' }}>{sol.clienteNombre}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>EMAIL</p>
                          <p style={{ margin: 0, color: '#374151', fontSize: '12px' }}>{sol.clienteEmail}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>COMPRAS ACTIVAS</p>
                          <p style={{ margin: 0, color: '#dc2626', fontSize: '13px', fontWeight: '700' }}>{sol.ventasActivas}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px 0', color: '#6b7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>FECHA SOLICITUD</p>
                          <p style={{ margin: 0, color: '#374151', fontSize: '12px' }}>
                            {new Date(sol.fecha).toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => sol.tipo === 'eliminacion' ? handleRejectDeletion(sol.id) : handleRejectDeactivation(sol.id)}
                          disabled={processingRequest === sol.id}
                          style={{
                            background: '#fff',
                            border: '1px solid #bfdbfe',
                            color: '#374151',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <FaTimes size={11} />
                          Rechazar
                        </button>
                        <button
                          onClick={() => sol.tipo === 'eliminacion' ? handleApproveDeletion(sol.id) : handleApproveDeactivation(sol.id)}
                          disabled={processingRequest === sol.id}
                          style={{
                            background: sol.tipo === 'eliminacion' ? '#dc2626' : '#1d4ed8',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: processingRequest === sol.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            opacity: processingRequest === sol.id ? 0.6 : 1
                          }}
                        >
                          <FaCheck size={11} />
                          {processingRequest === sol.id ? 'Procesando...' : 'Aprobar y Notificar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid #bfdbfe',
              background: '#eff6ff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <p style={{ margin: 0, color: '#3b82f6', fontSize: '11px' }}>
                ℹ️ Se enviará correo o SMS según los datos del cliente
              </p>
              <button
                onClick={() => setShowSolicitudesModal(false)}
                style={{
                  background: '#1e3a8a',
                  border: 'none',
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL DE CORREOS - Tema azul modesto */}
      {showHistorialModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowHistorialModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: '10px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(30,58,138,0.18)',
            border: '1px solid #bfdbfe'
          }} onClick={e => e.stopPropagation()}>
            {/* Header azul */}
            <div style={{
              background: '#1e3a8a',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaHistory size={16} color="#93c5fd" />
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                    Historial de Correos Enviados
                  </h3>
                  <p style={{ margin: '2px 0 0 0', color: '#93c5fd', fontSize: '12px' }}>
                    Trazabilidad de desactivaciones y eliminaciones
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistorialModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: '4px' }}
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Body - Tabla */}
            <div style={{ padding: '18px', overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}>
              {historialCorreos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <FaEnvelope size={40} style={{ color: '#93c5fd', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontSize: '14px' }}>No hay correos enviados aún</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#eff6ff', borderBottom: '2px solid #bfdbfe' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#1e40af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Tipo</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#1e40af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Cliente</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#1e40af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Contacto</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#1e40af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Notificado por</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#1e40af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Fecha</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', color: '#1e40af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialCorreos.map((hist) => (
                      <tr key={hist.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: hist.tipo === 'eliminacion' ? '#fee2e2' : '#dbeafe',
                            color: hist.tipo === 'eliminacion' ? '#dc2626' : '#1d4ed8'
                          }}>
                            {hist.tipo === 'eliminacion' ? <FaTrash size={9} /> : <FaPowerOff size={9} />}
                            {hist.tipo === 'eliminacion' ? 'Eliminación' : 'Desactivación'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#1e3a8a', fontSize: '13px', fontWeight: '600' }}>{hist.clienteNombre}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ color: '#374151', fontSize: '12px' }}>{hist.clienteEmail || '—'}</div>
                          {hist.clienteTelefono && hist.clienteTelefono !== '(sin teléfono)' && (
                            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>📱 {hist.clienteTelefono}</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: hist.notifMethod === 'correo' ? '#dbeafe'
                              : hist.notifMethod === 'sms' ? '#d1fae5'
                              : '#fee2e2',
                            color: hist.notifMethod === 'correo' ? '#1d4ed8'
                              : hist.notifMethod === 'sms' ? '#065f46'
                              : '#dc2626'
                          }}>
                            {hist.notifMethod === 'correo' ? '✉️ Correo' : hist.notifMethod === 'sms' ? '📱 SMS' : '✗ Ninguno'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: '12px' }}>
                          {new Date(hist.fecha).toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: hist.estado === 'enviado' ? '#d1fae5' : '#fee2e2',
                            color: hist.estado === 'enviado' ? '#065f46' : '#dc2626'
                          }}>
                            {hist.estado === 'enviado' ? <FaCheck size={9} /> : <FaTimes size={9} />}
                            {hist.estado === 'enviado' ? 'Enviado' : 'Fallido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 18px',
              borderTop: '1px solid #bfdbfe',
              background: '#eff6ff',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowHistorialModal(false)}
                style={{
                  background: '#1e3a8a',
                  border: 'none',
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN AL CANCELAR */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmExit}
        title="¿Desea cancelar?"
        message="Se perderán los datos del cliente ingresados. ¿Está seguro de salir sin guardar?"
        confirmText="Sí, Salir"
        cancelText="Continuar"
        type="warning"
      />

      {/* MODAL DE FORMULARIO */}
      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={modalState.mode !== 'view' ? handleTryCancelModal : closeModal}
        title={modalState.mode === 'create' ? 'Registrar cliente' : modalState.mode === 'edit' ? 'Editar cliente' : 'Detalles del cliente'}
        subtitle={modalState.mode === 'create' ? "Complete el formulario para registrar un nuevo cliente" : modalState.mode === 'edit' ? "Modifique los datos del cliente seleccionado" : "Consulta de información histórica del cliente"}
        size="medium"
        onSave={handleSave}
        actions={modalState.mode === 'view' ? [
          { label: 'Cerrar', variant: 'primary', onClick: closeModal }
        ] : [
          { label: 'Cancelar', variant: 'secondary', onClick: handleTryCancelModal },
          { label: modalState.mode === 'edit' ? 'Guardar Cambios' : 'Guardar', variant: 'primary', onClick: handleSave }
        ]}
      >
        <div className="clientes-form-wrapper yellow-scrollbar">
          <ClienteFormFields
            modalState={modalState}
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            firstInputRef={firstInputRef}
          />
        </div>
      </UniversalModal>

      {/* MODAL DE ELIMINACIÓN */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="cliente"
        entityData={deleteModal.cliente}
        loading={loading}
      />
    </>
  );
};

export default ClientesPage;