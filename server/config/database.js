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
    keepAliveInitialDelay: 10000,
    connectTimeout: 60000,       // Bağlantı zaman aşımı (60 saniye)
    acquireTimeout: 60000,       // Bağlantı edinme zaman aşımı
    timeout: 60000,              // Genel sorgu zaman aşımı
    idleTimeout: 60000,          // Boşta bağlantı maksimum süresi
    maxIdle: 10                  // Havuzda tutulacak maksimum boşta bağlantı sayısı
});

// Promise wrapper'ı kullanın
const promisePool = pool.promise();

// Bağlantı havuzu hata yönetimi
pool.on('error', (err) => {
    console.error('Beklenmeyen veritabanı hatası:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Veritabanı bağlantısı kapatıldı.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Veritabanında çok fazla bağlantı var.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.error('Veritabanı bağlantısı reddedildi.');
    }
});

// Bağlantı testi fonksiyonu
async function testConnection() {
    try {
        const [rows] = await promisePool.query('SELECT 1');
        console.log('Veritabanı bağlantı testi başarılı');
        return true;
    } catch (error) {
        console.error('Veritabanı bağlantı testi başarısız:', error);
        
        // Bağlantı hatası durumunda bağlantıyı yenilemeye çalış
        try {
            console.log('Yeniden bağlanmaya çalışılıyor...');
            // mysql2 genellikle otomatik yeniden bağlanır, bu kısımda özel işlemler yapılabilir
            return false;
        } catch (reconnectError) {
            console.error('Yeniden bağlantı başarısız:', reconnectError);
            return false;
        }
    }
}

// Sorgu yürütme yardımcı fonksiyonu
async function executeQuery(sql, params = []) {
    try {
        const connection = await promisePool.getConnection();
        try {
            const [results] = await connection.query({
                sql,
                timeout: 30000 // 30 saniye zaman aşımı
            }, params);
            return results;
        } finally {
            // Bağlantıyı her durumda havuza geri ver
            connection.release();
        }
    } catch (error) {
        console.error('Sorgu yürütme hatası:', error);
        throw error;
    }
}

// Her 30 saniyede bir bağlantıyı test et
setInterval(async () => {
    await testConnection();
}, 30000);

// Modül ihracı
module.exports = {
    pool: promisePool,
    executeQuery
};