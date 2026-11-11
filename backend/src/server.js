
const app = require('./app');
const mysql = require('mysql2/promise');
const redis = require('redis');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        const db = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'mobci_user',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'mobci',
            waitForConnections: true,
            connectionLimit: 10
        });

        await db.query('SELECT 1');

        console.log('MySQL connection established');

        const redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        redisClient.on('error', (error) => {
            console.error('Redis error:', error.message);
        });

        await redisClient.connect();

        console.log('Redis connection established');

        app.locals.db = db;
        app.locals.redis = redisClient;

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`MobCI backend started on port ${PORT}`);
        });

    } catch (error) {
        console.error('Backend startup error:', error);
        process.exit(1);
    }
}

startServer();
