import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaEnvelope } from 'react-icons/fa';
import { getSolicitudesPendientes } from '../../shared/services/adminApi';

const SolicitudesPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            const response = await getSolicitudesPendientes();
            setSolicitudes(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
        // Refrescar cada 30 segundos
        const interval = setInterval(fetchSolicitudes, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return null;
    if (solicitudes.length === 0) return null;

    return (
        <div style={{
            background: '#0b1220',
            border: '2px solid #FFC107',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FaExclamationTriangle color="#FFC107" size={20} />
                <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '800' }}>
                    Solicitudes Pendientes ({solicitudes.length})
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {solicitudes.map((sol) => (
                    <div key={sol.id} style={{
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            {sol.tipo === 'eliminacion' ? (
                                <FaTimesCircle color="#ff6b6b" size={16} />
                            ) : (
                                <FaExclamationTriangle color="#FFC107" size={16} />
                            )}
                            <strong style={{ color: '#fff', fontSize: '14px' }}>
                                {sol.tipo === 'eliminacion' ? 'Eliminación' : 'Desactivación'}
                            </strong>
                        </div>

                        <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                            <p style={{ margin: '0 0 4px 0' }}>
                                <strong>Cliente:</strong> {sol.clienteNombre}
                            </p>
                            <p style={{ margin: '0 0 4px 0' }}>
                                <FaEnvelope size={12} style={{ marginRight: '4px' }} />
                                {sol.clienteEmail}
                            </p>
                            <p style={{ margin: '0 0 4px 0', color: '#FFC107' }}>
                                <strong>{sol.ventasActivas}</strong> compra(s) activa(s)
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                                Expira en: {sol.tiempoRestante} minutos
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={fetchSolicitudes}
                style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                }}
            >
                Actualizar
            </button>
        </div>
    );
};

export default SolicitudesPendientes;