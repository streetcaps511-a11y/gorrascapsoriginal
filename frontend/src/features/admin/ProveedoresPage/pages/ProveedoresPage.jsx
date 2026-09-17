/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import '../style/index.css';
import React from 'react';

// ===== COMPONENTES COMPARTIDOS =====
import { Alert, EntityTable, SearchInput, UniversalModal, ConfirmDeleteModal, CustomPagination, StatusPill } from '../../../shared/services';
// ===== COMPONENTES LOCALES =====
import ProveedorFormFields from '../components/ProveedorFormFields';
import StatusFilter from '../components/StatusFilter';

// ===== HOOKS =====
import { useProveedoresLogic } from '../hooks/useProveedoresLogic';

const columns = [
  { 
    header: 'Tipo Proveedor', 
    field: 'supplierType', 
    width: '100px',
    render: (item) => (
      <span className="supplier-type-text">
        {item.supplierType?.toLowerCase() === 'persona natural' ? 'Natural' : 'Jurídica'}
      </span>
    )
  }, 
  { 
    header: 'Nombre/Empresa', 
    field: 'companyName', 
    width: '140px',
    render: (item) => (
      <div className="company-name-text">
        {item.companyName || item.contactName || 'Sin nombre'}
      </div>
    )
  },
  { 
    header: 'Documento/NIT', 
    field: 'documentNumber', 
    width: '100px',
    render: (item) => (
      <div className="document-number-text">
        {item.documentNumber || 'Sin NIT'}
      </div>
    )
  },
  { 
    header: 'Email', 
    field: 'email', 
    width: '480px',
    render: (item) => (
      <a 
        href={`mailto:${item.email}`}
        className="email-link"
        title={item.email}
      >
        {item.email || 'Sin correo'}
      </a>
    )
  },
  { 
    header: 'Teléfono', 
    field: 'phone', 
    width: '140px',
    render: (item) => (
      <span className="phone-text">
        {item.phone || 'Sin teléfono'}
      </span>
    )
  },
  {
    header: 'Estado',
    field: 'isActive',
    width: '120px',
    render: (item) => <StatusPill status={item.isActive} />
  }
];

const ProveedoresPage = () => {
  const {
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    loading,
    actionLoading,
    actionLoadingText,
    modalState,
    formData,
    errors,
    deleteModal,
    filteredProveedores,
    paginatedProveedores,
    totalPages,
    showingStart,
    endIndex,
    handleFieldChange,
    openModal,
    closeModal,
    handleSave,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    alert, setAlert,
    availableStatuses,
    handleToggleStatus
  } = useProveedoresLogic();

  const getModalTitle = () => {
    if (modalState.mode === 'view') return 'Detalle del proveedor';
    if (modalState.mode === 'edit') return 'Editar proveedor';
    return 'Registrar proveedor';
  };

  

  return (
    <div className="proveedores-page-wrapper">
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* MODAL DE ELIMINACIÓN */}
      <>
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          entityName="proveedor"
          entityData={deleteModal.proveedor}
          loading={actionLoading}
          loadingText={actionLoadingText}
        />

      </>

      <div className="proveedores-container">
        {/* HEADER */}
        <div className="proveedores-header">
          <div className="proveedores-header-top">
            <div>
              <h1 className="proveedores-title">Proveedores</h1>
              <p className="proveedores-subtitle">Administre la información de sus proveedores aquí</p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="proveedores-btn-add"
            >
              Registrar Proveedor
            </button>
          </div>

          <div className="proveedores-controls">
            <div style={{ flex: 1, marginRight: '20px' }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre, NIT, correo o teléfono..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <StatusFilter 
              filterStatus={filterStatus} 
              onFilterSelect={setFilterStatus} 
              statuses={availableStatuses}
            />
          </div>
        </div>

        {/* TABLA DE PROVEEDORES */}
        <div className="proveedores-table-container">
          <div className="proveedores-table-wrapper yellow-scrollbar">
            <EntityTable
              entities={paginatedProveedores}
              columns={columns}
              onView={(item) => openModal('view', item)}
              onEdit={(item) => openModal('edit', item)}
              onDelete={openDeleteModal}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              showDeleteButton={true}
              idField="id"
              estadoField="isActive"
              moduleType="proveedores"
              loading={loading}
            />
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProveedores.length}
            showingStart={showingStart}
            endIndex={endIndex}
            itemsName="proveedores"
          />
        </div>
      </div>

     <UniversalModal
  isOpen={modalState.isOpen}
  onClose={closeModal}
  title={getModalTitle()}
  subtitle={modalState.mode === 'create' ? "Ingrese la información básica de su nuevo proveedor" : modalState.mode === 'edit' ? "Actualice la información del proveedor seleccionado" : "Detalles completos de la ficha del proveedor"}
  size="medium"
  loading={actionLoading}
  loadingText={actionLoadingText}
  actions={modalState.mode === 'view' ? [
    { 
      label: 'Cerrar', 
      variant: 'primary', 
      key: 'close',
      closeOnClick: true,
      onClick: closeModal
    }
  ] : [
    { 
      label: 'Cancelar', 
      variant: 'secondary', 
      key: 'cancel',
      closeOnClick: true 
    },
    { 
      label: 'Guardar', 
      variant: 'primary', 
      key: 'save',
      closeOnClick: false,
      onClick: handleSave
    }
  ]}
>
  <div className="proveedores-form-wrapper yellow-scrollbar">
    <ProveedorFormFields 
      modalMode={modalState.mode}
      formData={formData}
      handleFieldChange={handleFieldChange}
      errors={errors}
      closeModal={closeModal}
      handleSave={handleSave}
      availableStatuses={availableStatuses}
    />
  </div>
</UniversalModal>
    </div>
  );
};

export default ProveedoresPage;
