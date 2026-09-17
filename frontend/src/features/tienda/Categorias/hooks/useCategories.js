/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCategorias } from "../services/categoriasApi";
import { NitroCache } from "../../../shared/utils/NitroCache";
import { useSearch } from "../../../shared/contexts";

const CATS_CACHE_KEY = 'tienda_categorias';
const CATS_TTL = 30 * 1000; // 30 segundos

const getCachedCats = () => {
  const cached = NitroCache.get(CATS_CACHE_KEY);
  return cached?.data || [];
};

// Sin imágenes quemadas — todas las imágenes vienen de la base de datos (campo ImagenUrl)

export const useCategories = () => {
  const { searchTerm: searchQuery } = useSearch();
  const [categories, setCategories] = useState(() => getCachedCats());
  const [loading, setLoading] = useState(() => getCachedCats().length === 0);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategorias();
      if (res?.data?.data) {
        const cats = res.data.data.map(c => ({
            id: c.id_categoria || c.id,
            Nombre: c.nombre_categoria || c.nombre,
            Descripcion: c.descripcion || '',
            ImagenUrl: c.imagenUrl || c.ImagenUrl || ''
        }));
        setCategories(cats);
        NitroCache.set(CATS_CACHE_KEY, cats);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setCategories([]);
      } else {
        console.error("Error fetching categories:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (NitroCache.isFresh(CATS_CACHE_KEY, CATS_TTL)) {
      setLoading(false);
    } else {
      fetchCats();
    }
    
    window.scrollTo(0, 0);

    // 📡 ESCUCHAR ACTUALIZACIONES DESDE OTRAS PESTAÑAS (Sync Instantáneo)
    const channel = new BroadcastChannel('app_sync');
    channel.onmessage = (event) => {
      if (event.data === 'categorias_updated') {
        NitroCache.clear(CATS_CACHE_KEY);
        fetchCats();
      }
    };

    return () => channel.close();
  }, [fetchCats]);

  const sortedCategories = useMemo(() => {
    let filtered = categories;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = categories.filter(cat => 
        cat.Nombre.toLowerCase().includes(query) ||
        cat.Descripcion?.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      if (a.Nombre?.toLowerCase() === "camisetas") return 1;
      if (b.Nombre?.toLowerCase() === "camisetas") return -1;
      return 0;
    });
  }, [searchQuery, categories]);

  // Retorna la imagen directamente desde la base de datos (campo ImagenUrl)
  // Sequelize lo serializa como imagenUrl (camelCase) en el JSON de respuesta
  const getCategoryImage = (cat) => {
    return cat.imagenUrl || cat.ImagenUrl || null;
  };

  return {
    searchQuery,
    sortedCategories,
    loading,
    getCategoryImage
  };
};
