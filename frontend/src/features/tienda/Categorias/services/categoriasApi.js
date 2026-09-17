/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import api from "../../../shared/services/api";

/**
 * Obtiene todas las categorías públicas de la API.
 */
export const getCategorias = () => api.get("/api/categorias");
