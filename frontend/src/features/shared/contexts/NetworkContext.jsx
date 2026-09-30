import { createContext, useContext, useState, useEffect, useRef } from 'react';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState('good'); // 'good' | 'slow' | 'offline'
    const [showReconnected, setShowReconnected] = useState(false);
    const heartbeatInterval = useRef(null);
    const wasOfflineRef = useRef(false);

    // Función para verificar conexión real con ping
    const checkConnection = async () => {
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const latency = Date.now() - startTime;

            if (response.ok || response.status === 304) {
                if (latency > 2000) {
                    // Más de 2 segundos = conexión lenta — mostrar banner
                    setConnectionQuality('slow');
                    setShowBanner(true);
                } else {
                    // Buena conexión
                    setConnectionQuality('good');
                    setShowBanner(false);
                }

                if (!isOnline || wasOfflineRef.current) {
                    setIsOnline(true);
                    wasOfflineRef.current = false;
                    // Mostrar banner de reconexión brevemente
                    setShowReconnected(true);
                    setTimeout(() => setShowReconnected(false), 3000);
                }

                return true;
            }
        } catch (error) {
            console.log('Connection check failed:', error);
            setIsOnline(false);
            setConnectionQuality('offline');
            setShowBanner(true);
            wasOfflineRef.current = true;
            return false;
        }
    };

    // Heartbeat - verificar conexión cada 10 segundos
    useEffect(() => {
        checkConnection(); // Verificación inmediata
        heartbeatInterval.current = setInterval(checkConnection, 10000);

        const handleOnline = () => checkConnection();
        const handleOffline = () => {
            setIsOnline(false);
            setConnectionQuality('offline');
            setShowBanner(true);
            wasOfflineRef.current = true;
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const forceCheck = async () => {
        await checkConnection();
    };

    return (
        <NetworkContext.Provider value={{
            isOnline,
            showBanner,
            setShowBanner,
            connectionQuality,
            showReconnected,
            setShowReconnected,
            forceCheck
        }}>
            {children}
        </NetworkContext.Provider>
    );
}

export const useNetwork = () => useContext(NetworkContext);