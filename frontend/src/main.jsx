// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthProvider } from './features/shared/contexts';
import { NetworkProvider } from './features/shared/contexts/NetworkContext'; // ✅ Corregido
import ConnectionBanner from './features/shared/components/ConnectionBanner'; // ✅ Corregido

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NetworkProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ConnectionBanner />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </NetworkProvider>
  </React.StrictMode>
);