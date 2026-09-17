/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import '../styles/RecoveryForms.css';

export const RecoverPasswordForm = ({ 
  recoverTo, 
  setRecoverTo, 
  handleRecover, 
  onBack, 
  loading 
}) => (
  <div className="fade-form">
    <button className="button-back-gate" onClick={onBack}><FaArrowLeft /></button>
    <div className="view-header-text">
      <h2 className="view-header-title">Recuperar Contraseña</h2>
      <p className="view-header-subtitle">Ingresa tu correo electrónico y te enviaremos un código de verificación</p>
    </div>
    <form onSubmit={handleRecover}>
      <div className="input-field-group">
        <label>Correo de recuperación</label>
        <input type="text" inputMode="email" placeholder="tu@email.com" required value={recoverTo} onChange={(e) => setRecoverTo(e.target.value)} />
      </div>
      <button type="submit" className="button-main-auth" disabled={loading}>Enviar Código</button>
    </form>
  </div>
);

export const VerifyCodeForm = ({ 
  typedCode, 
  setTypedCode, 
  handleVerify, 
  onBack, 
  loading 
}) => (
  <div className="fade-form">
    <button className="button-back-gate" onClick={onBack}><FaArrowLeft /></button>
    <div className="view-header-text">
      <h2 className="view-header-title">Verificar Código</h2>
      <p className="view-header-subtitle">Ingresa el código de 6 dígitos enviado a tu email</p>
    </div>
    <form onSubmit={handleVerify}>
      <div className="input-code-row">
        {typedCode.map((digit, idx) => (
          <input 
            key={idx} id={`d-${idx}`} type="text" maxLength={1} value={digit}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              const n = [...typedCode]; n[idx] = v; setTypedCode(n);
              if(v && idx < 5) document.getElementById(`d-${idx+1}`).focus();
            }}
            onKeyDown={(e) => {
              if(e.key === "Backspace" && !typedCode[idx] && idx > 0) document.getElementById(`d-${idx-1}`).focus();
            }}
            className="input-code-digit"
          />
        ))}
      </div>
      <button type="submit" className="button-main-auth" disabled={loading}>Validar Código</button>
    </form>
  </div>
);

export const ResetPasswordForm = ({ 
  newPassData, 
  setNewPassData, 
  handleReset, 
  showNewPass, 
  setShowNewPass, 
  showNewPass2, 
  setShowNewPass2, 
  loading 
}) => (
  <div className="fade-form">
    <div className="view-header-text">
      <h2 className="view-header-title">Nueva Contraseña</h2>
      <p className="view-header-subtitle">Crea una clave segura para tu cuenta</p>
    </div>
    <form onSubmit={handleReset}>
      <div className="input-field-group">
        <label>Nueva Contraseña</label>
        <div className="input-decorated">
          <input 
            type={showNewPass ? "text" : "password"} 
            placeholder="••••••••" 
            required 
            value={newPassData.pass} 
            onChange={(e) => setNewPassData({...newPassData, pass: e.target.value})} 
          />
          <button type="button" className="eye-action-btn" onClick={() => setShowNewPass(!showNewPass)}>
            {showNewPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
      <div className="input-field-group">
        <label>Confirmar Nueva Contraseña</label>
        <div className="input-decorated">
          <input 
            type={showNewPass2 ? "text" : "password"} 
            placeholder="••••••••" 
            required 
            value={newPassData.pass2} 
            onChange={(e) => setNewPassData({...newPassData, pass2: e.target.value})} 
          />
          <button type="button" className="eye-action-btn" onClick={() => setShowNewPass2(!showNewPass2)}>
            {showNewPass2 ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
      <button type="submit" className="button-main-auth" disabled={loading}>Refrescar Contraseña</button>
    </form>
  </div>
);
