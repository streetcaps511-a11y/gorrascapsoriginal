/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

// src/features/shared/services/index.js

// ─────────────────────────────────────────────────────────────
// ADMIN COMPONENTS (Shared)
// ─────────────────────────────────────────────────────────────
export { default as ProductCardAdmin } from "../components/admin/ProductCard";
export { default as ProductoDetalleAdmin } from "../components/admin/ProductoDetalle";
export { default as Alert } from "../components/admin/Alert";
export { default as StatusPill } from "../components/admin/StatusPill";
export { default as ErrorBoundary } from "../components/admin/ErrorBoundary";
export { default as UniversalModal } from "../components/admin/UniversalModal";
export { default as ConfirmDeleteModal } from "../components/admin/ConfirmDeleteModal";

export { default as EntityDetailsModal } from "../components/admin/EntityDetailsModal";
export { default as BlurModalOverlay } from "../components/admin/BlurModalOverlay";
export { default as EntityTable } from "../components/admin/EntityTable";
export { default as CustomPagination } from "../components/admin/CustomPagination";
export { default as SearchSelect } from "../components/admin/SearchSelect";
export { default as SearchInput } from "../components/admin/SearchInput";
export { default as DateRangeFilter } from "../components/admin/DateRangeFilter";
export { default as DateInputWithCalendar } from "../components/admin/DateInputWithCalendar";

// ─────────────────────────────────────────────────────────────
// ADMIN PAGES & LAYOUT
// ─────────────────────────────────────────────────────────────
export { default as AdminLayout } from "../../admin/AdminLayout/AdminLayout";
export { default as AdminDashboard } from "../../admin/dashboard/pages/AdminDashboard";
export { default as AdminCategorias } from "../../admin/Categorias/pages/Categorias";
export { default as ClientesPage } from "../../admin/ClientesPage/pages/ClientesPage";
export { default as ComprasPage } from "../../admin/ComprasPage/pages/ComprasPage";
export { default as DevolucionesPage } from "../../admin/DevolucionesPage/pages/DevolucionesPage";
export { default as ProductosPage } from "../../admin/Productos/pages/ProductosPage";
export { default as ProveedoresPage } from "../../admin/ProveedoresPage/pages/ProveedoresPage";
export { default as RolesPage } from "../../admin/RolesPage/pages/RolesPage";
export { default as UsersPage } from "../../admin/UsersPage/pages/UsersPage";
export { default as VentasPage } from "../../admin/VentasPage/pages/VentasPage";

// ─────────────────────────────────────────────────────────────
// TIENDA COMPONENTS (Shared)
// ─────────────────────────────────────────────────────────────
export { default as Header } from "../components/tienda/Header";
export { default as Footer } from "../components/tienda/Footer";
export { default as ProductCard } from "../components/tienda/ProductCard";
export { default as ProductoDetalle } from "../components/tienda/ProductoDetalle";
export { default as UserMenu } from "../components/tienda/UserMenu";

// ─────────────────────────────────────────────────────────────
// TIENDA PAGES
// ─────────────────────────────────────────────────────────────
export { default as Home } from "../../tienda/Home/pages/Home";
export { default as Productos } from "../../tienda/Productos/pages/Productos";
export { default as Categorias } from "../../tienda/Categorias/pages/Categorias";
export { default as CategoriaDetalle } from "../../tienda/CategoriaDetalle/pages/CategoriaDetalle";
export { default as Ofertas } from "../../tienda/Ofertas/pages/Ofertas";
export { default as Profile } from "../../tienda/Profile/pages/Profile";
export { default as Cart } from "../../tienda/cart/pages/Cart";
export { default as SearchResults } from "../../tienda/SearchResults/pages/SearchResults";

// ─────────────────────────────────────────────────────────────
// AUTH PAGES
// ─────────────────────────────────────────────────────────────
export { default as Login } from "../../auth/pages/Login";
export { default as ResetPassword } from "../../auth/pages/ResetPassword";