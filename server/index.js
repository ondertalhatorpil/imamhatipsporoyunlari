const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// CORS ayarları aynı kalabilir
const corsOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600
}));

app.use(bodyParser.json());

// Health check endpoint ekleyin
app.get('/health', async (req, res) => {
    try {
        const db = require('./database');
        await db.query('SELECT 1');
        res.status(200).json({ status: 'healthy' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Route'ları güncelleyin - artık promise pool kullanacaklar
const formRoutes = require('./routes/formRoutes')(require('./database'));
const galleryRoutes = require('./routes/galleryRoutes')(require('./database'));
const sliderRoutes = require('./routes/sliderRoutes')(require('./database'));

app.use('/api', formRoutes);
app.use('/api', galleryRoutes);
app.use('/api', sliderRoutes);

// Static dosya sunumu aynı kalabilir
const staticOptions = {
    maxAge: '1d',
    dotfiles: 'deny',
    index: false,
    etag: true,
    lastModified: true
};

app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads/gallery'), staticOptions));
app.use('/uploads/slider', express.static(path.join(__dirname, 'uploads/slider'), staticOptions));

// Graceful shutdown ekleyin
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing HTTP server.');
    server.close(() => {
        console.log('HTTP server closed.');
        // Veritabanı bağlantısını kapat
        const db = require('./database');
        db.end().then(() => {
            console.log('Database connections closed.');
            process.exit(0);
        });
    });
});

const port = process.env.PORT || 8082;
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server ${port} portunda çalışıyor`);
    console.log('Ortam:', process.env.NODE_ENV);
    console.log('CORS Origins:', corsOrigins);
    console.log('Upload Paths aktif');
});




// const path = require('path');
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();

// // CORS ayarları - Production için güvenli ayarlar
// const corsOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
// app.use(cors({
//     origin: corsOrigins,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     exposedHeaders: ['Content-Range', 'X-Content-Range'],
//     maxAge: 600 // 10 dakika
// }));

// app.use(bodyParser.json());

// // Veritabanı bağlantısı
// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT || 3306
// });

// db.connect((err) => {
//     if (err) {
//         console.error("Veri Tabanına Bağlanırken Hata Oluştu", err);
//         console.error("Bağlantı detayları:", {
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             database: process.env.DB_NAME,
//             port: process.env.DB_PORT || 3306
//         });
//         process.exit(1);
//     }
//     console.log("Veritabanına Başarıyla Bağlanıldı.");
// });

// const formRoutes = require('./routes/formRoutes')(db);
// const galleryRoutes = require('./routes/galleryRoutes')(db);
// const sliderRoutes = require('./routes/sliderRoutes')(db);

// app.use('/api', formRoutes);
// app.use('/api', galleryRoutes);
// app.use('/api', sliderRoutes);

// // Uploads klasörlerini güvenli bir şekilde statik olarak sun
// const staticOptions = {
//     maxAge: '1d',
//     dotfiles: 'deny',
//     index: false,
//     etag: true,
//     lastModified: true
// };

// app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads/gallery'), staticOptions));
// app.use('/uploads/slider', express.static(path.join(__dirname, 'uploads/slider'), staticOptions));

// // Debug için upload path'lerini logla
// console.log('Gallery Uploads Path:', path.join(__dirname, 'uploads/gallery'));
// console.log('Slider Uploads Path:', path.join(__dirname, 'uploads/slider'));

// const port = process.env.PORT || 8082;
// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server ${port} portunda çalışıyor`);
//     console.log('Ortam:', process.env.NODE_ENV);
//     console.log('CORS Origins:', corsOrigins);
//     console.log('Upload Paths aktif');
// });