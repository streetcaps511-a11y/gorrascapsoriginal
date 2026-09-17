/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

// ✅ Servicio de Categorías - Usa el api.js compartido
import api from '../../../shared/services/api';

const ENDPOINTS = {
  BASE: '/api/categorias',
  getAll: () => `${ENDPOINTS.BASE}`,
  getById: (id) => `${ENDPOINTS.BASE}/${id}`,
  create: () => `${ENDPOINTS.BASE}`,
  update: (id) => `${ENDPOINTS.BASE}/${id}`,
  delete: (id) => `${ENDPOINTS.BASE}/${id}`,
  toggleStatus: (id) => `${ENDPOINTS.BASE}/${id}/estado`,
  getStatuses: () => '/api/estados',
};

export const categoriasApi = {
  getAll: async (params = {}) => {
    const finalParams = { todos: true, ...params };
    const response = await api.get(ENDPOINTS.getAll(), { params: finalParams });
    return response.data?.data || response.data || [];
  },

  getById: async (id) => {
    const response = await api.get(ENDPOINTS.getById(id));
    return response.data?.data || response.data;
  },

  create: async (data) => {
    const response = await api.post(ENDPOINTS.create(), data);
    return response.data?.data || response.data;
  },

  update: async (id, data) => {
    const response = await api.put(ENDPOINTS.update(id), data);
    return response.data?.data || response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(ENDPOINTS.toggleStatus(id));
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    await api.delete(ENDPOINTS.delete(id));
    return true;
  },

  getStatuses: async () => {
    try {
      const response = await api.get(ENDPOINTS.getStatuses());
      return response.data?.data || response.data || [];
    } catch {
      return [
        { Nombre: 'Todos' },
        { Nombre: 'Activos' },
        { Nombre: 'Inactivos' }
      ];
    }
  },
};

export default categoriasApi;
