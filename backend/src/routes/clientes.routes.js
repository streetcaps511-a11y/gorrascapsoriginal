import express from 'express';
const router = express.Router();
import clienteController from '../controllers/clientes.controller.js';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware.js';

// Rutas públicas
router.get('/publicos', clienteController.getClientesActivos);

// Rutas protegidas
router.use(verifyToken);

// Rutas para el propio cliente
router.get('/mi/perfil', clienteController.getMiPerfil);
router.put('/mi/perfil', clienteController.updateMiPerfil);
router.post('/mi/verificar-email', clienteController.sendEmailVerification);
router.post('/mi/verificar-email/confirmar', clienteController.confirmEmailVerification);

// Rutas de consulta
const readPerms = ['ver_clientes', 'ver_ventas', 'ver_devoluciones'];
router.get('/', checkPermission(readPerms), clienteController.getAllClientes);
router.get('/activos', checkPermission(readPerms), clienteController.getClientesActivos);
router.get('/estadisticas', checkPermission('ver_clientes'), clienteController.getEstadisticas);
router.get('/:id', checkPermission(readPerms), clienteController.getClienteById);

// ✅ NUEVAS: Rutas de solicitudes y trazabilidad
router.get('/solicitudes-pendientes', checkPermission('ver_clientes'), clienteController.getSolicitudesPendientes);
router.get('/historial-correos', checkPermission('ver_clientes'), clienteController.getHistorialCorreos);

// ✅ NUEVAS: Rutas de aprobación/rechazo
router.post('/desactivaciones/aprobar', checkPermission('activar_clientes'), clienteController.approveDeactivation);
router.post('/desactivaciones/rechazar', checkPermission('activar_clientes'), clienteController.rejectDeactivation);
router.post('/eliminaciones/aprobar', checkPermission('eliminar_clientes'), clienteController.approveDeletion);
router.post('/eliminaciones/rechazar', checkPermission('eliminar_clientes'), clienteController.rejectDeletion);

// Rutas de administración
router.post('/', checkPermission('crear_clientes'), clienteController.createCliente);
router.put('/:id', checkPermission('editar_clientes'), clienteController.updateCliente);
router.patch('/:id/estado', checkPermission('activar_clientes'), clienteController.toggleClienteStatus);
router.patch('/:id/saldo', checkPermission('editar_clientes'), clienteController.updateSaldo);
router.delete('/:id', checkPermission('eliminar_clientes'), clienteController.deleteCliente);

export default router;