/**
 * ⏱️ CONFIGURACIÓN CENTRALIZADA DE TIEMPOS
 * 
 * Este archivo contiene todos los tiempos utilizados en la aplicación
 * para cambios automáticos de estado y expiración de funcionalidades.
 * 
 * IMPORTANTE: Estos tiempos deben ser coordinados entre Frontend y Backend
 * para mantener consistencia.
 */

// ⏱️ TIEMPO DE AUTO-ENTREGA Y EXPIRACIÓN DE DEVOLUCIONES
// 2 minutos para pruebas (desarrollo)
// En producción: cambiar a 10 * 24 * 60 * 60 * 1000 (10 días)
export const DELIVERY_TO_RETURN_EXPIRY_TIME_MS = 2 * 60 * 1000;

// Conversión a horas para referencia
export const DELIVERY_TO_RETURN_EXPIRY_HOURS = DELIVERY_TO_RETURN_EXPIRY_TIME_MS / (1000 * 60 * 60);

/**
 * GUÍA DE USO:
 * 
 * BACKEND (Node.js):
 * - Ubicación: backend/src/controllers/ventas.controller.js (línea ~24)
 * - Variable: const AUTO_DELIVERY_TIME = 2 * 60 * 1000;
 * - Uso: checkAutoDeliveries() cambia "Enviado" → "Entregado" después de este tiempo
 * 
 * FRONTEND (React):
 * - Ubicación: frontend/src/features/tienda/Profile/hooks/useProfile.js
 * - Función: isReturnExpired(order)
 * - Uso: Deshabilita botones de "Solicitar devolución" después de este tiempo
 * 
 * ⚠️ CAMBIAR EN PRODUCCIÓN:
 * 1. Cambiar aquí a: 10 * 24 * 60 * 60 * 1000 (10 días)
 * 2. Cambiar en backend/src/controllers/ventas.controller.js línea ~24
 * 3. Ambos deben tener el mismo valor
 */

export default {
  DELIVERY_TO_RETURN_EXPIRY_TIME_MS,
  DELIVERY_TO_RETURN_EXPIRY_HOURS
};
