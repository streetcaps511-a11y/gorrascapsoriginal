/* === HOOK DE LÓGICA ===
Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo.
Separa la 'inteligencia' de la interfaz visual para mantener el código limpio.
Recibe eventos de la UI y se comunica con los Servicios API. */
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as usersService from '../services/usersApi';
import * as rolesService from '../../RolesPage/services/rolesApi';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { NitroCache } from '../../../shared/utils/NitroCache';
import api from '../../../shared/services/api';

// 🧠 MEMORIA GLOBAL (Caché Nitro)
const getInitialUsers = () => {
  const cached = NitroCache.get('users_admin');
  return cached?.data || [];
};

let usersCache = {
  users: getInitialUsers(),
  availableStatuses: ['Activo', 'Inactivo'],
  availableRoles: [],
  isInitialized: false
};

export const useUsersLogic = () => {
  const { user: currentUser, updateUser: updateUserAuth } = useAuth();
  const [users, setUsers] = useState(usersCache.users);
  const [availableStatuses, setAvailableStatuses] = useState(usersCache.availableStatuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(!usersCache.isInitialized && usersCache.users.length === 0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  const initialFormState = {
    nombreCompleto: '',
    email: '',
    tipoDocumento: '',
    numeroDocumento: '',
    contacto: '',
    rol: '',
    idRol: '',
    clave: '',
    isActive: true
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // ====== FETCH INICIAL ======
  const fetchData = useCallback(async () => {
    if (users.length === 0) setLoading(true);
    try {
      const [userData, statusData, rolesData] = await Promise.all([
        usersService.getUsers(),
        usersService.getStatuses(),
        rolesService.getRoles()
      ]);
      
      const statuses = statusData.map(s => {
        if (typeof s === 'string') return s;
        return s.nombre || s.Nombre || s.estado || s.Estado || String(s);
      });
      
      setUsers(userData);
      setAvailableStatuses(statuses);
      setAvailableRoles(rolesData);
      
      // 💾 SINCRONIZAR CACHÉ
      NitroCache.set('users_admin', userData);
      usersCache = {
        users: userData,
        availableStatuses: statuses,
        availableRoles: rolesData,
        isInitialized: true
      };
    } catch (error) {
      setAlert({ show: true, message: 'Error cargando datos: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====== ALERTA ======
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 2500);
  };

  const isAdministrador = useCallback((user) => {
    if (!user) return false;
    const rol = (user.rol || "").toLowerCase();
    const idRol = user.idRol || user.IdRol;
    const email = (user.email || "").toLowerCase();
    return rol === "administrador" || 
           idRol === 1 || idRol === "1" || 
           email === "duvann1991@gmail.com";
  }, []);

  // ====== FILTRADO ======
  const filteredUsers = useMemo(() => {
    let result = users;
    const term = searchTerm.toLowerCase().trim();
    
    if (filterStatus !== 'Todos') {
      result = result.filter(u => {
        const statusLabel = u.isActive ? (availableStatuses[0] || 'Activo') : (availableStatuses[1] || 'Inactivo');
        return statusLabel === filterStatus;
      });
    }
    
    if (term) {
      result = result.filter(u => {
        const fullName = (u.nombre || '').toLowerCase();
        return (
          fullName.includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.rol?.toLowerCase() || "").includes(term) ||
          (u.numeroDocumento || "").toLowerCase().includes(term)
        );
      });
    }
    
    // Siempre poner al Administrador de primero, y luego ordenar por nombre
    return [...result].sort((a, b) => {
      const isAAdmin = isAdministrador(a);
      const isBAdmin = isAdministrador(b);
      if (isAAdmin && !isBAdmin) return -1;
      if (!isAAdmin && isBAdmin) return 1;
      const nameA = (a.nombre || "").toLowerCase();
      const nameB = (b.nombre || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [users, searchTerm, filterStatus, isAdministrador, availableStatuses]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // ====== HANDLERS ======
  const openModal = (user = null) => {
    setEditingUser(user);
    setErrors({});
    
    if (user) {
      // 🔍 MAPEO FLEXIBLE: Manejar diferentes nombres de campos que puede devolver la API
      const tipoDoc = user.tipoDocumento || user.tipo_documento || user.TipoDocumento || user.tipoDoc || user.TipoDoc || '';
      const numDoc = user.numeroDocumento || user.NumeroDocumento || user.numero_documento || user.documento || user.Numero_Documento || user.numDoc || user.NumDoc || '';
      const telefono = user.telefono || user.Telefono || user.contacto || user.Contacto || user.tel || user.Tel || user.phone || user.Phone || '';
      const nombre = user.nombre || user.Nombre || user.nombreCompleto || user.NombreCompleto || user.full_name || user.fullName || '';
      const email = user.email || user.Email || user.correo || user.Correo || user.mail || user.Mail || '';
      const idRol = user.idRol || user.IdRol || user.rolId || user.RolId || user.id_rol || user.ID_Rol || user.roleId || user.RoleId || '2';
      const rolName = user.rol || user.Rol || user.role || user.Role || '';
      
      setFormData({
        nombreCompleto: (nombre || '').trim(),
        email: (email || '').trim(),
        tipoDocumento: tipoDoc,
        numeroDocumento: numDoc,
        contacto: telefono,
        rol: idRol,
        idRol: idRol,
        clave: '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setFormData(initialFormState);
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
    setFormData(initialFormState);
    setErrors({});
  };


  const handleInputChange = (field, value) => {
    // Limpiar error previo del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // ✅ VALIDACIÓN EN TIEMPO REAL: Email duplicado
    if (field === 'email') {
      const emailTrimmed = value.trim().toLowerCase();
      // Solo validar si tiene formato básico de email
      const looksLikeEmail = emailTrimmed.includes('@') && emailTrimmed.includes('.');
      if (looksLikeEmail) {
        const duplicate = users.find(u =>
          u.email.toLowerCase() === emailTrimmed &&
          u.id !== editingUser?.id
        );
        if (duplicate) {
          setErrors(prev => ({
            ...prev,
            email: `Email ya registrado (${duplicate.nombre || duplicate.nombreCompleto || duplicate.email})`
          }));
        }
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };


  // ====== VALIDACIÓN MEJORADA CON DUPLICADOS ======
  const validate = () => {
    const newErrors = {};
    
    // ⚡ VALIDACIÓN SECUENCIAL: Solo se muestra el primer error encontrado
    
    // 1. Validar Tipo de Documento
    if (!formData.tipoDocumento) {
      newErrors.tipoDocumento = 'Tipo de documento es obligatorio';
    }
    
    // 2. Validar Número de Documento
    if (!newErrors.tipoDocumento) {
      if (!formData.numeroDocumento?.trim()) {
        newErrors.numeroDocumento = 'Número de documento es obligatorio';
      } else if (formData.numeroDocumento.trim().length < 6 || formData.numeroDocumento.trim().length > 15) {
        newErrors.numeroDocumento = 'El documento debe tener entre 6 y 15 dígitos';
      } else {
        // 🔍 Validar documento duplicado en lista local
        const docDuplicate = users.find(u => 
          u.numeroDocumento?.trim() === formData.numeroDocumento.trim() && 
          u.id !== editingUser?.id
        );
        if (docDuplicate) {
          newErrors.numeroDocumento = `Documento ya registrado (${docDuplicate.nombre})`;
        }
      }
    }
    
    // 3. Validar Nombre Completo
    if (!newErrors.numeroDocumento) {
      if (!formData.nombreCompleto?.trim()) {
        newErrors.nombreCompleto = 'Nombre Completo es obligatorio';
      } else if (!formData.nombreCompleto.trim().includes(' ')) {
        newErrors.nombreCompleto = 'Debe ingresar nombre y apellido separados por un espacio';
      } else {
        // 🔍 Validar nombre duplicado (comparación flexible)
        const nombreNormalizado = formData.nombreCompleto.trim().toLowerCase();
        const nombreDuplicate = users.find(u => {
          const existingName = (u.nombre || '').toLowerCase().trim();
          return existingName === nombreNormalizado && u.id !== editingUser?.id;
        });
        if (nombreDuplicate) {
          newErrors.nombreCompleto = `Nombre ya registrado (${nombreDuplicate.email})`;
        }
      }
    }
    
    // 4. Validar Email
    if (!newErrors.nombreCompleto) {
      if (!formData.email?.trim()) {
        newErrors.email = 'Email es obligatorio';
      } else if (formData.email.trim().indexOf('@') === -1) {
        newErrors.email = 'Falta el símbolo arroba (@)';
      } else if (formData.email.trim().indexOf('@') === 0 || formData.email.trim().indexOf('@') === formData.email.trim().length - 1) {
        newErrors.email = 'El arroba (@) está mal posicionado';
      } else if (formData.email.trim().split('@').length > 2) {
        newErrors.email = 'No puede haber más de un arroba (@)';
      } else if (formData.email.trim().includes('..')) {
        newErrors.email = 'No puede haber dos puntos consecutivos (..)';
      } else if (formData.email.trim().toLowerCase().endsWith('.com.com')) {
        newErrors.email = 'El dominio no puede ser .com.com';
      } else if (formData.email.trim().lastIndexOf('.') === -1 || formData.email.trim().lastIndexOf('.') < formData.email.trim().indexOf('@') + 2) {
        newErrors.email = 'Falta el punto (.) en el dominio después del arroba';
      } else if (formData.email.trim().lastIndexOf('.') === formData.email.trim().length - 1) {
        newErrors.email = 'Falta el dominio (ej: .com)';
      } else {
        // 🔍 Validar email duplicado en lista local
        const emailLower = formData.email.trim().toLowerCase();
        const emailDuplicate = users.find(u => 
          u.email.toLowerCase() === emailLower && 
          u.id !== editingUser?.id
        );
        if (emailDuplicate) {
          newErrors.email = `Email ya registrado (${emailDuplicate.nombre})`;
        }
      }
    }
    
    // 5. Validar Teléfono (validación colombiana)
    if (!newErrors.email) {
      const telClean = formData.contacto?.replace(/\D/g, '') || '';
      
      if (!telClean) {
        newErrors.contacto = 'Teléfono es obligatorio';
      } else if (telClean.length !== 10) {
        newErrors.contacto = 'Debe tener 10 dígitos';
      } else if (!telClean.startsWith('3')) {
        newErrors.contacto = 'Debe iniciar con 3 (móvil colombiano)';
      } else {
        // 🔍 Validar teléfono duplicado en lista local
        const telDuplicate = users.find(u => 
          (u.telefono || u.Telefono || u.contacto || '').replace(/\D/g, '') === telClean && 
          u.id !== editingUser?.id
        );
        if (telDuplicate) {
          newErrors.contacto = `Teléfono ya registrado (${telDuplicate.nombre})`;
        }
      }
    }
    
    // 6. Validar Rol
    if (!newErrors.contacto) {
      if (!formData.rol && !formData.idRol) {
        newErrors.rol = 'Rol es obligatorio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    const nombre = (formData.nombreCompleto || '').trim();
    const finalIdRol = isAdministrador(editingUser) ? 1 : (formData.rol || formData.idRol);
    
    const userData = {
      nombre,
      email: formData.email.trim(),
      tipoDocumento: formData.tipoDocumento,
      numeroDocumento: formData.numeroDocumento,
      telefono: formData.contacto,
      idRol: finalIdRol,
      isActive: formData.isActive
    };
    
    if (!editingUser?.id) {
      userData.clave = formData.numeroDocumento;
    } else if (formData.clave && formData.clave.trim() !== '') {
      userData.clave = formData.clave.trim();
    }
    
    try {
      if (editingUser?.id) {
        if (userData.rol === "Administrador" && editingUser.rol !== "Administrador") {
          const existingAdmin = users.find(u => u.rol === "Administrador");
          if (existingAdmin) throw new Error('Ya existe un usuario Administrador');
        }
        const updated = await usersService.updateUser(editingUser.id, userData);
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        
        if (currentUser && (updated.id === currentUser.id)) {
          console.log("🔄 Actualizando datos del usuario logueado en AuthContext");
          updateUserAuth(updated);
        }
        showAlert(`Usuario "${updated.nombre}" actualizado correctamente`);
      } else {
        if (userData.rol === "Administrador") {
          const existingAdmin = users.find(u => u.rol === "Administrador");
          if (existingAdmin) throw new Error('Ya existe un usuario Administrador');
        }
        const created = await usersService.createUser(userData);
        setUsers(prev => [created, ...prev]);
        showAlert(`Usuario "${created.nombre}" creado correctamente`);
      }
      
      // Broadcast permissions update in real time
      const channel = new BroadcastChannel('app_sync');
      channel.postMessage('user_permissions_updated');
      channel.close();
      
      closeModal();
    } catch (err) {
      const resp = err?.response?.data;
      const msg = resp?.message || 'Error al guardar usuario';
      
      // 🎯 Mapear errores del backend a campos específicos del formulario
      const fieldErrors = {};
      if (msg.toLowerCase().includes('nombre') && msg.toLowerCase().includes('ya existe')) {
        fieldErrors.nombreCompleto = msg;
      } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('correo')) {
        fieldErrors.email = msg;
      } else if (msg.toLowerCase().includes('documento')) {
        fieldErrors.numeroDocumento = msg;
      } else if (msg.toLowerCase().includes('teléfono') || msg.toLowerCase().includes('telefono')) {
        fieldErrors.contacto = msg;
      }
      
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      
      showAlert(msg, 'error');
      fetchData();
    }
  };

  const openDeleteModal = (user) => {
    if (isAdministrador(user)) {
      showAlert('El usuario "Administrador" no se puede eliminar', "error");
      return;
    }
    if (user.isActive) {
      showAlert('No se puede eliminar un usuario activo. Debe desactivarlo primero.', 'error');
      return;
    }
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const closeDeleteModal = () => {
    setIsConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    const user = userToDelete;
    if (!user) return;
    
    setLoading(true);
    try {
      await usersService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showAlert(`Usuario "${user.nombre}" eliminado correctamente`, "delete");
      
      const updated = users.filter(u => u.id !== user.id);
      NitroCache.set('users_admin', updated);
      
      const channel = new BroadcastChannel('app_sync');
      channel.postMessage('user_permissions_updated');
      channel.close();
      
      closeDeleteModal();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al eliminar";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (isAdministrador(user)) {
      showAlert('No se puede cambiar el estado del usuario Administrador', "error");
      return;
    }
    
    const newStatus = !user.isActive;
    const previousUsers = [...users];
    
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
    
    try {
      await usersService.updateUser(user.id, { ...user, isActive: newStatus });
      showAlert(`Usuario ${newStatus ? 'activado' : 'desactivado'} ✅`);
      
      const updated = previousUsers.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u);
      NitroCache.set('users_admin', updated);
      
      const channel = new BroadcastChannel('app_sync');
      channel.postMessage('user_permissions_updated');
      channel.close();
    } catch {
      setUsers(previousUsers);
      showAlert("No se pudo cambiar el estado", "error");
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedUser(null);
  };

  return {
    users,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    currentPage, setCurrentPage,
    loading,
    alert, setAlert,
    formData,
    errors,
    isModalOpen,
    editingUser,
    isConfirmOpen,
    userToDelete,
    isDetailsOpen,
    selectedUser,
    filteredUsers,
    paginatedUsers,
    totalPages,
    availableRoles,
    openModal,
    closeModal,
    handleInputChange,
    handleSave,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    viewUserDetails,
    closeDetails,
    isAdministrador,
    availableStatuses,
    handleToggleStatus
  };
};