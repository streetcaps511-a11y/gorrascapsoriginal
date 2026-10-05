import { Op } from 'sequelize';
import crypto from 'crypto';
import Cliente from '../models/clientes.model.js';
import Usuario from '../models/usuarios.model.js';
import Venta from '../models/ventas.model.js';
import { validateCliente, sanitizeCliente } from '../utils/validationUtils.js';
import { sequelize } from '../config/db.js';
import * as Brevo from '@getbrevo/brevo';

const otpStore = new Map();
const deletionRequests = new Map();
const deactivationRequests = new Map();
const emailHistory = []; // ✅ NUEVO: Trazabilidad de correos enviados
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// === FUNCIONES DE EMAIL ===
const sendEmail = async (to, subject, html) => {
    try {
        const api = new Brevo.TransactionalEmailsApi();
        api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
        const mail = new Brevo.SendSmtpEmail();
        mail.subject = subject;
        mail.sender = { name: 'Gorras Medellín', email: process.env.BREVO_SENDER_EMAIL || 'streetcaps511@gmail.com' };
        mail.to = [{ email: to }];
        mail.htmlContent = html;
        await api.sendTransacEmail(mail);
        return true;
    } catch (err) {
        console.error('❌ Error enviando email:', err.message);
        return false;
    }
};

// ✅ NUEVO: Correo de confirmación de DESACTIVACIÓN (solo cuando el cliente aprueba)
const sendDeactivationApprovalEmail = async (toEmail, toName) => {
    return sendEmail(toEmail, '✅ Tu cuenta ha sido desactivada - Gorras Medellín',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0b0f1a;border-radius:14px;padding:36px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#FFC107;margin:0;font-size:32px;">GM</h1>
        <p style="color:#94a3b8;margin:4px 0 0 0;font-size:14px;">Gorras Medellín</p>
      </div>
      <h2 style="color:#fff;text-align:center;margin:0 0 20px 0;">Cuenta Desactivada</h2>
      <div style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="color:#e2e8f0;font-size:15px;margin:0 0 12px;">Hola <strong style="color:#FFC107">${toName}</strong>,</p>
        <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Tu cuenta ha sido <strong style="color:#ff6b6b">desactivada exitosamente</strong> según tu solicitud.
        </p>
        <div style="background:rgba(255,107,107,0.1);border-left:4px solid #ff6b6b;padding:12px;border-radius:6px;margin:16px 0;">
          <p style="color:#ff6b6b;font-size:13px;margin:0;"><strong>⚠️ Importante:</strong></p>
          <ul style="color:#cbd5e1;font-size:13px;margin:8px 0 0 0;padding-left:20px;">
            <li>No podrás iniciar sesión hasta contactar a soporte</li>
            <li>Tu historial de compras permanece en nuestro sistema</li>
            <li>Para reactivar: escribe a <strong style="color:#FFC107">soporte@gorrascaps.com</strong></li>
          </ul>
        </div>
      </div>
      <p style="color:#64748b;font-size:12px;text-align:center;margin:20px 0 0;">
        Si no solicitaste esta desactivación, contacta inmediatamente a soporte.
      </p>
    </div>`
    );
};

// ✅ NUEVO: Correo de confirmación de ELIMINACIÓN (solo cuando el cliente aprueba)
const sendDeletionApprovalEmail = async (toEmail, toName) => {
    return sendEmail(toEmail, '✅ Tu cuenta ha sido eliminada - Gorras Medellín',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#0b0f1a;border-radius:14px;padding:36px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#FFC107;margin:0;font-size:32px;">GM</h1>
        <p style="color:#94a3b8;margin:4px 0 0 0;font-size:14px;">Gorras Medellín</p>
      </div>
      <h2 style="color:#fff;text-align:center;margin:0 0 20px 0;">Cuenta Eliminada</h2>
      <div style="background:#1e293b;border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="color:#e2e8f0;font-size:15px;margin:0 0 12px;">Hola <strong style="color:#FFC107">${toName}</strong>,</p>
        <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Tu cuenta ha sido <strong style="color:#ff6b6b">eliminada permanentemente</strong> de nuestro sistema.
        </p>
        <div style="background:rgba(255,107,107,0.1);border-left:4px solid #ff6b6b;padding:12px;border-radius:6px;margin:16px 0;">
          <p style="color:#ff6b6b;font-size:13px;margin:0;"><strong>⚠️ Información importante:</strong></p>
          <ul style="color:#cbd5e1;font-size:13px;margin:8px 0 0 0;padding-left:20px;">
            <li>Tu historial de compras ha sido conservado por motivos legales</li>
            <li>Tus datos personales han sido eliminados</li>
            <li>Si deseas volver a comprar, deberás registrarte nuevamente</li>
          </ul>
        </div>
      </div>
      <p style="color:#64748b;font-size:12px;text-align:center;margin:20px 0 0;">
        Gracias por haber sido parte de Gorras Medellín.
      </p>
    </div>`
    );
};

// === CONTROLADOR ===
const clienteController = {
    getAllClientes: async (req, res) => {
        try {
            const { page = 1, limit = 7, search = '', ciudad, estado, tipoDocumento } = req.query;
            const offset = (page - 1) * limit;
            const where = {};
            if (search) where[Op.or] = [
                { nombreCompleto: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { telefono: { [Op.iLike]: `%${search}%` } }
            ];
            if (ciudad) where.ciudad = { [Op.iLike]: `%${ciudad}%` };
            if (tipoDocumento) where.tipoDocumento = tipoDocumento;
            if (estado !== undefined) where.isActive = estado === 'true' || estado === 'Activo';

            const { count, rows } = await Cliente.findAndCountAll({ where, limit: +limit, offset: +offset, order: [['nombreCompleto', 'ASC']] });

            const data = await Promise.all(rows.map(async c => ({
                id: c.id, nombre: c.nombreCompleto, email: c.email,
                numeroDocumento: c.numeroDocumento, telefono: c.telefono || 'No registrado',
                ciudad: c.ciudad || 'No registrada', direccion: c.direccion || 'No registrada',
                isActive: c.isActive, estadoTexto: c.isActive ? 'Activo' : 'Inactivo',
                tipoDocumento: c.getTipoDocumentoTexto(), documentoCompleto: c.formatearDocumento(),
                estadisticas: {
                    totalCompras: await Venta.sum('total', { where: { idCliente: c.id } }) || 0,
                    cantidadCompras: await Venta.count({ where: { idCliente: c.id } })
                }
            })));

            res.json({ success: true, data, pagination: { currentPage: +page, totalPages: Math.ceil(count / limit), totalItems: count, itemsPerPage: +limit } });
        } catch (error) {
            console.error('Error getAllClientes:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getClienteById: async (req, res) => {
        try {
            const { id } = req.params;
            if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
            const cliente = await Cliente.findByPk(id);
            if (!cliente) return res.status(404).json({ success: false, message: 'No encontrado' });

            const compras = await Venta.findAll({ where: { idCliente: id }, order: [['fecha', 'DESC']], limit: 10 });
            const totalCompras = await Venta.sum('total', { where: { idCliente: id } }) || 0;
            const cantidadCompras = await Venta.count({ where: { idCliente: id } });

            res.json({
                success: true,
                data: {
                    ...cliente.toJSON(),
                    TipoDocumentoTexto: cliente.getTipoDocumentoTexto(),
                    DocumentoFormateado: cliente.formatearDocumento(),
                    EstadoTexto: cliente.isActive ? 'Activo' : 'Inactivo',
                    Estadisticas: { totalCompras, cantidadCompras, promedioCompras: cantidadCompras > 0 ? totalCompras / cantidadCompras : 0 },
                    UltimasCompras: compras.map(c => ({ IdVenta: c.IdVenta, Fecha: c.Fecha, Total: c.Total }))
                }
            });
        } catch (error) {
            console.error('Error getClienteById:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createCliente: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const errors = await validateCliente(req.body);
            if (errors.length > 0) { await transaction.rollback(); return res.status(400).json({ success: false, errors }); }

            const cliente = await Cliente.create({ ...sanitizeCliente(req.body), isActive: true }, { transaction });
            await transaction.commit();

            res.status(201).json({ success: true, data: { ...cliente.toJSON(), tipoDocumentoTexto: cliente.getTipoDocumentoTexto() }, message: 'Cliente registrado' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error createCliente:', error);
            if (error.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ success: false, message: 'Documento o email ya registrado' });
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateCliente: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            if (isNaN(id)) { await transaction.rollback(); return res.status(400).json({ success: false, message: 'ID inválido' }); }

            const cliente = await Cliente.findByPk(id);
            if (!cliente) { await transaction.rollback(); return res.status(404).json({ success: false, message: 'No encontrado' }); }

            const errors = await validateCliente(req.body, id);
            if (errors.length > 0) { await transaction.rollback(); return res.status(400).json({ success: false, errors }); }

            await cliente.update(sanitizeCliente(req.body), { transaction });
            await transaction.commit();

            res.json({ success: true, data: { ...cliente.toJSON(), tipoDocumentoTexto: cliente.getTipoDocumentoTexto() }, message: 'Actualizado' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error updateCliente:', error);
            if (error.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ success: false, message: 'Documento o email ya registrado' });
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ MODIFICADO: Eliminación con solicitud (NO envía correo al solicitar)
    deleteCliente: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            if (isNaN(id)) { await transaction.rollback(); return res.status(400).json({ success: false, message: 'ID inválido' }); }

            const cliente = await Cliente.findByPk(id);
            if (!cliente) { await transaction.rollback(); return res.status(404).json({ success: false, message: 'No encontrado' }); }

            const activeSales = await Venta.count({ where: { idCliente: id, idEstado: { [Op.notIn]: ['Anulada', 'anulada'] } } });

            if (activeSales > 0) {
                // ✅ Solo crear solicitud, NO enviar correo
                const requestId = `del-${id}-${Date.now()}`;
                deletionRequests.set(requestId, {
                    id: requestId,
                    clienteId: id,
                    clienteNombre: cliente.nombreCompleto,
                    clienteEmail: cliente.email,
                    ventasActivas: activeSales,
                    fecha: new Date().toISOString(),
                    adminEmail: req.usuario?.email || 'admin@gorrascaps.com',
                    tipo: 'eliminacion'
                });

                await transaction.rollback();
                return res.json({
                    success: true,
                    requiresConfirmation: true,
                    requestId: requestId,
                    message: `Solicitud de eliminación creada. El cliente tiene ${activeSales} venta(s) activa(s).`
                });
            }

            // Sin ventas activas: eliminar directamente
            await Venta.update({ idCliente: null }, { where: { idCliente: id }, transaction });
            await cliente.destroy({ transaction });
            await transaction.commit();

            res.json({ success: true, message: 'Cliente eliminado correctamente' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error deleteCliente:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ MODIFICADO: Desactivación con solicitud (NO envía correo al solicitar)
    toggleClienteStatus: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            if (isNaN(id)) { await transaction.rollback(); return res.status(400).json({ success: false, message: 'ID inválido' }); }

            const cliente = await Cliente.findByPk(id);
            if (!cliente) { await transaction.rollback(); return res.status(404).json({ success: false, message: 'No encontrado' }); }

            const nuevoEstado = !cliente.isActive;

            // Si va a DESACTIVAR y tiene compras activas → crear solicitud (sin enviar correo)
            if (nuevoEstado === false) {
                const activeSales = await Venta.count({
                    where: { idCliente: id, idEstado: { [Op.notIn]: ['Anulada', 'anulada'] } }
                });

                if (activeSales > 0) {
                    const requestId = `desact-${id}-${Date.now()}`;
                    deactivationRequests.set(requestId, {
                        id: requestId,
                        clienteId: id,
                        clienteNombre: cliente.nombreCompleto,
                        clienteEmail: cliente.email,
                        ventasActivas: activeSales,
                        fecha: new Date().toISOString(),
                        adminEmail: req.usuario?.email || 'admin@gorrascaps.com',
                        tipo: 'desactivacion'
                    });

                    await transaction.rollback();
                    return res.json({
                        success: true,
                        requiresConfirmation: true,
                        requestId: requestId,
                        message: `Solicitud de desactivación creada. El cliente tiene ${activeSales} compra(s) activa(s).`
                    });
                }
            }

            // Sin compras activas o va a ACTIVAR → proceder directamente
            await cliente.update({ isActive: nuevoEstado }, { transaction });
            if (cliente.email) {
                await Usuario.update(
                    { estado: nuevoEstado ? 'activo' : 'inactivo' },
                    { where: { email: { [Op.iLike]: cliente.email } }, transaction }
                );
            }
            await transaction.commit();

            res.json({
                success: true,
                data: { id: cliente.id, nombreCompleto: cliente.nombreCompleto, isActive: cliente.isActive },
                message: `Cliente ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error toggleStatus:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ MODIFICADO: Aprobar desactivación → SÍ envía correo
    approveDeactivation: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { requestId } = req.body;
            const request = deactivationRequests.get(requestId);

            if (!request) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }

            const cliente = await Cliente.findByPk(request.clienteId);
            if (!cliente) {
                deactivationRequests.delete(requestId);
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
            }

            // Desactivar cliente y usuario
            await cliente.update({ isActive: false }, { transaction });
            if (cliente.email) {
                await Usuario.update(
                    { estado: 'inactivo' },
                    { where: { email: { [Op.iLike]: cliente.email } }, transaction }
                );
            }

            // ✅ ENVIAR CORREO al cliente
            const emailSent = await sendDeactivationApprovalEmail(cliente.email, cliente.nombreCompleto);

            // ✅ Registrar en trazabilidad
            emailHistory.push({
                id: `hist-${Date.now()}`,
                tipo: 'desactivacion',
                clienteNombre: cliente.nombreCompleto,
                clienteEmail: cliente.email,
                adminEmail: request.adminEmail,
                fecha: new Date().toISOString(),
                ventasActivas: request.ventasActivas,
                emailEnviado: emailSent,
                estado: emailSent ? 'enviado' : 'fallido'
            });

            deactivationRequests.delete(requestId);
            await transaction.commit();

            res.json({
                success: true,
                message: `Cliente ${cliente.nombreCompleto} desactivado y correo enviado`,
                emailSent
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error approveDeactivation:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ MODIFICADO: Aprobar eliminación → SÍ envía correo
    approveDeletion: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { requestId } = req.body;
            const request = deletionRequests.get(requestId);

            if (!request) {
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }

            const cliente = await Cliente.findByPk(request.clienteId);
            if (!cliente) {
                deletionRequests.delete(requestId);
                await transaction.rollback();
                return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
            }

            // Desvincular ventas y eliminar cliente
            await Venta.update({ idCliente: null }, { where: { idCliente: request.clienteId }, transaction });
            await cliente.destroy({ transaction });

            // ✅ ENVIAR CORREO al cliente
            const emailSent = await sendDeletionApprovalEmail(cliente.email, cliente.nombreCompleto);

            // ✅ Registrar en trazabilidad
            emailHistory.push({
                id: `hist-${Date.now()}`,
                tipo: 'eliminacion',
                clienteNombre: cliente.nombreCompleto,
                clienteEmail: cliente.email,
                adminEmail: request.adminEmail,
                fecha: new Date().toISOString(),
                ventasActivas: request.ventasActivas,
                emailEnviado: emailSent,
                estado: emailSent ? 'enviado' : 'fallido'
            });

            deletionRequests.delete(requestId);
            await transaction.commit();

            res.json({
                success: true,
                message: `Cliente ${cliente.nombreCompleto} eliminado y correo enviado`,
                emailSent
            });
        } catch (error) {
            await transaction.rollback();
            console.error('Error approveDeletion:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ NUEVO: Rechazar desactivación
    rejectDeactivation: async (req, res) => {
        try {
            const { requestId } = req.body;
            const request = deactivationRequests.get(requestId);

            if (!request) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }

            deactivationRequests.delete(requestId);
            res.json({ success: true, message: 'Solicitud de desactivación rechazada' });
        } catch (error) {
            console.error('Error rejectDeactivation:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ NUEVO: Rechazar eliminación
    rejectDeletion: async (req, res) => {
        try {
            const { requestId } = req.body;
            const request = deletionRequests.get(requestId);

            if (!request) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
            }

            deletionRequests.delete(requestId);
            res.json({ success: true, message: 'Solicitud de eliminación rechazada' });
        } catch (error) {
            console.error('Error rejectDeletion:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ NUEVO: Obtener solicitudes pendientes
    getSolicitudesPendientes: async (req, res) => {
        try {
            const solicitudes = [
                ...Array.from(deactivationRequests.values()),
                ...Array.from(deletionRequests.values())
            ];
            res.json({ success: true, data: solicitudes, total: solicitudes.length });
        } catch (error) {
            console.error('Error getSolicitudesPendientes:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ✅ NUEVO: Obtener historial de correos enviados (trazabilidad)
    getHistorialCorreos: async (req, res) => {
        try {
            res.json({
                success: true,
                data: emailHistory,
                total: emailHistory.length
            });
        } catch (error) {
            console.error('Error getHistorialCorreos:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getClientesActivos: async (req, res) => {
        try {
            const clientes = await Cliente.findAll({ where: { isActive: true }, attributes: ['id', 'nombreCompleto', 'tipoDocumento', 'numeroDocumento', 'email'], order: [['nombreCompleto', 'ASC']] });
            res.json({ success: true, data: clientes.map(c => ({ id: c.id, nombre: c.nombreCompleto, identificacion: c.formatearDocumento(), email: c.email })) });
        } catch (error) {
            console.error('Error getActivos:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getEstadisticas: async (req, res) => {
        try {
            res.json({
                success: true,
                data: {
                    total: await Cliente.count(),
                    activos: await Cliente.count({ where: { isActive: true } }),
                    inactivos: await Cliente.count({ where: { isActive: false } })
                }
            });
        } catch (error) {
            console.error('Error estadisticas:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateSaldo: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { monto, operacion = 'sumar' } = req.body;
            if (isNaN(id)) { await transaction.rollback(); return res.status(400).json({ success: false, message: 'ID inválido' }); }

            const cliente = await Cliente.findByPk(id);
            if (!cliente) { await transaction.rollback(); return res.status(404).json({ success: false, message: 'No encontrado' }); }

            const saldoActual = parseFloat(cliente.SaldoaFavor) || 0;
            const nuevoSaldo = operacion === 'sumar' ? saldoActual + parseFloat(monto) : saldoActual - parseFloat(monto);

            if (nuevoSaldo < 0) { await transaction.rollback(); return res.status(400).json({ success: false, message: 'Saldo insuficiente' }); }

            await cliente.update({ SaldoaFavor: nuevoSaldo.toString() }, { transaction });
            await transaction.commit();

            res.json({ success: true, data: { IdCliente: cliente.IdCliente, SaldoAnterior: saldoActual, SaldoActual: nuevoSaldo }, message: 'Saldo actualizado' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error updateSaldo:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMiPerfil: async (req, res) => {
        try {
            const cliente = await Cliente.findOne({ where: { email: req.usuario.email } });
            if (!cliente) return res.status(404).json({ success: false, message: 'Perfil no encontrado' });

            const compras = await Venta.findAll({ where: { idCliente: cliente.id }, order: [['fecha', 'DESC']], limit: 10 });
            res.json({ success: true, data: { ...cliente.toJSON(), TipoDocumentoTexto: cliente.getTipoDocumentoTexto(), UltimasCompras: compras } });
        } catch (error) {
            console.error('Error getMiPerfil:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateMiPerfil: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const cliente = await Cliente.findOne({ where: { email: req.usuario.email } });
            if (!cliente) { await transaction.rollback(); return res.status(404).json({ success: false, message: 'Perfil no encontrado' }); }

            const { nombreCompleto, telefono, direccion, ciudad, tipoDocumento, numeroDocumento, email } = req.body;
            const updateData = {
                nombreCompleto: nombreCompleto || cliente.nombreCompleto,
                telefono: telefono || cliente.telefono,
                direccion: direccion || cliente.direccion,
                ciudad: ciudad || cliente.ciudad,
                tipoDocumento: tipoDocumento || cliente.tipoDocumento,
                numeroDocumento: numeroDocumento || cliente.numeroDocumento,
                email: (email || cliente.email).toLowerCase().trim()
            };

            await cliente.update(updateData, { transaction });
            const usuario = await Usuario.findOne({ where: { email: req.usuario.email } });
            if (usuario) {
                await usuario.update({
                    nombre: updateData.nombreCompleto,
                    telefono: updateData.telefono,
                    email: updateData.email
                }, { transaction });
            }
            await transaction.commit();
            res.json({ success: true, data: cliente, message: 'Perfil actualizado' });
        } catch (error) {
            await transaction.rollback();
            console.error('Error updateMiPerfil:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    sendEmailVerification: async (req, res) => {
        try {
            const { nuevoEmail } = req.body;
            if (!nuevoEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail)) return res.status(400).json({ success: false, message: 'Correo inválido' });

            const clienteActual = await Cliente.findOne({ where: { email: req.usuario.email } });
            if (!clienteActual) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

            const emailLower = nuevoEmail.toLowerCase().trim();
            const emailEnUso = await Cliente.findOne({ where: { email: emailLower, id: { [Op.ne]: clienteActual.id } } });
            if (emailEnUso) return res.status(409).json({ success: false, code: 'EMAIL_TAKEN', message: 'Correo ya registrado' });
            if (emailLower === clienteActual.email.toLowerCase()) return res.json({ success: true, code: 'SAME_EMAIL', message: 'Ya es tu correo' });

            const otp = generateOTP();
            otpStore.set(req.usuario.email, { code: otp, expires: Date.now() + 600000, nuevoEmail: emailLower });

            const sent = await sendOtp(emailLower, clienteActual.nombreCompleto, otp);

            if (!sent) {
                return res.status(500).json({ success: false, message: 'No se pudo enviar el código. Intente más tarde.' });
            }

            res.json({ success: true, code: 'OTP_SENT', message: `Código enviado a ${emailLower}` });
        } catch (error) {
            console.error('Error sendVerification:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    confirmEmailVerification: async (req, res) => {
        try {
            const { codigo } = req.body;
            const entry = otpStore.get(req.usuario.email);

            if (!entry) return res.status(400).json({ success: false, message: 'Sin código pendiente' });
            if (Date.now() > entry.expires) { otpStore.delete(req.usuario.email); return res.status(400).json({ success: false, message: 'Código expirado' }); }
            if (String(entry.code) !== String(codigo)) return res.status(400).json({ success: false, message: 'Código incorrecto' });

            otpStore.delete(req.usuario.email);
            res.json({ success: true, code: 'EMAIL_VERIFIED', nuevoEmail: entry.nuevoEmail, message: 'Correo verificado' });
        } catch (error) {
            console.error('Error confirmVerification:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default clienteController;