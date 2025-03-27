const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Uploads klasörünü kontrol et ve oluştur - Promise tabanlı
const createUploadsFolder = async () => {
    try {
        const dir = path.join(__dirname, '..', 'uploads', 'slider');
        await fs.mkdir(dir, { recursive: true });
        console.log('Slider klasörü oluşturuldu veya zaten mevcut:', dir);
        return dir;
    } catch (error) {
        console.error('Slider klasörü oluşturma hatası:', error);
        throw error;
    }
};

// Multer yapılandırması - async
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
            const filetypes = /jpeg|jpg|png|gif|webp/;
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = filetypes.test(file.mimetype);

            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Sadece resim dosyaları (JPEG, JPG, PNG, GIF, WEBP) yüklenebilir!'));
            }
        }
    });
};

// Dosya silme yardımcı fonksiyonu
const deleteFileIfExists = async (filePath) => {
    try {
        if (!filePath) return;
        
        const fullPath = path.join(__dirname, '..', filePath);
        await fs.access(fullPath); // Dosya var mı kontrol et
        await fs.unlink(fullPath);
        console.log('Dosya silindi:', fullPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Dosya zaten silinmiş:', filePath);
        } else {
            console.error('Dosya silme hatası:', error);
            // Hata fırlat ancak işlemi kesme
        }
    }
};

// Modül dışa aktarım
module.exports = async (db) => {
    // Multer'ı yapılandır
    let upload;
    try {
        upload = await configureMulter();
    } catch (error) {
        console.error('Multer yapılandırma hatası:', error);
        // Varsayılan olarak memory storage kullan
        upload = multer({ storage: multer.memoryStorage() });
    }

    // Tüm sliderları getir
    router.get('/sliders', async (req, res) => {
        try {
            const rows = await db.executeQuery(
                'SELECT * FROM sliders ORDER BY order_number ASC'
            );
            res.json(rows);
        } catch (error) {
            console.error('Slider getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider verileri getirilirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Yeni slider ekle
    router.post('/sliders', upload.fields([
        { name: 'webImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 }
    ]), async (req, res) => {
        // Yüklenen dosya yollarını sakla
        const uploadedFiles = {
            webImage: req.files.webImage?.[0]?.path,
            mobileImage: req.files.mobileImage?.[0]?.path
        };
        
        try {
            const { link, orderNumber } = req.body;
            
            if (!req.files.webImage) {
                return res.status(400).json({
                    success: false,
                    message: 'Web görüntüsü gereklidir'
                });
            }

            // Yolları normalize et
            const webImagePath = '/uploads/slider/' + req.files.webImage[0].filename;
            const mobileImagePath = req.files.mobileImage ? 
                '/uploads/slider/' + req.files.mobileImage[0].filename : 
                webImagePath;

            // Veritabanına ekle
            const result = await db.executeQuery(
                'INSERT INTO sliders (web_image, mobile_image, link, order_number) VALUES (?, ?, ?, ?)',
                [webImagePath, mobileImagePath, link || '', parseInt(orderNumber) || 0]
            );

            res.json({
                success: true,
                message: 'Slider başarıyla eklendi',
                id: result.insertId
            });
        } catch (error) {
            console.error('Slider ekleme hatası:', error);
            
            // Hata durumunda yüklenen dosyaları temizle
            try {
                if (uploadedFiles.webImage) await deleteFileIfExists(uploadedFiles.webImage);
                if (uploadedFiles.mobileImage) await deleteFileIfExists(uploadedFiles.mobileImage);
            } catch (cleanupError) {
                console.error('Dosya temizleme hatası:', cleanupError);
            }
            
            res.status(500).json({
                success: false,
                message: 'Slider eklenirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Slider güncelle
    router.put('/sliders/:id', upload.fields([
        { name: 'webImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 }
    ]), async (req, res) => {
        // Yüklenen dosya yollarını sakla
        const uploadedFiles = {
            webImage: req.files.webImage?.[0]?.path,
            mobileImage: req.files.mobileImage?.[0]?.path
        };
        
        try {
            const { id } = req.params;
            const { link, orderNumber } = req.body;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz slider ID'
                });
            }

            // Mevcut slider'ı getir
            const currentSlider = await db.executeQuery(
                'SELECT * FROM sliders WHERE id = ?',
                [id]
            );

            if (currentSlider.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Slider bulunamadı'
                });
            }

            const slider = currentSlider[0];
            let webImagePath = slider.web_image;
            let mobileImagePath = slider.mobile_image;
            const oldWebImage = slider.web_image;
            const oldMobileImage = slider.mobile_image;
            
            // Yeni web resmi yüklendiyse
            if (req.files.webImage) {
                webImagePath = '/uploads/slider/' + req.files.webImage[0].filename;
            }

            // Yeni mobil resmi yüklendiyse
            if (req.files.mobileImage) {
                mobileImagePath = '/uploads/slider/' + req.files.mobileImage[0].filename;
            }

            // Veritabanını güncelle
            await db.executeQuery(
                'UPDATE sliders SET web_image = ?, mobile_image = ?, link = ?, order_number = ? WHERE id = ?',
                [webImagePath, mobileImagePath, link || '', parseInt(orderNumber) || 0, id]
            );

            // Güncelleme başarılı olduğunda eski dosyaları sil
            if (req.files.webImage && oldWebImage) {
                await deleteFileIfExists(oldWebImage);
            }
            
            if (req.files.mobileImage && oldMobileImage && oldMobileImage !== oldWebImage) {
                await deleteFileIfExists(oldMobileImage);
            }

            res.json({
                success: true,
                message: 'Slider başarıyla güncellendi',
                id: parseInt(id)
            });
        } catch (error) {
            console.error('Slider güncelleme hatası:', error);
            
            // Hata durumunda yeni yüklenen dosyaları temizle
            try {
                if (uploadedFiles.webImage) await deleteFileIfExists(uploadedFiles.webImage);
                if (uploadedFiles.mobileImage) await deleteFileIfExists(uploadedFiles.mobileImage);
            } catch (cleanupError) {
                console.error('Dosya temizleme hatası:', cleanupError);
            }
            
            res.status(500).json({
                success: false,
                message: 'Slider güncellenirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Slider sil
    router.delete('/sliders/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz slider ID'
                });
            }

            // Silinecek slider'ı getir
            const sliders = await db.executeQuery(
                'SELECT web_image, mobile_image FROM sliders WHERE id = ?',
                [id]
            );

            if (sliders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Slider bulunamadı'
                });
            }

            const slider = sliders[0];

            // Önce veritabanından sil (dosya silme işlemi başarısız olsa bile kaydı silmek istiyoruz)
            await db.executeQuery(
                'DELETE FROM sliders WHERE id = ?', 
                [id]
            );

            // Dosyaları sil
            const deletePromises = [];
            
            if (slider.web_image) {
                deletePromises.push(deleteFileIfExists(slider.web_image));
            }
            
            if (slider.mobile_image && slider.mobile_image !== slider.web_image) {
                deletePromises.push(deleteFileIfExists(slider.mobile_image));
            }
            
            // Tüm dosya silme işlemlerinin tamamlanmasını bekle
            await Promise.allSettled(deletePromises);

            res.json({
                success: true,
                message: 'Slider başarıyla silindi',
                id: parseInt(id)
            });
        } catch (error) {
            console.error('Slider silme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider silinirken bir hata oluştu',
                error: error.message
            });
        }
    });

    // Tek bir slider getir
    router.get('/sliders/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz slider ID'
                });
            }
            
            const rows = await db.executeQuery(
                'SELECT * FROM sliders WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Slider bulunamadı'
                });
            }

            res.json(rows[0]);
        } catch (error) {
            console.error('Slider getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Slider getirilirken bir hata oluştu',
                error: error.message
            });
        }
    });


    return router;
};