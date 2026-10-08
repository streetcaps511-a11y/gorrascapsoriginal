/* === CONTROLADOR DE BACKEND (COMPRAS) === 
   Gestiona el registro de entrada de mercancía, actualización de inventario y 
   seguimiento de proveedores. */

import { Op } from 'sequelize';
import { 
    Compra, 
    DetalleCompra, 
    Proveedor, 
    Producto, 
    Categoria,
    sequelize 
} from '../models/index.js';

const compraController = {
    getEstadisticas: async (req, res) => {
        try {
            const total = await Compra.count();
            const totalInversion = await Compra.sum('total') || 0;
            const comprasMes = await Compra.count({ 
                where: { 
                    fecha: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
                } 
            });
            res.json({ success: true, data: { total, totalInversion, comprasMes } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getComprasByProveedor: async (req, res) => {
        try {
            const data = await Compra.findAll({ 
                where: { idProveedor: req.params.proveedorId },
                include: [{ model: DetalleCompra, as: 'detalles' }]
            });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAllCompras: async (req, res) => {
        try {
            const { page = 1, limit = 50 } = req.query;
            const offset = (page - 1) * limit;

            const count = await Compra.count();
            const comprasRows = await Compra.findAll({
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['fecha', 'DESC']],
                include: [
                    { model: Proveedor, as: 'proveedorData', attributes: ['id', 'companyName', 'email'] },
                    { 
                        model: DetalleCompra, 
                        as: 'detalles', 
                        include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre'], paranoid: false }] 
                    }
                ]
            });

            const rowsFormateadas = comprasRows.map(compra => {
                const json = compra.toJSON();
                // 🛡️ Fallback para proveedor borrado
                if (!json.proveedorData) {
                    json.proveedorData = {
                        id: null,
                        companyName: 'Proveedor',
                        email: 'Proveedor Eliminado',
                        isDeleted: true
                    };
                }
                return json;
            });

            res.json({ 
                success: true, 
                data: rowsFormateadas, 
                pagination: { 
                    totalItems: count, 
                    currentPage: parseInt(page), 
                    totalPages: Math.ceil(count / limit) 
                } 
            });
        } catch (error) {
            console.error('❌ Error en getAllCompras:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCompraById: async (req, res) => {
        try {
            const compra = await Compra.findByPk(req.params.id, { 
                include: [
                    { model: Proveedor, as: 'proveedorData' },
                    { 
                        model: DetalleCompra, 
                        as: 'detalles', 
                        include: [{ model: Producto, as: 'producto', paranoid: false }] 
                    }
                ] 
            });
            if (!compra) return res.status(404).json({ success: false, message: 'Compra no encontrada' });
            
            const json = compra.toJSON();
            // 🛡️ Fallback para proveedor borrado
            if (!json.proveedorData) {
                json.proveedorData = {
                    id: null,
                    companyName: 'Proveedor',
                    email: 'Proveedor Eliminado',
                    isDeleted: true
                };
            }
            res.json({ success: true, data: json });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    generarReporte: async (req, res) => {
        res.json({ success: true, message: 'Reporte generado exitosamente' });
    },

    createCompra: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            // Extraer datos del cuerpo de la petición
            const { idProveedor, nfactura, fecha, metodoPago, productos = [] } = req.body;

            // 1. Validar Proveedor
            if (!idProveedor) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    field: 'proveedor',
                    message: 'Falta agregar el proveedor de la compra.'
                });
            }

            // 2. Validar Número de Factura
            if (!nfactura || String(nfactura).trim() === '') {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    field: 'numeroFactura',
                    message: 'Falta agregar el número de factura.'
                });
            }

            // Validar si el número de factura ya fue registrado
            const facturaExistente = await Compra.findOne({
                where: { nfactura: String(nfactura).trim() },
                transaction
            });
            if (facturaExistente) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    field: 'numeroFactura',
                    message: 'Esta factura ya fue registrada'
                });
            }

            // 3. Validar Fecha de Compra
            if (!fecha) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    field: 'fecha',
                    message: 'Falta agregar la fecha de compra.'
                });
            }

            // 4. Validar que la compra contenga productos
            if (!productos || !Array.isArray(productos) || productos.length === 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    field: 'productos',
                    message: 'Falta agregar al menos un producto a la compra.'
                });
            }

            // Límite máximo para valores numéricos en base de datos
            const MAX_PRECIO = 99999999999.99;

            // 5. Validar cada producto, tallas, cantidades y precios
            for (let i = 0; i < productos.length; i++) {
                const itm = productos[i];
                const prodNombre = String(itm.nombre || itm.nombreProducto || '').trim();

                if (!prodNombre) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `prod_${i}`,
                        message: `Falta agregar el nombre del producto en la fila #${i + 1}.`
                    });
                }

                const vars = itm.variantes || [];
                if (!vars || vars.length === 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `talla_${i}_0`,
                        message: `Falta agregar al menos una talla para el producto "${prodNombre}".`
                    });
                }

                for (let vi = 0; vi < vars.length; vi++) {
                    const v = vars[vi];
                    if (!v.talla || String(v.talla).trim() === '') {
                        await transaction.rollback();
                        return res.status(400).json({
                            success: false,
                            field: `talla_${i}_${vi}`,
                            message: `Falta seleccionar la talla en el producto "${prodNombre}".`
                        });
                    }
                    const q = parseInt(v.cantidad);
                    if (isNaN(q) || q <= 0) {
                        await transaction.rollback();
                        return res.status(400).json({
                            success: false,
                            field: `qty_${i}_${vi}`,
                            message: `Falta agregar una cantidad válida para la talla "${v.talla}" del producto "${prodNombre}".`
                        });
                    }
                    if (q > 1000000) {
                        await transaction.rollback();
                        return res.status(400).json({
                            success: false,
                            field: `qty_${i}_${vi}`,
                            message: `La cantidad en la talla "${v.talla}" del producto "${prodNombre}" excedió el límite máximo permitido.`
                        });
                    }
                }

                // Validar precio de compra
                const pc = parseFloat(itm.precioCompra);
                if (isNaN(pc) || pc <= 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `price_${i}`,
                        message: `Falta agregar el precio de compra del producto "${prodNombre}".`
                    });
                }
                if (pc > MAX_PRECIO) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `price_${i}`,
                        message: `El precio de compra del producto "${prodNombre}" excedió el límite máximo permitido.`
                    });
                }

                // Validar precio de venta
                const pv = parseFloat(itm.precioVenta);
                if (isNaN(pv) || pv <= 0) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `sell_${i}`,
                        message: `Falta agregar el precio de venta del producto "${prodNombre}".`
                    });
                }
                if (pv > MAX_PRECIO) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `sell_${i}`,
                        message: `El precio de venta del producto "${prodNombre}" excedió el límite máximo permitido.`
                    });
                }

                // Validar mayoristas si existen
                if (itm.precioMayorista6 && parseFloat(itm.precioMayorista6) > MAX_PRECIO) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `may6_${i}`,
                        message: `El precio mayorista (6) del producto "${prodNombre}" excedió el límite máximo permitido.`
                    });
                }
                if (itm.precioMayorista80 && parseFloat(itm.precioMayorista80) > MAX_PRECIO) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: `may80_${i}`,
                        message: `El precio mayorista (80) del producto "${prodNombre}" excedió el límite máximo permitido.`
                    });
                }
            }

            // -------------------
            // VALIDACIÓN DE FECHA (ajuste automático)
            // -------------------
            const now = new Date(); // fecha actual para comparación
            let fechaValida = new Date(); // valor por defecto = ahora
            if (fecha) {
                const parsed = new Date(fecha);
                if (!isNaN(parsed.getTime())) {
                    if (parsed <= now) {
                        fechaValida = parsed; // fecha válida y no futura
                    } else {
                        console.warn('⚠️ Fecha de compra futura detectada, se ajusta a la fecha actual');
                    }
                } else {
                    console.warn('⚠️ Formato de fecha inválido, se usa la fecha actual');
                }
            }

            const validarPrecio = (valor, nombre) => {
                if (valor == null) return valor;
                const num = parseFloat(valor);
                if (isNaN(num)) return valor;
                if (num > MAX_PRECIO) {
                    console.warn(`⚠️ ${nombre} excede el límite máximo (${MAX_PRECIO}). Se ajusta a ${MAX_PRECIO}`);
                    return MAX_PRECIO;
                }
                return num;
            };

            let totalCompra = 0;
            const detallesFinales = [];

            for (const item of productos) {
                const productId = item.idProducto || item.id;
                
                // Procesar variantes (tallas y cantidades)
                const variantes = item.variantes || [];
                const totalCantidadItem = variantes.reduce((sum, v) => sum + (parseInt(v.cantidad) || 0), 0);

                // Validar precios antes de usarlos
                const precioCompraValido    = validarPrecio(item.precioCompra,    'PrecioCompra');
                const precioVentaValido     = validarPrecio(item.precioVenta,     'PrecioVenta');
                const precioMay6Valido      = validarPrecio(item.precioMayorista6,  'PrecioMayorista6');
                const precioMay80Valido     = validarPrecio(item.precioMayorista80, 'PrecioMayorista80');

                const subtotalItem = totalCantidadItem * (parseFloat(precioCompraValido) || 0);
                const subtotalValido = validarPrecio(subtotalItem, 'Subtotal');
                totalCompra += subtotalItem;

                if (totalCompra > MAX_PRECIO) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        field: 'total',
                        message: 'El total de la compra excedió el límite máximo permitido.'
                    });
                }

                detallesFinales.push({
                    idProducto: productId,
                    nombreProducto: item.nombre || item.nombreProducto,
                    variantes: variantes,
                    cantidad: totalCantidadItem,
                    precioCompra: precioCompraValido,
                    precioVenta: precioVentaValido,
                    precioMayorista6: precioMay6Valido,
                    precioMayorista80: precioMay80Valido,
                    subtotal: subtotalValido,
                    nFactura: nfactura
                });

                // Buscar o crear el producto (primero por ID, luego por nombre)
                let producto = null;
                if (productId) {
                    producto = await Producto.findByPk(productId, { transaction });
                }

                if (!producto && (item.nombre || item.nombreProducto)) {
                    const nombreBuscado = String(item.nombre || item.nombreProducto).trim();
                    if (nombreBuscado) {
                        producto = await Producto.findOne({
                            where: {
                                nombre: { [Op.iLike]: nombreBuscado }
                            },
                            transaction
                        });
                    }
                }

                if (producto) {
                    detallesFinales[detallesFinales.length - 1].idProducto = producto.id;

                    let tallasStock = [];
                    if (Array.isArray(producto.tallasStock)) {
                        tallasStock = JSON.parse(JSON.stringify(producto.tallasStock));
                    } else if (typeof producto.tallasStock === 'string') {
                        try {
                            const parsed = JSON.parse(producto.tallasStock);
                            if (Array.isArray(parsed)) tallasStock = parsed;
                        } catch (e) {
                            tallasStock = [];
                        }
                    }
                    
                    for (const v of variantes) {
                        const tallaNombre = String(v.talla || '').trim() || 'Ajustable';
                        const idx = tallasStock.findIndex(s => String(s.talla || '').toUpperCase().trim() === tallaNombre.toUpperCase());
                        if (idx !== -1) {
                            tallasStock[idx].cantidad = (parseInt(tallasStock[idx].cantidad) || 0) + (parseInt(v.cantidad) || 0);
                        } else {
                            tallasStock.push({ talla: tallaNombre, cantidad: parseInt(v.cantidad) || 0 });
                        }
                    }

                    // Limpiar tallas vacías si existieran
                    tallasStock = tallasStock.filter(t => t.talla && String(t.talla).trim() !== '');

                    const nuevoStockGlobal = tallasStock.reduce((sum, s) => sum + (parseInt(s.cantidad) || 0), 0);
                    
                    // Validar precios antes de actualizar el producto
                    const precioVentaValido = validarPrecio(item.precioVenta, 'PrecioVenta');
                    const precioMayorista6Valido = validarPrecio(item.precioMayorista6, 'PrecioMayorista6');
                    const precioMayorista80Valido = validarPrecio(item.precioMayorista80, 'PrecioMayorista80');
                    await producto.update({
                        tallasStock,
                        stock: nuevoStockGlobal,
                        precioCompra: parseFloat(precioCompraValido) || producto.precioCompra,
                        precioVenta: precioVentaValido !== undefined ? precioVentaValido : producto.precioVenta,
                        precioMayorista6: precioMayorista6Valido !== undefined ? precioMayorista6Valido : producto.precioMayorista6,
                        precioMayorista80: precioMayorista80Valido !== undefined ? precioMayorista80Valido : producto.precioMayorista80
                    }, { transaction });
                } else {
                    // EL PRODUCTO NO EXISTE (ES NUEVO DESDE COMPRAS)
                    const tallasStock = variantes.map(v => ({
                        talla: String(v.talla || '').trim() || 'Ajustable',
                        cantidad: parseInt(v.cantidad) || 0
                    })).filter(t => t.talla && String(t.talla).trim() !== '');
                    const nuevoStockGlobal = tallasStock.reduce((sum, s) => sum + s.cantidad, 0);

                    const precioVentaValido = validarPrecio(item.precioVenta, 'PrecioVenta');
                    const precioMayorista6Valido = validarPrecio(item.precioMayorista6, 'PrecioMayorista6');
                    const precioMayorista80Valido = validarPrecio(item.precioMayorista80, 'PrecioMayorista80');

                    // Asignar categoría válida (del item, una categoría existente 'General' o crear 'General')
                    let categoriaId = item.idCategoria || item.IdCategoria;
                    let categoriaNombre = item.categoria || null;

                    if (categoriaId) {
                        const existeCat = await Categoria.findByPk(categoriaId, { transaction });
                        if (existeCat) {
                            categoriaNombre = existeCat.nombre;
                        } else {
                            categoriaId = null;
                        }
                    }

                    if (!categoriaId) {
                        let cat = await Categoria.findOne({ where: { nombre: { [Op.iLike]: 'General' } }, transaction });
                        if (!cat) {
                            cat = await Categoria.findOne({ order: [['id', 'ASC']], transaction });
                        }
                        if (!cat) {
                            cat = await Categoria.create({
                                nombre: 'General',
                                descripcion: 'Categoría por defecto',
                                estado: true
                            }, { transaction });
                        }
                        categoriaId = cat.id;
                        categoriaNombre = cat.nombre;
                    }

                    producto = await Producto.create({
                        nombre: item.nombre || item.nombreProducto,
                        descripcion: 'Producto registrado automáticamente desde Compras',
                        categoria: categoriaNombre,
                        idCategoria: categoriaId,
                        precioCompra: parseFloat(precioCompraValido) || 0,
                        precioVenta: parseFloat(precioVentaValido) || 0,
                        precioMayorista6: parseFloat(precioMayorista6Valido) || 0,
                        precioMayorista80: parseFloat(precioMayorista80Valido) || 0,
                        stock: nuevoStockGlobal,
                        tallasStock: tallasStock,
                        isActive: false  // Inactivo hasta que se le agreguen imágenes y detalles
                    }, { transaction });

                    // Actualizar el detalle con el ID del producto recién creado
                    detallesFinales[detallesFinales.length - 1].idProducto = producto.id;
                }
            }

            const totalCompraValido = validarPrecio(totalCompra, 'Total');

            const nuevaCompra = await Compra.create({
                idProveedor,
                nfactura,
                fecha: fechaValida,
                fechaRegistro: new Date(),
                total: totalCompraValido,
                metodoPago: metodoPago || 'Efectivo',
                estado: 'Completada'
            }, { transaction });

            for (const d of detallesFinales) {
                await DetalleCompra.create({
                    ...d,
                    idCompra: nuevaCompra.id
                }, { transaction });
            }

            await transaction.commit();
            
            const resultado = await Compra.findByPk(nuevaCompra.id, {
                include: [
                    { model: Proveedor, as: 'proveedorData' },
                    { model: DetalleCompra, as: 'detalles', include: ['producto'] }
                ]
            });

            const jsonResultado = resultado.toJSON();
            // 🛡️ Fallback para proveedor borrado
            if (!jsonResultado.proveedorData) {
                jsonResultado.proveedorData = {
                    id: null,
                    companyName: 'Proveedor',
                    email: 'Proveedor Eliminado',
                    isDeleted: true
                };
            }

            res.status(201).json({ success: true, data: jsonResultado });
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('❌ Error en createCompra:', error);

            let friendlyMessage = error.message;
            if (
                error.original?.code === '22003' || 
                error.parent?.code === '22003' || 
                String(error.message).toLowerCase().includes('numeric field overflow') ||
                String(error.message).toLowerCase().includes('precision')
            ) {
                friendlyMessage = 'Uno de los valores numéricos o el monto total supera el límite máximo permitido (999,999,999,999.99).';
            }

            res.status(400).json({ 
                success: false, 
                message: friendlyMessage,
                field: error.field || null
            });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { estado } = req.body;
            await Compra.update({ estado }, { where: { id: req.params.id } });
            res.json({ success: true, message: 'Estado actualizado correctamente' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    anularCompra: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const compra = await Compra.findByPk(req.params.id, {
                include: [{ model: DetalleCompra, as: 'detalles' }]
            });

            if (!compra || compra.estado === 'Anulada') {
                throw new Error('Compra no encontrada o ya anulada');
            }

            // Revertir stock (Restar lo que se había sumado)
            for (const d of compra.detalles) {
                const producto = await Producto.findByPk(d.idProducto, { transaction });
                if (producto) {
                    const tallasStock = JSON.parse(JSON.stringify(producto.tallasStock || []));
                    const variantes = d.variantes || [];

                    for (const v of variantes) {
                        const idx = tallasStock.findIndex(s => String(s.talla).toUpperCase().trim() === String(v.talla).toUpperCase().trim());
                        if (idx !== -1) {
                            tallasStock[idx].cantidad = Math.max(0, (parseInt(tallasStock[idx].cantidad) || 0) - (parseInt(v.cantidad) || 0));
                        }
                    }

                    const nuevoStockGlobal = tallasStock.reduce((sum, s) => sum + (parseInt(s.cantidad) || 0), 0);
                    await producto.update({ tallasStock, stock: nuevoStockGlobal }, { transaction });
                }
            }

            await compra.update({ estado: 'Anulada' }, { transaction });
            await transaction.commit();

            res.json({ success: true, message: 'Compra anulada correctamente' });
        } catch (error) {
            if (transaction) await transaction.rollback();
            res.status(400).json({ success: false, message: error.message });
        }
    },
    recalcularStock: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            // 1. Obtener todos los productos activos
            const productos = await Producto.findAll({ transaction });

            // 2. Para cada producto, reconstruir tallasStock desde cero
            let productosActualizados = 0;

            for (const producto of productos) {
                // Obtener todos los detalles de compras Completadas para este producto
                const detalles = await DetalleCompra.findAll({
                    where: { idProducto: producto.id },
                    include: [{
                        model: Compra,
                        as: 'compra',
                        where: { estado: 'Completada' },
                        attributes: ['id', 'estado']
                    }],
                    transaction
                });

                if (detalles.length === 0) continue;

                // Acumular cantidades por talla desde todas las compras completadas
                const tallasMap = {};
                for (const detalle of detalles) {
                    const variantes = detalle.variantes || [];
                    for (const v of variantes) {
                        const tallaKey = String(v.talla || '').toUpperCase().trim();
                        if (!tallaKey) continue;
                        tallasMap[tallaKey] = (tallasMap[tallaKey] || 0) + (parseInt(v.cantidad) || 0);
                    }
                }

                // Convertir el mapa a array con el formato original de la talla
                // Usar el nombre de talla tal como viene del detalle (no en mayúsculas)
                const tallasMapOriginal = {};
                for (const detalle of detalles) {
                    const variantes = detalle.variantes || [];
                    for (const v of variantes) {
                        const tallaKey = String(v.talla || '').toUpperCase().trim();
                        if (!tallaKey) continue;
                        if (!tallasMapOriginal[tallaKey]) {
                            tallasMapOriginal[tallaKey] = { talla: v.talla, cantidad: 0 };
                        }
                        tallasMapOriginal[tallaKey].cantidad += (parseInt(v.cantidad) || 0);
                    }
                }

                const nuevasTallasStock = Object.values(tallasMapOriginal);
                const nuevoStockGlobal = nuevasTallasStock.reduce((sum, t) => sum + (t.cantidad || 0), 0);

                await producto.update({
                    tallasStock: nuevasTallasStock,
                    stock: nuevoStockGlobal
                }, { transaction });

                productosActualizados++;
            }

            await transaction.commit();
            res.json({
                success: true,
                message: `Stock recalculado correctamente. ${productosActualizados} productos actualizados.`,
                data: { productosActualizados }
            });
        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error('❌ Error en recalcularStock:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export default compraController;
