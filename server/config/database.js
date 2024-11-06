require('dotenv').config();
const mysql = require('mysql2');

const maxRetries = 5;
let currentRetry = 0;

function connectWithRetry() {
    console.log('MySQL bağlantısı deneniyor...');
    
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 3306
    });

    connection.connect((err) => {
        if (err) {
            console.error('MySQL Bağlantı Hatası:', err);
            currentRetry++;
            if (currentRetry < maxRetries) {
                console.log(`Yeniden deneniyor... (${currentRetry}/${maxRetries})`);
                setTimeout(connectWithRetry, 5000); // 5 saniye bekle
            }
            return;
        }
        console.log('MySQL Veritabanına Başarıyla Bağlanıldı!');
        currentRetry = 0; // Başarılı bağlantıda retry sayacını sıfırla
    });

    connection.on('error', (err) => {
        console.error('MySQL Bağlantı Hatası:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Bağlantı koptu. Yeniden bağlanmaya çalışılıyor...');
            connectWithRetry();
        }
    });

    return connection;
}

const connection = connectWithRetry();
module.exports = connection;