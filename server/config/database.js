require('dotenv').config();
const mysql = require('mysql2');

// Bağlantı havuzu yapılandırması
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,         // Daha düşük bağlantı limiti
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, // 10 saniyede bir keepalive
    connectTimeout: 60000,        // 60 saniye bağlantı zaman aşımı
    acquireTimeout: 60000,        // 60 saniye edinme zaman aşımı
    timeout: 60000,               // 60 saniye genel zaman aşımı
    namedPlaceholders: true      
});

// Promise wrapper'ı
const promisePool = pool.promise();

// Bağlantı havuzu hata yönetimi
pool.on('error', async (err) => {
    console.error('Beklenmeyen veritabanı hatası:', err);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Veritabanı bağlantısı kapatıldı. Yeniden bağlanmaya çalışılacak.');
        // Yeniden bağlantı için bekle
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Veritabanında çok fazla bağlantı var.');
        // Havuzu zorla yenile
        try {
            await promisePool.query('SELECT 1');
        } catch (error) {
            console.error('Havuz yenileme hatası:', error);
        }
    }
    
    if (err.code === 'ECONNREFUSED') {
        console.error('Veritabanı bağlantısı reddedildi.');
        await new Promise(resolve => setTimeout(resolve, 5000));
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
        
        // Kritik hata durumları
        if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
            error.code === 'ECONNREFUSED' ||
            error.message.includes('closed state')) {
            console.error('Kritik veritabanı hatası. Yeniden bağlanmaya çalışılacak.');
            
            // Kısa bekleme süresi
            await new Promise(resolve => setTimeout(resolve, 5000));
            return false;
        }
        return false;
    }
}

// Sorgu yürütme fonksiyonu - Otomatik yeniden deneme mekanizması
async function executeQuery(sql, params = [], maxRetries = 3) {
    let retries = 0;
    
    while (retries <= maxRetries) {
        let connection;
        try {
            // Bağlantı havuzundan bir bağlantı al
            connection = await promisePool.getConnection();
            
            try {
                // Bağlantı kapalı mı kontrol et (ping)
                await connection.query('SELECT 1');
                
                // Ana sorguyu çalıştır
                const [results] = await connection.query({
                    sql,
                    timeout: 30000 // 30 saniye zaman aşımı
                }, params);
                
                return results;
            } finally {
                // Her durumda bağlantıyı serbest bırak
                if (connection) {
                    try {
                        connection.release();
                    } catch (releaseError) {
                        console.error('Bağlantı serbest bırakma hatası:', releaseError);
                    }
                }
            }
        } catch (error) {
            console.error(`Sorgu hatası (deneme ${retries+1}/${maxRetries+1}):`, error);
            
            // Belirli hatalar için yeniden deneme
            if ((error.message && error.message.includes('closed state') || 
                 error.code === 'PROTOCOL_CONNECTION_LOST' ||
                 error.code === 'ECONNREFUSED' ||
                 error.code === 'ER_LOCK_WAIT_TIMEOUT') && 
                retries < maxRetries) {
                
                retries++;
                const waitTime = Math.min(1000 * Math.pow(2, retries), 10000); // max 10 saniye
                console.log(`Yeniden sorgu denemesi ${retries}/${maxRetries} - ${waitTime}ms bekleniyor`);
                
                // Artan bekleme süresi
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            // Başarısız yeniden denemeler sonrası hata fırlat
            throw error;
        }
    }
}

// Bağlantı testi - 60 saniyede bir
setInterval(async () => {
    await testConnection();
}, 60000);

// Bağlantı havuzu periyodik temizliği - saatte bir
setInterval(async () => {
    try {
        console.log("Bağlantı havuzu periyodik temizliği başlatılıyor...");
        await promisePool.query("/* ping */ SELECT 1");
        console.log("Bağlantı havuzu periyodik temizliği tamamlandı");
    } catch (error) {
        console.error("Bağlantı havuzu temizleme hatası:", error);
    }
}, 3600000); // Her saat başı

// Modül dışa aktarımı
module.exports = {
    pool: promisePool,
    executeQuery,
    testConnection,
    // Havuzu kapatma fonksiyonu
    closePool: async () => {
        try {
            await promisePool.end();
            console.log('Veritabanı havuzu başarıyla kapatıldı');
            return true;
        } catch (error) {
            console.error('Veritabanı havuzu kapatma hatası:', error);
            return false;
        }
    }
};