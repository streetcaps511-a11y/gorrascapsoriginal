/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import * as adminApi from "../../../shared/services/adminApi.js";

/**
 * Mapea los datos del backend al formato del frontend
 */
export const mapBackendToFrontend = (r) => ({
  id: r.IdRol || r.id,
  name: r.Nombre || r.nombre || r.name || "",
  description: r.Descripcion || r.descripcion || r.description || "",
  permissions: r.Permisos || r.permisos || r.permissions || [],
  isActive: r.Estado !== undefined ? r.Estado : (r.isActive !== undefined ? r.isActive : (r.isActive !== undefined ? r.isActive : true))
});

/**
 * Mapea los datos del frontend al formato del backend
 */
export const mapFrontendToBackend = (r) => ({
  IdRol: r.id,
  Nombre: r.name,
  Descripcion: r.description,
  Permisos: r.permissions,
  Estado: r.isActive
});

export const getRoles = async () => {
  try {
    const response = await adminApi.getRoles();
    const data = response?.data?.data || [];
    return data.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  try {
    const backendData = mapFrontendToBackend(roleData);
    const response = await adminApi.createRole(backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const backendData = mapFrontendToBackend(roleData);
    const response = await adminApi.updateRole(id, backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    await adminApi.deleteRole(id);
    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};
