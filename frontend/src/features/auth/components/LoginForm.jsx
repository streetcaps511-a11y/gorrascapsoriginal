/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/AuthForms.css';

const LoginForm = ({ 
  loginData, 
  setLoginData, 
  handleLogin, 
  showPass, 
  setShowPass, 
  loading, 
  onRecoverClick 
}) => {
  return (
    <form onSubmit={handleLogin} className="form-logic-gate">
      <div className="input-field-group">
        <label>Email Corporativo / Personal</label>
        <div className="input-decorated">
          <FaEnvelope className="deco-icon" />
          <input 
            type="text" 
            inputMode="email" 
            placeholder="ejemplo@correo.com" 
            required 
            value={loginData.email} 
            onChange={(e) => setLoginData({...loginData, email: e.target.value})} 
          />
        </div>
      </div>
      <div className="input-field-group">
        <label>Contraseña Maestra</label>
        <div className="input-decorated">
          <FaLock className="deco-icon" />
          <input 
            type={showPass ? "text" : "password"} 
            placeholder="••••••••" 
            required 
            value={loginData.password} 
            onChange={(e) => setLoginData({...loginData, password: e.target.value})} 
          />
          <button type="button" className="eye-action-btn" onClick={() => setShowPass(!showPass)}>
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
      <button type="submit" className="button-main-auth" disabled={loading}>
        {loading ? "Verificando..." : "Ingresar"}
      </button>
      <button type="button" className="button-link-auth" onClick={onRecoverClick}>
        ¿Necesitas recuperar tu acceso?
      </button>
    </form>
  );
};

export default LoginForm;
