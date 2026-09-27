import { useState, useEffect, useCallback, useRef } from 'react';

export const useUnsavedChanges = (formData, initialState) => {
    const [hasChanges, setHasChanges] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const pendingActionRef = useRef(null);

    // Detectar cambios comparando formData con initialState
    useEffect(() => {
        if (!formData || !initialState) return;

        const hasChanged = Object.keys(formData).some(key => {
            const initialValue = initialState[key] ?? '';
            const currentValue = formData[key] ?? '';
            return String(currentValue) !== String(initialValue);
        });

        setHasChanges(hasChanged);
    }, [formData, initialState]);

    // Prevenir cierre accidental de la página (F5, cerrar pestaña)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    const handleAttemptClose = useCallback(() => {
        if (hasChanges) {
            setShowCloseModal(true);
            return false; // No cerrar todavía
        }
        return true; // No hay cambios, cerrar directamente
    }, [hasChanges]);

    const confirmDiscard = useCallback(() => {
        setShowCloseModal(false);
        setHasChanges(false);
        return true;
    }, []);

    const cancelClose = useCallback(() => {
        setShowCloseModal(false);
    }, []);

    return {
        hasChanges,
        showCloseModal,
        handleAttemptClose,
        confirmDiscard,
        cancelClose
    };
};