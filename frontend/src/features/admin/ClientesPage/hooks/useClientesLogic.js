/* === HOOK DE LÓGICA ===
Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo.
Separa la 'inteligencia' de la interfaz visual para mantener el código limpio.
Recibe eventos de la UI y se comunica con los Servicios API. */
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../shared/services/api';
import { NitroCache } from '../../../shared/utils/NitroCache';
import {
  fetchAllClientes,
  createNewCliente,
  updateExistingCliente,
  deleteExistingCliente,
  toggleClienteStatus
} from "../services/clientesApi";

// 🧠 MEMORIA GLOBAL (Caché Nitro)
let clientesCache = {
  clientes: [],
  isInitialized: false
};

//  CONFIGURACIÓN INICIAL (Caché Nitro Persistente)
const getInitialClientes = () => {
  const cached = NitroCache.get('clientes');
  return Array.isArray(cached?.data) ? cached.data : [];
};

export const useClientesLogic = () => {
  const initialClientes = getInitialClientes();
  const [clientes, setClientes] = useState(initialClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'view',
    cliente: null
  });
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+57',
    address: '',
    country: 'Colombia',
    city: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cliente: null, customMessage: '' });
  const firstInputRef = useRef(null);

  const filtered = clientes.filter(c => {
    const search = (
      (c.nombreCompleto || '') +
      (c.email || '') +
      (c.telefono || '') +
      (c.numeroDocumento || '') +
      (c.ciudad || '') +
      (c.departamento || '') +
      (c.tipoDocumento || '')
    ).toLowerCase().includes(searchTerm.toLowerCase());
    const status = filterStatus === 'Todos' ||
      (filterStatus === 'Activos' && c.isActive) ||
      (filterStatus === 'Inactivos' && !c.isActive);
    return search && status;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
  const paginatedClientes = filtered.slice(startIndex, endIndex);
  const showingStart = filtered.length > 0 ? startIndex + 1 : 0;

  const loadClientes = async () => {
    try {
      const data = await fetchAllClientes();
      setClientes(data);
      NitroCache.set('clientes', data);
    } catch (error) {
      console.error("Error loading clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) {
      const timer = setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [modalState.isOpen, modalState.mode]);

  const showAlert = useCallback((message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const openModal = (mode = 'create', cliente = null) => {
    setModalState({ isOpen: true, mode, cliente });
    setErrors({});
    if (cliente && (mode === 'edit' || mode === 'view')) {
      setFormData({
        documentType: cliente.tipoDocumento,
        documentNumber: cliente.numeroDocumento,
        fullName: cliente.nombreCompleto,
        email: cliente.email,
        phone: cliente.telefono,
        countryCode: '+57',
        address: cliente.direccion,
        country: cliente.pais || 'Colombia',
        city: cliente.ciudad,
        isActive: cliente.isActive
      });
    } else {
      setFormData({
        documentType: '',
        documentNumber: '',
        fullName: '',
        email: '',
        phone: '',
        countryCode: '+57',
        address: '',
        country: 'Colombia',
        city: '',
        isActive: true
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'view', cliente: null });
    setFormData({
      documentType: '',
      documentNumber: '',
      fullName: '',
      email: '',
      phone: '',
      countryCode: '+57',
      address: '',
      country: 'Colombia',
      city: '',
      isActive: true
    });
    setErrors({});
  };

  // 🔍 Validar duplicados en tiempo real (onBlur)
  const validateDuplicate = async (field, value) => {
    if (!value?.trim()) return;
    
    try {
      const params = {};
      if (field === 'email') {
        params.email = value.trim();
      } else if (field === 'documentNumber') {
        params.documento = value.trim();
      }
      if (modalState.mode === 'edit' && modalState.cliente) {
        params.excludeClienteId = modalState.cliente.id;
      }
      const checkResponse = await api.get('/api/auth/check-exists', { params });
      if (checkResponse.data.success) {
        const newErrors = {};
        if (checkResponse.data.emailExists) {
          newErrors.email = 'El correo electrónico ya está registrado';
        }
        if (checkResponse.data.documentoExists) {
          newErrors.documentNumber = 'El número de documento ya está registrado';
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
        }
      }
    } catch (err) {
      console.warn("Error checking existence:", err);
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      const newErr = { ...errors };
      delete newErr[field];
      setErrors(newErr);
    }
    
    if (field === 'country') {
      setFormData(prev => ({ ...prev, country: value, city: '' }));
    } else if (field === 'documentType') {
      // Limpiar errores de documentNumber cuando cambia el tipo de documento
      if (errors.documentNumber) {
        const newErr = { ...errors };
        delete newErr.documentNumber;
        setErrors(newErr);
      }
      setFormData(prev => ({ ...prev, [field]: value, documentNumber: '' }));
    } else if (field === 'documentNumber') {
      const isAlphanumeric = value && (formData.documentType === 'NIT' || formData.documentType === 'Pasaporte');
      const limit = formData.documentType === 'NIT' ? 10 : (formData.documentType === 'Pasaporte' ? 20 : 15);
      const val = isAlphanumeric ? value.slice(0, limit) : value.replace(/\D/g, '').slice(0, limit);
      setFormData(prev => ({ ...prev, [field]: val }));
    } else if (field === 'phone') {
      const code = formData.countryCode || '+57';
      const digits = value.replace(/\D/g, '');
      const maxLength = code === '+507' ? 8 : (code === '+34' || code === '+56' || code === '+51') ? 9 : 10;
      let val = digits.slice(0, maxLength);
      
      // 🇨🇴 Colombia: formato con separación (300 123 4567)
      if (code === '+57' && val.length > 3) {
        if (val.length <= 6) {
          val = val.slice(0, 3) + ' ' + val.slice(3);
        } else {
          val = val.slice(0, 3) + ' ' + val.slice(3, 6) + ' ' + val.slice(6);
        }
      }
      // 🇻🇪 Venezuela y otros países: sin separación, solo números seguidos
      
      setFormData(prev => ({ ...prev, [field]: val }));
    } else if (field === 'countryCode') {
      // Limpiar el teléfono cuando cambia el código de país
      setFormData(prev => ({ ...prev, [field]: value, phone: '' }));
      if (errors.phone) {
        const newErr = { ...errors };
        delete newErr.phone;
        setErrors(newErr);
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.documentType) newErrors.documentType = 'Tipo de documento es obligatorio';
    if (!formData.documentNumber?.trim()) {
      newErrors.documentNumber = 'Número de documento es obligatorio';
    } else if (formData.documentType === 'NIT') {
      const nit = formData.documentNumber.trim();
      const hyphenCount = (nit.match(/-/g) || []).length;
      if (hyphenCount === 0) {
        newErrors.documentNumber = 'Falta el guion (-) en el NIT';
      } else if (hyphenCount > 1) {
        newErrors.documentNumber = 'El NIT solo debe tener un guion (-)';
      } else if (nit.length !== 10) {
        newErrors.documentNumber = 'El NIT debe tener exactamente 10 caracteres (ej: 12345678-9)';
      } else {
        const regex = /^[0-9]+-[0-9]$/;
        if (!regex.test(nit)) {
          newErrors.documentNumber = 'Formato de NIT inválido. Verifica bien (ej: 12345678-9)';
        }
      }
    } else if (formData.documentNumber.trim().length < 6 || formData.documentNumber.trim().length > 15) {
      newErrors.documentNumber = 'El documento debe tener entre 6 y 15 caracteres';
    }
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Nombre completo es obligatorio';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email es obligatorio';
    } else {
      const email = formData.email.trim();
      const atIndex = email.indexOf('@');
      const dotIndex = email.lastIndexOf('.');
      if (atIndex === -1) {
        newErrors.email = 'Falta el símbolo arroba (@)';
      } else if (atIndex === 0 || atIndex === email.length - 1) {
        newErrors.email = 'El arroba (@) está mal posicionado';
      } else if (email.split('@').length > 2) {
        newErrors.email = 'No puede haber más de un arroba (@)';
      } else if (email.includes('..')) {
        newErrors.email = 'No puede haber dos puntos consecutivos (..)';
      } else if (email.toLowerCase().endsWith('.com.com')) {
        newErrors.email = 'El dominio no puede ser .com.com';
      } else if (dotIndex === -1 || dotIndex < atIndex + 2) {
        newErrors.email = 'Falta el punto (.) en el dominio después del arroba';
      } else if (dotIndex === email.length - 1) {
        newErrors.email = 'Falta el dominio (ej: .com)';
      }
    }
    if (formData.phone) {
      const code = formData.countryCode || '+57';
      const phone = formData.phone.trim().replace(/\D/g, '');
      const expected = code === '+507' ? 8 : (code === '+34' || code === '+56' || code === '+51') ? 9 : 10;
      if (phone.length !== expected) {
        newErrors.phone = `El teléfono debe tener ${expected} dígitos para este país`;
      }
    } else {
      newErrors.phone = 'Teléfono es obligatorio';
    }
    if (!formData.country?.trim()) newErrors.country = 'País es obligatorio';
    if (!formData.city?.trim()) newErrors.city = 'Ciudad es obligatoria';
    if (!formData.address?.trim()) newErrors.address = 'Dirección es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    //  Validar duplicados en base de datos
    try {
      const params = {
        email: formData.email.trim(),
        documento: formData.documentNumber.trim()
      };
      if (modalState.mode === 'edit' && modalState.cliente) {
        params.excludeClienteId = modalState.cliente.id;
      }
      const checkResponse = await api.get('/api/auth/check-exists', { params });
      if (checkResponse.data.success) {
        const newErrors = {};
        if (checkResponse.data.emailExists) {
          newErrors.email = 'El correo electrónico ya está registrado';
        }
        if (checkResponse.data.documentoExists) {
          newErrors.documentNumber = 'El número de documento ya está registrado';
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          return;
        }
      }
    } catch (err) {
      console.warn("Error checking existence:", err);
    }

    const apiClienteData = {
      tipoDocumento: formData.documentType,
      numeroDocumento: formData.documentNumber,
      nombreCompleto: formData.fullName,
      email: formData.email,
      telefono: formData.phone.replace(/\D/g, ''), // Limpiar formato al enviar
      direccion: formData.address,
      pais: formData.country || 'Colombia',
      ciudad: formData.city,
      saldoFavor: '0',
      isActive: formData.isActive
    };

    try {
      if (modalState.mode === 'edit') {
        const updatedId = modalState.cliente.id;
        setClientes(prev => {
          const next = prev.map(c => c.id === updatedId ? { ...c, ...apiClienteData } : c);
          clientesCache.clientes = next;
          return next;
        });
        closeModal();
        showAlert(`Cliente ${apiClienteData.nombreCompleto} actualizado correctamente ✅`);
        await updateExistingCliente(updatedId, apiClienteData);
      } else {
        const tempId = `temp-${Date.now()}`;
        setClientes(prev => {
          const next = [{ id: tempId, ...apiClienteData }, ...prev];
          clientesCache.clientes = next;
          return next;
        });
        closeModal();
        showAlert(`Cliente ${apiClienteData.nombreCompleto} registrado correctamente ✅`);
        await createNewCliente(apiClienteData);
      }
    } catch {
      showAlert('Error al guardar el cliente', 'error');
      loadClientes();
    }
  };

  const openDeleteModal = (cliente) => {
    if (cliente.isActive) {
      showAlert(`No se puede eliminar el cliente "${cliente.nombreCompleto}" porque está activo. Desactívelo primero.`, 'error');
      return;
    }
    const mensaje = `¿Estás seguro que deseas eliminar permanentemente al cliente "${cliente.nombreCompleto}"?`;
    setDeleteModal({ 
      isOpen: true, 
      cliente,
      customMessage: mensaje
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, cliente: null, customMessage: '' });
  };

  const handleDelete = async () => {
    const cliente = deleteModal.cliente;
    if (!cliente) return;
    setLoading(true);
    try {
      await deleteExistingCliente(cliente.id);
      setClientes(prev => {
        const next = prev.filter(c => c.id !== cliente.id);
        clientesCache.clientes = next;
        return next;
      });
      closeDeleteModal();
      showAlert(cliente.nombreCompleto, 'delete');
      const updatedData = await fetchAllClientes();
      NitroCache.set('clientes', updatedData);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al eliminar cliente';
      showAlert(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    clientes, setClientes,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    alert, setAlert,
    modalState, setModalState,
    formData, setFormData,
    errors, setErrors,
    loading,
    deleteModal, setDeleteModal,
    firstInputRef,
    filtered,
    totalPages,
    paginatedClientes,
    showingStart, endIndex,
    showAlert,
    handleFilterSelect,
    openModal,
    closeModal,
    handleInputChange,
    handleSave,
    validateDuplicate, // Exponer para validación en tiempo real
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleToggleStatus: async (cliente) => {
      const previous = [...clientes];
      const newState = !cliente.isActive;
      setClientes(prev => prev.map(c =>
        c.id === cliente.id ? { ...c, isActive: newState } : c
      ));
      try {
        await toggleClienteStatus(cliente.id);
        showAlert(newState ? 'Cliente activado ✅' : 'Cliente desactivado');
        const next = clientes.map(c => c.id === cliente.id ? { ...c, isActive: newState } : c);
        NitroCache.set('clientes', next);
      } catch {
        setClientes(previous);
        showAlert('Error al cambiar estado', 'error');
      }
    }
  };
};