/* === HOOK DE LÓGICA ===
Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo.
Separa la 'inteligencia' de la interfaz visual para mantener el código limpio.
Recibe eventos de la UI y se comunica con los Servicios API. */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { NitroCache } from '../../../shared/utils/NitroCache';
import { useFormDraft } from '../../../shared/hooks/useFormDraft';
import * as productosService from "../services/productosApi";

const CACHE_KEY = 'admin_productos';
const CATS_RAW_KEY = 'admin_categorias_raw';

const getInitialCache = () => {
  const cached = NitroCache.get(CACHE_KEY);
  return Array.isArray(cached?.data) ? cached.data : [];
};

const getInitialCategories = () => {
  const cached = NitroCache.get(CATS_RAW_KEY);
  return Array.isArray(cached?.data) ? cached.data : [];
};

export const useProductosLogic = () => {
  const [modoVista, setModoVista] = useState("lista");
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoViendo, setProductoViendo] = useState(null);
  const [productos, setProductos] = useState(() => getInitialCache());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [verTodos, setVerTodos] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, producto: null, customMessage: '' });
  
  const [formData, setFormData] = useState({
    nombre: "", 
    idCategoria: "", 
    precioCompra: "0", 
    precioVenta: "0", 
    precioOferta: "0",
    precioMayorista6: "0", 
    precioMayorista80: "0", 
    enOfertaVenta: false, 
    enInventario: false,
    stock: 0, 
    descripcion: "", 
    isActive: true
  });
  
  const [tallasStock, setTallasStock] = useState([{ talla: "", cantidad: 0 }]);
  const [categoriasRaw, setCategoriasRaw] = useState(() => getInitialCategories());
  const [categoriasUnicas, setCategoriasUnicas] = useState(['Todas']);
  const [availableTallas, setAvailableTallas] = useState([]);
  const [urlsImagenes, setUrlsImagenes] = useState(['']);
  const [coloresProducto, setColoresProducto] = useState(['']);
  const [loading, setLoading] = useState(getInitialCache().length === 0);
  const [errors, setErrors] = useState({});

  const fetchInitialData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    NitroCache.clear(CACHE_KEY);
    try {
      const [dbProductos, dbCategorias] = await Promise.all([
        productosService.getProductos(),
        productosService.getCategorias()
      ]);

      const todasLasTallas = new Set();
      dbProductos.forEach(p => {
        if (p.tallasStock && Array.isArray(p.tallasStock)) {
          p.tallasStock.forEach(t => {
            if (t.talla && t.talla.trim() !== '') {
              todasLasTallas.add(t.talla.trim());
            }
          });
        }
        if (p.tallas && Array.isArray(p.tallas)) {
          p.tallas.forEach(t => {
            if (t && String(t).trim() !== '') {
              todasLasTallas.add(String(t).trim());
            }
          });
        }
      });

      const tallasUnicas = Array.from(todasLasTallas).sort();
      if (tallasUnicas.length === 0) {
        setAvailableTallas(['Ajustable', '7', '7/1/4', '7/1/8']);
      } else {
        setAvailableTallas(tallasUnicas);
      }

      const cats = ['Todas', ...new Set(dbCategorias.map(c => c.nombre || c.Nombre))];
      NitroCache.set(CACHE_KEY, dbProductos);
      NitroCache.set(CATS_RAW_KEY, dbCategorias);
      setProductos(dbProductos);
      setCategoriasRaw(dbCategorias);
      setCategoriasUnicas(cats);
    } catch (error) {
      console.error("Error loading products data:", error);
      setAvailableTallas(['Ajustable', '7', '7/1/4', '7/1/8']);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData(productos.length === 0);
    const channel = new BroadcastChannel('app_sync');
    channel.onmessage = (event) => {
      if (event.data === 'productos_updated') {
        NitroCache.clear(CACHE_KEY);
        fetchInitialData(false);
      }
    };
    return () => channel.close();
  }, [fetchInitialData, productos.length]);

  const filteredProductos = useMemo(() => {
    let filtrados = productos;
    if (searchTerm) {
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoriaFiltro !== "Todas") filtrados = filtrados.filter(p => p.categoria === categoriaFiltro);
    if (filterStatus !== "Todos") {
      filtrados = filtrados.filter(p => {
        const estadoLabel = p.isActive ? 'Activo' : 'Inactivo';
        return estadoLabel === filterStatus;
      });
    }
    return filtrados;
  }, [searchTerm, categoriaFiltro, filterStatus, productos]);

  const totalPages = verTodos ? 1 : Math.ceil(filteredProductos.length / itemsPerPage) || 1;
  const paginatedProductos = verTodos ? filteredProductos : filteredProductos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const showingStart = verTodos ? (filteredProductos.length > 0 ? 1 : 0) : (filteredProductos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0);
  const endIndex = verTodos ? filteredProductos.length : Math.min(currentPage * itemsPerPage, filteredProductos.length);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const notifySync = () => {
    NitroCache.clear('home_products');
    NitroCache.clear('gm_catalog');
    const channel = new BroadcastChannel('app_sync');
    channel.postMessage('productos_updated');
    channel.postMessage('home_products_updated');
    channel.close();
  };

  const closeDeleteModal = () => setDeleteModal({ isOpen: false, producto: null, customMessage: '' });

  const resetFormState = useCallback(() => {
    setFormData({ 
      nombre: "", 
      idCategoria: "", 
      precioCompra: "0", 
      precioVenta: "0", 
      precioOferta: "0", 
      precioMayorista6: "0", 
      precioMayorista80: "0", 
      enOfertaVenta: false, 
      enInventario: false, 
      stock: 0, 
      descripcion: "", 
      isActive: true 
    });
    setTallasStock([{ talla: "", cantidad: 0 }]);
    setUrlsImagenes(['']);
    setColoresProducto(['']);
    setProductoEditando(null);
    setErrors({});
  }, []);

  const restoreDraftData = useCallback((data) => {
    if (!data) return;
    if (data.formData) setFormData(data.formData);
    if (data.tallasStock) setTallasStock(data.tallasStock);
    if (data.urlsImagenes) setUrlsImagenes(data.urlsImagenes);
    if (data.coloresProducto) setColoresProducto(data.coloresProducto);
    setProductoEditando(null);
    setErrors({});
  }, []);

  const isProductoDirty = useCallback((data) => {
    if (!data) return false;
    const fd = data.formData || formData;
    const ts = data.tallasStock || tallasStock;
    const ui = data.urlsImagenes || urlsImagenes;
    const cp = data.coloresProducto || coloresProducto;

    const hasNombre = Boolean(fd?.nombre && fd.nombre.trim());
    const hasCat = Boolean(fd?.idCategoria);
    const hasDesc = Boolean(fd?.descripcion && fd.descripcion.trim());
    const hasPrice = Boolean(
      (fd?.precioCompra && String(fd.precioCompra) !== '0' && String(fd.precioCompra) !== '') ||
      (fd?.precioVenta && String(fd.precioVenta) !== '0' && String(fd.precioVenta) !== '')
    );
    const hasImgs = Array.isArray(ui) && ui.some(u => u && u.trim());
    const hasCols = Array.isArray(cp) && cp.some(c => c && c.trim());
    const hasSizes = Array.isArray(ts) && ts.some(t => t.talla && t.talla.trim());

    return hasNombre || hasCat || hasDesc || hasPrice || hasImgs || hasCols || hasSizes;
  }, [formData, tallasStock, urlsImagenes, coloresProducto]);

  const {
    showDraftModal,
    setShowDraftModal,
    hasDraft,
    draftData,
    draftMeta,
    handleRegisterClick,
    restoreDraft,
    discardDraft,
    closeDraftModal,
    saveDraft,
    clearDraft
  } = useFormDraft({
    moduleId: 'producto',
    isEditing: !!productoEditando,
    modoVista,
    getFormData: () => ({
      formData,
      tallasStock,
      urlsImagenes,
      coloresProducto
    }),
    isDirty: isProductoDirty,
    getExtraInfo: (d) => d?.formData?.nombre ? `Producto: ${d.formData.nombre}` : null,
    onRestore: restoreDraftData,
    onDiscard: resetFormState,
    onOpenForm: () => setModoVista("formulario")
  });

  useEffect(() => {
    if (modoVista === 'formulario' && !productoEditando) {
      saveDraft({
        formData,
        tallasStock,
        urlsImagenes,
        coloresProducto
      });
    }
  }, [formData, tallasStock, urlsImagenes, coloresProducto, modoVista, productoEditando, saveDraft]);

  // 🔥 VALIDACIÓN CORREGIDA: Valida TODOS los campos y muestra TODOS los errores simultáneamente
  const validateForm = () => {
    const newErrors = {};

    // ✅ VALIDAR NOMBRE (independiente)
    if (!formData.nombre || !formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    // ✅ VALIDAR CATEGORÍA (independiente - sin else)
    if (!formData.idCategoria || formData.idCategoria === '' || formData.idCategoria === ' ') {
      newErrors.idCategoria = "La categoría es obligatoria";
    }

    // ✅ VALIDAR PRECIO DE VENTA (independiente - sin else)
    if (!formData.precioVenta || parseFloat(formData.precioVenta) <= 0) {
      newErrors.precioVenta = "El precio de venta debe ser mayor a 0";
    }

    // ✅ VALIDAR PRECIO DE OFERTA (si está activado - independiente)
    if (formData.enOfertaVenta && (!formData.precioOferta || parseFloat(formData.precioOferta) <= 0)) {
      newErrors.precioOferta = "El precio de oferta debe ser mayor a 0";
    }

    // ✅ VALIDAR PRECIO MAYORISTA +6 (independiente - sin else)
    if (!formData.precioMayorista6 || parseFloat(formData.precioMayorista6) <= 0) {
      newErrors.precioMayorista6 = "El precio mayorista (+6) debe ser mayor a 0";
    }

    // ✅ VALIDAR PRECIO MAYORISTA +80 (independiente - sin else)
    if (!formData.precioMayorista80 || parseFloat(formData.precioMayorista80) <= 0) {
      newErrors.precioMayorista80 = "El precio mayorista (+80) debe ser mayor a 0";
    }

    // ✅ VALIDAR DESCRIPCIÓN (independiente - sin else)
    if (!formData.descripcion || !formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    // ✅ VALIDAR IMÁGENES (independiente - sin else)
    const imagenesValidas = urlsImagenes.filter(url => url && url.trim() !== '');
    if (imagenesValidas.length === 0) {
      newErrors.imagenes = "Debe agregar al menos una imagen";
    }

    // ✅ VALIDAR COLORES (independiente - sin else)
    const coloresValidos = coloresProducto.filter(c => c && c.trim() !== '');
    if (coloresValidos.length === 0) {
      newErrors.colores = "Debe agregar al menos un color";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      showAlert("Por favor corrige los campos marcados en rojo", "error");
      return;
    }

    const tallasValidas = productoEditando 
      ? (productoEditando.tallasStock || [])
      : (tallasStock || [])
          .filter(t => t.talla?.trim() !== '')
          .map(t => ({ ...t, cantidad: parseInt(t.cantidad) || 0 }));

    const stockTotal = productoEditando 
      ? (Number(productoEditando.stock) || 0)
      : tallasValidas.reduce((acc, t) => acc + (Number(t.cantidad) || 0), 0);

    const payload = {
      ...formData,
      idCategoria: parseInt(formData.idCategoria),
      stock: stockTotal,
      tallasStock: tallasValidas,
      colores: coloresProducto.filter(c => c.trim() !== ''),
      imagenes: urlsImagenes.filter(url => url.trim() !== ''),
      categoria: categoriasRaw.find(c => String(c.id) === String(formData.idCategoria))?.nombre || "Sin Categoría"
    };

    const previousProductos = [...productos];
    try {
      if (productoEditando) {
        setProductos(prev => prev.map(p => p.id === productoEditando.id ? { ...p, ...payload } : p));
        setModoVista("lista");
        showAlert(`Actualizado correctamente ✅`);
        const updatedProd = await productosService.updateProducto(productoEditando.id, payload);
        const finalProductos = previousProductos.map(p => p.id === productoEditando.id ? updatedProd : p);
        setProductos(finalProductos);
        NitroCache.set(CACHE_KEY, finalProductos);
        notifySync();
      } else {
        setLoading(true);
        const newProd = await productosService.createProducto(payload);
        const finalProductos = [newProd, ...productos];
        setProductos(finalProductos);
        clearDraft();
        setModoVista("lista");
        showAlert(`Registrado correctamente ✅`);
        notifySync();
        NitroCache.set(CACHE_KEY, finalProductos);
      }
    } catch (error) {
      setProductos(previousProductos);
      const responseData = error?.response?.data;
      let msg;
      if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        msg = responseData.errors.join('. ');
      } else {
        msg = responseData?.message || error?.message || "Error al guardar";
      }
      showAlert(msg, "error");
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async () => {
    const producto = deleteModal.producto;
    if (!producto) return;
    const previousProductos = [...productos];
    setProductos(prev => prev.filter(p => p.id !== producto.id));
    closeDeleteModal();
    try {
      await productosService.deleteProducto(producto.id);
      showAlert('Eliminado exitosamente ✅'); 
      notifySync();
      const updated = previousProductos.filter(p => p.id !== producto.id);
      NitroCache.set(CACHE_KEY, updated);
    } catch (error) {
      setProductos(previousProductos);
      const msg = error?.response?.data?.message || "No se pudo eliminar";
      showAlert(msg, "error");
    }
  };

  const handleToggleStatus = async (producto) => {
    const newStatus = !producto.isActive;
    const previousProductos = [...productos];
    setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, isActive: newStatus } : p));
    try {
      await productosService.updateProducto(producto.id, { ...producto, isActive: newStatus });
      showAlert(`Producto ${newStatus ? 'activado' : 'desactivado'} ✅`);
      const updated = previousProductos.map(p => p.id === producto.id ? { ...p, isActive: newStatus } : p);
      NitroCache.set(CACHE_KEY, updated);
      notifySync();
    } catch (error) {
      setProductos(previousProductos);
      const msg = error?.response?.data?.message || "No se pudo cambiar el estado del producto";
      showAlert(msg, "error");
    }
  };

  return {
    modoVista, productoEditando, productoViendo, productos,
    searchTerm, setSearchTerm, categoriaFiltro,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage, alert, setAlert, deleteModal,
    formData, tallasStock, categoriasRaw, categoriasUnicas,
    availableTallas, urlsImagenes, coloresProducto, errors,
    loading, filteredProductos, paginatedProductos, totalPages,
    showingStart, endIndex,
    verTodos, setVerTodos,
    handleFilterSelect: (c) => { setCategoriaFiltro(c); setCurrentPage(1); },
    handleStatusSelect: (s) => { setFilterStatus(s); setCurrentPage(1); },
    agregarTalla: () => setTallasStock(prev => [...prev, { talla: "", cantidad: 0 }]),
    eliminarTalla: (idx) => setTallasStock(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [{ talla: "", cantidad: 0 }]),
    handleTallaChange: (idx, val) => {
      const exists = tallasStock.some((item, i) => i !== idx && item.talla === val);
      if (exists) {
        showAlert(`La talla "${val}" ya está agregada`, "error");
        return;
      }
      const n = [...tallasStock];
      n[idx].talla = val;
      setTallasStock(n);
    },
    incrementarCantidad: (idx) => {
      const n = [...tallasStock];
      const currentQty = parseInt(n[idx].cantidad) || 0;
      n[idx].cantidad = currentQty + 1;
      setTallasStock(n);
    },
    decrementarCantidad: (idx) => {
      const n = [...tallasStock];
      const currentQty = parseInt(n[idx].cantidad) || 0;
      if (currentQty > 0) {
        n[idx].cantidad = currentQty - 1;
      } else {
        n[idx].cantidad = 0;
      }
      setTallasStock(n);
    },
    handleCantidadChange: (idx, val) => {
      const n = [...tallasStock];
      if (val === '') {
        n[idx].cantidad = '';
      } else {
        const parsed = parseInt(val);
        n[idx].cantidad = isNaN(parsed) ? 0 : parsed;
      }
      setTallasStock(n);
    },
    agregarUrlImagen: () => urlsImagenes.length < 4 && setUrlsImagenes(prev => [...prev, '']),
    eliminarUrlImagen: (idx) => urlsImagenes.length > 1 && setUrlsImagenes(prev => prev.filter((_, i) => i !== idx)),
    actualizarUrlImagen: (idx, val) => { 
      const n = [...urlsImagenes]; 
      n[idx] = val; 
      setUrlsImagenes(n); 
      const imagenesValidas = n.filter(url => url.trim() !== '');
      if (imagenesValidas.length > 0 && errors.imagenes) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.imagenes;
          return newErrors;
        });
      }
    },
    agregarColor: () => coloresProducto.length < 2 && setColoresProducto(prev => [...prev, '']),
    eliminarColor: (idx) => coloresProducto.length > 1 && setColoresProducto(prev => prev.filter((_, i) => i !== idx)),
    actualizarColor: (idx, val) => { 
      const n = [...coloresProducto]; 
      n[idx] = val; 
      setColoresProducto(n);
      const coloresValidos = n.filter(c => c.trim() !== '');
      if (coloresValidos.length > 0 && errors.colores) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.colores;
          return newErrors;
        });
      }
    },
    mostrarLista: () => { setModoVista("lista"); setErrors({}); },
    mostrarFormulario: (p = null) => {
      setErrors({});
      if (p) {
        setFormData({ ...p, idCategoria: p.idCategoria || "" });
        setTallasStock(p.tallasStock || [{ talla: "", cantidad: 0 }]);
        setUrlsImagenes(p.imagenes || ['']);
        setColoresProducto(p.colores || ['']);
        setProductoEditando(p);
      } else {
        setFormData({ 
          nombre: "", 
          idCategoria: "", 
          precioCompra: "0", 
          precioVenta: "0", 
          precioOferta: "0", 
          precioMayorista6: "0", 
          precioMayorista80: "0", 
          enOfertaVenta: false, 
          enInventario: false, 
          stock: 0, 
          descripcion: "", 
          isActive: true 
        });
        setTallasStock([{ talla: "", cantidad: 0 }]);
        setUrlsImagenes(['']);
        setColoresProducto(['']);
        setProductoEditando(null);
      }
      setModoVista("formulario");
    },
    mostrarDetalle: (p) => { setProductoViendo(p); setModoVista("detalle"); setErrors({}); },
    handleSubmit,
    openDeleteModal: (p) => {
      if (p.isActive || p.isActive === 1 || p.isActive === 'true') {
        showAlert('Desactiva el producto antes de eliminarlo', 'error');
        return;
      }
      setDeleteModal({ isOpen: true, producto: p, customMessage: `¿Eliminar permanentemente "${p.nombre}"?` });
    },
    closeDeleteModal,
    handleDelete,
    handleInputChange: (e) => {
      const { name, value, type, checked } = e.target;
      const finalValue = type === 'checkbox' ? checked : value;
      setFormData(prev => ({ ...prev, [name]: finalValue }));
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    handleVerDetalle: (p) => { setProductoViendo(p); setModoVista("detalle"); },
    handleEditarProducto: (p) => {
      setProductoEditando(p);
      setFormData({
        nombre: p.nombre,
        idCategoria: p.idCategoria || p.IdCategoria || "",
        precioCompra: p.precioCompra || "0",
        precioVenta: p.precioVenta || "0",
        precioOferta: p.precioOferta || "0",
        precioMayorista6: p.precioMayorista6 || "0",
        precioMayorista80: p.precioMayorista80 || "0",
        enOfertaVenta: p.enOfertaVenta || false,
        descripcion: p.descripcion || "",
        enInventario: p.enInventario !== undefined ? p.enInventario : true,
        isActive: p.isActive !== undefined ? p.isActive : true
      });
      setTallasStock(p.tallasStock || [{ talla: "", cantidad: 0 }]);
      setUrlsImagenes(p.imagenes || ['']);
      setColoresProducto(p.colores || ['']);
      setModoVista("formulario");
    },
    handleToggleStatus,
    showDraftModal,
    setShowDraftModal,
    hasDraft,
    draftData,
    draftMeta,
    handleRegisterClick,
    restoreDraft,
    discardDraft,
    closeDraftModal
  };
};