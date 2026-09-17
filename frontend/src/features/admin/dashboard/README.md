# Estructura del Dashboard del Admin

## Organización

```
src/features/admin/dashboard/
├── components/         # Componentes UI del dashboard
│   ├── Charts.jsx        - Gráficos (SalesChart, PurchasesChart)
│   ├── Lists.jsx         - Listas (TopProductsList, FrequentCustomersList)
│   └── index.js          - Exportaciones centralizadas
│
├── hooks/              # Lógica y Estado
│   ├── useDashboardFilters.js  - Manejo de filtros
│   ├── useDashboardData.js     - Obtención de datos desde API
│   ├── useChartData.js         - Procesamiento de datos para gráficos
│   └── index.js                - Exportaciones centralizadas
│
├── pages/              # Páginas principales
│   ├── AdminDashboard.jsx      - Página principal del dashboard
│   └── index.js                - Exportaciones
│
├── services/           # Servicios (conectados a ../../services/adminApi.js)
│
├── style/              # Estilos CSS
│   └── AdminDashboard.css
│
└── README.md           - Este archivo
```

## Características

### Components

#### `Charts.jsx`
- **SalesChart**: Gráfico de barras de ventas mensuales
- **PurchasesChart**: Gráfico de barras de compras mensuales

#### `Lists.jsx`
- **TopProductsList**: Listado de productos más vendidos (top 5)
- **FrequentCustomersList**: Listado de clientes frecuentes

### Hooks

#### `useDashboardFilters()`
Maneja el estado de todos los filtros del dashboard:
- Día, Mes, Año
- Búsqueda de ventas
- Búsqueda de productos
- Búsqueda de clientes

#### `useDashboardData(selectedYear)`
Obtiene datos desde la API:
- Ventas (`getVentas()`)
- Compras (`getCompras()`)
- Clientes (`getClientes()`)
- Maneja estados: loading, error

#### `useChartData.js`
Utilidades para procesar datos:
- `parseDate()` - Parsea fechas DD/MM/YYYY
- `formatCurrency()` - Formatea moneda en COP
- `getMonthName()` - Obtiene nombre del mes abreviado
- `useSalesByMonth()` - Calcula ventas por mes
- `usePurchasesByMonth()` - Calcula compras por mes
- `useTopProducts()` - Obtiene presone top filtrados

### Rutas de Importación

El dashboard ya está integrado en las rutas principales:
- `src/App.jsx` importa desde `./features/admin/dashboard/pages/AdminDashboard`
- `src/features/admin/pages/index.js` exporta desde `../dashboard/pages/AdminDashboard`

## API Conectada

Usa las siguientes funciones de `src/features/admin/services/adminApi.js`:
- `getVentas()` - Obtiene todas las ventas
- `getCompras()` - Obtiene todas las compras
- `getClientes()` - Obtiene todos los clientes

## Sin Data Hardcodeada

El dashboard ya **NO depende** de:
- `initialSales` (data.js)
- `initialOrders` (data.js)
- `initialCustomers` (data.js)

Todos los datos provienen de la API externa.

## Estilos

Los estilos están contenidos en:
1. `AdminDashboard.css` - Estilos específicos del dashboard
2. Estilos inline en `AdminDashboard.jsx` para componentes principales
3. Estilos importados: `styles/admin.css`, `components/style/style.css`

## Próximos Pasos

Para aplicar la misma estructura a otros módulos adminales (Categorías, Productos, etc.):

1. Crear carpetas similares en `src/features/admin/[modulo]/`
2. Extraer componentes específicos del módulo
3. Crear hooks personalizados para lógica de negocio
4. Conectar con funciones de `adminApi.js`

Ejemplo:
```
src/features/admin/categorias/
├── components/
├── hooks/
├── pages/
├── services/
├── style/
└── README.md
```
