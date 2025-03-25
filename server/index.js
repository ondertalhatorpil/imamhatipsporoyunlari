const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database'); 

const app = express();

// CORS ayarları
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

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await db.executeQuery('SELECT 1');
        res.status(200).json({ status: 'healthy' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Route'lar
const formRoutes = require('./routes/formRoutes')(db);
const galleryRoutes = require('./routes/galleryRoutes')(db);
const sliderRoutes = require('./routes/sliderRoutes')(db);

app.use('/api', formRoutes);
app.use('/api', galleryRoutes);
app.use('/api', sliderRoutes);

// Static dosya sunumu
const staticOptions = {
    maxAge: '1d',
    dotfiles: 'deny',
    index: false,
    etag: true,
    lastModified: true
};

app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads/gallery'), staticOptions));
app.use('/uploads/slider', express.static(path.join(__dirname, 'uploads/slider'), staticOptions));

// Upload path'lerini logla
console.log('Gallery Uploads Path:', path.join(__dirname, 'uploads/gallery'));
console.log('Slider Uploads Path:', path.join(__dirname, 'uploads/slider'));

// Graceful shutdown
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing HTTP server.');
    server.close(() => {
        console.log('HTTP server closed.');
        // Veritabanı bağlantısı, havuz otomatik olarak kapatılacak
        process.exit(0);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Server başlatma
const port = process.env.PORT || 8082;
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server ${port} portunda çalışıyor`);
    console.log('Ortam:', process.env.NODE_ENV);
    console.log('CORS Origins:', corsOrigins);
    console.log('Upload Paths aktif');
});

// Process handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;