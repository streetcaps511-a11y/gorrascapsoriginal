import { useNetwork } from '../contexts/NetworkContext';
import { useLocation } from 'react-router-dom';

const WifiOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const WifiLowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h.01"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const WifiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function ConnectionBanner() {
  const { isOnline, showBanner, setShowBanner, connectionQuality, showReconnected, setShowReconnected } = useNetwork();
  const location = useLocation();

  const isPaymentPage = 
    location.pathname.includes('/checkout') ||
    location.pathname.includes('/pago') ||
    location.pathname.includes('/cart');

  if (isPaymentPage) return null;

  // Banner verde de reconexión
  if (showReconnected) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#16a34a',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '0 0 8px 8px',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        animation: 'slideDown 0.3s ease-out',
        maxWidth: '400px',
      }}>
        <WifiIcon />
        <span>Conexión restablecida</span>
      </div>
    );
  }

  if (!showBanner || (connectionQuality === 'good' && isOnline)) return null;

  const getConfig = () => {
    if (connectionQuality === 'offline') {
      return {
        bg: '#dc2626',
        text: 'Sin conexión a internet',
        icon: <WifiOffIcon />
      };
    } else if (connectionQuality === 'slow') {
      return {
        bg: '#b45309',
        text: 'Conexión lenta',
        icon: <WifiLowIcon />
      };
    }
    return {
      bg: '#dc2626',
      text: 'Problemas de conexión',
      icon: <WifiOffIcon />
    };
  };

  const config = getConfig();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      background: config.bg,
      color: 'white',
      padding: '8px 20px',
      borderRadius: '0 0 8px 8px',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      maxWidth: '400px',
    }}>
      {config.icon}
      <span>{config.text}</span>
      <button
        onClick={() => setShowBanner(false)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          marginLeft: '8px',
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
      >
        <XIcon />
      </button>
    </div>
  );
}