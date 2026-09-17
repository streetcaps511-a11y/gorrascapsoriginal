import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelizeOptions = {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 10,
        min: 2,
        acquire: 60000,
        idle: 10000
    }
};

export const sequelize = new Sequelize(
    process.env.DB_NAME || process.env.DATABASE_NAME,
    process.env.DB_USER || process.env.DATABASE_USER,
    process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD,
    {
        host: process.env.DB_HOST || process.env.DATABASE_HOST,
        port: process.env.DB_PORT || process.env.DATABASE_PORT || 5432,
        ...sequelizeOptions
    }
);

export async function connectDB() {
    let retries = 5;
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('✅ Conexión a PostgreSQL establecida correctamente.');
            return true;
        } catch (error) {
            console.error(`❌ Error al conectar (Intentos restantes: ${retries - 1}):`, error.message);
            retries -= 1;
            if (retries === 0) {
                console.log('💡 Verifica tus variables de entorno en .env');
                throw error;
            }
            await new Promise(res => setTimeout(res, 3000));
        }
    }
}