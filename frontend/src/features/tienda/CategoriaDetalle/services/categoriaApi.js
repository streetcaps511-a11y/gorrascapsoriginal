/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import api from "../../../shared/services/api";

/**
 * Obtiene todas las categorías públicas.
 */
export const getCategorias = () => api.get("/api/categorias");

/**
 * Obtiene productos filtrados por nombre de categoría usando el endpoint optimizado.
 * Solo trae los productos de la categoría solicitada (mucho más rápido).
 * @param {string} categoriaName - Nombre de la categoría (ej: "Exclusiva")
 */
export const getProductsByCategoryName = (categoriaName) =>
  api.get(`/api/productos/por-categoria/${encodeURIComponent(categoriaName)}`);

/**
 * Obtiene todos los productos públicos (carga completa del catálogo para caché).
 */
export const getAllProducts = () => api.get("/api/productos", { params: { todos: true } });
