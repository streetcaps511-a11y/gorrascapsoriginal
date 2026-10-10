/* === CONTROLADOR DE BACKEND === 
   Recibe las solicitudes (Requests) desde las Rutas, procesa las variables enviadas por el cliente, 
   ejecuta las consultas a la base de datos protegiendo contra inyección SQL, 
   y devuelve las respuestas en formato JSON. */

// controllers/tallas.controller.js
import { Op } from 'sequelize';
import Talla from '../models/tallas.model.js';
import { successResponse, errorResponse } from '../utils/response.js';

const tallaController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, search = '', isActive } = req.query;
            const offset = (page - 1) * limit;
            const whereClause = {};
            if (search) whereClause.nombre = { [Op.iLike]: `%${search}%` };
            if (isActive !== undefined) whereClause.isActive = isActive === 'true';

            const { count, rows } = await Talla.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['nombre', 'ASC']]
            });

            return res.json({
                success: true,
                data: rows,
                pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) }
            });
        } catch (error) {
            console.error('SERVER ERROR in tallas.getAll:', error);
            return errorResponse(res, 'Error al obtener tallas', 500, error.message);
        }
    },

    getActivas: async (req, res) => {
        try {
            const tallas = await Talla.findAll({
                where: { isActive: true },
                attributes: ['id', 'nombre', 'cantidad', 'isActive', 'idProducto', 'campos', 'tipo'],
                order: [['nombre', 'ASC']]
            });
            return successResponse(res, tallas, 'Tallas activas');
        } catch (error) {
            return errorResponse(res, 'Error al obtener tallas activas', 500, error.message);
        }
    },

    getById: async (req, res) => {
        try {
            const talla = await Talla.findByPk(req.params.id);
            if (!talla) return errorResponse(res, 'Talla no encontrada', 404);
            return successResponse(res, talla, 'Talla obtenida');
        } catch (error) {
            return errorResponse(res, 'Error al obtener talla', 500, error.message);
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, cantidad = 0, isActive = true, idProducto = null, campos = [], tipo = 'general' } = req.body;
            if (!nombre) return errorResponse(res, 'El nombre es requerido', 400);

            const nueva = await Talla.create({
                nombre: nombre.toUpperCase().trim(),
                cantidad: parseInt(cantidad) || 0,
                isActive,
                idProducto: idProducto ? parseInt(idProducto) : null,
                campos: Array.isArray(campos) ? campos : [],
                tipo
            });
            return successResponse(res, nueva, 'Artículo registrado con éxito', 201);
        } catch (error) {
            return errorResponse(res, 'Error al crear artículo', 500, error.message);
        }
    },

    update: async (req, res) => {
        try {
            const talla = await Talla.findByPk(req.params.id);
            if (!talla) return errorResponse(res, 'Artículo no encontrado', 404);
            
            const { nombre, cantidad, isActive, idProducto, campos, tipo } = req.body;
            const updateData = {};
            if (nombre) updateData.nombre = nombre.toUpperCase().trim();
            if (cantidad !== undefined) updateData.cantidad = parseInt(cantidad);
            if (isActive !== undefined) updateData.isActive = isActive;
            if (idProducto !== undefined) updateData.idProducto = idProducto ? parseInt(idProducto) : null;
            if (campos !== undefined) updateData.campos = Array.isArray(campos) ? campos : [];
            if (tipo !== undefined) updateData.tipo = tipo;

            await talla.update(updateData);
            return successResponse(res, talla, 'Artículo actualizado con éxito');
        } catch (error) {
            return errorResponse(res, 'Error al actualizar artículo', 500, error.message);
        }
    },

    toggleStatus: async (req, res) => {
        try {
            const talla = await Talla.findByPk(req.params.id);
            if (!talla) return errorResponse(res, 'Talla no encontrada', 404);
            await talla.update({ isActive: !talla.isActive });
            return successResponse(res, talla, `Talla ${talla.isActive ? 'activada' : 'desactivada'}`);
        } catch (error) {
            return errorResponse(res, 'Error al cambiar estado', 500, error.message);
        }
    },

    delete: async (req, res) => {
        try {
            await Talla.destroy({ where: { id: req.params.id } });
            res.json({ success: true, message: 'Talla eliminada' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

export default tallaController;