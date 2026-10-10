import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  getArticulos,
  createArticulo,
  updateArticulo,
  toggleArticuloStatus,
  deleteArticulo,
  getProductos
} from '../../../shared/services/adminApi';

export const useArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modo de visualización: 'lista' | 'formulario' | 'vista'
  const [modoVista, setModoVista] = useState('lista');
  const [formularioModo, setFormularioModo] = useState('create'); // 'create' | 'edit' | 'view'
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  // Formulario de Artículo con soporte de Producto Mapeado y Campos Dinámicos
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    idProducto: '',
    cantidad: 0,
    isActive: true,
    tipo: 'general',
    campos: []
  });
  const [errors, setErrors] = useState({});
  const initialFormRef = useRef(null);

  // Modales de confirmación y alertas
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, data: null });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    const duration = type === 'error' ? 5000 : 3500;
    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, duration);
  }, []);

  const closeAlert = useCallback(() => {
    setAlert({ show: false, message: '', type: 'success' });
  }, []);

  // Cargar Artículos y Productos Disponibles
  const loadArticulos = useCallback(async () => {
    setLoading(true);
    try {
      const [artRes, prodRes] = await Promise.allSettled([
        getArticulos(),
        getProductos()
      ]);

      if (artRes.status === 'fulfilled') {
        const list = Array.isArray(artRes.value?.data)
          ? artRes.value.data
          : artRes.value?.data?.data || [];
        setArticulos(list);
      }

      if (prodRes.status === 'fulfilled') {
        const pList = Array.isArray(prodRes.value?.data)
          ? prodRes.value.data
          : prodRes.value?.data?.data || [];
        
        // Si la base de datos de productos está vacía, proveer productos demo representativos para pruebas inmediatas
        if (pList.length === 0) {
          setAvailableProducts([
            {
              id: 101,
              nombre: 'Gorra New Era LA Dodgers',
              categoria: 'GORRAS',
              stock: 35,
              precioVenta: 120000,
              tallasStock: [
                { talla: 'Ajustable', cantidad: 15 },
                { talla: '7', cantidad: 8 },
                { talla: '7 1/4', cantidad: 12 }
              ]
            },
            {
              id: 102,
              nombre: 'Gorra Yankees 59FIFTY Fitted',
              categoria: 'GORRAS',
              stock: 20,
              precioVenta: 135000,
              tallasStock: [
                { talla: '7', cantidad: 5 },
                { talla: '7 1/8', cantidad: 8 },
                { talla: '7 1/4', cantidad: 7 }
              ]
            },
            {
              id: 103,
              nombre: 'Camiseta Oversize StreetCaps Negra',
              categoria: 'ROPA / PRENDAS',
              stock: 40,
              precioVenta: 85000,
              tallasStock: []
            },
            {
              id: 104,
              nombre: 'Cadena Cubana Acero Inoxidable',
              categoria: 'ACCESORIOS',
              stock: 15,
              precioVenta: 65000,
              tallasStock: []
            }
          ]);
        } else {
          setAvailableProducts(pList);
        }
      }
    } catch (err) {
      console.error('Error cargando datos de artículos:', err);
      showAlert('Error al cargar la lista de artículos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadArticulos();
  }, [loadArticulos]);

  // Filtrado de artículos
  const filteredArticulos = useMemo(() => {
    return articulos.filter((item) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = (item.nombre || '').toLowerCase().includes(term);
      const isAct = item.isActive === true || item.isActive === 1 || item.isActive === 'true';
      const matchStatus =
        filterStatus === 'Todos' ||
        (filterStatus === 'Activo' && isAct) ||
        (filterStatus === 'Inactivo' && !isAct);
      return matchSearch && matchStatus;
    });
  }, [articulos, searchTerm, filterStatus]);

  // Paginación
  const totalItems = filteredArticulos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginatedArticulos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredArticulos.slice(start, start + itemsPerPage);
  }, [filteredArticulos, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ── Navegación entre Vistas ──
  const mostrarLista = () => {
    setModoVista('lista');
    setArticuloSeleccionado(null);
    setErrors({});
    initialFormRef.current = null;
  };

  const mostrarFormulario = (modo = 'create', item = null) => {
    setFormularioModo(modo);
    setArticuloSeleccionado(item);
    setErrors({});

    if (modo === 'create') {
      const initial = {
        id: null,
        nombre: '',
        idProducto: '',
        cantidad: 0,
        isActive: true,
        tipo: 'general',
        campos: [
          { id: 'c1', nombre: 'Material', valor: 'Algodón Premium', estado: true },
          { id: 'c2', nombre: 'Color', valor: 'Negro', estado: true }
        ]
      };
      setFormData(initial);
      initialFormRef.current = JSON.stringify(initial);
    } else if (item) {
      // Normalizar campos si vienen en JSON string o array
      let camposParsed = [];
      if (Array.isArray(item.campos)) {
        camposParsed = item.campos;
      } else if (typeof item.campos === 'string') {
        try {
          camposParsed = JSON.parse(item.campos);
        } catch {
          camposParsed = [];
        }
      }

      const initial = {
        id: item.id,
        nombre: item.nombre || '',
        idProducto: item.idProducto || '',
        cantidad: item.cantidad !== undefined ? Number(item.cantidad) : 0,
        isActive: item.isActive === true || item.isActive === 1 || item.isActive === 'true',
        tipo: item.tipo || 'general',
        campos: camposParsed
      };
      setFormData(initial);
      initialFormRef.current = JSON.stringify(initial);
    }

    setModoVista(modo === 'view' ? 'vista' : 'formulario');
  };

  const mostrarDetalle = (item) => {
    mostrarFormulario('view', item);
  };

  // Comprobar cambios sin guardar
  const hasChanges = () => {
    if (!initialFormRef.current) return false;
    return JSON.stringify(formData) !== initialFormRef.current;
  };

  const handleTryBack = () => {
    if (modoVista === 'formulario' && hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      mostrarLista();
    }
  };

  const handleConfirmExit = () => {
    setShowCancelConfirm(false);
    mostrarLista();
  };

  // ── Manejo de Inputs ──
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Seleccionar producto del catálogo
  const handleSelectProduct = (product) => {
    if (!product) {
      setFormData((prev) => ({ ...prev, idProducto: '' }));
      return;
    }

    const prodId = product.id || product.IdProducto;
    const prodName = product.nombre || product.Nombre || '';
    const isGorra = (product.categoria || '').toUpperCase().includes('GORRA');

    setFormData((prev) => {
      // Si el nombre del artículo está vacío o tenía el nombre del producto anterior, sugerir el nuevo
      const nuevoNombre = (!prev.nombre.trim() || prev.nombre === (availableProducts.find(p => p.id === prev.idProducto)?.nombre))
        ? prodName
        : prev.nombre;

      return {
        ...prev,
        idProducto: prodId,
        nombre: nuevoNombre,
        tipo: isGorra ? 'gorra' : 'general'
      };
    });

    if (errors.idProducto) {
      setErrors((prev) => ({ ...prev, idProducto: null }));
    }
  };

  // ── Gestión de Campos Dinámicos ──
  const agregarCampo = (presetName = '') => {
    const defaultName = presetName || `Campo_${formData.campos.length + 1}`;
    
    // Validar si ya existe
    const exists = formData.campos.some(
      (c) => (c.nombre || '').trim().toLowerCase() === defaultName.trim().toLowerCase()
    );

    if (exists && presetName) {
      showAlert(`El campo "${presetName}" ya está agregado`, 'error');
      return;
    }

    const nuevoCampo = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nombre: defaultName,
      valor: '',
      estado: true
    };

    setFormData((prev) => ({
      ...prev,
      campos: [...prev.campos, nuevoCampo]
    }));
  };

  const actualizarCampo = (index, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.campos];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return { ...prev, campos: copy };
    });
  };

  const eliminarCampo = (index) => {
    setFormData((prev) => {
      const copy = prev.campos.filter((_, i) => i !== index);
      return { ...prev, campos: copy };
    });
  };

  // ── Validación de Formulario (incluye unicidad de campos) ──
  const validateForm = () => {
    const newErrors = {};
    const cleanNombre = (formData.nombre || '').trim();

    if (!cleanNombre) {
      newErrors.nombre = 'El nombre del artículo es obligatorio';
    } else if (cleanNombre.length > 60) {
      newErrors.nombre = 'El nombre no puede exceder los 60 caracteres';
    } else {
      // Validar duplicados de artículos
      const isDuplicate = articulos.some((art) => {
        const sameName = (art.nombre || '').trim().toUpperCase() === cleanNombre.toUpperCase();
        if (formularioModo === 'edit' && formData.id) {
          return sameName && art.id !== formData.id;
        }
        return sameName;
      });

      if (isDuplicate) {
        newErrors.nombre = 'Ya existe un artículo registrado con este nombre';
      }
    }

    // Validar cantidad
    const numCantidad = Number(formData.cantidad);
    if (isNaN(numCantidad) || numCantidad < 0) {
      newErrors.cantidad = 'La cantidad no puede ser negativa';
    }

    // Validar que los campos dinámicos no tengan nombres duplicados
    const nombresVistos = new Set();
    let hayCamposDuplicados = false;
    for (const c of formData.campos || []) {
      const n = (c.nombre || '').trim().toLowerCase();
      if (!n) continue;
      if (nombresVistos.has(n)) {
        hayCamposDuplicados = true;
        break;
      }
      nombresVistos.add(n);
    }

    if (hayCamposDuplicados) {
      newErrors.campos = 'No puede haber campos con el mismo nombre. Deben ser únicos.';
      showAlert('Existen campos con nombres repetidos. Cada campo debe ser único.', 'error');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Guardar Artículo ──
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        cantidad: parseInt(formData.cantidad, 10) || 0,
        isActive: formData.isActive,
        idProducto: formData.idProducto ? parseInt(formData.idProducto, 10) : null,
        campos: formData.campos || [],
        tipo: formData.tipo || 'general'
      };

      if (formularioModo === 'create') {
        await createArticulo(payload);
        showAlert(`Artículo "${payload.nombre}" registrado exitosamente`, 'success');
      } else if (formularioModo === 'edit' && formData.id) {
        await updateArticulo(formData.id, payload);
        showAlert(`Artículo "${payload.nombre}" actualizado correctamente`, 'success');
      }

      await loadArticulos();
      mostrarLista();
    } catch (err) {
      console.error('Error al guardar artículo:', err);
      const msg = err.response?.data?.message || err.message || 'Error al procesar la solicitud';
      showAlert(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Estado Activo / Inactivo ──
  const handleToggleStatus = async (item) => {
    try {
      await toggleArticuloStatus(item.id);
      showAlert(`Estado de "${item.nombre}" actualizado`, 'success');
      loadArticulos();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      showAlert('Error al actualizar el estado del artículo', 'error');
    }
  };

  // ── Eliminación ──
  const openDeleteModal = (data) => {
    setDeleteModal({ isOpen: true, data });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, data: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.data) return;
    try {
      await deleteArticulo(deleteModal.data.id);
      showAlert(`Artículo "${deleteModal.data.nombre}" eliminado`, 'success');
      closeDeleteModal();
      loadArticulos();
    } catch (err) {
      console.error('Error al eliminar artículo:', err);
      showAlert('Error al eliminar el artículo', 'error');
    }
  };

  return {
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
    showAlert,
    closeAlert
  };
};

export default useArticulos;
