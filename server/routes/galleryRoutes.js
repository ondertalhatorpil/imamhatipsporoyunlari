// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// uploads klasörünü oluştur
const createUploadsFolder = async () => {
    const dir = path.join(__dirname, '..', 'uploads', 'gallery');
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
};

createUploadsFolder();

// Multer yapılandırması
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = path.join(__dirname, '..', 'uploads', 'gallery');
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'));
        }
    }
});

module.exports = (connection) => {
    // Test endpoint
    router.get('/test', (req, res) => {
        res.json({ status: 'OK' });
    });

    // Tüm yılları getir
    router.get('/gallery/years', async (req, res) => {
        try {
            const [rows] = await connection.promise().query(
                'SELECT year FROM gallery_years ORDER BY year DESC'
            );
            res.json(rows.map(row => row.year));
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Yıllar getirilirken bir hata oluştu'
            });
        }
    });

    // Yeni yıl ekle
    router.post('/gallery/years', async (req, res) => {
        console.log('Gelen veri:', req.body); // Debug için

        const { year } = req.body;

        if (!year || isNaN(year) || year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz yıl'
            });
        }

        try {
            await connection.promise().query(
                'INSERT INTO gallery_years (year) VALUES (?)',
                [parseInt(year)]
            );
            res.json({
                success: true,
                message: 'Yıl başarıyla eklendi'
            });
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Bu yıl zaten mevcut'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Yıl eklenirken bir hata oluştu'
            });
        }
    });

    // Fotoğrafları getir
    router.get('/gallery/photos/:year', async (req, res) => {
        const { year } = req.params;

        try {
            const [photos] = await connection.promise().query(
                'SELECT * FROM gallery_photos WHERE year = ? ORDER BY created_at DESC',
                [year]
            );
            res.json(photos);
        } catch (error) {
            console.error('Veritabanı hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Fotoğraflar getirilirken bir hata oluştu'
            });
        }
    });

    // Fotoğraf yükle
    router.post('/gallery/upload', upload.single('photo'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Lütfen bir fotoğraf seçin'
                });
            }

            const { year, description } = req.body;
            const photoPath = `/uploads/gallery/${req.file.filename}`;

            await connection.promise().query(
                'INSERT INTO gallery_photos (year, photo_path, description) VALUES (?, ?, ?)',
                [year, photoPath, description]
            );

            res.json({
                success: true,
                message: 'Fotoğraf başarıyla yüklendi',
                path: photoPath
            });
        } catch (error) {
            console.error('Yükleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Fotoğraf yüklenirken bir hata oluştu'
            });
        }
    });

    // Fotoğraf sil
    router.delete('/gallery/photos/:id', async (req, res) => {
        const { id } = req.params;

        try {
            const [photos] = await connection.promise().query(
                'SELECT photo_path FROM gallery_photos WHERE id = ?',
                [id]
            );

            if (photos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Fotoğraf bulunamadı'
                });
            }

            // Veritabanından sil
            await connection.promise().query(
                'DELETE FROM gallery_photos WHERE id = ?',
                [id]
            );

            // Dosyayı sistemden sil
            const filePath = path.join(__dirname, '..', photos[0].photo_path);
            await fs.unlink(filePath).catch(console.error);

            res.json({
                success: true,
                message: 'Fotoğraf başarıyla silindi'
            });
        } catch (error) {
            console.error('Silme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Fotoğraf silinirken bir hata oluştu'
            });
        }
    });

    return router;
};
