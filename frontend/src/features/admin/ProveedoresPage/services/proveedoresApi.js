/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import * as adminApi from "../../../shared/services/adminApi.js";

/**
 * Mapea los datos del backend al formato del frontend
 */
export const mapBackendToFrontend = (p) => ({
  id: p.id || p.IdProveedor,
  companyName: p.companyName || p.Nombre || "",
  documentNumber: p.documentNumber || p.NumeroDocumento || "",
  contactName: p.contactName || p.Contacto || p.Nombre || "", // In natural person mode, Nombre is used for contactName if Contacto is missing
  email: p.email || p.Correo || "",
  phone: p.phone || p.Telefono || "",
  isActive: p.isActive !== undefined ? !!p.isActive : (p.Estado !== undefined ? !!p.Estado : true),
  supplierType: p.supplierType || (p.TipoProveedor === 'Empresa' ? 'Persona Jurídica' : p.TipoProveedor) || '',
  documentType: p.TipoDocumento || p.documentType || '',
  address: p.Direccion || p.address || "",
  city: p.Ciudad || p.city || "",
  searchField: `${p.Nombre} ${p.TipoDocumento} ${p.NumeroDocumento} ${p.Correo} ${p.Telefono}`
});

/**
 * Mapea los datos del frontend al formato del backend
 */
export const mapFrontendToBackend = (p) => {
  const payload = { ...p };
  // Fallbacks para que Sequelize lo entienda según los modelos:
  if (!payload.companyName && payload.supplierType?.toLowerCase() === 'persona natural') {
    payload.companyName = payload.contactName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
  }
  return payload;
};

export const getProveedores = async () => {
  try {
    const response = await adminApi.getProveedores();
    const data = response?.data?.data || [];
    return data.map(mapBackendToFrontend);
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      console.error("Error fetching proveedores:", error);
    }
    throw error;
  }
};

export const createProveedor = async (proveedorData) => {
  try {
    const backendData = mapFrontendToBackend(proveedorData);
    const response = await adminApi.createProveedor(backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error creating proveedor:", error);
    }
    throw error;
  }
};

export const updateProveedor = async (id, proveedorData) => {
  try {
    const backendData = mapFrontendToBackend(proveedorData);
    const response = await adminApi.updateProveedor(id, backendData);
    return mapBackendToFrontend(response.data?.data || response.data);
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error updating proveedor:", error);
    }
    throw error;
  }
};

export const deleteProveedor = async (id) => {
  try {
    await adminApi.deleteProveedor(id);
    return true;
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error deleting proveedor:", error);
    }
    throw error;
  }
};
