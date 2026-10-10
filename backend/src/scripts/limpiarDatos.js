// src/scripts/limpiarDatos.js
// 🧹 Script para limpiar datos del sistema dejando SOLO el usuario admin maestro y 1 cliente
import { sequelize } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const limpiarDatos = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
    if (!adminEmail) throw new Error('⚠️ Falta SEED_ADMIN_EMAIL en .env');

    // 1. Obtener el ID del usuario admin maestro para protegerlo
    const [adminRows] = await sequelize.query(
      `SELECT "IdUsuario", "IdRol", "Correo" FROM "Usuarios" WHERE LOWER("Correo") = :email LIMIT 1`,
      { replacements: { email: adminEmail } }
    );

    const adminId = adminRows[0]?.IdUsuario;
    const adminRolId = adminRows[0]?.IdRol;
    console.log(`🔐 Admin maestro protegido: IdUsuario=${adminId}, Correo=${adminEmail}`);

    // 2. Obtener 1 cliente para protegerlo (el primer cliente creado)
    const [clienteRows] = await sequelize.query(
      `SELECT "IdCliente", "Documento", "Nombre", "Email" FROM "Clientes" ORDER BY "IdCliente" ASC LIMIT 1`
    );

    let clienteProtegidoId = clienteRows[0]?.IdCliente;
    let clienteEmail = clienteRows[0]?.Email?.toLowerCase();
    let clienteUserId = null;

    if (clienteEmail) {
      const [uRows] = await sequelize.query(
        `SELECT "IdUsuario" FROM "Usuarios" WHERE LOWER("Correo") = :email LIMIT 1`,
        { replacements: { email: clienteEmail } }
      );
      if (uRows.length > 0) clienteUserId = uRows[0].IdUsuario;
    }

    if (clienteProtegidoId) {
      console.log(`👤 Cliente protegido: IdCliente=${clienteProtegidoId}, Nombre=${clienteRows[0]?.Nombre}, Email=${clienteEmail}`);
    } else {
      console.log('ℹ️ No se encontró cliente previo, se creará uno si no existe.');
    }

    console.log('\n🗑️  Iniciando limpieza...\n');

    const borrar = async (tabla, where = '') => {
      try {
        const query = where
          ? `DELETE FROM "${tabla}" WHERE ${where}`
          : `DELETE FROM "${tabla}"`;
        await sequelize.query(query);
        console.log(`✅ ${tabla} procesada`);
      } catch (e) {
        console.log(`   ⚠️  ${tabla}: ${e.message.split('\n')[0]}`);
      }
    };

    // Eliminar datos dependientes primero
    await borrar('Devoluciones');
    await borrar('DetalleVentas');
    await borrar('Ventas');
    await borrar('CompraDetalles');
    await borrar('Compras');
    await borrar('Imagenes');
    await borrar('Productos');
    await borrar('Categorias');
    await borrar('Proveedores');

    // Limpiar Clientes excepto el protegido
    if (clienteProtegidoId) {
      await borrar('Clientes', `"IdCliente" != ${clienteProtegidoId}`);
      console.log(`   (cliente IdCliente=${clienteProtegidoId} conservado)`);
    }

    // Limpiar Usuarios excepto admin maestro y el usuario del cliente protegido
    const usuariosAExcluir = [];
    if (adminId) usuariosAExcluir.push(adminId);
    if (clienteUserId && clienteUserId !== adminId) usuariosAExcluir.push(clienteUserId);

    if (usuariosAExcluir.length > 0) {
      await borrar('Usuarios', `"IdUsuario" NOT IN (${usuariosAExcluir.join(',')})`);
      console.log(`   (usuarios IdUsuario en [${usuariosAExcluir.join(', ')}] conservados)`);
    } else {
      await borrar('Usuarios', `LOWER("Correo") != '${adminEmail}'`);
    }

    // Si no había ningún cliente, asegurar que existe un cliente de prueba
    if (!clienteProtegidoId) {
      console.log('🌱 Creando cliente base...');
      // Buscar o crear rol Cliente
      const [rolClienteRows] = await sequelize.query(
        `SELECT "IdRol" FROM "Roles" WHERE LOWER("Nombre") = 'cliente' LIMIT 1`
      );
      let idRolCliente = rolClienteRows[0]?.IdRol;
      if (!idRolCliente) {
        const [newRol] = await sequelize.query(
          `INSERT INTO "Roles" ("Nombre", "Estado") VALUES ('Cliente', true) RETURNING "IdRol"`
        );
        idRolCliente = newRol[0]?.IdRol;
      }

      // Crear usuario para el cliente
      const [newClientUser] = await sequelize.query(`
        INSERT INTO "Usuarios" ("Nombre", "Correo", "Clave", "Estado", "IdRol")
        VALUES ('Cliente VIP', 'cliente@gorrascaps.com', '$2a$10$w09aV4z7U4Nq0f/0oW55UeVq.f4K8p/O1CkWa6wE90R2dIu3i.a3e', true, :idRol)
        RETURNING "IdUsuario"
      `, { replacements: { idRol: idRolCliente } });
      const newUserId = newClientUser[0]?.IdUsuario;

      // Crear registro en Clientes
      await sequelize.query(`
        INSERT INTO "Clientes" ("TipoDocumento", "Documento", "Nombre", "Telefono", "Email", "Estado")
        VALUES ('CC', '1000000001', 'Cliente VIP', '3001234567', 'cliente@gorrascaps.com', true)
      `);
      console.log('✅ Cliente base creado con éxito: cliente@gorrascaps.com');
    }

    // Resetear secuencias numéricas
    console.log('\n🔄 Reseteando secuencias de ventas y compras...');
    const sequences = [
      { table: 'Ventas',         col: 'IdVenta' },
      { table: 'DetalleVentas',  col: 'IdDetalleVenta' },
      { table: 'Compras',        col: 'IdCompra' },
      { table: 'CompraDetalles', col: 'IdDetalle' },
      { table: 'Devoluciones',   col: 'IdDevolucion' },
    ];

    for (const { table, col } of sequences) {
      try {
        await sequelize.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', '${col}'), 1, false)`
        );
      } catch (e) {
        // Ignorar si no existe serial
      }
    }

    console.log('\n🎉 ¡LIMPIEZA COMPLETADA CON ÉXITO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔐 Admin maestro conservado: ${adminEmail}`);
    console.log(`👤 Cliente conservado: ${clienteRows[0]?.Email || 'cliente@gorrascaps.com'}`);
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
