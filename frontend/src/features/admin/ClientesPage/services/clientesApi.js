import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  patch,
  post,
  get,
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

export const toggleClienteStatus = async (id) => {
  try {
    const response = await patch(`/api/clientes/${id}/estado`);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error toggling cliente status:', error);
    throw error;
  }
};

// ✅ NUEVO: Obtener solicitudes pendientes
export const getSolicitudesPendientes = async () => {
  try {
    const response = await get('/api/clientes/solicitudes-pendientes');
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching solicitudes pendientes:', error);
    return [];
  }
};

// ✅ NUEVO: Obtener historial de correos (trazabilidad)
export const getHistorialCorreos = async () => {
  try {
    const response = await get('/api/clientes/historial-correos');
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching historial correos:', error);
    return [];
  }
};

// ✅ NUEVO: Aprobar desactivación
export const approveDeactivation = async (requestId) => {
  try {
    const response = await post('/api/clientes/desactivaciones/aprobar', { requestId });
    return response?.data;
  } catch (error) {
    console.error('Error approving deactivation:', error);
    throw error;
  }
};

// ✅ NUEVO: Rechazar desactivación
export const rejectDeactivation = async (requestId) => {
  try {
    const response = await post('/api/clientes/desactivaciones/rechazar', { requestId });
    return response?.data;
  } catch (error) {
    console.error('Error rejecting deactivation:', error);
    throw error;
  }
};

// ✅ NUEVO: Aprobar eliminación
export const approveDeletion = async (requestId) => {
  try {
    const response = await post('/api/clientes/eliminaciones/aprobar', { requestId });
    return response?.data;
  } catch (error) {
    console.error('Error approving deletion:', error);
    throw error;
  }
};

// ✅ NUEVO: Rechazar eliminación
export const rejectDeletion = async (requestId) => {
  try {
    const response = await post('/api/clientes/eliminaciones/rechazar', { requestId });
    return response?.data;
  } catch (error) {
    console.error('Error rejecting deletion:', error);
    throw error;
  }
};