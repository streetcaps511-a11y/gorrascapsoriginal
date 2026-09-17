# ⏱️ GUÍA COMPLETA: SISTEMA DE TIEMPOS DE DEVOLUCIONES

## 🎯 RESUMEN EJECUTIVO

El sistema automáticamente:
1. **Backend**: Cambia status de `"Enviado"` → `"Entregado"` después de 2 minutos
2. **Frontend**: Inhabilita botones de "Solicitar devolución" después de 2 minutos desde la entrega

Ambos están **sincronizados** con el mismo tiempo: **2 minutos en desarrollo, 10 días en producción**.

---

## 📍 DÓNDE ESTÁN LOS TIEMPOS

### 1. **Archivo de Configuración Centralizado** (NUEVO)
```
📄 frontend/src/shared/config/timersConfig.js
```
**Propósito**: Definir un único lugar donde se configuran todos los tiempos  
**Contenido**:
```javascript
export const DELIVERY_TO_RETURN_EXPIRY_TIME_MS = 2 * 60 * 1000;  // 2 minutos
```
**Reutilizado en**:
- Frontend (hook `useProfile.js`)
- Backend (comentario de referencia)

---

### 2. **Backend - Cambio Automático de Estado**
```
📁 backend/src/controllers/ventas.controller.js
📍 Línea 24: const AUTO_DELIVERY_TIME = 2 * 60 * 1000;
```

**¿Qué hace?**
```
Venta creada
    ↓ (usuario/admin marca como 'Enviado')
Status = "Enviado" + fechaEnvio guardada
    ↓ (espera 2 minutos)
Status cambia automáticamente a "Entregado" + fechaEntrega guardada
    ↓ (ahora los botones de devolución se inhabilitan)
```

**¿Dónde se ejecuta?**
- Función: `checkAutoDeliveries()` 
- Se llama en: `getAllVentas()` (línea ~48)
- Frecuencia: **Cada vez que se obtiene la lista de ventas**

**Cómo funciona internamente**:
```javascript
// Calcula umbral (hace 2 minutos)
const threshold = new Date(Date.now() - AUTO_DELIVERY_TIME);

// Busca todas las ventas "Enviado" que fueron enviadas hace 2+ minutos
await Venta.update(
    { statusenvio: 'Entregado', fechaEntrega: new Date() },
    { 
        where: { 
            statusenvio: 'Enviado', 
            fechaEnvio: { [Op.lte]: threshold }  // ← Op.lte = "less than or equal"
        } 
    }
);
```

---

### 3. **Frontend - Deshabilitación de Botones**
```
📁 frontend/src/features/tienda/Profile/hooks/useProfile.js
📍 Línea 239: const isReturnExpired = (order) => { ... }
```

**¿Qué hace?**
Verifica si un pedido tiene derecho a devolver comparando:
```javascript
const diffTime = today - fechaEntrega;
return diffTime > DELIVERY_TO_RETURN_EXPIRY_TIME_MS;  // true = deshabilitado
```

**¿Dónde se usa?**
```
📁 frontend/src/features/tienda/Profile/components/OrdersSection.jsx
📍 Línea ~375:
<button disabled={isReturnExpired(selectedOrder)} ...>
  Devolver todo el pedido
</button>
```

---

## 🔄 FLUJO COMPLETO (EJEMPLO EN TIEMPO REAL)

### Escenario: Un cliente compra una gorra a las **10:00 AM**

| Hora | Acción | Status Backend | Botón Frontend | Visible? |
|------|--------|----------------|----------------|----------|
| 10:00 | Compra realizada | `Completada` | - | - |
| 10:05 | Admin marca "Enviado" | `Enviado` | Solicitar devolución | ✅ SÍ |
| 10:07 | Timer ejecuta (2 min después) | `Entregado` | - (deshabilitado) | ❌ NO |
| 10:08+ | Usuario intenta hacer click | `Entregado` | Gris, deshabilitado | ❌ NO |

---

## ⚙️ CÓMO MODIFICAR EL TIEMPO

### OPCIÓN 1: Cambiar a 10 DÍAS (PRODUCCIÓN)

**Paso 1**: Actualizar el archivo centralizado
```javascript
// frontend/src/shared/config/timersConfig.js
export const DELIVERY_TO_RETURN_EXPIRY_TIME_MS = 10 * 24 * 60 * 60 * 1000;  // 10 días
```

**Paso 2**: Actualizar el backend (comentario de referencia)
```javascript
// backend/src/controllers/ventas.controller.js línea 24
const AUTO_DELIVERY_TIME = 10 * 24 * 60 * 60 * 1000;  // 10 días
```

**Paso 3**: Verificar en comentario de timersConfig.js
```javascript
/**
 * ⚠️ CAMBIAR EN PRODUCCIÓN:
 * 1. Cambiar aquí a: 10 * 24 * 60 * 60 * 1000 (10 días)
 * 2. Cambiar en backend/src/controllers/ventas.controller.js línea ~24
 * 3. Ambos deben tener el mismo valor
 */
```

---

### OPCIÓN 2: Cambiar a OTRO TIEMPO (Ej: 1 hora)

```javascript
// 1 hora en milisegundos = 1 * 60 * 60 * 1000
export const DELIVERY_TO_RETURN_EXPIRY_TIME_MS = 1 * 60 * 60 * 1000;
```

**Tabla de conversión rápida**:
- 5 minutos: `5 * 60 * 1000`
- 1 hora: `1 * 60 * 60 * 1000`
- 24 horas: `24 * 60 * 60 * 1000`
- 7 días: `7 * 24 * 60 * 60 * 1000`
- 10 días: `10 * 24 * 60 * 60 * 1000`
- 30 días: `30 * 24 * 60 * 60 * 1000`

---

## 🧪 CÓMO PROBAR EN DESARROLLO

### Prueba 1: Ver cambio automático de estado
1. Abre admin: `localhost:5173/admin/ventas`
2. Marca una venta como "Enviado"
3. Espera 2 minutos
4. Recarga la página
5. Status debe cambiar a "Entregado" automáticamente

### Prueba 2: Ver deshabilitación de botones
1. Abre perfil: `localhost:5173/perfil`
2. Ve a "Mis Pedidos"
3. Busca un pedido entregado hace 2+ minutos
4. El botón "Devolver" debe estar gris y deshabilitado
5. Si es menor a 2 minutos, debe estar azul y activo

---

## ⚠️ NOTAS IMPORTANTES

### Sincronización
- ⚠️ **CRÍTICO**: Backend y Frontend deben tener **el mismo tiempo**
- Si están desincronizados, el usuario verá botones que no funcionan o viceversa
- Solución: Ambos leen del mismo archivo de configuración

### Precisión
- El tiempo se mide desde `fechaEntrega` (timestamp de la base de datos)
- No depende de la hora del cliente
- Es independiente de zonas horarias

### Comportamiento en Producción
- **Desarrollo**: 2 minutos (testing)
- **Producción**: Cambiar a 10 días (negocio requiere periodo mayor)
- El código comentado lo indica claramente

---

## 📊 RESUMEN VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│           DIAGRAMA DE FLUJO TEMPORAL                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pedido Completado (T=0)                                    │
│  ↓                                                          │
│  Admin marca "Enviado" (T=1 seg)                            │
│  ├─ fechaEnvio: ahora                                       │
│  ├─ Status: "Enviado"                                       │
│  ├─ Botón devolver: ✅ ACTIVO                              │
│  ↓                                                          │
│  Sistema espera 2 minutos                                   │
│  ├─ Backend ejecuta checkAutoDeliveries()                   │
│  ├─ Encuentra ventas "Enviado" > 2 minutos                 │
│  ├─ Actualiza: Status = "Entregado"                        │
│  ├─ Guarda: fechaEntrega = ahora                           │
│  ├─ Botón devolver: ❌ DESHABILITADO                       │
│  ↓                                                          │
│  Usuario abre su perfil                                    │
│  └─ isReturnExpired() retorna true                         │
│     └─ Botón deshabilitado por 2 minutos                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 TROUBLESHOOTING

**P: El botón no se deshabilita después de 2 minutos**
R: Verifica que el estado backend sea "Entregado". Recarga la página para ejecutar `getAllVentas()`.

**P: El botón se deshabilita pero debería estar activo**
R: Verifica `fechaEntrega`. Si es NULL, el cálculo de tiempo fallará.

**P: Cambié el tiempo pero no funciona**
R: 
1. Verifica que los 2 archivos tengan el mismo valor
2. Limpia caché del navegador (Ctrl+Shift+Delete)
3. Reinicia frontend y backend

---

## 📚 REFERENCIAS

- **Archivo config**: `frontend/src/shared/config/timersConfig.js`
- **Backend**: `backend/src/controllers/ventas.controller.js` (línea 24)
- **Frontend hook**: `frontend/src/features/tienda/Profile/hooks/useProfile.js` (línea 239)
- **UI componente**: `frontend/src/features/tienda/Profile/components/OrdersSection.jsx` (línea ~375)
