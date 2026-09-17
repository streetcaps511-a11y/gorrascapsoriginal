/* === HOOK DE LÓGICA === */
import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../../shared/contexts";
import * as profileApi from "../services/profileApi";
import { NitroCache } from "../../../shared/utils/NitroCache";

export const useProfile = () => {
  const { user: authUser, logout: onLogout, isAdmin, updateUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ open: false, text: "" });
  
  const [formData, setFormData] = useState({
    documentType: "", documentNumber: "", name: "", email: "", phone: "",
    countryCode: "+57", city: "", address: "",
  });
  
  const [errors, setErrors] = useState({});
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredModalData, setExpiredModalData] = useState({ periodDays: 5, expiredDate: '', orderDate: '' });
  const [orderQuery, setOrderQuery] = useState("");
  const [returnQuery, setReturnQuery] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(authUser?.avatarUrl || "");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('account');
  const [orderView, setOrderView] = useState('list');
  const [returnView, setReturnView] = useState('list');
  const [isBulkReturn, setIsBulkReturn] = useState(false);
  const [orderStatus, setOrderStatus] = useState('Todos');
  const [returnStatus, setReturnStatus] = useState('Todos');
  
  const [returnFormData, setReturnFormData] = useState({
    replacementProductId: "", mismoModelo: false, evidence: null, reason: "", cantidad: 1, items: []
  });
  const [returnErrors, setReturnErrors] = useState({});
  const [showReturnForm, setShowReturnForm] = useState(false);
  
  const [ordersPage, setOrdersPage] = useState(1);
  const [returnsPage, setReturnsPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false, title: "", message: "", onConfirm: null, confirmText: "CONFIRMAR", isDanger: false, loading: false
  });
  const [initialProducts, setInitialProducts] = useState([]);

  // 🛡️ INICIALIZACIÓN SEGURA: NUNCA SERÁ UNDEFINED
  const [allOrders, setAllOrders] = useState(() => {
    try {
      const cached = NitroCache.get('user_orders');
      return Array.isArray(cached?.data) ? cached.data : [];
    } catch (e) { return []; }
  });
  
  const [allReturns, setAllReturns] = useState(() => {
    try {
      const cached = NitroCache.get('user_returns');
      return Array.isArray(cached?.data) ? cached.data : [];
    } catch (e) { return []; }
  });

  const [_isLoadingData, setIsLoadingData] = useState(false);
  const [hasLoadedOrders, setHasLoadedOrders] = useState(false);
  const [hasLoadedReturns, setHasLoadedReturns] = useState(false);

  useEffect(() => {
    if (activeTab === 'returns' && initialProducts.length === 0) {
      profileApi.getProducts().then(setInitialProducts).catch(() => {});
    }
  }, [activeTab, initialProducts.length]);

  useEffect(() => {
    if (selectedProduct && !isBulkReturn) {
      const qty = returnFormData.cantidad || 1;
      setReturnFormData(prev => {
        const currentItems = prev.items || [];
        const newItems = [...currentItems];
        if (newItems.length < qty) {
          for (let i = newItems.length; i < qty; i++) newItems.push({ mismoModelo: false, replacementProductId: "" });
        } else if (newItems.length > qty) {
          newItems.splice(qty);
        }
        return { ...prev, items: newItems };
      });
    }
  }, [returnFormData.cantidad, selectedProduct, isBulkReturn]);

  const isEditingRef = useRef(isEditing);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    if (authUser && !isEditing) {
      setUser(authUser);
      setFormData({
        documentType: authUser.DocumentoTipo || authUser.documentType || "",
        documentNumber: authUser.DocumentoNumero || authUser.documentNumber || "",
        name: authUser.Nombre || authUser.name || "",
        email: authUser.Correo || authUser.email || "",
        phone: authUser.Telefono || authUser.phone || "",
        countryCode: "+57",
        city: authUser.Ciudad || authUser.city || "",
        address: authUser.Direccion || authUser.address || "",
      });
      setAvatarUrl(authUser.avatarUrl || "");
    }
  }, [authUser, isEditing]);

  useEffect(() => {
    document.body.style.overflow = showPolicyModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showPolicyModal]);

  const showTopToast = (text) => {
    setToast({ open: true, text });
    setTimeout(() => setToast({ open: false, text: "" }), 2500);
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    const newErrors = {};
    
    // Tipo de Documento
    if (!formData.documentType || formData.documentType.trim() === '') {
      newErrors.documentType = 'El tipo de documento es obligatorio';
    }
    
    // Número de Documento
    const docNum = (formData.documentNumber || '').trim();
    if (!docNum) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    } else if (!/^\d+$/.test(docNum)) {
      newErrors.documentNumber = 'Solo se permiten números. Sin puntos ni caracteres especiales';
    } else {
      const type = formData.documentType;
      if (type === 'Cédula de Ciudadanía' && (docNum.length < 6 || docNum.length > 10)) newErrors.documentNumber = 'La CC debe tener entre 6 y 10 dígitos';
      else if (type === 'Tarjeta de Identidad' && (docNum.length < 5 || docNum.length > 11)) newErrors.documentNumber = 'La TI debe tener entre 5 y 11 dígitos';
      else if (type === 'Cédula de Extranjería' && (docNum.length < 6 || docNum.length > 7)) newErrors.documentNumber = 'La CE debe tener entre 6 y 7 dígitos';
      else if (type === 'NIT' && docNum.length !== 9) newErrors.documentNumber = 'El NIT debe tener exactamente 9 dígitos';
      else if ((type === 'Pasaporte' || type === 'Permiso Especial (PEP)') && (docNum.length < 5 || docNum.length > 20)) newErrors.documentNumber = 'Ingresa un número válido (5-20 caracteres)';
      else if (docNum.length < 4) newErrors.documentNumber = 'El número de documento es muy corto';
    }

    // Nombre
    const nameVal = (formData.name || '').trim();
    if (!nameVal) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (nameVal.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Correo Electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailVal = (formData.email || '').trim();
    if (!emailVal) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(emailVal)) {
      newErrors.email = 'Ingresa un correo válido (ej: nombre@gmail.com)';
    }

    // Teléfono
    const code = formData.countryCode || '+57';
    const phoneVal = (formData.phone || '').trim();
    if (!phoneVal) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d+$/.test(phoneVal)) {
      newErrors.phone = 'Solo se permiten números. Sin espacios ni caracteres especiales';
    } else {
      const expected = code === '+507' ? 8 : (code === '+34' || code === '+56' || code === '+51') ? 9 : 10;
      if (phoneVal.length !== expected) newErrors.phone = `El teléfono debe tener ${expected} dígitos`;
      else if (code === '+57' && !phoneVal.startsWith('3')) newErrors.phone = 'El teléfono debe empezar con 3 (ej: 300, 310...)';
    }

    // Ciudad
    const cityVal = (formData.city || '').trim();
    if (!cityVal) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    // Dirección
    const addressVal = (formData.address || '').trim();
    if (!addressVal) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showTopToast("Completa todos los campos obligatorios.");
      return;
    }

    setErrors({});
    const updatedUser = {
      ...user,
      DocumentoTipo: formData.documentType, documentType: formData.documentType,
      DocumentoNumero: formData.documentNumber, documentNumber: formData.documentNumber,
      Nombre: formData.name, name: formData.name,
      Correo: formData.email, email: formData.email,
      Telefono: formData.phone, phone: formData.phone,
      Ciudad: formData.city, city: formData.city,
      Direccion: formData.address, address: formData.address,
      avatarUrl: avatarUrl || "",
    };

    await profileApi.updateProfile(updatedUser);
    setUser(updatedUser);
    if (updateUser) updateUser(updatedUser);
    setIsEditing(false);
    showTopToast("Cambios guardados correctamente.");
  };

  const handleChange = (e) => {
    const name = e.target?.name || e.name;
    let value = e.target?.value !== undefined ? e.target.value : e.value;
    
    if (name === 'phone') {
      const code = formData.countryCode || '+57';
      const maxLength = code === '+507' ? 8 : (code === '+34' || code === '+56' || code === '+51') ? 9 : 10;
      value = String(value).replace(/\D/g, '').slice(0, maxLength);
    }
    if (name === 'documentNumber') {
      value = String(value).replace(/\D/g, '');
    }
    
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const getAvatarInitial = () => {
    const name = (formData.name || user?.Nombre || user?.name || "").trim();
    const email = (formData.email || user?.Correo || user?.email || "").trim();
    return (name ? name.charAt(0) : (email ? email.charAt(0) : "U")).toUpperCase();
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const newAvatar = reader.result;
      setAvatarUrl(newAvatar);
      if (updateUser) updateUser({ ...user, avatarUrl: newAvatar, FotoPerfil: newAvatar });
      setShowAvatarMenu(false);
      try {
        await profileApi.updateProfile({ ...formData, avatarUrl: newAvatar });
        showTopToast("Foto de perfil actualizada.");
      } catch {
        showTopToast("Error al guardar la foto.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = async (capturedImageBase64) => {
    setAvatarUrl(capturedImageBase64);
    if (updateUser) updateUser({ ...user, avatarUrl: capturedImageBase64, FotoPerfil: capturedImageBase64 });
    try {
      await profileApi.updateProfile({ ...formData, avatarUrl: capturedImageBase64 });
      showTopToast("Foto de perfil actualizada.");
    } catch {
      showTopToast("Error al guardar la foto.");
    }
  };

  const removeAvatar = () => {
    setConfirmModal({
      open: true, title: "Eliminar foto de perfil", message: "¿Estás seguro de eliminar tu foto de perfil?",
      confirmText: "ACEPTAR", isDanger: true, loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await profileApi.updateProfile({ ...formData, avatarUrl: "" });
          setAvatarUrl("");
          if (updateUser) updateUser({ ...user, avatarUrl: "", FotoPerfil: "" });
          setShowAvatarMenu(false);
          setConfirmModal(prev => ({ ...prev, open: false, loading: false }));
          showTopToast("Foto eliminada.");
        } catch {
          showTopToast("Error al eliminar la foto.");
          setConfirmModal(prev => ({ ...prev, open: false, loading: false }));
        }
      }
    });
  };

  const openImage = (src) => { if (src) { setImageModalSrc(src); setShowImageModal(true); } };

  const isReturnExpired = (order) => {
    if (!order?.fechaEntrega && !order?.rawFecha) return true;
    const baseDate = new Date(order.fechaEntrega || order.rawFecha);
    if (isNaN(baseDate.getTime())) return true;
    return (new Date() - baseDate) / (1000 * 60) > 2;
  };

  const checkReturnPeriod = (order) => {
    if (isReturnExpired(order)) {
      const baseDate = new Date(order?.fechaEntrega || order?.rawFecha || Date.now());
      const expirationDate = new Date(baseDate);
      expirationDate.setHours(expirationDate.getHours() + 48);
      setExpiredModalData({
        periodDays: 48,
        orderDate: baseDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        expiredDate: expirationDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      });
      setShowExpiredModal(true);
      return false;
    }
    return true;
  };

  const handleReturnClick = (product, order) => {
    if (!checkReturnPeriod(order)) return;
    const selId = Number(order.id.replace('PED-', ''));
    const normalizedSelId = selId > 1000 ? selId - 1000 : selId;
    const safeReturns = Array.isArray(allReturns) ? allReturns : [];
    const alreadyReturnedQty = safeReturns.filter(r => {
      const isMatch = Number(r.rawOrderId) === normalizedSelId && Number(r.productId) === Number(product.id);
      return isMatch && !String(r.status).toLowerCase().includes('rechazad');
    }).reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
    
    const maxQty = (parseInt(product.qty) || 1) - alreadyReturnedQty;
    if (maxQty <= 0) {
      showTopToast("Ya se solicitó cambio de todas las unidades.");
      return;
    }
    setIsBulkReturn(false);
    setSelectedProduct({ ...product, orderId: order.id, maxQty });
    setReturnFormData({ replacementProductId: "", mismoModelo: false, evidence: null, reason: "", cantidad: 1, items: [{ mismoModelo: false, replacementProductId: "" }] });
    setReturnErrors({});
    setShowPolicyModal(true);
    setActiveTab('returns');
  };

  const handleBulkReturnClick = (order) => {
    if (!order?.items?.length || !checkReturnPeriod(order)) return;
    const safeReturns = Array.isArray(allReturns) ? allReturns : [];
    if (safeReturns.some(r => r.orderId === order.id && !String(r.status).toLowerCase().includes('rechazad'))) {
      showTopToast("Este pedido ya tiene solicitudes activas.");
      return;
    }
    setIsBulkReturn(true);
    setSelectedProduct({ ...order.items[0], orderId: order.id });
    setReturnFormData({ replacementProductId: "", mismoModelo: false, evidence: null, reason: "" });
    setReturnErrors({});
    setShowPolicyModal(true);
    setActiveTab('returns');
  };

  const handleContinueToReturn = () => {
    setShowPolicyModal(false);
    setShowReturnForm(true);
    setReturnView('form');
  };

  const handleReturnImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReturnFormData(prev => ({ ...prev, evidence: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const getPriceNum = (price) => {
    if (typeof price === 'number') return Math.floor(price);
    if (!price) return 0;
    return parseInt(String(price).split(',')[0].replace(/[^0-9]/g, ''), 10) || 0;
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!returnFormData.reason.trim()) errs.reason = true;
    if (!returnFormData.evidence) errs.evidence = true;
    
    if (!isBulkReturn) {
      const targetSize = selectedProduct?.size || "U";
      const items = returnFormData.items || [];
      items.forEach(item => {
        if (!item.mismoModelo && item.replacementProductId) {
          const replacement = initialProducts.find(p => String(p.id) === String(item.replacementProductId));
          const originalProductMatch = initialProducts.find(op => String(op.id) === String(selectedProduct.id));
          const originalPrice = originalProductMatch ? Math.floor(Number(originalProductMatch.precio)) : getPriceNum(selectedProduct?.price);
          if (replacement && Math.floor(Number(replacement.precio)) !== originalPrice) errs.priceMismatch = true;
        }
      });
      
      const tally = {};
      items.forEach(item => {
        if (item.mismoModelo) tally[String(selectedProduct.id)] = (tally[String(selectedProduct.id)] || 0) + 1;
        else if (item.replacementProductId) tally[String(item.replacementProductId)] = (tally[String(item.replacementProductId)] || 0) + 1;
      });
      
      for (const [prodId, reqQty] of Object.entries(tally)) {
        const isOriginal = String(prodId) === String(selectedProduct.id);
        const prod = initialProducts.find(p => String(p.id) === (isOriginal ? String(selectedProduct.id) : prodId));
        let availableQty = 0;
        if (prod) {
          if (isOriginal && prod.tallasStock) {
            const sizeObj = prod.tallasStock.find(ts => String(ts.talla).trim().toUpperCase() === targetSize.trim().toUpperCase());
            availableQty = sizeObj ? (parseInt(sizeObj.cantidad) || 0) : (prod.tallas?.includes(targetSize) ? 999 : 0);
          } else if (prod.tallasStock) {
            availableQty = prod.tallasStock.reduce((sum, ts) => sum + (parseInt(ts.cantidad) || 0), 0);
          } else {
            availableQty = prod.tallas?.length > 0 ? 999 : 0;
          }
        }
        if (availableQty < reqQty) { errs.noStock = true; break; }
      }
    }
    
    if (Object.keys(errs).length > 0) {
      setReturnErrors(errs);
      if (errs.priceMismatch) showTopToast("El precio del reemplazo debe ser igual.");
      else if (errs.noStock) showTopToast("No hay suficiente stock disponible.");
      else if (errs.evidence) showTopToast("La foto de evidencia es obligatoria.");
      else showTopToast("Completa los campos obligatorios.");
      return;
    }
    
    setConfirmModal({
      open: true, title: "Confirmar Solicitud", message: "¿Deseas enviar tu solicitud? No podrás editarla después.",
      confirmText: "ACEPTAR", loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          const commonData = {
            idCliente: authUser.idCliente || authUser.IdCliente || authUser.id,
            idVenta: Number(String(selectedProduct.orderId).replace('PED-', '')) > 1000 ? Number(String(selectedProduct.orderId).replace('PED-', '')) - 1000 : Number(String(selectedProduct.orderId).replace('PED-', '')),
            motivo: returnFormData.reason,
            evidencia: returnFormData.evidence,
            cantidad: isBulkReturn ? undefined : Number(returnFormData.cantidad || 1)
          };
          
          if (isBulkReturn) {
            await profileApi.createReturn({
              ...commonData, idProductoOriginal: null, idProductoCambio: null, mismoModelo: true, pedidoCompleto: true, idLote: null,
              cantidad: selectedOrder.items.reduce((acc, item) => acc + Number(item.qty), 0),
              precioUnitario: getPriceNum(selectedOrder.total), talla: null
            });
          } else {
            const hasMultipleItems = returnFormData.items && returnFormData.items.length > 1;
            await profileApi.createReturn({
              ...commonData, idLote: hasMultipleItems ? `LOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}` : null, pedidoCompleto: false,
              items: returnFormData.items.map(item => ({
                idProductoOriginal: Number(selectedProduct.id),
                idProductoCambio: item.mismoModelo ? Number(selectedProduct.id) : (item.replacementProductId ? Number(item.replacementProductId) : null),
                mismoModelo: item.mismoModelo, cantidad: 1, precioUnitario: getPriceNum(selectedProduct.price), talla: selectedProduct.size,
              }))
            });
          }
          setIsBulkReturn(false);
          setShowSuccessModal(true);
          setShowReturnForm(false);
          setReturnView('list');
          setConfirmModal(prev => ({ ...prev, open: false, loading: false }));
          loadProfileData();
        } catch (err) {
          showTopToast(err.response?.data?.message || "No se pudo enviar.");
          setConfirmModal(prev => ({ ...prev, loading: false }));
        }
      },
      onCancel: () => setConfirmModal(p => ({ ...p, open: false }))
    });
  };

  const deactivateAccount = async () => {
    try { await profileApi.deactivateAccount(); onLogout(); } 
    catch { showTopToast("Error al desactivar."); }
  };

  const deleteAccount = async () => {
    try { await profileApi.deleteAccountPermanently(); onLogout(); } 
    catch (error) { showTopToast(error.response?.data?.message || "Error al eliminar."); }
  };

  const handleMarkAsReceived = async (orderId) => {
    setConfirmModal({
      open: true, title: "Confirmar Entrega", message: "¿Confirmas que recibiste el pedido?",
      confirmText: "CONFIRMAR", loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        const updateFn = o => (o.id === orderId || o.id === `PED-${orderId}`) ? { ...o, statusenvio: 'Entregado' } : o;
        setAllOrders(prev => prev.map(updateFn));
        setSelectedOrder(prev => (prev && (prev.id === orderId || prev.id === `PED-${orderId}`)) ? updateFn(prev) : prev);
        showTopToast("¡Pedido finalizado!");
        try {
          await profileApi.markOrderAsReceived(orderId);
          loadProfileData(true);
          setConfirmModal(prev => ({ ...prev, open: false, loading: false }));
        } catch {
          showTopToast("Error, pero se actualizará pronto.");
          loadProfileData(true);
          setConfirmModal(prev => ({ ...prev, open: false, loading: false }));
        }
      }
    });
  };

  const loadOrders = async (silent = false) => {
    if (!silent && !hasLoadedOrders) setIsLoadingData(true);
    try {
      const orders = await profileApi.getMyOrders();
      const mappedOrders = mapOrders(orders || []);
      setAllOrders(mappedOrders);
      NitroCache.set('user_orders', mappedOrders);
      setHasLoadedOrders(true);
      setSelectedOrder(prev => prev ? (mappedOrders.find(o => o.id === prev.id) || prev) : null);
    } catch (err) { console.error("Error loading orders:", err); } 
    finally { setIsLoadingData(false); }
  };

  const loadReturns = async (silent = false) => {
    if (!silent && !hasLoadedReturns) setIsLoadingData(true);
    try {
      const returns = await profileApi.getMyReturns();
      const mappedReturns = mapReturns(returns || []);
      setAllReturns(mappedReturns);
      NitroCache.set('user_returns', mappedReturns);
      setHasLoadedReturns(true);
      setSelectedReturn(prev => prev ? (mappedReturns.find(r => r.id === prev.id) || prev) : null);
    } catch (err) { console.error("Error loading returns:", err); } 
    finally { setIsLoadingData(false); }
  };

  const loadProfileInfo = async () => {
    if (isEditingRef.current) return;
    try {
      const perfil = await profileApi.getMiPerfil();
      if (perfil && !isEditingRef.current) updateProfileState(Array.isArray(perfil) ? perfil[0] : perfil);
    } catch (err) { console.error("Error loading profile:", err); }
  };

  const updateProfileState = (profileData) => {
    setAvatarUrl(profileData.avatarUrl || "");
    setFormData(prev => ({
      ...prev,
      documentType: profileData.tipoDocumento || profileData.TipoDocumentoTexto || profileData.TipoDocumento || prev.documentType,
      documentNumber: profileData.numeroDocumento || profileData.Documento || profileData.numero_documento || prev.documentNumber,
      name: profileData.nombreCompleto || profileData.Nombre || profileData.nombre || prev.name,
      phone: profileData.telefono || profileData.Telefono || profileData.phone || prev.phone,
      email: profileData.email || profileData.Email || profileData.Correo || prev.email,
      city: profileData.ciudad || profileData.Ciudad || prev.city,
      address: profileData.direccion || profileData.Direccion || prev.address
    }));
    setUser(prev => ({
      ...prev, ...profileData,
      Nombre: profileData.Nombre || profileData.nombreCompleto || profileData.nombre || prev?.Nombre,
      Telefono: profileData.Telefono || profileData.telefono || profileData.phone || prev?.Telefono,
      Correo: profileData.Email || profileData.email || profileData.Correo || prev?.Correo,
      Direccion: profileData.Direccion || profileData.direccion || prev?.Direccion
    }));
  };

  const mapOrders = (orders) => {
    const normalizeStatus = (order) => {
      const lower = String(order.idEstado || order.IdEstado || order.estado || order.estadoVenta?.nombre || 'Pendiente').toLowerCase();
      if (lower.includes('completad') || lower.includes('aprob')) return 'Completada';
      if (lower.includes('rechaz') || lower.includes('anulad')) return 'Rechazado';
      return 'Pendiente';
    };
    const statusColorMap = { 'Completada': '#10b981', 'Rechazado': '#ef4444', 'Anulado': '#6b7280', 'Pendiente': '#FFC107' };
    const getImageUrl = (raw) => {
      if (!raw) return null;
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (typeof raw === 'string') {
        if (raw.startsWith('/uploads')) return `${baseUrl}${raw}`;
        if (raw.includes("urlmovil-1.onrender.com")) return raw.replace("https://urlmovil-1.onrender.com", baseUrl);
      }
      return raw;
    };
    return (orders || []).map(o => ({
      id: `PED-${1000 + (o.id || 0)}`,
      date: new Date(o.fecha || Date.now()).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      total: `$${Number(o.total || 0).toLocaleString('es-CO')}`,
      status: normalizeStatus(o),
      statusColor: statusColorMap[normalizeStatus(o)] || '#FFC107',
      statusenvio: o.statusenvio || o.StatusEnvio || ((o.tipoEntrega || o.TipoEntrega) === 'recoger' ? 'Preparando' : 'Por enviar'),
      tipoEntrega: o.tipoEntrega || o.TipoEntrega || null,
      paymentMethod: o.metodoPago,
      address: o.direccion || o.direccionEnvio || "Medellín, Colombia",
      phone: o.telefono || o.Telefono || o.Teléfono || null,
      receipt: getImageUrl(o.comprobante || o.Comprobante || o.evidencia),
      receipt2: getImageUrl(o.comprobante2 || o.Comprobante2),
      monto1: o.monto1 || 0, monto2: o.monto2 || 0,
      rejectionReason: o.motivoRechazo || o.MotivoRechazo || null,
      fechaEntrega: o.fechaEntrega || o.FechaEntrega || null,
      rawFecha: o.fecha || null,
      items: (o.detalles || []).map(d => ({
        id: d.idProducto || d.id, name: d.producto?.nombre || "Producto",
        price: `$${Number(d.precio || d.precioUnitario || d.producto?.precioVenta || 0).toLocaleString('es-CO')}`,
        size: d.talla || "U", qty: d.cantidad,
        image: d.producto?.imagenes?.[0] || "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraazultodaNY_cyfchf.jpg"
      }))
    }));
  };

  const mapReturns = (returns) => {
    const getImageUrl = (raw) => {
      if (!raw) return null;
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (typeof raw === 'string') {
        if (raw.startsWith('/uploads')) return `${baseUrl}${raw}`;
        if (raw.includes("urlmovil-1.onrender.com")) return raw.replace("https://urlmovil-1.onrender.com", baseUrl);
      }
      return raw;
    };
    return (returns || []).map(r => {
      let statusName = r.idEstado || r.estado || "Pendiente";
      if (statusName === 1 || statusName === "1") statusName = "Completada";
      else if (statusName === 2 || statusName === "2") statusName = "Pendiente";
      else if (statusName === 3 || statusName === "3") statusName = "Rechazada";
      
      const originalItem = r.ventaOriginal?.detalles?.find(d => String(d.idProducto) === String(r.idProducto));
      const pImg = Array.isArray(r.productoInfo?.imagenes) ? r.productoInfo.imagenes[0] : null;
      const colorMap = { 'Aprobada': '#10b981', 'Completada': '#10b981', 'Rechazada': '#ef4444', 'Rechazado': '#ef4444', 'Anulado': '#6b7280', 'Anulada': '#6b7280', 'Pendiente': '#FFC107' };
      const isPedidoCompleto = r.pedidoCompleto || r.PedidoCompleto || false;
      const parsedAmount = parseFloat(r.valor || r.precioUnitario || 0);
      
      return {
        id: `DEV-${r.noDevolucion || (1000 + (r.id || 0))}`,
        orderId: `PED-${1000 + (r.idVenta || 0)}`,
        rawOrderId: r.idVenta,
        productId: r.idProducto,
        size: r.talla || originalItem?.talla || "U",
        quantity: r.cantidad || originalItem?.cantidad || 1,
        date: new Date(r.fecha || Date.now()).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: statusName,
        statusColor: colorMap[statusName] || '#FFC107',
        productName: r.productoOriginal || r.nombreProductoOriginal || r.productoInfo?.nombre || "Producto",
        amount: `$${Number(parsedAmount).toLocaleString('es-CO')}`,
        reason: r.motivo || r.descripcion || "Cambio por talla",
        rejectionReason: r.observacion || null,
        productImage: getImageUrl(pImg) || "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraazultodaNY_cyfchf.jpg",
        evidenceImage: getImageUrl(r.evidencia || r.evidenciaUrl) || "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraazultodaNY_cyfchf.jpg",
        mismoModelo: (r.mismoModelo === true || r.MismoModelo === true) || (String(r.idProducto || r.IdProducto) === String(r.idProductoCambio || r.IdProductoCambio)),
        replacementProductName: r.productoCambio || r.ProductoCambio || r.producto_cambio || r.product_cambio,
        idLote: r.idLote || null,
        precio: parsedAmount,
        pedidoCompleto: isPedidoCompleto,
        isLot: isPedidoCompleto,
        totalAmount: parsedAmount,
        items: isPedidoCompleto && r.ventaOriginal?.detalles ? r.ventaOriginal.detalles.map(item => ({
          id: item.idProducto || item.id, productName: item.producto?.nombre || item.NombreProducto || "Producto",
          amount: `$${Number(item.precio || 0).toLocaleString('es-CO')}`, price: `$${Number(item.precio || 0).toLocaleString('es-CO')}`,
          size: item.talla || "U", quantity: parseInt(item.cantidad || 1), qty: parseInt(item.cantidad || 1),
          productImage: getImageUrl(item.producto?.imagenes?.[0]) || "https://res.cloudinary.com/dxc5qqsjd/image/upload/v1762910780/gorraazultodaNY_cyfchf.jpg"
        })) : []
      };
    });
  };

  const loadProfileData = async (silent = false) => {
    await Promise.all([loadProfileInfo(), loadOrders(silent), loadReturns(silent)]);
  };

  useEffect(() => { if (authUser) loadProfileInfo(); }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    if (activeTab === 'account') { loadOrders(); loadReturns(); }
    else if (activeTab === 'orders') loadOrders();
    else if (activeTab === 'returns') loadReturns();
  }, [activeTab, authUser]);

  useEffect(() => {
    if (!authUser) return;
    const channel = new BroadcastChannel('app_sync');
    channel.onmessage = (event) => {
      if (event.data === 'ventas_updated' || event.data === 'admin_sync') loadProfileData(true);
    };
    const interval = setInterval(() => {
      if (activeTab === 'account' || activeTab === 'orders') loadOrders(true);
      if (activeTab === 'account' || activeTab === 'returns') loadReturns(true);
      loadProfileInfo();
    }, 10000);
    return () => { channel.close(); clearInterval(interval); };
  }, [authUser, activeTab, selectedOrder]);

  // 🛡️ FILTROS BLINDADOS: NUNCA FALLARÁN POR UNDEFINED
  const filteredOrders = useMemo(() => {
    const safeOrders = Array.isArray(allOrders) ? allOrders : [];
    const q = orderQuery.toLowerCase();
    return safeOrders.filter(o => {
      const matchQuery = o.id.toLowerCase().includes(q) || o.status.toLowerCase().includes(q);
      const matchStatus = orderStatus === 'Todos' || o.status === orderStatus;
      return matchQuery && matchStatus;
    }).sort((a, b) => {
      const idA = parseInt(a.id.replace('PED-', '')) || 0;
      const idB = parseInt(b.id.replace('PED-', '')) || 0;
      return idB - idA;
    });
  }, [allOrders, orderQuery, orderStatus]);

  const groupedReturns = useMemo(() => {
    const safeReturns = Array.isArray(allReturns) ? allReturns : [];
    const grouped = [];
    const lotMap = new Map();
    safeReturns.forEach(r => {
      if (r.idLote) {
        if (!lotMap.has(r.idLote)) {
          lotMap.set(r.idLote, { ...r, isLot: true, items: [r], totalAmount: parseFloat(r.precio || 0) });
          grouped.push(lotMap.get(r.idLote));
        } else {
          const lot = lotMap.get(r.idLote);
          lot.items.push(r);
          lot.totalAmount += parseFloat(r.precio || 0);
        }
      } else {
        grouped.push({ ...r, isLot: r.pedidoCompleto || false });
      }
    });
    return grouped.sort((a, b) => {
      const dateB = new Date(b.date || b.fecha || 0);
      const dateA = new Date(a.date || a.fecha || 0);
      return dateB - dateA;
    });
  }, [allReturns]);

  const filteredReturns = useMemo(() => {
    const safeGrouped = Array.isArray(groupedReturns) ? groupedReturns : [];
    const q = returnQuery.toLowerCase();
    return safeGrouped.filter(r => {
      const displayName = r.isLot ? "devolución de pedido" : (r.productName || "");
      const matchQuery = r.id.toLowerCase().includes(q) || displayName.toLowerCase().includes(q) || (r.status || "").toLowerCase().includes(q);
      const matchStatus = returnStatus === 'Todos' ||
        (returnStatus === 'Completado' && (r.status === 'Completada' || r.status === 'Completado')) ||
        (returnStatus === 'Rechazado' && (r.status === 'Rechazada' || r.status === 'Rechazado')) ||
        r.status === returnStatus;
      return matchQuery && matchStatus;
    });
  }, [groupedReturns, returnQuery, returnStatus]);

  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);
  const paginatedReturns = filteredReturns.slice((returnsPage - 1) * ITEMS_PER_PAGE, returnsPage * ITEMS_PER_PAGE);
  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const totalReturnPages = Math.ceil(filteredReturns.length / ITEMS_PER_PAGE);

  return {
    user, authUser, isAdmin, onLogout, isEditing, setIsEditing, toast, errors,
    formData, setFormData, showPolicyModal, setShowPolicyModal, showExpiredModal, setShowExpiredModal, expiredModalData, orderQuery, setOrderQuery,
    returnQuery, setReturnQuery, avatarUrl, showAvatarMenu, setShowAvatarMenu, fileInputRef,
    activeTab, setActiveTab, orderView, setOrderView, returnView, setReturnView,
    orderStatus, setOrderStatus, returnStatus, setReturnStatus, returnFormData, setReturnFormData,
    returnErrors, showReturnForm, ordersPage, setOrdersPage, returnsPage, setReturnsPage,
    selectedOrder, setSelectedOrder, selectedReturn, setSelectedReturn, selectedProduct,
    showImageModal, setShowImageModal, imageModalSrc, showSuccessModal, setShowSuccessModal,
    confirmModal, setConfirmModal, initialProducts, paginatedOrders, paginatedReturns,
    totalOrderPages, totalReturnPages, 
    allOrders: allOrders || [], // 🛡️ GARANTÍA DE QUE NUNCA ES UNDEFINED
    allReturns: allReturns || [], // 🛡️ GARANTÍA DE QUE NUNCA ES UNDEFINED
    showTopToast, isBulkReturn, setIsBulkReturn, handleBulkReturnClick, groupedReturns: groupedReturns || [],
    handleEditClick, handleSaveClick, handleChange, getAvatarInitial, openFilePicker,
    onPickAvatar, removeAvatar, openImage, handleReturnClick, handleContinueToReturn,
    handleReturnImageUpload, handleReturnSubmit, getPriceNum, deactivateAccount, deleteAccount,
    handleMarkAsReceived, showWebcamModal, setShowWebcamModal, handleWebcamCapture, isReturnExpired, BULK_MIN_QTY: 6
  };
};