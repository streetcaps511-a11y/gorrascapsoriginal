import React from 'react';
import '../../Categorias/style/Categorias.css';
import '../styles/Articulos.css';
import {
  EntityTable,
  Alert,
  SearchInput,
  ConfirmDeleteModal,
  CustomPagination,
  StatusPill
} from '../../../shared/services';
import ConfirmModal from '../../../shared/components/admin/ConfirmModal';
import { useArticulos } from '../hooks/useArticulos';
import ArticuloFullView from '../components/ArticuloFullView';

// Dropdown de filtro por estado
const StatusFilter = ({ filterStatus, onFilterChange }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="status-filter">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(!open)}
      >
        <span>{filterStatus}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="modal-overlay"
            style={{ background: 'transparent', position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setOpen(false)}
          />
          <div className="status-filter__dropdown">
            {['Todos', 'Activo', 'Inactivo'].map((status) => (
              <button
                key={status}
                type="button"
                className={`status-filter__option ${
                  filterStatus === status ? 'status-filter__option--active' : ''
                }`}
                onClick={() => {
                  onFilterChange(status);
                  setOpen(false);
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const ArticulosPage = () => {
  const {
    articulos,
    availableProducts,
    loading,
    saving,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    startItem,
    endItem,
    paginatedArticulos,
    handlePageChange,
    // Vistas y Navegación
    modoVista,
    formularioModo,
    mostrarLista,
    mostrarFormulario,
    mostrarDetalle,
    handleTryBack,
    showCancelConfirm,
    setShowCancelConfirm,
    handleConfirmExit,
    // Formulario y Campos Dinámicos
    formData,
    errors,
    handleInputChange,
    handleSelectProduct,
    agregarCampo,
    actualizarCampo,
    eliminarCampo,
    handleSave,
    // Acciones tabla
    handleToggleStatus,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    // Notificaciones
    alert,
    closeAlert
  } = useArticulos();

  // Columnas para la tabla de Artículos
  const columns = [
    {
      header: 'ID',
      field: 'id',
      width: '70px',
      render: (item) => (
        <span style={{ fontWeight: 600, color: '#94a3b8' }}>
          #{item.id}
        </span>
      )
    },
    {
      header: 'Nombre del Artículo',
      field: 'nombre',
      width: '230px',
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: '#ffffff' }}>
            {item.nombre}
          </span>
          {item.idProducto && (
            <span style={{ fontSize: '11px', color: '#F5C81B', marginTop: '2px' }}>
              Mapeado a catálogo #{item.idProducto}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Campos y Especificaciones',
      field: 'campos',
      width: '240px',
      render: (item) => {
        let camposList = [];
        if (Array.isArray(item.campos)) {
          camposList = item.campos;
        } else if (typeof item.campos === 'string') {
          try {
            camposList = JSON.parse(item.campos);
          } catch {
            camposList = [];
          }
        }

        if (camposList.length === 0) {
          return (
            <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              Sin campos personalizados
            </span>
          );
        }

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {camposList.slice(0, 3).map((c, i) => (
              <span
                key={i}
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  background: c.estado ? 'rgba(245, 200, 27, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: c.estado ? '#F5C81B' : '#ef4444',
                  border: `1px solid ${c.estado ? 'rgba(245, 200, 27, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                {c.nombre}{c.valor ? `: ${c.valor}` : ''}
              </span>
            ))}
            {camposList.length > 3 && (
              <span style={{ fontSize: '10px', color: '#94a3b8', alignSelf: 'center' }}>
                +{camposList.length - 3} más
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Cantidad / Stock',
      field: 'cantidad',
      width: '140px',
      render: (item) => {
        const qty = Number(item.cantidad) || 0;
        return (
          <span style={{ fontWeight: 700, color: qty > 0 ? '#10b981' : '#94a3b8' }}>
            {qty} uds
          </span>
        );
      }
    },
    {
      header: 'Estado',
      field: 'isActive',
      width: '130px',
      render: (item) => <StatusPill status={item.isActive} />
    }
  ];

  return (
    <>
      <div className="articulos-page">
        {modoVista === 'formulario' || modoVista === 'vista' ? (
          /* ── VISTA COMPLETA: REGISTRAR / EDITAR / VER DETALLES ── */
          <ArticuloFullView
            mode={formularioModo}
            formData={formData}
            errors={errors}
            availableProducts={availableProducts}
            handleInputChange={handleInputChange}
            handleSelectProduct={handleSelectProduct}
            agregarCampo={agregarCampo}
            actualizarCampo={actualizarCampo}
            eliminarCampo={eliminarCampo}
            onBack={handleTryBack}
            onSave={handleSave}
            onEditMode={() => mostrarFormulario('edit', formData)}
            saving={saving}
          />
        ) : (
          /* ── VISTA LISTA: TABLA Y BÚSQUEDA ── */
          <div className="categorias-page">
            {/* Header */}
            <div className="categorias-page__header">
              <div className="categorias-page__title-section">
                <div>
                  <h1 className="categorias-page__title">Artículos</h1>
                  <p className="categorias-page__subtitle">
                    Administra los artículos, especificaciones dinámicas y disponibilidad de inventario
                  </p>
                </div>
                <button
                  onClick={() => mostrarFormulario('create')}
                  className="btn-primary"
                  type="button"
                  id="btn-registrar-articulo"
                >
                  + Registrar Artículo
                </button>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div
                className="categorias-page__actions"
                style={{ display: 'flex', alignItems: 'center', marginTop: '5px', marginBottom: '2px' }}
              >
                <div style={{ flex: 1, marginRight: '15px' }}>
                  <SearchInput
                    value={searchTerm}
                    onChange={(val) => {
                      setSearchTerm(val);
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar por nombre de artículo..."
                    onClear={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    fullWidth={true}
                  />
                </div>
                <StatusFilter
                  filterStatus={filterStatus}
                  onFilterChange={(st) => {
                    setFilterStatus(st);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Tabla de Artículos */}
            <div className="categories-container">
              <div className="categories-table-wrapper">
                <EntityTable
                  entities={paginatedArticulos}
                  loading={loading}
                  columns={columns}
                  onView={(art) => mostrarDetalle(art)}
                  onEdit={(art) => mostrarFormulario('edit', art)}
                  onDelete={openDeleteModal}
                  onAnular={handleToggleStatus}
                  onReactivar={handleToggleStatus}
                  estadoField="isActive"
                  moduleType="tallas"
                />
              </div>

              {/* Paginación */}
              {totalItems > 0 && !loading && (
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  showingStart={startItem}
                  endIndex={endItem}
                  itemsName="artículos"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ConfirmModal al cancelar con cambios sin guardar */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmExit}
        title="¿Desea salir sin guardar?"
        message="Hay cambios en las especificaciones o datos del artículo que no han sido guardados. ¿Está seguro de regresar a la lista?"
        confirmText="Sí, Salir"
        cancelText="Continuar Editando"
        type="warning"
      />

      {/* Modal Confirmar Eliminación */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="artículo"
        entityData={deleteModal.data}
      />

      {/* Alerta flotante */}
      {alert.show && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={closeAlert}
        />
      )}
    </>
  );
};

export default ArticulosPage;
