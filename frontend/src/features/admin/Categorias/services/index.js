/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

export { default as CategoriasPage } from './pages/CategoriasPage';
export { useCategoriasLogic } from './hooks/useCategoriasLogic';
export { categoriasApi } from './services/categoriasApi';
export { CategoryCard, StatusFilter } from './components';