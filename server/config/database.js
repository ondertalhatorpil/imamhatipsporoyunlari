require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Promise wrapper'ı kullanın
const promisePool = pool.promise();

// Bağlantı havuzu hata yönetimi
pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Database connection was refused.');
    }
});

// Bağlantı testi fonksiyonu
async function testConnection() {
    try {
        const [rows] = await promisePool.query('SELECT 1');
        console.log('Database connection test successful');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
}

// Her 30 saniyede bir bağlantıyı test et
setInterval(async () => {
    await testConnection();
}, 30000);

module.exports = promisePool;