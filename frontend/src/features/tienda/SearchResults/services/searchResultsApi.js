/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import api from "../../../shared/services/api";

/**
 * Fetch all public products for search
 */
export const getProductosPublicos = async () => {
  try {
    const response = await api.get('/api/productos');
    if (response.data.status === 'success' && response.data.data.products) {
      const normalizeImages = (p) => {
        try {
          if (Array.isArray(p.imagenes)) return p.imagenes.map(x => String(x).trim()).filter(Boolean);
          if (typeof p.imagenes === 'string' && p.imagenes.trim() !== '') {
            const raw = p.imagenes.trim();
            if (raw.startsWith('[') && raw.endsWith(']')) return JSON.parse(raw).map(x => String(x).trim()).filter(Boolean);
            return raw.split(',').map(s => s.trim()).filter(Boolean);
          }
          if (p.imagen) return [String(p.imagen).trim()];
        } catch (e) { return p.imagen ? [String(p.imagen).trim()] : []; }
        return [];
      };

      return response.data.data.products.map(p => ({
        id: p.id_producto,
        nombre: p.nombre,
        categoria: p.categoria_nombre,
        precio: p.precio_normal,
        precioOferta: p.precio_descuento,
        hasDiscount: p.has_discount || false,
        oferta: p.is_oferta || false,
        descripcion: p.descripcion || "",
        tallas: p.tallas || [],
        colores: p.colores || ["Negro"],
        imagenes: normalizeImages(p),
        isFeatured: p.is_featured || false,
        isActive: p.is_active !== undefined ? p.is_active : true,
        stock: p.stock,
        tallasStock: p.tallasStock || []
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching products for search:", error);
    return [];
  }
};
