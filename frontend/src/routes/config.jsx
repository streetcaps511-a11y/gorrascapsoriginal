/* === RUTAS DE BACKEND === 
   Define las URLs expuestas de la API para este módulo. 
   Aplica los middlewares de protección (como la validación de tokens JWT) antes de ceder el control al Controlador. */

// src/routes/config.jsx
import React, { lazy } from 'react';

// 📦 CARGA BAJO DEMANDA (Lazy Loading)
// Solo se cargará el código de la página que el usuario esté visitando.

// Admin Pages
const AdminDashboard = lazy(() => import("../features/admin/dashboard/pages/AdminDashboard"));
const AdminCategorias = lazy(() => import("../features/admin/Categorias/pages/Categorias"));
const ClientesPage = lazy(() => import("../features/admin/ClientesPage/pages/ClientesPage"));
const ComprasPage = lazy(() => import("../features/admin/ComprasPage/pages/ComprasPage"));
const DevolucionesPage = lazy(() => import("../features/admin/DevolucionesPage/pages/DevolucionesPage"));
const ProductosPage = lazy(() => import("../features/admin/Productos/pages/ProductosPage"));
const ProveedoresPage = lazy(() => import("../features/admin/ProveedoresPage/pages/ProveedoresPage"));
const RolesPage = lazy(() => import("../features/admin/RolesPage/pages/RolesPage"));
const UsersPage = lazy(() => import("../features/admin/UsersPage/pages/UsersPage"));
const VentasPage = lazy(() => import("../features/admin/VentasPage/pages/VentasPage"));

// Tienda Pages
const Home = lazy(() => import("../features/tienda/Home/pages/Home"));
const Productos = lazy(() => import("../features/tienda/Productos/pages/Productos"));
const Categorias = lazy(() => import("../features/tienda/Categorias/pages/Categorias"));
const CategoriaDetalle = lazy(() => import("../features/tienda/CategoriaDetalle/pages/CategoriaDetalle"));
const Ofertas = lazy(() => import("../features/tienda/Ofertas/pages/Ofertas"));
const Profile = lazy(() => import("../features/tienda/Profile/pages/Profile"));
const Cart = lazy(() => import("../features/tienda/cart/pages/Cart"));
const SearchResults = lazy(() => import("../features/tienda/SearchResults/pages/SearchResults"));

// Policies Pages
const QuienesSomos = lazy(() => import("../features/tienda/Policies/pages/QuienesSomos"));
const PoliticasEnvio = lazy(() => import("../features/tienda/Policies/pages/PoliticasEnvio"));
const PoliticasCambios = lazy(() => import("../features/tienda/Policies/pages/PoliticasCambios"));

// Auth Pages
const Login = lazy(() => import("../features/auth/pages/Login"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));

/**
 * 📦 CONFIGURACIÓN DE RUTAS
 * De esta manera mantenemos las rutas organizadas y fáciles de mantener.
 */

export const STORE_ROUTES = [
  { path: "/", element: <Home />, exact: true },
  { path: "/productos", element: <Productos /> },
  { path: "/categorias", element: <Categorias /> },
  { path: "/categorias/:nombreCategoria", element: <CategoriaDetalle /> },
  { path: "/ofertas", element: <Ofertas /> },
  { path: "/perfil", element: <Profile /> },
  { path: "/carrito", element: <Cart /> },
  { path: "/search", element: <SearchResults /> },
  { path: "/login", element: <Login /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/quienes-somos", element: <QuienesSomos /> },
  { path: "/politicas-envio", element: <PoliticasEnvio /> },
  { path: "/politica-devoluciones", element: <PoliticasCambios /> },
];

export const ADMIN_ROUTES = [
  { index: true, element: (user) => <AdminDashboard user={user} /> },
  { path: "dashboard", element: (user) => <AdminDashboard user={user} /> },
  { path: "categorias", element: () => <AdminCategorias /> },
  { path: "productos", element: () => <ProductosPage /> },
  { path: "proveedores", element: () => <ProveedoresPage /> },
  { path: "compras", element: () => <ComprasPage /> },
  { path: "clientes", element: () => <ClientesPage /> },
  { path: "ventas", element: () => <VentasPage /> },
  { path: "devoluciones", element: () => <DevolucionesPage /> },
  { path: "usuarios", element: () => <UsersPage /> },
  { path: "roles", element: () => <RolesPage /> },
];
