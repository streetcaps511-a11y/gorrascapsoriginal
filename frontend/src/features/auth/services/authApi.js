/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

import api from "../../shared/services/api";

export const loginUser = (credentials) =>
  api.post("/api/auth/login", credentials);

export const registerUser = (userData) =>
  api.post("/api/auth/register", userData);

export const logoutUser = () =>
  api.post("/api/auth/logout");

// Endpoints de recuperación (mockeables)
export const sendRecoveryEmail = (email) =>
  api.post("/api/auth/recover-email", { email });

export const verifyRecoveryCode = (email, code) =>
  api.post("/api/auth/verify-code", { email, code });

export const resetPassword = (formData) =>
  api.post("/api/auth/reset-password", formData);

export const changePassword = (passwordData) =>
  api.put("/api/auth/change-password", passwordData);

export const verifyUserToken = () =>
  api.get("/api/auth/verify");
