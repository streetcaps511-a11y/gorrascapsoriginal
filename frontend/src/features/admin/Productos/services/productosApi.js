/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import * as adminApi from "../../../shared/services/adminApi.js";

/**
 * Mapea los datos del backend al formato del frontend
 */
export const mapBackendToFrontend = (p) => ({
  id: p.IdProducto || p.id,
  nombre: p.Nombre || p.nombre || "",
  categoria: p.Categoria || p.categoria || "",
  precioCompra: p.PrecioCompra?.toString() || p.precioCompra?.toString() || "0",
  precioVenta: p.PrecioVenta?.toString() || p.precioVenta?.toString() || p.precio?.toString() || "0",
  precioOferta: p.PrecioOferta?.toString() || p.precioOferta?.toString() || "0",
  precioMayorista6: p.PrecioMayorista6?.toString() || p.precioMayorista6?.toString() || "0",
  precioMayorista80: p.PrecioMayorista80?.toString() || p.precioMayorista80?.toString() || "0",
  stock: p.Stock ?? p.stock ?? 0,
  enOfertaVenta: p.EnOfertaVenta || p.enOfertaVenta || p.hasDiscount || false,
  descripcion: p.Descripcion || p.descripcion || "",
  tallas: p.Tallas || p.tallas || [],
  tallasStock: p.TallasStock || p.tallasStock || [],
  colores: p.Colores || p.colores || ["Negro"],
  imagenes: p.Imagenes || p.imagenes || [],
  destacado: p.Destacado || p.destacado || p.isFeatured || false,
  sales: p.Sales || p.sales || 0,
  isActive: p.IsActive !== undefined ? p.IsActive : (p.isActive !== undefined ? p.isActive : true),
  enInventario: p.EnInventario !== undefined ? p.EnInventario : (p.enInventario !== undefined ? p.enInventario : false),
  idCategoria: p.IdCategoria || p.idCategoria || "",
  estado: p.Estado || p.estado || (p.IsActive !== false ? "Activo" : "Inactivo")
});

/**
 * Mapea los datos del frontend al formato del backend
 */
export const mapFrontendToBackend = (p) => ({
  nombre: p.nombre,
  categoria: p.categoria,
  precioCompra: parseFloat(p.precioCompra || 0),
  precioVenta: parseFloat(p.precioVenta || 0),
  precioOferta: parseFloat(p.precioOferta || 0),
  precioMayorista6: parseFloat(p.precioMayorista6 || 0),
  precioMayorista80: parseFloat(p.precioMayorista80 || 0),
  enOfertaVenta: p.enOfertaVenta,
  stock: Number(p.stock ?? 0),
  descripcion: p.descripcion,
  tallasStock: p.tallasStock,
  colores: p.colores,
  imagenes: p.imagenes,
  enInventario: p.enInventario,
  isActive: p.isActive,
  idCategoria: p.idCategoria, // ✅ Línea añadida para enviar el ID a la BD
  estado: p.estado
});

export const getProductos = async () => {
  try {
    const response = await adminApi.getProductos();
    const raw = response?.data?.data ?? response?.data ?? [];
    const data = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.products)
      ? raw.products
      : [];
    return data.map(mapBackendToFrontend);
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      console.error("Error fetching productos:", error);
    }
    throw error;
  }
};

export const createProducto = async (productoData) => {
  try {
    const backendData = mapFrontendToBackend(productoData);
    const response = await adminApi.createProducto(backendData);
    // ✅ Extraer la data real del producto (response.data.data)
    return mapBackendToFrontend(response.data.data || response.data);
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error creating producto:", error);
    }
    throw error;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    const backendData = mapFrontendToBackend(productoData);
    const response = await adminApi.updateProducto(id, backendData);
    // ✅ Extraer la data real del producto (response.data.data)
    return mapBackendToFrontend(response.data.data || response.data);
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error updating producto:", error);
    }
    throw error;
  }
};

export const deleteProducto = async (id) => {
  try {
    await adminApi.deleteProducto(id);
    return true;
  } catch (error) {
    if (error.response?.status !== 400) {
      console.error("Error deleting producto:", error);
    }
    throw error;
  }
};

export const getCategorias = async () => {
  try {
    const response = await adminApi.getCategorias();
    // 🔍 Extraer array de categorías manejando paginación o respuesta simple
    const raw = response.data?.data || response.data?.rows || response.data || [];
    const arr = Array.isArray(raw) ? raw : (raw.rows || []);
    return arr.map(c => ({
      id: c.id || c.IdCategoria,
      nombre: c.nombre || c.Nombre
    }));
  } catch (error) {
    if (error.response?.status !== 401 && error.response?.status !== 400) {
      console.error("Error fetching categorias:", error);
    }
    const raw = error.response?.data?.data || error.response?.data?.rows || error.response?.data || [];
    const arr = Array.isArray(raw) ? raw : (raw.rows || []);
    return arr.map(c => ({
      id: c.id || c.IdCategoria,
      nombre: c.nombre || c.Nombre
    }));
  }
};

export const getTallas = async () => {
  try {
    const response = await adminApi.getTallas();
    // ✅ CAMBIO: Manejar formato de respuesta estandarizada { success: true, data: [...] }
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching sizes:", error);
    return [];
  }
};

export const getEstados = async () => {
  try {
    const response = await adminApi.getEstados();
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return [];
  }
};

export const getColores = async () => {
    try {
        const response = await adminApi.getColores();
        return response.data?.data || response.data || [];
    } catch (error) {
        console.error("Error fetching colors:", error);
        return [];
    }
};
