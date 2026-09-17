/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';
import { changePassword } from '../services/authApi';
import { useAuth } from '../../shared/contexts/AuthContext';
import { FaLock, FaEye, FaEyeSlash, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../styles/ChangePasswordModal.css';


const ChangePasswordModal = () => {
    const { user, updateUser, logout } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleFinalize = () => {
        updateUser({ mustChangePassword: false });
        window.location.reload();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 6) {
            return Swal.fire({
                title: 'Contraseña muy corta',
                text: 'La contraseña debe tener al menos 6 caracteres por seguridad.',
                icon: 'warning',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#F5C81B',
                confirmButtonText: 'Entendido'
            });
        }

        if (password !== confirmPassword) {
            return Swal.fire({
                title: 'No coinciden',
                text: 'La contraseña y la confirmación no son iguales.',
                icon: 'error',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#F5C81B'
            });
        }

        setLoading(true);
        try {
            const response = await changePassword({ claveNueva: password });
            const result = response.data || response;

            if (result.success) {
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Error cambiando clave:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'No se pudo actualizar la contraseña. Reintenta más tarde.',
                icon: 'error',
                background: '#0f172a',
                color: '#fff',
                confirmButtonColor: '#F5C81B'
            });
        } finally {
            setLoading(false);
        }
    };

    // Si el usuario no tiene marcado el cambio obligatorio, no mostramos nada
    if (!user?.mustChangePassword) return null;

    return (
        <div className="cp-overlay">
            <div className="cp-modal">
                <div className="cp-header">
                    <div className="cp-icon-circle">
                        <FaShieldAlt size={30} color="#F5C81B" />
                    </div>
                    <h2>Seguridad Obligatoria</h2>
                    <p>
                        Hola <strong>{user.nombre || 'Usuario'}</strong>, por seguridad de la empresa, 
                        debes cambiar la contraseña temporal asignada por el administrador antes de continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="cp-form">
                    <div className="cp-field">
                        <label>Nueva Contraseña</label>
                        <div className="cp-input-wrapper">
                            <FaLock className="cp-input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Escribe tu nueva clave"
                                required
                                disabled={loading}
                                autoFocus
                            />
                            <button 
                                type="button" 
                                className="cp-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="cp-field">
                        <label>Confirmar Nueva Contraseña</label>
                        <div className="cp-input-wrapper">
                            <FaLock className="cp-input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la clave elegida"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="cp-info-box">
                        <ul>
                            <li>Mínimo 6 caracteres.</li>
                            <li>Usa una combinación de letras y números para mayor seguridad.</li>
                        </ul>
                    </div>

                    <div className="cp-actions">
                        <button 
                            type="button" 
                            className="cp-btn-logout" 
                            onClick={() => logout('Cambio de clave pendiente')}
                            disabled={loading}
                        >
                            <FaSignOutAlt />
                            <span>Salir</span>
                        </button>
                        <button 
                            type="submit" 
                            className="cp-btn-submit" 
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar y Entrar al Panel'}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL DE ÉXITO: ESTILO PERSONALIZADO */}
            {showSuccessModal && (
                <div className="cp-success-backdrop">
                    <div className="cp-success-container">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <div className="success-icon-circle" style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                border: '3px solid #10B981', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)'
                            }}>
                                <svg viewBox="0 0 24 24" width="48" height="48" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        </div>
                        <h3 className="cp-success-title">¡Clave Actualizada!</h3>
                        <div className="cp-success-message-container">
                            <p className="cp-success-message">
                                Tu contraseña ha sido cambiada con éxito. Ya puedes usar el sistema.
                            </p>
                        </div>
                        <button 
                            className="cp-success-btn" 
                            onClick={handleFinalize}
                        >
                            ENTRAR AHORA
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangePasswordModal;
