// server.js
import { connectDB, sequelize } from './src/config/db.js';
import app from './src/app.js';
import { runMigrations } from './src/config/migrations.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Conectar a la base de datos
    await connectDB();
    console.log('✅ Base de datos conectada');

    // 2. Ejecutar migraciones automáticas
    await runMigrations();

    // 3. Background Job: Auto-actualizar 'Enviado' a 'Entregado' cada 2 minutos
    setInterval(async () => {
      try {
        const [results] = await sequelize.query(`
          UPDATE "Ventas" 
          SET "StatusEnvio" = 'Entregado', "FechaEntrega" = NOW() 
          WHERE "StatusEnvio" = 'Enviado' 
          AND "FechaEnvio" IS NOT NULL 
          AND NOW() >= "FechaEnvio" + INTERVAL '2 minutes'
          RETURNING "IdVenta";
        `);
        if (results && results.length > 0) {
          console.log(`📦 Auto-actualizados ${results.length} pedidos de 'Enviado' a 'Entregado'`);
        }
      } catch (err) {
        console.error('⚠️ Error en job auto-actualización:', err.message);
      }
    }, 120000); // 2 minutos

    // 4. Escuchar en el puerto
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
    });

    // Manejo de error: Puerto ocupado
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} ya está siendo usado.`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

// Manejo de apagado elegante
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Recibido ${signal}, cerrando conexiones...`);
  try {
    if (sequelize) await sequelize.close();
    console.log('✅ Conexiones de base de datos liberadas.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error cerrando la base de datos', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));