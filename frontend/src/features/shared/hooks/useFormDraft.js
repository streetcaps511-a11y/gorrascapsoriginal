/* === HOOK REUTILIZABLE ===
   Gestor universal de borradores para el panel de administración.
   Gorras Medellín - Autoguardado, recuperación y descarte de borradores. */

import { useState, useEffect, useCallback, useRef } from 'react';
import { NitroCache } from '../utils/NitroCache';

export const useFormDraft = ({
  moduleId,
  isEditing = false,
  modoVista = 'lista',
  getFormData,
  isDirty,
  getExtraInfo,
  onRestore,
  onDiscard,
  onOpenForm
}) => {
  const draftKey = `draft_${moduleId}_new`;
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [draftMeta, setDraftMeta] = useState({ timestamp: null, extraInfo: null });

  // Refs para evitar ciclos en efectos
  const getFormDataRef = useRef(getFormData);
  getFormDataRef.current = getFormData;

  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const getExtraInfoRef = useRef(getExtraInfo);
  getExtraInfoRef.current = getExtraInfo;

  // Función para obtener el borrador guardado en caché
  const getSavedDraft = useCallback(() => {
    try {
      const cached = NitroCache.get(draftKey);
      if (!cached) return null;

      // NitroCache envuelve el objeto en { data, timestamp }
      const payload = cached.data || cached;
      const data = payload?.data !== undefined ? payload.data : payload;

      if (!data) return null;

      return {
        data,
        timestamp: payload?.timestamp || cached.timestamp || Date.now(),
        extraInfo: payload?.extraInfo || null
      };
    } catch (err) {
      console.error(`[useFormDraft] Error al leer borrador de ${moduleId}:`, err);
      return null;
    }
  }, [draftKey, moduleId]);

  // Limpiar borrador de la caché persistente
  const clearDraft = useCallback(() => {
    try {
      NitroCache.remove(draftKey);
      setHasDraft(false);
      setDraftData(null);
      setDraftMeta({ timestamp: null, extraInfo: null });
    } catch (err) {
      console.error(`[useFormDraft] Error al limpiar borrador de ${moduleId}:`, err);
    }
  }, [draftKey, moduleId]);

  // Guardar borrador en caché
  const saveDraft = useCallback((customData = null) => {
    if (isEditing) return; // No crear borrador si se está editando una entidad existente

    const dataToSave = customData !== null ? customData : (getFormDataRef.current ? getFormDataRef.current() : null);
    if (!dataToSave) return;

    const dirtyCheck = isDirtyRef.current;
    if (dirtyCheck && !dirtyCheck(dataToSave)) {
      return; // No guardar si el formulario está en blanco / prístino
    }

    const extra = getExtraInfoRef.current ? getExtraInfoRef.current(dataToSave) : null;
    const now = Date.now();

    try {
      NitroCache.set(draftKey, {
        data: dataToSave,
        timestamp: now,
        extraInfo: extra,
        moduleId
      });
      setHasDraft(true);
      setDraftData(dataToSave);
      setDraftMeta({ timestamp: now, extraInfo: extra });
    } catch (err) {
      console.error(`[useFormDraft] Error al guardar borrador de ${moduleId}:`, err);
    }
  }, [draftKey, isEditing, moduleId]);

  // Disparador principal: llamado ÚNICAMENTE cuando el usuario pulsa el botón de registrar
  const handleRegisterClick = useCallback(() => {
    const saved = getSavedDraft();

    if (saved && saved.data) {
      // Verificar si los datos guardados son efectivamente válidos/sucios
      const dirtyCheck = isDirtyRef.current;
      if (!dirtyCheck || dirtyCheck(saved.data)) {
        setHasDraft(true);
        setDraftData(saved.data);
        setDraftMeta({ timestamp: saved.timestamp, extraInfo: saved.extraInfo });
        setShowDraftModal(true);
        return;
      }
    }

    // Si no hay borrador o está vacío, abrir formulario limpio directamente
    clearDraft();
    if (onDiscard) onDiscard();
    if (onOpenForm) onOpenForm();
  }, [getSavedDraft, clearDraft, onDiscard, onOpenForm]);

  // Acción: Usuario pulsa "Restaurar borrador"
  const restoreDraft = useCallback(() => {
    setShowDraftModal(false);
    if (draftData && onRestore) {
      onRestore(draftData);
    }
    if (onOpenForm) {
      onOpenForm();
    }
  }, [draftData, onRestore, onOpenForm]);

  // Acción: Usuario pulsa "Empezar desde cero"
  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftModal(false);
    if (onDiscard) {
      onDiscard();
    }
    if (onOpenForm) {
      onOpenForm();
    }
  }, [clearDraft, onDiscard, onOpenForm]);

  // Acción: Usuario cancela / cierra el modal
  const closeDraftModal = useCallback(() => {
    setShowDraftModal(false);
  }, []);

  // Alerta preventiva antes de recargar si está en modo formulario y tiene datos sucios
  useEffect(() => {
    if (modoVista !== 'formulario' || isEditing) return;

    const handleBeforeUnload = (e) => {
      const currentData = getFormDataRef.current ? getFormDataRef.current() : null;
      const dirtyCheck = isDirtyRef.current;
      if (currentData && dirtyCheck && dirtyCheck(currentData)) {
        // Asegurar guardado inmediato síncrono antes del reload
        saveDraft(currentData);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [modoVista, isEditing, saveDraft]);

  return {
    showDraftModal,
    setShowDraftModal,
    hasDraft,
    draftData,
    draftMeta,
    handleRegisterClick,
    restoreDraft,
    discardDraft,
    closeDraftModal,
    saveDraft,
    clearDraft
  };
};