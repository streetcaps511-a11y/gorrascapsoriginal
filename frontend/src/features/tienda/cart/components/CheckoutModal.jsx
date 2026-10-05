import React, { useState, useEffect, useRef } from 'react';
import '../styles/CheckoutModal.css';
import '../../Home/styles/HomeHero.css';
import { calculateCartFinancials } from '../utils/cartFinancials';
import {
  FaTimes, FaSearchPlus, FaArrowLeft, FaCheckCircle, FaTrash, FaTruck,
  FaReceipt, FaExternalLinkAlt, FaShieldAlt, FaShoppingBag, FaHeadset,
  FaCheck, FaEdit, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEye,
  FaShareAlt, FaEnvelope, FaUser, FaCity, FaBuilding, FaHome, FaUndo
} from 'react-icons/fa';

export const PAYMENT_METHODS = [
  { id: 'nequi', name: 'Nequi', badge: 'Transferencia Rápida', img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773077199/WhatsApp_Image_2026-03-05_at_2.23.11_PM_4_ez06y3.jpg', group: 'upfront', qr: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773337920/WhatsApp_Image_2026-03-12_at_12.49.25_PM_vryssw.jpg' },
  { id: 'bancolombia', name: 'Bancolombia', badge: 'QR / Transferencia', img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773079418/WhatsApp_Image_2026-03-09_at_1.01.39_PM_lgtfn2.jpg', group: 'upfront', qr: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773337951/bancolombia_u4ipqc.jpg' },
  { id: 'bold', name: 'Bold (Tarjetas y PSE)', badge: 'Pasarela Oficial', img: 'https://res.cloudinary.com/dxc5qqsjd/image/upload/v1773077199/WhatsApp_Image_2026-03-05_at_2.23.11_PM_2_bjynti.jpg', group: 'upfront', link: 'https://checkout.bold.co/payment/LNK_UT9BG4IVNG' }
];

const CheckoutModal = ({
  isOpen, onClose, onConfirm, total, subtotal, selectedMethod, setSelectedMethod,
  deliveryType, setDeliveryType, address, setAddress, phone, setPhone,
  receiptFile, setReceiptFile, isProcessing, cartItems = [],
  getProductName: gPN, getProductPrice: gPP, user = {}
}) => {
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

  useEffect(() => { if (showAddressModal) backupAddrFormRef.current = { ...addrForm }; }, [showAddressModal]);
  const handleResetAddressForm = () => { if (backupAddrFormRef.current) { setAddrForm({ ...backupAddrFormRef.current }); setAddressErrors({}); } };

  useEffect(() => { const h = () => setIsMobileView(window.innerWidth <= 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  useEffect(() => { document.body.style.overflow = (showAddressModal || showProductsDetailModal) && isMobileView ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [showAddressModal, showProductsDetailModal, isMobileView]);
  useEffect(() => { if (address) setAddrForm(p => ({ ...p, direccion: address })); if (phone) setAddrForm(p => ({ ...p, telefono: phone })); if (user?.correo || user?.email) setAddrForm(p => ({ ...p, email: p.email || user?.correo || user?.email || '' })); }, [address, phone, user]);

  if (!isOpen) return null;

  const currentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const isUpfront = currentMethod?.group === 'upfront';
  const isPickup = deliveryType === 'recoger';
  const isDelivery = deliveryType === 'envio';
  const isNacional = deliveryType === 'nacional';
  const shippingText = !deliveryType ? 'Por seleccionar' : isPickup ? 'Recoger en local (Sin costo)' : isNacional ? 'Envío Nacional (Por coordinar)' : 'Envío local a domicilio (Por coordinar)';

  const scrollToPayment = () => paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleShare = async () => {
    const data = { title: 'Gorras Caps Original', text: `Mi pedido: $${(total || subtotal || 0).toLocaleString('es-CO')}`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(data); return; } catch { } }
    try { await navigator.clipboard.writeText(window.location.href); setCopiedShare(true); setTimeout(() => setCopiedShare(false), 2500); } catch { }
  };

  const handleSaveDetailedAddress = () => {
    const errs = {};
    const nom = addrForm.nombre?.trim(), tel = addrForm.telefono?.toString().trim(), mail = addrForm.email?.trim();
    const dep = addrForm.departamento?.trim(), ciu = addrForm.ciudad?.trim(), dir = addrForm.direccion?.trim(), fac = addrForm.fachada?.trim();
    if (!nom) errs.nombre = 'El nombre es obligatorio';
    if (!tel) errs.telefono = 'El teléfono es obligatorio'; else if (tel.length < 7) errs.telefono = 'Teléfono inválido';
    if (!mail) errs.email = 'El correo es obligatorio'; else if (!/\S+@\S+\.\S+/.test(mail)) errs.email = 'Correo inválido';
    if (!dep) errs.departamento = 'El departamento es obligatorio';
    if (!ciu) errs.ciudad = 'La ciudad es obligatoria';
    if (!dir) errs.direccion = 'La dirección es obligatoria';
    if (!fac) errs.fachada = 'Las indicaciones son obligatorias';
    if (Object.keys(errs).length > 0) { setAddressErrors(errs); return; }
    setAddressErrors({});
    setAddress([dir, ciu, dep].filter(Boolean).join(', '));
    setPhone(tel);
    setShowAddressModal(false);
    setEditSuccessAlert(true);
    setTimeout(() => setEditSuccessAlert(false), 3500);
  };

  const handleProceedToConfirm = () => {
    setAddressError(''); setPhoneError(''); setDeliveryTypeError(''); setMethodError(''); setFileError('');
    if (!deliveryType) { setDeliveryTypeError('Selecciona un tipo de envío'); deliverySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if ((isDelivery || isNacional) && !address?.trim()) { setShowAddressModal(true); setAddressError('Registra tu dirección'); return; }
    if (!phone?.trim()) { setShowAddressModal(true); setPhoneError('Registra tu teléfono'); return; }
    if (!selectedMethod) { setMethodError('Selecciona un método de pago'); scrollToPayment(); return; }
    if (isUpfront && !receiptFile) { setFileError('Sube el comprobante'); scrollToPayment(); return; }
    setShowConfirmModal(true);
  };

  // ✅ Calcular total de unidades y determinar tipo de descuento
  const totalUnits = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const discountTier = totalUnits >= 60 ? 60 : totalUnits >= 6 ? 6 : 0;
  const discountLabel = discountTier === 60 ? '+60 unidades' : discountTier === 6 ? '+6 unidades' : '';
  const isVentaNormal = discountTier === 0;

  // === VISTA COMPLETA: EDITAR DIRECCIÓN (MÓVIL) ===
  const renderAddressEditView = () => (
    <div className="gm-full-view">
      <div className="gm-full-content">
        <div className="gm-full-header">
          <button onClick={() => { setShowAddressModal(false); setAddressErrors({}); }} className="gm-full-back-btn">
            <FaArrowLeft size={16} /> <span>Volver</span>
          </button>
          <h2 className="gm-full-title"> <FaMapMarkerAlt color="#F5C81B" size={18} /> Editar Dirección y Contacto </h2>
          <div className="gm-full-spacer" />
        </div>
        <div className="gm-full-body">
          <div className="gm-full-field">
            <label className="gm-full-label"> <FaEnvelope size={12} /> Correo electrónico <span className="gm-required">*</span> </label>
            <div className="gm-full-input-wrapper">
              <input type="email" value={addrForm.email} onChange={e => { setAddrForm(p => ({ ...p, email: e.target.value })); setAddressErrors(p => ({ ...p, email: '' })); }} placeholder="cliente@correo.com" className={`gm-full-input ${addressErrors.email ? 'has-error' : ''}`} />
              {addrForm.email && <button type="button" onClick={() => setAddrForm(p => ({ ...p, email: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
            </div>
            {addressErrors.email && <p className="gm-full-error">⚠️ {addressErrors.email}</p>}
          </div>
          <div className="gm-full-row">
            <div className="gm-full-field">
              <label className="gm-full-label"> <FaUser size={12} /> Nombre completo <span className="gm-required">*</span> </label>
              <div className="gm-full-input-wrapper">
                <input type="text" value={addrForm.nombre} onChange={e => { setAddrForm(p => ({ ...p, nombre: e.target.value })); setAddressErrors(p => ({ ...p, nombre: '' })); }} placeholder="Ej: Cristian Cardona" className={`gm-full-input ${addressErrors.nombre ? 'has-error' : ''}`} />
                {addrForm.nombre && <button type="button" onClick={() => setAddrForm(p => ({ ...p, nombre: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
              </div>
              {addressErrors.nombre && <p className="gm-full-error">⚠️ {addressErrors.nombre}</p>}
            </div>
            <div className="gm-full-field">
              <label className="gm-full-label"> <FaPhoneAlt size={12} /> Teléfono / WhatsApp <span className="gm-required">*</span> </label>
              <div className="gm-full-input-wrapper">
                <input type="tel" value={addrForm.telefono} onChange={e => { setAddrForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '') })); setAddressErrors(p => ({ ...p, telefono: '' })); }} placeholder="Ej: 3228977086" className={`gm-full-input ${addressErrors.telefono ? 'has-error' : ''}`} />
                {addrForm.telefono && <button type="button" onClick={() => setAddrForm(p => ({ ...p, telefono: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
              </div>
              {addressErrors.telefono && <p className="gm-full-error">⚠️ {addressErrors.telefono}</p>}
            </div>
          </div>
          <div className="gm-full-row">
            <div className="gm-full-field">
              <label className="gm-full-label"> <FaBuilding size={12} /> Departamento <span className="gm-required">*</span> </label>
              <div className="gm-full-input-wrapper">
                <input type="text" value={addrForm.departamento} onChange={e => { setAddrForm(p => ({ ...p, departamento: e.target.value })); setAddressErrors(p => ({ ...p, departamento: '' })); }} placeholder="Ej: Antioquia" className={`gm-full-input ${addressErrors.departamento ? 'has-error' : ''}`} />
                {addrForm.departamento && <button type="button" onClick={() => setAddrForm(p => ({ ...p, departamento: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
              </div>
              {addressErrors.departamento && <p className="gm-full-error">⚠️ {addressErrors.departamento}</p>}
            </div>
            <div className="gm-full-field">
              <label className="gm-full-label"> <FaCity size={12} /> Municipio / Ciudad <span className="gm-required">*</span> </label>
              <div className="gm-full-input-wrapper">
                <input type="text" value={addrForm.ciudad} onChange={e => { setAddrForm(p => ({ ...p, ciudad: e.target.value })); setAddressErrors(p => ({ ...p, ciudad: '' })); }} placeholder="Ej: Medellín" className={`gm-full-input ${addressErrors.ciudad ? 'has-error' : ''}`} />
                {addrForm.ciudad && <button type="button" onClick={() => setAddrForm(p => ({ ...p, ciudad: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
              </div>
              {addressErrors.ciudad && <p className="gm-full-error">⚠️ {addressErrors.ciudad}</p>}
            </div>
          </div>
          <div className="gm-full-field">
            <label className="gm-full-label"> <FaHome size={12} /> Dirección de entrega <span className="gm-required">*</span> </label>
            <div className="gm-full-input-wrapper">
              <input type="text" value={addrForm.direccion} onChange={e => { setAddrForm(p => ({ ...p, direccion: e.target.value })); setAddressErrors(p => ({ ...p, direccion: '' })); }} placeholder="Ej: Calle 77CC # 83-11, Apto 402" className={`gm-full-input ${addressErrors.direccion ? 'has-error' : ''}`} />
              {addrForm.direccion && <button type="button" onClick={() => setAddrForm(p => ({ ...p, direccion: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
            </div>
            {addressErrors.direccion && <p className="gm-full-error">⚠️ {addressErrors.direccion}</p>}
          </div>
          <div className="gm-full-field">
            <label className="gm-full-label"> <FaMapMarkerAlt size={12} /> Detalles de la fachada <span className="gm-required">*</span> </label>
            <div className="gm-full-input-wrapper">
              <input type="text" value={addrForm.fachada} onChange={e => { setAddrForm(p => ({ ...p, fachada: e.target.value })); setAddressErrors(p => ({ ...p, fachada: '' })); }} placeholder="Ej: Casa blanca de dos pisos..." className={`gm-full-input ${addressErrors.fachada ? 'has-error' : ''}`} />
              {addrForm.fachada && <button type="button" onClick={() => setAddrForm(p => ({ ...p, fachada: '' }))} className="gm-full-clear-btn"> <FaTimes size={12} /> </button>}
            </div>
            {addressErrors.fachada ? <p className="gm-full-error">⚠️ {addressErrors.fachada}</p> : <span className="gm-full-hint">Información clave para que el domiciliario ubique tu casa.</span>}
          </div>
          <div className="gm-full-inline-actions">
            <button type="button" onClick={handleResetAddressForm} className="gm-full-undo-btn"> <FaUndo size={14} /> <span>Restablecer</span> </button>
            <button onClick={() => { setShowAddressModal(false); setAddressErrors({}); }} className="gm-full-cancel-btn">Cancelar</button>
            <button onClick={handleSaveDetailedAddress} className="gm-full-save-btn"> <FaCheck size={14} /> Guardar dirección </button>
          </div>
        </div>
      </div>
    </div>
  );

  // === VISTA COMPLETA: DETALLES PRODUCTOS (MÓVIL) ===
  const renderProductsDetailView = () => (
    <div className="gm-full-view">
      <div className="gm-full-content">
        <div className="gm-full-header">
          <button onClick={() => setShowProductsDetailModal(false)} className="gm-full-back-btn">
            <FaArrowLeft size={16} /> <span>Volver</span>
          </button>
          <h2 className="gm-full-title"> <FaShoppingBag color="#F5C81B" size={18} /> Productos del pedido ({cartItems.length}) </h2>
          <div className="gm-full-spacer" />
        </div>
        <div className="gm-full-body">
          {cartItems.map((item, index) => {
            const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
            const price = gPP ? gPP(item) : (item.precio || 0);
            const qty = item.quantity || 1;
            const img = Array.isArray(item.imagenes) && item.imagenes[0] ? item.imagenes[0] : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');
            return (
              <div key={index} className="gm-checkout-product-card">
                <div className="gm-checkout-product-img-wrapper">
                  <img src={img} alt={name} className="gm-checkout-product-img" />
                </div>
                <div className="gm-checkout-product-details">
                  <h4 className="gm-checkout-product-name">{name}</h4>
                  <span className="gm-product-qty-badge">x{qty}</span>
                </div>
                <div className="gm-checkout-product-subtotal-block">
                  <span className="gm-checkout-product-subtotal-price">${Math.floor(price * qty).toLocaleString('es-CO')}</span>
                </div>
              </div>
            );
          })}
          <div className="gm-full-inline-total">
            <div className="gm-full-inline-total-row">
              <span className="gm-full-inline-total-label">Total</span>
              <strong className="gm-full-inline-total-value">${Math.floor(subtotal).toLocaleString('es-CO')}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showAddressModal && isMobileView) return renderAddressEditView();
  if (showProductsDetailModal && isMobileView) return renderProductsDetailView();

  return (
    <div className="gm-checkout-wrapper">
      <div className="gm-checkout-top-nav" style={{ marginBottom: '18px' }}>
        <div className="gm-checkout-breadcrumb">
          <span>Carrito</span> <span>›</span> <span style={{ color: '#F5C81B', fontWeight: '800' }}>Finalizar compra</span> <span>›</span> <span>Pagar</span> <span>›</span> <span>Pedido completo</span>
        </div>
      </div>
      <div className="gm-hero" style={{ background: 'transparent', borderRadius: '16px', overflow: 'hidden', marginBottom: '22px' }}>
        <div className="gm-hero-bg" style={{ background: `radial-gradient(circle at 25% 25%, rgba(255,215,0, 0.10), transparent 55%), linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.60) 50%, rgba(0,0,0,0.85) 100%), url("https://res.cloudinary.com/dm8696z6p/image/upload/v1740927653/Banner_3_1_d9o2ay.png")`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'saturate(1.05) contrast(1.02)' }} />
        <div className="gm-hero-fade-top" />
        <div className="gm-hero-fade-bottom" />
        <div className="gm-hero-inner">
          <h1 className="gm-hero-title gm-hero-title-smaller" style={{ color: '#fff', letterSpacing: '1px' }}>FINALIZAR COMPRA</h1>
          <p className="gm-hero-sub" style={{ color: '#cbd5e1' }}>Revisa tus datos de entrega y selecciona tu método de pago</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={onClose} className="gm-checkout-back-btn"><FaArrowLeft size={13} /><span className="gm-btn-label-full">Volver al carrito</span></button>
      </div>
      <div className="gm-checkout-layout">
        <div className="gm-checkout-main">
          <div className="gm-checkout-unified-card">
            {/* === SECCIÓN DIRECCIÓN === */}
            <section ref={addressSectionRef} className="gm-checkout-unified-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaMapMarkerAlt color="#FFC107" size={18} />
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff', display: 'inline-flex', alignItems: 'center' }}>Dirección de envío y contacto</h2>
                </div>
                <button onClick={() => setShowAddressModal(true)} className="gm-checkout-edit-btn"><FaEdit size={12} /><span className="gm-edit-btn-text">Editar datos</span></button>
              </div>
              {addressError && <div className="gm-alert-error">⚠️ {addressError}</div>}
              {phoneError && <div className="gm-alert-error">⚠️ {phoneError}</div>}
              <div className="gm-checkout-info-grid-3">
                <div className="gm-checkout-info-item">
                  <label className="gm-checkout-info-label">Correo electrónico</label>
                  <div className="gm-checkout-info-value">{addrForm.email || user?.correo || user?.email || '—'}</div>
                </div>
                <div className="gm-checkout-info-item">
                  <label className="gm-checkout-info-label">Nombre del destinatario</label>
                  <div className="gm-checkout-info-value">{addrForm.nombre || user?.nombre || user?.nombreCompleto || '—'}</div>
                </div>
                <div className="gm-checkout-info-item">
                  <label className="gm-checkout-info-label">Teléfono</label>
                  <div className="gm-checkout-info-value">{addrForm.telefono || phone || '—'}</div>
                </div>
              </div>
              <div className="gm-checkout-info-grid" style={{ gridTemplateColumns: '1fr', gap: '8px', marginTop: '12px' }}>
                <div className="gm-checkout-info-item">
                  <label className="gm-checkout-info-label">Dirección de entrega</label>
                  <div className="gm-checkout-info-value">{isPickup ? 'Retiro en punto físico GM CAPS' : (addrForm.direccion || address || '—')}</div>
                </div>
              </div>
              {editSuccessAlert && <div className="gm-alert-success"><FaCheckCircle size={13} /> Información editada con éxito</div>}
            </section>

            {/* === SECCIÓN PRODUCTOS === */}
            <section className="gm-checkout-unified-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaShoppingBag color="#FFC107" size={18} />
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>Productos del pedido ({cartItems.length})</h2>
                </div>
                <button type="button" onClick={() => setShowProductsDetailModal(true)} className="gm-checkout-edit-btn gm-products-btn-desktop-only"><FaEye size={12} /><span className="gm-edit-btn-text">Ver detalles</span></button>
              </div>
              <div className="gm-checkout-products-row-wrapper gm-products-desktop-only" style={{ background: 'transparent', border: 'none', padding: '2px 0', boxShadow: 'none' }}>
                <div className="gm-checkout-products-row" style={{ gap: '10px' }}>
                  {cartItems.map((item, index) => {
                    const qty = item.quantity || 1;
                    const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
                    const img = Array.isArray(item.imagenes) && item.imagenes[0] ? item.imagenes[0] : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');
                    return (
                      <div key={index} className="gm-checkout-product-thumb-card" onClick={() => setExpandedProductImage(img)} title={`${name} (x${qty})`}>
                        <img src={img} alt={name} className="gm-checkout-product-thumb-img" />
                        <span className="gm-checkout-thumb-qty-badge">x{qty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* === SECCIÓN TIPO DE ENVÍO === */}
            <section ref={deliverySectionRef} className={`gm-checkout-unified-section ${deliveryTypeError ? 'gm-shipping-error-banner' : ''}`} style={{ border: deliveryTypeError ? '1.5px solid #ff4d4d' : undefined }}>
              <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><FaTruck color="#F5C81B" size={16} /> Seleccione tipo de envío</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[['envio', 'Envío a domicilio (urbano)', 'Entrega directa a tu dirección registrada', 'Por coordinar'], ['nacional', 'Envío nacional (intermunicipal)', 'Despacho por transportadora a cualquier ciudad', 'Por coordinar'], ['recoger', 'Recoger en tienda física', 'Retira personalmente tu paquete sin ningún costo', 'GRATIS']].map(([type, title, desc, price]) => (
                  <label key={type} onClick={() => { setDeliveryType(type); setDeliveryTypeError(''); if (type === 'recoger') setAddressError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: deliveryType === type ? 'rgba(255, 255, 255, 0.04)' : '#070b14', border: '1px solid rgba(255, 255, 255, 0.06)', borderLeft: deliveryType === type ? '4px solid #F5C81B' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryType === type ? '5px solid #F5C81B' : '2px solid #64748b', background: '#000', boxSizing: 'border-box' }} />
                      <div><strong style={{ fontSize: '13px', color: '#fff', display: 'block', textTransform: 'capitalize' }}>{title}</strong><span style={{ fontSize: '11px', color: '#94a3b8' }}>{desc}</span></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>{price}</span>
                  </label>
                ))}
              </div>
              {deliveryTypeError && <p style={{ color: '#ff4d4d', fontSize: '13px', fontWeight: '800', margin: '12px 0 0 0' }}>⚠️ {deliveryTypeError}</p>}
            </section>

            {/* === SECCIÓN FORMA DE PAGO === */}
            <section id="seccion-formas-de-pago" ref={paymentSectionRef} className="gm-checkout-unified-section gm-checkout-unified-section-last">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><FaReceipt color="#F5C81B" /> Forma de pago</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} onClick={() => { setSelectedMethod(m.id); setMethodError(''); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '10px', background: selectedMethod === m.id ? 'rgba(255, 255, 255, 0.04)' : '#070b14', border: '1px solid rgba(255, 255, 255, 0.06)', borderLeft: selectedMethod === m.id ? '4px solid #F5C81B' : '4px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === m.id ? '5px solid #F5C81B' : '2px solid #64748b', background: '#000', boxSizing: 'border-box' }} />
                      <img src={m.img} alt={m.name} style={{ height: '28px', maxWidth: '75px', objectFit: 'contain', borderRadius: '4px' }} />
                      <span style={{ fontSize: '14px', fontWeight: '800', color: selectedMethod === m.id ? '#F5C81B' : '#fff' }}>{m.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: selectedMethod === m.id ? '#F5C81B' : '#94a3b8', fontWeight: '700', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '4px' }}>{m.badge}</span>
                  </label>
                ))}
              </div>
              {methodError && <p style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: '700', margin: '-10px 0 16px 0' }}>⚠️ {methodError}</p>}
              {(selectedMethod === 'nequi' || selectedMethod === 'bancolombia') && currentMethod && (
                <div style={{ padding: '22px', background: '#070b14', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '800', margin: '0 0 10px 0' }}>Escanea el QR de {currentMethod.name}</p>
                    <div style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }} onClick={() => setIsQrExpanded(true)}>
                      <img src={currentMethod.qr} alt="QR" style={{ width: '150px', height: '150px', objectFit: 'contain', background: '#fff', padding: '6px', borderRadius: '10px', border: '2px solid #F5C81B' }} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', color: '#F5C81B', padding: '6px', borderRadius: '50%', display: 'flex' }}><FaSearchPlus size={12} /></div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Clic en el QR para ampliar</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Comprobante de pago<span style={{ color: '#ff4d4d' }}>*</span></label>
                    <div style={{ minHeight: '150px', border: fileError ? '2px dashed #ff4d4d' : (!receiptFile ? '1.5px dashed rgba(245, 200, 27, 0.4)' : '2px solid #10B981'), borderRadius: '10px', background: receiptFile ? '#000' : 'rgba(255, 255, 255, 0.02)', padding: receiptFile ? '0' : '16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                      {!receiptFile && <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setReceiptFile(e.target.files[0]); setFileError(''); } }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />}
                      {!receiptFile ? (<div style={{ pointerEvents: 'none' }}><FaReceipt size={26} color="#F5C81B" style={{ marginBottom: '6px' }} /><p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>Adjuntar comprobante</p><span style={{ fontSize: '11px', color: '#F5C81B', background: 'rgba(245, 200, 27, 0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>Seleccionar imagen</span></div>) : (<><button onClick={e => { e.stopPropagation(); setShowRemoveReceiptConfirm(true); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', padding: '6px', cursor: 'pointer', zIndex: 20 }}><FaTrash size={12} /></button><img src={URL.createObjectURL(receiptFile)} alt="Comprobante" onClick={() => setIsReceiptExpanded(true)} style={{ width: '100%', height: '150px', objectFit: 'contain', cursor: 'zoom-in' }} /><div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}><FaCheckCircle color="#10B981" size={10} /><span style={{ color: '#10B981', fontSize: '9px', fontWeight: 'bold' }}>Subido</span></div></>)}
                    </div>
                    {fileError ? <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '700' }}>⚠️ {fileError}</p> : (!receiptFile && <p style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0 0 0' }}>El comprobante es obligatorio.</p>)}
                  </div>
                </div>
              )}
              {selectedMethod === 'bold' && (
                <div style={{ padding: '22px', background: '#070b14', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <img src={currentMethod.img} alt="Bold" style={{ height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: 0, lineHeight: '1.4' }}>Paga mediante la pasarela segura oficial de Bold</p>
                    <a href={currentMethod.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 20px', background: '#F5C81B', color: '#000', fontWeight: '800', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', boxShadow: '0 4px 14px rgba(245, 200, 27, 0.3)' }}>Abrir pasarela Bold<FaExternalLinkAlt size={11} /></a>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>Comprobante Bold<span style={{ color: '#ff4d4d' }}>*</span></label>
                    <div style={{ minHeight: '150px', border: fileError ? '2px dashed #ff4d4d' : (!receiptFile ? '1.5px dashed rgba(245, 200, 27, 0.4)' : '2px solid #10B981'), borderRadius: '10px', background: receiptFile ? '#000' : 'rgba(255, 255, 255, 0.02)', padding: receiptFile ? '0' : '16px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                      {!receiptFile && <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setReceiptFile(e.target.files[0]); setFileError(''); } }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />}
                      {!receiptFile ? (<div style={{ pointerEvents: 'none' }}><FaReceipt size={26} color="#F5C81B" style={{ marginBottom: '6px' }} /><p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>Adjuntar soporte</p><span style={{ fontSize: '11px', color: '#F5C81B', background: 'rgba(245, 200, 27, 0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: '700' }}>Seleccionar imagen</span></div>) : (<><button onClick={e => { e.stopPropagation(); setShowRemoveReceiptConfirm(true); }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '6px', padding: '6px', cursor: 'pointer', zIndex: 20 }}><FaTrash size={12} /></button><img src={URL.createObjectURL(receiptFile)} alt="Comprobante" onClick={() => setIsReceiptExpanded(true)} style={{ width: '100%', height: '150px', objectFit: 'contain', cursor: 'zoom-in' }} /><div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}><FaCheckCircle color="#10B981" size={10} /><span style={{ color: '#10B981', fontSize: '9px', fontWeight: 'bold' }}>Subido</span></div></>)}
                    </div>
                    {fileError ? <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '700' }}>⚠️ {fileError}</p> : (!receiptFile && <p style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0 0 0' }}>El soporte es necesario.</p>)}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* === SIDEBAR RESUMEN === */}
        <div className="gm-checkout-sidebar">
          <div className="gm-checkout-summary-box">
            <h2 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '900', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>Resumen del pedido</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Precio al por menor:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>${Math.floor(financials.retailSubtotal).toLocaleString('es-CO')}</span>
              </div>
              {isVentaNormal && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    Venta normal
                    <span className="gm-venta-normal-badge">Sin descuento</span>
                  </span>
                </div>
              )}
              {financials.hasOffer && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171', fontWeight: '700' }}>
                  <span>Promociones</span>
                  <span>-${Math.floor(financials.offerDiscount).toLocaleString('es-CO')}</span>
                </div>
              )}
              {financials.hasWholesale && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: '#f87171', fontWeight: '700' }}>
                  <div>
                    <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      Descuento al por mayor
                      {discountLabel && <span className="gm-discount-badge">{discountLabel}</span>}
                    </span>
                    <span className="gm-discount-detail">(Queda en: ${Math.floor(financials.wholesaleResult).toLocaleString('es-CO')})</span>
                  </div>
                  <span>-${Math.floor(financials.wholesaleDiscount).toLocaleString('es-CO')}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '15px', color: '#fff' }}>Total del pedido:</strong>
                <strong style={{ fontSize: '22px', color: '#F5C81B', fontWeight: '900' }}>${Math.floor(total).toLocaleString('es-CO')}</strong>
              </div>
            </div>
            <button onClick={handleProceedToConfirm} disabled={isProcessing} style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#F5C81B', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '900', fontSize: '15px', cursor: isProcessing ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(245, 200, 27, 0.4)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{isProcessing ? 'Procesando...' : 'Confirmar'}</button>
          </div>
          <div style={{ background: '#0d1527', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '11px', color: '#94a3b8' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}><FaShieldAlt color="#10B981" size={16} style={{ flexShrink: 0, marginTop: '2px' }} /><div><strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>Seguridad de pago</strong><span>Tus pagos son validados de forma directa y protegida.</span></div></div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}><FaTruck color="#F5C81B" size={16} style={{ flexShrink: 0, marginTop: '2px' }} /><div><strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>Garantía de envío</strong><span>Despachamos con número de guía y seguimiento.</span></div></div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}><FaHeadset color="#38bdf8" size={16} style={{ flexShrink: 0, marginTop: '2px' }} /><div><strong style={{ color: '#fff', fontSize: '12px', display: 'block' }}>Atención al cliente</strong><span>Cualquier inquietud será atendida por nuestro canal oficial.</span></div></div>
          </div>
        </div>
      </div>

      <a href="https://wa.me/573228977086?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido" target="_blank" rel="noopener noreferrer" className="gm-whatsapp-float" title="Contactar asesor"><FaWhatsapp size={28} /></a>

      {/* === MODAL CONFIRMAR COMPRA === */}
      {showConfirmModal && (
        <div className="gm-modal-overlay-responsive" onClick={e => e.stopPropagation()}>
          <div className="gm-modal-dialog-responsive" onClick={e => e.stopPropagation()} style={{ border: '1.5px solid #F5C81B', maxWidth: '480px', maxHeight: '88vh', overflowY: 'auto', padding: '24px 20px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#F5C81B', textAlign: 'center' }}>Confirmar compra</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', textAlign: 'center' }}>Revisa el resumen de tu pedido de <strong>{cartItems.length} artículo(s)</strong>:</p>
            <div style={{ background: '#070b14', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Cliente:</span><span style={{ color: '#fff', fontWeight: '700', textAlign: 'right' }}>{addrForm.nombre || user?.nombre || 'Cliente'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Forma de pago:</span><span style={{ color: '#fff', fontWeight: '700', textAlign: 'right' }}>{currentMethod?.name || 'Por elegir'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Entrega:</span><span style={{ color: '#fff', fontWeight: '700', textAlign: 'right' }}>{shippingText}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Dirección:</span><span style={{ color: '#fff', fontWeight: '600', textAlign: 'right' }}>{isPickup ? 'Recogida en local' : (address || 'Sin dirección')}</span></div>
              {financials.hasOffer && <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: '#f87171' }}><span style={{ fontWeight: '600' }}>Promociones:</span><span style={{ fontWeight: '700' }}>-${Math.floor(financials.offerDiscount).toLocaleString('es-CO')}</span></div>}
              {financials.hasWholesale && <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: '#38bdf8' }}><span style={{ fontWeight: '600' }}>Descuento por mayor {discountLabel && `(${discountLabel})`}:</span><span style={{ fontWeight: '700' }}>-${Math.floor(financials.wholesaleDiscount).toLocaleString('es-CO')}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}><span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Total a pagar:</span><strong style={{ color: '#F5C81B', fontSize: '18px', fontWeight: '800' }}>${Math.floor(total).toLocaleString('es-CO')}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
              <button onClick={() => setShowConfirmModal(false)} className="gm-btn gm-btn-cancel">Volver</button>
              <button onClick={() => { if (isPickup) { setShowConfirmModal(false); onConfirm(); } else { setShowConfirmModal(false); setShowAddressConfirmPrompt(true); } }} disabled={isProcessing} className="gm-btn gm-btn-primary" style={{ opacity: isProcessing ? 0.7 : 1 }}>{isProcessing ? 'Enviando...' : 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}

      {showAddressConfirmPrompt && (
        <div className="gm-modal-overlay-responsive" onClick={e => e.stopPropagation()}>
          <div className="gm-modal-dialog-responsive" onClick={e => e.stopPropagation()} style={{ border: '1.5px solid #F5C81B', maxWidth: '460px', padding: '24px 20px' }}>
            <div style={{ textAlign: 'center' }}><h3 style={{ margin: '0 0 6px 0', fontSize: '19px', fontWeight: '800', color: '#F5C81B' }}>¿Estás seguro de tu dirección?</h3><p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>Verifica los datos antes de procesar tu orden:</p></div>
            <div style={{ background: '#070b14', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Destinatario:</span><span style={{ color: '#fff', fontWeight: '700', textAlign: 'right' }}>{addrForm.nombre || 'Cliente'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Teléfono:</span><span style={{ color: '#fff', fontWeight: '700', textAlign: 'right' }}>{addrForm.telefono || phone}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Dirección:</span><span style={{ color: '#F5C81B', fontWeight: '700', textAlign: 'right' }}>{address || 'Sin dirección'}</span></div>
              {addrForm.fachada && <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}><span style={{ color: '#94a3b8' }}>Indicaciones:</span><span style={{ color: '#cbd5e1', fontSize: '12px', textAlign: 'right' }}>{addrForm.fachada}</span></div>}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button type="button" onClick={() => { setShowAddressConfirmPrompt(false); setShowAddressModal(true); }} className="gm-btn gm-btn-cancel">Cambiar dirección</button>
              <button type="button" onClick={() => { setShowAddressConfirmPrompt(false); onConfirm(); }} disabled={isProcessing} className="gm-btn gm-btn-primary">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {editSuccessAlert && <div className="gm-toast-success"><FaCheckCircle color="#10B981" size={18} /><span>Dirección cambiada con éxito</span></div>}

      {/* === MODAL PRODUCTOS (DESKTOP) === */}
      {showProductsDetailModal && !isMobileView && (
        <div className="gm-modal-overlay-responsive gm-modal-overlay-no-close">
          <div className="gm-modal-dialog-responsive" onClick={e => e.stopPropagation()} style={{ border: '1.5px solid rgba(245, 200, 27, 0.3)' }}>
            <div className="gm-modal-header">
              <div className="gm-modal-title">
                <FaShoppingBag color="#FFC107" size={15} />
                <span style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>Productos del pedido ({cartItems.length})</span>
              </div>
              <button onClick={() => setShowProductsDetailModal(false)} className="gm-modal-close-btn"><FaTimes /></button>
            </div>
            <div className="gm-modal-body" style={{ padding: '0' }}>
              {cartItems.map((item, index) => {
                const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
                const price = gPP ? gPP(item) : (item.precio || 0);
                const qty = item.quantity || 1;
                const img = Array.isArray(item.imagenes) && item.imagenes[0] ? item.imagenes[0] : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');
                return (
                  <div key={index} className="gm-checkout-product-card">
                    <div className="gm-checkout-product-img-wrapper">
                      <img src={img} alt={name} className="gm-checkout-product-img" />
                    </div>
                    <div className="gm-checkout-product-details">
                      <h4 className="gm-checkout-product-name">{name}</h4>
                      <span className="gm-product-qty-badge">x{qty}</span>
                    </div>
                    <div className="gm-checkout-product-subtotal-block">
                      <span className="gm-checkout-product-subtotal-price">${Math.floor(price * qty).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="gm-modal-footer">
              <div className="gm-modal-total-row">
                <span className="gm-modal-total-label">Total</span>
                <strong className="gm-modal-total-value">${Math.floor(subtotal).toLocaleString('es-CO')}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDetailProduct && (
        <div className="gm-modal-overlay" onClick={() => setSelectedDetailProduct(null)}>
          <div className="gm-zoomed-container" onClick={e => e.stopPropagation()} style={{ background: '#1E293B', borderRadius: '16px', maxWidth: '420px', border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden' }}>
            <button onClick={() => setSelectedDetailProduct(null)} className="gm-zoomed-btn"><FaTimes /></button>
            <img src={Array.isArray(selectedDetailProduct.imagenes) && selectedDetailProduct.imagenes[0] ? selectedDetailProduct.imagenes[0] : selectedDetailProduct.imagen || 'https://placehold.co/300x300?text=Gorra'} alt={selectedDetailProduct.nombre} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h2 style={{ color: '#F5C81B', fontSize: '18px', fontWeight: 'bold', margin: '0 0 12px 0' }}>{selectedDetailProduct.nombre}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: '#CBD5E1', background: 'rgba(51, 65, 85, 0.7)', padding: '3px 8px', borderRadius: '6px' }}>Talla: {selectedDetailProduct.talla || 'Única'}</span>
                <span style={{ fontSize: '11px', color: '#CBD5E1', background: 'rgba(51, 65, 85, 0.7)', padding: '3px 8px', borderRadius: '6px' }}>Cantidad: {selectedDetailProduct.quantity || 1}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Precio unitario:</span>
                <span style={{ color: '#F5C81B', fontSize: '18px', fontWeight: 'bold' }}>${Math.floor(selectedDetailProduct.precio || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DIRECCIÓN (DESKTOP) === */}
      {showAddressModal && !isMobileView && (
        <div className="gm-modal-overlay-responsive gm-address-modal-overlay" onClick={e => e.stopPropagation()}>
          <div className="gm-modal-dialog-responsive gm-address-modal-dialog" onClick={e => e.stopPropagation()} style={{ maxHeight: 'none', overflow: 'visible' }}>
            <div className="gm-modal-header">
              <div className="gm-modal-title">
                <FaMapMarkerAlt color="#F5C81B" size={20} />
                <span style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>Dirección de envío y contacto</span>
              </div>
              <button onClick={() => { setShowAddressModal(false); setAddressErrors({}); }} className="gm-modal-close-btn"><FaTimes /></button>
            </div>
            <div className="gm-form-content">
              <div className="gm-form-grid gm-form-grid-3">
                <div>
                  <label className="gm-form-label">Correo electrónico</label>
                  <div className="gm-form-input-wrapper">
                    <input type="email" value={addrForm.email} onChange={e => { setAddrForm(p => ({ ...p, email: e.target.value })); setAddressErrors(p => ({ ...p, email: '' })); }} placeholder="cliente@correo.com" className={`gm-form-input ${addressErrors.email ? 'has-error' : ''}`} />
                    {addrForm.email && <button type="button" onClick={() => setAddrForm(p => ({ ...p, email: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.email && <p className="gm-form-error">️ {addressErrors.email}</p>}
                </div>
                <div>
                  <label className="gm-form-label">Nombre del destinatario*</label>
                  <div className="gm-form-input-wrapper">
                    <input type="text" value={addrForm.nombre} onChange={e => { setAddrForm(p => ({ ...p, nombre: e.target.value })); setAddressErrors(p => ({ ...p, nombre: '' })); }} placeholder="Ej: Cristian Cardona" className={`gm-form-input ${addressErrors.nombre ? 'has-error' : ''}`} />
                    {addrForm.nombre && <button type="button" onClick={() => setAddrForm(p => ({ ...p, nombre: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.nombre && <p className="gm-form-error">⚠️ {addressErrors.nombre}</p>}
                </div>
                <div>
                  <label className="gm-form-label">Teléfono / WhatsApp*</label>
                  <div className="gm-form-input-wrapper">
                    <input type="tel" value={addrForm.telefono} onChange={e => { setAddrForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '') })); setAddressErrors(p => ({ ...p, telefono: '' })); }} placeholder="Ej: 3228977086" className={`gm-form-input ${addressErrors.telefono ? 'has-error' : ''}`} />
                    {addrForm.telefono && <button type="button" onClick={() => setAddrForm(p => ({ ...p, telefono: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.telefono && <p className="gm-form-error">️ {addressErrors.telefono}</p>}
                </div>
              </div>
              <div className="gm-form-grid gm-form-grid-location">
                <div>
                  <label className="gm-form-label">Departamento</label>
                  <div className="gm-form-input-wrapper">
                    <input type="text" value={addrForm.departamento} onChange={e => { setAddrForm(p => ({ ...p, departamento: e.target.value })); setAddressErrors(p => ({ ...p, departamento: '' })); }} placeholder="Ej: Antioquia" className={`gm-form-input ${addressErrors.departamento ? 'has-error' : ''}`} />
                    {addrForm.departamento && <button type="button" onClick={() => setAddrForm(p => ({ ...p, departamento: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.departamento && <p className="gm-form-error">️ {addressErrors.departamento}</p>}
                </div>
                <div>
                  <label className="gm-form-label">Municipio / Ciudad*</label>
                  <div className="gm-form-input-wrapper">
                    <input type="text" value={addrForm.ciudad} onChange={e => { setAddrForm(p => ({ ...p, ciudad: e.target.value })); setAddressErrors(p => ({ ...p, ciudad: '' })); }} placeholder="Ej: Medellín" className={`gm-form-input ${addressErrors.ciudad ? 'has-error' : ''}`} />
                    {addrForm.ciudad && <button type="button" onClick={() => setAddrForm(p => ({ ...p, ciudad: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.ciudad && <p className="gm-form-error">⚠️ {addressErrors.ciudad}</p>}
                </div>
                <div>
                  <label className="gm-form-label">Ubicación*</label>
                  <div className="gm-location-badge">Colombia 🇨</div>
                </div>
              </div>
              <div>
                <label className="gm-form-label">Dirección de entrega</label>
                <div className="gm-form-input-wrapper">
                  <input type="text" value={addrForm.direccion} onChange={e => { setAddrForm(p => ({ ...p, direccion: e.target.value })); setAddressErrors(p => ({ ...p, direccion: '' })); }} placeholder="Ej: Calle 77CC # 83-11, Apto 402" className={`gm-form-input ${addressErrors.direccion ? 'has-error' : ''}`} />
                  {addrForm.direccion && <button type="button" onClick={() => setAddrForm(p => ({ ...p, direccion: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                </div>
                {addressErrors.direccion && <p className="gm-form-error">⚠️ {addressErrors.direccion}</p>}
              </div>
              <div className="gm-form-grid gm-form-grid-2">
                <div>
                  <label className="gm-form-label">Detalles de la fachada</label>
                  <div className="gm-form-input-wrapper">
                    <input type="text" value={addrForm.fachada} onChange={e => { setAddrForm(p => ({ ...p, fachada: e.target.value })); setAddressErrors(p => ({ ...p, fachada: '' })); }} placeholder="Ej: Casa blanca de dos pisos..." className={`gm-form-input ${addressErrors.fachada ? 'has-error' : ''}`} />
                    {addrForm.fachada && <button type="button" onClick={() => setAddrForm(p => ({ ...p, fachada: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.fachada ? <p className="gm-form-error">⚠️ {addressErrors.fachada}</p> : <span className="gm-form-hint">Información clave para que el domiciliario ubique tu casa.</span>}
                </div>
                <div>
                  <label className="gm-form-label">Teléfono de contacto</label>
                  <div className="gm-form-input-wrapper">
                    <input type="tel" value={addrForm.telefono} onChange={e => { setAddrForm(p => ({ ...p, telefono: e.target.value.replace(/\D/g, '') })); setAddressErrors(p => ({ ...p, telefono: '' })); }} placeholder="Ej: 3228977086" className={`gm-form-input ${addressErrors.telefono ? 'has-error' : ''}`} />
                    {addrForm.telefono && <button type="button" onClick={() => setAddrForm(p => ({ ...p, telefono: '' }))} className="gm-form-clear-btn"><FaTimes size={10} /></button>}
                  </div>
                  {addressErrors.telefono && <p className="gm-form-error">⚠️ {addressErrors.telefono}</p>}
                </div>
              </div>
            </div>
            <div className="gm-modal-footer" style={{ background: 'rgba(0, 0, 0, 0.35)' }}>
              <button type="button" onClick={handleResetAddressForm} className="gm-btn gm-btn-cancel" style={{ padding: '6px 12px', fontSize: '11.5px' }}><FaUndo size={11} /> Restablecer</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowAddressModal(false); setAddressErrors({}); }} className="gm-btn gm-btn-cancel">Cancelar</button>
                <button onClick={handleSaveDetailedAddress} className="gm-btn gm-btn-primary">Guardar dirección ✓</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {expandedProductImage && (
        <div className="gm-modal-overlay gm-modal-overlay-no-close">
          <div className="gm-zoomed-container" onClick={e => e.stopPropagation()}>
            <button onClick={() => setExpandedProductImage(null)} className="gm-zoomed-btn"><FaTimes /></button>
            <img src={expandedProductImage} alt="Gorra ampliada" className="gm-zoomed-image" style={{ background: 'transparent', padding: 0 }} />
          </div>
        </div>
      )}

      {isQrExpanded && currentMethod?.qr && (
        <div className="gm-modal-overlay" onClick={() => setIsQrExpanded(false)}>
          <div className="gm-zoomed-container" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsQrExpanded(false)} className="gm-zoomed-btn"><FaTimes /></button>
            <img src={currentMethod.qr} alt="QR Ampliado" className="gm-zoomed-image" />
            <p className="gm-zoomed-text">Código QR oficial de {currentMethod?.name}</p>
          </div>
        </div>
      )}

      {isReceiptExpanded && receiptFile && (
        <div className="gm-modal-overlay" onClick={() => setIsReceiptExpanded(false)}>
          <div className="gm-zoomed-container" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsReceiptExpanded(false)} className="gm-zoomed-btn success"><FaTimes /></button>
            <img src={URL.createObjectURL(receiptFile)} alt="Comprobante Ampliado" className="gm-zoomed-image" />
            <p className="gm-zoomed-text success">Comprobante de pago adjuntado</p>
          </div>
        </div>
      )}

      {showRemoveReceiptConfirm && (
        <div className="gm-modal-overlay" onClick={() => setShowRemoveReceiptConfirm(false)}>
          <div className="gm-modal-dialog" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: 0 }}>¿Quitar comprobante?</h3>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>¿Deseas eliminar la captura actual? Tendrás que subir una nueva.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
              <button onClick={() => setShowRemoveReceiptConfirm(false)} className="gm-btn gm-btn-cancel">Cancelar</button>
              <button onClick={() => { setReceiptFile(null); setFileError(''); setShowRemoveReceiptConfirm(false); }} className="gm-btn gm-btn-danger">Sí, quitar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutModal;