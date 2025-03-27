const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Uploads klasörünü oluştur - Promise tabanlı
const createUploadsFolder = async () => {
    try {
        const dir = path.join(__dirname, '..', 'uploads', 'gallery');
        await fs.mkdir(dir, { recursive: true });
        console.log('Galeri klasörü oluşturuldu veya zaten mevcut:', dir);
        return dir;
    } catch (error) {
        console.error('Klasör oluşturma hatası:', error);
        throw error;
    }
};

// Multer yapılandırması
const configureMulter = async () => {
    const uploadDir = await createUploadsFolder();
    
    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function(req, file, cb) {
            const timestamp = Date.now();
            const randomNum = Math.round(Math.random() * 1E9);
            const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
            const ext = path.extname(safeFilename);
            cb(null, `${timestamp}-${randomNum}${ext}`);
        }
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        },
        fileFilter: function(req, file, cb) {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Sadece resim dosyaları (JPEG, JPG, PNG, GIF) yüklenebilir!'));
            }
        }
    });
};

// Modül dışa aktarım
module.exports = async (db) => {
    // Multer'ı ayarla
    let upload;
    try {
        upload = await configureMulter();
    } catch (error) {
        console.error('Multer yapılandırma hatası:', error);
        // Varsayılan olarak memory storage kullan
        upload = multer({ storage: multer.memoryStorage() });
    }

    // Test endpoint
    router.get('/test', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Tüm yılları getir
    router.get('/gallery/years', async (req, res) => {
        try {
            const rows = await db.executeQuery('SELECT year FROM gallery_years ORDER BY year DESC');
            res.json(rows.map(row => row.year));
        } catch (error) {
            console.error('Yılları getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Yıllar getirilirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Yeni yıl ekle
    router.post('/gallery/years', async (req, res) => {
        const { year } = req.body;

        if (!year || isNaN(year) || year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz yıl - 2000 ile 2100 arasında bir değer girin'
            });
        }

        try {
            // Önce yılın var olup olmadığını kontrol et
            const existingYears = await db.executeQuery(
                'SELECT year FROM gallery_years WHERE year = ?',
                [parseInt(year)]
            );
            
            if (existingYears.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Bu yıl zaten eklenmiş'
                });
            }

            await db.executeQuery(
                'INSERT INTO gallery_years (year) VALUES (?)',
                [parseInt(year)]
            );
            
            res.json({
                success: true,
                message: 'Yıl başarıyla eklendi'
            });
        } catch (error) {
            console.error('Yıl ekleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Yıl eklenirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Fotoğrafları getir
    router.get('/gallery/photos/:year', async (req, res) => {
        const { year } = req.params;
        
        if (!year || isNaN(year)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz yıl parametresi'
            });
        }
        
        try {
            const photos = await db.executeQuery(
                'SELECT * FROM gallery_photos WHERE year = ? ORDER BY created_at DESC',
                [year]
            );
            
            res.json(photos);
        } catch (error) {
            console.error('Fotoğrafları getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Fotoğraflar getirilirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // İndirme sayacını artır
    router.post('/gallery/increment-download/:id', async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz fotoğraf ID'
            });
        }
        
        try {
            // Tek bir SQL sorgusuyla işlemi gerçekleştir - daha az veritabanı bağlantısı
            const result = await db.executeQuery(`
                UPDATE gallery_photos 
                SET download_count = COALESCE(download_count, 0) + 1 
                WHERE id = ? 
                RETURNING download_count
            `, [id]);
            
            // Güncelleme yapılamazsa (fotoğraf bulunamadıysa)
            if (!result || result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Fotoğraf bulunamadı'
                });
            }
            
            // MariaDB'nin RETURNING desteği olmadığı durum için fallback
            let downloadCount;
            if (result.download_count !== undefined) {
                downloadCount = result.download_count;
            } else {
                // Güncellenen sayıyı ayrı bir sorgu ile al
                const photoData = await db.executeQuery(
                    'SELECT download_count FROM gallery_photos WHERE id = ?',
                    [id]
                );
                
                if (!photoData || photoData.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Fotoğraf bulunamadı'
                    });
                }
                
                downloadCount = photoData[0].download_count;
            }
            
            res.json({
                success: true,
                message: 'İndirme sayısı güncellendi',
                download_count: downloadCount
            });
        } catch (error) {
            console.error('İndirme sayısı güncelleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'İndirme sayısı güncellenirken bir hata oluştu',
                error: error.message
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
            
            if (!year || isNaN(year)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçerli bir yıl belirtmelisiniz'
                });
            }
            
            // Yılın varlığını kontrol et
            const years = await db.executeQuery(
                'SELECT year FROM gallery_years WHERE year = ?',
                [year]
            );
            
            if (years.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Belirtilen yıl veritabanında bulunamadı'
                });
            }
            
            const photoPath = `/uploads/gallery/${req.file.filename}`;
            
            // Veritabanına kaydet
            const result = await db.executeQuery(
                'INSERT INTO gallery_photos (year, photo_path, description) VALUES (?, ?, ?)',
                [year, photoPath, description || '']
            );
            
            res.json({
                success: true,
                message: 'Fotoğraf başarıyla yüklendi',
                id: result.insertId,
                path: photoPath,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Fotoğraf yükleme hatası:', error);
            // Yüklenen dosyayı silmeye çalış
            if (req.file && req.file.path) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Dosya silinirken hata:', unlinkError);
                }
            }
            
            res.status(500).json({
                success: false,
                message: 'Fotoğraf yüklenirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Fotoğraf sil
    router.delete('/gallery/photos/:id', async (req, res) => {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz fotoğraf ID'
            });
        }
        
        try {
            // Önce fotoğrafın bilgilerini al
            const photos = await db.executeQuery(
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
            await db.executeQuery(
                'DELETE FROM gallery_photos WHERE id = ?',
                [id]
            );
            
            // Dosya sisteminden sil
            try {
                const photoPath = photos[0].photo_path;
                const filePath = path.join(__dirname, '..', photoPath);
                await fs.unlink(filePath);
                console.log('Dosya silindi:', filePath);
            } catch (unlinkError) {
                console.error('Dosya silme hatası (veritabanından silindi):', unlinkError);
                // Veritabanından silme başarılı olduğu için hatayı yutuyoruz
            }
            
            res.json({
                success: true,
                message: 'Fotoğraf başarıyla silindi'
            });
        } catch (error) {
            console.error('Fotoğraf silme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Fotoğraf silinirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Tüm fotoğrafları getir (limit ve sayfalama ile)
    router.get('/gallery/all-photos', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;
            
            // Toplam sayfa sayısını hesapla
            const countResult = await db.executeQuery('SELECT COUNT(*) as total FROM gallery_photos');
            const total = countResult[0].total;
            
            // Fotoğrafları getir
            const photos = await db.executeQuery(`
                SELECT gp.*, gy.year 
                FROM gallery_photos gp
                JOIN gallery_years gy ON gp.year = gy.year
                ORDER BY gp.created_at DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);
            
            res.json({
                success: true,
                photos,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Tüm fotoğrafları getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Fotoğraflar getirilirken bir hata oluştu',
                error: error.message
            });
        }
    });

    return router;
};