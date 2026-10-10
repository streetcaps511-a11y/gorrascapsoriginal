// src/config/migrations.js
import { sequelize } from './db.js';
import { Color } from '../models/index.js';

// ─── Helpers para generar SQL dinámicamente ───
const dropCols = (tabla, cols) =>
  `ALTER TABLE "${tabla}" ${cols.map(c => `DROP COLUMN IF EXISTS "${c}"`).join(', ')}`;

const addCols = (tabla, cols) =>
  `ALTER TABLE "${tabla}" ${cols.map(([name, type]) => `ADD COLUMN IF NOT EXISTS "${name}" ${type}`).join(', ')}`;

const alterCols = (tabla, cols) =>
  `ALTER TABLE "${tabla}" ${cols.map(([name, type]) => `ALTER COLUMN "${name}" TYPE ${type}`).join(', ')}`;

export const runMigrations = async () => {
  console.log('🔄 Ejecutando migraciones automáticas...');

  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 AUTO-MIGRACIÓN DE ESTADOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const estadosMap = { '1': 'Completada', '2': 'Pendiente', '3': 'Rechazada' };

    await sequelize.query(`
      ALTER TABLE "Ventas" DROP CONSTRAINT IF EXISTS "Ventas_IdEstado_fkey";
      ALTER TABLE "Ventas" ALTER COLUMN "IdEstado" TYPE VARCHAR(50) USING "IdEstado"::text;
    `);

    for (const [old, nuevo] of Object.entries(estadosMap)) {
      await sequelize.query(`UPDATE "Ventas" SET "IdEstado" = '${nuevo}' WHERE "IdEstado" = '${old}'`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔌 ELIMINAR FK HACIA PRODUCTOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      const [constraints] = await sequelize.query(`
        SELECT tc.constraint_name, tc.table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name IN ('DetalleVentas', 'CompraDetalles', 'Devoluciones')
          AND ccu.table_name = 'Productos';
      `);
      for (const row of constraints) {
        console.log(`🔌 Auto-removiendo FK "${row.constraint_name}" de "${row.table_name}"...`);
        await sequelize.query(`ALTER TABLE public."${row.table_name}" DROP CONSTRAINT "${row.constraint_name}"`);
      }
    } catch (e) {
      console.warn('⚠️ No se pudieron remover FK de Productos:', e.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 MIGRACIÓN VENTAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      await sequelize.query(addCols('Ventas', [
        ['Comprobante2', 'VARCHAR(500)'],
        ['MontoPagado', 'DECIMAL(10, 2) DEFAULT 0'],
        ['Monto1', 'DECIMAL(10, 2) DEFAULT 0'],
        ['Monto2', 'DECIMAL(10, 2) DEFAULT 0'],
        ['FechaEnvio', 'TIMESTAMP WITH TIME ZONE'],
        ['FechaEntrega', 'TIMESTAMP WITH TIME ZONE'],
        ['EsManual', 'BOOLEAN DEFAULT FALSE'],
      ]));

      await sequelize.query(`
        ALTER TABLE "Ventas" ALTER COLUMN "IdCliente" DROP NOT NULL;
        ALTER TABLE "Ventas" DROP COLUMN IF EXISTS "ClienteNombreHistorico";
        UPDATE "Ventas" SET "EsManual" = TRUE WHERE "IdEstado" = 'Completada';
      `);
    } catch (e) {
      console.warn('⚠️ Error migración Ventas:', e.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 MIGRACIÓN COMPRAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      await sequelize.query(`
        ALTER TABLE "Compras" 
          ALTER COLUMN "IdProveedor" DROP NOT NULL,
          DROP COLUMN IF EXISTS "ProveedorNombreHistorico",
          ADD COLUMN IF NOT EXISTS "FechaRegistro" DATE;
      `);
    } catch (e) {
      console.warn('⚠️ Error migración Compras:', e.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 PRECISIÓN NUMÉRICA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      const tablasNumericas = {
        Compras: ['Total'],
        CompraDetalles: ['Subtotal', 'PrecioCompra', 'PrecioVenta', 'PrecioMayorista6', 'PrecioMayorista80'],
        Productos: ['PrecioCompra', 'PrecioVenta', 'PrecioMayorista6', 'PrecioMayorista80'],
      };
      for (const [tabla, cols] of Object.entries(tablasNumericas)) {
        await sequelize.query(alterCols(tabla, cols.map(c => [c, 'NUMERIC(14, 2)'])));
      }
    } catch (e) {
      console.warn('⚠️ Nota precisión numérica:', e.message);
    }

    await sequelize.query('ALTER TABLE "Productos" DROP COLUMN IF EXISTS "Destacado"');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧹 LIMPIAR/RENOMBRAR COMPRAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      await sequelize.query(dropCols('Compras', [
        'TotalFactura', 'totalfactura',
        'NoCompras', 'nocompras',
        'NoCompra', 'nocompra',
      ]));

      const [nfacturaCols] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'Compras' AND column_name = 'Nfactura';
      `);

      if (nfacturaCols.length === 0) {
        const [oldCols] = await sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'Compras' AND column_name IN ('NumeroRecibo', 'numeroRecibo', 'nrecibo', 'NRecibo');
        `);
        if (oldCols.length > 0) {
          const oldCol = oldCols[0].column_name;
          console.log(`🔄 Renombrando "${oldCol}" a "Nfactura"...`);
          await sequelize.query(`ALTER TABLE "Compras" RENAME COLUMN "${oldCol}" TO "Nfactura"`);
        } else {
          await sequelize.query('ALTER TABLE "Compras" ADD COLUMN "Nfactura" VARCHAR(100)');
        }
      } else {
        await sequelize.query(dropCols('Compras', ['NumeroRecibo', 'numeroRecibo']));
      }
    } catch (e) {
      console.warn('⚠️ No se pudieron limpiar columnas de Compras:', e.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 REORDENAR PROVEEDORES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, ordinal_position FROM information_schema.columns 
        WHERE table_name = 'Proveedores' ORDER BY ordinal_position;
      `);
      const hasDepartamento = columns.some(c => c.column_name.toLowerCase() === 'departamento');
      const tipoProvPos = columns.find(c => c.column_name === 'TipoProveedor')?.ordinal_position;

      if (hasDepartamento || (tipoProvPos && tipoProvPos !== 2)) {
        console.log('🔄 Reconstruyendo tabla Proveedores...');
        const [fkConstraints] = await sequelize.query(`
          SELECT tc.constraint_name, tc.table_name
          FROM information_schema.table_constraints AS tc 
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'Proveedores';
        `);

        for (const row of fkConstraints) {
          console.log(`🔌 Removiendo FK "${row.constraint_name}" de "${row.table_name}"...`);
          await sequelize.query(`ALTER TABLE public."${row.table_name}" DROP CONSTRAINT "${row.constraint_name}"`);
        }

        await sequelize.query('DROP TABLE IF EXISTS "Proveedores_backup"');
        await sequelize.query('CREATE TABLE "Proveedores_backup" AS SELECT * FROM "Proveedores"');
        await sequelize.query('DROP TABLE IF EXISTS "Proveedores" CASCADE');

        await sequelize.query(`
          CREATE TABLE "Proveedores" (
            "IdProveedor" SERIAL NOT NULL,
            "TipoProveedor" CHARACTER VARYING(50) DEFAULT 'Persona Jurídica'::character varying,
            "Nombre" CHARACTER VARYING(255) NOT NULL,
            "TipoDocumento" CHARACTER VARYING(50) NOT NULL,
            "NumeroDocumento" CHARACTER VARYING(20) NOT NULL,
            "Telefono" CHARACTER VARYING(20),
            "Direccion" CHARACTER VARYING(200),
            "Email" CHARACTER VARYING(100) NOT NULL,
            "Estado" BOOLEAN NOT NULL DEFAULT true,
            "Ciudad" CHARACTER VARYING(100),
            "Contacto" CHARACTER VARYING(255),
            CONSTRAINT "Proveedores_pkey" PRIMARY KEY ("IdProveedor")
          );
        `);

        await sequelize.query(`
          INSERT INTO "Proveedores" ("IdProveedor", "TipoProveedor", "Nombre", "TipoDocumento", "NumeroDocumento", "Telefono", "Direccion", "Email", "Estado", "Ciudad", "Contacto")
          SELECT "IdProveedor", "TipoProveedor", "Nombre", "TipoDocumento", "NumeroDocumento", "Telefono", "Direccion", "Email", "Estado", "Ciudad", "Contacto"
          FROM "Proveedores_backup";
        `);

        await sequelize.query('DROP TABLE IF EXISTS "Proveedores_backup"');

        for (const row of fkConstraints) {
          console.log(`🔌 Restaurando FK "${row.constraint_name}" en "${row.table_name}"...`);
          if (row.table_name === 'Compras') {
            await sequelize.query(`
              ALTER TABLE "Compras" 
              ADD CONSTRAINT "Compras_IdProveedor_fkey" 
              FOREIGN KEY ("IdProveedor") REFERENCES "Proveedores"("IdProveedor") 
              ON DELETE SET NULL ON UPDATE CASCADE;
            `);
          }
        }
        console.log('✅ Reconstrucción de Proveedores completada.');
      }
    } catch (e) {
      console.warn('⚠️ No se pudo reconstruir Proveedores:', e.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 COLUMNAS EXTRA VARIAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await sequelize.query(addCols('DetalleVentas', [['NombreProducto', 'VARCHAR(255)']]));
    await sequelize.query(addCols('Productos', [['DeletedAt', 'TIMESTAMP WITH TIME ZONE']]));

  } catch (e) {
    console.warn('⚠️ Error en bloque principal:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 DEVOLUCIONES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await sequelize.query('ALTER TABLE "Devoluciones" RENAME COLUMN "esMasiva" TO "pedidoCompleto"').catch(() => {});
    await sequelize.query(addCols('Devoluciones', [
      ['pedidoCompleto', 'BOOLEAN DEFAULT FALSE'],
      ['idLote', 'VARCHAR(100) NULL'],
      ['MismoModelo', 'BOOLEAN DEFAULT false'],
    ]));
    await sequelize.query('ALTER TABLE "Devoluciones" ALTER COLUMN "IdProducto" DROP NOT NULL').catch(() => {});
  } catch (e) {
    console.warn('⚠️ No se pudo actualizar Devoluciones:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 TAMAÑO NUMÉRICO VENTAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await sequelize.query(alterCols('Ventas', [
      ['Total', 'NUMERIC(15,2)'],
      ['MontoPagado', 'NUMERIC(15,2)'],
      ['Monto1', 'NUMERIC(15,2)'],
      ['Monto2', 'NUMERIC(15,2)'],
    ]));
  } catch (e) {
    console.warn('⚠️ No se pudo actualizar tamaño numérico Ventas:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 USUARIOS SESSION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await sequelize.query(addCols('Usuarios', [
      ['SessionId', 'VARCHAR(255)'],
      ['LastActivity', 'TIMESTAMP WITH TIME ZONE'],
      ['SessionIdApp', 'VARCHAR(255)'],
      ['LastActivityApp', 'TIMESTAMP WITH TIME ZONE'],
    ]));
  } catch (e) {
    console.warn('⚠️ No se pudieron añadir columnas de sesión:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 ROL CLIENTE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await sequelize.query(`UPDATE "Roles" SET "Descripcion" = 'Acceso a la página principal' WHERE "Nombre" = 'Cliente'`);
  } catch (e) {
    console.warn('⚠️ No se pudo actualizar rol Cliente:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 COLORES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await Color.sync();
    const count = await Color.count();
    if (count === 0) {
      console.log('🌱 Sembrando colores iniciales...');
      await Color.bulkCreate([
        { nombre: 'Negro', hex: '#000000' },
        { nombre: 'Blanco', hex: '#FFFFFF' },
        { nombre: 'Rojo', hex: '#EF4444' },
        { nombre: 'Azul', hex: '#3B82F6' },
        { nombre: 'Gris', hex: '#6B7280' },
        { nombre: 'Amarillo', hex: '#F5C81B' },
      ]);
      console.log('✅ Colores sembrados correctamente');
    }
  } catch (e) {
    console.error('❌ Error sincronizando Colores:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 DEVOLUCIONES (columnas extra finales)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await sequelize.query(addCols('Devoluciones', [
      ['NombreCliente', 'VARCHAR(255)'],
      ['Talla', 'VARCHAR(20)'],
      ['IdProductoCambio', 'INTEGER'],
    ]));
  } catch (e) {
    console.error('❌ Error migrando Devoluciones:', e.message);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 ARTÍCULOS / TALLAS (campos dinámicos y mapeo producto)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  try {
    await sequelize.query(addCols('Tallas', [
      ['IdProducto', 'INTEGER'],
      ['Campos', 'JSONB DEFAULT \'[]\''],
      ['Tipo', 'VARCHAR(50) DEFAULT \'general\''],
    ]));
  } catch (e) {
    console.error('❌ Error migrando Tallas/Artículos:', e.message);
  }

  console.log('✅ Migraciones completadas');
};