/* eslint-disable react-refresh/only-export-components */
/* === VISTA COMPLETA DE CHECKOUT (INTEGRADA CON HEADER Y FOOTER DEL SITIO) === */
import React, { useState, useEffect, useRef } from 'react';
import '../styles/CheckoutModal.css';
import '../../Home/styles/HomeHero.css';
import { calculateCartFinancials } from '../utils/cartFinancials';
import Header from '../../../shared/components/tienda/Header';
import Footer from '../../../shared/components/tienda/Footer';
import {
  FaTimes,
  FaSearchPlus,
  FaArrowLeft,
  FaCheckCircle,
  FaTrash,
  FaTruck,
  FaReceipt,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaShoppingBag,
  FaHeadset,
  FaCheck,
  FaEdit,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEye,
  FaShareAlt,
  FaEnvelope,
  FaUser,
  FaCity,
  FaBuilding,
  FaHome,
  FaUndo
} from 'react-icons/fa';

export const PAYMENT_METHODS = [
  {
    id: 'nequi',
    name: 'Nequi',
    badge: 'Transferencia Rápida',
    img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773077199/WhatsApp_Image_2026-03-05_at_2.23.11_PM_4_ez06y3.jpg',
    group: 'upfront',
    qr: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773337920/WhatsApp_Image_2026-03-12_at_12.49.25_PM_vryssw.jpg'
  },
  {
    id: 'bancolombia',
    name: 'Bancolombia',
    badge: 'QR / Transferencia',
    img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773079418/WhatsApp_Image_2026-03-09_at_1.01.39_PM_lgtfn2.jpg',
    group: 'upfront',
    qr: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773337951/bancolombia_u4ipqc.jpg'
  },
  {
    id: 'bold',
    name: 'Bold (Tarjetas y PSE)',
    badge: 'Pasarela Oficial',
    img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773077199/WhatsApp_Image_2026-03-05_at_2.23.11_PM_2_bjynti.jpg',
    group: 'upfront',
    link: 'https://checkout.bold.co/payment/LNK_UT9BG4IVNG'
  }
];

const CheckoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  total,
  subtotal,
  selectedMethod,
  setSelectedMethod,
  deliveryType,
  setDeliveryType,
  address,
  setAddress,
  phone,
  setPhone,
  receiptFile,
  setReceiptFile,
  isProcessing,
  cartItems = [],
  getProductName: gPN,
  getProductPrice: gPP,
  user = {}
}) => {
  // Estados
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showProductsDetailModal, setShowProductsDetailModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [editSuccessAlert, setEditSuccessAlert] = useState(false);
  const [expandedProductImage, setExpandedProductImage] = useState(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [addrForm, setAddrForm] = useState({
    nombre: user?.nombre || user?.nombreCompleto || '',
    telefono: phone || '',
    email: user?.correo || user?.email || '',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: address || '',
    fachada: ''
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryTypeError, setDeliveryTypeError] = useState('');
  const [methodError, setMethodError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [isReceiptExpanded, setIsReceiptExpanded] = useState(false);
  const [showRemoveReceiptConfirm, setShowRemoveReceiptConfirm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddressConfirmPrompt, setShowAddressConfirmPrompt] = useState(false);
  const paymentSectionRef = useRef(null);
  const deliverySectionRef = useRef(null);
  const addressSectionRef = useRef(null);
  const backupAddrFormRef = useRef(null);
  const financials = calculateCartFinancials(cartItems);

  // Guardar snapshot de los datos al abrir el modal de dirección
  useEffect(() => {
    if (showAddressModal) {
      backupAddrFormRef.current = { ...addrForm };
    }
  }, [showAddressModal]);

  // Función para restablecer datos originales (botón de reversa)
  const handleResetAddressForm = () => {
    if (backupAddrFormRef.current) {
      setAddrForm({ ...backupAddrFormRef.current });
      setAddressErrors({});
    }
  };

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bloquear scroll en móvil al editar dirección o ver productos
  useEffect(() => {
    if ((showAddressModal || showProductsDetailModal) && isMobileView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showAddressModal, showProductsDetailModal, isMobileView]);

  // Sincronizar datos
  useEffect(() => {
    if (address) setAddrForm(prev => ({ ...prev, direccion: address }));
    if (phone) setAddrForm(prev => ({ ...prev, telefono: phone }));
    if (user?.correo || user?.email) {
      setAddrForm(prev => ({ ...prev, email: prev.email || user?.correo || user?.email || '' }));
    }
  }, [address, phone, user]);

  if (!isOpen) return null;

  const currentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const isUpfront = currentMethod?.group === 'upfront';
  const isPickup = deliveryType === 'recoger';
  const isDelivery = deliveryType === 'envio';
  const isNacional = deliveryType === 'nacional';
  const isNequi = selectedMethod === 'nequi';
  const isBancolombia = selectedMethod === 'bancolombia';
  const isBold = selectedMethod === 'bold';
  const shippingText = !deliveryType
    ? 'Por seleccionar'
    : isPickup
    ? 'Recoger en local (Sin costo)'
    : isNacional
    ? 'Envío Nacional (Por coordinar)'
    : 'Envío local a domicilio (Por coordinar)';

  const scrollToPayment = () => {
    if (paymentSectionRef.current) {
      paymentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const orderTotal = total || subtotal || 0;
    const shareData = {
      title: 'Gorras Caps Original - Mi Pedido',
      text: `¡Mira mi pedido en Gorras Caps Original! Total: $${orderTotal.toLocaleString('es-CO')}`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {}
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const handleSaveDetailedAddress = () => {
    const errs = {};
    const nom = (addrForm.nombre || '').trim();
    const tel = (addrForm.telefono || '').toString().trim();
    const mail = (addrForm.email || '').trim();
    const dep = (addrForm.departamento || '').trim();
    const ciu = (addrForm.ciudad || '').trim();
    const dir = (addrForm.direccion || '').trim();
    const fac = (addrForm.fachada || '').trim();

    if (!nom) errs.nombre = 'El nombre del destinatario es obligatorio';
    if (!tel) {
      errs.telefono = 'El teléfono de contacto es obligatorio';
    } else if (tel.length < 7) {
      errs.telefono = 'Ingresa un número de teléfono válido (mínimo 7 dígitos)';
    }
    if (!mail) {
      errs.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(mail)) {
      errs.email = 'Ingresa un correo electrónico válido';
    }
    if (!dep) errs.departamento = 'El departamento es obligatorio';
    if (!ciu) errs.ciudad = 'El municipio o ciudad es obligatorio';
    if (!dir) errs.direccion = 'La dirección de entrega es obligatoria';
    if (!fac) errs.fachada = 'Las indicaciones o fachada son obligatorias';

    if (Object.keys(errs).length > 0) {
      setAddressErrors(errs);
      return;
    }
    setAddressErrors({});
    const parts = [dir, ciu, dep].filter(Boolean);
    const fullAddr = parts.join(', ');
    setAddress(fullAddr);
    setPhone(tel);
    setShowAddressModal(false);
    setEditSuccessAlert(true);
    setTimeout(() => setEditSuccessAlert(false), 3500);
  };

  const handleProceedToConfirm = () => {
    setAddressError('');
    setPhoneError('');
    setDeliveryTypeError('');
    setMethodError('');
    setFileError('');

    if (!deliveryType) {
      setDeliveryTypeError('Debes seleccionar un tipo de envío para continuar');
      if (deliverySectionRef.current) {
        deliverySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    if ((isDelivery || isNacional) && (!address || !address.trim())) {
      setShowAddressModal(true);
      setAddressError('Por favor registra tu dirección de entrega');
      return;
    }
    if (!phone || !String(phone).trim()) {
      setShowAddressModal(true);
      setPhoneError('Por favor registra tu teléfono de contacto');
      return;
    }
    if (!selectedMethod) {
      setMethodError('Por favor selecciona un método de pago');
      scrollToPayment();
      return;
    }
    if (isUpfront && !receiptFile) {
      setFileError('Debes subir el comprobante de pago para continuar');
      scrollToPayment();
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteOrder = () => {
    setShowConfirmModal(false);
    onConfirm();
  };

  // 🔥 VISTA COMPLETA DE EDICIÓN DE DIRECCIÓN (Solo en móvil) CON HEADER Y FOOTER
  const renderAddressEditView = () => (
    <div className="gm-address-full-view">
      {/* HEADER DEL SITIO */}
      <Header />

      <div className="gm-address-full-content">
        <div className="gm-address-full-header">
          <button
            onClick={() => { setShowAddressModal(false); setAddressErrors({}); }}
            className="gm-address-full-back-btn"
            type="button"
          >
            <FaArrowLeft size={16} />
            <span>Volver</span>
          </button>
          <h2 className="gm-address-full-title">
            <FaMapMarkerAlt color="#F5C81B" size={18} />
            Editar Dirección y Contacto
          </h2>
          <div className="gm-address-full-spacer" />
        </div>

        <div className="gm-address-full-body">
          {/* Correo */}
          <div className="gm-address-full-field">
            <label className="gm-address-full-label">
              <FaEnvelope size={12} /> Correo electrónico <span className="gm-required">*</span>
            </label>
            <div className="gm-address-full-input-wrapper">
              <input
                type="email"
                value={addrForm.email}
                onChange={(e) => {
                  setAddrForm(prev => ({ ...prev, email: e.target.value }));
                  if (addressErrors.email) setAddressErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="Ej: cliente@correo.com"
                className={`gm-address-full-input ${addressErrors.email ? 'has-error' : ''}`}
              />
              {addrForm.email && (
                <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, email: '' }))} className="gm-address-full-clear-btn">
                  <FaTimes size={12} />
                </button>
              )}
            </div>
            {addressErrors.email && <p className="gm-address-full-error">️ {addressErrors.email}</p>}
          </div>

          {/* Fila: Nombre + Teléfono */}
          <div className="gm-address-full-row">
            <div className="gm-address-full-field">
              <label className="gm-address-full-label">
                <FaUser size={12} /> Nombre completo <span className="gm-required">*</span>
              </label>
              <div className="gm-address-full-input-wrapper">
                <input
                  type="text"
                  value={addrForm.nombre}
                  onChange={(e) => {
                    setAddrForm(prev => ({ ...prev, nombre: e.target.value }));
                    if (addressErrors.nombre) setAddressErrors(prev => ({ ...prev, nombre: '' }));
                  }}
                  placeholder="Ej: Cristian Cardona"
                  className={`gm-address-full-input ${addressErrors.nombre ? 'has-error' : ''}`}
                />
                {addrForm.nombre && (
                  <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, nombre: '' }))} className="gm-address-full-clear-btn">
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              {addressErrors.nombre && <p className="gm-address-full-error">⚠️ {addressErrors.nombre}</p>}
            </div>
            <div className="gm-address-full-field">
              <label className="gm-address-full-label">
                <FaPhoneAlt size={12} /> Teléfono / WhatsApp <span className="gm-required">*</span>
              </label>
              <div className="gm-address-full-input-wrapper">
                <input
                  type="tel"
                  value={addrForm.telefono}
                  onChange={(e) => {
                    setAddrForm(prev => ({ ...prev, telefono: e.target.value.replace(/\D/g, '') }));
                    if (addressErrors.telefono) setAddressErrors(prev => ({ ...prev, telefono: '' }));
                  }}
                  placeholder="Ej: 3228977086"
                  className={`gm-address-full-input ${addressErrors.telefono ? 'has-error' : ''}`}
                />
                {addrForm.telefono && (
                  <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, telefono: '' }))} className="gm-address-full-clear-btn">
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              {addressErrors.telefono && <p className="gm-address-full-error">⚠️ {addressErrors.telefono}</p>}
            </div>
          </div>

          {/* Fila: Departamento + Ciudad */}
          <div className="gm-address-full-row">
            <div className="gm-address-full-field">
              <label className="gm-address-full-label">
                <FaBuilding size={12} /> Departamento <span className="gm-required">*</span>
              </label>
              <div className="gm-address-full-input-wrapper">
                <input
                  type="text"
                  value={addrForm.departamento}
                  onChange={(e) => {
                    setAddrForm(prev => ({ ...prev, departamento: e.target.value }));
                    if (addressErrors.departamento) setAddressErrors(prev => ({ ...prev, departamento: '' }));
                  }}
                  placeholder="Ej: Antioquia"
                  className={`gm-address-full-input ${addressErrors.departamento ? 'has-error' : ''}`}
                />
                {addrForm.departamento && (
                  <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, departamento: '' }))} className="gm-address-full-clear-btn">
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              {addressErrors.departamento && <p className="gm-address-full-error">⚠️ {addressErrors.departamento}</p>}
            </div>
            <div className="gm-address-full-field">
              <label className="gm-address-full-label">
                <FaCity size={12} /> Municipio / Ciudad <span className="gm-required">*</span>
              </label>
              <div className="gm-address-full-input-wrapper">
                <input
                  type="text"
                  value={addrForm.ciudad}
                  onChange={(e) => {
                    setAddrForm(prev => ({ ...prev, ciudad: e.target.value }));
                    if (addressErrors.ciudad) setAddressErrors(prev => ({ ...prev, ciudad: '' }));
                  }}
                  placeholder="Ej: Medellín"
                  className={`gm-address-full-input ${addressErrors.ciudad ? 'has-error' : ''}`}
                />
                {addrForm.ciudad && (
                  <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, ciudad: '' }))} className="gm-address-full-clear-btn">
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              {addressErrors.ciudad && <p className="gm-address-full-error">⚠️ {addressErrors.ciudad}</p>}
            </div>
          </div>

          {/* Dirección completa */}
          <div className="gm-address-full-field">
            <label className="gm-address-full-label">
              <FaHome size={12} /> Dirección de entrega <span className="gm-required">*</span>
            </label>
            <div className="gm-address-full-input-wrapper">
              <input
                type="text"
                value={addrForm.direccion}
                onChange={(e) => {
                  setAddrForm(prev => ({ ...prev, direccion: e.target.value }));
                  if (addressErrors.direccion) setAddressErrors(prev => ({ ...prev, direccion: '' }));
                }}
                placeholder="Ej: Calle 77CC # 83-11, Apto 402"
                className={`gm-address-full-input ${addressErrors.direccion ? 'has-error' : ''}`}
              />
              {addrForm.direccion && (
                <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, direccion: '' }))} className="gm-address-full-clear-btn">
                  <FaTimes size={12} />
                </button>
              )}
            </div>
            {addressErrors.direccion && <p className="gm-address-full-error">⚠️ {addressErrors.direccion}</p>}
          </div>

          {/* Fachada / Indicaciones */}
          <div className="gm-address-full-field">
            <label className="gm-address-full-label">
              <FaMapMarkerAlt size={12} /> Detalles de la fachada / Indicaciones <span className="gm-required">*</span>
            </label>
            <div className="gm-address-full-input-wrapper">
              <input
                type="text"
                value={addrForm.fachada}
                onChange={(e) => {
                  setAddrForm(prev => ({ ...prev, fachada: e.target.value }));
                  if (addressErrors.fachada) setAddressErrors(prev => ({ ...prev, fachada: '' }));
                }}
                placeholder="Ej: Casa blanca de dos pisos, rejas negras..."
                className={`gm-address-full-input ${addressErrors.fachada ? 'has-error' : ''}`}
              />
              {addrForm.fachada && (
                <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, fachada: '' }))} className="gm-address-full-clear-btn">
                  <FaTimes size={12} />
                </button>
              )}
            </div>
            {addressErrors.fachada ? (
              <p className="gm-address-full-error">⚠️ {addressErrors.fachada}</p>
            ) : (
              <span className="gm-address-full-hint">
                Información clave para que el domiciliario ubique tu casa fácilmente.
              </span>
            )}
          </div>
        </div>

        <div className="gm-address-full-footer">
          <button
            type="button"
            onClick={handleResetAddressForm}
            className="gm-address-full-undo-btn"
            title="Restablecer datos originales"
            aria-label="Restablecer datos originales"
          >
            <FaUndo size={14} />
            <span>Restablecer</span>
          </button>
          <button
            onClick={() => { setShowAddressModal(false); setAddressErrors({}); }}
            className="gm-address-full-cancel-btn"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveDetailedAddress}
            className="gm-address-full-save-btn"
            type="button"
          >
            <FaCheck size={14} /> Guardar dirección
          </button>
        </div>
      </div>

      {/* FOOTER DEL SITIO */}
      <Footer />
    </div>
  );

  // Si estamos en móvil y se abrió la edición de dirección, mostrar vista completa
  if (showAddressModal && isMobileView) {
    return renderAddressEditView();
  }

  return (
    <div className="gm-checkout-wrapper">
      <style>{`@media (max-width: 768px) { .gm-address-modal-overlay { position: fixed !important; inset: 0 !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; height: 100dvh !important; padding: 0 !important; margin: 0 !important; background-color: #0b1220 !important; display: flex !important; flex-direction: column !important; align-items: stretch !important; justify-content: stretch !important; z-index: 10030 !important; backdrop-filter: none !important; animation: none !important; } .gm-address-modal-dialog { width: 100vw !important; max-width: 100vw !important; height: 100vh !important; max-height: 100vh !important; height: 100dvh !important; border-radius: 0 !important; border: none !important; box-shadow: none !important; margin: 0 !important; display: flex !important; flex-direction: column !important; background-color: #0b1220 !important; animation: none !important; overflow: hidden !important; } .gm-address-modal-header { padding: 16px 18px !important; background-color: #070b14 !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; position: sticky !important; top: 0 !important; z-index: 20 !important; flex-shrink: 0 !important; } .gm-address-back-mobile-btn { display: inline-flex !important; } .gm-address-modal-body { flex: 1 1 auto !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding: 20px 18px !important; background-color: #0b1220 !important; } .gm-address-modal-footer { position: sticky !important; bottom: 0 !important; background-color: #070b14 !important; border-top: 1px solid rgba(255, 255, 255, 0.1) !important; padding: 14px 18px !important; padding-bottom: max(16px, env(safe-area-inset-bottom)) !important; z-index: 20 !important; flex-shrink: 0 !important; display: flex !important; gap: 10px !important; } .gm-address-modal-footer button { flex: 1 !important; height: 44px !important; font-size: 13px !important; } .gm-form-row-2col { display: grid !important; grid-template-columns: 1fr !important; gap: 12px !important; } .gm-form-row-address { display: grid !important; grid-template-columns: 1fr !important; gap: 12px !important; } }`}</style>
      {/* BREADCRUMBS */}
      <div className="gm-checkout-top-nav" style={{ marginBottom: '18px' }}>
        <div className="gm-checkout-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
          <span>Carrito</span>
          <span>&gt;</span>
          <span style={{ color: '#F5C81B', fontWeight: '800' }}>Finalizar compra</span>
          <span>&gt;</span>
          <span>Pagar</span>
          <span>&gt;</span>
          <span>Pedido completo</span>
        </div>
      </div>
      {/* BANNER HERO */}
      <div className="gm-hero" style={{ background: 'transparent', borderRadius: '16px', overflow: 'hidden', marginBottom: '22px' }}>
        <div className="gm-hero-bg" style={{
          background: `radial-gradient(circle at 25% 25%, rgba(255,215,0, 0.10), transparent 55%), linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.85) 100%), url("https://res.cloudinary.com/dm8696z6p/image/upload/v1740927653/Banner_3_1_d9o2ay.png")`,
          backgroundSize: 'cover', backgroundPosition: 'center center', filter: 'saturate(1.05) contrast(1.02)'
        }} />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title gm-hero-title-smaller" style={{ color: '#FFFFFF', letterSpacing: '1px' }}>FINALIZAR COMPRA</h1>
          <p className="gm-hero-sub" style={{ color: '#cbd5e1' }}>Revisa tus datos de entrega y selecciona tu método de pago</p>
        </div>
      </div>
      {/* BARRA DE ACCIÓN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={onClose} className="gm-checkout-back-btn" type="button">
          <FaArrowLeft size={13} />
          <span className="gm-btn-label-full">Volver al carrito</span>
          <span className="gm-btn-label-short" style={{ display: 'none' }}>Volver</span>
        </button>
        <button onClick={handleShare} className="gm-checkout-share-btn" type="button" title="Compartir pedido o enlace">
          <FaShareAlt size={13} color="#F5C81B" />
          <span>{copiedShare ? '¡Enlace copiado! ✓' : 'Compartir pedido'}</span>
        </button>
      </div>
      {/* LAYOUT PRINCIPAL */}
      <div className="gm-checkout-layout">
        <div className="gm-checkout-main">
          <div className="gm-checkout-unified-card">
            {/*  SECCIÓN A: DIRECCIÓN COMPACTA */}
            <section ref={addressSectionRef} className="gm-checkout-unified-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaMapMarkerAlt color="#FFC107" size={18} />
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>Dirección de Envío y Contacto</h2>
                </div>
                <button onClick={() => setShowAddressModal(true)} className="gm-checkout-edit-btn" type="button" title="Editar datos">
                  <FaEdit size={12} /><span className="gm-edit-btn-text"> Editar datos</span>
                </button>
              </div>
              {addressError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', color: '#ff6b6b', fontSize: '12px', marginBottom: '10px', fontWeight: '600' }}>
                  ⚠️ {addressError}
                </div>
              )}
              {phoneError && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', color: '#ff6b6b', fontSize: '12px', marginBottom: '10px', fontWeight: '600' }}>
                  ⚠️ {phoneError}
                </div>
              )}
              {/* VISTA COMPACTA: Solo Dirección y Teléfono */}
              <div className="gm-checkout-info-grid" style={{ gridTemplateColumns: '1fr', gap: '8px', marginTop: '6px' }}>
                <div className="gm-checkout-info-item">
                  <label className="gm-checkout-info-label">Dirección de entrega</label>
                  <div className="gm-checkout-info-value" style={{ padding: '8px 12px', fontSize: '0.88rem', minHeight: 'unset' }}>
                    {isPickup ? 'Retiro en punto físico GM CAPS' : (addrForm.direccion || address || '—')}
                  </div>
                </div>
                <div className="gm-checkout-info-item">
                  <label className="gm-checkout-info-label">Teléfono</label>
                  <div className="gm-checkout-info-value" style={{ padding: '8px 12px', fontSize: '0.88rem', minHeight: 'unset' }}>
                    {addrForm.telefono || phone || '—'}
                  </div>
                </div>
              </div>
              {editSuccessAlert && (
                <div style={{ marginTop: '12px', padding: '9px 14px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#10B981', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaCheckCircle size={13} /> Información editada con éxito
                </div>
              )}
            </section>
            {/* 👜 SECCIÓN B: PRODUCTOS DEL PEDIDO (Estilo Información Personal) */}
            <section className="gm-checkout-unified-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaShoppingBag color="#FFC107" size={18} />
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>
                    Productos del Pedido ({cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProductsDetailModal(true)}
                  className="gm-checkout-edit-btn"
                  title="Ver detalles de los productos"
                >
                  <FaEye size={12} /><span className="gm-edit-btn-text"> Ver detalles</span>
                </button>
              </div>
              {/* Fila con solo las imágenes de los productos (sin fondo oscuro) */}
              <div className="gm-checkout-products-row-wrapper" style={{ background: 'transparent', border: 'none', padding: '2px 0', boxShadow: 'none' }}>
                <div className="gm-checkout-products-row" style={{ gap: '10px' }}>
                  {cartItems.map((item, index) => {
                    const qty = item.quantity || 1;
                    const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
                    const img = Array.isArray(item.imagenes) && item.imagenes[0]
                      ? item.imagenes[0]
                      : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');
                    return (
                      <div
                        key={index}
                        className="gm-checkout-product-thumb-card"
                        onClick={() => setExpandedProductImage(img)}
                        title={`${name} (x${qty}) - Clic para ampliar foto`}
                      >
                        <img src={img} alt={name} className="gm-checkout-product-thumb-img" />
                        <span className="gm-checkout-thumb-qty-badge">x{qty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            {/* SECCIÓN C: TIPO DE ENVÍO */}
            <section ref={deliverySectionRef} className={`gm-checkout-unified-section ${deliveryTypeError ? 'gm-shipping-error-banner' : ''}`} style={{ border: deliveryTypeError ? '1.5px solid #ff4d4d' : undefined }}>
              <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTruck color="#F5C81B" size={16} /> Seleccione Tipo de Envío
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label onClick={() => { setDeliveryType('envio'); setDeliveryTypeError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: deliveryType === 'envio' ? 'rgba(255, 255, 255, 0.04)' : '#070b14', border: '1px solid rgba(255, 255, 255, 0.06)', borderLeft: deliveryType === 'envio' ? '4px solid #F5C81B' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryType === 'envio' ? '5px solid #F5C81B' : '2px solid #64748b', background: '#000', boxSizing: 'border-box' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Envío a Domicilio (Urbano)</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Entrega directa a tu dirección registrada</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>Por Coordinar</span>
                </label>
                <label onClick={() => { setDeliveryType('nacional'); setDeliveryTypeError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: deliveryType === 'nacional' ? 'rgba(255, 255, 255, 0.04)' : '#070b14', border: '1px solid rgba(255, 255, 255, 0.06)', borderLeft: deliveryType === 'nacional' ? '4px solid #F5C81B' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryType === 'nacional' ? '5px solid #F5C81B' : '2px solid #64748b', background: '#000', boxSizing: 'border-box' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Envío Nacional (Intermunicipal)</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Despacho por transportadora a cualquier ciudad de Colombia</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>Por Coordinar</span>
                </label>
                <label onClick={() => { setDeliveryType('recoger'); setDeliveryTypeError(''); setAddressError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: deliveryType === 'recoger' ? 'rgba(255, 255, 255, 0.04)' : '#070b14', border: '1px solid rgba(255, 255, 255, 0.06)', borderLeft: deliveryType === 'recoger' ? '4px solid #F5C81B' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryType === 'recoger' ? '5px solid #F5C81B' : '2px solid #64748b', background: '#000', boxSizing: 'border-box' }} />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Recoger en Tienda Física</strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Retira personalmente tu paquete sin ningún costo</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>GRATIS</span>
                </label>
              </div>
              {deliveryTypeError && (
                <p style={{ color: '#ff4d4d', fontSize: '13px', fontWeight: '800', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>⚠️ {deliveryTypeError}</p>
              )}
            </section>
            {/* SECCIÓN D: FORMA DE PAGO */}
            <section id="seccion-formas-de-pago" ref={paymentSectionRef} className="gm-checkout-unified-section gm-checkout-unified-section-last">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaReceipt color="#F5C81B" /> Forma De Pago
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                {PAYMENT_METHODS.map(m => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <label key={m.id} onClick={() => { setSelectedMethod(m.id); setMethodError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: isSelected ? 'rgba(255, 255, 255, 0.04)' : '#070b14', border: '1px solid rgba(255, 255, 255, 0.06)', borderLeft: isSelected ? '4px solid #F5C81B' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: isSelected ? '5px solid #F5C81B' : '2px solid #64748b', background: '#000', boxSizing: 'border-box' }} />
                        <img src={m.img} alt={m.name} style={{ height: '28px', maxWidth: '75px', objectFit: 'contain', borderRadius: '4px' }} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#F5C81B' : '#fff' }}>{m.name}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: isSelected ? '#F5C81B' : '#94a3b8', fontWeight: '700', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '4px' }}>{m.badge}</span>
                    </label>
                  );
                })}
              </div>
              {methodError && <p style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: '700', margin: '-10px 0 16px 0' }}>⚠️ {methodError}</p>}
              {(isNequi || isBancolombia) && currentMethod && (
                <div style={{ padding: '22px', backgroundColor: '#070b14', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '800', margin: '0 0 10px 0' }}>Escanea el QR de {currentMethod.name}</p>
                    <div style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }} onClick={() => setIsQrExpanded(true)} title="Clic para agrandar QR">
                      <img src={currentMethod.qr} alt="QR" style={{ width: '150px', height: '150px', objectFit: 'contain', background: '#fff', padding: '6px', borderRadius: '10px', border: '2px solid #F5C81B' }} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', color: '#F5C81B', padding: '6px', borderRadius: '50%', display: 'flex' }}><FaSearchPlus size={12} /></div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>🔍 Clic en el QR para ampliar</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Comprobante de Pago <span style={{ color: '#ff4d4d' }}>*</span></label>
                    <div style={{ minHeight: '150px', border: fileError ? '2px dashed #ff4d4d' : (!receiptFile ? '1.5px dashed rgba(245, 200, 27, 0.4)' : '2px solid #10B981'), borderRadius: '10px', backgroundColor: receiptFile ? '#000' : 'rgba(255, 255, 255, 0.02)', padding: receiptFile ? '0' : '16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                      {!receiptFile && (<input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setReceiptFile(file); setFileError(''); } }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />)}
                      {!receiptFile ? (
                        <div style={{ pointerEvents: 'none' }}>
                          <FaReceipt size={26} color="#F5C81B" style={{ marginBottom: '6px' }} />
                          <p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>Adjuntar comprobante de pago</p>
                          <span style={{ fontSize: '11px', color: '#F5C81B', background: 'rgba(245, 200, 27, 0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>Seleccionar imagen</span>
                        </div>
                      ) : (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setShowRemoveReceiptConfirm(true); }} title="Quitar comprobante" style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', padding: '6px', cursor: 'pointer', zIndex: 20 }} type="button"><FaTrash size={12} /></button>
                          <img src={URL.createObjectURL(receiptFile)} alt="Comprobante" onClick={() => setIsReceiptExpanded(true)} style={{ width: '100%', height: '150px', objectFit: 'contain', cursor: 'zoom-in' }} />
                          <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <FaCheckCircle color="#10B981" size={10} /><span style={{ color: '#10B981', fontSize: '9px', fontWeight: 'bold' }}>Subido</span>
                          </div>
                        </>
                      )}
                    </div>
                    {fileError ? (<p style={{ color: '#ff4d4d', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '700' }}>⚠️ {fileError}</p>) : (!receiptFile && <p style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0 0 0' }}>El comprobante es obligatorio para verificar la transferencia.</p>)}
                  </div>
                </div>
              )}
              {isBold && (
                <div style={{ padding: '22px', backgroundColor: '#070b14', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <img src={currentMethod.img} alt="Bold" style={{ height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: 0, lineHeight: '1.4' }}>Paga mediante la pasarela segura oficial de Bold (Tarjetas y PSE)</p>
                    <a href={currentMethod.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: '#F5C81B', color: '#000', fontWeight: '800', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', boxShadow: '0 4px 14px rgba(245, 200, 27, 0.3)' }}>Abrir pasarela de pago Bold <FaExternalLinkAlt size={11} /></a>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Comprobante de Pago Bold <span style={{ color: '#ff4d4d' }}>*</span></label>
                    <div style={{ minHeight: '150px', border: fileError ? '2px dashed #ff4d4d' : (!receiptFile ? '1.5px dashed rgba(245, 200, 27, 0.4)' : '2px solid #10B981'), borderRadius: '10px', backgroundColor: receiptFile ? '#000' : 'rgba(255, 255, 255, 0.02)', padding: receiptFile ? '0' : '16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                      {!receiptFile && (<input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setReceiptFile(file); setFileError(''); } }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />)}
                      {!receiptFile ? (
                        <div style={{ pointerEvents: 'none' }}>
                          <FaReceipt size={26} color="#F5C81B" style={{ marginBottom: '6px' }} />
                          <p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>Adjuntar soporte de Bold</p>
                          <span style={{ fontSize: '11px', color: '#F5C81B', background: 'rgba(245, 200, 27, 0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>Seleccionar imagen</span>
                        </div>
                      ) : (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setShowRemoveReceiptConfirm(true); }} title="Quitar comprobante" style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', padding: '6px', cursor: 'pointer', zIndex: 20 }} type="button"><FaTrash size={12} /></button>
                          <img src={URL.createObjectURL(receiptFile)} alt="Comprobante" onClick={() => setIsReceiptExpanded(true)} style={{ width: '100%', height: '150px', objectFit: 'contain', cursor: 'zoom-in' }} />
                          <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            <FaCheckCircle color="#10B981" size={10} /><span style={{ color: '#10B981', fontSize: '9px', fontWeight: 'bold' }}>Subido</span>
                          </div>
                        </>
                      )}
                    </div>
                    {fileError ? (<p style={{ color: '#ff4d4d', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '700' }}>⚠️ {fileError}</p>) : (!receiptFile && <p style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0 0 0' }}>El soporte es necesario para verificar tu pago.</p>)}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="gm-checkout-sidebar">
          <div className="gm-checkout-summary-box">
            <h2 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '900', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px', display: 'flex', alignItems: 'center' }}>
              <span>Resumen Del Pedido</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Precio al por menor:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>${financials.retailSubtotal.toLocaleString('es-CO')}</span>
              </div>
              {financials.hasOffer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: '700' }}>
                  <span>Promociones</span>
                  <span>-${financials.offerDiscount.toLocaleString('es-CO')}</span>
                </div>
              )}
              {financials.hasWholesale && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: '#f87171', fontWeight: '700' }}>
                  <div>
                    <span>Descuento al por mayor</span>
                    <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>(Queda en: ${financials.wholesaleResult.toLocaleString('es-CO')})</span>
                  </div>
                  <span>-${financials.wholesaleDiscount.toLocaleString('es-CO')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Precio de envío:</span>
                <span style={{ color: !deliveryType ? '#94a3b8' : '#cbd5e1', fontWeight: '700', fontSize: '12px' }}>
                  {!deliveryType ? 'Por seleccionar' : (isPickup ? 'Sin costo' : 'Por Coordinar')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Método seleccionado:</span>
                <span style={{ color: '#cbd5e1', fontWeight: '700' }}>{currentMethod?.name || 'Por elegir'}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '15px', color: '#fff' }}>Total del pedido:</strong>
                <strong style={{ fontSize: '22px', color: '#F5C81B', fontWeight: '900' }}>${total.toLocaleString('es-CO')}</strong>
              </div>
            </div>
            <button onClick={handleProceedToConfirm} disabled={isProcessing} style={{ width: '100%', marginTop: '20px', padding: '16px', backgroundColor: '#F5C81B', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '900', fontSize: '15px', textTransform: 'none', letterSpacing: '0.8px', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(245, 200, 27, 0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} type="button">
              {isProcessing ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
          <div style={{ background: '#0d1527', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <FaShieldAlt color="#10B981" size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>Seguridad de pago</strong>
                <span>Tus pagos y transferencias son validados de forma directa y protegida.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <FaTruck color="#F5C81B" size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>Garantía de envío</strong>
                <span>Despachamos gorras originales con número de guía y seguimiento personalizado.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <FaHeadset color="#38bdf8" size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>Atención al cliente</strong>
                <span>Cualquier inquietud será atendida directamente por nuestro canal oficial.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a href="https://wa.me/573228977086?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido%20en%20Gorras%20Caps%20Original" target="_blank" rel="noopener noreferrer" style={{ position: 'fixed', bottom: '22px', right: '22px', zIndex: 9999, backgroundColor: '#25D366', border: 'none', color: '#ffffff', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)', transition: 'transform 0.2s ease, background-color 0.2s ease' }} title="Contactar asesor por WhatsApp">
        <FaWhatsapp size={28} />
      </a>
      {/* MODAL CONFIRMACIÓN COMPRA */}
      {showConfirmModal && (
        <div className="gm-modal-overlay-responsive" onClick={() => setShowConfirmModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 10005, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="gm-modal-dialog-responsive gm-confirm-purchase-dialog" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0b1220', border: '1.5px solid #F5C81B', borderRadius: '16px', maxWidth: '480px', width: '92%', maxHeight: '88vh', overflowY: 'auto', padding: '24px 20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '14px', margin: 'auto' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#F5C81B', textAlign: 'center', letterSpacing: '0.5px' }}>Confirmar compra</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', textAlign: 'center' }}>Por favor revisa el resumen de tu pedido de <strong>{cartItems.length} artículo(s)</strong>:</p>
            <div style={{ background: '#070b14', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Cliente:</span>
                <span style={{ color: '#fff', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{addrForm.nombre || user?.nombre || user?.nombreCompleto || 'Cliente'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Forma de pago:</span>
                <span style={{ color: '#fff', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{currentMethod?.name || 'Por elegir'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Entrega:</span>
                <span style={{ color: '#fff', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{shippingText}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Dirección:</span>
                <span style={{ color: '#fff', fontWeight: '600', textAlign: 'right', wordBreak: 'break-word' }}>{isPickup ? 'Recogida en local' : (address || 'Sin dirección')}</span>
              </div>
              {financials.hasOffer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', color: '#f87171' }}>
                  <span style={{ fontWeight: '600' }}>Promociones:</span>
                  <span style={{ fontWeight: '700' }}>-${financials.offerDiscount.toLocaleString('es-CO')}</span>
                </div>
              )}
              {financials.hasWholesale && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', color: '#38bdf8' }}>
                  <span style={{ fontWeight: '600' }}>Descuento por mayor:</span>
                  <span style={{ fontWeight: '700' }}>-${financials.wholesaleDiscount.toLocaleString('es-CO')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Total a pagar:</span>
                <strong style={{ color: '#F5C81B', fontSize: '18px', fontWeight: '800' }}>${total.toLocaleString('es-CO')}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '10px 14px', backgroundColor: 'transparent', border: '1.5px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '13px', height: '42px', cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '0.5px' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = '#FFFFFF'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }} type="button">Volver</button>
              <button onClick={() => { if (isPickup) { handleExecuteOrder(); } else { setShowConfirmModal(false); setShowAddressConfirmPrompt(true); } }} disabled={isProcessing} style={{ flex: 1.2, padding: '10px 14px', backgroundColor: '#F5C81B', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '800', fontSize: '13px', height: '42px', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)', transition: 'all 0.2s ease', letterSpacing: '0.5px', opacity: isProcessing ? 0.7 : 1 }} onMouseOver={(e) => { if (!isProcessing) { e.currentTarget.style.backgroundColor = '#FFD700'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(245, 200, 27, 0.4)'; } }} onMouseOut={(e) => { if (!isProcessing) { e.currentTarget.style.backgroundColor = '#F5C81B'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 200, 27, 0.3)'; } }} type="button">{isProcessing ? 'Enviando...' : 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL CONFIRMACIÓN DIRECCIÓN */}
      {showAddressConfirmPrompt && (
        <div className="gm-modal-overlay-responsive" onClick={() => setShowAddressConfirmPrompt(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 10015, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="gm-modal-dialog-responsive gm-address-confirm-prompt-dialog" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0b1220', border: '1.5px solid #F5C81B', borderRadius: '16px', padding: '24px 20px', maxWidth: '460px', width: '94%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', display: 'flex', flexDirection: 'column', gap: '14px', animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '19px', fontWeight: '800', color: '#F5C81B', letterSpacing: '0.3px' }}>¿Estás seguro de tu dirección?</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>Verifica que los datos sean correctos antes de procesar tu orden:</p>
            </div>
            <div style={{ background: '#070b14', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Destinatario:</span>
                <span style={{ color: '#fff', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{addrForm.nombre || user?.nombre || 'Cliente'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Teléfono:</span>
                <span style={{ color: '#fff', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{addrForm.telefono || phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#94a3b8', flexShrink: 0 }}>Dirección:</span>
                <span style={{ color: '#F5C81B', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{address || 'Sin dirección'}</span>
              </div>
              {addrForm.fachada && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#94a3b8', flexShrink: 0 }}>Indicaciones:</span>
                  <span style={{ color: '#cbd5e1', fontSize: '12px', textAlign: 'right', wordBreak: 'break-word' }}>{addrForm.fachada}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button type="button" onClick={() => { setShowAddressConfirmPrompt(false); setShowAddressModal(true); }} style={{ flex: 1, padding: '10px 14px', backgroundColor: 'transparent', border: '1.5px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', color: '#FFFFFF', fontWeight: '700', fontSize: '13px', height: '42px', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = '#FFFFFF'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}>Cambiar dirección</button>
              <button type="button" onClick={() => { setShowAddressConfirmPrompt(false); handleExecuteOrder(); }} disabled={isProcessing} style={{ flex: 1, padding: '10px 14px', backgroundColor: '#F5C81B', border: 'none', borderRadius: '10px', color: '#000000', fontWeight: '800', fontSize: '13px', height: '42px', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }} onMouseOver={(e) => { if (!isProcessing) { e.currentTarget.style.backgroundColor = '#FFD700'; e.currentTarget.style.transform = 'translateY(-2px)'; } }} onMouseOut={(e) => { if (!isProcessing) { e.currentTarget.style.backgroundColor = '#F5C81B'; e.currentTarget.style.transform = 'translateY(0)'; } }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
      {/* ALERTA ÉXITO */}
      {editSuccessAlert && (
        <div style={{ position: 'fixed', top: '90px', right: '25px', zIndex: 10025, backgroundColor: '#0b1220', border: '1.5px solid #10B981', borderRadius: '12px', padding: '14px 20px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', gap: '10px', color: '#FFFFFF', fontSize: '13px', fontWeight: '700', animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <FaCheckCircle color="#10B981" size={18} />
          <span>Dirección cambiada con éxito</span>
        </div>
      )}
      {/* MODAL DETALLES PRODUCTOS (Compacto, no tan amarillo, con Volver visible) */}
      {showProductsDetailModal && (
        <div
          className="gm-modal-overlay-responsive"
          onClick={() => setShowProductsDetailModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            zIndex: 10025,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="gm-modal-dialog-responsive gm-products-modal-compact"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0b1220',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '94%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '80vh',
              overflow: 'hidden',
              animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header del modal con título y botón cerrar */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaShoppingBag color="#FFC107" size={15} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.2px' }}>
                  Productos del Pedido ({cartItems.length})
                </h3>
              </div>
              <button
                onClick={() => setShowProductsDetailModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                type="button"
                aria-label="Cerrar modal"
              >
                <FaTimes />
              </button>
            </div>
            {/* Lista compacta de productos */}
            <div style={{ padding: '14px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cartItems.map((item, index) => {
                const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
                const price = gPP ? gPP(item) : (item.precio || 0);
                const qty = item.quantity || 1;
                const img = Array.isArray(item.imagenes) && item.imagenes[0] ? item.imagenes[0] : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#070b14',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.07)'
                    }}
                  >
                    <div
                      onClick={() => setExpandedProductImage(img)}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#000',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title="Clic para ampliar foto"
                    >
                      <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '3px', padding: '1px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaEye size={7} color="#cbd5e1" />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        <span>Talla: <strong style={{ color: '#cbd5e1' }}>{item.talla || 'Única'}</strong></span>
                        <span>•</span>
                        <span>Cant: <strong style={{ color: '#FFFFFF' }}>{qty}</strong></span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#FFC107', display: 'block' }}>
                        ${(price * qty).toLocaleString('es-CO')}
                      </span>
                      {qty > 1 && <span style={{ fontSize: '10px', color: '#64748b' }}>${price.toLocaleString('es-CO')} c/u</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Footer con subtotal y botón Volver al pedido */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(7, 11, 20, 0.95)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div>
                <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>Total</span>
                <strong style={{ color: '#FFC107', fontSize: '16px', fontWeight: '800' }}>
                  ${subtotal.toLocaleString('es-CO')}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setShowProductsDetailModal(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.12)';
                  e.currentTarget.style.borderColor = '#FFC107';
                  e.currentTarget.style.color = '#FFC107';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                <FaArrowLeft size={11} /> Volver al pedido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🔥 MODAL DETALLE PRODUCTO (activado por el ojo en móvil) */}
      {selectedDetailProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10020, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px' }} onClick={() => setSelectedDetailProduct(null)}>
          <div style={{ background: '#1E293B', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '0', position: 'relative', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedDetailProduct(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#F5C81B', fontSize: '18px', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><FaTimes /></button>
            <img src={Array.isArray(selectedDetailProduct.imagenes) && selectedDetailProduct.imagenes[0] ? selectedDetailProduct.imagenes[0] : selectedDetailProduct.imagen || 'https://placehold.co/300x300?text=Gorra'} alt={selectedDetailProduct.nombre} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h2 style={{ color: '#F5C81B', fontSize: '18px', fontWeight: 'bold', margin: '0 0 12px 0' }}>{selectedDetailProduct.nombre}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.7)', padding: '3px 8px', borderRadius: '6px' }}>Talla: {selectedDetailProduct.talla || 'Única'}</span>
                <span style={{ fontSize: '11px', color: '#CBD5E1', backgroundColor: 'rgba(51, 65, 85, 0.7)', padding: '3px 8px', borderRadius: '6px' }}>Cantidad: {selectedDetailProduct.quantity || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Precio unitario:</span>
                <span style={{ color: '#F5C81B', fontSize: '18px', fontWeight: 'bold' }}>${(selectedDetailProduct.precio || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL EDICIÓN DIRECCIÓN (Desktop) */}
      {showAddressModal && !isMobileView && (
        <div
          className="gm-modal-overlay-responsive gm-address-modal-overlay"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            zIndex: 10015,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="gm-modal-dialog-responsive gm-address-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0b1220',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '95%',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'none',
              overflow: 'visible',
              animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header del modal */}
            <div
              className="gm-address-modal-header"
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaMapMarkerAlt color="#F5C81B" size={15} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.2px' }}>
                  Dirección de envío y contacto
                </h3>
              </div>
              <button
                onClick={() => { setShowAddressModal(false); setAddressErrors({}); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                type="button"
                aria-label="Cerrar modal"
              >
                <FaTimes />
              </button>
            </div>
            {/* Body sin scroll */}
            <div
              className="gm-address-modal-body"
              style={{
                padding: '12px 20px 8px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflow: 'visible'
              }}
            >
              {/* Fila 1: Contacto y Destinatario (3 columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>Correo electrónico*</label>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="email"
                      value={addrForm.email}
                      onChange={(e) => {
                        setAddrForm(prev => ({ ...prev, email: e.target.value }));
                        if (addressErrors.email) setAddressErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="cliente@correo.com"
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 28px 0 10px',
                        background: '#070b14',
                        border: addressErrors.email ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '7px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {addrForm.email && (
                      <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, email: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                  {addressErrors.email && <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>⚠️ {addressErrors.email}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>Nombre del destinatario*</label>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={addrForm.nombre}
                      onChange={(e) => {
                        setAddrForm(prev => ({ ...prev, nombre: e.target.value }));
                        if (addressErrors.nombre) setAddressErrors(prev => ({ ...prev, nombre: '' }));
                      }}
                      placeholder="Ej: Cristian Cardona"
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 28px 0 10px',
                        background: '#070b14',
                        border: addressErrors.nombre ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '7px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {addrForm.nombre && (
                      <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, nombre: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                  {addressErrors.nombre && <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>️ {addressErrors.nombre}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>Teléfono / WhatsApp*</label>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="tel"
                      value={addrForm.telefono}
                      onChange={(e) => {
                        setAddrForm(prev => ({ ...prev, telefono: e.target.value.replace(/\D/g, '') }));
                        if (addressErrors.telefono) setAddressErrors(prev => ({ ...prev, telefono: '' }));
                      }}
                      placeholder="Ej: 3228977086"
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 28px 0 10px',
                        background: '#070b14',
                        border: addressErrors.telefono ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '7px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {addrForm.telefono && (
                      <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, telefono: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                  {addressErrors.telefono && <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>️ {addressErrors.telefono}</p>}
                </div>
              </div>
              {/* Fila 2: Todo lo de ubicación junto (3 columnas) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 125px', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>Departamento*</label>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={addrForm.departamento}
                      onChange={(e) => {
                        setAddrForm(prev => ({ ...prev, departamento: e.target.value }));
                        if (addressErrors.departamento) setAddressErrors(prev => ({ ...prev, departamento: '' }));
                      }}
                      placeholder="Ej: Antioquia"
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 28px 0 10px',
                        background: '#070b14',
                        border: addressErrors.departamento ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '7px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {addrForm.departamento && (
                      <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, departamento: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                  {addressErrors.departamento && <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>⚠️ {addressErrors.departamento}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>Municipio / Ciudad*</label>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={addrForm.ciudad}
                      onChange={(e) => {
                        setAddrForm(prev => ({ ...prev, ciudad: e.target.value }));
                        if (addressErrors.ciudad) setAddressErrors(prev => ({ ...prev, ciudad: '' }));
                      }}
                      placeholder="Ej: Medellín"
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 28px 0 10px',
                        background: '#070b14',
                        border: addressErrors.ciudad ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '7px',
                        color: '#fff',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {addrForm.ciudad && (
                      <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, ciudad: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                  {addressErrors.ciudad && <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>⚠️ {addressErrors.ciudad}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>Ubicación*</label>
                  <div
                    style={{
                      padding: '0 10px',
                      background: '#070b14',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '7px',
                      color: '#fff',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      height: '35px',
                      boxSizing: 'border-box',
                      fontWeight: '600'
                    }}
                  >
                    Colombia 🇨🇴
                  </div>
                </div>
              </div>
              {/* Fila 3: La dirección queda sola en una fila completa */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>
                  Dirección de entrega (Calle, carrera, casa/apto)*
                </label>
                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={addrForm.direccion}
                    onChange={(e) => {
                      setAddrForm(prev => ({ ...prev, direccion: e.target.value }));
                      if (addressErrors.direccion) setAddressErrors(prev => ({ ...prev, direccion: '' }));
                    }}
                    placeholder="Ej: Calle 77CC # 83-11, Apto 402"
                    style={{
                      width: '100%',
                      height: '35px',
                      padding: '0 28px 0 10px',
                      background: '#070b14',
                      border: addressErrors.direccion ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '7px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {addrForm.direccion && (
                    <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, direccion: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>
                {addressErrors.direccion && <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>⚠️ {addressErrors.direccion}</p>}
              </div>
              {/* Fila 4: Fachada / Indicaciones */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#cbd5e1', marginBottom: '2px' }}>
                  Detalles de la fachada / Indicaciones de entrega*
                </label>
                <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={addrForm.fachada}
                    onChange={(e) => {
                      setAddrForm(prev => ({ ...prev, fachada: e.target.value }));
                      if (addressErrors.fachada) setAddressErrors(prev => ({ ...prev, fachada: '' }));
                    }}
                    placeholder="Ej: Casa blanca de dos pisos, rejas negras..."
                    style={{
                      width: '100%',
                      height: '35px',
                      padding: '0 28px 0 10px',
                      background: '#070b14',
                      border: addressErrors.fachada ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '7px',
                      color: '#fff',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {addrForm.fachada && (
                    <button type="button" onClick={() => setAddrForm(prev => ({ ...prev, fachada: '' }))} style={{ position: 'absolute', right: '6px', background: 'transparent', border: 'none', color: 'rgba(255, 193, 7, 0.7)', cursor: 'pointer', padding: '2px' }}>
                      <FaTimes size={10} />
                    </button>
                  )}
                </div>
                {addressErrors.fachada ? (
                  <p style={{ color: '#ff4d4d', fontSize: '10px', margin: '2px 0 0 0', fontWeight: '600' }}>⚠️ {addressErrors.fachada}</p>
                ) : (
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                    Información clave para que el domiciliario ubique tu casa fácilmente.
                  </span>
                )}
              </div>
            </div>
            {/* Footer con botón de reversa a la izquierda y botones de acción a la derecha */}
            <div
              className="gm-address-modal-footer"
              style={{
                padding: '10px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {/* Botón de reversa pequeño */}
              <button
                type="button"
                onClick={handleResetAddressForm}
                title="Restablecer datos originales"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '7px',
                  color: '#cbd5e1',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#F5C81B';
                  e.currentTarget.style.borderColor = 'rgba(245, 200, 27, 0.4)';
                  e.currentTarget.style.background = 'rgba(245, 200, 27, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <FaUndo size={11} />
                <span>Restablecer</span>
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => { setShowAddressModal(false); setAddressErrors({}); }}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDetailedAddress}
                  style={{
                    padding: '7px 18px',
                    backgroundColor: '#F5C81B',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000000',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(245, 200, 27, 0.25)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFD700';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5C81B';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  type="button"
                >
                  Guardar dirección ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL IMAGEN AMPLIADA */}
      {expandedProductImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 10008, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)' }} onClick={() => setExpandedProductImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button onClick={() => setExpandedProductImage(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'transparent', border: 'none', color: '#F5C81B', fontSize: '26px', cursor: 'pointer' }} type="button"><FaTimes /></button>
            <img src={expandedProductImage} alt="Gorra ampliada" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '78vh', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      )}
      {/* MODAL QR AMPLIADO */}
      {isQrExpanded && currentMethod?.qr && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 10006, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setIsQrExpanded(false)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button style={{ position: 'absolute', top: '-45px', right: '0', background: 'transparent', border: 'none', color: '#F5C81B', fontSize: '28px', cursor: 'pointer' }} type="button"><FaTimes /></button>
            <img src={currentMethod.qr} alt="QR Ampliado" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)', background: '#fff', padding: '10px' }} />
            <p style={{ color: '#F5C81B', textAlign: 'center', marginTop: '14px', fontWeight: '800', fontSize: '15px' }}>Código QR oficial de {currentMethod?.name}</p>
          </div>
        </div>
      )}
      {/* MODAL COMPROBANTE AMPLIADO */}
      {isReceiptExpanded && receiptFile && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 10006, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setIsReceiptExpanded(false)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button style={{ position: 'absolute', top: '-45px', right: '0', background: 'transparent', border: 'none', color: '#10B981', fontSize: '28px', cursor: 'pointer' }} type="button"><FaTimes /></button>
            <img src={URL.createObjectURL(receiptFile)} alt="Comprobante Ampliado" style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
            <p style={{ color: '#10B981', textAlign: 'center', marginTop: '14px', fontWeight: '800', fontSize: '15px' }}>Comprobante de Pago Adjuntado</p>
          </div>
        </div>
      )}
      {/* MODAL QUITAR COMPROBANTE */}
      {showRemoveReceiptConfirm && (
        <div onClick={() => setShowRemoveReceiptConfirm(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 10006, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#0b1220', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', padding: '24px 22px', maxWidth: '440px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', display: 'flex', flexDirection: 'column', gap: '14px', margin: 'auto' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.3px' }}>¿Quitar comprobante?</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>¿Deseas eliminar la captura actual? Tendrás que subir una nueva para confirmar la orden.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
              <button onClick={() => setShowRemoveReceiptConfirm(false)} style={{ flex: 1, padding: '9px 16px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer', fontSize: '13px', height: '38px', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = '#FFFFFF'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }} type="button">Cancelar</button>
              <button onClick={() => { setReceiptFile(null); setFileError(''); setShowRemoveReceiptConfirm(false); }} style={{ flex: 1, padding: '9px 16px', backgroundColor: '#ef4444', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer', fontSize: '13px', height: '38px', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)'; }} type="button">Sí, quitar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutModal;