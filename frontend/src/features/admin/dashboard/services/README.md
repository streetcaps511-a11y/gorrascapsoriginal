# Dashboard Services

Servicio API centralizado para el dashboard del admin.

## Funciones Disponibles

### `fetchDashboardVentas()`
Obtiene todas las ventas desde la API.

```javascript
import { fetchDashboardVentas } from '../services';

const ventas = await fetchDashboardVentas();
```

---

### `fetchDashboardCompras()`
Obtiene todas las compras desde la API.

```javascript
import { fetchDashboardCompras } from '../services';

const compras = await fetchDashboardCompras();
```

---

### `fetchDashboardClientes()`
Obtiene todos los clientes desde la API.

```javascript
import { fetchDashboardClientes } from '../services';

const clientes = await fetchDashboardClientes();
```

---

### `fetchAllDashboardData()`
Obtiene ventas, compras y clientes en paralelo (más eficiente).

```javascript
import { fetchAllDashboardData } from '../services';

const { ventas, compras, clientes } = await fetchAllDashboardData();
```

**Usado en**: `hooks/useDashboardData.js`

---

### `filterVentasByDateRange(ventas, startDate, endDate)`
Filtra ventas por rango de fechas.

```javascript
import { filterVentasByDateRange } from '../services';

const filtered = filterVentasByDateRange(ventas, '01/01/2024', '31/12/2024');
```

---

### `filterComprasByDateRange(compras, startDate, endDate)`
Filtra compras por rango de fechas.

```javascript
import { filterComprasByDateRange } from '../services';

const filtered = filterComprasByDateRange(compras, '01/01/2024', '31/12/2024');
```

---

## Arquitectura

```
dashboardApi.js
├── Llama a → ../../services/adminApi.js
└── Exportado por → index.js
    └── Consumido por → hooks/useDashboardData.js
```

## Error Handling

Todos los servicios incluyen manejo de errores:

```javascript
try {
  const data = await fetchAllDashboardData();
} catch (error) {
  console.error('Error:', error.message);
}
```

## Notas

- Los servicios están desacoplados de los hooks
- Pueden ser usado en cualquier componente
- Todas las funciones son asincrónicas
- El manejo de estado se hace en los hooks, no en los servicios
