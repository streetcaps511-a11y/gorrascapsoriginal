/* eslint-disable react-refresh/only-export-components */
/* === VISTA COMPLETA DE CHECKOUT (INTEGRADA CON HEADER Y FOOTER DEL SITIO) === 
   - Se muestra dentro del flujo normal con el Header y Footer de Inicio
   - Botón "Volver al carrito" en el cuerpo de la página
   - Dirección de envío en modo visualización ("solo ver") con botón para editar
   - Información sencilla arriba para indicar deslizar a métodos de pago
   - Forma de pago más suelta sin bordes amarillos pesados ni encerrados
   - Botón flotante y enlace de ayuda por WhatsApp
   - Modal de confirmación final antes de procesar la compra */

import React, { useState, useEffect, useRef } from 'react';
import '../styles/CheckoutModal.css';
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
  FaChevronDown,
  FaShoppingBag,
  FaHeadset,
  FaCheck,
  FaEdit,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPhoneAlt
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
  // Modal de edición detallada de dirección (Estilo SHEIN con campos de fachada)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editSuccessAlert, setEditSuccessAlert] = useState(false);
  const [expandedProductImage, setExpandedProductImage] = useState(null);
  const [addrForm, setAddrForm] = useState({
    nombre: user?.nombre || user?.nombreCompleto || 'Cliente',
    telefono: phone || '',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: address || '',
    barrio: '',
    fachada: '' // Campo adicional de fachada / color de casa / indicaciones
  });

  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryTypeError, setDeliveryTypeError] = useState('');
  const [methodError, setMethodError] = useState('');
  const [fileError, setFileError] = useState('');
  
  const [isQrExpanded, setIsQrExpanded] = useState(false);
  const [isReceiptExpanded, setIsReceiptExpanded] = useState(false);
  const [showRemoveReceiptConfirm, setShowRemoveReceiptConfirm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProductsDetailModal, setShowProductsDetailModal] = useState(false);
  
  const paymentSectionRef = useRef(null);
  const deliverySectionRef = useRef(null);

  // Sincronizar campos temporales con las props
  useEffect(() => {
    if (address) {
      setAddrForm(prev => ({ ...prev, direccion: address }));
    }
    if (phone) {
      setAddrForm(prev => ({ ...prev, telefono: phone }));
    }
  }, [address, phone]);

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

  // Guardar dirección detallada desde el modal
  const handleSaveDetailedAddress = () => {
    setAddressError('');
    setPhoneError('');
    const dir = (addrForm.direccion || '').trim();
    const tel = (addrForm.telefono || '').toString().trim();

    if (!dir) {
      setAddressError('La dirección de entrega es obligatoria');
      return;
    }
    if (!tel || tel.length < 7) {
      setPhoneError('Ingrese un número de teléfono válido');
      return;
    }

    const parts = [
      dir,
      addrForm.barrio ? `Barrio ${addrForm.barrio.trim()}` : null,
      addrForm.fachada ? `(Fachada: ${addrForm.fachada.trim()})` : null
    ].filter(Boolean);

    const fullAddr = parts.join(' - ');
    setAddress(fullAddr);
    setPhone(tel);
    setShowAddressModal(false);
    setEditSuccessAlert(true);
    setTimeout(() => setEditSuccessAlert(false), 3500);
  };

  // Validaciones antes de mostrar el modal de confirmación
  const handleProceedToConfirm = () => {
    setAddressError('');
    setPhoneError('');
    setDeliveryTypeError('');
    setMethodError('');
    setFileError('');

    // 1. Validar que se haya seleccionado un tipo de envío
    if (!deliveryType) {
      setDeliveryTypeError('Debes seleccionar un tipo de envío para continuar');
      if (deliverySectionRef.current) {
        deliverySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 2. Si falta dirección y requiere envío urbano o nacional
    if ((isDelivery || isNacional) && (!address || !address.trim())) {
      setShowAddressModal(true);
      setAddressError('Por favor registra tu dirección de entrega');
      return;
    }

    // 3. Si falta teléfono
    if (!phone || !String(phone).trim()) {
      setShowAddressModal(true);
      setPhoneError('Por favor registra tu teléfono de contacto');
      return;
    }

    // 4. Si falta método de pago
    if (!selectedMethod) {
      setMethodError('Por favor selecciona un método de pago');
      scrollToPayment();
      return;
    }

    // 5. Si falta comprobante para métodos con pago previo
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

  return (
    <div className="gm-checkout-wrapper">
      
      {/* 1. BARRA SUPERIOR DE NAVEGACIÓN (Volver al Carrito + Breadcrumbs) */}
      <div className="gm-checkout-top-nav">
        <button 
          onClick={onClose} 
          style={{
            background: 'transparent',
            border: 'none',
            color: '#F5C81B',
            padding: '6px 0',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          type="button"
        >
          <FaArrowLeft size={12} /> Volver al carrito
        </button>

        {/* Breadcrumbs estilo SHEIN */}
        <div className="gm-checkout-breadcrumb" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <span>Carrito</span>
          <span>&gt;</span>
          <span style={{ color: '#F5C81B', fontWeight: '800' }}>Procede al pago</span>
          <span>&gt;</span>
          <span>Pagar</span>
          <span>&gt;</span>
          <span>Pedido completo</span>
        </div>
      </div>

      {/* 2. INFORMACIÓN SENCILLA: DESLIZAR A MÉTODOS DE PAGO */}
      <div 
        onClick={scrollToPayment}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#94a3b8',
          fontSize: '12px',
          cursor: 'pointer',
          marginBottom: '18px',
          userSelect: 'none'
        }}
      >
        <span>👇</span>
        <span>Desliza para ver los métodos de pago y subir comprobante</span>
      </div>

      {/* 3. LAYOUT PRINCIPAL DE CHECKOUT (Columna de datos + Resumen fijo) */}
      <div className="gm-checkout-layout">

        {/* ===== COLUMNA IZQUIERDA: FLUJO COMPLETO ===== */}
        <div className="gm-checkout-main">
          
          {/* SECCIÓN A: DIRECCIÓN DE ENVÍO (MODO "SOLO EN VER" SIN CAJAS SATURADAS) */}
          <section style={{
            background: '#0d1527',
            borderRadius: '10px',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: '900',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaMapMarkerAlt color="#F5C81B" size={15} /> Dirección De Envío y Contacto
              </h2>

              <button 
                onClick={() => setShowAddressModal(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(245, 200, 27, 0.4)',
                  color: '#F5C81B',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                type="button"
              >
                <FaEdit size={12} /> Editar dirección
              </button>
            </div>

            {/* MODO "SOLO VER" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <strong style={{ color: '#fff', fontSize: '14px' }}>
                  {addrForm.nombre || user?.nombre || user?.nombreCompleto || 'Cliente Registrado'}
                </strong>
                <span style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '700' }}>
                  {phone ? `📞 ${phone}` : '⚠️ Sin teléfono'}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {isPickup ? 'Retiro en Tienda' : (isNacional ? 'Envío Nacional' : 'Dirección Predeterminada')}
                </span>
              </div>

              <p style={{ margin: '2px 0 0 0', color: '#cbd5e1', fontSize: '13px' }}>
                {isPickup 
                  ? '🏪 Retiro en punto físico de Gorras Caps Original' 
                  : (address ? `📍 ${address}` : '⚠️ No has ingresado dirección de entrega')}
              </p>

              {addrForm.fachada && (
                <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>
                  🏠 <strong>Detalles de entrega:</strong> {addrForm.fachada}
                </p>
              )}

              {editSuccessAlert && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '6px',
                  color: '#10B981',
                  fontSize: '12px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaCheckCircle size={13} /> Información editada con éxito
                </div>
              )}
            </div>
          </section>

          {/* SECCIÓN B: DETALLES DEL PEDIDO (Mini-galería como SHEIN) */}
          <section style={{
            background: '#0d1527',
            borderRadius: '14px',
            padding: '20px 22px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '900',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaShoppingBag color="#F5C81B" size={15} /> Detalles del pedido ({cartItems.length} artículos)
              </h2>
              <button
                type="button"
                onClick={() => setShowProductsDetailModal(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(245, 200, 27, 0.4)',
                  color: '#F5C81B',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
              >
                Ver productos &gt;
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin'
            }}>
              {cartItems.map((item, index) => {
                const qty = item.quantity || 1;
                const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
                const img = Array.isArray(item.imagenes) && item.imagenes[0]
                  ? item.imagenes[0]
                  : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');

                return (
                  <div 
                    key={index}
                    onClick={() => setExpandedProductImage(img)}
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#070b14',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      flexShrink: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'transform 0.2s'
                    }}
                    title={`${name} - Clic para ampliar imagen`}
                  >
                    <img 
                      src={img} 
                      alt={name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECCIÓN C: SELECCIONE TIPO DE ENVÍO */}
          <section 
            ref={deliverySectionRef}
            className={`gm-checkout-section ${deliveryTypeError ? 'gm-shipping-error-banner' : ''}`}
            style={{
              background: '#0d1527',
              borderRadius: '14px',
              padding: '22px',
              border: deliveryTypeError ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <h2 style={{
              margin: '0 0 14px 0',
              fontSize: '16px',
              fontWeight: '900',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaTruck color="#F5C81B" size={16} /> Seleccione Tipo de Envío
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label 
                onClick={() => { setDeliveryType('envio'); setDeliveryTypeError(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: deliveryType === 'envio' ? 'rgba(255, 255, 255, 0.04)' : '#070b14',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderLeft: deliveryType === 'envio' ? '4px solid #F5C81B' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: deliveryType === 'envio' ? '5px solid #F5C81B' : '2px solid #64748b',
                    background: '#000',
                    boxSizing: 'border-box'
                  }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Envío a Domicilio (Urbano)</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Entrega directa a tu dirección registrada</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>Por Coordinar</span>
              </label>

              <label 
                onClick={() => { setDeliveryType('nacional'); setDeliveryTypeError(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: deliveryType === 'nacional' ? 'rgba(255, 255, 255, 0.04)' : '#070b14',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderLeft: deliveryType === 'nacional' ? '4px solid #F5C81B' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: deliveryType === 'nacional' ? '5px solid #F5C81B' : '2px solid #64748b',
                    background: '#000',
                    boxSizing: 'border-box'
                  }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Envío Nacional (Intermunicipal)</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Despacho por transportadora a cualquier ciudad de Colombia</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>Por Coordinar</span>
              </label>

              <label 
                onClick={() => { setDeliveryType('recoger'); setDeliveryTypeError(''); setAddressError(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: deliveryType === 'recoger' ? 'rgba(255, 255, 255, 0.04)' : '#070b14',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderLeft: deliveryType === 'recoger' ? '4px solid #F5C81B' : '4px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: deliveryType === 'recoger' ? '5px solid #F5C81B' : '2px solid #64748b',
                    background: '#000',
                    boxSizing: 'border-box'
                  }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block' }}>Recoger en Tienda Física</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Retira personalmente tu paquete sin ningún costo</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>GRATIS</span>
              </label>
            </div>

            {deliveryTypeError && (
              <p style={{ color: '#ff4d4d', fontSize: '13px', fontWeight: '800', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ {deliveryTypeError}
              </p>
            )}
          </section>

          {/* SECCIÓN D: FORMA DE PAGO (MÁS SUELTA, SIN BORDE ENCERRADO PESADO) */}
          <section 
            id="seccion-formas-de-pago"
            ref={paymentSectionRef}
            style={{
              background: '#0d1527',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '900',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaReceipt color="#F5C81B" /> Forma De Pago
            </h2>

            {/* Opciones de métodos de pago */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
              {PAYMENT_METHODS.map(m => {
                const isSelected = selectedMethod === m.id;
                return (
                  <label 
                    key={m.id}
                    onClick={() => { setSelectedMethod(m.id); setMethodError(''); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.04)' : '#070b14',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderLeft: isSelected ? '4px solid #F5C81B' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #F5C81B' : '2px solid #64748b',
                        background: '#000',
                        boxSizing: 'border-box'
                      }} />
                      <img 
                        src={m.img} 
                        alt={m.name} 
                        style={{ 
                          height: '28px', 
                          maxWidth: '75px', 
                          objectFit: 'contain', 
                          borderRadius: '4px' 
                        }} 
                      />
                      <span style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#F5C81B' : '#fff' }}>
                        {m.name}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '11px', 
                      color: isSelected ? '#F5C81B' : '#94a3b8', 
                      fontWeight: '700',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '4px 10px',
                      borderRadius: '4px'
                    }}>
                      {m.badge}
                    </span>
                  </label>
                );
              })}
            </div>

            {methodError && (
              <p style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: '700', margin: '-10px 0 16px 0' }}>
                ⚠️ {methodError}
              </p>
            )}

            {/* SECCIÓN SUELTA DE QR Y SUBIDA DE COMPROBANTE */}
            {(isNequi || isBancolombia) && currentMethod && (
              <div style={{
                padding: '22px',
                backgroundColor: '#070b14',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                alignItems: 'center'
              }}>
                {/* Código QR grande */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ color: '#F5C81B', fontSize: '13px', fontWeight: '800', margin: '0 0 10px 0' }}>
                    Escanea el QR de {currentMethod.name}
                  </p>
                  
                  <div 
                    style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}
                    onClick={() => setIsQrExpanded(true)}
                    title="Clic para agrandar QR"
                  >
                    <img 
                      src={currentMethod.qr} 
                      alt="QR" 
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'contain', 
                        background: '#fff', 
                        padding: '6px', 
                        borderRadius: '10px',
                        border: '2px solid #F5C81B'
                      }} 
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.85)',
                      color: '#F5C81B',
                      padding: '6px',
                      borderRadius: '50%',
                      display: 'flex'
                    }}>
                      <FaSearchPlus size={12} />
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                    🔍 Clic en el QR para ampliar
                  </span>
                </div>

                {/* Dropzone de Comprobante */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>
                    Comprobante de Pago <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>

                  <div style={{
                    minHeight: '150px',
                    border: fileError ? '2px dashed #ff4d4d' : (!receiptFile ? '1.5px dashed rgba(245, 200, 27, 0.4)' : '2px solid #10B981'),
                    borderRadius: '10px',
                    backgroundColor: receiptFile ? '#000' : 'rgba(255, 255, 255, 0.02)',
                    padding: receiptFile ? '0' : '16px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}>
                    {!receiptFile && (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setReceiptFile(file);
                            setFileError('');
                          }
                        }} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} 
                      />
                    )}

                    {!receiptFile ? (
                      <div style={{ pointerEvents: 'none' }}>
                        <FaReceipt size={26} color="#F5C81B" style={{ marginBottom: '6px' }} />
                        <p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>
                          Adjuntar comprobante de pago
                        </p>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#F5C81B', 
                          background: 'rgba(245, 200, 27, 0.1)', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontWeight: '700' 
                        }}>
                          Seleccionar imagen
                        </span>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRemoveReceiptConfirm(true);
                          }}
                          title="Quitar comprobante"
                          style={{ 
                            position: 'absolute', 
                            top: '8px', 
                            right: '8px', 
                            background: 'rgba(0,0,0,0.85)', 
                            border: '1px solid #ff4d4d', 
                            color: '#ff4d4d', 
                            borderRadius: '6px', 
                            padding: '6px', 
                            cursor: 'pointer', 
                            zIndex: 20 
                          }}
                          type="button"
                        >
                          <FaTrash size={12} />
                        </button>

                        <img 
                          src={URL.createObjectURL(receiptFile)} 
                          alt="Comprobante" 
                          onClick={() => setIsReceiptExpanded(true)}
                          style={{ width: '100%', height: '150px', objectFit: 'contain', cursor: 'zoom-in' }} 
                        />

                        <div style={{ 
                          position: 'absolute', 
                          bottom: '6px', 
                          left: '6px', 
                          background: 'rgba(0,0,0,0.85)', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          <FaCheckCircle color="#10B981" size={10} />
                          <span style={{ color: '#10B981', fontSize: '9px', fontWeight: 'bold' }}>Subido</span>
                        </div>
                      </>
                    )}
                  </div>

                  {fileError ? (
                    <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '700' }}>⚠️ {fileError}</p>
                  ) : (
                    !receiptFile && <p style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0 0 0' }}>El comprobante es obligatorio para verificar la transferencia.</p>
                  )}
                </div>
              </div>
            )}

            {/* Si es Bold (Mismo diseño y ubicación equilibrada que Nequi / Bancolombia) */}
            {isBold && (
              <div style={{
                padding: '22px',
                backgroundColor: '#070b14',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={currentMethod.img} 
                    alt="Bold" 
                    style={{ height: '36px', objectFit: 'contain', borderRadius: '6px' }} 
                  />
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700', margin: 0, lineHeight: '1.4' }}>
                    Paga mediante la pasarela segura oficial de Bold (Tarjetas y PSE)
                  </p>
                  <a 
                    href={currentMethod.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '11px 20px', 
                      background: '#F5C81B', 
                      color: '#000', 
                      fontWeight: '800', 
                      borderRadius: '8px', 
                      textDecoration: 'none', 
                      fontSize: '12px',
                      boxShadow: '0 4px 14px rgba(245, 200, 27, 0.3)'
                    }}
                  >
                    Abrir pasarela de pago Bold <FaExternalLinkAlt size={11} />
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '800', marginBottom: '8px' }}>
                    Comprobante de Pago Bold <span style={{ color: '#ff4d4d' }}>*</span>
                  </label>
                  <div style={{
                    minHeight: '150px',
                    border: fileError ? '2px dashed #ff4d4d' : (!receiptFile ? '1.5px dashed rgba(245, 200, 27, 0.4)' : '2px solid #10B981'),
                    borderRadius: '10px',
                    backgroundColor: receiptFile ? '#000' : 'rgba(255, 255, 255, 0.02)',
                    padding: receiptFile ? '0' : '16px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}>
                    {!receiptFile && (
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setReceiptFile(file);
                            setFileError('');
                          }
                        }} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} 
                      />
                    )}

                    {!receiptFile ? (
                      <div style={{ pointerEvents: 'none' }}>
                        <FaReceipt size={26} color="#F5C81B" style={{ marginBottom: '6px' }} />
                        <p style={{ color: '#fff', fontSize: '12px', fontWeight: '700', margin: '0 0 4px 0' }}>
                          Adjuntar soporte de Bold
                        </p>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#F5C81B', 
                          background: 'rgba(245, 200, 27, 0.1)', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontWeight: '700' 
                        }}>
                          Seleccionar imagen
                        </span>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowRemoveReceiptConfirm(true);
                          }}
                          title="Quitar comprobante"
                          style={{ 
                            position: 'absolute', 
                            top: '8px', 
                            right: '8px', 
                            background: 'rgba(0,0,0,0.85)', 
                            border: '1px solid #ff4d4d', 
                            color: '#ff4d4d', 
                            borderRadius: '6px', 
                            padding: '6px', 
                            cursor: 'pointer', 
                            zIndex: 20 
                          }}
                          type="button"
                        >
                          <FaTrash size={12} />
                        </button>

                        <img 
                          src={URL.createObjectURL(receiptFile)} 
                          alt="Comprobante" 
                          onClick={() => setIsReceiptExpanded(true)}
                          style={{ width: '100%', height: '150px', objectFit: 'contain', cursor: 'zoom-in' }} 
                        />

                        <div style={{ 
                          position: 'absolute', 
                          bottom: '6px', 
                          left: '6px', 
                          background: 'rgba(0,0,0,0.85)', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          <FaCheckCircle color="#10B981" size={10} />
                          <span style={{ color: '#10B981', fontSize: '9px', fontWeight: 'bold' }}>Subido</span>
                        </div>
                      </>
                    )}
                  </div>

                  {fileError ? (
                    <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '6px 0 0 0', fontWeight: '700' }}>⚠️ {fileError}</p>
                  ) : (
                    !receiptFile && <p style={{ color: '#94a3b8', fontSize: '10px', margin: '4px 0 0 0' }}>El soporte es necesario para verificar tu pago.</p>
                  )}
                </div>
              </div>
            )}
          </section>

        </div>

        {/* ===== COLUMNA DERECHA: RESUMEN DEL PEDIDO FIJO (ESTILO SHEIN) ===== */}
        <div className="gm-checkout-sidebar">
          
          <div className="gm-checkout-summary-box">
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '17px',
              fontWeight: '900',
              color: '#fff',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Resumen Del Pedido</span>
              <span style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '700' }}>
                {cartItems.length} artículos
              </span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Artículos:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{cartItems.length} unidad(es)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Precio de envío:</span>
                <span style={{ color: !deliveryType ? '#94a3b8' : '#10B981', fontWeight: '700', fontSize: '12px' }}>
                  {!deliveryType ? 'Por seleccionar' : (isPickup ? 'GRATIS' : 'Por Coordinar')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Método seleccionado:</span>
                <span style={{ color: '#F5C81B', fontWeight: '700' }}>
                  {currentMethod?.name || 'Por elegir'}
                </span>
              </div>

              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                paddingTop: '14px', 
                marginTop: '4px',
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <strong style={{ fontSize: '15px', color: '#fff' }}>Total del pedido:</strong>
                <strong style={{ fontSize: '22px', color: '#F5C81B', fontWeight: '900' }}>
                  ${total.toLocaleString('es-CO')}
                </strong>
              </div>
            </div>

            {/* BOTÓN CONTINUAR Y CONFIRMAR (ABRE EL MODAL DE CONFIRMACIÓN) */}
            <button 
              onClick={handleProceedToConfirm}
              disabled={isProcessing}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#F5C81B',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: '900',
                fontSize: '15px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(245, 200, 27, 0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              type="button"
            >
              {isProcessing ? 'Procesando...' : 'CONTINUAR Y CONFIRMAR'}
            </button>

            <button 
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              type="button"
            >
              Seguir comprando
            </button>
          </div>

          {/* Badges de Confianza */}
          <div style={{
            background: '#0d1527',
            borderRadius: '14px',
            padding: '18px 20px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            fontSize: '11px',
            color: '#94a3b8'
          }}>
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

      {/* 4. BOTÓN FLOTANTE DE WHATSAPP (SOLO ÍCONO CIRCULAR) */}
      <a 
        href="https://wa.me/573228977086?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido%20en%20Gorras%20Caps%20Original"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '22px',
          right: '22px',
          zIndex: 9999,
          backgroundColor: '#25D366',
          border: 'none',
          color: '#ffffff',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
          transition: 'transform 0.2s ease, background-color 0.2s ease'
        }}
        title="Contactar asesor por WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>

      {/* 5. MODAL DE CONFIRMACIÓN DE COMPRA (MÁS DELGADO, SIN ÍCONO DE VERIFICADO) */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 10005,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#0d1527',
            border: '1.5px solid #F5C81B',
            borderRadius: '10px',
            maxWidth: '300px',
            width: '100%',
            padding: '20px 18px',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#F5C81B', textTransform: 'uppercase' }}>
              Confirmar compra
            </h3>

            <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
              Procesar pedido de <strong>{cartItems.length} artículo(s)</strong>:
            </p>

            <div style={{ 
              background: '#070b14', 
              padding: '12px 14px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Para:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{addrForm.nombre || user?.nombre || user?.nombreCompleto || 'Cliente'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Total a pagar:</span>
                <strong style={{ color: '#F5C81B', fontSize: '15px' }}>${total.toLocaleString('es-CO')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Forma de pago:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{currentMethod?.name || 'Por elegir'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Entrega:</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>{shippingText}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Dirección:</span>
                <span style={{ color: '#fff', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isPickup ? 'Recogida en local' : (address || 'Sin dirección')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '9px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                type="button"
              >
                Revisar
              </button>

              <button 
                onClick={handleExecuteOrder}
                disabled={isProcessing}
                style={{
                  flex: 1.4,
                  padding: '9px',
                  backgroundColor: '#F5C81B',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontWeight: '900',
                  fontSize: '12px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 200, 27, 0.3)'
                }}
                type="button"
              >
                {isProcessing ? 'Enviando...' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR DIRECCIÓN DETALLADA (ESTILO SHEIN CON FACHADA) */}
      {showAddressModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 10007,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div 
            style={{
              background: '#0d1527',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#fff' }}>
                Dirección de envío
              </h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '4px' }}>
                  Ubicación*
                </label>
                <div style={{ padding: '10px 14px', background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}>
                  Colombia 🇨🇴
                </div>
              </div>

              <div className="gm-form-row-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                    Nombre del destinatario*
                  </label>
                  <input 
                    type="text"
                    value={addrForm.nombre}
                    onChange={(e) => setAddrForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Cristian"
                    style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                    Teléfono / WhatsApp*
                  </label>
                  <input 
                    type="tel"
                    value={addrForm.telefono}
                    onChange={(e) => setAddrForm(prev => ({ ...prev, telefono: e.target.value.replace(/\D/g, '') }))}
                    placeholder="Ej: 3228977086"
                    style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: phoneError ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="gm-form-row-2col">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                    Departamento*
                  </label>
                  <input 
                    type="text"
                    value={addrForm.departamento}
                    onChange={(e) => setAddrForm(prev => ({ ...prev, departamento: e.target.value }))}
                    placeholder="Ej: Antioquia"
                    style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                    Municipio / Ciudad*
                  </label>
                  <input 
                    type="text"
                    value={addrForm.ciudad}
                    onChange={(e) => setAddrForm(prev => ({ ...prev, ciudad: e.target.value }))}
                    placeholder="Ej: Medellín"
                    style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                  Dirección de entrega (Calle, carrera, número, casa/apto)*
                </label>
                <input 
                  type="text"
                  value={addrForm.direccion}
                  onChange={(e) => setAddrForm(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Ej: Calle 77CC # 83-11, Apto 402"
                  style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: addressError ? '1.5px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
                {addressError && <p style={{ color: '#ff4d4d', fontSize: '11px', margin: '4px 0 0 0', fontWeight: '600' }}>⚠️ {addressError}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#F5C81B', marginBottom: '4px' }}>
                  Detalles de la fachada / Indicaciones de entrega (Opcional):
                </label>
                <input 
                  type="text"
                  value={addrForm.fachada}
                  onChange={(e) => setAddrForm(prev => ({ ...prev, fachada: e.target.value }))}
                  placeholder="Ej: Casa blanca de dos pisos, rejas negras, frente al parque..."
                  style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: '1px solid rgba(245, 200, 27, 0.3)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                  Información clave para que el domiciliario ubique tu casa fácilmente.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                  Barrio o sector (Opcional)
                </label>
                <input 
                  type="text"
                  value={addrForm.barrio}
                  onChange={(e) => setAddrForm(prev => ({ ...prev, barrio: e.target.value }))}
                  placeholder="Ej: Robledo, Laureles, Poblado..."
                  style={{ width: '100%', padding: '10px 12px', background: '#070b14', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setShowAddressModal(false)}
                style={{ padding: '9px 18px', backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                type="button"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveDetailedAddress}
                style={{ padding: '9px 22px', backgroundColor: '#F5C81B', border: 'none', borderRadius: '6px', color: '#000', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}
                type="button"
              >
                Guardar dirección ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA VER IMAGEN DE PRODUCTO AMPLIADA */}
      {expandedProductImage && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0,0,0,0.92)', 
            zIndex: 10008, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }} 
          onClick={() => setExpandedProductImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
              onClick={() => setExpandedProductImage(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'transparent', border: 'none', color: '#F5C81B', fontSize: '26px', cursor: 'pointer' }}
              type="button"
            >
              <FaTimes />
            </button>
            <img 
              src={expandedProductImage} 
              alt="Gorra ampliada" 
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '78vh', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)' }} 
            />
          </div>
        </div>
      )}

      {/* 6. MODAL DETALLES DEL PEDIDO (VER PRODUCTOS, TALLA Y CANTIDAD) */}
      {showProductsDetailModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.88)',
            zIndex: 10006,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowProductsDetailModal(false)}
        >
          <div 
            style={{
              background: '#0d1527',
              borderRadius: '10px',
              maxWidth: '460px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#F5C81B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaShoppingBag size={15} /> Productos del Pedido ({cartItems.length})
              </h3>
              <button 
                onClick={() => setShowProductsDetailModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map((item, index) => {
                const name = gPN ? gPN(item) : (item.nombre || 'Gorra');
                const price = gPP ? gPP(item) : (item.precio || 0);
                const qty = item.quantity || 1;
                const img = Array.isArray(item.imagenes) && item.imagenes[0]
                  ? item.imagenes[0]
                  : (item.imagen || item.safeImg || 'https://placehold.co/100x100?text=Gorra');

                return (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      backgroundColor: '#070b14',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                      <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </h4>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        <span>Talla: <strong style={{ color: '#F5C81B' }}>{item.talla || 'Única'}</strong></span>
                        <span>•</span>
                        <span>Cantidad: <strong style={{ color: '#fff' }}>{qty}</strong></span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#F5C81B', display: 'block' }}>
                        ${(price * qty).toLocaleString('es-CO')}
                      </span>
                      {qty > 1 && (
                        <span style={{ fontSize: '10px', color: '#64748b' }}>
                          ${price.toLocaleString('es-CO')} c/u
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Total productos:</span>
              <strong style={{ color: '#F5C81B', fontSize: '15px', fontWeight: '900' }}>
                ${subtotal.toLocaleString('es-CO')}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Modal de QR Ampliado */}
      {isQrExpanded && currentMethod?.qr && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.92)', 
            zIndex: 10006, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }} 
          onClick={() => setIsQrExpanded(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
              style={{ position: 'absolute', top: '-45px', right: '0', background: 'transparent', border: 'none', color: '#F5C81B', fontSize: '28px', cursor: 'pointer' }}
              type="button"
            >
              <FaTimes />
            </button>
            <img 
              src={currentMethod.qr} 
              alt="QR Ampliado" 
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', border: '2px solid #F5C81B', background: '#fff', padding: '10px' }} 
            />
            <p style={{ color: '#F5C81B', textAlign: 'center', marginTop: '14px', fontWeight: '800', fontSize: '15px' }}>
              Código QR oficial de {currentMethod?.name}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Comprobante Ampliado */}
      {isReceiptExpanded && receiptFile && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.92)', 
            zIndex: 10006, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }} 
          onClick={() => setIsReceiptExpanded(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
              style={{ position: 'absolute', top: '-45px', right: '0', background: 'transparent', border: 'none', color: '#10B981', fontSize: '28px', cursor: 'pointer' }}
              type="button"
            >
              <FaTimes />
            </button>
            <img 
              src={URL.createObjectURL(receiptFile)} 
              alt="Comprobante Ampliado" 
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', border: '2px solid #10B981' }} 
            />
            <p style={{ color: '#10B981', textAlign: 'center', marginTop: '14px', fontWeight: '800', fontSize: '15px' }}>
              Comprobante de Pago Adjuntado
            </p>
          </div>
        </div>
      )}

      {/* Modal de confirmación para quitar comprobante */}
      {showRemoveReceiptConfirm && (
        <div style={{ 
          position: 'fixed', 
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.88)', 
          zIndex: 10006, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '20px' 
        }}>
          <div style={{ 
            backgroundColor: "#0d1527", 
            border: "1.5px solid #F5C81B", 
            borderRadius: "16px", 
            padding: "26px 22px", 
            maxWidth: '380px', 
            width: '100%', 
            textAlign: "center"
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ color: '#F5C81B', fontSize: '17px', fontWeight: '900', margin: '0 0 10px 0' }}>
              ¿Quitar comprobante?
            </h3>
            <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.4', margin: '0 0 18px 0' }}>
              ¿Deseas eliminar la captura actual? Tendrás que subir una nueva para confirmar la orden.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowRemoveReceiptConfirm(false)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setReceiptFile(null);
                  setFileError('');
                  setShowRemoveReceiptConfirm(false);
                }}
                style={{ flex: 1, padding: '10px', background: '#ff4d4d', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                type="button"
              >
                Sí, quitar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CheckoutModal;
