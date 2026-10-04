/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

import React, { useState, useEffect, useRef } from 'react';
import '../style/Categorias.css';
import { useCategoriasLogic } from '../hooks/useCategoriasLogic';
import { StatusFilter } from '../components';
import CategoryFormFields from '../components/CategoryFormFields';
import EntityTable from '../../../shared/components/admin/EntityTable';

// Shared Components
import SearchInput from '../../../shared/components/admin/SearchInput';
import UniversalModal from '../../../shared/components/admin/UniversalModal';
import ConfirmDeleteModal from '../../../shared/components/admin/ConfirmDeleteModal';
import ConfirmModal from '../../../shared/components/admin/ConfirmModal';
import CustomPagination from '../../../shared/components/admin/CustomPagination';
import Alert from '../../../shared/components/admin/Alert';
import StatusPill from '../../../shared/components/admin/StatusPill';

const CategoriasPage = () => {
  const {
    alert, setAlert, modalState, deleteModalState, searchTerm, setSearchTerm,
    filterStatus, currentPage, totalItems, totalPages, startItem, endItem,
    paginatedCategories, handlePageChange, handleFilterSelect, clearSearch,
    openModal, closeModal, openDeleteModal, closeDeleteModal,
    handleSave, handleDelete, formData, errors,
    handleInputChange, loading, handleToggleStatus
  } = useCategoriasLogic();

  // 🔒 ConfirmModal al cancelar con datos
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const initialFormRef = useRef(null);

  // Capturar estado inicial cuando se abre el modal de edición/creación
  useEffect(() => {
    if (modalState.isOpen && modalState.mode !== 'view') {
      initialFormRef.current = JSON.stringify(formData);
    } else {
      initialFormRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.isOpen, modalState.mode]);

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


  return (
    <>
      <div className="categorias-page">
        {/* Header */}
        <div className="categorias-page__header">
          <div className="categorias-page__title-section">
            <div>
              <h1 className="categorias-page__title">Categorías</h1>
              <p className="categorias-page__subtitle">Administra las categorías de productos</p>
            </div>
            <button onClick={() => openModal('create')} className="btn-primary">
              Registrar Categoría
            </button>
          </div>
          <div className="categorias-page__actions" style={{ display: 'flex', alignItems: 'center', marginTop: '5px', marginBottom: '2px' }}>
            <div style={{ flex: 1, marginRight: '15px' }}>
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar por nombre o descripción..."
                onClear={clearSearch}
                fullWidth={true}
              />
            </div>
            <StatusFilter filterStatus={filterStatus} onFilterChange={handleFilterSelect} />
          </div>
        </div>

        {/* Content Area */}
        <div className="categories-container">
          <div className="categories-table-wrapper">
            <EntityTable 
              entities={paginatedCategories}
              loading={loading}
              columns={[
                { header: 'Nombre', field: 'nombre', width: '220px' },
                { header: 'Descripción', field: 'descripcion', width: '350px' },
                { 
                  header: 'Estado', 
                  field: 'isActive',
                  width: '120px',
                  render: (cat) => <StatusPill status={cat.isActive} />
                }
              ]}
              onView={(cat) => openModal('view', cat)}
              onEdit={(cat) => openModal('edit', cat)}
              onDelete={(cat) => openDeleteModal(cat)}
              onAnular={handleToggleStatus}
              onReactivar={handleToggleStatus}
              estadoField="isActive"
              moduleType="categorias"
            />
          </div>

          {totalItems > 0 && !loading && (
            <CustomPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              showingStart={startItem}
              endIndex={endItem}
              itemsName="categorías"
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmExit}
        title="¿Desea cancelar?"
        message="Se perderán los datos de la categoría ingresados. ¿Está seguro de salir sin guardar?"
        confirmText="Sí, Salir"
        cancelText="Continuar"
        type="warning"
      />

      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={modalState.mode !== 'view' ? handleTryCancelModal : closeModal}
        title={modalState.mode === 'create' ? 'Registrar categoría' : modalState.mode === 'edit' ? 'Editar categoría' : 'Detalles de la categoría'}
        subtitle={modalState.mode === 'create' ? 'Complete la información para registrar una nueva categoría' : modalState.mode === 'edit' ? 'Modifique la información de la categoría' : 'Información detallada de la categoría'}
        size="medium"
        loading={loading}
        actions={modalState.mode === 'view' ? [
          { label: 'Cerrar', variant: 'primary', onClick: closeModal }
        ] : [
          { label: 'Cancelar', variant: 'secondary', onClick: handleTryCancelModal },
          { label: modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios', variant: 'primary', onClick: handleSave }
        ]}
      >
        <CategoryFormFields
          modalMode={modalState.mode}
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          category={modalState.category}
        />
      </UniversalModal>

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="categoría"
        entityData={deleteModalState.category}
        loading={loading}
      />

      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
    </>
  );
};

export default CategoriasPage;