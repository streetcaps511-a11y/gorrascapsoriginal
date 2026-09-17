/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import api from "../../../shared/services/api";

/**
 * Fetch products for selection in returns form
 */
const getImageUrl = (raw) => {
  if (!raw) return '';
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  if (typeof raw === 'string') {
    if (raw.startsWith('/uploads')) return `${baseUrl}${raw}`;
    if (raw.includes("urlmovil-1.onrender.com")) return raw.replace("https://urlmovil-1.onrender.com", baseUrl);
  }
  return raw;
};

export const getProducts = async () => {
  try {
    const response = await api.get('/api/productos?todos=true');
    // Soporta tanto array directo como objeto { data: { products: [] } }
    const resData = response.data?.data;
    const data = Array.isArray(resData) ? resData : (resData?.products || resData?.rows || resData || []);
    
    return data.map(p => {
      const rawImg = p.imagen || p.imagenes?.[0] || '';
      const formattedImg = getImageUrl(rawImg);
      const rawImgsList = Array.isArray(p.imagenes) ? p.imagenes : (p.imagen ? [p.imagen] : []);
      const formattedImgsList = rawImgsList.map(img => getImageUrl(img));

      return {
        id: p.id,
        nombre: p.nombre,
        precio: Number(p.precioVenta || p.precio),
        imagenes: formattedImgsList,
        imagen: formattedImg,
        tallas: Array.isArray(p.tallasStock) 
          ? p.tallasStock.filter(ts => Number(ts.cantidad) > 0).map(ts => ts.talla)
          : (p.tallas || []),
        tallasStock: p.tallasStock || []
      };
    });
  } catch (error) {
    console.error("Error fetching products for profile:", error);
    return [];
  }
};

/**
 * Update user profile data
 * @param {Object} userData 
 */
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/clientes/mi/perfil', userData);
    return response.data; // { success: true, data: updatedUser }
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Fetch current client profile
 */
export const getMiPerfil = async () => {
    try {
        const res = await api.get('/api/clientes/mi/perfil');
        return res.data?.data;
    } catch (error) {
        console.error("Error fetching perfil:", error);
        return null;
    }
}

/**
 * Fetch orders for the logged-in user
 */
export const getMyOrders = async () => {
  try {
    const response = await api.get('/api/ventas/mis-pedidos');
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return [];
  }
};

/**
 * Fetch returns for the logged-in user
 */
export const getMyReturns = async () => {
  try {
    const response = await api.get('/api/devoluciones/mis-devoluciones');
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching my returns:", error);
    return [];
  }
};

/**
 * Create a new return/warranty request
 */
export const createReturn = async (returnData) => {
  try {
    const response = await api.post('/api/devoluciones', returnData);
    return response.data;
  } catch (error) {
    console.error("Error creating return:", error);
    throw error;
  }
};

// Add other profile-related API calls here as they become available in the backend
export const deactivateAccount = async () => {
  try {
    const response = await api.post('/api/usuarios/perfil/desactivar');
    return response.data;
  } catch (error) {
    console.error("Error deactivating account:", error);
    throw error;
  }
};

export const deleteAccountPermanently = async () => {
  try {
    const response = await api.delete('/api/usuarios/perfil/eliminar-permanente');
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

export const markOrderAsReceived = async (orderId) => {
  try {
    const rawId = String(orderId).replace('PED-', '');
    const id = parseInt(rawId) > 1000 ? parseInt(rawId) - 1000 : rawId;
    const response = await api.patch(`/api/ventas/${id}/marcar-recibido`);
    return response.data;
  } catch (error) {
    console.error("Error marking order as received:", error);
    throw error;
  }
};

/**
 * Enviar código OTP al nuevo email para verificarlo antes de guardar
 * @param {string} nuevoEmail
 */
export const sendEmailVerification = async (nuevoEmail) => {
  try {
    const response = await api.post('/api/clientes/mi/verificar-email', { nuevoEmail });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al enviar el código.';
    throw new Error(msg);
  }
};

/**
 * Confirmar el código OTP ingresado por el cliente para cambiar el email
 * @param {string} codigo
 */
export const confirmEmailVerification = async (codigo) => {
  try {
    const response = await api.post('/api/clientes/mi/verificar-email/confirmar', { codigo });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Código incorrecto o expirado.';
    throw new Error(msg);
  }
};
