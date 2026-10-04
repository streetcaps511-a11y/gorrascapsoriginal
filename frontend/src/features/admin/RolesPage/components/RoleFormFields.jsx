/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';

const FormField = ({ label, required, children, error, isViewMode, viewValue }) => {
  return (
    <div className="form-field">
      <label className={`form-label ${isViewMode ? 'readonly-field' : ''}`}>
        {label}: {!isViewMode && required && <span className="required">*</span>}
      </label>
      {isViewMode ? (
        <div className="form-input readonly-field disabled-field" style={{ height: '30px', display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid #1e293b' }}>
          {viewValue || '-'}
        </div>
      ) : children}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

const RoleFormFields = ({ 
  modalMode, 
  currentRole, 
  setCurrentRole, 
  fieldErrors, 
  setFieldErrors, 
  availablePermissions, 
  isRestrictedRole,
  roles = []
}) => {
  const isView = modalMode === 'details';
  const isAdminRole = isSelectedRoleAdmin(currentRole);
  const isRestricted = isRestrictedRole && isRestrictedRole(currentRole);

  function isSelectedRoleAdmin(role) {
    if (!role) return false;
    return (role.name || "").toLowerCase() === "administrador";
  }

  // ⚡ Validación instantánea de duplicados (nombre, admin y combinación de permisos)
  const checkRoleDuplicates = (nameVal, permsVal) => {
    const nameTrimmed = (nameVal || '').trim().toLowerCase();
    let nameErr = null;
    let permErr = null;

    if (nameTrimmed) {
      if (nameTrimmed === 'administrador' || nameTrimmed === 'admin') {
        const existingAdmin = (roles || []).find(r => 
          (r.name || '').trim().toLowerCase() === 'administrador' && 
          r.id !== currentRole.id
        );
        if (existingAdmin || !currentRole.id) {
          nameErr = 'No se puede registrar otro rol Administrador';
        }
      } else {
        const duplicate = (roles || []).find(r => 
          (r.name || '').trim().toLowerCase() === nameTrimmed && 
          r.id !== currentRole.id
        );
        if (duplicate) {
          nameErr = `Ya existe un rol con el nombre "${duplicate.name}"`;
        }
      }
    }

    const rolePerms = permsVal || [];
    if (rolePerms.length > 0 && nameTrimmed !== 'administrador') {
      const currentPermsSet = new Set(rolePerms);
      const duplicatePerms = (roles || []).find(r => {
        if (r.id === currentRole.id) return false;
        if ((r.name || '').trim().toLowerCase() === 'administrador') return false;
        const otherPerms = r.permissions || [];
        if (otherPerms.length === 0 || otherPerms.length !== rolePerms.length) return false;
        return otherPerms.every(p => currentPermsSet.has(p));
      });

      if (duplicatePerms) {
        permErr = `Estos permisos son idénticos a los del rol "${duplicatePerms.name}"`;
      }
    }

    return { nameErr, permErr };
  };
  
  return (
    <div className={`role-form ${isView ? 'view-mode' : ''}`}>
      <div className="form-body">
        <FormField 
          label="Nombre" 
          required={!isView}
          error={!isView && fieldErrors.name ? (typeof fieldErrors.name === 'string' ? fieldErrors.name : "El nombre del rol es obligatorio") : null}
          isViewMode={isView}
          viewValue={currentRole?.name}
        >
          {!isView && (
            <input
              type="text"
              autoFocus
              value={currentRole.name}
              placeholder="Ej: Vendedor"
              readOnly={isRestricted}
              disabled={isRestricted}
              className={`form-input ${fieldErrors.name ? 'has-error' : ''} ${isRestricted ? 'disabled-field' : ''}`}
              onChange={(e) => {
                if (isRestricted) return;
                const newName = e.target.value;
                setCurrentRole({ ...currentRole, name: newName });
                const { nameErr, permErr } = checkRoleDuplicates(newName, currentRole.permissions);
                setFieldErrors(prev => ({
                  ...prev,
                  name: nameErr || (!newName.trim() ? "El nombre del rol es obligatorio" : false),
                  ...(permErr ? { permissions: permErr } : {})
                }));
              }}
            />
          )}
        </FormField>

        <FormField 
          label="Descripción"
          isViewMode={isView}
          viewValue={currentRole?.description || 'Sin descripción'}
        >
          {!isView && (
            <input
              type="text"
              value={currentRole.description || ""}
              placeholder="Breve descripción"
              readOnly={isRestricted}
              disabled={isRestricted}
              className={`form-input ${isRestricted ? 'disabled-field' : ''}`}
              onChange={(e) => {
                if (isRestricted) return;
                setCurrentRole({ ...currentRole, description: e.target.value });
              }}
            />
          )}
        </FormField>

        <div className="permissions-section">
          <label className={`form-label ${isView ? 'readonly-field' : ''}`}>
            Permisos: {!isView && <span className="required">*</span>}
          </label>
          <div className="permissions-grid">
            {availablePermissions.map(perm => {
              const isChecked = isAdminRole || currentRole.permissions?.includes(perm.id);
              return (
                <label key={perm.id} className={`permission-item ${isChecked ? 'active' : ''} ${(isView || isRestricted) ? 'disabled' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    disabled={isView || isRestricted || isAdminRole}
                    onChange={() => {
                      if (isAdminRole || isRestricted || isView) return;
                      const newPerms = isChecked 
                        ? (currentRole.permissions || []).filter(p => p !== perm.id) 
                        : [...(currentRole.permissions || []), perm.id];
                      setCurrentRole({ ...currentRole, permissions: newPerms });
                      const { nameErr, permErr } = checkRoleDuplicates(currentRole.name, newPerms);
                      setFieldErrors(prev => ({
                        ...prev,
                        permissions: permErr || (newPerms.length === 0 ? "Debe seleccionar al menos un permiso" : false),
                        ...(nameErr ? { name: nameErr } : {})
                      }));
                    }}
                    className="permission-checkbox"
                  />
                  <span className="permission-label">{perm.label}</span>
                </label>
              );
            })}
          </div>
          {!isView && fieldErrors.permissions && (
            <div className="field-error">
              {typeof fieldErrors.permissions === 'string' ? fieldErrors.permissions : "Debe seleccionar al menos un permiso"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleFormFields;
