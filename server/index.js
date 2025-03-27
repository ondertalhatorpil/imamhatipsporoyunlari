const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();

// CORS ayarları
const corsOrigins = process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
    ['https://imamhatipsporoyunlari.com'];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600
}));

// Body parser ayarları
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Request timeout middleware
app.use((req, res, next) => {
    // 120 saniyelik bir request timeout ayarla
    req.setTimeout(120000, () => {
        console.error(`Request timeout for ${req.method} ${req.url}`);
        if (!res.headersSent) {
            res.status(503).json({
                error: 'Service Unavailable',
                message: 'Request timeout'
            });
        }
    });
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await db.executeQuery('SELECT 1');
        res.status(200).json({ 
            status: 'healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy', 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Route'lar
const formRoutes = require('./routes/formRoutes')(db);
const galleryRoutes = require('./routes/galleryRoutes')(db);
const sliderRoutes = require('./routes/sliderRoutes')(db);

app.use('/api', formRoutes);
app.use('/api', galleryRoutes);
app.use('/api', sliderRoutes);

// Rate limiting middleware
const rateLimit = (windowMs, max) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        
        // Timeout'u geçmiş istekleri temizle
        if (requests.has(ip)) {
            const reqs = requests.get(ip).filter(time => now - time < windowMs);
            requests.set(ip, reqs);
            
            if (reqs.length >= max) {
                return res.status(429).json({ 
                    error: 'Too Many Requests',
                    message: 'Please try again later'
                });
            }
            
            reqs.push(now);
        } else {
            requests.set(ip, [now]);
        }
        
        next();
    };
};

// API rotalarına rate limiting uygula
app.use('/api', rateLimit(60 * 1000, 60)); // Dakikada 60 istek

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    
    // Bağlantı hatalarını özel olarak işle
    if (err.code && (
        err.code === 'PROTOCOL_CONNECTION_LOST' ||
        err.code === 'ECONNREFUSED' ||
        err.code.includes('TIMEOUT')
    )) {
        console.error('Database connection error:', err);
        return res.status(503).json({
            error: 'Database Service Unavailable',
            message: 'Please try again later'
        });
    }
    
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
    
    // Başlangıçta veritabanı bağlantısını test et
    db.testConnection()
        .then(success => {
            if (success) {
                console.log('Veritabanı bağlantısı hazır');
            } else {
                console.error('Veritabanı bağlantısı hazırlanamadı');
            }
        });
});

// Graceful shutdown geliştirmesi
const gracefulShutdown = async (signal) => {
    console.info(`${signal} signal received.`);
    console.log('Closing HTTP server.');
    
    let shutdownTimeout = setTimeout(() => {
        console.error('Zorla kapatılıyor - zaman aşımı');
        process.exit(1);
    }, 15000); // 15 saniye bekle
    
    try {
        // Önce yeni bağlantıları reddet
        server.close(async () => {
            console.log('HTTP server closed.');
            
            // Veritabanı havuzunu kapat
            try {
                await db.closePool();
            } catch (err) {
                console.error('Veritabanı havuzu kapatma hatası:', err);
            }
            
            clearTimeout(shutdownTimeout);
            process.exit(0);
        });
    } catch (err) {
        console.error('Kapatma hatası:', err);
        clearTimeout(shutdownTimeout);
        process.exit(1);
    }
};

// Process handling
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Kritik bir hata ile karşılaşıldığında uygulamayı kapatmadan önce bir log oluştur
    if (reason && reason.code && [
        'PROTOCOL_CONNECTION_LOST',
        'ECONNREFUSED',
        'ER_SERVER_SHUTDOWN'
    ].includes(reason.code)) {
        console.error('Kritik veritabanı hatası - yeniden başlatma gerekli');
    }
});

// Bağlantıları izle
setInterval(() => {
    console.log(`Mevcut bağlantılar: ${server._connections}`);
}, 60000); // Her dakika bağlantı sayısını logla

module.exports = app;