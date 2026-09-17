/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

// src/modules/auth/hooks/useAuth.js
// ── Hook de autenticación ──
import { useState, useCallback } from "react";
import { loginUser, logoutUser } from "shared/services/authApi";
import { NitroCache } from "shared/utils/NitroCache";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginUser(credentials);
      sessionStorage.setItem("user", JSON.stringify(data));
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Error al iniciar sesión";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // 📡 Notificar al backend para limpiar la sesión en el servidor
      await logoutUser();
    } catch (err) {
      console.warn("Error al cerrar sesión en el servidor:", err);
    } finally {
      // 🧹 Limpiar localmente sin importar si el servidor falló
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.clear(); // Limpieza total de seguridad
      NitroCache.clear(); 
      window.location.href = "/login";
    }
  }, []);

  return { login, logout, loading, error };
};

export default useAuth;
