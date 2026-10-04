/* === HOOK DE LÓGICA ===
Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo.
Separa la 'inteligencia' de la interfaz visual para mantener el código limpio.
Recibe eventos de la UI y se comunica con los Servicios API. */
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as rolesService from '../services/rolesApi';
import { NitroCache } from '../../../shared/utils/NitroCache';

//  MEMORIA GLOBAL (Caché Nitro)
const getInitialRoles = () => {
  const cached = NitroCache.get('roles_admin');
  return cached?.data || [];
};

let rolesCache = {
  roles: getInitialRoles(),
  isInitialized: false
};

export const useRolesLogic = () => {
  const [roles, setRoles] = useState(rolesCache.roles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(!rolesCache.isInitialized && rolesCache.roles.length === 0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [currentRole, setCurrentRole] = useState({
    name: "",
    description: "",
    permissions: [],
    isActive: true,
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // create, edit, details
    role: null
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    role: null
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    permissions: false
  });

  // ====== FETCH INICIAL ======
  const fetchData = useCallback(async () => {
    if (roles.length === 0) setLoading(true);
    try {
      const data = await rolesService.getRoles();
      // Ensure "Administrador" role has special handling if needed
      const processed = data.map(role =>
        (role.name || "").toLowerCase() === "administrador"
          ? { ...role, description: role.description || "Acceso total al sistema" }
          : role
      );
      setRoles(processed);
      
      // 💾 SINCRONIZAR CACHÉ
      NitroCache.set('roles_admin', processed);
      rolesCache = { roles: processed, isInitialized: true };
    } catch (error) {
      setAlert({ show: true, message: 'Error cargando roles: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [roles.length]); // 👈 Remover roles.length para evitar re-fetch prematuro al borrar

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====== HELPERS ======
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "success" }), 2500);
  };

  const isAdministrador = (role) => (role?.name || "").toLowerCase() === "administrador";

  // ====== FILTRADO ======
  const filteredRoles = useMemo(() => {
    let result = roles;
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(r =>
        (r.name || "").toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term)
      );
    }
    if (filterStatus !== 'Todos') {
      const statusBool = filterStatus === 'Activos';
      result = result.filter(p => p.isActive === statusBool);
    }
    return result;
  }, [roles, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRoles.length);
  const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
  const showingStart = filteredRoles.length > 0 ? startIndex + 1 : 0;

  // ====== HANDLERS ======
  const openModal = (mode = 'create', role = null) => {
    if (mode === 'edit' && isAdministrador(role)) {
      showAlert('El rol "Administrador" no se puede editar', "error");
      return;
    }
    setModalState({ isOpen: true, mode, role });
    setFieldErrors({ name: false, permissions: false });
    if (role) {
      setCurrentRole({ ...role });
    } else {
      setCurrentRole({ name: "", description: "", permissions: [], isActive: true });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', role: null });
    setCurrentRole({ name: "", description: "", permissions: [], isActive: true });
  };

  const validate = () => {
    const nameTrimmed = (currentRole.name || '').trim().toLowerCase();
    let nameError = false;
    let permError = false;

    if (!nameTrimmed) {
      nameError = "El nombre del rol es obligatorio";
    } else if (nameTrimmed === 'administrador' || nameTrimmed === 'admin') {
      const existingAdmin = roles.find(r => 
        (r.name || '').trim().toLowerCase() === 'administrador' && 
        r.id !== currentRole.id
      );
      if (existingAdmin || !currentRole.id) {
        nameError = "No se puede registrar otro rol Administrador";
      }
    } else {
      const dupName = roles.find(r => 
        (r.name || '').trim().toLowerCase() === nameTrimmed && 
        r.id !== currentRole.id
      );
      if (dupName) {
        nameError = `Ya existe un rol con el nombre "${dupName.name}"`;
      }
    }

    const rolePerms = currentRole.permissions || [];
    if (rolePerms.length === 0 && !isAdministrador(currentRole)) {
      permError = "Debe seleccionar al menos un permiso";
    } else if (rolePerms.length > 0 && nameTrimmed !== 'administrador') {
      const currentPermsSet = new Set(rolePerms);
      const dupPerms = roles.find(r => {
        if (r.id === currentRole.id) return false;
        if ((r.name || '').trim().toLowerCase() === 'administrador') return false;
        const otherPerms = r.permissions || [];
        if (otherPerms.length === 0 || otherPerms.length !== rolePerms.length) return false;
        return otherPerms.every(p => currentPermsSet.has(p));
      });
      if (dupPerms) {
        permError = `Estos permisos son idénticos a los del rol "${dupPerms.name}"`;
      }
    }

    const errors = {
      name: nameError,
      permissions: permError
    };
    setFieldErrors(errors);
    return !nameError && !permError;
  };

  const handleSave = async () => {
    if (!validate()) {
      const nameTrimmed = (currentRole.name || '').trim().toLowerCase();
      const dupName = roles.find(r => (r.name || '').trim().toLowerCase() === nameTrimmed && r.id !== currentRole.id);
      if (nameTrimmed === 'administrador' || nameTrimmed === 'admin') {
        showAlert("No se puede registrar otro rol Administrador", "error");
      } else if (dupName) {
        showAlert(`Ya existe un rol con el nombre "${dupName.name}"`, "error");
      } else if (!nameTrimmed) {
        showAlert("El nombre del rol es obligatorio", "error");
      } else {
        const rolePerms = currentRole.permissions || [];
        const currentPermsSet = new Set(rolePerms);
        const dupPerms = roles.find(r => {
          if (r.id === currentRole.id) return false;
          const otherPerms = r.permissions || [];
          return otherPerms.length > 0 && otherPerms.length === rolePerms.length && otherPerms.every(p => currentPermsSet.has(p));
        });
        if (dupPerms) {
          showAlert(`Estos permisos son idénticos a los del rol "${dupPerms.name}"`, "error");
        } else {
          showAlert("Complete todos los campos requeridos correctamente", "error");
        }
      }
      return;
    }
    setLoading(true);
    
    // ✅ AGREGAR DESCRIPCIÓN POR DEFECTO SI ESTÁ VACÍA
    const roleToSave = {
      ...currentRole,
      description: currentRole.description?.trim() || "Sin descripción"
    };
    
    try {
      if (modalState.mode === 'edit') {
        const updated = await rolesService.updateRole(currentRole.id, roleToSave);
        setRoles(prev => prev.map(r => r.id === updated.id ? updated : r));
        showAlert("Rol actualizado correctamente");
      } else {
        const created = await rolesService.createRole(roleToSave);
        setRoles(prev => [created, ...prev]);
        showAlert("Rol creado correctamente");
      }
      // Broadcast permissions update in real time
      const channel = new BroadcastChannel('app_sync');
      channel.postMessage('user_permissions_updated');
      channel.close();
      closeModal();
    } catch (error) {
      showAlert("Error al guardar: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (role) => {
    if (isAdministrador(role)) {
      showAlert('El rol "Administrador" no se puede eliminar', "error");
      return;
    }
    if (role.isActive) {
      showAlert('No se puede eliminar un rol activo. Primero desactívelo.', "error");
      return;
    }
    setDeleteModal({ isOpen: true, role });
  };

  const closeDeleteModal = () => setDeleteModal({ isOpen: false, role: null });

  const handleDelete = async () => {
    const roleToDelete = deleteModal.role;
    if (!roleToDelete) return;
    setLoading(true);
    
    try {
      await rolesService.deleteRole(roleToDelete.id);
      // Sincronizar estado local
      setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
      showAlert(`Rol "${roleToDelete.name}" eliminado correctamente`, "delete");
      // Sincronizar caché
      const updated = roles.filter(r => r.id !== roleToDelete.id);
      NitroCache.set('roles_admin', updated);
      // Broadcast permissions update in real time
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

  return {
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
    isRestrictedRole: (role) => (role?.name || " ").toLowerCase() === "administrador" || (role?.name || " ").toLowerCase() === "cliente",
    handleToggleStatus: async (role) => {
      if ((role?.name || " ").toLowerCase() === "administrador") {
        showAlert('El rol "Administrador" no se puede desactivar', "error");
        return;
      }
      const previous = [...roles];
      const newState = !role.isActive;
      setRoles(prev => prev.map(r =>
        r.id === role.id ? { ...r, isActive: newState } : r
      ));
      try {
        await rolesService.updateRole(role.id, { ...role, isActive: newState });
        showAlert(newState ? 'Rol activado ✅' : 'Rol desactivado');
        const next = roles.map(r => r.id === role.id ? { ...r, isActive: newState } : r);
        NitroCache.set('roles_admin', next);
        // Broadcast permissions update in real time
        const channel = new BroadcastChannel('app_sync');
        channel.postMessage('user_permissions_updated');
        channel.close();
      } catch {
        setRoles(previous);
        showAlert('Error al cambiar estado', 'error');
      }
    }
  };
};    