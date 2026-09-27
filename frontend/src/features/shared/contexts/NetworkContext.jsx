import { createContext, useContext, useState, useEffect, useRef } from 'react';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState('good'); // 'good' | 'slow' | 'offline'
    const heartbeatInterval = useRef(null);
    const pingTimeout = useRef(null);

    // Función para verificar conexión real con ping
    const checkConnection = async () => {
        const startTime = Date.now();

        try {
            // Intentar cargar un recurso pequeño con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

            // Usar un endpoint ligero o un archivo pequeño
            const response = await fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const latency = Date.now() - startTime;

            if (response.ok || response.status === 304) {
                // Conexión exitosa - evaluar calidad
                if (latency > 3000) {
                    // Más de 3 segundos = conexión muy lenta
                    setConnectionQuality('slow');
                    setShowBanner(true);
                } else if (latency > 1500) {
                    // Más de 1.5 segundos = conexión regular
                    setConnectionQuality('slow');
                    setShowBanner(false); // No mostrar banner pero marcar como lento
                } else {
                    // Menos de 1.5 segundos = buena conexión
                    setConnectionQuality('good');
                    setShowBanner(false);
                }

                if (!isOnline) {
                    setIsOnline(true);
                }

                return true;
            }
        } catch (error) {
            // Error de conexión
            console.log('Connection check failed:', error);
            setIsOnline(false);
            setConnectionQuality('offline');
            setShowBanner(true);
            return false;
        }
    };

    // Heartbeat - verificar conexión cada 10 segundos
    useEffect(() => {
        const startHeartbeat = () => {
            checkConnection(); // Verificación inmediata
            heartbeatInterval.current = setInterval(checkConnection, 10000); // Cada 10 segundos
        };

        const stopHeartbeat = () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
        };

        // Event listeners nativos
        const handleOnline = () => {
            checkConnection(); // Verificar inmediatamente
        };

        const handleOffline = () => {
            setIsOnline(false);
            setConnectionQuality('offline');
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        startHeartbeat();

        return () => {
            stopHeartbeat();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

    // Función para forzar verificación (útil antes de pagos)
    const forceCheck = async () => {
        await checkConnection();
    };

    return (
        <NetworkContext.Provider value={{
            isOnline,
            showBanner,
            setShowBanner,
            connectionQuality,
            forceCheck
        }}>
            {children}
        </NetworkContext.Provider>
    );
}

export const useNetwork = () => useContext(NetworkContext);