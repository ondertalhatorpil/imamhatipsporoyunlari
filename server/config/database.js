require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 20,         // Bağlantı limitini arttırdım
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 5000, // Daha sık keepalive
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    idleTimeout: 30000,          // Boşta kalan bağlantıları daha erken kapat
    maxIdle: 10,
    namedPlaceholders: true      // Named placeholders kullanımı için
});

// Promise wrapper'ı kullanın
const promisePool = pool.promise();

// Bağlantı havuzu hata yönetimi
pool.on('error', (err) => {
    console.error('Beklenmeyen veritabanı hatası:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Veritabanı bağlantısı kapatıldı. Yeniden bağlanmaya çalışılacak.');
        // Burada bağlantı kurtarma mekanizması eklenebilir
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
        
        // Kritik hata durumlarında uygulamanın yeniden başlaması için işaret
        if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
            error.code === 'ECONNREFUSED' ||
            error.message.includes('closed state')) {
            console.error('Kritik veritabanı hatası, tüm havuz yeniden başlatılıyor');
            try {
                // Mevcut pool'u temizle ve yeniden oluştur
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle 
                return false;
            } catch (reconnectError) {
                console.error('Yeniden bağlantı başarısız:', reconnectError);
                return false;
            }
        }
        return false;
    }
}

// Sorgu yürütme yardımcı fonksiyonu - Yeniden deneme mekanizması eklendi
async function executeQuery(sql, params = [], maxRetries = 3) {
    let retries = 0;
    
    while (retries <= maxRetries) {
        let connection;
        try {
            connection = await promisePool.getConnection();
            try {
                const [results] = await connection.query({
                    sql,
                    timeout: 30000 // 30 saniye zaman aşımı
                }, params);
                return results;
            } finally {
                // Bağlantıyı her durumda havuza geri ver
                if (connection) connection.release();
            }
        } catch (error) {
            console.error(`Sorgu yürütme hatası (deneme ${retries+1}/${maxRetries+1}):`, error);
            
            // Belirli hatalar için yeniden deneme
            if ((error.message.includes('closed state') || 
                 error.code === 'PROTOCOL_CONNECTION_LOST' ||
                 error.code === 'ECONNREFUSED') && 
                retries < maxRetries) {
                
                retries++;
                console.log(`Yeniden sorgu denemesi ${retries}/${maxRetries}`);
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries-1)));
                continue;
            }
            
            throw error;
        }
    }
}

// Daha sık bağlantıyı test et
setInterval(async () => {
    await testConnection();
}, 15000); // 15 saniyede bir

// Modül ihracı
module.exports = {
    pool: promisePool,
    executeQuery,
    testConnection
};