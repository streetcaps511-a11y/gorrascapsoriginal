/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import { getUsers as apiGetUsers, createUser as apiCreateUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser, getEstados, patch } from "../../../shared/services/adminApi.js";

/**
 * Mapea los datos del backend al formato del frontend
 */
export const mapBackendToFrontend = (u) => {
  const nombre = (u.nombre || u.Nombre || '').trim();
  const nombreCompleto = nombre;

  // 🛡️ Detección Robusta de Estado
  const rawEstado = String(u.estado || u.Estado || '').toLowerCase();
  const isActive = rawEstado === 'activo' || u.isActive === true;

  return {
    id: u.IdUsuario || u.id || '',
    nombre,
    nombreCompleto,
    email: u.email || u.Correo || "",
    rol: u.RolNombre || (u.rolData ? (u.rolData.nombre || u.rolData.Nombre) : (typeof u.rol === 'object' ? (u.rol.nombre || u.rol.Nombre) : u.rol)) || "",
    idRol: u.idRol || u.IdRol || (u.rolData ? u.rolData.id : (typeof u.rol === 'object' ? u.rol.id : null)),
    isActive: isActive,
    tipoDocumento: u.tipoDocumento || u.TipoDocumento || '',
    numeroDocumento: u.numeroDocumento || u.NumeroDocumento || '',
    telefono: u.telefono || u.Telefono || u.contacto || ''
  };
};

/**
 * Mapea los datos del frontend al formato del backend
 */
export const mapFrontendToBackend = (u) => ({
  id: u.id,
  nombre: u.nombre || "",
  email: u.email,
  estado: u.isActive === true ? 'activo' : 'inactivo', 
  tipoDocumento: u.tipoDocumento,
  numeroDocumento: u.numeroDocumento,
  telefono: u.contacto || u.telefono,
  clave: u.clave, 
  idRol: u.idRol || u.rol 
});

export const getUsers = async () => {
  try {
    const response = await apiGetUsers();
    const data = response?.data?.data || [];
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const backendData = mapFrontendToBackend(userData);
    const response = await apiCreateUser(backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const backendData = mapFrontendToBackend(userData);
    const response = await apiUpdateUser(id, backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await apiDeleteUser(id);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const toggleUserStatus = async (id) => {
  try {
    const response = await patch(`/api/usuarios/${id}/estado`);
    return response.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error;
  }
};

export const getStatuses = async () => {
  try {
    const response = await getEstados();
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching user statuses:", error);
    throw error;
  }
};
