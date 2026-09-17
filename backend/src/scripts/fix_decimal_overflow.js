// Script de migración: Aumentar precisión de columnas DECIMAL para evitar numeric field overflow
import { sequelize } from '../config/db.js';

async function migrateNumericColumns() {
  try {
    console.log('🔧 Iniciando migración de columnas DECIMAL...');

    await sequelize.query(`
      ALTER TABLE "DetalleVentas" 
        ALTER COLUMN "Precio" TYPE NUMERIC(15,2),
        ALTER COLUMN "Subtotal" TYPE NUMERIC(15,2)
    `);
    console.log('✅ DetalleVentas: Precio y Subtotal actualizados a NUMERIC(15,2)');

    await sequelize.query(`
      ALTER TABLE "Ventas" 
        ALTER COLUMN "Total" TYPE NUMERIC(15,2),
        ALTER COLUMN "MontoPagado" TYPE NUMERIC(15,2),
        ALTER COLUMN "Monto1" TYPE NUMERIC(15,2),
        ALTER COLUMN "Monto2" TYPE NUMERIC(15,2)
    `);
    console.log('✅ Ventas: Total, MontoPagado, Monto1, Monto2 actualizados a NUMERIC(15,2)');

    console.log('🎉 Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrateNumericColumns();
