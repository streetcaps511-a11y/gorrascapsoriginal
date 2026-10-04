import { Usuario, Rol, DetallePermiso, Permiso, Cliente } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { verifyToken as verifyJwt } from '../utils/jwt.js';
import fs from 'fs';
import { Op } from 'sequelize';

/**
 * Verificar token JWT
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    let token = null;
    if (!authHeader) {
      console.error('❌ No se encontró el header Authorization');
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader.trim();
    }

    if (!token || token.length < 20) {
      console.error('❌ Token inválido o demasiado corto:', token);
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación válido'
      });
    }

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch (jwtError) {
      console.error('❌ Error específico en verifyJwt:', jwtError.name, '-', jwtError.message);
      throw jwtError;
    }

    // Verificar estado desde el token primero (más rápido)
    if (decoded.estado === 'inactivo') {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    if (decoded.estado === 'pendiente') {
      return res.status(403).json({
        success: false,
        message: 'Usuario pendiente de aprobación',
        redirectTo: '/pendiente-aprobacion'
      });
    }

    // Buscar usuario por el ID del token
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [
        { model: Rol, as: 'rolData' },
        {
          model: Cliente,
          as: 'clienteData',
          attributes: ['id', 'direccion', 'ciudad', 'avatarUrl']
        }
      ]
    });

    if (!usuario) {
      console.log(`❌ Auth error: El usuario con ID ${decoded.id} no existe en la base de datos`);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado en el sistema'
      });
    }

    // Verificar estado
    const isActive = usuario.estado === 'activo' || usuario.estado === 'true' || usuario.estado === true;
    if (usuario.estado === 'inactivo' || (!isActive && usuario.estado !== 'pendiente')) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Usuario inactivo'
      });
    }

    if (usuario.estado === 'pendiente') {
      return res.status(403).json({
        success: false,
        message: 'Usuario pendiente de aprobación',
        redirectTo: '/pendiente-aprobacion'
      });
    }

    // 🔒 VALIDACIÓN DE SESIÓN PARA AMBAS PLATAFORMAS (Web y App)
    const platform = decoded.platform || 'web';
    const dbSessionId = platform === 'app' ? usuario.sessionIdApp : usuario.sessionId;

    // Si hay un sessionId en la BD y NO coincide con el del token → sesión invalidada
    if (dbSessionId && decoded.sessionId && decoded.sessionId !== dbSessionId) {
      console.log(`⚠️ Sesión invalidada para ${usuario.email} en ${platform}: El ID del token no coincide.`);
      return res.status(401).json({
        success: false,
        isSessionInvalidated: true,
        message: platform === 'app'
          ? 'Tu sesión ha sido abierta en otro dispositivo (App).'
          : 'Tu sesión ha sido abierta en otro navegador o dispositivo.'
      });
    }

    // Actualizar última actividad para mantener la sesión viva
    if (platform === 'app') {
      usuario.lastActivityApp = new Date();
    } else {
      usuario.lastActivity = new Date();
    }
    await usuario.save({ hooks: false });

    // Inyectar para que el controlador lo reciba directamente
    req.usuario = usuario;
    req.platform = platform;
    req.rol = usuario.rolData;
    req.usuarioId = usuario.id;

    next();
  } catch (error) {
    console.error('❌ Error en verifyToken:', error.name, '-', error.message);

    if (error.name.includes('Sequelize') || error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return res.status(503).json({
        success: false,
        message: 'Error temporal de conexión con el servidor de datos. Reintentando...',
        isDbError: true
      });
    }

    return res.status(401).json({
      success: false,
      message: error.name === 'JsonWebTokenError' ? 'Token malformado o inválido' :
        error.name === 'TokenExpiredError' ? 'Token expirado' :
          'Token inválido o expirado'
    });
  }
};

/**
 * Verificar rol de usuario
 */
export const checkRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const rolName = String(req.rol?.nombre || '').toUpperCase();
      if (rolName === 'ADMINISTRADOR' || rolName === 'ADMIN') {
        return next();
      }

      const rol = await Rol.findByPk(req.usuario.idRol);
      if (!rol) {
        return res.status(403).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      if (!rolesPermitidos.includes(rol.nombre)) {
        return res.status(403).json({
          success: false,
          message: `No tiene permisos de ${rolesPermitidos.join(' o ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en checkRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar rol'
      });
    }
  };
};

/**
 * Verificar permisos específicos
 */
export const checkPermission = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }

      const userEmail = req.usuario.email;
      const userRolId = Number(req.usuario.idRol || req.usuario.IdRol || 0);
      const rolName = String(req.rol?.nombre || '').toUpperCase().trim();
      const permsToCheck = Array.isArray(permisoRequerido) ? permisoRequerido : [permisoRequerido];

      const isAdminRole = rolName.includes('ADMIN');
      const isSystemAdmin = userRolId === 1;
      if (isAdminRole || isSystemAdmin) {
        return next();
      }

      const rolJsonPerms = req.rol?.permisos || [];
      const hasInJson = permsToCheck.some(reqPerm => {
        const normalizedReq = reqPerm.toLowerCase().replace('ver_', '').replace('perm_', '');
        return Array.isArray(rolJsonPerms) && rolJsonPerms.some(p => {
          const pStr = String(p).toLowerCase().replace('ver_', '').replace('perm_', '');
          return pStr === normalizedReq || pStr === reqPerm.toLowerCase();
        });
      });

      if (hasInJson) {
        return next();
      }

      const allVariations = [];
      permsToCheck.forEach(reqPerm => {
        const normalized = String(reqPerm).toLowerCase().replace('ver_', '').replace('perm_', '').trim();
        allVariations.push(
          reqPerm,
          `perm_${normalized}`,
          `ver_${normalized}`,
          normalized,
          reqPerm.toLowerCase(),
          reqPerm.toUpperCase(),
          `ver_${reqPerm.toLowerCase()}`
        );
      });

      const uniqueVariations = [...new Set(allVariations.filter(v => v && typeof v === 'string'))];
      const tienePermisoRelacional = await DetallePermiso.findOne({
        where: {
          idRol: userRolId,
          idPermiso: { [Op.in]: uniqueVariations }
        }
      });

      if (tienePermisoRelacional) {
        return next();
      }

      try {
        fs.appendFileSync('errors.log', `[${new Date().toISOString()}] 403 FORBIDDEN: ${userEmail} MISSES '${permsToCheck.join('|')}' (RolID: ${userRolId})\n`);
      } catch (e) { }

      return res.status(403).json({
        success: false,
        message: `No tiene permiso para realizar esta acción. Se requiere uno de: ${permsToCheck.join(', ')}`,
        debug: { user: userEmail, rolId: userRolId, missing: permsToCheck }
      });
    } catch (error) {
      console.error('🔴 Error crítico en checkPermission:', error);
      return res.status(500).json({ success: false, message: 'Error interno al verificar permisos', error: error.message });
    }
  };
};

/**
 * Verificar si el usuario puede modificar datos de clientes
 */
export const checkClienteAccess = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (req.rol?.nombre === 'Administrador' || req.rol?.nombre === 'ADMIN') {
      return next();
    }

    if (req.rol?.nombre === 'Usuario' || req.rol?.nombre === 'Cliente') {
      const clienteId = parseInt(req.params.id);
      if (clienteId === req.usuario.id) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'No puede acceder a datos de otro cliente'
      });
    }

    next();
  } catch (error) {
    console.error('Error en checkClienteAccess:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar acceso'
    });
  }
};

export default {
  verifyToken,
  checkRole,
  checkPermission,
  checkClienteAccess
};