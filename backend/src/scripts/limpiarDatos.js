// src/scripts/limpiarDatos.js
// 🧹 Script para limpiar TODOS los datos del sistema EXCEPTO el usuario admin y su rol/permisos
import { sequelize } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const limpiarDatos = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
    if (!adminEmail) throw new Error('⚠️ Falta SEED_ADMIN_EMAIL en .env');

    // Obtener el ID del usuario admin para protegerlo
    const [adminRows] = await sequelize.query(
      `SELECT "IdUsuario", "IdRol" FROM "Usuarios" WHERE "Correo" = :email LIMIT 1`,
      { replacements: { email: adminEmail } }
    );

    if (adminRows.length === 0) {
      console.warn(`⚠️  No se encontró usuario admin con email: ${adminEmail}`);
      console.warn('   Igual se procederá a limpiar el resto de datos.');
    }

    const adminId = adminRows[0]?.IdUsuario;
    const adminRolId = adminRows[0]?.IdRol;
    console.log(`🔐 Admin protegido: IdUsuario=${adminId}, IdRol=${adminRolId}`);

    console.log('\n🗑️  Iniciando limpieza...\n');

    // Helper: borrar tabla con try/catch individual
    const borrar = async (tabla, where = '') => {
      try {
        const query = where
          ? `DELETE FROM "${tabla}" WHERE ${where}`
          : `DELETE FROM "${tabla}"`;
        await sequelize.query(query);
        console.log(`✅ ${tabla} eliminada`);
      } catch (e) {
        console.log(`   ⚠️  ${tabla}: ${e.message.split('\n')[0]}`);
      }
    };

    // 1. Devoluciones (dependen de Ventas)
    await borrar('Devoluciones');

    // 2. DetalleVentas
    await borrar('DetalleVentas');

    // 3. Ventas
    await borrar('Ventas');

    // 4. CompraDetalles (nombre real de la tabla en BD)
    await borrar('CompraDetalles');

    // 5. Compras
    await borrar('Compras');

    // 6. Imagenes de productos
    await borrar('Imagenes');

    // 7. Productos
    await borrar('Productos');

    // 8. Categorias
    await borrar('Categorias');

    // 9. Proveedores
    await borrar('Proveedores');

    // 10. Clientes (todos – los clientes son independientes del admin)
    await borrar('Clientes');

    // 11. Usuarios (excepto el admin)
    if (adminId) {
      await borrar('Usuarios', `"IdUsuario" != ${adminId}`);
      console.log(`   (admin IdUsuario=${adminId} conservado)`);
    } else {
      await borrar('Usuarios', `LOWER("Correo") != '${adminEmail}'`);
      console.log(`   (admin ${adminEmail} conservado por correo)`);
    }

    // 12. Resetear secuencias (IDs empiezan desde 1 de nuevo)
    console.log('\n🔄 Reseteando secuencias...');
    const sequences = [
      { table: 'Ventas',         col: 'IdVenta' },
      { table: 'DetalleVentas',  col: 'IdDetalleVenta' },
      { table: 'Compras',        col: 'IdCompra' },
      { table: 'CompraDetalles', col: 'IdDetalle' },
      { table: 'Productos',      col: 'IdProducto' },
      { table: 'Categorias',     col: 'IdCategoria' },
      { table: 'Proveedores',    col: 'IdProveedor' },
      { table: 'Clientes',       col: 'IdCliente' },
      { table: 'Devoluciones',   col: 'IdDevolucion' },
    ];

    for (const { table, col } of sequences) {
      try {
        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', '${col}'), 1, false)`
        );
        console.log(`   🔄 Secuencia de ${table} reseteada`);
      } catch (e) {
        // Ignorar si no existe secuencia serial
      }
    }

    console.log('\n🎉 ¡LIMPIEZA COMPLETADA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔐 Admin conservado: ${adminEmail}`);
    console.log('📋 Eliminados: Ventas, Compras, Productos,');
    console.log('   Categorias, Proveedores, Clientes, Usuarios (no-admin)');
    console.log('✅ Roles y Permisos del admin: INTACTOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

limpiarDatos();
