// src/features/auth/pages/Login.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheck, FaTimes, FaPhone } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "../../shared/contexts";
import SessionConflictModal from "../../shared/components/SessionConflictModal";
import api, { API_BASE_URL } from "../../shared/services/api";
import { auth, createUserWithEmailAndPassword, confirmPasswordReset, verifyPasswordResetCode } from "../../shared/services/firebase";

// ═══════════════════════════════════════════════════════════
// 🎨 ESTILOS (Memoized)
// ═══════════════════════════════════════════════════════════
const useAuthStyles = () => useMemo(() => ({
  container: {
    display: "flex", height: "100vh", width: "100%",
    backgroundImage: `url('https://res.cloudinary.com/dxc5qqsjd/image/upload/v1774320932/WhatsApp_Image_2026-03-23_at_9.54.36_PM_pxd6fe.jpg')`,
    backgroundSize: "cover", backgroundPosition: "center",
    fontFamily: "'Inter', sans-serif", color: "#fff",
    overflow: "hidden", position: "relative", gap: "32px"
  },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.2))", zIndex: 1 },
  heroSection: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", zIndex: 2, padding: "40px", animation: "fadeIn 1s ease" },
  logoImg: { width: "240px", height: "auto", marginBottom: "15px", filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.6))" },
  bannerTitle: { fontSize: "26px", fontWeight: "800", color: "#FFC107", letterSpacing: "1px", margin: "0", textShadow: "0 2px 10px rgba(0,0,0,0.8)" },
  bannerSubtitle: { fontSize: "17px", color: "#fff", maxWidth: "360px", marginTop: "15px", lineHeight: "1.4", textShadow: "0 2px 8px rgba(0,0,0,0.8)" },
  formWrapper: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 2, paddingRight: "40px", paddingTop: "20px", paddingBottom: "30px", position: "relative" },
  backLink: { position: "absolute", top: "30px", left: "40px", display: "flex", alignItems: "center", gap: "8px", color: "#FFC107", textDecoration: "none", fontSize: "15px", opacity: 0.9, transition: "0.2s", zIndex: 10 },
  formCard: { width: "100%", maxWidth: "400px", backgroundColor: "rgba(15,17,21,0.96)", padding: "22px 28px", borderRadius: "14px", border: "1px solid rgba(255,193,7,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.8)", animation: "slideInRight 0.8s ease" },
  tabWrapper: { display: "flex", backgroundColor: "#1e222a", padding: "4px", borderRadius: "14px", marginBottom: "15px", gap: "4px" },
  tabBtn: (active) => ({ flex: 1, padding: "8px", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "0.3s", backgroundColor: active ? "#FFC107" : "transparent", color: active ? "#000" : "#fff" }),
  formTitle: { fontSize: "28px", fontWeight: "800", marginBottom: "5px" },
  formSubtitle: { fontSize: "14px", color: "#888", marginBottom: "15px" },
  label: { display: "block", fontSize: "12px", color: "#aaa", marginBottom: "4px", letterSpacing: "0.5px" },
  input: { width: "100%", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#171a21", border: "1px solid rgba(255,193,7,0.15)", color: "#fff", fontSize: "14px", outline: "none", marginBottom: "4px", boxSizing: "border-box", transition: "border-color 0.2s" },
  select: {
    width: "100%", padding: "8px 30px 8px 12px", borderRadius: "8px",
    backgroundColor: "#171a21", border: "1px solid rgba(255,193,7,0.15)",
    color: "#fff", fontSize: "14px", outline: "none", marginBottom: "4px",
    boxSizing: "border-box", transition: "border-color 0.2s",
    appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFC107'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "13px 13px",
    cursor: "pointer"
  },
  fieldError: { color: "#ff4d4d", fontSize: "12px", fontWeight: "600", marginTop: "4px", display: "block", textAlign: "left", animation: "fadeIn 0.3s ease" },
  inputWrap: { position: "relative", width: "100%", marginBottom: "10px" },
  eyeBtn: { position: "absolute", right: "14px", top: "44%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#666" },
  mainBtn: { width: "100%", padding: "11px", borderRadius: "8px", backgroundColor: "#FFC107", color: "#000", border: "none", fontSize: "14px", fontWeight: "800", cursor: "pointer", marginTop: "8px", transition: "0.3s" },
  error: { color: "#ff6b6b", fontSize: "12px", marginBottom: "15px", marginTop: "5px", textAlign: "center" },
  info: { color: "#FFC107", fontSize: "12px", marginBottom: "15px", marginTop: "5px", textAlign: "center" }
}), []);

// ═══════════════════════════════════════════════════════════
// 🧩 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const styles = useAuthStyles();

  // ── Estados de UI ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState("login");
  const [view, setView] = useState("auth");
  const [oobCode, setOobCode] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [infoMsg, setInfoMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [registerSuccessAlert, setRegisterSuccessAlert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ Modal confirmación

  // ─── Datos ─────────────────────────────────────────────
  const [loginData, setLoginData] = useState({ correo: "", clave: "" });
  const [registerData, setRegisterData] = useState({
    documentType: "Cédula de Ciudadanía", documentNumber: "",
    fullName: "", phone: "", correo: "", clave: "", confirmarClave: ""
  });

  // ─── Visibilidad ──────────────────────────────────────
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [isClaveFocused, setIsClaveFocused] = useState(false);

  // ─── PIN y Recuperación ────────────────────────────────
  const [pinVerification, setPinVerification] = useState(false);
  const [userPin, setUserPin] = useState("");
  const [recoverEmail, setRecoverEmail] = useState("");

  // ── Refs ──────────────────────────────────────────────
  const loginEmailRef = useRef(null);
  const loginPassRef = useRef(null);

  // ═══════════════════════════════════════════════════════
  // 🔧 HELPERS
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("oobCode");
    if (code) { setOobCode(code); setView("reset"); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loginEmailRef.current) loginEmailRef.current.value = "";
      if (loginPassRef.current) loginPassRef.current.value = "";
      setLoginData({ correo: "", clave: "" });
      setRegisterData({ documentType: "Cédula de Ciudadanía", documentNumber: "", fullName: "", phone: "", correo: "", clave: "", confirmarClave: "" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const resetMessages = () => { setError(""); setFieldErrors({}); setInfoMsg(""); };

  const validateEmail = (email) => {
    if (!email.trim()) return "El correo electrónico es obligatorio";
    const atCount = (email.match(/@/g) || []).length;
    if (atCount === 0) return "El correo electrónico debe tener una arroba (@)";
    if (atCount > 1) return "El correo electrónico no puede tener más de una arroba (@)";
    if (email.includes('..')) return "El correo no puede tener dos puntos consecutivos (..)";
    if (email.toLowerCase().endsWith('.com.com')) return "El dominio del correo no es válido (.com.com)";
    const [local, domain] = email.split('@');
    if (!local || local.length === 0) return "Falta el nombre antes de la arroba";
    if (!domain || !domain.includes('.')) return "Falta el punto (.) en el dominio después del arroba (ej: .com)";
    const parts = domain.split('.');
    if (parts[parts.length - 1].length < 2) return "El dominio del correo no es válido";
    return "";
  };

  const validatePhone = (phone) => {
    const digits = (phone || '').replace(/\D/g, '');
    if (!digits) return "El teléfono es obligatorio";
    if (digits.length < 10) return "El teléfono debe tener al menos 10 dígitos";
    if (digits.length > 15) return "El teléfono no puede tener más de 15 dígitos";
    return "";
  };

  // ═══════════════════════════════════════════════════════
  // 📢 NOTIFICACIÓN CORREO EXISTENTE (Alerta directa al campo, sin modal gigante)
  // ═══════════════════════════════════════════════════════
  const showEmailExistsModal = ({ email, registeredAs, context = 'register' }) => {
    const label = registeredAs === 'proveedor' ? 'Proveedor' : registeredAs === 'cliente' ? 'Cliente' : 'otro usuario';
    setFieldErrors(prev => ({ ...prev, correo: `Este correo ya está registrado como ${label}` }));
    return Promise.resolve();
  };

  const handleLoginEmailBlur = async () => {
    const email = (loginEmailRef.current?.value || loginData.correo || "").trim().toLowerCase();
    if (!email || validateEmail(email)) return;

    try {
      const response = await api.get("/api/auth/check-exists", { params: { email } });
      if (response.data.success && response.data.emailExists) {
        const regAs = response.data.registeredAs;
        if (regAs === 'proveedor') {
          setFieldErrors(prev => ({ ...prev, correo: "Este correo ya está registrado como Proveedor" }));
        } else if (regAs === 'cliente') {
          setFieldErrors(prev => ({ ...prev, correo: "Registrado como Cliente (sin clave). Ve a Registro." }));
        }
      }
    } catch (err) {
      console.warn("Error en blur de correo login:", err);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🔐 LOGIN
  // ═══════════════════════════════════════════════════════
  const handleLogin = async (e, isForced = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting && !isForced) return;
    resetMessages();
    setIsSubmitting(true);

    const currentCorreo = loginEmailRef.current?.value || loginData.correo || "";
    const currentClave = loginPassRef.current?.value || loginData.clave || "";
    const useForce = isForced || loginData.force || false;

    if (!currentCorreo.trim() || !currentClave.trim()) {
      const fe = {};
      if (!currentCorreo.trim()) fe.correo = "Ingresa tu correo";
      if (!currentClave.trim()) fe.clave = "Ingresa tu contraseña";
      setFieldErrors(fe);
      setIsSubmitting(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await api.post("/api/auth/login", {
        correo: currentCorreo.trim().toLowerCase(),
        clave: currentClave.trim(),
        force: useForce
      }, { signal: controller.signal });
      clearTimeout(timeoutId);
      const result = response.data;

      if (result.success === true && result.data?.usuario) {
        const token = result.data.token || result.data.Token;
        const { usuario } = result.data;
        const userData = {
          id: usuario.id, IdUsuario: usuario.id, IdCliente: usuario.IdCliente,
          nombre: usuario.nombre, Correo: usuario.email,
          IdRol: usuario.idRol, Rol: usuario.rol || usuario.rolData?.nombre || 'Cliente',
          rol: usuario.rol || usuario.rolData?.nombre || 'Cliente',
          Estado: usuario.estado, avatarUrl: usuario.avatarUrl,
          sessionId: usuario.sessionId, permisos: usuario.permisos || [],
          mustChangePassword: usuario.mustChangePassword === true || usuario.MustChangePassword === true,
          token: token,
          userType: (usuario.rolData?.nombre === "Administrador" || usuario.idRol === 1 || (usuario.rolData?.nombre?.toLowerCase() !== "cliente" && usuario.rolData?.nombre !== undefined)) ? "admin" : "cliente"
        };
        login(userData);
        const from = location.state?.from?.pathname;
        const isAdminLogin = userData.userType === "admin";
        const target = isAdminLogin ? (from?.startsWith("/admin") ? from : "/admin") : (from && !from.startsWith("/admin") ? from : "/");
        navigate(target, { replace: true });
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.response?.status === 409 && err.response.data?.needsForce) {
        setIsSubmitting(false);
        setShowConflictModal(true);
        return;
      }
      if (err.response?.status !== 401) console.error("🔴 Error de conexión: ", err);
      if (err.name === 'AbortError') {
        setError("La petición tardó demasiado. Verifica tu conexión.");
      } else if (err.response) {
        const msg = err.response?.data?.message || "";
        const regAs = err.response?.data?.registeredAs;
        const errField = err.response?.data?.field;

        if (errField === 'clave' || msg.toLowerCase().includes("contrase") || msg.toLowerCase().includes("clave") || msg.toLowerCase().includes("password")) {
          setFieldErrors({ clave: msg || "Contraseña incorrecta" });
        } else if (errField === 'correo' || regAs === 'proveedor' || regAs === 'cliente' || msg.toLowerCase().includes("correo") || msg.toLowerCase().includes("email")) {
          setFieldErrors({ correo: msg || "Este correo no está registrado" });
        } else {
          setError(msg || "Error al iniciar sesión. Intenta de nuevo.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 📝 REGISTRO (con teléfono obligatorio + confirmación)
  // ══════════════════════════════════════════════════════
  const handleRegisterBlur = async (field) => {
    const value = registerData[field];
    if (!value || !value.trim()) return;
    try {
      const params = {};
      if (field === "correo") params.email = value.trim().toLowerCase();
      if (field === "documentNumber") params.documento = value.trim();
      const response = await api.get("/api/auth/check-exists", { params });
      if (response.data.success) {
        if (field === "correo" && response.data.emailExists) {
          const regAs = response.data.registeredAs || 'usuario';
          const label = regAs === 'proveedor' ? 'Proveedor' : regAs === 'cliente' ? 'Cliente' : 'otro usuario';
          setFieldErrors(prev => ({ ...prev, correo: `El correo electrónico ya está registrado como ${label}` }));
        } else if (field === "documentNumber" && response.data.documentoExists) {
          setFieldErrors(prev => ({ ...prev, documentNumber: "El número de documento ya está registrado" }));
        }
      }
    } catch (err) {
      console.warn("Error checking existence on blur:", err);
    }
  };

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    resetMessages();

    // 1. Validar Documento
    if (!registerData.documentNumber.trim()) {
      setFieldErrors({ documentNumber: "El número de documento es obligatorio" });
      return;
    }
    const docType = registerData.documentType;
    const docNum = registerData.documentNumber.trim();
    const docRules = {
      "Cédula de Ciudadanía": [6, 10, "CC"],
      "Cédula de Extranjería": [6, 15, "CE"],
      "Permiso Especial (PEP)": [15, 15, "PEP"],
      "Permiso Temporal (PPT)": [15, 15, "PPT"],
      "Pasaporte": [6, 20, "Pasaporte"]
    };
    const [minLen, maxLen, label] = docRules[docType] || [6, 15, "documento"];
    if (docNum.length < minLen || docNum.length > maxLen) {
      setFieldErrors({ documentNumber: minLen === maxLen ? `El documento (${label}) debe tener exactamente ${minLen} dígitos.` : `El documento (${label}) debe tener entre ${minLen} y ${maxLen} dígitos.` });
      return;
    }

    // 2. Validar Nombre
    if (!registerData.fullName.trim()) {
      setFieldErrors({ fullName: "El nombre es obligatorio" });
      return;
    }

    // 3. ✅ Validar Teléfono OBLIGATORIO
    const phoneError = validatePhone(registerData.phone);
    if (phoneError) {
      setFieldErrors({ phone: phoneError });
      return;
    }

    // 4. Validar Correo
    const emailError = validateEmail(registerData.correo);
    if (emailError) {
      setFieldErrors({ correo: emailError });
      return;
    }

    // 5. Validar Contraseña
    if (!registerData.clave.trim()) { setFieldErrors({ clave: "La contraseña es obligatoria" }); return; }
    if (registerData.clave.length < 6) { setFieldErrors({ clave: "La contraseña debe tener al menos 6 caracteres" }); return; }
    if (registerData.clave !== registerData.confirmarClave) { setFieldErrors({ confirmarClave: "Las contraseñas no coinciden" }); return; }

    // 6. Verificar existencia en BD
    try {
      const checkResponse = await api.get("/api/auth/check-exists", {
        params: { email: registerData.correo.trim().toLowerCase(), documento: registerData.documentNumber.trim() }
      });
      if (checkResponse.data.success) {
        const newFe = {};
        if (checkResponse.data.emailExists) {
          const regAs = checkResponse.data.registeredAs || 'usuario';
          const label = regAs === 'proveedor' ? 'Proveedor' : regAs === 'cliente' ? 'Cliente' : 'otro usuario';
          newFe.correo = `El correo electrónico ya está registrado como ${label}`;
        }
        if (checkResponse.data.documentoExists) newFe.documentNumber = "El número de documento ya está registrado";
        if (Object.keys(newFe).length > 0) { setFieldErrors(newFe); return; }
      }
    } catch {
      setError("Error de conexión al verificar datos.");
      return;
    }

    // 7. ✅ MODAL DE CONFIRMACIÓN antes de enviar PIN
    setShowConfirmModal(true);
  };

  // ✅ Confirmar registro (después del modal)
  const handleConfirmRegister = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    resetMessages();

    const phone = registerData.phone.replace(/\D/g, '');
    const email = registerData.correo.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/enviar-pin-registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: email,
          telefono: phone, // ✅ Enviar teléfono
          nombre: registerData.fullName.trim()
        })
      });
      const result = await response.json();

      if (result.success === true) {
        // ✅ Manejar respuesta según por dónde se envió
        if (result.sentTo === 'sms') {
          setInfoMsg(`📱 ${result.message}`);
        } else {
          setInfoMsg("¡Te hemos enviado un código al correo!");
        }
        setPinVerification(true);
      } else if (result.code === 'PHONE_REQUIRED') {
        setFieldErrors({ phone: result.message });
      } else {
        const msg = result.message || "";
        const regAs = result.registeredAs;
        if (regAs) {
          const label = regAs === 'proveedor' ? 'Proveedor' : regAs === 'cliente' ? 'Cliente' : 'otro usuario';
          setFieldErrors({ correo: msg || `El correo ya está registrado como ${label}` });
        } else if (msg.toLowerCase().includes("correo") || msg.toLowerCase().includes("email") || result.sentTo === 'sms') {
          setInfoMsg(`⚠️ ${msg}`);
          setPinVerification(true);
        } else {
          setError(msg || "No se pudo enviar el código al correo");
        }
      }
    } catch {
      setError("Error de conexión al solicitar el PIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 📌 VERIFICAR PIN Y REGISTRAR
  // ═══════════════════════════════════════════════════════
  const handleVerifyPinAndRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;
    resetMessages();
    setIsSubmitting(true);

    if (!userPin.trim() || userPin.length !== 6) {
      setFieldErrors({ userPin: "El código debe tener 6 dígitos" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verificar-pin-registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: registerData.fullName.trim(),
          correo: registerData.correo.trim().toLowerCase(),
          clave: registerData.clave.trim(),
          telefono: registerData.phone.replace(/\D/g, ''), // ✅ Enviar teléfono
          esCliente: true,
          pin: userPin.trim(),
          datosCliente: {
            document_type: registerData.documentType,
            document_number: registerData.documentNumber
          }
        })
      });
      const result = await response.json();

      if (result.success === true) {
        try {
          await createUserWithEmailAndPassword(auth, registerData.correo.trim().toLowerCase(), registerData.clave.trim());
        } catch (firebaseErr) {
          console.warn("⚠️ No se pudo crear en Firebase:", firebaseErr.message);
        }
        setRegisterData({ documentType: "Cédula de Ciudadanía", documentNumber: "", fullName: "", phone: "", correo: "", clave: "", confirmarClave: "" });
        setPinVerification(false);
        setUserPin("");
        setActiveTab("login");
        setRegisterSuccessAlert(true);
        setTimeout(() => setRegisterSuccessAlert(false), 5000);
      } else {
        setError(result.message || "El código es incorrecto o ha expirado.");
      }
    } catch {
      setError("Error de conexión al verificar el PIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🔁 RECUPERAR CONTRASEÑA
  // ═══════════════════════════════════════════════════════
  const handleRecover = async () => {
    resetMessages();
    if (!recoverEmail?.trim()) { setFieldErrors({ recoverEmail: "Debes llenar este campo" }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoverEmail)) { setFieldErrors({ recoverEmail: "Correo no válido" }); return; }

    const result = await Swal.fire({
      title: '<div style="font-size:15px; margin-top: -10px; margin-bottom: 5px; color: #fff;">¿Confirmar correo?</div>',
      html: `<div style="font-size:13px; margin-bottom: 10px; color: #aaa;">¿Enviar a: <b>${recoverEmail}</b>?</div>`,
      position: 'top-end', width: '320px', showCancelButton: true,
      confirmButtonText: 'Sí, enviar', cancelButtonText: 'No',
      confirmButtonColor: '#FFC107', cancelButtonColor: '#444',
      background: "#111418", color: "#fff", padding: '0 10px 5px',
      customClass: { popup: 'gm-swal-popup', confirmButton: 'gm-swal-btn confirm', cancelButton: 'gm-swal-btn cancel' }
    });
    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/auth/forgot-password", { email: recoverEmail.trim().toLowerCase() });
      if (response.data.success) {
        Swal.fire({
          toast: true, position: 'top-end', width: '350px',
          title: '<span style="color: #FFC107; font-weight: 800;">¡Enviado!</span>',
          html: `<span style="color: #fff;">Revisa tu correo: <br/><b>${recoverEmail}</b></span>`,
          icon: 'success', iconColor: '#FFC107', background: "#111418",
          showConfirmButton: false, timer: 4000, timerProgressBar: true,
          showClass: { popup: 'animate__animated animate__fadeInRight animate__faster' },
          customClass: { popup: 'gm-swal-popup' }
        });
        setRecoverEmail("");
        setView("auth");
      }
    } catch (err) {
      console.error("🔴 Error en recuperación:", err.message);
      const msg = err.response?.data?.message || "No se pudo enviar el correo. Intenta más tarde.";
      setError(msg);
      Swal.fire({
        title: `<div style="font-size: 18px; font-weight: 800; color: #FFC107; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>⚠️</span> <span>Correo no registrado</span>
        </div>`,
        html: `<div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.6; margin-top: 10px;">
          ${msg}<br/><br/>¿Deseas crear una cuenta ahora con este correo?
        </div>`,
        icon: 'warning',
        iconColor: '#FFC107',
        showCancelButton: true,
        confirmButtonText: 'Ir a Registro',
        cancelButtonText: 'Entendido',
        confirmButtonColor: '#FFC107',
        cancelButtonColor: '#444',
        background: '#111418',
        color: '#fff',
        customClass: { popup: 'gm-swal-popup', confirmButton: 'gm-swal-btn confirm', cancelButton: 'gm-swal-btn cancel' }
      }).then((modalRes) => {
        if (modalRes.isConfirmed) {
          setView("auth");
          setActiveTab("register");
          setRegisterData(prev => ({ ...prev, correo: recoverEmail.trim().toLowerCase() }));
          resetMessages();
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  //  RESET CONTRASEÑA
  // ═══════════════════════════════════════════════════════
  const handleResetPassword = async () => {
    resetMessages();
    if (!registerData.clave.trim()) { setFieldErrors({ clave: "La contraseña es obligatoria" }); return; }
    if (registerData.clave.length < 6) { setFieldErrors({ clave: "La contraseña debe tener al menos 6 caracteres" }); return; }
    if (registerData.clave !== registerData.confirmarClave) { setFieldErrors({ confirmarClave: "Las contraseñas no coinciden" }); return; }

    setIsSubmitting(true);
    try {
      const email = await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, registerData.clave);
      await api.post("/api/auth/sync-password", { email, password: registerData.clave });
      Swal.fire({ icon: 'success', title: '¡Contraseña actualizada!', text: 'Ya puedes iniciar sesión con tu nueva clave.', background: "#111418", color: "#fff", confirmButtonColor: '#FFC107' });
      window.history.replaceState({}, document.title, "/login");
      setView("auth");
      setActiveTab("login");
    } catch (err) {
      console.error("Error en reset:", err);
      setError("El enlace ha expirado o es inválido. Pide uno nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // 🎨 RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div style={styles.container} className="login-container-root">
      <div style={styles.overlay} />
      <Link to="/" style={styles.backLink} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => e.currentTarget.style.opacity = "0.9"}>
        <FaArrowLeft size={15} color="#FFC107" /> Volver a la tienda
      </Link>

      <div style={styles.heroSection} className="login-hero-section">
        <img src="/logo.png" alt="GM Caps" style={styles.logoImg} />
        <h1 style={styles.bannerTitle}>Gorras Medellín Caps</h1>
        <p style={styles.bannerSubtitle}>Exclusividad y estilo en cada prenda. Únete a la comunidad de gorras más grande de la ciudad.</p>
      </div>

      <div style={styles.formWrapper} className="login-form-wrapper">
        <div style={styles.formCard} className="login-form-card">
          {view === "auth" && (
            <>
              <h2 style={styles.formTitle}>{activeTab === "login" ? "¡Hola de nuevo!" : "Crear cuenta"}</h2>
              <p style={styles.formSubtitle}>{activeTab === "login" ? "Ingresa para continuar comprando" : "Empieza tu colección de nivel ahora"}</p>
              <div style={styles.tabWrapper}>
                <button style={styles.tabBtn(activeTab === "login")} onClick={() => { setActiveTab("login"); resetMessages(); }}>Login</button>
                <button style={styles.tabBtn(activeTab === "register")} onClick={() => { setActiveTab("register"); resetMessages(); }}>Registro</button>
              </div>

              {activeTab === "login" ? (
                <form onSubmit={handleLogin} onChange={resetMessages} autoComplete="off">
                  <label style={styles.label}>Correo electrónico</label>
                  <div style={styles.inputWrap}>
                    <input ref={loginEmailRef} style={{ ...styles.input, borderColor: fieldErrors.correo ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type="email" name="correo_login_unique" autoComplete="off" placeholder="Ingresa tu correo..." value={loginData.correo} onBlur={handleLoginEmailBlur} onChange={(e) => setLoginData({ ...loginData, correo: e.target.value })} />
                    {fieldErrors.correo && <span style={styles.fieldError}>{fieldErrors.correo}</span>}
                  </div>
                  <label style={styles.label}>Contraseña</label>
                  <div style={styles.inputWrap}>
                    <input ref={loginPassRef} style={{ ...styles.input, paddingRight: '40px', borderColor: fieldErrors.clave ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type={showLoginPass ? "text" : "password"} name="clave_login_unique" autoComplete="new-password" placeholder="Escribe tu contraseña..." value={loginData.clave} onChange={(e) => setLoginData({ ...loginData, clave: e.target.value })} />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowLoginPass(!showLoginPass)}>{showLoginPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}</button>
                    {fieldErrors.clave && <span style={styles.fieldError}>{fieldErrors.clave}</span>}
                  </div>
                  {error && <div style={styles.error}>{error}</div>}
                  {infoMsg && <div style={styles.info}>{infoMsg}</div>}
                  <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>{isSubmitting ? "Cargando..." : "Iniciar Sesión"}</button>
                  <div style={{ textAlign: "center", marginTop: "15px" }}>
                    <button type="button" style={{ background: "none", border: "none", color: "#FFC107", fontSize: "14px", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }} onClick={() => { setView("recover"); resetMessages(); }}>¿Olvidaste tu contraseña?</button>
                  </div>
                </form>
              ) : pinVerification ? (
                <form onSubmit={handleVerifyPinAndRegister} onChange={resetMessages} style={{ animation: "fadeIn 0.5s ease" }}>
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h3 style={{ color: "#fff", marginBottom: "10px" }}>Ingresa el código</h3>
                    <p style={{ color: "#aaa", fontSize: "14px" }}>Te enviamos un PIN a <b>{registerData.correo}</b></p>
                  </div>
                  <div style={styles.inputWrap}>
                    <input style={{ ...styles.input, textAlign: "center", fontSize: "24px", letterSpacing: "8px", fontWeight: "bold" }} type="text" maxLength={6} placeholder="------" value={userPin} onChange={(e) => setUserPin(e.target.value.replace(/[^0-9]/g, ''))} />
                    {fieldErrors.userPin && <span style={styles.fieldError}>️ {fieldErrors.userPin}</span>}
                  </div>
                  {error && <div style={styles.error}>{error}</div>}
                  {infoMsg && <div style={styles.info}>{infoMsg}</div>}
                  <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>{isSubmitting ? "Verificando..." : "Verificar y Registrar"}</button>
                  <button type="button" onClick={() => { setPinVerification(false); resetMessages(); }} style={{ ...styles.mainBtn, backgroundColor: "transparent", color: "#FFC107", border: "1px solid #FFC107", marginTop: "10px" }}>Volver al registro</button>
                </form>
              ) : (
                <form onSubmit={handleRegister} onChange={resetMessages}>
                  <div className="login-input-row">
                    <div style={{ flex: 0.5, minWidth: 0 }}>
                      <label style={styles.label}>Tipo</label>
                      <div style={styles.inputWrap}>
                        <select style={styles.select} value={registerData.documentType} onChange={(e) => {
                          const nextType = e.target.value;
                          const maxLen = nextType === "Cédula de Ciudadanía" ? 10 : nextType === "Pasaporte" ? 20 : 15;
                          let nextNumber = registerData.documentNumber;
                          if (nextNumber.length > maxLen) nextNumber = nextNumber.slice(0, maxLen);
                          if (nextType !== "Pasaporte") nextNumber = nextNumber.replace(/[^0-9]/g, '');
                          setRegisterData({ ...registerData, documentType: nextType, documentNumber: nextNumber });
                        }}>
                          <option value="Cédula de Ciudadanía">CC</option>
                          <option value="Cédula de Extranjería">CE</option>
                          <option value="Permiso Especial (PEP)">PEP</option>
                          <option value="Permiso Temporal (PPT)">PPT</option>
                          <option value="Pasaporte">Pasaporte</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={styles.label}>Número de documento</label>
                      <div style={styles.inputWrap}>
                        <input style={{ ...styles.input, borderColor: fieldErrors.documentNumber ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type="text" autoComplete="off" placeholder="Ej: 1234567890" value={registerData.documentNumber} onBlur={() => handleRegisterBlur("documentNumber")} onChange={(e) => {
                          const val = e.target.value;
                          const docType = registerData.documentType;
                          const maxLen = docType === "Cédula de Ciudadanía" ? 10 : docType === "Pasaporte" ? 20 : 15;
                          if (val.length > maxLen) return;
                          const regex = docType === "Pasaporte" ? /^[A-Za-z0-9]+$/ : /^[0-9]+$/;
                          if (val === "" || regex.test(val)) setRegisterData({ ...registerData, documentNumber: val });
                        }} />
                        {fieldErrors.documentNumber && <span style={styles.fieldError}>⚠️ {fieldErrors.documentNumber}</span>}
                      </div>
                    </div>
                  </div>

                  <label style={styles.label}>Nombre completo</label>
                  <div style={styles.inputWrap}>
                    <input style={{ ...styles.input, borderColor: fieldErrors.fullName ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type="text" autoComplete="off" placeholder="Ej: Juan Pérez..." value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })} />
                    {fieldErrors.fullName && <span style={styles.fieldError}>⚠️ {fieldErrors.fullName}</span>}
                  </div>

                  {/* ✅ NUEVO: Campo de teléfono obligatorio */}
                  <label style={styles.label}>
                    <FaPhone size={10} color="#FFC107" style={{ marginRight: '4px' }} />
                    Número de teléfono <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <div style={styles.inputWrap}>
                    <input style={{ ...styles.input, borderColor: fieldErrors.phone ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type="tel" inputMode="numeric" autoComplete="off" placeholder="Ej: 3001234567" maxLength={15} value={registerData.phone} onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
                      setRegisterData({ ...registerData, phone: val });
                    }} />
                    {fieldErrors.phone && <span style={styles.fieldError}>⚠️ {fieldErrors.phone}</span>}
                    <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block' }}>Necesario para recibir notificaciones si el correo falla</span>
                  </div>

                  <label style={styles.label}>Correo electrónico</label>
                  <div style={styles.inputWrap}>
                    <input style={{ ...styles.input, borderColor: fieldErrors.correo ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type="text" inputMode="email" autoComplete="off" placeholder="nombre@correo.com" value={registerData.correo} onBlur={() => handleRegisterBlur("correo")} onChange={(e) => setRegisterData({ ...registerData, correo: e.target.value })} />
                    {fieldErrors.correo && <span style={styles.fieldError}>⚠️ {fieldErrors.correo}</span>}
                  </div>

                  {/* Contraseñas */}
                  <div style={{ marginBottom: '10px', position: 'relative' }}>
                    {(isClaveFocused || registerData.clave.length > 0) && (
                      <div className="password-globito-balloon">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                          <span style={{ fontSize: '13px' }}>🔐</span>
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#FFC107', letterSpacing: '0.3px' }}>Requisitos de seguridad</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {[
                            { label: 'Más de 6 caracteres', ok: registerData.clave.length > 6 },
                            { label: 'Al menos una letra', ok: /[a-zA-Z]/.test(registerData.clave) },
                            { label: 'Al menos un número', ok: /[0-9]/.test(registerData.clave) },
                            { label: 'Al menos un carácter especial (!@#$...)', ok: /[^a-zA-Z0-9]/.test(registerData.clave) },
                          ].map((rule, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 600, color: rule.ok ? '#22c55e' : '#94a3b8', transition: 'all 0.2s' }}>
                              {rule.ok ? <FaCheck style={{ fontSize: '9px', color: '#22c55e', flexShrink: 0 }} /> : <FaTimes style={{ fontSize: '9px', color: '#ef4444', flexShrink: 0 }} />}
                              <span style={{ color: rule.ok ? '#4ade80' : '#cbd5e1' }}>{rule.label}</span>
                            </div>
                          ))}
                        </div>
                        {registerData.clave.length > 6 && /[a-zA-Z]/.test(registerData.clave) && /[0-9]/.test(registerData.clave) && /[^a-zA-Z0-9]/.test(registerData.clave) && (
                          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '10.5px', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <FaCheck style={{ fontSize: '10px' }} /> ¡Contraseña segura!
                          </div>
                        )}
                      </div>
                    )}
                    <div className="login-input-row">
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Contraseña</label>
                        <div style={styles.inputWrap}>
                          <input style={{ ...styles.input, paddingRight: '40px', borderColor: fieldErrors.clave ? '#ff4d4d' : styles.input.border.split(' ')[2], marginBottom: 0 }} type={showRegPass ? "text" : "password"} autoComplete="new-password" placeholder="Crea una clave..." value={registerData.clave} onFocus={() => setIsClaveFocused(true)} onBlur={() => setIsClaveFocused(false)} onChange={(e) => setRegisterData({ ...registerData, clave: e.target.value })} />
                          <button type="button" style={styles.eyeBtn} onClick={() => setShowRegPass(!showRegPass)}>{showRegPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}</button>
                          {fieldErrors.clave && <span style={styles.fieldError}>⚠️ {fieldErrors.clave}</span>}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Confirmar contraseña</label>
                        <div style={styles.inputWrap}>
                          <input style={{ ...styles.input, paddingRight: '40px', borderColor: registerData.confirmarClave ? (registerData.confirmarClave === registerData.clave ? '#22c55e' : '#ef4444') : (fieldErrors.confirmarClave ? '#ff4d4d' : styles.input.border.split(' ')[2]), marginBottom: 0 }} type={showRegConfirmPass ? "text" : "password"} autoComplete="new-password" placeholder="Repite tu clave..." value={registerData.confirmarClave} onChange={(e) => setRegisterData({ ...registerData, confirmarClave: e.target.value })} />
                          <button type="button" style={styles.eyeBtn} onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}>{showRegConfirmPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}</button>
                          {registerData.confirmarClave && registerData.confirmarClave !== registerData.clave && (
                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', animation: 'fadeIn 0.2s' }}>⚠️ Las contraseñas no coinciden</span>
                          )}
                          {registerData.confirmarClave && registerData.clave && registerData.confirmarClave === registerData.clave && (
                            <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', animation: 'fadeIn 0.2s' }}>✓ Las contraseñas coinciden</span>
                          )}
                          {!registerData.confirmarClave && fieldErrors.confirmarClave && <span style={styles.fieldError}>⚠️ {fieldErrors.confirmarClave}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && <div style={styles.error}>{error}</div>}
                  {infoMsg && <div style={styles.info}>{infoMsg}</div>}
                  <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>{isSubmitting ? "Registrando..." : "Registrar"}</button>
                </form>
              )}
            </>
          )}

          {view === "recover" && (
            <form onSubmit={(e) => { e.preventDefault(); handleRecover(); }} style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "5px" }}>
                <button type="button" onClick={() => { setView("auth"); resetMessages(); }} style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.25)", color: "#FFC107", cursor: "pointer", display: "flex", padding: "8px", borderRadius: "50%" }}><FaArrowLeft size={16} /></button>
                <h2 style={{ ...styles.formTitle, marginBottom: 0 }}>Recuperar Cuenta</h2>
              </div>
              <p style={styles.formSubtitle}>Te enviaremos un correo de recuperación</p>
              <label style={styles.label}>Tu correo</label>
              <div style={styles.inputWrap}>
                <input style={{ ...styles.input, borderColor: fieldErrors.recoverEmail ? '#ff4d4d' : 'rgba(255,193,7,0.15)', marginBottom: 0 }} type="text" inputMode="email" name="email" autoComplete="email" placeholder="usuario@correo.com" value={recoverEmail} onChange={(e) => { setRecoverEmail(e.target.value); resetMessages(); }} />
                {fieldErrors.recoverEmail && <div style={styles.fieldError}>⚠️ {fieldErrors.recoverEmail}</div>}
              </div>
              {error && <div style={styles.error}>{error}</div>}
              {infoMsg && <div style={styles.info}>{infoMsg}</div>}
              <button type="submit" style={styles.mainBtn} disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar Correo"}</button>
            </form>
          )}

          {view === "reset" && (
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "5px" }}>
                <button onClick={() => { setView("auth"); resetMessages(); }} style={{ background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.25)", color: "#FFC107", cursor: "pointer", display: "flex", padding: "8px", borderRadius: "50%" }}><FaArrowLeft size={16} /></button>
                <h2 style={{ ...styles.formTitle, marginBottom: 0 }}>Nueva Contraseña</h2>
              </div>
              <p style={{ ...styles.formSubtitle, marginBottom: "20px" }}>Crea tu nueva clave de acceso</p>
              <label style={styles.label}>Contraseña Nueva</label>
              <div style={styles.inputWrap}>
                <input style={{ ...styles.input, borderColor: fieldErrors.clave ? '#ff4d4d' : 'rgba(255,255,255,0.1)', marginBottom: 0 }} type="password" placeholder="••••••••" value={registerData.clave} onChange={(e) => setRegisterData({ ...registerData, clave: e.target.value })} />
                {fieldErrors.clave && <span style={styles.fieldError}>⚠️ {fieldErrors.clave}</span>}
              </div>
              {registerData.clave && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', animation: 'fadeIn 0.2s ease' }}>
                  {[
                    { label: 'Más de 6 caracteres', ok: registerData.clave.length > 6 },
                    { label: 'Al menos una letra', ok: /[a-zA-Z]/.test(registerData.clave) },
                    { label: 'Al menos un número', ok: /[0-9]/.test(registerData.clave) },
                    { label: 'Al menos un carácter especial (!@#$...)', ok: /[^a-zA-Z0-9]/.test(registerData.clave) },
                  ].map((rule, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 500, color: rule.ok ? '#22c55e' : '#6b7280', transition: 'color 0.2s' }}>
                      {rule.ok ? <FaCheck style={{ fontSize: '9px', color: '#22c55e', flexShrink: 0 }} /> : <FaTimes style={{ fontSize: '9px', color: '#ef4444', flexShrink: 0 }} />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <label style={styles.label}>Repetir Contraseña</label>
              <div style={styles.inputWrap}>
                <input style={{ ...styles.input, borderColor: fieldErrors.confirmarClave ? '#ff4d4d' : 'rgba(255,255,255,0.1)', marginBottom: 0 }} type="password" placeholder="••••••••" value={registerData.confirmarClave} onChange={(e) => setRegisterData({ ...registerData, confirmarClave: e.target.value })} />
                {fieldErrors.confirmarClave && <span style={styles.fieldError}>⚠️ {fieldErrors.confirmarClave}</span>}
              </div>
              {error && <div style={styles.error}>{error}</div>}
              <button style={styles.mainBtn} onClick={handleResetPassword} disabled={isSubmitting}>{isSubmitting ? "Actualizando..." : "Guardar Nueva Clave"}</button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODAL DE CONFIRMACIÓN ANTES DE REGISTRAR */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowConfirmModal(false)}>
          <div style={{ background: '#0b1220', border: '2px solid #FFC107', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}></div>
              <h3 style={{ color: '#FFC107', fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0' }}>Confirmar Registro</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>¿Estás seguro de registrar a esta persona?</p>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px 0', fontWeight: '600' }}>NOMBRE COMPLETO</p>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>{registerData.fullName || 'Sin nombre'}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px 0', fontWeight: '600' }}>DOCUMENTO</p>
                  <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{registerData.documentType} {registerData.documentNumber}</p>
                </div>
                <div>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px 0', fontWeight: '600' }}>TELÉFONO</p>
                  <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{registerData.phone || '-'}</p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={{ color: '#64748b', fontSize: '11px', margin: '0 0 4px 0', fontWeight: '600' }}>CORREO</p>
                  <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{registerData.correo || '-'}</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleConfirmRegister} disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: '#FFC107', border: 'none', color: '#000', borderRadius: '8px', fontSize: '14px', fontWeight: '800', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>{isSubmitting ? 'Registrando...' : 'Sí, registrar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ALERTA REGISTRO EXITOSO */}
      {registerSuccessAlert && (
        <>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, backgroundColor: '#0b1220', border: '2px solid #10B981', borderRadius: '16px', padding: '28px 32px', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ color: '#10B981', fontSize: '20px', fontWeight: '800', margin: '0 0 10px 0' }}>¡Cuenta creada exitosamente!</h3>
            <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>Ya puedes iniciar sesión con tu correo y contraseña.</p>
            <button onClick={() => setRegisterSuccessAlert(false)} style={{ padding: '10px 28px', backgroundColor: '#10B981', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' }}>Entendido</button>
          </div>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998, backdropFilter: 'blur(4px)' }} onClick={() => setRegisterSuccessAlert(false)} />
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .gm-swal-popup { border: 1px solid rgba(255, 193, 7, 0.4) !important; border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important; padding: 8px !important; }
        .gm-swal-btn { padding: 4px 12px !important; font-size: 11px !important; font-weight: 700 !important; border-radius: 6px !important; margin: 5px !important; height: 28px !important; min-width: 70px !important; }
        .gm-swal-btn.confirm { color: #000 !important; }
        .login-container-root { display: flex; min-height: 100vh; width: 100%; background-size: cover; background-position: center; font-family: 'Inter', sans-serif; color: #fff; position: relative; overflow-x: hidden; gap: 32px; }
        .login-hero-section { flex: 0 0 45%; }
        .login-form-wrapper { flex: 0 0 55%; }
        .login-form-card { width: 100%; max-width: 400px; position: relative; }
        .login-input-row { display: flex; gap: 12px; width: 100%; }
        .password-globito-balloon { position: absolute; right: calc(100% + 20px); top: 50%; transform: translateY(-50%); width: 250px; background: #0f172a; border: 1px solid rgba(245, 200, 27, 0.45); border-radius: 12px; padding: 12px 14px; box-shadow: 0 12px 35px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 200, 27, 0.15); z-index: 100; backdrop-filter: blur(8px); animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1); box-sizing: border-box; }
        .password-globito-balloon::after { content: ''; position: absolute; top: 50%; right: -8px; transform: translateY(-50%); border-width: 8px 0 8px 8px; border-style: solid; border-color: transparent transparent transparent #0f172a; }
        .password-globito-balloon::before { content: ''; position: absolute; top: 50%; right: -10px; transform: translateY(-50%); border-width: 9px 0 9px 9px; border-style: solid; border-color: transparent transparent transparent rgba(245, 200, 27, 0.5); }
        @media (max-width: 900px) {
          .login-input-row { flex-direction: column; gap: 0; }
          .login-container-root { flex-direction: column !important; overflow-y: auto !important; gap: 0 !important; }
          .login-hero-section { flex: 0 0 auto !important; padding: 60px 20px 30px 20px !important; }
          .login-form-wrapper { flex: 0 0 auto !important; padding-right: 0 !important; padding-bottom: 50px !important; }
          .login-form-card { max-width: 90% !important; padding: 20px 25px !important; }
          .password-globito-balloon { position: static !important; width: 100% !important; margin-top: 10px !important; margin-bottom: 8px !important; transform: none !important; box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important; }
          .password-globito-balloon::after, .password-globito-balloon::before { display: none !important; }
        }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px #171a21 inset !important; -webkit-text-fill-color: white !important; transition: background-color 5000s ease-in-out 0s; }
      `}</style>

      {showConflictModal && (
        <SessionConflictModal
          title="SESIÓN YA ACTIVA"
          description="Tu cuenta ya tiene una sesión abierta en otro lugar. ¿Deseas cerrarla e ingresar aquí?"
          infoText="Al continuar, se cerrarán todas las sesiones previas en otros dispositivos."
          showUseHere={true}
          onUseHere={() => { setShowConflictModal(false); handleLogin(null, true); }}
          onClose={() => setShowConflictModal(false)}
        />
      )}
    </div>
  );
};

export default Login;