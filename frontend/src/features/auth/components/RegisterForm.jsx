/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import '../styles/AuthForms.css';

// Reglas de contraseña
const passwordRules = [
  { id: 'length',  label: 'Más de 6 caracteres',    test: (p) => (p || '').length > 6 },
  { id: 'letter',  label: 'Al menos una letra',      test: (p) => /[a-zA-Z]/.test(p || '') },
  { id: 'number',  label: 'Al menos un número',      test: (p) => /[0-9]/.test(p || '') },
  { id: 'special', label: 'Al menos un carácter especial (!@#$...)', test: (p) => /[^a-zA-Z0-9]/.test(p || '') },
];

const PasswordChecklist = ({ password, visible }) => {
  if (!visible && (!password || password.length === 0)) return null;
  const isAllOk = passwordRules.every(r => r.test(password));
  return (
    <div className="pw-checklist-balloon">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
        <span style={{ fontSize: '13px' }}>🔐</span>
        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#FFC107', letterSpacing: '0.3px' }}>
          Requisitos de seguridad
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {passwordRules.map(rule => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, color: ok ? '#22c55e' : '#94a3b8', transition: 'all 0.2s' }}>
              {ok ? <FaCheck style={{ fontSize: '9px', color: '#22c55e', flexShrink: 0 }} /> : <FaTimes style={{ fontSize: '9px', color: '#ef4444', flexShrink: 0 }} />}
              <span style={{ color: ok ? '#4ade80' : '#cbd5e1' }}>{rule.label}</span>
            </div>
          );
        })}
      </div>
      {isAllOk && (
        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '10.5px', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <FaCheck style={{ fontSize: '10px' }} /> ¡Contraseña segura!
        </div>
      )}
    </div>
  );
};

const RegisterForm = ({ 
  registerData, 
  setRegisterData, 
  handleRegister, 
  showRegPass, 
  setShowRegPass, 
  loading,
  fieldErrors = {} // Añadido para manejar errores específicos
}) => {
  const [isPassFocused, setIsPassFocused] = useState(false);

  const confirmMismatch = registerData.confirmPassword && registerData.password !== registerData.confirmPassword;
  const confirmMatch = registerData.confirmPassword && registerData.password && registerData.password === registerData.confirmPassword;

  return (
    <form onSubmit={handleRegister} className="form-logic-gate" style={{ position: 'relative' }}>
      <div className="form-inline-row">
        <div className="input-field-group width-30">
          <label>Tipo</label>
          <select 
            className={fieldErrors.documentType ? "has-error" : ""}
            value={registerData.documentType} 
            onChange={(e) => setRegisterData({...registerData, documentType: e.target.value})}
          >
            <option>C.C</option>
            <option>C.E</option>
            <option>PEP</option>
            <option>PPT</option>
            <option>Pasaporte</option>
          </select>
          {fieldErrors.documentType && <span className="field-error-text">{fieldErrors.documentType}</span>}
        </div>
        <div className="input-field-group width-70">
          <label>Número de documento</label>
          <input 
            className={fieldErrors.documentNumber ? "has-error" : ""}
            type="text" 
            placeholder="Ej: 12345..." 
            required 
            value={registerData.documentNumber} 
            onChange={(e) => setRegisterData({...registerData, documentNumber: e.target.value.replace(/[^0-9]/g, '')})} 
          />
          {fieldErrors.documentNumber && <span className="field-error-text">{fieldErrors.documentNumber}</span>}
        </div>
      </div>

      <div className="input-field-group">
        <label>Nombre completo</label>
        <input 
          className={fieldErrors.name ? "has-error" : ""}
          type="text" 
          placeholder="Ej: Juan Pérez" 
          required 
          value={registerData.name} 
          onChange={(e) => setRegisterData({...registerData, name: e.target.value})} 
        />
        {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
      </div>

      <div className="input-field-group">
        <label>Correo electrónico</label>
        <input 
          className={fieldErrors.email ? "has-error" : ""}
          type="email" 
          placeholder="nombre@correo.com" 
          required 
          value={registerData.email} 
          onChange={(e) => setRegisterData({...registerData, email: e.target.value})} 
        />
        {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
      </div>

      <div className="form-inline-row" style={{ position: 'relative' }}>
        {/* 🎈 Globito de requisitos de contraseña afuera */}
        <PasswordChecklist password={registerData.password} visible={isPassFocused} />

        <div className="input-field-group" style={{ flex: 1 }}>
          <label>Contraseña</label>
          <div className="input-decorated">
            <input 
              className={fieldErrors.password ? "has-error" : ""}
              type={showRegPass ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              value={registerData.password} 
              onFocus={() => setIsPassFocused(true)}
              onBlur={() => setIsPassFocused(false)}
              onChange={(e) => setRegisterData({...registerData, password: e.target.value})} 
            />
            <button type="button" className="eye-action-btn" onClick={() => setShowRegPass(!showRegPass)}>
              {showRegPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
        </div>
        
        <div className="input-field-group" style={{ flex: 1 }}>
          <label>Confirmar</label>
          <input 
            className={confirmMismatch ? "has-error" : (confirmMatch ? "has-success" : (fieldErrors.confirmPassword ? "has-error" : ""))}
            style={confirmMatch ? { borderColor: '#22c55e' } : (confirmMismatch ? { borderColor: '#ef4444' } : {})}
            type="password" 
            placeholder="••••••••" 
            required 
            value={registerData.confirmPassword} 
            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})} 
          />
          {/* 🎯 Validación en tiempo real cuando la va poniendo */}
          {confirmMismatch && (
            <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              ⚠️ Las contraseñas no coinciden
            </span>
          )}
          {confirmMatch && (
            <span style={{ color: '#22c55e', fontSize: '10px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              ✓ Las contraseñas coinciden
            </span>
          )}
          {!registerData.confirmPassword && fieldErrors.confirmPassword && (
            <span className="field-error-text">{fieldErrors.confirmPassword}</span>
          )}
        </div>
      </div>

      <button type="submit" className="button-main-auth" disabled={loading}>
        {loading ? "Procesando..." : "Registrar"}
      </button>
    </form>
  );
};

export default RegisterForm;
