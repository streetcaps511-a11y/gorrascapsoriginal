/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import '../style/index.css';
import React, { useState, useRef, useEffect } from 'react';

// ===== COMPONENTES COMPARTIDOS =====
import { Alert, EntityTable, SearchInput, UniversalModal, ConfirmDeleteModal, CustomPagination, StatusPill } from '../../../shared/services';
import ConfirmModal from '../../../shared/components/admin/ConfirmModal';
import RoleFormFields from '../components/RoleFormFields';
import StatusFilter from '../components/StatusFilter';

// ===== HOOKS & CONSTANTES =====
import { useRolesLogic } from '../hooks/useRolesLogic';
import { AVAILABLE_PERMISSIONS } from '../constants/permissions';

const roleColumns = [
  { 
    header: "Rol", 
    field: "name", 
    width: "25%",
    render: (item) => (
      <span className="role-name-text">
        {item.name || 'N/A'}
      </span>
    )
  },
  { 
    header: "Descripción", 
    field: "description", 
    width: "50%",
    render: (item) => (
      <span className="role-description-text">
        {item.description}
      </span>
    )
  },
  { 
    header: "Estado", 
    field: "isActive",
    width: "25%",
    render: (r) => <StatusPill status={r.isActive} />
  }
];

const RolesPage = () => {
  const {
    roles,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    loading,
    alert, setAlert,
    currentRole, setCurrentRole,
    modalState,
    deleteModal,
    fieldErrors,
    setFieldErrors,
    filteredRoles,
    paginatedRoles,
    totalPages,
    showingStart,
    endIndex,
    openModal,
    closeModal,
    handleSave,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    isAdministrador,
    isRestrictedRole,
    handleToggleStatus
  } = useRolesLogic(AVAILABLE_PERMISSIONS);

  const getModalTitle = () => {
    if (modalState.mode === 'details') return 'Detalles del rol';
    if (modalState.mode === 'edit') return 'Editar rol';
    return 'Registrar rol';
  };

  // 🔒 ConfirmModal al cancelar con datos
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const initialRoleRef = useRef(null);

  // Capturar estado inicial cuando se abre el modal de edición/creación
  useEffect(() => {
    if (modalState.isOpen && modalState.mode !== 'details') {
      initialRoleRef.current = JSON.stringify(currentRole);
    } else {
      initialRoleRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.isOpen, modalState.mode]);

  const hasRoleChanges = () => {
    if (!initialRoleRef.current) return false;
    return JSON.stringify(currentRole) !== initialRoleRef.current;
  };

  const handleTryCancelModal = () => {
    if (hasRoleChanges()) {
      setShowCancelConfirm(true);
    } else {
      closeModal();
    }
  };

  const handleConfirmExit = () => {
    setShowCancelConfirm(false);
    closeModal();
  };

  return (
    <div className="roles-page-wrapper">
      {alert.show && (
        <Alert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(prev => ({ ...prev, show: false }))} 
        />
      )}

      {/* MODAL DE ELIMINACIÓN */}
      <>
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          entityName="rol"
          entityData={deleteModal.role}
          loading={loading}
        />

      </>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmExit}
        title="¿Desea cancelar?"
        message="Se perderán los datos del rol ingresados. ¿Está seguro de salir sin guardar?"
        confirmText="Sí, Salir"
        cancelText="Continuar"
        type="warning"
      />

     <UniversalModal
  isOpen={modalState.isOpen}
  onClose={modalState.mode !== 'details' ? handleTryCancelModal : closeModal}
  title={getModalTitle()}
  subtitle={
    modalState.mode === 'create' ? 'Registre un nuevo rol y asigne sus permisos' : 
    modalState.mode === 'edit' ? 'Modifique los datos y permisos del rol' : 
    'Información detallada y permisos del rol'
  }
  size="medium"
  showActions={true}
  onConfirm={modalState.mode !== 'details' ? handleSave : closeModal}
  confirmText={modalState.mode === 'details' ? 'Cerrar' : (loading ? 'Guardando...' : 'Guardar')}
  cancelText="Cancelar"
  onCancel={modalState.mode !== 'details' ? handleTryCancelModal : undefined}
  showCancel={modalState.mode !== 'details'}  // ✅ AGREGAR: Ocultar cancelar en detalles
>
  <div className="roles-modal-content">
    <RoleFormFields 
      modalMode={modalState.mode}
      currentRole={currentRole}
      setCurrentRole={setCurrentRole}
      fieldErrors={fieldErrors}
      setFieldErrors={setFieldErrors}
      availablePermissions={AVAILABLE_PERMISSIONS}
      closeModal={closeModal}
      handleSave={handleSave}
      isAdministrador={isAdministrador}
      isRestrictedRole={isRestrictedRole}
      roles={roles}
    />
  </div>
</UniversalModal>

      <div className="roles-container">
        {/* HEADER */}
        <div className="roles-header">
          <div className="roles-header-top">
            <div>
              <h1 className="roles-title">Roles</h1>
              <p className="roles-subtitle">Gestiona los roles y permisos del sistema</p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="roles-btn-add"
            >
              Registrar rol
            </button>
          </div>

          <div className="roles-controls">
            <div style={{ flex: 1 }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre o descripción..."
                onClear={() => setSearchTerm('')}
                fullWidth={true}
              />
            </div>
            <StatusFilter 
              filterStatus={filterStatus} 
              onFilterSelect={(status) => {
                setFilterStatus(status);
                setCurrentPage(1);
              }} 
            />
          </div>
        </div>

        {/* CONTENEDOR DE TABLA */}
        <div className="roles-table-container">
          <div className="roles-table-wrapper yellow-scrollbar">
            <EntityTable 
              entities={paginatedRoles} 
              columns={roleColumns} 
              onView={(item) => openModal('details', item)} 
              onEdit={(item) => openModal('edit', item)} 
              onDelete={openDeleteModal}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              idField="id"
              estadoField="isActive"
              moduleType="roles"
              actionIconSize={18}
              actionGap={14}
              isRestrictedActionCheck={isRestrictedRole}
            />
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredRoles.length}
            showingStart={showingStart}
            endIndex={endIndex}
            itemsName="roles"
          />
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
