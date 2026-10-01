/* === PÁGINA PRINCIPAL === 
   Este componente es la interfaz visual principal de la ruta. 
   Se encarga de dibujar el HTML/JSX e invoca el Hook para obtener todas las funciones y estados necesarios. */

// src/features/auth/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle, FaCheck, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import api from "../../shared/services/api";
import { auth, confirmPasswordReset, verifyPasswordResetCode } from "../../shared/services/firebase";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode"); 
  const backendToken = searchParams.get("token"); 

  // Estados
  const [clave, setClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isClaveFocused, setIsClaveFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirigir si no hay código de recuperación
  useEffect(() => {
    if (!oobCode && !backendToken) {
      Swal.fire("Error", "El enlace de recuperación es inválido o ha expirado.", "error");
      navigate("/login");
    }
  }, [oobCode, backendToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (clave.length <= 6 || !/[a-zA-Z]/.test(clave) || !/[0-9]/.test(clave) || !/[^a-zA-Z0-9]/.test(clave)) {
      setError("La contraseña no cumple con los requisitos de seguridad.");
      return;
    }

    if (clave !== confirmarClave) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (backendToken) {
        const response = await api.post("/api/auth/reset-password", {
          token: backendToken,
          clave: clave
        });

        if (response.data.success) {
          setIsSuccess(true);
          Swal.fire({
            icon: 'success',
            title: '¡Contraseña actualizada!',
            text: 'Tu clave ha sido actualizada con éxito. Ya puedes iniciar sesión.',
            confirmButtonColor: '#FFC107',
            background: "#111418",
            color: "#fff"
          }).then(() => {
            navigate("/login");
          });
        }
      } else if (oobCode) {
        const email = await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, clave);
        await api.post("/api/auth/sync-password", { email, password: clave });

        setIsSuccess(true);
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña actualizada!',
          text: 'Se ha actualizado tu clave. Ya puedes iniciar sesión.',
          confirmButtonColor: '#FFC107',
          background: "#111418",
          color: "#fff"
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (err) {
      console.error("Error en reset:", err);
      const serverMsg = err.response?.data?.message || err.message;
      if (serverMsg && (serverMsg.includes("diferente") || serverMsg.includes("actual"))) {
        setError("La contraseña debe ser diferente a la actual.");
      } else {
        setError(serverMsg || "El enlace ha expirado o es inválido. Solicita uno nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎨 Estilos unificados con Login.jsx
  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      width: "100%",
      backgroundImage: `url('https://res.cloudinary.com/dxc5qqsjd/image/upload/v1774320932/WhatsApp_Image_2026-03-23_at_9.54.36_PM_pxd6fe.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      fontFamily: "'Inter', sans-serif",
      color: "#fff",
      overflow: "hidden",
      position: "relative"
    },
    overlay: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.2))",
      zIndex: 1
    },
    heroSection: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      zIndex: 2,
      padding: "40px",
      animation: "fadeIn 1s ease"
    },
    logoImg: {
      width: "240px",
      height: "auto",
      marginBottom: "15px",
      filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.6))"
    },
    bannerTitle: {
      fontSize: "26px",
      fontWeight: "800",
      color: "#FFC107",
      letterSpacing: "1px",
      margin: "0",
      textShadow: "0 2px 10px rgba(0,0,0,0.8)"
    },
    bannerSubtitle: {
      fontSize: "17px",
      color: "#fff",
      maxWidth: "360px",
      marginTop: "15px",
      lineHeight: "1.4",
      textShadow: "0 2px 8px rgba(0,0,0,0.8)"
    },
    formWrapper: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      paddingRight: "40px",
      position: "relative"
    },
    backLink: {
      position: "absolute",
      top: "30px",
      left: "40px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#FFC107",
      textDecoration: "none",
      fontSize: "15px",
      opacity: 0.9,
      transition: "0.2s",
      zIndex: 10
    },
    formCard: {
      width: "100%",
      maxWidth: "400px",
      backgroundColor: "rgba(15,17,21,0.96)",
      padding: "25px 35px",
      borderRadius: "14px",
      border: "1px solid rgba(255,193,7,0.15)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      animation: "slideInRight 0.8s ease"
    },
    formTitle: { fontSize: "28px", fontWeight: "800", marginBottom: "5px" },
    formSubtitle: { fontSize: "14px", color: "#888", marginBottom: "25px" },
    label: {
      display: "block",
      fontSize: "12px",
      color: "#aaa",
      marginBottom: "7px",
      letterSpacing: "0.5px",
      textAlign: "left"
    },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: "8px",
      backgroundColor: "#171a21",
      border: "1px solid rgba(255,193,7,0.15)",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      marginBottom: "12px",
      boxSizing: "border-box"
    },
    inputWrap: { position: "relative", width: "100%" },
    eyeBtn: {
      position: "absolute",
      right: "14px",
      top: "22px",
      transform: "translateY(-50%)",
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "#666"
    },
    mainBtn: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: "#FFC107",
      color: "#000",
      border: "none",
      fontSize: "14px",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "10px",
      transition: "0.3s"
    },
    error: {
      color: "#ff6b6b",
      fontSize: "12px",
      marginBottom: "15px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.container} className="login-container-root">
      <div style={styles.overlay} />
      
      <Link to="/" style={styles.backLink} className="back-link">
        <FaArrowLeft size={15} color="#FFC107" /> Volver a la tienda
      </Link>
 
      <div style={styles.heroSection} className="login-hero-section">
        <img src="/logo.png" alt="GM Caps" style={styles.logoImg} />
        <h1 style={styles.bannerTitle}>Gorras Medellín Caps</h1>
        <p style={styles.bannerSubtitle}>
          Recupera el acceso a tu cuenta para seguir disfrutando de lo mejor en estilo.
        </p>
      </div>
      
      <div style={styles.formWrapper} className="login-form-wrapper">
        <div style={styles.formCard} className="login-form-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "15px" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "rgba(255,193,7,0.1)",
                border: "1px solid rgba(255,193,7,0.25)",
                color: "#FFC107",
                cursor: "pointer",
                display: "flex",
                padding: "8px",
                borderRadius: "50%"
              }}
              aria-label="Volver"
            >
              <FaArrowLeft size={16} />
            </button>
            <h2 style={{ ...styles.formTitle, marginBottom: 0, fontSize: "24px" }}>Nueva Clave</h2>
          </div>
          
          {!isSuccess ? (
            <>
              <p style={styles.formSubtitle}>Ingresa tu nueva contraseña para actualizar tu acceso</p>
 
              <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                {/* 🎈 GLOBITO DE VALIDACIÓN AFUERA DEL CUADRO GENERAL */}
                {(isClaveFocused || clave.length > 0) && (
                  <div className="password-globito-balloon">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '13px' }}>🔐</span>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#FFC107', letterSpacing: '0.3px' }}>
                        Requisitos de seguridad
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {[
                        { label: 'Más de 6 caracteres', ok: clave.length > 6 },
                        { label: 'Al menos una letra', ok: /[a-zA-Z]/.test(clave) },
                        { label: 'Al menos un número', ok: /[0-9]/.test(clave) },
                        { label: 'Al menos un carácter especial (!@#$...)', ok: /[^a-zA-Z0-9]/.test(clave) },
                      ].map((rule, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, color: rule.ok ? '#22c55e' : '#94a3b8', transition: 'all 0.2s' }}>
                          {rule.ok
                            ? <FaCheck style={{ fontSize: '9px', color: '#22c55e', flexShrink: 0 }} />
                            : <FaTimes style={{ fontSize: '9px', color: '#ef4444', flexShrink: 0 }} />}
                          <span style={{ color: rule.ok ? '#4ade80' : '#cbd5e1' }}>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                    {clave.length > 6 && /[a-zA-Z]/.test(clave) && /[0-9]/.test(clave) && /[^a-zA-Z0-9]/.test(clave) && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '10.5px', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <FaCheck style={{ fontSize: '10px' }} /> ¡Contraseña segura!
                      </div>
                    )}
                  </div>
                )}

                <label style={styles.label}>Contraseña Nueva</label>
                <div style={styles.inputWrap}>
                  <input
                    style={styles.input}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={clave}
                    onFocus={() => setIsClaveFocused(true)}
                    onBlur={() => setIsClaveFocused(false)}
                    onChange={(e) => setClave(e.target.value)}
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
 
                <label style={styles.label}>Confirmar Contraseña</label>
                <div style={styles.inputWrap}>
                  <input
                    style={{
                      ...styles.input,
                      borderColor: confirmarClave 
                        ? (confirmarClave === clave ? '#22c55e' : '#ef4444')
                        : styles.input.border.split(' ')[2]
                    }}
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmarClave}
                    onChange={(e) => setConfirmarClave(e.target.value)}
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>

                  {/* 🎯 Validación en tiempo real cuando la va poniendo */}
                  {confirmarClave && confirmarClave !== clave && (
                    <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', animation: 'fadeIn 0.2s' }}>
                      ⚠️ Las contraseñas no coinciden
                    </span>
                  )}
                  {confirmarClave && clave && confirmarClave === clave && (
                    <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', animation: 'fadeIn 0.2s' }}>
                      ✓ Las contraseñas coinciden
                    </span>
                  )}
                </div>
 
                {error && <div style={styles.error}>{error}</div>}
 
                <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>
                  {isSubmitting ? "Cambiando..." : "Actualizar Contraseña"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <FaCheckCircle size={60} color="#FFC107" style={{ marginBottom: "20px" }} />
              <h2 style={{ fontSize: "24px", fontWeight: "800" }}>¡Todo listo!</h2>
              <p style={{ color: "#888", marginTop: "10px" }}>Tu contraseña ha sido actualizada correctamente.</p>
              <button onClick={() => navigate("/login")} style={styles.mainBtn}>
                Ir al Login
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        .login-container-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .login-hero-section { flex: 0 0 45%; }
        .login-form-wrapper { flex: 0 0 55%; }
        .login-form-card { width: 100%; max-width: 400px; position: relative; }

        .password-globito-balloon {
          position: absolute;
          right: calc(100% + 20px);
          top: 30%;
          transform: translateY(-50%);
          width: 250px;
          background: #0f172a;
          border: 1px solid rgba(245, 200, 27, 0.45);
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 200, 27, 0.15);
          z-index: 100;
          backdrop-filter: blur(8px);
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .password-globito-balloon::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -8px;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-style: solid;
          border-color: transparent transparent transparent #0f172a;
        }

        .password-globito-balloon::before {
          content: '';
          position: absolute;
          top: 50%;
          right: -10px;
          transform: translateY(-50%);
          border-width: 9px 0 9px 9px;
          border-style: solid;
          border-color: transparent transparent transparent rgba(245, 200, 27, 0.5);
        }

        @media (max-width: 900px) {
          .login-container-root { flex-direction: column !important; overflow-y: auto !important; }
          .login-hero-section { flex: 0 0 auto !important; padding: 60px 20px 30px 20px !important; }
          .login-form-wrapper { flex: 0 0 auto !important; padding-right: 0 !important; padding-bottom: 50px !important; }
          .login-form-card { max-width: 90% !important; padding: 20px 25px !important; }
          .back-link { left: 20px !important; top: 20px !important; }

          .password-globito-balloon {
            position: static !important;
            width: 100% !important;
            margin-top: 10px !important;
            margin-bottom: 12px !important;
            transform: none !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
          }
          .password-globito-balloon::after,
          .password-globito-balloon::before {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
