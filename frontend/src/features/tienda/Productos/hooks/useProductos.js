import { useState, useEffect, useMemo, useRef } from 'react';
import { getAllProducts } from "../services/productosApi";
import { NitroCache } from '../../../shared/utils/NitroCache';
import { useSearch, useCart } from '../../../shared/contexts';
import api from '../../../shared/services/api';

export const BULK_MIN_QTY = 6;

// Helpers compactos
export const normalizeSizes = (p) => 
  Array.isArray(p?.tallasStock) ? p.tallasStock.map(t => t.talla).filter(Boolean) : [];

export const safeImg = (p) => {
  let url = p?.imagenes?.[0] || p?.imagen || 'https://placehold.co/300?text=Sin+Imagen';
  return url.startsWith('/') ? `http://localhost:3000${url}` : url;
};

const normalizeImages = (p) => {
  try {
    if (Array.isArray(p?.imagenes)) return p.imagenes.map(x => String(x).trim()).filter(Boolean);
    if (typeof p?.imagenes === 'string' && p.imagenes.trim() !== '') {
      const raw = p.imagenes.trim();
      if (raw.startsWith('[') && raw.endsWith(']')) return JSON.parse(raw).map(x => String(x).trim()).filter(Boolean);
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (p?.imagen) return [String(p.imagen).trim()];
  } catch (e) {
    return p?.imagen ? [String(p.imagen).trim()] : [];
  }
  return [];
};

export const getRatingFromProduct = (p) => p?.rating || 4.5;

const mapProduct = (p) => {
  const stock = p.stock !== undefined ? Number(p.stock) : (Array.isArray(p.tallasStock) 
    ? p.tallasStock.reduce((s, t) => s + (Number(t.cantidad) || 0), 0) 
    : 10);
  
  return {
    id: p.id, 
    nombre: p.nombre, 
    category: p.categoria || 'General',
    categoria: p.categoria || 'General',
    precio: Number(p.precio || p.precioVenta || 0),
    precioOferta: (p.precioOferta && Number(p.precioOferta) > 0) ? Number(p.precioOferta) : null,
    enOferta: !!(p.precioOferta && Number(p.precioOferta) > 0),
    precioMayorista6: Number(p.precioMayorista6 || 0),
    precioMayorista80: Number(p.precioMayorista80 || 0),
    imagen: safeImg(p), 
    imagenes: normalizeImages(p),
    colores: p.colores || [], 
    tallasStock: p.tallasStock || [],
    stock, 
    descripcion: p.descripcion || '', 
    rating: p.rating || 5, 
    isActive: true
  };
};

export const useProductos = () => {
  const { searchTerm, setSearchTerm } = useSearch();
  const [initialProducts, setInitialProducts] = useState([]);
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const initialProductsRef = useRef(initialProducts);

  useEffect(() => {
    initialProductsRef.current = initialProducts;
  }, [initialProducts]);

  useEffect(() => {
    const load = async () => {
      try {
        const cached = NitroCache.get('gm_all_products');
        if (cached?.data) { setInitialProducts(cached.data); setLoading(false); }

        const res = await getAllProducts();
        const raw = res.data?.data?.products || res.data?.data || [];

        // FILTRADO ESTRICTO - Elimina productos inválidos
        const products = raw
          .filter(p => {
            if (p.isActive === false) return false;
            if (!p.nombre || p.nombre.trim() === '') return false;
            const precio = Number(p.precio || p.precioVenta || 0);
            if (precio <= 0) return false;
            return true;
          })
          .map(mapProduct);

        setInitialProducts(products);
        NitroCache.set('gm_all_products', products, 3600000);
      } catch (e) { console.error("Error:", e); } 
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setSearchedProducts([]);
      return;
    }

    let isMounted = true;
    const fetchSearch = async () => {
      try {
        const response = await api.get('/api/productos', {
          params: { search: debouncedSearchTerm, limit: 6 }
        });
        const resData = response?.data;
        const raw = Array.isArray(resData) 
          ? resData 
          : (resData?.data?.products || resData?.data || []);
        if (isMounted) {
          const products = raw
            .filter(p => {
              if (p.isActive === false) return false;
              if (!p.nombre || p.nombre.trim() === '') return false;
              return true;
            })
            .map(sp => {
              const found = initialProductsRef.current.find(p => p.id === sp.id);
              return found ? found : mapProduct(sp);
            });
          setSearchedProducts(products);
        }
      } catch (err) {
        console.error("Error al buscar productos en useProductos:", err);
      }
    };

    fetchSearch();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm]);

  // Filtrado de productos basado en la búsqueda
  const filteredProducts = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === '') return initialProducts;
    return searchedProducts;
  }, [searchTerm, initialProducts, searchedProducts]);

  const { addToCart } = useCart();

  // Modal handlers
  const openModal = (p) => { 
    setSelectedProduct(p); 
    setSelectedSize(null); 
    setQuantity(1); 
    setShowSizeError(false); 
    setLoadingDetail(true); 
    setTimeout(()=>setLoadingDetail(false), 300); 

    // Actualizar URL con el parámetro del producto
    const url = new URL(window.location.href);
    url.searchParams.set('producto', p.id);
    window.history.replaceState({}, '', url.pathname + url.search);
  };
  
  const closeModal = () => { 
    setSelectedProduct(null); 
    setSelectedSize(null); 
    setQuantity(1); 
    setShowSizeError(false); 

    // Limpiar el parámetro de la URL
    const url = new URL(window.location.href);
    if (url.searchParams.has('producto')) {
      url.searchParams.delete('producto');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  };
  
  const handleSizeSelect = (s) => { 
    if (selectedSize === s) {
      setSelectedSize(null);
      setQuantity(0);
    } else {
      setSelectedSize(s); 
      setShowSizeError(false); 
      setQuantity(1);
    }
  };
  
  const incrementQuantity = () => {
    if (!selectedSize && normalizeSizes(selectedProduct).length > 0) {
      setShowSizeError(true);
      return;
    }
    setQuantity(q => q + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(q => q > 1 ? q - 1 : 1);
  };
  
  // ✅ PERMITE BORRAR COMPLETAMENTE EL CAMPO DE CANTIDAD
  const handleQuantityInput = (val) => {
    // Permitir campo vacío
    if (val === '' || val === null || val === undefined) {
      setQuantity('');
      return;
    }
    
    const num = parseInt(val, 10);
    
    // Permitir borrar completamente
    if (isNaN(num)) {
      setQuantity('');
      return;
    }
    
    // Solo aceptar si es mayor a 0
    if (num > 0) {
      setQuantity(num);
    }
  };
  
  const handleModalAddToCart = () => {
    if (!selectedProduct) return;
    const sizesForModal = normalizeSizes(selectedProduct);
    if (sizesForModal.length > 0 && !selectedSize) { 
      setShowSizeError(true); 
      return; 
    }
    
    const size = selectedSize || sizesForModal[0] || "Única";
    const q = parseInt(quantity) || 0;
    if (q <= 0) return;

    let finalPrice = selectedProduct.precioOferta 
      ? Math.round(selectedProduct.precioOferta) 
      : Math.round(selectedProduct.precio || 0);

    if (q >= 80 && parseFloat(selectedProduct.precioMayorista80 || 0) > 0) {
      finalPrice = Math.round(selectedProduct.precioMayorista80);
    } else if (q >= 6 && parseFloat(selectedProduct.precioMayorista6 || 0) > 0) {
      finalPrice = Math.round(selectedProduct.precioMayorista6);
    }

    const cartItem = {
      id: selectedProduct.id,
      id_producto: selectedProduct.id,
      nombre: selectedProduct.nombre,
      name: selectedProduct.nombre,
      imagen: safeImg(selectedProduct),
      image: safeImg(selectedProduct),
      categoria: selectedProduct.categoria || selectedProduct.category,
      categoria_nombre: selectedProduct.categoria || selectedProduct.category,
      precio: finalPrice,
      precio_normal: Math.round(selectedProduct.precio || 0),
      precioNormal: Math.round(selectedProduct.precio || 0),
      precioOferta: selectedProduct.precioOferta ? Math.round(selectedProduct.precioOferta) : null,
      precio_descuento: selectedProduct.precioOferta ? Math.round(selectedProduct.precioOferta) : null,
      precioMayorista6: selectedProduct.precioMayorista6,
      precioMayorista80: selectedProduct.precioMayorista80,
      enOfertaVenta: !!selectedProduct.enOferta,
      oferta: !!selectedProduct.enOferta,
      has_discount: !!selectedProduct.enOferta,
      quantity: q,
      talla: size,
      tallasStock: selectedProduct.tallasStock || [],
      stock: parseInt(selectedProduct.stock) || 0
    };

    addToCart(cartItem);
    closeModal();
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Cargar información completa del producto seleccionado para validación de tallas/detalles
  useEffect(() => {
    if (!selectedProduct) return;
    if (Array.isArray(selectedProduct.tallasStock) && selectedProduct.tallasStock.length > 0 && selectedProduct.descripcion) return;
    
    let isMounted = true;
    const fetchFullProduct = async () => {
      try {
        const response = await api.get(`/api/productos/${selectedProduct.id}`);
        if (response?.data?.data && isMounted) {
          setSelectedProduct(prev => {
            if (prev?.id === response.data.data.id) {
              return { ...prev, ...response.data.data };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Error fetching full product details in useProductos hook:", err);
      }
    };
    fetchFullProduct();
    return () => { isMounted = false; };
  }, [selectedProduct?.id]);

  // 🕵️‍♂️ Detectar si viene un id de producto en la URL para abrir el modal automáticamente
  useEffect(() => {
    if (initialProducts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('producto');
      if (prodId) {
        const found = initialProducts.find(p => String(p.id) === String(prodId));
        if (found) {
          // Un pequeño delay para que la transición visual sea suave
          const timer = setTimeout(() => {
            openModal(found);
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [initialProducts]);

  return {
    loading, loadingDetail, initialProducts, filteredProducts, searchTerm, setSearchTerm, selectedProduct, openModal, closeModal,
    selectedSize, handleSizeSelect, quantity, incrementQuantity, decrementQuantity, handleQuantityInput, handleModalAddToCart,
    showSizeError, showSuccessToast, normalizeSizes, safeImg, getRatingFromProduct, BULK_MIN_QTY
  };
};