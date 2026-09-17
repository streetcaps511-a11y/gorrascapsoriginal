/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../../shared/contexts";
import { getProductosPublicos } from "../services/searchResultsApi";

export const useSearchResults = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState({ open: false, text: '' });

  // Load all products from API
  useEffect(() => {
    const fetchAll = async () => {
      const prods = await getProductosPublicos();
      setAllProducts(prods);
    };
    fetchAll();
  }, []);

  // Search logic
  const searchProducts = useCallback((query, products) => {
    if (!query.trim() || !products.length) return [];
    
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const searchTerms = normalizedQuery.split(' ').filter(t => t.length > 0);
    
    return products.filter(product => {
      const searchableText = [
        product.nombre?.toLowerCase(),
        product.categoria?.toLowerCase(),
        product.descripcion?.toLowerCase()
      ].join(' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      return searchTerms.some(term =>
        searchableText.includes(term) ||
        (term.length > 3 && searchableText.includes(term.substring(0, term.length - 1)))
      );
    });
  }, []);

  const generateSuggestions = useCallback((query) => {
    const popularCategories = ['Gorras', 'Accesorios', 'Deportes', 'Ropa', 'Ofertas', 'Nuevos'];
    if (!query) return popularCategories;
    return popularCategories.filter(item =>
      item.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(item.toLowerCase())
    ).slice(0, 6);
  }, []);

  // React to URL query param changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';
    setSearchTerm(query);
    setHasSearched(true);
    
    if (query && allProducts.length > 0) {
      setLoading(true);
      setResults(searchProducts(query, allProducts));
      setSuggestions(generateSuggestions(query));
      setLoading(false);
    } else if (!query) {
      setResults([]);
      setSuggestions(generateSuggestions(''));
      setLoading(false);
    }
  }, [location.search, allProducts, searchProducts, generateSuggestions]);

  const showToast = (text) => {
    setToast({ open: true, text });
    setTimeout(() => setToast({ open: false, text: '' }), 3000);
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      // Identificadores
      id: product.id,
      id_producto: product.id,
      
      // Info Básica
      nombre: product.nombre,
      name: product.nombre,
      imagen: product.imagenes?.[0] || product.imagen || '',
      image: product.imagenes?.[0] || product.imagen || '',
      categoria: product.categoria,
      categoria_nombre: product.categoria,
      
      // Precios (Estandarizado)
      precio: Math.round(product.precio || 0),
      precio_normal: Math.round(product.precio || 0),
      precioNormal: Math.round(product.precio || 0),
      precioOferta: product.precioOferta ? Math.round(product.precioOferta) : null,
      precio_descuento: product.precioOferta ? Math.round(product.precioOferta) : null,
      precioMayorista6: product.precioMayorista6,
      precio_mayorista6: product.precioMayorista6,
      precioMayorista80: product.precioMayorista80,
      precio_mayorista80: product.precioMayorista80,
      
      // Flags de Oferta
      enOfertaVenta: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      oferta: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      has_discount: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      
      // Selección actual
      quantity: 1, 
      talla: (Array.isArray(product.tallas) && product.tallas[0]) || 'Única',
      
      // Stock para validación
      tallasStock: product.tallasStock || [],
      stock: parseInt(product.stock) || 0
    };

    addToCart(cartItem);
    showToast('✓ Producto agregado al carrito');
  };

  const handleSearch = (newQuery) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return {
    results,
    loading,
    searchTerm,
    suggestions,
    hasSearched,
    toast,
    handleAddToCart,
    handleSearch,
    navigate
  };
};
