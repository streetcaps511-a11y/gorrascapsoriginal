// src/features/admin/TallasPage/pages/TallasPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../../Categorias/style/Categorias.css';
import {
  EntityTable,
  Alert,
  SearchInput,
  UniversalModal,
  ConfirmDeleteModal,
  CustomPagination,
  StatusPill
} from '../../../shared/services';
import {
  getTallas,
  createTalla,
  updateTalla,
  toggleTallaStatus,
  deleteTalla
} from '../../../shared/services/adminApi';

const StatusFilter = ({ filterStatus, onFilterChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="status-filter">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => setOpen(!open)}
      >
        {filterStatus}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
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
                className={`status-filter__option ${filterStatus === status ? 'status-filter__option--active' : ''}`}
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

const TallasPage = () => {
  const [tallas, setTallas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modales
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'create', data: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, data: null });
  const [formData, setFormData] = useState({ nombre: '', cantidad: 0 });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
  };

  const loadTallas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTallas();
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTallas(list);
    } catch (err) {
      console.error('Error cargando tallas:', err);
      showAlert('Error al cargar las tallas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTallas();
  }, [loadTallas]);

  // Filtrado
  const filteredTallas = useMemo(() => {
    return tallas.filter((t) => {
      const matchSearch = (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase().trim());
      const isAct = t.isActive === true || t.isActive === 1 || t.isActive === 'true';
      const matchStatus =
        filterStatus === 'Todos' ||
        (filterStatus === 'Activo' && isAct) ||
        (filterStatus === 'Inactivo' && !isAct);
      return matchSearch && matchStatus;
    });
  }, [tallas, searchTerm, filterStatus]);

  // Paginación
  const totalItems = filteredTallas.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedTallas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTallas.slice(start, start + itemsPerPage);
  }, [filteredTallas, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Abrir modal
  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data });
    setErrors({});
    if (mode === 'create') {
      setFormData({ nombre: '', cantidad: 0 });
    } else if (data) {
      setFormData({
        nombre: data.nombre || '',
        cantidad: data.cantidad !== undefined ? data.cantidad : 0
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', data: null });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la talla es obligatorio';
    }
    if (Number(formData.cantidad) < 0) {
      newErrors.cantidad = 'La cantidad no puede ser negativa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (modalState.mode === 'create') {
        await createTalla({
          nombre: formData.nombre.trim(),
          cantidad: parseInt(formData.cantidad, 10) || 0
        });
        showAlert('Talla registrada correctamente', 'success');
      } else if (modalState.mode === 'edit') {
        await updateTalla(modalState.data.id, {
          nombre: formData.nombre.trim(),
          cantidad: parseInt(formData.cantidad, 10) || 0
        });
        showAlert('Talla actualizada correctamente', 'success');
      }
      closeModal();
      loadTallas();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar la talla';
      showAlert(msg, 'error');
    }
  };

  // Toggle estado
  const handleToggleStatus = async (item) => {
    try {
      await toggleTallaStatus(item.id);
      showAlert(`Estado de la talla actualizado`, 'success');
      loadTallas();
    } catch (err) {
      showAlert('Error al cambiar el estado de la talla', 'error');
    }
  };

  // Eliminar
  const openDeleteModal = (data) => {
    setDeleteModalState({ isOpen: true, data });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, data: null });
  };

  const handleDelete = async () => {
    if (!deleteModalState.data) return;
    try {
      await deleteTalla(deleteModalState.data.id);
      showAlert('Talla eliminada correctamente', 'success');
      closeDeleteModal();
      loadTallas();
    } catch (err) {
      showAlert('Error al eliminar la talla', 'error');
    }
  };

  return (
    <>
      <div className="categorias-page">
        {/* Header */}
        <div className="categorias-page__header">
          <div className="categorias-page__title-section">
            <div>
              <h1 className="categorias-page__title">Tallas</h1>
              <p className="categorias-page__subtitle">Administra las tallas y disponibilidad de productos</p>
            </div>
            <button onClick={() => openModal('create')} className="btn-primary" type="button">
              + Registrar Talla
            </button>
          </div>
          <div className="categorias-page__actions" style={{ display: 'flex', alignItems: 'center', marginTop: '8px', marginBottom: '14px' }}>
            <div style={{ flex: 1, marginRight: '15px' }}>
              <SearchInput
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por nombre de talla..."
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

        {/* Tabla */}
        <div className="categories-container">
          <div className="categories-table-wrapper">
            <EntityTable
              entities={paginatedTallas}
              loading={loading}
              columns={[
                { header: 'ID', field: 'id', width: '80px' },
                { header: 'Nombre', field: 'nombre', width: '220px' },
                {
                  header: 'Cantidad',
                  field: 'cantidad',
                  width: '160px',
                  render: (t) => (
                    <span style={{ fontWeight: '700', color: t.cantidad > 0 ? '#38bdf8' : '#94a3b8' }}>
                      {t.cantidad ?? 0}
                    </span>
                  )
                },
                {
                  header: 'Estado',
                  field: 'isActive',
                  width: '140px',
                  render: (t) => <StatusPill status={t.isActive} />
                }
              ]}
              onView={(t) => openModal('view', t)}
              onEdit={(t) => openModal('edit', t)}
              onDelete={(t) => openDeleteModal(t)}
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
              itemsName="tallas"
            />
          )}
        </div>
      </div>

      {/* Modal Crear / Editar / Ver Talla */}
      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.mode === 'create'
            ? 'Registrar Talla'
            : modalState.mode === 'edit'
            ? 'Editar Talla'
            : 'Detalles de la Talla'
        }
        subtitle={
          modalState.mode === 'create'
            ? 'Complete los datos para crear una nueva talla'
            : modalState.mode === 'edit'
            ? 'Modifique los datos de la talla'
            : 'Información detallada de la talla'
        }
        size="small"
        actions={
          modalState.mode === 'view'
            ? [{ label: 'Cerrar', variant: 'primary', onClick: closeModal }]
            : [
                { label: 'Cancelar', variant: 'secondary', onClick: closeModal },
                {
                  label: modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios',
                  variant: 'primary',
                  onClick: handleSave
                }
              ]
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Nombre de la Talla *
            </label>
            <input
              type="text"
              disabled={modalState.mode === 'view'}
              placeholder="Ej: S, M, L, XL, Única, 7 1/4..."
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#161b22',
                border: `1px solid ${errors.nombre ? '#ef4444' : '#30363d'}`,
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.nombre && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.nombre}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Cantidad / Stock
            </label>
            <input
              type="number"
              min="0"
              disabled={modalState.mode === 'view'}
              placeholder="0"
              value={formData.cantidad}
              onChange={(e) => handleInputChange('cantidad', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#161b22',
                border: `1px solid ${errors.cantidad ? '#ef4444' : '#30363d'}`,
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.cantidad && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errors.cantidad}
              </span>
            )}
          </div>
        </div>
      </UniversalModal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="talla"
        entityData={deleteModalState.data}
      />

      {/* Alerta flotante */}
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

export default TallasPage;
