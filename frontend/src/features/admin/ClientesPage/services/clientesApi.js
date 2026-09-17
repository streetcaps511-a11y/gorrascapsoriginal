/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  patch,
} from '../../../shared/services/adminApi';


export const mapClienteData = (c) => ({
  id: c.id?.toString() || c.IdCliente?.toString() || '',
  tipoDocumento: c.tipoDocumento || c.TipoDocumento || '',
  numeroDocumento: c.numeroDocumento || c.NumeroDocumento || '',
  nombreCompleto: c.nombreCompleto || c.NombreCompleto || c.nombre || c.Nombre || '',
  nombre: c.nombreCompleto || c.NombreCompleto || c.nombre || c.Nombre || '',
  email: c.email || c.Email || c.correo || c.Correo || '',
  telefono: c.telefono || c.Telefono || '',
  direccion: c.direccion || c.Direccion || '',
  ciudad: c.ciudad || c.Ciudad || '',
  saldoFavor: c.saldoFavor?.toString() || c.SaldoaFavor || '0',
  isActive: c.isActive !== undefined ? !!c.isActive : (c.IsActive !== undefined ? !!c.IsActive : (c.Estado !== false && c.Estado !== 0 && c.Estado !== 'Inactivo')),
});

export const reverseMapClienteData = (c) => ({
  tipoDocumento: c.tipoDocumento,
  numeroDocumento: c.numeroDocumento,
  nombreCompleto: c.nombreCompleto,
  email: c.email,
  telefono: c.telefono,
  direccion: c.direccion,
  ciudad: c.ciudad,
  isActive: c.isActive
});

export const fetchAllClientes = async () => {
  try {
    const response = await getClientes();
    const data = response?.data?.data || response?.data || [];
    return (Array.isArray(data) ? data : []).map(mapClienteData);
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw error;
  }
};

export const createNewCliente = async (data) => {
  try {
    const payload = reverseMapClienteData(data);
    const response = await createCliente(payload);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
};

export const updateExistingCliente = async (id, data) => {
  try {
    const payload = reverseMapClienteData(data);
    const response = await updateCliente(id, payload);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
};

export const deleteExistingCliente = async (id) => {
  try {
    const response = await deleteCliente(id);
    return response?.data;
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
};

/** Cambia solo el estado activo/inactivo usando PATCH /api/clientes/:id/estado */
export const toggleClienteStatus = async (id) => {
  try {
    const response = await patch(`/api/clientes/${id}/estado`);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error toggling cliente status:', error);
    throw error;
  }
};
