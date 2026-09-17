/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

// src/features/shared/services/adminApi.js
import api from "./api";

// Métodos genéricos expuestos
export const get = (...args) => api.get(...args);
export const post = (...args) => api.post(...args);
export const put = (...args) => api.put(...args);
export const patch = (...args) => api.patch(...args);
export const del = (...args) => api.delete(...args);

// ── Categorías ──
export const getCategorias = () => api.get("/api/categorias");
export const createCategoria = (data) => api.post("/api/categorias", data);
export const updateCategoria = (id, data) => api.put(`/api/categorias/${id}`, data);
export const deleteCategoria = (id) => api.delete(`/api/categorias/${id}`);

// ── Productos ──
export const getProductos = (params = { todos: true }) => api.get("/api/productos", { params });
export const createProducto = (data) => api.post("/api/productos", data);
export const updateProducto = (id, data) => api.put(`/api/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/api/productos/${id}`);

// ── Proveedores ──
export const getProveedores = () => api.get("/api/proveedores");
export const getProviders = getProveedores;
export const createProveedor = (data) => api.post("/api/proveedores", data);
export const createProvider = createProveedor;
export const updateProveedor = (id, data) => api.put(`/api/proveedores/${id}`, data);
export const updateProvider = updateProveedor;
export const deleteProveedor = (id) => api.delete(`/api/proveedores/${id}`);
export const deleteProvider = deleteProveedor;

// ── Clientes ──
export const getClientes = () => api.get("/api/clientes");
export const getClients = getClientes;
export const createCliente = (data) => api.post("/api/clientes", data);
export const createClient = createCliente;
export const updateCliente = (id, data) => api.put(`/api/clientes/${id}`, data);
export const updateClient = updateCliente;
export const deleteCliente = (id) => api.delete(`/api/clientes/${id}`);
export const deleteClient = deleteCliente;

// ── Ventas ──
export const getVentas = () => api.get("/api/ventas");
export const getSales = getVentas;
export const createVenta = (data) => api.post("/api/ventas", data);
export const createSale = createVenta;
export const updateSale = (id, data) => api.put(`/api/ventas/${id}`, data);
export const updateEnvioStatus = (id, statusenvio) => api.patch(`/api/ventas/${id}/envio`, { statusenvio });

// ── Compras ──
export const getCompras = () => api.get("/api/compras");
export const createCompra = (data) => api.post("/api/compras", data);

// ── Devoluciones ──
export const getDevoluciones = () => api.get("/api/devoluciones");
export const createDevolucion = (data) => api.post("/api/devoluciones", data);
export const updateDevolucion = (id, data) => api.put(`/api/devoluciones/${id}`, data);

// ── Usuarios ──
export const getUsuarios = () => api.get("/api/usuarios");
export const getUsers = getUsuarios;
export const createUsuario = (data) => api.post("/api/usuarios", data);
export const createUser = createUsuario;
export const updateUsuario = (id, data) => api.put(`/api/usuarios/${id}`, data);
export const updateUser = updateUsuario;
export const deleteUsuario = (id) => api.delete(`/api/usuarios/${id}`);
export const deleteUser = deleteUsuario;

// ── Dashboard ──
export const getDashboardStats = () => api.get("/api/dashboard/estadisticas");

// ── Roles ──
export const getRoles = () => api.get("/api/roles");
export const createRole = (data) => api.post("/api/roles", data);
export const updateRole = (id, data) => api.put(`/api/roles/${id}`, data);
export const deleteRole = (id) => api.delete(`/api/roles/${id}`);

// ── Otros ──
export const getEstados = () => api.get("/api/estados");
export const getMetodosPago = () => api.get("/api/estados/tipo/metodo_pago");
export const getTallas = () => api.get("/api/tallas");
export const getColores = () => api.get("/api/colores");