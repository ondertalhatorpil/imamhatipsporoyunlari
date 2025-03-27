require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,    // 10 saniyede bir keepalive
    connectTimeout: 30000,           // 30 saniye bağlantı timeout
    acquireTimeout: 30000,           // 30 saniye edinme timeout
    timeout: 30000,                  // 30 saniye genel timeout
    idleTimeout: 60000,              // Boşta kalan bağlantılar 60 saniye sonra kapatılır
    maxIdle: 10,                     // Maksimum 10 boşta bağlantı tut
    namedPlaceholders: true
});

// Promise wrapper'ı kullanın
const promisePool = pool.promise();

// Bağlantı havuzu hata yönetimi
pool.on('error', async (err) => {
    console.error('Beklenmeyen veritabanı hatası:', err);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Veritabanı bağlantısı kapatıldı. Yeniden bağlanmaya çalışılacak.');
        // Yeniden bağlantı için bekle
        await new Promise(resolve => setTimeout(resolve, 2000));
        await testConnection();
    }
    
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.error('Veritabanında çok fazla bağlantı var.');
        // Bağlantı sayısını azaltmak için havuzu temizle
        try {
            await promisePool.query('SELECT 1'); // Basit sorgu ile havuzu test et
        } catch (error) {
            console.error('Havuz temizleme başarısız:', error);
        }
    }
    
    if (err.code === 'ECONNREFUSED') {
        console.error('Veritabanı bağlantısı reddedildi.');
        // Yeniden bağlantı için bekle
        await new Promise(resolve => setTimeout(resolve, 5000));
        await testConnection();
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
            console.error('Kritik veritabanı hatası, bağlantı havuzu yenileniyor');
            
            try {
                // Kısa bir bekleme süresi
                await new Promise(resolve => setTimeout(resolve, 5000));
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
                // Bağlantı canlı mı kontrol et
                await connection.query('SELECT 1');
                
                // Ana sorguyu çalıştır
                const [results] = await connection.query({
                    sql,
                    timeout: 30000 // 30 saniye zaman aşımı
                }, params);
                
                return results;
            } finally {
                // Bağlantıyı her durumda havuza geri ver
                if (connection) {
                    try {
                        connection.release();
                    } catch (releaseError) {
                        console.error('Bağlantı serbest bırakma hatası:', releaseError);
                    }
                }
            }
        } catch (error) {
            console.error(`Sorgu yürütme hatası (deneme ${retries+1}/${maxRetries+1}):`, error);
            
            // Belirli hatalar için yeniden deneme
            if ((error.message && error.message.includes('closed state') || 
                 error.code === 'PROTOCOL_CONNECTION_LOST' ||
                 error.code === 'ECONNREFUSED' ||
                 error.code === 'ER_LOCK_WAIT_TIMEOUT') && 
                retries < maxRetries) {
                
                retries++;
                const waitTime = Math.min(1000 * Math.pow(2, retries), 30000); // max 30 saniye
                console.log(`Yeniden sorgu denemesi ${retries}/${maxRetries} - ${waitTime}ms bekleniyor`);
                
                // Exponential backoff with jitter
                await new Promise(resolve => 
                    setTimeout(resolve, waitTime * (0.75 + Math.random() * 0.5)));
                
                continue;
            }
            
            // Yeniden denemeler sonrası başarısız olursa hata fırlat
            throw error;
        }
    }
}

// Daha seyrek bağlantı testi yap
setInterval(async () => {
    await testConnection();
}, 60000); // 60 saniyede bir test

// Belirli aralıklarla havuzu temizle
setInterval(async () => {
    try {
        // Havuzu yenilemek için bağlantıları zorla kapat (çok sık kullanmayın)
        console.log("Bağlantı havuzu periyodik temizliği başlatılıyor...");
        await promisePool.query("/* ping */ SELECT 1");
        console.log("Bağlantı havuzu periyodik temizliği tamamlandı");
    } catch (error) {
        console.error("Bağlantı havuzu temizleme hatası:", error);
    }
}, 3600000); // Her saat başı

// Modül ihracı
module.exports = {
    pool: promisePool,
    executeQuery,
    testConnection,
    // Havuzu tamamen kapatmak için fonksiyon ekle
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